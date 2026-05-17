// update-feed.js
const Parser = require('rss-parser');
const fs = require('fs');

// Your target URL (The Hacker News)
const RSS_URL = 'https://feeds.feedburner.com/TheHackersNews'; 

// Configure the parser ONCE with the User-Agent header
const parser = new Parser({
    customHeaders: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

async function run() {
  try {
    console.log(`Fetching feed from ${RSS_URL}...`);
    
    // USE the parser defined above (do NOT create a new one here)
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
    // Log specific status if available
    if (error.response && error.response.status) {
        console.error(`Server returned status: ${error.response.status}`);
    }
    process.exit(1); // Fail the action so you know something went wrong
  }
}

run();