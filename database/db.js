require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

let supabase = null;

const key = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (process.env.SUPABASE_URL && key) {
  supabase = createClient(process.env.SUPABASE_URL, key);
}

module.exports = { supabase };
