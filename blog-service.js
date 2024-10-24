const fs = require('fs');
const path = require('path');

let posts = [];
let categories = [];

function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'data', 'posts.json'), 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read posts file');
      } else {
        posts = JSON.parse(data);

        fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
          if (err) {
            reject('Unable to read categories file');
          } else {
            categories = JSON.parse(data);
            resolve();
          }
        });
      }
    });
  });
}

function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    postData.id = posts.length + 1;
    postData.postDate = new Date().toISOString().split('T')[0]; // Add current date
    posts.push(postData);
    resolve(postData);
  });
}

function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject('No posts found');
    }
  });
}

function getPublishedPosts() {
  return new Promise((resolve, reject) => {
    const publishedPosts = posts.filter(post => post.published === true);
    if (publishedPosts.length > 0) {
      resolve(publishedPosts);
    } else {
      reject('No published posts found');
    }
  });
}

function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => post.category == category);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("No posts found for category: " + category);
    }
  });
}

function getPostsByMinDate(minDate) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDate));
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject("No posts found after date: " + minDate);
    }
  });
}

function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find(post => post.id == id);
    if (post) {
      resolve(post);
    } else {
      reject("Post not found for ID: " + id);
    }
  });
}

function getCategories() {
  return new Promise((resolve, reject) => {
    if (categories.length > 0) {
      resolve(categories);
    } else {
      reject('No categories found');
    }
  });
}

module.exports = {
  initialize,
  addPost,
  getAllPosts,
  getPublishedPosts,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById,
  getCategories // Export getCategories
};
