const express = require('express');
const router = express.Router();
const { getEventDetails } = require('../api');

router.get('/:id', async (req, res) => {
  const eventId = req.params.id;
  const event = await getEventDetails(eventId);

  if (!event) {
    return res.status(404).send('Evento no encontrado');
  }

 res.render('event', {
  event,
  currentPage: null // or '' or 'event' if you want to underline a nav item
});
});

module.exports = router;
