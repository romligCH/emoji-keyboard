import {Emoji} from "./data";

const indexedEmojis: {[group: string]: {[subGroupd: string]: Emoji[]}} = {};
const flatEmojis: Emoji[] = [];
let searchHaystack: string = "";

const ESCAPE_REGEX = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-'].join('|\\') + ')', 'g');
const SEPARATOR = '%';
const SEPARATOR_REGEX_G = /%/g;
const SEARCH_ID = SEPARATOR + '(\\d+)' + SEPARATOR + '[^' + SEPARATOR + ']+';

data.emojis.forEach((emoji) => {
	if (!indexedEmojis[emoji.group]) indexedEmojis[emoji.group] = {};
	if (!indexedEmojis[emoji.group][emoji.subGroup]) indexedEmojis[emoji.group][emoji.subGroup] = [];

	indexedEmojis[emoji.group][emoji.subGroup].push(emoji);

	(!emoji.alternates || !emoji.alternates.length ? [emoji] : emoji.alternates)
		.forEach(e => {
			searchHaystack +=
				'%' + flatEmojis.length + '%' +
				(e.fullName + ' ' + e.name + (e.keywords ? ' ' + e.keywords.join(' ') : '')).replace(SEPARATOR_REGEX_G, '')
			flatEmojis.push(e);
		});
})

function escapeRegex(str: string): string {
	return str.replace(ESCAPE_REGEX, '\\$1');
}

export function getSubGroup(group: string, subGroup: string): Emoji[] {
	if (indexedEmojis[group] && indexedEmojis[group][subGroup]) {
		return indexedEmojis[group][subGroup];
	} else {
		return [];
	}
}

export function search(needle: string) {
	let result: number[] = [];
	needle.split(/\s+/g).forEach((n, k) => {
		let filter: number[] = [];
		if (!n.length) return;
		const re = new RegExp(SEARCH_ID + escapeRegex(n.replace(SEPARATOR_REGEX_G, '')), 'ig');
		for (let m; (m = re.exec(searchHaystack));) {
			filter.push(parseInt(m[1]));
		}
		if (k == 0) result = filter;
		else result = result.filter(v => filter.indexOf(v) !== -1);
	})
	return result.map(v => flatEmojis[v]);
}
