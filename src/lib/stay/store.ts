import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { defaultStayData } from './defaultData';
import { StayData } from './types';

const dataFilePath = path.join(process.cwd(), 'data', 'stay-data.json');
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;

let sqlClient: NeonQueryFunction<false, false> | null = null;
let schemaPromise: Promise<void> | null = null;

function getSql() {
	if (!databaseUrl) {
		return null;
	}

	if (!sqlClient) {
		sqlClient = neon(databaseUrl);
	}

	return sqlClient;
}

async function ensureDatabaseSchema() {
	const sql = getSql();

	if (!sql) {
		return;
	}

	if (!schemaPromise) {
		schemaPromise = (async () => {
			await sql`
				CREATE TABLE IF NOT EXISTS stay_state (
					id text PRIMARY KEY,
					data jsonb NOT NULL,
					version bigint NOT NULL DEFAULT 1,
					updated_at timestamptz NOT NULL DEFAULT now()
				)
			`;
			await sql.query(
				`INSERT INTO stay_state (id, data)
				 VALUES ('main', $1::jsonb)
				 ON CONFLICT (id) DO NOTHING`,
				[JSON.stringify(defaultStayData)]
			);
		})().catch((error) => {
			schemaPromise = null;
			throw error;
		});
	}

	await schemaPromise;
}

/**
 * Records saved before the user management feature do not carry a `users` array,
 * so every read is normalized to keep the rest of the app free of null checks.
 */
function normalizeStayData(data: StayData | undefined | null): StayData {
	if (!data) {
		return defaultStayData;
	}

	return {
		...data,
		users: Array.isArray(data.users) ? data.users : [],
		// Check-in and check-out hours arrived later than the first apartments.
		apartments: (data.apartments ?? []).map((apartment) => ({
			...apartment,
			checkInFrom: apartment.checkInFrom || '14:00',
			checkOutUntil: apartment.checkOutUntil || '11:00'
		}))
	};
}

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

async function readFileData() {
	if (process.env.VERCEL) {
		throw new Error('DATABASE_URL is required when the application runs on Vercel.');
	}

	await ensureDataFile();
	const file = await readFile(dataFilePath, 'utf-8');

	return normalizeStayData(JSON.parse(file) as StayData);
}

export async function readStayData(): Promise<StayData> {
	const sql = getSql();

	if (!sql) {
		return readFileData();
	}

	await ensureDatabaseSchema();
	const rows = (await sql`SELECT data FROM stay_state WHERE id = 'main'`) as { data: StayData }[];

	return normalizeStayData(rows[0]?.data);
}

export async function writeStayData(data: StayData) {
	const sql = getSql();

	if (!sql) {
		await ensureDataFile();
		await writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
		return data;
	}

	await ensureDatabaseSchema();
	await sql.query(
		`INSERT INTO stay_state (id, data, version, updated_at)
		 VALUES ('main', $1::jsonb, 1, now())
		 ON CONFLICT (id) DO UPDATE
		 SET data = EXCLUDED.data, version = stay_state.version + 1, updated_at = now()`,
		[JSON.stringify(data)]
	);

	return data;
}

export async function updateStayData(updater: (data: StayData) => StayData | Promise<StayData>) {
	const sql = getSql();

	if (!sql) {
		const current = await readFileData();
		const next = await updater(current);
		await writeStayData(next);
		return next;
	}

	await ensureDatabaseSchema();

	for (let attempt = 0; attempt < 5; attempt += 1) {
		const rows = (await sql`
			SELECT data, version FROM stay_state WHERE id = 'main'
		`) as { data: StayData; version: string }[];
		const current = rows[0];

		if (!current) {
			throw new Error('Stay data has not been initialized.');
		}

		const next = await updater(normalizeStayData(current.data));
		const result = await sql.query(
			`UPDATE stay_state
			 SET data = $1::jsonb, version = version + 1, updated_at = now()
			 WHERE id = 'main' AND version = $2
			 RETURNING version`,
			[JSON.stringify(next), current.version]
		);

		if (result.length === 1) {
			return next;
		}
	}

	throw new Error('Stay data was changed concurrently. Please retry the operation.');
}
