#!/usr/bin/env node

/**
 * Database initialization script
 * Run: node scripts/init-database.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function initDatabase() {
  console.log('🚀 Initializing database...\n');
  
  try {
    // Connect to MySQL (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL');
    
    // Create database if not exists
    const dbName = process.env.DB_NAME || 'afl_tracker';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✅ Database '${dbName}' created/exists`);
    
    // Use database
    await connection.query(`USE \`${dbName}\``);
    
    // Read and execute schema.sql
    const schemaPath = join(__dirname, '../database/schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Executing schema.sql...');
    await connection.query(schema);
    console.log('✅ Schema created successfully');
    
    // Read and execute seed.sql
    const seedPath = join(__dirname, '../database/seed.sql');
    const seed = readFileSync(seedPath, 'utf8');
    
    console.log('📄 Executing seed.sql...');
    await connection.query(seed);
    console.log('✅ Sample data inserted');
    
    await connection.end();
    
    console.log('\n🎉 Database initialization completed!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initDatabase();
