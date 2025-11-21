import 'dotenv/config';
import { defineConfig } from '@prisma/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL!,
    // directUrl: process.env.DIRECT_URL || undefined,
  },
  // Prisma Client avec adapter
  // client: {
  //   adapter,
  // },
});
