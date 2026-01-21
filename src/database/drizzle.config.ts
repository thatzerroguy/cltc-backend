import * as path from 'path';
import * as dotenv from 'dotenv';
// Load env from /src/config
dotenv.config({
  path: path.resolve(__dirname, '../config/.env.development.local'),
});
import { defineConfig } from 'drizzle-kit';
import { readFileSync } from 'fs';
import { parse } from 'yaml';

interface DatabaseYamlConfig {
  database: {
    host: string;
    port: number;
    user: string;
    pass: string;
    name: string;
    ssl: boolean;
  };
}

function expandEnv(value: unknown): string {
  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    throw new Error(`Expected string but received ${typeof value}`);
  }

  return value.replace(/\$\{(.+?)\}/g, (_, name: string) => {
    const envValue = process.env[name];

    if (typeof envValue !== 'string') {
      throw new Error(`Missing environment variable: ${name}`);
    }

    return envValue;
  });
}

const file = readFileSync('./src/config/config.yaml', 'utf8');
const yaml = parse(file) as DatabaseYamlConfig;
const dbRaw = yaml.database;
const db = {
  host: expandEnv(dbRaw.host),
  port: Number(expandEnv(dbRaw.port)),
  user: expandEnv(dbRaw.user),
  pass: expandEnv(dbRaw.pass),
  name: expandEnv(dbRaw.name),
  ssl: expandEnv(dbRaw.ssl) === 'true',
};

export default defineConfig({
  schema: './src/database/schema',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.pass,
    database: db.name,
    ssl: db.ssl,
  },
});
