import { createReadStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { connectDB, disconnectDB } from '../config/db.js';
import Transaction from '../models/Transaction.js';
import type { ITransaction } from '../types/transaction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface RawTransaction {
  id: number;
  date: string;
  amount: number;
  category: ITransaction['category'];
  status: ITransaction['status'];
  user_id: string;
  user_profile: string;
}

function parseJsonFromFile<T>(filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath, { encoding: 'utf8' });

    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk as string));
    });

    stream.on('end', () => {
      try {
        const content = Buffer.concat(chunks).toString('utf8');
        const data = JSON.parse(content) as T[];
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
}

async function seedDatabase(): Promise<void> {
  const dataFilePath = join(__dirname, '../../sample-data/transactions.json');

  console.log('Starting database seed...');
  console.log(`Data file: ${dataFilePath}`);

  const rawTransactions = await parseJsonFromFile<RawTransaction>(dataFilePath);
  console.log(`Loaded ${rawTransactions.length} transactions from sample data`);

  // Find existing transaction IDs to avoid duplicate insertion
  const existingIds = await Transaction.find({}, { id: 1, _id: 0 }).distinct('id');
  console.log(`Found ${existingIds.length} transactions already in the database`);

  const existingIdSet = new Set<number>(existingIds);
  const newTransactions = rawTransactions
    .filter((tx) => !existingIdSet.has(tx.id))
    .map((tx) => ({
      id: tx.id,
      date: new Date(tx.date),
      amount: tx.amount,
      category: tx.category,
      status: tx.status,
      user_id: tx.user_id,
      user_profile: tx.user_profile,
    }));

  if (newTransactions.length === 0) {
    console.log('No new transactions to seed. All records already exist.');
    return;
  }

  // Using insertMany with ordered: false for bulk efficiency; unique index on `id`
  // provides the canonical duplicate protection at the database level as a safety net.
  const insertResult = await Transaction.insertMany(newTransactions, { ordered: false });
  console.log(`Successfully inserted ${insertResult.length} new transactions`);

  const totalCount = await Transaction.countDocuments();
  console.log(`Total transactions in database: ${totalCount}`);
}

async function main(): Promise<void> {
  try {
    await connectDB();
    await seedDatabase();
    console.log('Database seed completed successfully.');
  } catch (error) {
    console.error('Database seed failed with error:');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack !== undefined) {
        console.error(`Stack: ${error.stack}`);
      }
    } else {
      console.error(error);
    }
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

void main();
