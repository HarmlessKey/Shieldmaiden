import numeral from "numeral";
import { character_sync_id } from "./generalConstants";
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
	expertise = false
) {
	let mod = ability_mod;
	if (proficient) {
		mod = expertise ? mod + proficiency * 2 : mod + proficiency;
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
		filename = "harmlesskey_npcs.json";
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
 * Check if the "D&D Character Sync" extension is installed
 * 
 * @param {string} url 
 * @returns 
 */
export async function extensionInstalled() {
	return new Promise((resolve) => {
		chrome.runtime.sendMessage(
			character_sync_id,
			{ request_content: ["characters"] },
			(response) => {
				if (response) {
					resolve(true)
				} else {
					return false;
				}
			}
		);
	});
}

/**
 * Gets all characters from "D&D Character Sync" Chrome Extension
 */
export async function getCharacterSyncStorage() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			character_sync_id,
			{ request_content: ["characters"] },
			(response) => {
				if (response && response.characters) {
					resolve(response.characters);
				} else {
					reject('Something went wrong getting data from Character Sync extension.');
				}
			}
		);
	});
}


/**
 * Get a single character from the "D&D Character Sync" Chrome Extension
 * 
 * @param {string} url 
 * @returns 
 */
export async function getCharacterSyncCharacter(url) {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			character_sync_id,
			{ request_content: ["characters"] },
			(response) => {
				if (response.characters && url in response.characters) {
					resolve(response.characters[url]);
				} else {
					reject(`Character not found in Character Sync Extension`);
				}
			}
		);
	});
}