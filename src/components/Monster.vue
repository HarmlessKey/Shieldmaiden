<template>
    <div class="pb-5">
       <h2>{{ monster.name }}</h2>
        <i>
            {{ monster.size }} {{ monster.type }}
            <span v-if="monster.subtype != ''">({{ monster.subtype }})</span>,
            {{ monster.alignment }}
        </i>
        <hr>
        <p>
            <b>Armor Class</b> {{ monster.armor_class }}<br/>
            <b>Hit Points</b> {{ monster.hit_points }} ({{ monster.hit_dice }})<br/>
            <b>Speed</b> {{ monster.speed }}
        </p>
        <hr class="mb-4">
        <div class="abilities">
            <span class="ability str" @click="rollAbility('Strength', monster.strength)">
                <span class="abilityName">STR</span>
                {{ modifier(monster.strength) }}
                <span class="score bg-gray">{{ monster.strength }}</span>
            </span>
            <span class="ability dex" @click="rollAbility('Dexterity', monster.dexterity)">
                <span class="abilityName">DEX</span>
                {{ modifier(monster.dexterity) }}
                <span class="score bg-gray">{{ monster.dexterity }}</span>
            </span>
            <span class="ability con" @click="rollAbility('Constitution', monster.constitution)">
                <span class="abilityName">CON</span>
                {{ modifier(monster.constitution) }}
                <span class="score bg-gray">{{ monster.constitution }}</span>
            </span>
            <span class="ability int" @click="rollAbility('Intelligence', monster.intelligence)">
                <span class="abilityName">INT</span>
                {{ modifier(monster.intelligence) }}
                <span class="score bg-gray">{{ monster.intelligence }}</span>
            </span>
            <span class="ability wis" @click="rollAbility('Wisdom', monster.wisdom)">
                <span class="abilityName">WIS</span>
                {{ modifier(monster.wisdom) }}
                <span class="score bg-gray">{{ monster.wisdom }}</span>
            </span>
            <span class="ability cha" @click="rollAbility('Charisma', monster.charisma)">
                <span class="abilityName">CHA</span>
                {{ modifier(monster.charisma) }}
                <span class="score bg-gray">{{ monster.charisma }}</span>
            </span>
        </div>
        <hr>

        <!-- SKILLS -->
        <p>
            <b>Skills</b>
            <span v-if="monster.perception"> Perception +{{ monster.perception }},</span>
            <span v-if="monster.stealth"> Stealth +{{ monster.stealth }}</span>
            <br/>
            <b>Senses</b> {{ monster.senses }}<br/>
            <b>Languages</b> {{ monster.languages }}<br/>
            <b>Challenge Rating</b> {{ monster.challenge_rating }}<br/>
        </p>
        <hr>
        <div class="mb-3" v-for="(ability, index) in monster.special_abilities" :key="index">
            <a data-toggle="collapse" v-bind:href="'#ability-'+index" role="button" aria-expanded="false">{{ ability.name }} <i class="fas fa-caret-down"></i></a>
            <p class="collapse" v-bind:id="'ability-'+index">{{ ability.desc }}</p>
        </div>
        <hr>
        <h2>Actions</h2>
        <div v-for="(action, key) in monster.actions" :key="key">
            <a data-toggle="collapse" v-bind:href="'#action-'+key" role="button" aria-expanded="false">{{ action.name }} <i class="fas fa-caret-down"></i></a>
            <p class="collapse" v-bind:id="'action-'+key">{{ action.desc }}</p>
        </div>
    </div>
</template>

<script>
export default {
  name: 'Monster',
	props: [
		'monster'
    ],
    methods: {
        modifier(score) {
            var mod = Math.floor((score - 10) / 2)
            if(mod > 0) {
                return '+' + mod
            }
            else {
                return mod
            }
        },
        rollAbility(ability, score) {
            var mod = parseInt(Math.floor((score - 10) / 2));
            var roll = (Math.floor(Math.random() * 20) + 1);
            var total = roll + mod;
            
            this.$snotify.success(ability + ' roll.', roll + ' + ' + mod + ' = ' + total, {
            position: "centerTop"
            });
        }
    }
};
</script>

<style scoped>
h2 {
	margin-bottom:5px !important;
}
.abilities {
	display: grid;
	grid-template-columns: 42px 42px 42px 42px 42px 42px;
	grid-template-rows: auto;
	grid-gap: 10px;
	grid-template-areas: 
	"str dex con int wis cha";
}
.ability {
	width: 42px;
	height: 44px;
	border:solid 1px #000;
	text-align:center;
    font-size:20px;
    position:relative;
    cursor:pointer;
}
.ability .score {
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    font-size:12px;
    border: solid 1px #000;
    text-align: center;
    border-radius: 15px / 10px;
    height:20px;
    width:30px;
}
.ability .abilityName {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size:12px;
    text-align: center;
}
</style>
