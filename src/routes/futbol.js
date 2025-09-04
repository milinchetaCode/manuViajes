const express = require('express');
const router = express.Router();
const { getFutbolEventsByYear } = require('../api'); // tu función que devuelve array plano

router.get('/futbol', async (req, res) => {
  try {
    const events = await getFutbolEventsByYear(); // devuelve array plano
    console.log('Eventos Fútbol:', events); // debug
    res.render('futbol', { events }); // enviamos 'events' a la plantilla
  } catch (err) {
    console.error('Error al obtener eventos Fútbol:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
