/**
 * src/services/gistStorage.js
 * Minimal client to read/write JSON files (packages.json, destacados.json) from GitHub Gists.
 * - Auth: PAT with "gist" scope in process.env.GITHUB_TOKEN
 * - Uses GIST_PACKAGES_ID, GIST_DESTACADOS_ID for file location
 */

const axios = require('axios');

const GITHUB_API = 'https://api.github.com';
const TOKEN = process.env.GITHUB_TOKEN;
const PKG_GIST_ID = process.env.GIST_PACKAGES_ID;
const DES_GIST_ID = process.env.GIST_DESTACADOS_ID;

if (!TOKEN) throw new Error('Falta la variable de entorno GITHUB_TOKEN');
if (!PKG_GIST_ID) throw new Error('Falta la variable de entorno GIST_PACKAGES_ID');
if (!DES_GIST_ID) throw new Error('Falta la variable de entorno GIST_DESTACADOS_ID');

// Common headers for GitHub API
function ghHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// Generic read
async function getGistFile(gistId, filename) {
  const url = `${GITHUB_API}/gists/${gistId}`;
  const resp = await axios.get(url, { headers: ghHeaders() });
  const files = resp?.data?.files || {};
  const file = files[filename];
  if (!file || typeof file.content !== 'string') {
    throw new Error(`No se encontró "${filename}" en el Gist ${gistId}`);
  }
  return file.content;
}

// Generic write
async function setGistFile(gistId, filename, content) {
  const url = `${GITHUB_API}/gists/${gistId}`;
  const body = { files: { [filename]: { content } } };
  await axios.patch(url, body, { headers: ghHeaders() });
  console.log(`✅ Gist updated: ${filename} (${content.length} chars)`);
}

// Generic JSON read/write helpers
async function loadJSONFromGist(gistId, filename) {
  try {
    const raw = await getGistFile(gistId, filename);
    return JSON.parse(raw);
  } catch (err) {
    console.error(`❌ Error loading ${filename} from Gist:`, err.message);
    return [];
  }
}

async function saveJSONToGist(gistId, data, filename) {
  if (!data) {
    console.warn(`⚠️ No data provided for ${filename}, defaulting to empty array`);
    data = [];
  }

  let content;
  try {
    content = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error(`❌ Failed to stringify data for ${filename}:`, err);
    content = '[]'; // fallback
  }

  console.log(`🔹 Preparing to save JSON to ${filename}, preview (first 500 chars):`);
  console.log(content.substring(0, Math.min(500, content.length)));

  await setGistFile(gistId, filename, content);
  console.log(`✅ JSON saved to ${filename} successfully.`);
}

// --- Convenience helpers for each file ---

// packages.json cargados desde el admin panel por los vendedores
async function loadPackagesJSON() {
  return loadJSONFromGist(PKG_GIST_ID, 'MFV_packages.json');
}
async function savePackagesJSON(data) {
  return saveJSONToGist(PKG_GIST_ID, data, 'MFV_packages.json');
}

// destacados.json ofertas destacadas de XS2EVENT seleccionadas por los vendedores en el admin panel
async function loadDestacadosJSON() {
  return loadJSONFromGist(DES_GIST_ID, 'MFV_destacados.json');
}
async function saveDestacadosJSON(data) {
  return saveJSONToGist(DES_GIST_ID, data, 'MFV_destacados.json');
}

module.exports = {
  loadJSONFromGist,
  saveJSONToGist,
  loadPackagesJSON,
  savePackagesJSON,
  loadDestacadosJSON,
  saveDestacadosJSON,
};
