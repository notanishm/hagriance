// Test Supabase Connection
// Run with: node test-supabase.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : '❌ NOT SET');
console.log('');

if (!supabaseUrl || !supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
  console.error('❌ Supabase credentials not configured!');
  console.log('\n📝 To fix:');
  console.log('1. Go to https://zuczpzcagufmufjpubjo.supabase.co');
  console.log('2. Settings → API');
  console.log('3. Copy "anon public" key');
  console.log('4. Replace in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('✅ Supabase client created\n');

    // Test 2: Try to query profiles table
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  Database tables not created yet!');
        console.log('\n📝 Next steps:');
        console.log('1. Open Supabase Dashboard → SQL Editor');
        console.log('2. Run all SQL from SUPABASE_SETUP.md');
        console.log('3. Run this test again');
      } else {
        console.error('❌ Database error:', error.message);
      }
      process.exit(1);
    }

    console.log('✅ Database connection successful!');
    console.log('\n🎉 Supabase is fully configured and ready to use!\n');

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
