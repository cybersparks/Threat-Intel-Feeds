# 🛡️ Live Threat Intelligence Dashboard

A serverless, automated threat intelligence dashboard hosted on **GitHub Pages**. This project automatically fetches the latest security news and threat feeds from RSS sources, processes them, and displays them on a clean, real-time web interface.

## ✨ Features

- **Fully Automated**: Updates every 5 minutes without human intervention.
- **Serverless**: Runs entirely on GitHub Actions and GitHub Pages (Zero hosting costs).
- **Real-Time Feel**: The browser polls for new data every 10 seconds, giving a "live" experience.
- **Dark Mode UI**: Modern, responsive design optimized for security monitoring.
- **Extensible**: Easily swap RSS sources or add new data fields.

 **Website**:
    - Dashboard live at: `https://cybersparks.github.io/Threat-Intel-Feeds//`

## 🏗️ How It Works

1.  **The Source**: The system monitors an RSS feed (e.g., CISA, The Hacker News, etc.).
2.  **The Automation**: A **GitHub Action** (`rss-sync.yml`) runs on a schedule (every 5 minutes).
    - It spins up a temporary Node.js environment.
    - It fetches the latest items from the RSS feed.
    - It cleans and formats the data into a JSON file (`threat-data.json`).
    - It commits the new JSON file back to the repository.
3.  **The Display**: The static website (`index.html`) automatically detects the new JSON file.
    - It fetches the data on page load.
    - It renders the threats as cards with titles, summaries, and tags.
    - It auto-refreshes the data every 10 seconds without reloading the page.

## 🚀 Getting Started

### Prerequisites
- A GitHub Account.
- The repository must be **Public** (required for free GitHub Pages).

### Installation
1.  **Clone the repository** or fork this project.
2.  **Configure the RSS Feed**:
    - Open `update-feed.js`.
    - Locate the `RSS_URL` constant and replace it with your desired feed:
      ```javascript
      const RSS_URL = 'https://www.cisa.gov/news-events/cybersecurity-events.atom'; // Example
      ```
3.  **Trigger the First Run**:
    - Go to the **Actions** tab in GitHub.
    - Select **Sync RSS to JSON**.
    - Click **Run workflow**.
4.  **Enable GitHub Pages**:
    - Go to **Settings > Pages**.
    - Set Source to **Deploy from a branch** > **main** (or master) > **Root (/)**.
    - Save and wait 2–3 minutes for the site to build.


## ⚙️ Configuration

### Changing the Update Frequency
The default schedule is every **5 minutes** (the fastest allowed on the free tier).
To change this, edit `.github/workflows/rss-sync.yml`:
```yaml
schedule:
  - cron: '0 */15 * * *' # Change to every 15 minutes