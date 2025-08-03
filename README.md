# Candle Metrics Chrome Extension

A Chrome extension that replaces your new tab page with a custom dashboard displaying key metrics from the Candle API.

## Features

- **Real-time Metrics**: Displays active users, MRR, subscriptions, trials, and revenue data
- **Auto-refresh**: Updates metrics every 5 minutes automatically
- **Clean Design**: Modern, responsive dashboard with glass-morphism design
- **Key Insights**: Shows business insights and metric summaries
- **Error Handling**: Graceful error handling with retry functionality

## Installation

1. **Download the Extension Files**
   - Save all files (`manifest.json`, `newtab.html`, `styles.css`, `dashboard.js`) to a folder on your computer

2. **Load Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked" and select your extension folder
   - The extension should now be active

3. **Test the Extension**
   - Open a new tab in Chrome
   - You should see your Candle metrics dashboard

## Dashboard Metrics

The dashboard displays the following metrics from your Candle API:

- **Active Users**: Total number of active users on the platform
- **Monthly Recurring Revenue (MRR)**: Current monthly recurring revenue in USD
- **Active Subscriptions**: Number of active paying subscriptions
- **Active Trials**: Number of current trial users
- **New Customers**: Number of new customers acquired in the past month
- **Revenue (Past Month)**: Total revenue generated in the past month

## Configuration

The extension is pre-configured with your Candle API endpoint. If you need to modify settings:

1. Click the settings gear icon (⚙️) in the bottom right of the dashboard
2. Update API URL, API key, or refresh interval as needed
3. Click "Save" to apply changes

## Customization

You can customize the dashboard by editing the files:

- `styles.css`: Modify colors, layout, and styling
- `newtab.html`: Change the structure and add/remove metric cards
- `dashboard.js`: Modify data processing and add new features

## Troubleshooting

- **No data showing**: Check that your API is accessible and returning data
- **Extension not loading**: Ensure all files are in the same directory and manifest.json is valid
- **Metrics not updating**: Check the browser console (F12) for any error messages

## API Data Format

The extension expects data in this format from the Candle API:

```json
{
  "active_trials": 15,
  "active_subscriptions": 245,
  "mrr": 12450,
  "revenue": 15680,
  "new_customers": 28,
  "active_users": 1250
}
```