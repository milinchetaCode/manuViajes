// src/services/supabaseStorage.js
// Supabase storage driver for packages and highlights (mv_settings)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase configuration missing. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('🔌 [Supabase] Client initialized successfully.');

// ---------- Packages Table CRUD ----------
/** Get all packages */
async function getPackages() {
  const { data, error } = await supabase.from('packages').select('*');
  if (error) {
    console.error('❌ Supabase getPackages error:', error.message);
    throw error;
  }
  return data;
}

/** Create a new package */
async function createPackage(pkg) {
  const { data, error } = await supabase.from('packages').insert([pkg]);
  if (error) {
    console.error('❌ Supabase createPackage error:', error.message);
    throw error;
  }
  return data[0];
}

/** Update a package by id */
async function updatePackage(id, pkg) {
  const { data, error } = await supabase.from('packages').update(pkg).eq('id', id);
  if (error) {
    console.error('❌ Supabase updatePackage error:', error.message);
    throw error;
  }
  return data[0];
}

/** Delete a package by id */
async function deletePackage(id) {
  const { error } = await supabase.from('packages').delete().eq('id', id);
  if (error) {
    console.error('❌ Supabase deletePackage error:', error.message);
    throw error;
  }
  return true;
}

// ---------- Packages JSON (legacy) ----------
/** Load packages JSON stored under key 'packages' */
async function loadPackagesJSON() {
  const { data, error } = await supabase.from('mv_settings').select('value').eq('key', 'packages').single();
  if (error) {
    console.warn('⚠️ Supabase loadPackagesJSON error:', error.message);
    return [];
  }
  return data?.value || [];
}

/** Save packages JSON */
async function savePackagesJSON(packages) {
  const payload = { key: 'packages', value: packages, updated_at: new Date() };
  const { error } = await supabase.from('mv_settings').upsert(payload);
  if (error) {
    console.error('❌ Supabase savePackagesJSON error:', error.message);
    throw error;
  }
  console.log('✅ Packages saved to Supabase.');
}

// ---------- Destacados (highlights) ----------
/** Load destacados JSON */
async function loadDestacadosJSON() {
  const { data, error } = await supabase.from('mv_settings').select('value').eq('key', 'destacados').single();
  if (error) {
    if (error.code === 'PGRST116') return [];
    console.error('❌ Supabase loadDestacadosJSON error:', error.message);
    throw error;
  }
  return data?.value || [];
}

/** Get destacados (alias for loadDestacadosJSON) */
async function getDestacados() {
  return await loadDestacadosJSON();
}

/** Save destacados JSON */
async function saveDestacadosJSON(highlights) {
  const payload = { key: 'destacados', value: highlights, updated_at: new Date() };
  const { error } = await supabase.from('mv_settings').upsert(payload);
  if (error) {
    console.error('❌ Supabase saveDestacadosJSON error:', error.message);
    throw error;
  }
  console.log('✅ Destacados saved to Supabase.');
}

module.exports = {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
  loadPackagesJSON,
  savePackagesJSON,
  loadDestacadosJSON,
  getDestacados,
  saveDestacadosJSON,
};
