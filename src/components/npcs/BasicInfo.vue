<template>
	<div>
		<hk-card>
			<div class="card-header p-0" slot="header">
				<div class="d-flex justify-content-between items-center">
					<div class="d-flex justify-content-start items-center">
						<div
							class="img"
							@click="avatar_dialog = true"
							:style="{
								backgroundImage: current_avatar ? `url('${current_avatar}')` : ''
							}">
							<i aria-hidden="true" v-if="!npc.storage_avatar && !npc.avatar && !preview_new_upload" class="hki-monster" />
						</div>
						Basic info
					</div>
					<slot name="header-right" />
				</div>
			</div>
			<div class="card-body">
        <!-- NAME -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-6">
            <ValidationProvider
              rules="max:100|required"
              name="Name"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Name *"
                maxlength="100"
                autocomplete="off"
                v-model="npc.name"
                @input="capitalizeName"
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col-3">
            <ValidationProvider
              rules="max:20"
              name="Source"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Source"
                maxlength="20"
                autocomplete="off"
                v-model="npc.source"
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col-3">
            <hk-edition-select v-model="npc.edition" />
          </div>
        </div>

        <!-- SIZE -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-12 col-sm-6">
            <ValidationProvider
              rules="required"
              name="Size"
              v-slot="{ errors, invalid, validated }"
            >
              <q-select
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Size *"
                v-model="npc.size"
                :options="monster_sizes"
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col-12 col-sm-6">
            <!-- ALIGNMENT -->
            <q-select
              :dark="$store.getters.theme === 'dark'"
              filled
              square
              label="Alignment"
              v-model="npc.alignment"
              :options="monster_alignment"
            />
          </div>
        </div>

        <!-- TYPE -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-12 col-sm-6">
            <ValidationProvider
              rules="required"
              name="Type"
              v-slot="{ errors, invalid, validated }"
            >
              <q-select
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Type *"
                v-model="npc.type"
                :options="monster_types"
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col-12 col-sm-6" v-if="npc.type && monster_subtypes[npc.type]">
            <q-select
              :dark="$store.getters.theme === 'dark'"
              filled
              square
              clearable
              label="Subtype"
              v-model="npc.subtype"
              :options="monster_subtypes[npc.type]"
            />
          </div>
        </div>

        <!-- SPEED -->
        <div class="row q-col-gutter-sm mb-2">
          <div class="col">
            <ValidationProvider
              rules="between:0,999"
              name="Walk speed"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Walk speed"
                autocomplete="off"
                type="number"
                v-model.number="npc.walk_speed"
                @input="parseToInt($event, npc, 'walk_speed')"
                suffix="ft."
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col">
            <ValidationProvider
              rules="between:0,999"
              name="Swim speed"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Swim speed"
                autocomplete="off"
                type="number"
                v-model.number="npc.swim_speed"
                @input="parseToInt($event, npc, 'swim_speed')"
                suffix="ft."
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col">
            <ValidationProvider
              rules="between:0,999"
              name="Fly speed"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Fly speed"
                autocomplete="off"
                type="number"
                v-model.number="npc.fly_speed"
                @input="parseToInt($event, npc, 'fly_speed')"
                suffix="ft."
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col">
            <ValidationProvider
              rules="between:0,999"
              name="Burrow speed"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Burrow speed"
                autocomplete="off"
                type="number"
                v-model.number="npc.burrow_speed"
                @input="parseToInt($event, npc, 'burrow_speed')"
                suffix="ft."
                :error="invalid && validated"
                :error-message="errors[0]"
              />
            </ValidationProvider>
          </div>
          <div class="col">
            <ValidationProvider
              rules="between:0,999"
              name="Climb speed"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Climb speed"
                autocomplete="off"
                type="number"
                v-model.number="npc.climb_speed"
                @input="parseToInt($event, npc, 'climb_speed')"
                suffix="ft."
                :error="invalid && validated"
                :error-message="errors[0]"
              >
              </q-input>
            </ValidationProvider>
          </div>
        </div>

        <!-- CR -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-12">
            <ValidationProvider rules="required" name="CR" v-slot="{ errors, invalid, validated }">
              <q-select
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Challenge rating *"
                v-model="npc.challenge_rating"
                :options="challenge_ratings"
                :suffix="
                  npc.challenge_rating ? `${monster_challenge_rating[npc.challenge_rating].xp} xp ` : ``
                "
                :error="invalid && validated"
                :error-message="errors[0]"
              >
                <template v-slot:option="scope">
                  <q-list :dark="$store.getters.theme === 'dark'">
                    <q-item
                      clickable
                      v-ripple
                      v-close-popup
                      @click="$set(npc, 'challenge_rating', scope.opt)"
                    >
                      <q-item-section>{{
                        scope.opt == 0.125
                          ? "&#8539;"
                          : scope.opt == 0.25
                            ? "&#xbc;"
                            : scope.opt == 0.5
                              ? "&#xBD;"
                              : scope.opt
                      }}</q-item-section>
                      <q-item-section avatar
                        >{{ monster_challenge_rating[scope.opt].xp }} xp</q-item-section
                      >
                    </q-item>
                  </q-list>
                </template>
                <div slot="after" v-if="npc.challenge_rating" class="pr-3">
                  +{{ monster_challenge_rating[npc.challenge_rating].proficiency }}
                  <q-tooltip anchor="top middle" self="center middle"> Proficiency bonus </q-tooltip>
                </div>
              </q-select>
            </ValidationProvider>
          </div>
        </div>

        <!-- LANGUAGES -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-12">
            <q-select
              :dark="$store.getters.theme === 'dark'"
              filled
              square
              bottom-slots
              label="Languages"
              multiple
              v-model="npc.languages"
              :options="languages"
              use-input
              new-value-mode="add-unique"
            />
          </div>
        </div>

        <!-- GEAR -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-12">
            <ValidationProvider
              rules="max:2000"
              name="Gear"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                autogrow
                label="Gear"
                maxlength="2000"
                autocomplete="off"
                v-model="npc.gear"
                :error="invalid && validated"
                :error-message="errors[0]"
              >
                <template v-slot:append>
                  <hk-popover header="Gear">
                    <q-icon name="info" size="xs" class="blue" />
                    <template #content>
                      Equipment the creature carries, shown on 5.5e (2024) stat blocks.<br />
                      For example: <i>Leather Armor, Scimitar, Shortbow</i>.
                    </template>
                  </hk-popover>
                </template>
              </q-input>
            </ValidationProvider>
          </div>
        </div>

        <!-- ENVIRONMENT & GROUPS -->
        <div class="row q-col-gutter-md mb-2">
          <div class="col-12 col-sm-6">
            <hk-select
              label="Environment"
              v-model="npc.environment"
              multiple
              clearable
              bottom-slots
              :options="monster_environments"
            >
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  @remove="scope.removeAtIndex(scope.index)"
                  class="q-ma-xs"
                >
                  {{ scope.opt }}
                </q-chip>
              </template>
            </hk-select>
          </div>
          <div class="col-12 col-sm-6">
            <hk-select
              label="Groups"
              v-model="selectedGroups"
              multiple
              clearable
              bottom-slots
              emit-value
              map-options
              :options="groupOptions"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                  <q-item-section class="group-option">
                    <span>{{ scope.opt.label }}</span>
                    <span v-if="scope.opt.isCampaign" class="campaign-pill">Campaign</span>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  :dark="scope.opt.isCampaign"
                  @remove="scope.removeAtIndex(scope.index)"
                  class="q-ma-xs"
                >
                  {{ scope.opt.label }}
                </q-chip>
              </template>
            </hk-select>
          </div>
        </div>

        <q-checkbox
          size="lg"
          :dark="$store.getters.theme === 'dark'"
          v-model="npc.friendly"
          label="Add as friendly"
          :false-value="null"
          indeterminate-value="something-else"
        />
      </div>
    </hk-card>

    <!-- HP & AC -->
    <hk-card header="Health & Armor Class">
      <div class="card-body">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <ValidationProvider
              rules="required|between:1,99"
              name="AC"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Armor class *"
                autocomplete="off"
                type="number"
                class="mb-2"
                v-model.number="npc.armor_class"
                @input="parseToInt($event, npc, 'armor_class')"
                name="ac"
                :error="invalid && validated"
                :error-message="errors[0]"
              >
                <template v-slot:prepend>
                  <q-icon name="fas fa-shield" size="xs" />
                </template>
              </q-input>
            </ValidationProvider>
          </div>
          <div class="col-12 col-md-4">
            <ValidationProvider
              rules="required|between:1,9999"
              name="HP"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Hit points *"
                autocomplete="off"
                type="number"
                class="mb-2"
                v-model.number="npc.hit_points"
                @input="parseToInt($event, npc, 'hit_points')"
                name="hp"
                :error="invalid && validated"
                :error-message="errors[0]"
              >
                <template v-slot:prepend>
                  <q-icon name="fas fa-heart" size="xs" />
                </template>
              </q-input>
            </ValidationProvider>
          </div>
          <div class="col-12 col-md-4">
            <ValidationProvider
              rules="hit_dice|max:10"
              name="Hit dice"
              v-slot="{ errors, invalid, validated }"
            >
              <q-input
                :dark="$store.getters.theme === 'dark'"
                filled
                square
                label="Hit dice"
                autocomplete="off"
                type="text"
                class="mb-2"
                v-model="npc.hit_dice"
                name="hit_dice"
                :error="invalid && validated"
                :error-message="errors[0]"
              >
                <template v-slot:append>
                  <small>{{ npc.hit_dice ? `(${hitDiceStr(npc)})` : "" }}</small>
                  <hk-popover header="Hit Dice + Modifier">
                    <q-icon name="info" size="xs" class="blue" />
                    <template #content>
                      The modifier is the NPC's Constitution modifier multiplied by the number of
                      hit dice.
                    </template>
                  </hk-popover>
                </template>
              </q-input>
            </ValidationProvider>
          </div>
        </div>
      </div>
    </hk-card>

    <!-- AVATAR -->
    <q-dialog v-model="avatar_dialog">
      <hk-image-uploader
        :avatar="npc.avatar"
        :storage_avatar="npc.storage_avatar"
        :preview_new_upload="preview_new_upload"
        @crop="saveBlob"
        @url="saveUrl"
        @cancel="avatar_dialog = false"
        @clear="clearAvatar"
      />
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import { general } from "src/mixins/general.js";
import { languages } from "src/utils/generalConstants";
import { campaignGroupKey } from "src/utils/generalFunctions";
import { monsterMixin } from "src/mixins/monster.js";

export default {
  name: "npc-BasicInfo",
  props: ["value"],
  mixins: [general, monsterMixin],
  data() {
    return {
      languages: languages,
      avatar_dialog: false,
      preview_new_upload: undefined,
    };
  },
  computed: {
    ...mapGetters("npcGroups", { npc_groups: "npc_groups" }),
    ...mapGetters("campaigns", { all_campaigns: "campaigns" }),
    npc: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    selectedGroups: {
      get() {
        return this.npc.groups ? Object.keys(this.npc.groups) : [];
      },
      set(val) {
        const groups = {};
        for (const id of val) {
          groups[id] = true;
        }
        this.$set(this.npc, "groups", Object.keys(groups).length ? groups : undefined);
      },
    },
    groupOptions() {
      const options = [];
      if (this.npc_groups) {
        for (const group of this.npc_groups) {
          options.push({
            label: group.name ? group.name.capitalizeEach() : group.key,
            value: group.key,
            isCampaign: false,
          });
        }
      }
      if (this.all_campaigns) {
        for (const campaign of this.all_campaigns) {
          options.push({
            label: campaign.name ? campaign.name.capitalizeEach() : campaign.key,
            value: campaignGroupKey(campaign.key),
            isCampaign: true,
          });
        }
      }
      return options;
    },
    challenge_ratings() {
      let crs = [];
      for (const cr in this.monster_challenge_rating) {
        crs.push(Number(cr));
      }
      return crs.sort(function (a, b) {
        return a - b;
      });
    },
    current_avatar() {
      return this.preview_new_upload || this.npc.storage_avatar || this.npc.avatar;
    },
  },
  mounted() {
    if (this.$store.getters.user) {
      this.get_npc_groups();
      this.get_campaigns();
    }
  },
  methods: {
    ...mapActions("npcGroups", ["get_npc_groups"]),
    ...mapActions("campaigns", ["get_campaigns"]),
    parseToInt(value, object, property) {
      if (value === undefined || value === "") {
        this.$delete(object, property);
      } else {
        this.$set(object, property, parseInt(value));
      }
    },
    // Capitalizes every word in the name of the NPC
    capitalizeName(val) {
      this.npc.name = val.capitalizeEach();
    },
    saveBlob(value) {
      // Clear the image url
      this.$delete(this.npc, "avatar");
      this.$set(this.npc, "blob", value.blob);
      this.preview_new_upload = value.dataUrl;
      this.avatar_dialog = false;
    },
    saveUrl(value) {
      this.$delete(this.npc, "storage_avatar");
      this.$set(this.npc, "avatar", value);
      this.preview_new_upload = undefined;
      this.avatar_dialog = false;
    },
    clearAvatar() {
      this.$delete(this.npc, "avatar");
      this.$delete(this.npc, "storage_avatar");
      this.$delete(this.npc, "blob");
      this.preview_new_upload = undefined;
      this.avatar_dialog = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.img {
  border: solid 1px $neutral-3;
  width: 62px;
  height: 62px;
  background-size: cover;
  background-position: center top;
  color: $neutral-2;
  background-color: $neutral-9;
  font-size: 50px;
  cursor: pointer;
  border-top-left-radius: $border-radius;
  margin-right: 15px;

  i::before {
    vertical-align: 5px;
  }
  &:hover {
    border-color: $blue;
    color: $blue-light;
  }
}
.current-avatar {
  background-color: $neutral-7;
  border-bottom: solid 1px $neutral-5;
  display: flex;
  justify-content: space-between;
  padding-right: 0.5rem;

  .img {
    border-radius: 0;
    width: 47px;
    height: 47px;
    cursor: default;
  }
}
[data-theme="light"] {
  .img {
    background-color: $neutral-2;
    color: $neutral-8;
  }
}
.group-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
}

.campaign-pill {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background-color: $neutral-4;
  color: #fff;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
