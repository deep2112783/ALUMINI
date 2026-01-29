import pg from "pg";

const { Pool } = pg;

const dbConfig = {
  user: "postgres",
  password: process.env.SUPABASE_PASSWORD || "sushu789",
  host: "db.ulkytfwbbkcuskzgafsx.supabase.co",
  port: 5432,
  database: "postgres",
  ssl: {
    rejectUnauthorized: false,
  },
};

export const pool = new Pool(dbConfig);
