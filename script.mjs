import { exec } from "child_process";
import { writeFile, readFile } from "fs/promises";

const promiseTimeout = ms => new Promise((res, rej) => setTimeout(res, ms));

const DATA_FILE = './data.json';
const LOGS_DIR = './logs/';

do {
	exec('speedtest -f json', async (err, stdout, stderr) => {
		const currTime = Date.now();
		const newLogFilename = `${LOGS_DIR}${currTime}.log`;
		const prevData = JSON.parse(await readFile(DATA_FILE));

		// handle error
		if (err || stderr) {
			// write log file
			await writeFile(newLogFilename, stderr, 'utf8');

			// add to error count
			const newData = { ...prevData, errors: prevData.errors + 1 };
			await writeFile(DATA_FILE, JSON.stringify(newData), 'utf8');

			return console.log('[ERROR LOG FILE]', newLogFilename);
		}

		// write log file
		await writeFile(newLogFilename, stdout, 'utf8');

		// extract results
		const result = JSON.parse(stdout);
		const { bytes: downloadSpeed, ...otherData } = result.download;

		// add new results to old dataset
		const newData = {
			...prevData,
			all: [...prevData.all, {
				...result.download,
				takenAt: currTime
			}],
			avg: prevData.avg + (downloadSpeed - prevData.avg) / (prevData.count + 1),
			count: prevData.count + 1,
			last: currTime,
			low: Math.min(prevData.low, downloadSpeed),
			high: Math.max(prevData.high, downloadSpeed),
		}
		// write to data file
		await writeFile(DATA_FILE, JSON.stringify(newData, null, 2), 'utf-8');

		return console.log('[LOG FILE]', newLogFilename);
	});
	await promiseTimeout(1000 * 60 * 7.5)
} while (true);
