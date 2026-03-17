#!/usr/bin/env python3
"""Migrate vee-validate v3 -> v4 in Vue files."""
import re
import sys

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # ============================================
    # 1. Migrate ValidationObserver v-slot
    # ============================================

    # { handleSubmit, valid } -> { handleSubmit, meta }
    content = re.sub(
        r'(<ValidationObserver[^>]*?)v-slot="\{\s*handleSubmit\s*,\s*valid\s*\}"',
        r'\1v-slot="{ handleSubmit, meta }" as="div"',
        content
    )

    # { valid } -> { meta }
    content = re.sub(
        r'(<ValidationObserver[^>]*?)v-slot="\{\s*valid\s*\}"',
        r'\1v-slot="{ meta }" as="div"',
        content
    )

    # ============================================
    # 2. Migrate ValidationProvider v-slot
    # ============================================

    # { errors, invalid, validated } -> { errorMessage }
    content = re.sub(
        r'v-slot="\{\s*errors\s*,\s*invalid\s*,\s*validated\s*\}"',
        'v-slot="{ errorMessage }"',
        content
    )

    # { invalid, validated } -> { errorMessage }
    content = re.sub(
        r'v-slot="\{\s*invalid\s*,\s*validated\s*\}"',
        'v-slot="{ errorMessage }"',
        content
    )

    # ============================================
    # 3. Migrate error bindings
    # ============================================

    content = content.replace(':error="invalid && validated"', ':error="!!errorMessage"')
    content = re.sub(r':error-message="errors\[0\]"', ':error-message="errorMessage"', content)

    # ============================================
    # 4. Inside ValidationObserver with meta:
    #    valid -> meta.valid
    #    handleSubmit(fn) -> handleSubmit($event, fn)
    # ============================================

    # We process line by line, tracking observer depth
    lines = content.split('\n')
    result_lines = []
    observer_stack = []  # Stack of booleans: does this observer use meta?

    for line in lines:
        # Track ValidationObserver open
        if '<ValidationObserver' in line and '</ValidationObserver>' not in line:
            uses_meta = 'meta' in line
            observer_stack.append(uses_meta)
        elif '</ValidationObserver>' in line and '<ValidationObserver' not in line:
            if observer_stack:
                observer_stack.pop()

        # Apply transformations if inside a meta-using observer
        in_meta_observer = any(observer_stack) if observer_stack else False

        if in_meta_observer:
            # handleSubmit(someFn) -> handleSubmit($event, someFn)
            # But not handleSubmit($event, ...) already migrated
            line = re.sub(
                r'handleSubmit\((?!\$event)(\w+)\)',
                r'handleSubmit($event, \1)',
                line
            )

            # Now replace `valid` -> `meta.valid` carefully
            # Only in attribute values (inside quotes), not in HTML text, not `invalid`
            # We'll replace in common patterns:

            # :disabled="!valid" or :disable="!valid"
            line = re.sub(r':disabled="!valid"', ':disabled="!meta.valid"', line)
            line = re.sub(r':disable="!valid"', ':disable="!meta.valid"', line)

            # :disabled="valid" (unlikely)
            # Actually: disabled prop with valid check

            # fn(valid) -> fn(meta.valid) but not handleSubmit patterns
            # Common: save(valid), setVoucher(valid), fn(!invalid)
            # Let's handle explicit patterns:
            line = re.sub(r'(\w+)\(valid\)', r'\1(meta.valid)', line)
            # fn($event, valid) patterns (already transformed handleSubmit)
            line = re.sub(r',\s*valid\)', ', meta.valid)', line)
            # fn(arg, valid)
            line = re.sub(r'\(([^)]+),\s*valid\)', lambda m: '(' + m.group(1) + ', meta.valid)', line)

            # valid ? ... : ... (ternary)
            line = re.sub(r'(?<![.\w])valid\s*\?', 'meta.valid ?', line)

            # !valid in various contexts (not already meta.valid)
            line = re.sub(r'(?<![.\w])!valid(?!\w)', '!meta.valid', line)
            # standalone valid in bindings
            # Like @click="acceptAvatar(valid)" -- already handled by fn(valid) above

            # { disabled: !valid } -> { disabled: !meta.valid }  already handled above since !valid -> !meta.valid

            # v-if="!valid" already handled by !valid -> !meta.valid

        result_lines.append(line)

    content = '\n'.join(result_lines)

    # ============================================
    # 5. Add as="div" and :modelValue to ValidationProvider
    #    For each VP that has v-slot="{ errorMessage }", find the v-model
    #    inside and add :modelValue and as="div"
    # ============================================

    content = add_vp_attrs(content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False


def add_vp_attrs(content):
    """Add as='div' and :modelValue to ValidationProvider tags that have errorMessage slot."""
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i]

        # Find ValidationProvider opening tags
        if '<ValidationProvider' in line:
            # Collect the full opening tag
            tag_start = i
            tag_end = i
            accumulated = line
            # Find the closing > of the opening tag
            while '>' not in accumulated.split('<ValidationProvider', 1)[-1] or accumulated.strip().endswith('=>'):
                tag_end += 1
                if tag_end >= len(lines):
                    break
                accumulated += '\n' + lines[tag_end]

            # More robust: find the first > that actually closes the tag
            # by counting < and >
            tag_text = '\n'.join(lines[tag_start:tag_end+1])

            # Only process if it has errorMessage slot
            if 'v-slot="{ errorMessage }"' not in tag_text:
                i = tag_end + 1
                continue

            # Check if as="div" already present
            has_as_div = 'as="div"' in tag_text

            # Check if :modelValue already present
            has_model_value = ':modelValue=' in tag_text

            if has_as_div and has_model_value:
                i = tag_end + 1
                continue

            # Find the v-model or :value in the content between this tag and </ValidationProvider>
            vmodel_var = None
            j = tag_end + 1
            depth = 1
            while j < len(lines):
                if '<ValidationProvider' in lines[j]:
                    depth += 1
                if '</ValidationProvider>' in lines[j]:
                    depth -= 1
                    if depth == 0:
                        break
                if vmodel_var is None:
                    m = re.search(r'v-model(?:\.number|\.lazy)?\s*=\s*"([^"]+)"', lines[j])
                    if m:
                        vmodel_var = m.group(1)
                    else:
                        m = re.search(r':value\s*=\s*"([^"]+)"', lines[j])
                        if m:
                            vmodel_var = m.group(1)
                j += 1

            # Now add attrs to the tag
            # Find the line with v-slot="{ errorMessage }" and add after it
            for k in range(tag_start, tag_end + 1):
                if 'v-slot="{ errorMessage }"' in lines[k]:
                    indent = re.match(r'^(\s*)', lines[k]).group(1)
                    additions = ''
                    if not has_model_value and vmodel_var:
                        additions += f' :modelValue="{vmodel_var}"'
                    if not has_as_div:
                        additions += ' as="div"'
                    # Add after the v-slot attribute
                    lines[k] = lines[k].replace(
                        'v-slot="{ errorMessage }"',
                        'v-slot="{ errorMessage }"' + additions
                    )
                    break

            i = tag_end + 1
        else:
            i += 1

    return '\n'.join(lines)


if __name__ == '__main__':
    files = sys.argv[1:]
    for f in files:
        changed = process_file(f)
        status = "Migrated" if changed else "No changes"
        print(f"{status}: {f}")
