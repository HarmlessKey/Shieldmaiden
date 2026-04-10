# Feature: Image-to-Statblock (Parse Monster from Image)

## Implementation Status: COMPLETE (2026-04-10)

### Implemented files
**ShieldmaidenAI** (`/home/harm/Projects/ShieldmaidenAI`):
- `backend/llm/base.py` — added `parse_statblock` to `LLMProtocol`
- `backend/llm/anthropic.py` — added `parse_statblock` method + imported `ParseStatblockPrompt`
- `backend/llm/prompts/prompts.py` — added `ParseStatblockPrompt` class
- `backend/llm/prompts/parse_statblock.yaml` — placeholder prompt (TODO: replace with real prompt)
- `backend/api/endpoints.py` — added `ParseStatblockRequest` model and `POST /parse_statblock` route

**Shieldmaiden** (`/home/harm/Projects/Shieldmaiden`):
- `src-ssr/api/index.js` — extracted `verifyUserAndCredits` + `deductCredit` helpers; added `POST /ai/parse-statblock` route; added `axios` import
- `src/components/npcs/ParseStatblock.vue` — new component (file picker, 5 MB guard, base64 encode, loading overlay)
- `src/components/npcs/ParseCaveats.vue` — post-parse caveats dialog
- `src/views/UserContent/Npcs/EditNpc.vue` — added "Import from image" option, wired `ParseStatblock` + `ParseCaveats`, added `parse_image`/`parse_caveats` data fields and `finishedParseImage` method

### Remaining work
- Replace placeholder prompt in `parse_statblock.yaml` with a real prompt (same pattern as `generate_monster.yaml`, embed schema)
- Add `SHIELDMAIDEN_AI_URL` and `SHIELDMAIDEN_AI_KEY` env vars to Shieldmaiden deployment config



## Overview

Allow users to photograph or upload an image of a D&D statblock and have it automatically parsed into a Shieldmaiden NPC JSON, pre-filling the NPC editor — just like "Generate from description" but driven by an image.

---

## User Flow

1. User navigates to **NPC list** or **new NPC editor**.
2. Clicks **"From image"** option in the create dialog (alongside existing "Copy", "Create from scratch", "Generate from description").
3. A dialog presents two sub-options: **Camera** | **Upload file**.
4. User takes/selects an image.
5. App checks AI credit balance — if insufficient, block and show "Not enough credits".
6. Image is sent to the Shieldmaiden SSR API, which forwards to ShieldmaidenAI microservice (`POST /parse_statblock`).
7. Loading animation plays (reuse existing `generating` overlay with fun messages).
8. Response JSON is received.
9. **Post-parse caveat dialog** is shown — a one-time (or always-visible) warning about known parser limitations.
10. Dialog closes; NPC editor is pre-filled with parsed data.
11. User reviews, corrects, saves.

---

## Known Limitation Caveats (Post-Parse Dialog)

Show a `q-dialog` after successful parse with the following warnings:

- **Non-SRD spells**: Spells not in the SRD may not parse correctly — check spell names and descriptions manually.
- **Hit dice**: The hit dice expression may be truncated or misformatted — verify the hit dice field.
- **Image quality**: Low-resolution or angled photos may produce partial results — check all fields.

---

## Shieldmaiden Changes

### 1. New Component: `src/components/npcs/ParseStatblock.vue`

Mirrors `GenerateMonster.vue` in structure. Key differences:

- **No text area** — instead a file input (`accept="image/*"`, `capture="environment"` for camera) using a styled `<input type="file">` or `q-file`.
- Image preview (thumbnail) after selection.
- Credit check reuses same `ai.total` getter.
- On submit: encode image as base64 and POST to `api/ai/parse-statblock` (SSR proxy).
- Emits `@generating(bool)` and `@finished(npc)` — same contract as `GenerateMonster.vue` so `EditNpc.vue` reuses the same handler (`finishedGenerate`).
- Loading overlay identical to `GenerateMonster.vue` (reuse messages array or use image-specific messages).

**Image-specific loading messages:**
```
"Scanning the statblock",
"Deciphering ancient scripts",
"Counting hit dice",
"Looking up spell slots",
"Converting to digital form",
"Arguing with the parser",
"Almost there...",
```

### 2. New Component: `src/components/npcs/ParseCaveats.vue`

Simple info dialog listing the known limitations above. Shown after a successful parse, before the dialog closes. User must click "Got it" to proceed.

### 3. Update `src/views/UserContent/Npcs/EditNpc.vue`

**In create dialog template** — add a fourth option after "Generate from description":

```html
<h2 class="text-center my-2">OR</h2>
<button
  class="btn btn-lg btn-block bg-accent mb-2"
  @click="parse_image = true"
  :disabled="!userId"
>
  <i aria-hidden="true" class="fas fa-camera mr-2" />
  Import from image
</button>
```

**Add `ParseStatblock` to the dialog body** (same pattern as `GenerateMonster`):

```html
<template v-if="parse_image">
  <ParseStatblock @generating="setGenerating" @finished="finishedParseImage" />
</template>
```

**New method `finishedParseImage`**:

```js
finishedParseImage(npc) {
  this.npc = npc;
  this.generating = false;
  this.create_dialog = false;
  this.parse_caveats = true; // open caveats dialog
},
```

**Add caveats dialog** after create dialog:

```html
<q-dialog v-model="parse_caveats">
  <ParseCaveats @close="parse_caveats = false" />
</q-dialog>
```

**New data fields**: `parse_image: false`, `parse_caveats: false`.

**Import** `ParseStatblock` and `ParseCaveats` components.

### 4. Update SSR API: `src-ssr/api/index.js`

Add new route `POST /ai/parse-statblock`:

```js
router.post("/ai/parse-statblock", async (req, res) => {
  // Auth: identical to /ai/generate-monster
  // Credit check: identical to /ai/generate-monster
  // Body: { image_base64: string, mime_type: string }

  const result = await axios.post(
    `${process.env.SHIELDMAIDEN_AI_URL}/parse_statblock`,
    { image_base64: req.body.image_base64, mime_type: req.body.mime_type },
    { headers: { "x-api-key": process.env.SHIELDMAIDEN_AI_KEY } }
  );

  // Deduct credit (same logic as generate-monster)
  // Return result.data
});
```

Reuse the auth + credit-check logic. Extract to a shared helper function to avoid duplication:

```js
async function verifyUserAndCredits(req, res) {
  // returns { uid, spent, credits, subscription_credits } or sends error response
}
```

### 5. Optionally update `src/views/UserContent/Npcs/Npcs.vue`

If desired, add an "Import from image" button in the NPC list header (same placement as existing "Generate" button). This would open a standalone dialog that navigates to `EditNpc` after parse.

---

## ShieldmaidenAI Microservice Changes

### API Interface

**New endpoint**: `POST /parse_statblock`

**Auth**: Same `x-api-key` header as existing endpoints.

**Request body**:
```json
{
  "image_base64": "<base64-encoded image bytes>",
  "mime_type": "image/jpeg"  // or image/png, image/webp
}
```

**Response** (same shape as `/generate_monster`):
```json
{
  "input": { "mime_type": "image/jpeg" },
  "output": { /* monster JSON matching existing schema */ },
  "usage": { "cost": 0.012, "input_tokens": 1500, "output_tokens": 800 }
}
```

**Error responses**: 400 (invalid image / unreadable statblock), 500 (LLM error) — same pattern as existing endpoint.

### Implementation Plan (ShieldmaidenAI)

#### `backend/api/endpoints.py`

Add new Pydantic model and route:

```python
class ParseStatblockRequest(BaseModel):
    image_base64: str
    mime_type: str  # e.g. "image/jpeg"

@router.post("/parse_statblock")
def post_parse_statblock(
    request: ParseStatblockRequest, llm: LLMProtocol = Depends(get_llm)
) -> dict:
    monster, usage = llm.parse_statblock(request.image_base64, request.mime_type)
    return {"input": {"mime_type": request.mime_type}, "output": monster, "usage": usage}
```

#### `backend/llm/base.py`

Add `parse_statblock` to the `LLMProtocol`:

```python
def parse_statblock(self, image_base64: str, mime_type: str) -> tuple:
    """Parses a D&D statblock image into a monster JSON."""
    ...
```

#### `backend/llm/anthropic.py`

Add `parse_statblock` method to `AnthropicWrapper`:

```python
def parse_statblock(self, image_base64: str, mime_type: str) -> tuple:
    response = self.client.messages.create(
        model=self.model.value,
        max_tokens=10000,
        temperature=0,  # deterministic for parsing
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": mime_type,
                            "data": image_base64,
                        },
                    },
                    {
                        "type": "text",
                        "text": "Parse this image to JSON based on SCHEMA",
                        # TODO: replace placeholder with real prompt referencing monster_schema.json
                    },
                ],
            }
        ],
    )
    cost_dict = json.loads(response.usage.model_dump_json())
    cost = self.calculate_token_cost(response.model, cost_dict)
    extracted_json = extract_xml(response.content[0].text, "monster_json")
    if not extracted_json:
        raise ValueError("Failed to extract monster JSON from image response.")
    return (extracted_json, {"cost": cost, **cost_dict})
```

> **Prompt placeholder**: Use `"Parse this image to JSON based on SCHEMA"` for now. The real prompt will follow the same pattern as `MonsterPrompt` — a `ParseStatblockPrompt` class loading from a new `parse_statblock.yaml` file, embedding the schema.

#### `backend/llm/prompts/`

Add `parse_statblock.yaml` with placeholder content:

```yaml
system: |
  Parse this image to JSON based on SCHEMA
```

Add `ParseStatblockPrompt` class in `prompts.py` (same pattern as `MonsterPrompt`).

---

## Image Handling Notes

- **Client-side**: Use `FileReader.readAsDataURL()` to get base64, strip the `data:<mime>;base64,` prefix before sending, and send `mime_type` separately.
- **Size limit**: Add a 5 MB client-side guard before sending — show an error if `file.size > 5 * 1024 * 1024`.
- **Accepted formats**: `image/jpeg`, `image/png`, `image/webp` — all supported by Claude's vision API.
- **Camera**: `<input type="file" accept="image/*" capture="environment">` triggers the rear camera on mobile; fallback to gallery picker on desktop.

---

## Credit Deduction

Image parsing costs the same as text generation: **1 credit per parse**. The SSR API route uses identical credit-check and deduction logic as `/ai/generate-monster`. Extract shared logic to a helper to avoid copy-paste.

---

## Out of Scope (for now)

- Streaming the parse response.
- Storing parsed images.
- Per-image pricing vs. flat credit cost.
- Auto-download of parsed NPC JSON (no `auto_download` toggle needed — user edits in-app).
