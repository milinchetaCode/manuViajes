const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinary'); // make sure your cloudinary config exists

const folders = { tab1: 'folder1', tab2: 'folder2' };

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: folders[req.body.tab],
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif']
  })
});
const parser = multer({ storage });

// Gallery page
router.get('/gallery', async (req, res) => {
  const fetchFolder = async folder => {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('public_id', 'desc')
      .max_results(50)
      .execute();
    return result.resources;
  };

  const tab1Images = await fetchFolder(folders.tab1);
  const tab2Images = await fetchFolder(folders.tab2);

  res.render('gallery', { tab1Images, tab2Images });
});

// Upload
router.post('/gallery/upload', parser.single('image'), (req, res) => {
  res.redirect('/gallery');
});

// Delete
router.post('/gallery/delete', async (req, res) => {
  await cloudinary.uploader.destroy(req.body.public_id);
  res.redirect('/gallery');
});

module.exports = router;
