<template>
	<hk-card>
		<div class="card-header" slot="header">
			<h1><i aria-hidden="true" class="fas fa-dragon mr-2" /> Monster Creator for D&D 5e</h1>
		</div>
		<div slot="image" class="card-image written" :style="{ backgroundImage: `url(${require(`src/assets/_img/atmosphere/tool-header/monster-tool-header.jpg`)})` }">
      D&D Monster Creator
    </div>
		<div class="card-body">
      <p>
        With our monster creator you can create stat blocks for custom monsters that you can use in our <router-link to="/tools/combat-tracker">combat tracker</router-link>.
      </p>

      <h3>Actions</h3>
      <p>
        Advanced actions that can be rolled with one click can easily be created for a monster.<br/>
        Different types of damage can be added as separate rolls and this allows us to apply different damage types separately.
      </p>
      <p>
        If you click the button below, you roll the action from image.
        The example roll is a versatile action, which means it can be rolled in 2 ways. In this case you can either perform the attack 1 handed or 2 handed. 
        The damage rolls will be slightly different for both options.<br/>
        Since this example is a weapon attack, it can be rolled with <strong class="green">Advantage</strong> or <strong class="red">Disadvantage</strong>. 
        When clicking on the option you want to roll, hold [shift] to roll with advantage or hold [ctrl] to roll with disadvantage.
      </p>

      <p>It is very simple to create actions like these yourself, just fill in a few form fields in the monster creator.</p>
           
      <q-img 
        class="action"
        src="~assets/_img/tools/monster-creator/monster-action.png" 
        alt="Spear attack action"
        fit="contain"
      >
        <div class="absolute-full flex flex-center">
          <button class="btn">
            Roll example action
            <q-popup-proxy :dark="$store.getters.theme === 'dark'">
              <div class="bg-neutral-8">
                <q-item>
                  <q-item-section>
                    <strong>Burning Spear</strong>
                  </q-item-section>
                </q-item>
                <q-list :dark="$store.getters.theme === 'dark'">
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>1</q-item-section>
                    <q-item-section>
                      <hk-roll @roll="roll($event, action, 0)">
                        1 handed
                      </hk-roll>
                    </q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>2</q-item-section>
                    <q-item-section>
                      <hk-roll @roll="roll($event, action, 1)">
                        2 handed
                      </hk-roll>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-popup-proxy>
          </button>
        </div>
      </q-img>  

      <h3>Resistances and Vulnerabilities</h3>
      <p>
        You can define what types of damage the monster is <em>vulnerable</em>, <em>resistant</em> or <em>immune</em> to.<br/>
        When you apply damage to the monster in our combat tracker, the amount is automatically adjusted based on these resistances. 
        When you apply 5 cold damage to a monster that is vulnerable to this damage type, the damage is doubled, resulting in 10 frost damage.
      </p>
      <q-img 
        class="res-vul"
        src="~assets/_img/tools/monster-creator/resistances-vulnerabilities.png" 
        alt="Monster creator resistances and vulnerabilities form"
        fit="contain"
      />

      <span>To save a monster, you need an account, but you can always download your creations.</span> 
    </div>
    <div slot="footer" class="card-footer">
      <q-btn color="primary" class="full-width" no-caps push to="/tools/monster-creator/create-monster">Create custom monster</q-btn>
    </div>
	</hk-card>
</template>

<script>
  import { mapActions } from "vuex";
  import { dice } from 'src/mixins/dice.js';

	export default {
		name: 'ToolsMonsterCreator',
    mixins: [dice],
    data() {
      return {
        action: {
          action_list: [
            {
              attack_bonus: 5,
              type: "melee_weapon",
              versatile: true,
              versatile_one: "1 handed",
              versatile_two: "2 handed",
              rolls: [
                {
                  damage_type: "piercing",
                  dice_count: 1,
                  dice_type: 6,
                  fixed_val: 3,
                  miss_mod: 0,
                  versatile_dice_type: 8,
                  versatile_dice_count: 1
                },
                {
                  damage_type: "fire",
                  dice_count: 1,
                  dice_type: 4,
                  miss_mod: 0
                }
              ]
            }
          ],
          name: "Burning Spear",
          reach: 5
        }
      }
    },
    methods: {
      ...mapActions(["setActionRoll"]),
      roll(e, action, versatile) {
				const config = {
					type: "monster_action",
					versatile
				}
				this.setActionRoll(this.rollAction(e, action, config));
			},
    }
	}
</script>

<style lang="scss" scoped>
h3 {
  line-height: normal;
  margin-bottom: 10px;
}
.hk-card {
  .card-image {
    font-size: 50px;
    line-height: 55px;
    text-shadow: 1px 1px 10px $black;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }
}
.q-img {
  display: block;
  margin: 30px auto;
  width: 100%;

  &::v-deep .q-img__content {
    > div {
      background: none;
    }
  }
  &.res-vul {   
    max-width: 300px;
  }
  &.action {
    max-width: 600px;
    cursor: pointer;
  }
}
</style>