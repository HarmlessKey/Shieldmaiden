import numeral from "numeral";
import { character_sync_id } from "./generalConstants";
import _ from "lodash";

/**
 * Calculate the average value of given dice
 *
 * @param {number} value
 * @param {number} amount
 * @returns {number}
 */
export function calc_dice_average(value, amount = 1) {
	return Math.ceil(((value + 1) / 2) * amount);
}

/**
 * Calculates the modifier from an ability score
 *
 * @param {number} value
 * @returns {number}
 */
export function calc_mod(value) {
	return value ? Math.floor((value - 10) / 2) : 0;
}

/**
 * Returns the modifier for a given skill
 *
 * @param {number} ability_mod
 * @param {number} proficiency
 * @param {number} bonus
 * @param {boolean} proficient
 * @param {boolean} expertise
 * @returns {number}
 */
export function calc_skill_mod(
	ability_mod,
	proficiency,
	bonus = 0,
	proficient = false,
	expertise = false,
	jack_of_all_trades = false
) {
	let mod = ability_mod;
	if (proficient) {
		mod = expertise ? mod + proficiency * 2 : mod + proficiency;
	} else if (jack_of_all_trades) {
		mod += Math.floor(proficiency / 2);
	}
	return parseInt(mod) + parseInt(bonus);
}

/**
 * Downloads a JSON file
 *
 * @param {data} data
 */
export function downloadJSON(data) {
	let filename;
	if (data instanceof Array) {
		filename = "shieldmaiden_npcs.json";
	} else {
		filename = data.name.trim() + ".json";
	}

	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
	var downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", filename);
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

/**
 * Generates a UUID
 *
 * @param {data} data
 */
export function uuid(mask = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx") {
	return `${mask}`.replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/**
 * Make readable Date
 */

export function makeDate(input, showTime = false, short = false) {
	let monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	let d = new Date(input);
	let hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	let minutes = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();

	let time = hours + ":" + minutes;
	let date = short
		? d.getDate() + "-" + parseInt(d.getMonth() + 1) + "-" + d.getFullYear()
		: monthNames[d.getMonth()] + " " + numeral(d.getDate()).format("0o") + " " + d.getFullYear();

	if (showTime) {
		return date + " at " + time;
	}
	return date;
}

/**
 * Turns a character object from D&D Character Sync into a HK player object
 *
 * @param {object} character
 * @returns {object} player
 */
export function characterToPlayer(character) {
	const player = {};

	if (character.avatar != undefined && character.avatar !== "")
		player.avatar =
			character.avatar.length <= 2000 ? character.avatar : character.avatar.subString(0, 2000);
	if (character.name != undefined && character.name !== "")
		player.character_name =
			character.name.length <= 100 ? character.name : character.name.subString(0, 100);

	if (character.xp != undefined && character.xp !== "")
		player.experience = parseInt(character.xp.between(0, 355000));
	else if (character.level != undefined && character.level !== "")
		player.level = parseInt(character.level.between(1, 20));

	if (character.armor_class != undefined && character.armor_class !== "")
		player.ac = parseInt(character.armor_class.between(1, 99));
	if (character.max_hit_points != undefined && character.max_hit_points !== "")
		player.maxHp = parseInt(character.max_hit_points.between(1, 999));

	if (character.strength != undefined && character.strength !== "")
		player.strength = parseInt(character.strength.between(1, 99));
	if (character.dexterity != undefined && character.dexterity !== "")
		player.dexterity = parseInt(character.dexterity.between(1, 99));
	if (character.constitution != undefined && character.constitution !== "")
		player.constitution = parseInt(character.constitution.between(1, 99));
	if (character.intelligence != undefined && character.intelligence !== "")
		player.intelligence = parseInt(character.intelligence.between(1, 99));
	if (character.wisdom != undefined && character.wisdom !== "")
		player.wisdom = parseInt(character.wisdom.between(1, 99));
	if (character.charisma != undefined && character.charisma !== "")
		player.charisma = parseInt(character.charisma.between(1, 99));

	if (character.walking_speed != undefined && character.walking_speed !== "")
		player.speed = parseInt(character.walking_speed.between(0, 999));
	if (character.initiative != undefined && character.initiative !== "")
		player.initiative = parseInt(character.initiative.between(-10, 99));

	return player;
}

/**
 * Compares player with linked character
 *
 * @param {object} player
 * @returns {boolean}
 */
export function comparePlayerToCharacter(sync_character, player) {
	const character = sync_character ? characterToPlayer(sync_character) : {};
	const compare_player = {};

	for (const key of Object.keys(character)) {
		compare_player[key] = player[key];
	}
	return _.isEqual(compare_player, character);
}

/**
 * Check if the "D&D Character Sync" extension is installed
 *
 * @param {string} url
 */
export async function extensionInstalled() {
	const sendMessage = new Promise((resolve) => {
		chrome?.runtime?.sendMessage(
			character_sync_id,
			{ request_content: ["version"] },
			(response) => {
				if (response) {
					resolve(response.version);
				} else {
					return undefined;
				}
			}
		);
	});
	const timeout = new Promise((resolve) => {
		setTimeout(resolve, 100, undefined);
	});
	return Promise.race([sendMessage, timeout]);
}

/**
 * Gets all characters from "D&D Character Sync" Chrome Extension
 */
export async function getCharacterSyncStorage() {
	const sendMessage = new Promise((resolve) => {
		chrome?.runtime?.sendMessage(
			character_sync_id,
			{ request_content: ["characters"] },
			(response) => {
				if (response && response.characters) {
					resolve(response.characters);
				} else {
					resolve({});
				}
			}
		);
	});
	const timeout = new Promise((resolve) => {
		setTimeout(resolve, 100, {});
	});
	return Promise.race([sendMessage, timeout]);
}

/**
 * Get a single character from the "D&D Character Sync" Chrome Extension
 *
 * @param {string} url
 * @returns
 */
export async function getCharacterSyncCharacter(url) {
	const sendMessage = new Promise((resolve, reject) => {
		chrome?.runtime?.sendMessage(
			character_sync_id,
			{ request_content: ["characters"] },
			(response) => {
				if (response.characters && url in response.characters) {
					resolve(response.characters[url]);
				} else {
					reject(`Character not found in D&D Character Sync Extension`);
				}
			}
		);
	});
	const timeout = new Promise((resolve) => {
		setTimeout(resolve, 100, `Character not found in D&D Character Sync Extension`);
	});
	return Promise.race([sendMessage, timeout]);
}

/**
 * Check if a url is spotify or youtube
 */
export function urlType(url) {
	switch (true) {
		case !!url?.match(/^https?:\/\/(www.)?((youtube.)|(youtu.be))/):
			return "youtube";
		case !!url?.match(/^(https?:\/\/(www.)?|(open.))spotify\./):
			return "spotify";
		default:
			return "other";
	}
}

export function generateYoutubeEmbedUrl(url) {
	const regex = /(v=|embed\/|\.be\/|v\/)(?<id>[^&|/?]{11})/i;
	const { id } = regex.exec(url).groups;

	return `https://www.youtube-nocookie.com/embed/${id}`;
}
