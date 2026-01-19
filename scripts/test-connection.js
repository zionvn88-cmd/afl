#!/usr/bin/env node

/**
 * Test database and redis connections
 * Run: node scripts/test-connection.js
 */

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { createClient } from 'redis';

dotenv.config();

async function testConnections() {
  console.log('🔍 Testing connections...\n');
  
  // Test MySQL
  try {
    console.log('Testing MySQL connection...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'afl_tracker'
    });
    
    const [rows] = await connection.query('SELECT 1 as test');
    await connection.end();
    
    console.log('✅ MySQL: Connected successfully\n');
  } catch (error) {
    console.error('❌ MySQL: Connection failed');
    console.error('   Error:', error.message, '\n');
  }
  
  // Test Redis
  try {
    console.log('Testing Redis connection...');
    const redis = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });
    
    await redis.connect();
    await redis.ping();
    await redis.quit();
    
    console.log('✅ Redis: Connected successfully\n');
  } catch (error) {
    console.error('❌ Redis: Connection failed');
    console.error('   Error:', error.message, '\n');
  }
  
  console.log('🎉 Connection test completed!\n');
}

testConnections();
