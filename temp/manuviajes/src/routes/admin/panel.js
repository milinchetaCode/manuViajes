const express = require('express');
const router = express.Router();

// Middleware para proteger rutas admin
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/admin/login');
}

// Import Supabase storage helpers
const {
  loadPackagesJSON,
  savePackagesJSON,
  loadDestacadosJSON,
  saveDestacadosJSON
} = require('../../services/supabaseStorage');

// Página de login (GET)
router.get('/admin/login', (req, res) => {
  res.render('login', { error: null });
});

// Procesar login (POST)
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.user = username;
    return res.redirect('/admin/panel');
  }

  res.render('login', { error: 'Credenciales incorrectas' });
});

// Logout
router.get('/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// 🔒 Página protegida: Administración de paquetes y destacados (GET)
router.get('/admin/panel', isAuthenticated, async (req, res) => {
  try {
    const paquetes = await loadPackagesJSON();
    const destacados = await loadDestacadosJSON();
    res.render('admin/panel', {
      paquetes,
      destacados,
      user: req.session.user
    });
  } catch (err) {
    console.error('Error al leer datos desde base de datos:', err);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/admin/panel', isAuthenticated, async (req, res) => {
  try {
    const paquetesForm = req.body.paquetes;
    const destacadosForm = req.body.destacados;

    // Defensive checks
    if (!paquetesForm || typeof paquetesForm !== 'object' || Object.keys(paquetesForm).length === 0) {
      return res.status(400).send('No hay datos de paquetes para guardar.');
    }
    if (!destacadosForm || typeof destacadosForm !== 'object') {
      return res.status(400).send('Datos inválidos para destacados.');
    }

    // Load current data from database/local backup
    const existingPackages = await loadPackagesJSON();

    // Map form data, merging with existing data to avoid accidental deletion
    const paquetes = Object.entries(paquetesForm).map(([id, pkg]) => {
      const existing = existingPackages.find(p => p.id === id) || {};

      return {
        id,
        eventName: typeof pkg.eventName === 'string' && pkg.eventName.trim() !== ''
          ? pkg.eventName.trim()
          : existing.eventName || '',
        ticketPrice: pkg.ticketPrice
          ? parseFloat(pkg.ticketPrice)
          : existing.ticketPrice || 0,
        flightInfo: typeof pkg.flightInfo === 'string' && pkg.flightInfo.trim() !== ''
          ? pkg.flightInfo.trim()
          : existing.flightInfo || '',
        hotelInfo: typeof pkg.hotelInfo === 'string' && pkg.hotelInfo.trim() !== ''
          ? pkg.hotelInfo.trim()
          : existing.hotelInfo || '',
        description: typeof pkg.description === 'string' && pkg.description.trim() !== ''
          ? pkg.description.trim()
          : existing.description || '',
        availabilityDates: typeof pkg.availabilityDates === 'string' && pkg.availabilityDates.trim() !== ''
          ? pkg.availabilityDates.trim()
          : existing.availabilityDates || '',
        visible: pkg.visible === '1' || existing.visible || false,
        foto: typeof pkg.foto === 'string' && pkg.foto.trim() !== ''
          ? pkg.foto.trim()
          : existing.foto || '',
        photoUrl: typeof pkg.photoUrl === 'string' && pkg.photoUrl.trim() !== ''
          ? pkg.photoUrl.trim()
          : existing.photoUrl || ''
      };
    });

    // Validate numeric fields
    for (const pkg of paquetes) {
      if (isNaN(pkg.ticketPrice) || pkg.ticketPrice < 0) {
        return res.status(400).send(`Precio inválido para paquete ID ${pkg.id}`);
      }
    }

    // Save safely to database
    await savePackagesJSON(paquetes);
    await saveDestacadosJSON(destacadosForm);

    res.redirect('/admin/panel');
  } catch (error) {
    console.error('Error procesando formulario o guardando en base de datos:', error);
    res.status(500).send('Error interno al guardar los datos: ' + error.message);
  }
});


module.exports = router;
