import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { defaultStayData } from './defaultData';
import { StayData } from './types';

const dataFilePath = path.join(process.cwd(), 'data', 'stay-data.json');

async function ensureDataFile() {
	await mkdir(path.dirname(dataFilePath), { recursive: true });

	try {
		await readFile(dataFilePath, 'utf-8');
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			await writeFile(dataFilePath, JSON.stringify(defaultStayData, null, 2), 'utf-8');
			return;
		}

		throw error;
	}
}

export async function readStayData(): Promise<StayData> {
	await ensureDataFile();
	const file = await readFile(dataFilePath, 'utf-8');

	return JSON.parse(file) as StayData;
}

export async function writeStayData(data: StayData) {
	await ensureDataFile();
	await writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');

	return data;
}

export async function updateStayData(updater: (data: StayData) => StayData | Promise<StayData>) {
	const current = await readStayData();
	const next = await updater(current);

	await writeStayData(next);

	return next;
}
