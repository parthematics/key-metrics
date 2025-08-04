# key metrics

A Chrome extension that replaces your new tab page with a custom dashboard displaying key revenue & user metrics from the your API.

## Features

- **Real-time Metrics**: Displays active users, MRR, subscriptions, trials, revenue, and user creation data
- **MRR Tracking**: Visual ASCII chart showing MRR trends over time
- **Auto-refresh**: Updates metrics every 5 minutes automatically
- **Dark Terminal Theme**: Clean, terminal-inspired design with monospace fonts
- **Key Insights**: Shows business insights and metric summaries
- **Responsive Layout**: Scales to any screen width
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
   - You should see your key metrics dashboard

## Dashboard Metrics

The dashboard displays the following metrics from your API:

- **Active Users**: Total number of active users on the platform
- **Monthly Recurring Revenue (MRR)**: Current monthly recurring revenue in USD
- **Active Subscriptions**: Number of active paying subscriptions
- **Active Trials**: Number of current trial users
- **New Customers**: Number of new customers acquired in the past month
- **Revenue (Past Month)**: Total revenue generated in the past month
- **Users Created Today**: Number of new users registered today
- **Users Created (Last Hour)**: Number of users who signed up in the last hour
- **Business Overview**: Visual MRR trend chart showing hourly changes
- **Key Insights**: Real-time business insights and growth indicators

## Configuration

The extension is pre-configured with your API endpoint. If you need to modify settings:

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

The extension expects data in this format from your API endpoint:

```json
{
  "active_trials": 15,
  "active_subscriptions": 245,
  "mrr": 12450,
  "revenue": 15680,
  "new_customers": 28,
  "active_users": 1250,
  "users_created_today": 1815,
  "users_created_in_last_hour": 112
}
```

### New Fields

- `users_created_today`: Integer representing the number of users who signed up today
- `users_created_in_last_hour`: Integer representing the number of users who registered in the last hour

These new metrics help track user acquisition velocity and real-time growth patterns.
