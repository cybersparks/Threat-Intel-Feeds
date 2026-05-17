// update-feed.js
const Parser = require('rss-parser');
const fs = require('fs');

// 🔒 CONFIGURATION: Two separate feeds
const HIBP_FEEDS = [
  { 
    name: 'Have I Been Pwned', 
    url: 'https://haveibeenpwned.com/feed/breaches/' 
  }
];

// 🚨 RANSOMWARE FEEDS (Using The Hacker News + RansomLook RSS if available)
// If a direct RansomLook RSS isn't public, we use The Hacker News filtered by 'ransomware'
const RANSOMWARE_FEEDS = [
  { 
    name: 'Ransomware Live (Ransomware)', 
    url: 'https://www.ransomware.live/rss' 
    // Note: We will filter for "ransomware" in the title/description below
  }
  // You can add specific RansomLook RSS if you find a public one, e.g., 'https://ransomlook.io/rss'
];

const parser = new Parser({
    customHeaders: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
});

// Helper to extract count numbers
function extractBreachCount(text) {
  if (!text) return "N/A";
  const match = text.match(/(\d{1,3}(?:,\d{3})*|\d+(?:\.\d+)?)\s*(?:k|K|million|billion)?/i);
  if (match) return match;
  return "N/A";
}

// Helper to clean title for HIBP
function cleanTitle(title) {
  return title.replace(/^(Breach of|Exposed|Data leak|Leaked|Hacked|\[Breach\]|\[Incident\])\s+/i, '').trim();
}

// Helper to detect if it's a ransomware article
function isRansomware(item) {
  const text = (item.title + " " + (item.contentSnippet || item.description)).toLowerCase();
  return text.includes('ransomware') || text.includes('ransom') || text.includes('extortion');
}

async function run() {
  let hibpBreaches = [];
  let ransomwareNews = [];

  try {
    // 1. Fetch HIBP Breaches
    console.log(`Fetching HIBP Breach data...`);
    const hibpPromises = HIBP_FEEDS.map(async (feed) => {
      try {
        const result = await parser.parseURL(feed.url);
        return result.items.map(item => {
          const rawCount = extractBreachCount(item.title + " " + (item.contentSnippet || item.description));
          return {
            title: cleanTitle(item.title),
            link: item.link,
            pubDate: item.pubDate,
            summary: item.contentSnippet ? item.contentSnippet.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." : "See HIBP",
            source: feed.name,
            breachCount: rawCount,
            isBreach: true,
            isRansomware: false
          };
        });
      } catch (err) {
        console.error(`HIBP Fetch Error:`, err.message);
        return [];
      }
    });
    const hibpResults = await Promise.all(hibpPromises);
    hibpBreaches = hibpResults.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 50);

    // 2. Fetch Ransomware News
    console.log(`Fetching Ransomware News...`);
    const ransomPromises = RANSOMWARE_FEEDS.map(async (feed) => {
      try {
        const result = await parser.parseURL(feed.url);
        return result.items
          .filter(item => isRansomware(item)) // Filter for ransomware keywords
          .map(item => {
            return {
              title: item.title,
              link: item.link,
              pubDate: item.pubDate,
              // Full summary (up to 300 chars)
              summary: item.contentSnippet ? item.contentSnippet.replace(/<[^>]*>?/gm, '').substring(0, 300) + "..." : "See source",
              source: feed.name,
              breachCount: "N/A",
              isBreach: false,
              isRansomware: true
            };
          });
      } catch (err) {
        console.error(`Ransomware Fetch Error:`, err.message);
        return [];
      }
    });
    const ransomResults = await Promise.all(ransomPromises);
    ransomwareNews = ransomResults.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 30); // Limit to last 30

    // Combine into a single JSON structure with two arrays
    const output = {
      lastUpdated: new Date().toISOString(),
      sourceName: "HIBP + Ransomware Intel",
      breaches: hibpBreaches,      // For the first table
      ransomware: ransomwareNews   // For the second table
    };

    fs.writeFileSync('threat-data.json', JSON.stringify(output, null, 2));
    console.log(`✅ Successfully updated threat-data.json with ${hibpBreaches.length} breaches and ${ransomwareNews.length} ransomware news items.`);
    
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

run();