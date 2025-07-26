const mongoose = require('mongoose');

const blogUserDbUri = process.env.BLOG_USER_DB_URI;
const blogUserConnection = mongoose.createConnection(blogUserDbUri);

blogUserConnection.on('connected', () => {
  console.log('Blog database Connected');
});

blogUserConnection.on('error', (err) => {
  console.error('Blog database connection error:', err);
});

module.exports = blogUserConnection;
