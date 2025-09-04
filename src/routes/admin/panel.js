const express = require('express');
const router = express.Router();

// Middleware para proteger rutas admin
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/admin/login');
}

// Import Gist storage helpers
const {
  loadPackagesJSON,
  savePackagesJSON,
  loadDestacadosJSON,
  saveDestacadosJSON
} = require('../../services/gistStorage');

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
    console.error('Error al leer datos desde Gist:', err);
    res.status(500).send('Error interno del servidor');
  }
});

// 🔒 Guardar cambios de paquetes y destacados (POST)
router.post('/admin/panel', isAuthenticated, async (req, res) => {
  try {
    const paquetesForm = req.body.paquetes;
    const destacadosForm = req.body.destacados;

    if (!paquetesForm || typeof paquetesForm !== 'object') {
      throw new Error('Datos inválidos para paquetes.');
    }
    if (!destacadosForm || typeof destacadosForm !== 'object') {
      throw new Error('Datos inválidos para destacados.');
    }

    const paquetes = Object.entries(paquetesForm).map(([id, pkg]) => ({
      id: id,
      eventName: typeof pkg.eventName === 'string' ? pkg.eventName.trim() : '',
      ticketPrice: parseFloat(pkg.ticketPrice),
      flightInfo: typeof pkg.flightInfo === 'string' ? pkg.flightInfo.trim() : '',
      hotelInfo: typeof pkg.hotelInfo === 'string' ? pkg.hotelInfo.trim() : '',
      description: typeof pkg.description === 'string' ? pkg.description.trim() : '',
      availabilityDates: typeof pkg.availabilityDates === 'string' ? pkg.availabilityDates.trim() : '',
      visible: pkg.visible === '1' || pkg.visible === true,
      foto: typeof pkg.foto === 'string' ? pkg.foto.trim() : ''
    }));

    for (const pkg of paquetes) {
      if (isNaN(pkg.ticketPrice) || pkg.ticketPrice < 0) {
        throw new Error(`Precio inválido para paquete ID ${pkg.id}`);
      }
    }

    await savePackagesJSON(paquetes);
    await saveDestacadosJSON(destacadosForm);

    res.redirect('/admin/panel');
  } catch (error) {
    console.error('Error procesando formulario o guardando en Gist:', error);
    res.status(400).send('Error en los datos: ' + error.message);
  }
});

module.exports = router;
