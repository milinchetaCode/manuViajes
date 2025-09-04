const express = require('express');
const router = express.Router();
const { getEventDetails } = require('../api');

router.get('/:id', async (req, res) => {
  const event = await getEventDetails(req.params.id);
  res.render('purchase', { event });
});

router.post('/', (req, res) => {
  const { eventId, name } = req.body;
  res.render('confirm', { eventId, name });
});

module.exports = router;