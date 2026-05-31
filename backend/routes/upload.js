const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/photo', authenticate, authorize('admin'), (req, res) => {
  if (process.env.VERCEL) {
    return res.status(400).json({ error: 'Photo upload is not available on serverless deployment. Use photo URL instead, or run locally.' });
  }

  const multer = require('multer');
  const path = require('path');
  const fs = require('fs');

  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.includes(ext)) cb(null, true);
      else cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
    },
  });

  upload.single('photo')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message || 'Upload failed' });
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  });
});

router.post('/photo-base64', authenticate, authorize('admin'), async (req, res) => {
  if (process.env.VERCEL) {
    return res.status(400).json({ error: 'Photo upload is not available on serverless deployment.' });
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const { filename, data } = req.body;
    if (!data) return res.status(400).json({ error: 'No image data provided' });
    const matches = data.match(/^data:image\/(jpeg|png|gif|webp);base64,(.+)$/);
    if (!matches) return res.status(400).json({ error: 'Invalid image data format' });
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const name = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, name), buffer);
    res.json({ url: `/uploads/${name}`, filename: name });
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;