const {
  loadPackagesJSON,
  loadDestacadosJSON
} = require('../services/gistStorage');

async function loadPackages() {
  return await loadPackagesJSON();
}

async function loadEventos() {
  return await loadEventosJSON();
}

module.exports = {
  loadPackages,
  loadEventos
};
