const express = require('express');
const router = express.Router();
const { getBasketEventsByYear } = require('../api'); // tu función que devuelve array plano

router.get('/basket', async (req, res) => {
  try {
    const events = await getBasketEventsByYear(); // devuelve array plano
    console.log('Eventos Basket:', events); // debug
    res.render('basket', { events }); // enviamos 'events' a la plantilla
  } catch (err) {
    console.error('Error al obtener eventos Basket:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
