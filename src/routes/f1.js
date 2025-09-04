const express = require('express');
const router = express.Router();
const { getF1EventsByYear } = require('../api');

router.get('/f1', async (req, res) => {
  try {
    const events = await getF1EventsByYear(); // devuelve array plano
    res.render('f1', { events }); // enviamos 'events' en vez de 'eventsByYear'
  } catch (err) {
    console.error('Error al obtener eventos F1:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
