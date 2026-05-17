// update-feed.js
const Parser = require('rss-parser');
const fs = require('fs');

// REPLACE THIS with your actual RSS Feed URL
// Example: 'https://www.cisa.gov/news-events/cybersecurity-events.atom'
// https://haveibeenpwned.com/feed/breaches/
// https://blog.google/threat-analysis-group/rss/
// const RSS_URL = 'YOUR_RSS_FEED_URL_HERE'; 
const RSS_URL = 'https://haveibeenpwned.com/feed/breaches/'; 
async function run() {
  const parser = new Parser();

  try {
    console.log(`Fetching feed from ${RSS_URL}...`);
    const feed = await parser.parseURL(RSS_URL);

    // Transform data for your static site
    const output = {
      lastUpdated: new Date().toISOString(),
      feedTitle: feed.title,
      threats: feed.items.slice(0, 20).map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        summary: item.contentSnippet ? item.contentSnippet.replace(/<[^>]*>?/gm, '') : '', // Strip HTML tags
        categories: item.categories || [],
        guid: item.guid
      }))
    };

    // Write to JSON file
    fs.writeFileSync('threat-data.json', JSON.stringify(output, null, 2));
    console.log('Successfully updated threat-data.json');
    
  } catch (error) {
    console.error('Error fetching RSS:', error);
    process.exit(1); // Fail the action so you know something went wrong
  }
}

run();