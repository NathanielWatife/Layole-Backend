require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');
const { createSlug } = require('../utils/helpers');

const CDC_API = 'https://emergency.cdc.gov/han/api/han.aspx?format=json';

async function fetchCDCArticles() {
  try {
    const { data } = await axios.get(CDC_API);
    const latestAlert = data[0]; // Get most recent alert
    
    await Article.updateOne(
      { sourceUrl: latestAlert.link },
      {
        title: latestAlert.title,
        content: latestAlert.summary,
        source: 'CDC Health Alert',
        sourceUrl: latestAlert.link,
        tags: ['public-health'],
        isApproved: true
      },
      { upsert: true }
    );
    
    console.log('CDC article updated:', latestAlert.title);
  } catch (err) {
    console.error('CDC fetch error:', err.message);
  }
}

// Run daily at 9AM
async function run() {
  await fetchCDCArticles();
  // Add WHO fetcher here later
}

// Immediate test run
run().then(() => process.exit());