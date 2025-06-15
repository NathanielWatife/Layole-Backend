const cron = require('node-cron');
const { exec } = require('child_process');

// Run daily at 9AM
cron.schedule('0 9 * * *', () => {
  exec('node scripts/fetch-articles.js', (err, stdout, stderr) => {
    if (err) console.error('Fetch failed:', err);
    else console.log('Articles updated:', stdout);
  });
});

console.log('Article fetcher scheduled to run daily at 9AM');