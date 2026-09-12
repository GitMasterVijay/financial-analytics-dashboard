import { config } from '../config/index.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { createAnalystUser } from '../services/authService.js';

async function seedUser(): Promise<void> {
  console.log('Starting analyst user seed...');
  console.log(`Analyst email: ${config.analystEmail}`);

  await createAnalystUser(config.analystEmail, config.analystPassword);
  console.log('Analyst user seed completed.');
}

async function main(): Promise<void> {
  try {
    await connectDB();
    await seedUser();
    console.log('User seed completed successfully.');
  } catch (error) {
    console.error('User seed failed with error:');
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
