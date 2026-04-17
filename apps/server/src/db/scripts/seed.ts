/* eslint-disable drizzle/enforce-delete-with-where */
import 'dotenv/config';
import { createInterface } from 'readline';
import { randomUUID } from 'crypto';
import { hashPassword } from '@/api/auth';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import env from '@/env';
import * as schema from '@/db/schema/index';
import {
  account,
  dataset,
  datasetAssignedUser,
  datasetColumn,
  role,
  session,
  upload,
  uploadRow,
  user,
  verification,
} from '@/db/schema/index';

if (env.NODE_ENV === 'production') {
  console.error('Seed script cannot run in production.');
  process.exit(1);
}

if (!env.SEED_DATABASE_URL) {
  console.error('SEED_DATABASE_URL is not set. Set it to your dev/staging database URL.');
  process.exit(1);
}

const client = postgres(env.SEED_DATABASE_URL);
const db = drizzle(client, { schema });

const PASSWORD = 'DataDropPass123';

const USERS = [
  {
    email: 'demo-admin-user-01@email.com',
    name: 'Kenny Roberts',
    firstName: 'Kenny',
    lastName: 'Roberts',
    role: 'admin',
  },
  {
    email: 'demo-admin-user-02@email.com',
    name: 'Jane Cowden',
    firstName: 'Jane',
    lastName: 'Cowden',
    role: 'admin',
  },
  {
    email: 'demo-admin-user-03@email.com',
    name: 'Marcus Holt',
    firstName: 'Marcus',
    lastName: 'Holt',
    role: 'admin',
  },
  {
    email: 'demo-admin-user-04@email.com',
    name: 'Priya Nair',
    firstName: 'Priya',
    lastName: 'Nair',
    role: 'admin',
  },
  {
    email: 'demo-viewer-user-01@email.com',
    name: 'Diana Bower',
    firstName: 'Diana',
    lastName: 'Bower',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-02@email.com',
    name: 'Robert Kelsey',
    firstName: 'Robert',
    lastName: 'Kelsey',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-03@email.com',
    name: 'Morgan Ridge',
    firstName: 'Morgan',
    lastName: 'Ridge',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-04@email.com',
    name: 'Lena Fischer',
    firstName: 'Lena',
    lastName: 'Fischer',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-05@email.com',
    name: 'Carlos Vega',
    firstName: 'Carlos',
    lastName: 'Vega',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-06@email.com',
    name: 'Aisha Okafor',
    firstName: 'Aisha',
    lastName: 'Okafor',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-07@email.com',
    name: 'Tom Barker',
    firstName: 'Tom',
    lastName: 'Barker',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-08@email.com',
    name: 'Sophie Larsen',
    firstName: 'Sophie',
    lastName: 'Larsen',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-09@email.com',
    name: 'James Whitfield',
    firstName: 'James',
    lastName: 'Whitfield',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-10@email.com',
    name: 'Nina Castillo',
    firstName: 'Nina',
    lastName: 'Castillo',
    role: 'viewer',
  },
  {
    email: 'demo-viewer-user-11@email.com',
    name: 'Owen Maddox',
    firstName: 'Owen',
    lastName: 'Maddox',
    role: 'viewer',
  },
] as const;

// Columns derived from public/csv/orders.csv headers
const DATASET_COLUMNS: { name: string; type: 'string' | 'number' | 'date' | 'boolean' }[] = [
  { name: 'order_id', type: 'number' },
  { name: 'order_number', type: 'number' },
  { name: 'created_at', type: 'date' },
  { name: 'customer_name', type: 'string' },
  { name: 'customer_email', type: 'string' },
  { name: 'fulfillment_status', type: 'string' },
  { name: 'financial_status', type: 'string' },
  { name: 'total_price', type: 'number' },
  { name: 'subtotal_price', type: 'number' },
  { name: 'total_tax', type: 'number' },
  { name: 'shipping_price', type: 'number' },
  { name: 'discount_amount', type: 'number' },
  { name: 'currency', type: 'string' },
  { name: 'city', type: 'string' },
  { name: 'country', type: 'string' },
  { name: 'line_item_id', type: 'number' },
  { name: 'product_title', type: 'string' },
  { name: 'sku', type: 'string' },
  { name: 'quantity', type: 'number' },
  { name: 'unit_price', type: 'number' },
  { name: 'line_total', type: 'number' },
];

async function confirm(): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    rl.question(
      `\nThis will DELETE ALL DATA in ${env.SEED_DATABASE_URL}\nAre you sure you want to proceed? (yes/no)`,
      (answer) => {
        rl.close();
        const acceptedAnswers = ['YES', 'yes', 'Y', 'y'];
        if (acceptedAnswers.includes(answer.trim())) {
          resolve();
        } else {
          reject(new Error('Seed cancelled.'));
        }
      },
    );
  });
}

async function seed() {
  await confirm();

  console.log('Resetting database...');

  await db.delete(uploadRow);
  await db.delete(upload);
  await db.delete(datasetAssignedUser);
  await db.delete(datasetColumn);
  await db.delete(dataset);
  await db.delete(account);
  await db.delete(session);
  await db.delete(verification);
  await db.delete(user);
  await db.delete(role);

  console.log('Inserting roles...');

  const roles = await db
    .insert(role)
    .values([
      { name: 'admin', description: 'Full access' },
      { name: 'viewer', description: 'Read-only access' },
    ])
    .returning();

  const roleMap = Object.fromEntries(roles.map((r) => [r.name, r.id]));

  console.log('Inserting users and accounts...');

  const hashedPassword = await hashPassword(PASSWORD);

  for (const u of USERS) {
    const userId = randomUUID();

    await db.insert(user).values({
      id: userId,
      name: u.name,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roleId: roleMap[u.role],
      emailVerified: true,
    });

    await db.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log('Inserting dataset...');

  const [ecommerceDataset] = await db
    .insert(dataset)
    .values({
      title: 'eCommerce Store Performance',
      slug: 'ecommerce-store-performance'
    })
    .returning();

  console.log('Inserting dataset columns...');

  await db.insert(datasetColumn).values(
    DATASET_COLUMNS.map((col, i) => ({
      datasetId: ecommerceDataset!.id,
      name: col.name,
      type: col.type,
      position: i + 1,
    })),
  );

  console.log('Done.');
  await client.end();
}

seed().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
