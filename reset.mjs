import { writeFile } from "fs/promises"

const defaultData = {
	all: [],
	avg: 0,
	count: 0,
	last: 0,
	low: 9007199254740991,
	high: -1,
	errors: 0,
};

try {
	await writeFile('./data.json', JSON.stringify(defaultData, null, 2), 'utf-8');
	console.log('RESETED')
} catch (error) {
	console.log('[ERR]', error)
}
