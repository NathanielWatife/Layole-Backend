require('dotenv').config();
const connectDB = require('../config/db');
const Blog = require('../models/Article');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');

// Fetch from CDC API
const fetchFromCDC = async () => {
  try {
    const response = await axios.get('https://emergency.cdc.gov/han/api/han.aspx?format=json');
    return response.data.map(item => ({
      title: item.title,
      content: item.summary,
      source: 'CDC Health Alert',
      sourceUrl: item.link,
      tags: ['public-health'],
      publishDate: new Date()
    }));
  } catch (error) {
    console.error('CDC fetch error:', error.message);
    return [];
  }
};

// Fetch from WHO RSS
const fetchFromWHO = async () => {
  try {
    const response = await axios.get('https://www.who.int/feeds/entity/csr/don/en/rss.xml');
    const parsed = await parseStringPromise(response.data);
    return parsed.rss.channel[0].item.map(item => ({
      title: item.title[0],
      content: item.description[0],
      source: 'WHO Outbreak News',
      sourceUrl: item.link[0],
      tags: ['outbreak', 'global-health'],
      publishDate: new Date(item.pubDate[0])
    }));
  } catch (error) {
    console.error('WHO fetch error:', error.message);
    return [];
  }
};

// Main function
const fetchAndStoreArticles = async () => {
  try {
    // Connect to DB using your existing config
    await connectDB();
    console.log('Database connection established');

    // Fetch articles from both sources
    const [cdcArticles, whoArticles] = await Promise.all([
      fetchFromCDC(),
      fetchFromWHO()
    ]);

    const allArticles = [...cdcArticles, ...whoArticles];
    
    if (allArticles.length === 0) {
      console.log('No new articles found');
      return;
    }

    // Insert new articles (prevent duplicates)
    const result = await Blog.insertMany(allArticles, { ordered: false });
    console.log(`Successfully stored ${result.length} new articles`);

  } catch (error) {
    // Handle duplicate key errors silently
    if (error.code === 11000) {
      console.log('Some articles already exist in database');
    } else {
      console.error('Error:', error.message);
    }
  } finally {
    // Close connection
    mongoose.disconnect();
    process.exit(0);
  }
};

// Execute
fetchAndStoreArticles();