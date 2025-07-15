const mongoose = require('mongoose');

const blogUserDbUri = process.env.BLOG_USER_DB_URI; // Add this to your .env

const blogUserConnection = mongoose.createConnection(blogUserDbUri);

blogUserConnection.on('connected', () => {
  console.log('Connected to Blog/User MongoDB database');
});

blogUserConnection.on('error', (err) => {
  console.error('Blog/User MongoDB connection error:', err);
});

module.exports = blogUserConnection;
