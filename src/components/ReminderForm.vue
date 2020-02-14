<template>
    <div>
        <b-row class="mb-2">
            <b-col class="col-3">
                <label for="title">Title</label>
            </b-col>
            <b-col>
                <b-form-input type="text" 
                autocomplete="off"
                v-model="reminder.title"
                v-validate="'required'"
                name="title"
                id="title"
                placeholder="Title"></b-form-input>
                <p class="validate red" v-if="errors.has('title')">{{ errors.first('title') }}</p>
            </b-col>
        </b-row>
        <b-row class="mb-2">
            <b-col class="col-3">Color</b-col>
            <b-col>
                <div class="colors d-flex justify-content-between bg-gray-hover">
                    <a v-for="(color, index) in colors" :key="index" :class="'bg-'+color" @click="setColor(color)">
                        <span v-show="color == reminder.color"><i class="fas fa-check"></i></span>
                    </a>
                </div>
            </b-col>
        </b-row>
        <b-row class="mb-2">
            <b-col class="col-3">
                <label for="trigger">Trigger</label>
            </b-col>
            <b-col>
                <b-form-select type="text" 
                v-model="reminder.trigger"
                v-validate="'required'"
                id="trigger"
                name="trigger">
                    <option selected="selected" value="">- Select the trigger -</option>
                    <option v-for="(trigger, key) in triggers" :value="key" :key="key">{{ trigger }}</option>
                </b-form-select>
                <p class="validate red" v-if="errors.has('trigger')">{{ errors.first('trigger') }}</p>
            </b-col>
        </b-row>
        <b-row v-if="reminder.trigger === 'timed'" class="mb-2">
            <b-col class="col-3">
                <label for="rounds">Rounds</label>
            </b-col>
            <b-col>
                <b-form-input id="rounds" 
                    name="rounds"
                    type="number" 
                    v-model="reminder.rounds"
                    v-validate="'required'"
                    min="1"></b-form-input>
                    <p class="validate red" v-if="errors.has('rounds')">{{ errors.first('rounds') }}</p>
                    <small>(One minute is 10 rounds)</small>
            </b-col>
        </b-row>
        <b-row class="mb-3">
            <b-col class="col-3">
                Action
            </b-col>
            <b-col>
                <b-form-radio-group v-model="reminder.action" name="action">
                    <div>
                        <b-form-radio value="remove">Remove on trigger</b-form-radio><br/>
                        <small v-if="reminder.action == 'remove'">(You will still be notified)</small>
                    </div>
                    <b-form-radio value="notify" class="mt-2">Notify on trigger</b-form-radio><br/>
                    <template v-if="reminder.action == 'notify'">
                        <b-form-textarea class="mt-2" rows="3" name="notification" v-validate="'required'" v-model="reminder.notify" placeholder="Notification"></b-form-textarea>
                        <p class="validate red" v-if="errors.has('notification')">{{ errors.first('notification') }}</p>
                        <small>(You'll get the option to keep or remove the reminder)</small>
                    </template>
                </b-form-radio-group>
            </b-col>
        </b-row>
    </div>
</template>

<script>
export default {
    name: "ReminderForm",
    props: {
        value: Object
    },
    data() {
        return {
            triggers: {
                'startTurn': 'Start of own turn',
                'endTurn': 'End of own turn',
                'damage': 'On damage taken',
                'timed': 'Timer',
            },
            actions: {
                'notify': 'Notify',
                'remove': 'Remove reminder',
            },
            colors: [
                'green-light',
                'yellow-light',
                'orange-light',
                'red-light',
                'purple',
                'blue-light',
            ]
        }
    },
    computed: {
        reminder: {
            get() {
                return this.value;
            },
            set(newValue) {
                this.$emit('input', newValue);
            }
        }
    },
    watch: {
        reminder: {
            handler() {
                //Emits validation on every change
                this.$emit('validation', this.$validator);
            },
            deep: true
        }
    },
    mounted() {
        if(Object.keys(this.value).length === 0) {
            //Set default values
            this.$set(this.reminder, 'color', 'green-light');
            this.$set(this.reminder, 'action', 'remove');
        }
        this.$emit('validation', this.$validator);
    },
    methods: {
        setColor(color) {
            this.$set(this.reminder, 'color', color);
        },
    }
}
</script>

<style scoped lang="scss">
    .colors {
        max-width: 300px;
		padding: 5px;

		a {
			display: block;
			width: 25px;
			height: 25px;
			padding: 2px 5px;
			color: #fff !important;
			margin-right: 5px;

			&:last-child {
				margin-right: 0;
			}
		}
	}
</style>