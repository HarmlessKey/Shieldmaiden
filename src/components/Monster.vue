<template>
    <div>
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
        <hr>
        <div class="abilities">
            <span class="ability str">
                {{ modifier(monster.strength) }}
                <span class="score bg-gray">{{ monster.strength }}</span>
            </span>
            <span class="ability dex">
                {{ modifier(monster.dexterity) }}
                <span class="score bg-gray">{{ monster.dexterity }}</span>
            </span>
            <span class="ability con">
                {{ modifier(monster.constitution) }}
                <span class="score bg-gray">{{ monster.constitution }}</span>
            </span>
            <span class="ability int">
                {{ modifier(monster.intelligence) }}
                <span class="score bg-gray">{{ monster.intelligence }}</span>
            </span>
            <span class="ability wis">
                {{ modifier(monster.wisdom) }}
                <span class="score bg-gray">{{ monster.wisdom }}</span>
            </span>
            <span class="ability cha">
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
        </p>

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
</style>
