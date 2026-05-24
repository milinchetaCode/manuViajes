/**
 * src/services/supabaseStorage.js
 * Supabase storage driver for packages and highlights.
 * - Synchronizes with local /data files as a persistent backup / local cache
 *   so synchronous readFileSync calls elsewhere in the app keep working seamlessly.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Check if running in mock/offline mode
const isMock = !supabaseUrl || supabaseUrl.includes('mock') || !supabaseKey || supabaseKey.includes('mock');
let supabase = null;

if (!isMock) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('🔌 [Supabase] Client initialized successfully.');
  } catch (err) {
    console.error('❌ [Supabase] Failed to initialize client:', err.message);
  }
} else {
  console.log('⚠️ [Supabase] Running in local mock mode. Storing data in local JSON files.');
}

const localDataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(localDataDir)) {
  fs.mkdirSync(localDataDir, { recursive: true });
}

const localPackagesPath = path.join(localDataDir, 'packages.json');
const localDestacadosPath = path.join(localDataDir, 'destacados.json');

// Helper to safely load local fallback data
function loadLocalFile(filePath, fallback = '[]') {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, fallback);
      return JSON.parse(fallback);
    }
    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    return JSON.parse(raw || fallback);
  } catch (err) {
    console.error(`❌ Error reading local fallback file ${filePath}:`, err.message);
    return JSON.parse(fallback);
  }
}

// Helper to safely save local data
function saveLocalFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ Error writing local file ${filePath}:`, err.message);
  }
}

async function loadPackagesJSON() {
  if (isMock || !supabase) {
    return loadLocalFile(localPackagesPath, '[]');
  }
  try {
    const { data, error } = await supabase
      .from('mv_settings')
      .select('value')
      .eq('key', 'packages')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        const local = loadLocalFile(localPackagesPath, '[]');
        return local;
      }
      throw error;
    }

    const value = data?.value || [];
    saveLocalFile(localPackagesPath, value);
    return value;
  } catch (err) {
    console.warn('⚠️ Supabase loadPackagesJSON error, getting from local JSON backup:', err.message);
    return loadLocalFile(localPackagesPath, '[]');
  }
}

async function savePackagesJSON(data) {
  if (!data) data = [];
  
  saveLocalFile(localPackagesPath, data);

  if (isMock || !supabase) {
    console.log('✅ [Supabase] Packages saved locally (Mock Mode).');
    return;
  }

  try {
    const { error } = await supabase
      .from('mv_settings')
      .upsert({ key: 'packages', value: data, updated_at: new Date() });

    if (error) throw error;
    console.log('✅ [Supabase] Packages successfully saved to Supabase table "mv_settings".');
  } catch (err) {
    console.error('❌ Supabase savePackagesJSON error:', err.message);
  }
}

async function loadDestacadosJSON() {
  if (isMock || !supabase) {
    return loadLocalFile(localDestacadosPath, '[]');
  }
  try {
    const { data, error } = await supabase
      .from('mv_settings')
      .select('value')
      .eq('key', 'destacados')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        const local = loadLocalFile(localDestacadosPath, '[]');
        return local;
      }
      throw error;
    }

    const value = data?.value || [];
    saveLocalFile(localDestacadosPath, value);
    return value;
  } catch (err) {
    console.warn('⚠️ Supabase loadDestacadosJSON error, getting from local JSON backup:', err.message);
    return loadLocalFile(localDestacadosPath, '[]');
  }
}

async function saveDestacadosJSON(data) {
  if (!data) data = [];

  saveLocalFile(localDestacadosPath, data);

  if (isMock || !supabase) {
    console.log('✅ [Supabase] Destacados saved locally (Mock Mode).');
    return;
  }

  try {
    const { error } = await supabase
      .from('mv_settings')
      .upsert({ key: 'destacados', value: data, updated_at: new Date() });

    if (error) throw error;
    console.log('✅ [Supabase] Destacados successfully saved to Supabase table "mv_settings".');
  } catch (err) {
    console.error('❌ Supabase saveDestacadosJSON error:', err.message);
  }
}

module.exports = {
  loadPackagesJSON,
  savePackagesJSON,
  loadDestacadosJSON,
  saveDestacadosJSON,
};
