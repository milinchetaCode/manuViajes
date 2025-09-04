const express = require('express');
const router = express.Router();
const { getTenisEventsByYear } = require('../api'); // tu función que devuelve array plano

router.get('/tenis', async (req, res) => {
  try {
    const events = await getTenisEventsByYear(); // devuelve array plano
    console.log('Eventos tenis:', events); // debug
    res.render('tenis', { events }); // enviamos 'events' a la plantilla
  } catch (err) {
    console.error('Error al obtener eventos Tenis:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
