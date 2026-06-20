const express = require('express');
const router = express.Router();

// Use getPackages which reads directly from the packages table
const { getPackages } = require('../services/supabaseStorage');

router.get('/paquete/:id', async (req, res) => {
  try {
    // Load packages from the packages table (returns camelCase objects)
    const packages = await getPackages();

    // Find the package by id from URL param
    const paquete = packages.find(pkg => pkg.id === req.params.id);

    // If not found, render 404 page
    if (!paquete) {
      return res.status(404).render('404', { message: 'Paquete no encontrado' });
    }

    // Find related packages by continent (max 2, excluding current)
    const relatedPackages = packages
      .filter(pkg =>
        pkg.continent === paquete.continent &&
        pkg.id !== paquete.id &&
        pkg.visible
      )
      .slice(0, 2);

    // Render the paquete template with the package data
    res.render('paquete', {
      paquete: paquete,
      relatedPackages: relatedPackages,
      currentPage: null // optional, depends on your template logic
    });
  } catch (err) {
    console.error('Error loading packages in /paquete/:id:', err);
    res.status(500).render('500', { message: 'Error interno al cargar el paquete.' });
  }
});

module.exports = router;
