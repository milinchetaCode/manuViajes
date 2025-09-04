const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary'); // your cloudinary config

// No need for a static folders object, just use the folder from req.body.folder
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: req.body.folder, // this will come from the form's hidden input
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  })
});
const parser = multer({ storage });

// Gallery page
router.get('/fotos', async (req, res, next) => {
  try {
    const fetchFolder = async folder => {
      const result = await cloudinary.search
        .expression(`folder:${folder}`)
        .sort_by('public_id', 'desc')
        .max_results(50)
        .execute();
      return result.resources;
    };

    const paquetesImages = await fetchFolder('ManuFigueroaViajes/Packs');
    const sliderImages = await fetchFolder('ManuFigueroaViajes/HeroSlider');

    res.render('fotos', { paquetesImages, sliderImages });
  } catch (err) {
    next(err);
  }
});

// Upload
router.post('/fotos/upload', parser.single('image'), (req, res) => {
  res.redirect('/fotos');
});

// Delete
router.post('/fotos/delete', async (req, res, next) => {
  try {
    await cloudinary.uploader.destroy(req.body.public_id);
    res.redirect('/fotos');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
