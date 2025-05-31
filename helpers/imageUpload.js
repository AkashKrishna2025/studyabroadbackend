const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
const router = express.Router();

// Configure AWS SDK
const spacesEndpoint = new AWS.Endpoint('blr1.digitaloceanspaces.com');

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO00UX3ZQ8R8DECJTVVB',
  secretAccessKey: 'QNsIj80d2tidpTBpyb0sj9d9j4a5yqS1ldnWzjqpm5g',
  s3ForcePathStyle: true
});

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const params = {
    Bucket: 'edulley', // Your Space name
    Key: `uploads/${Date.now()}-${req.file.originalname}`,
    Body: req.file.buffer,
    ACL: 'public-read'
  };

  try {
    const result = await s3.upload(params).promise();
    res.json({ url: result.Location });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file');
  }
});

module.exports = router;