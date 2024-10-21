/*********************************************************************************
* BTI325 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Chenghao Hu Student ID: 149773228 Date: 2024/10/25
*
* Online (Vercel) URL: [Insert Vercel URL]
********************************************************************************/

const express = require('express');
const path = require('path');
const blogService = require('./blog-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const app = express();
const PORT = process.env.PORT || 8080;

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'do8toktki',
  api_key: '442976841246212',
  api_secret: 'h3Ivzcjr-NkacclHRFO3zULtOH0',
  secure: true
});

const upload = multer(); // no { storage: storage } since we are not using disk storage

// Serve static files from 'public' folder
app.use(express.static('public'));

// Redirect root to /about
app.get('/', (req, res) => {
  res.redirect('/about');
});

// Serve the about.html file
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Serve the addPost.html file
app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addPost.html'));
});

// POST route to handle adding new blog posts
app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let stream = cloudinary.uploader.upload_stream((error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      });
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  };

  async function upload(req) {
    let result = await streamUpload(req);
    return result;
  }

  upload(req).then((uploaded) => {
    req.body.featureImage = uploaded.url;
    blogService.addPost(req.body).then(() => {
      res.redirect('/posts');
    });
  }).catch((err) => {
    res.status(500).send("Unable to upload image or add post.");
  });
});

// Serve all posts or filter by category or minDate
app.get('/posts', (req, res) => {
  if (req.query.category) {
    blogService.getPostsByCategory(req.query.category)
      .then((posts) => res.json(posts))
      .catch((err) => res.status(404).json({ message: err }));
  } else if (req.query.minDate) {
    blogService.getPostsByMinDate(req.query.minDate)
      .then((posts) => res.json(posts))
      .catch((err) => res.status(404).json({ message: err }));
  } else {
    blogService.getAllPosts()
      .then((posts) => res.json(posts))
      .catch((err) => res.status(404).json({ message: err }));
  }
});

// Get a specific post by ID
app.get('/posts/:id', (req, res) => {
  blogService.getPostById(req.params.id)
    .then((post) => res.json(post))
    .catch((err) => res.status(404).json({ message: err }));
});

// 404 Page Not Found route
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// Initialize blog-service and start the server
blogService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to initialize blog service: ${err}`);
  });
