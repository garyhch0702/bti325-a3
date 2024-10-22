/*********************************************************************************
* BTI325 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Chenghao Hu Student ID: 149773228 Date: 2024/10/25
*
* Online (Vercel) URL: [bti325-a3-bvtkcumkc-garyhus-projects.vercel.app]
********************************************************************************/

const express = require('express');
const path = require('path');
const blogService = require('./blog-service');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const app = express();
const PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const upload = multer();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/about');
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/posts/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'addPost.html'));
});

app.post('/posts/add', upload.single('featureImage'), (req, res) => {
  if (!req.file) {
    req.body.featureImage = null;
    blogService.addPost(req.body).then(() => {
      res.redirect('/posts');
    }).catch((err) => {
      res.status(500).send("Error adding post: " + err);
    });
  } else {
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
      return await streamUpload(req);
    }

    upload(req).then((uploaded) => {
      req.body.featureImage = uploaded.url;
      blogService.addPost(req.body).then(() => {
        res.redirect('/posts');
      }).catch((err) => {
        res.status(500).send("Error adding post: " + err);
      });
    }).catch((err) => {
      res.status(500).send("Cloudinary upload failed: " + err);
    });
  }
});

app.get('/blog', (req, res) => {
  blogService.getPublishedPosts()
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ message: err }));
});

app.get('/categories', (req, res) => {
  blogService.getCategories()
    .then(categories => res.json(categories))
    .catch(err => res.status(404).json({ message: err }));
});

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

app.get('/posts/:id', (req, res) => {
  blogService.getPostById(req.params.id)
    .then((post) => res.json(post))
    .catch((err) => res.status(404).json({ message: err }));
});

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

blogService.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Express http server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to initialize blog service: ${err}`);
  });
