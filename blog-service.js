const fs = require('fs');

// Global arrays to hold posts and categories
let posts = [];
let categories = [];

// Initialize function to read the JSON files
function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/posts.json', 'utf8', (err, data) => {
      if (err) {
        reject('Unable to read posts file');
      } else {
        posts = JSON.parse(data);

        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
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

// Function to add a new post
function addPost(postData) {
  return new Promise((resolve, reject) => {
    postData.published = postData.published ? true : false;
    postData.id = posts.length + 1;
    postData.postDate = new Date().toISOString().split('T')[0]; // Add current date
    posts.push(postData);
    resolve(postData);
  });
}

// Function to get all posts
function getAllPosts() {
  return new Promise((resolve, reject) => {
    if (posts.length > 0) {
      resolve(posts);
    } else {
      reject('No posts found');
    }
  });
}

// Function to get posts by category
function getPostsByCategory(category) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => post.category == category);
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject('No posts found for this category');
    }
  });
}

// Function to get posts by minDate
function getPostsByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const filteredPosts = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr));
    if (filteredPosts.length > 0) {
      resolve(filteredPosts);
    } else {
      reject('No posts found after the given date');
    }
  });
}

// Function to get a post by ID
function getPostById(id) {
  return new Promise((resolve, reject) => {
    const post = posts.find(post => post.id == id);
    if (post) {
      resolve(post);
    } else {
      reject('No post found with this ID');
    }
  });
}

module.exports = {
  initialize,
  addPost,
  getAllPosts,
  getPostsByCategory,
  getPostsByMinDate,
  getPostById
};
