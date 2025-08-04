class MetricsDashboard {
  constructor() {
    this.apiUrl = "";
    this.apiKey = "";
    this.refreshInterval = 5;
    this.refreshTimer = null;
    this.mrrHistoryKey = "mrrHistory";
    this.lastFetchKey = "lastFetchTime";
    this.cachedDataKey = "cachedMetricsData";
    this.refreshThrottle = 10000;

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();

    if (this.apiUrl) {
      this.loadMetrics();
      this.startAutoRefresh();
    } else {
      this.hideLoading();
      this.showSettings();
    }
  }

  setupEventListeners() {
    document.getElementById("settingsButton").addEventListener("click", () => {
      this.showSettings();
    });

    document.getElementById("saveSettings").addEventListener("click", () => {
      this.saveSettings();
    });

    document.getElementById("cancelSettings").addEventListener("click", () => {
      this.hideSettings();
    });

    document.getElementById("retryButton").addEventListener("click", () => {
      this.loadMetrics();
    });

    document.getElementById("settingsModal").addEventListener("click", (e) => {
      if (e.target.id === "settingsModal") {
        this.hideSettings();
      }
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        "apiUrl",
        "apiKey",
        "refreshInterval",
      ]);
      this.apiUrl = result.apiUrl || "";
      this.apiKey = result.apiKey || "";
      this.refreshInterval = result.refreshInterval || 5;

      document.getElementById("apiUrl").value = this.apiUrl;
      document.getElementById("apiKey").value = this.apiKey;
      document.getElementById("refreshInterval").value = this.refreshInterval;
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  async saveSettings() {
    const apiUrl = document.getElementById("apiUrl").value.trim();
    const apiKey = document.getElementById("apiKey").value.trim();
    const refreshInterval =
      parseInt(document.getElementById("refreshInterval").value) || 5;

    if (!apiUrl) {
      alert("Please enter a valid API URL");
      return;
    }

    try {
      await chrome.storage.sync.set({
        apiUrl: apiUrl,
        apiKey: apiKey,
        refreshInterval: refreshInterval,
      });

      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
      this.refreshInterval = refreshInterval;

      this.hideSettings();
      this.loadMetrics();
      this.startAutoRefresh();
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    }
  }

  showSettings() {
    document.getElementById("settingsModal").style.display = "flex";
  }

  hideSettings() {
    document.getElementById("settingsModal").style.display = "none";
  }

  showLoading() {
    document.getElementById("loadingOverlay").style.display = "flex";
  }

  hideLoading() {
    document.getElementById("loadingOverlay").style.display = "none";
  }

  showError() {
    document.getElementById("errorMessage").style.display = "block";
  }

  hideError() {
    document.getElementById("errorMessage").style.display = "none";
  }

  async loadMetrics() {
    if (!this.apiUrl) {
      this.hideLoading();
      return;
    }

    const now = Date.now();
    const lastFetchTime = localStorage.getItem(this.lastFetchKey);
    const timeSinceLastFetch =
      now - (lastFetchTime ? parseInt(lastFetchTime) : 0);

    if (lastFetchTime && timeSinceLastFetch < this.refreshThrottle) {
      const cachedData = localStorage.getItem(this.cachedDataKey);
      if (cachedData) {
        try {
          const data = JSON.parse(cachedData);
          this.updateDashboard(data);
          this.updateLastUpdated(parseInt(lastFetchTime));
          this.showCacheIndicator();
          this.hideLoading();
          this.hideError();
          return;
        } catch (error) {
          console.error("Error parsing cached data:", error);
        }
      }
    }

    this.showLoading();
    this.hideError();

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (this.apiKey) {
        headers["Authorization"] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      localStorage.setItem(this.cachedDataKey, JSON.stringify(data));
      localStorage.setItem(this.lastFetchKey, now.toString());

      this.updateDashboard(data);
      this.updateLastUpdated();
      this.hideCacheIndicator();
      this.hideLoading();
    } catch (error) {
      console.error("Error fetching metrics:", error);
      this.hideLoading();
      this.showError();
    }
  }

  updateDashboard(data) {
    this.updateMetric("totalUsers", data.active_users || 0);
    this.updateMetric("revenue", data.mrr || 0, "$");
    this.updateMetric("activeSessions", data.active_subscriptions || 0);
    this.updateMetric("conversionRate", data.active_trials || 0);
    this.updateMetric("newCustomers", data.new_customers || 0);
    this.updateMetric("monthlyRevenue", data.revenue || 0, "$");
    this.updateMetric("usersCreatedToday", data.users_created_today || 0);
    this.updateMetric(
      "usersCreatedLastHour",
      data.users_created_in_last_hour || 0
    );

    this.storeMRRData(data.mrr || 0);

    this.updateMetricDisplay("usersChange", "Total Active");
    this.updateMetricDisplay("revenueChange", "Monthly Recurring");
    this.updateMetricDisplay("sessionsChange", "Current Active");
    this.updateMetricDisplay("conversionChange", "Current Trials");
    this.updateMetricDisplay("newCustomersChange", "Past Month");
    this.updateMetricDisplay("monthlyRevenueChange", "Past Month");
    this.updateMetricDisplay("usersCreatedTodayChange", "Today");
    this.updateMetricDisplay("usersCreatedLastHourChange", "Last Hour");

    const insights = [
      {
        description: `${
          data.active_users || 0
        } users are actively using the platform`,
        timestamp: new Date(),
      },
      {
        description: `$${(
          data.mrr || 0
        ).toLocaleString()} in monthly recurring revenue`,
        timestamp: new Date(),
      },
      {
        description: `${data.users_created_today || 0} new users created today`,
        timestamp: new Date(),
      },
      {
        description: `${
          data.users_created_in_last_hour || 0
        } users registered in the last hour`,
        timestamp: new Date(),
      },
      {
        description: `${
          data.active_subscriptions || 0
        } active subscriptions generating revenue`,
        timestamp: new Date(),
      },
    ];
    this.updateActivityList(insights);

    this.updateMRRChart();
  }

  updateMetric(elementId, value, prefix = "", suffix = "") {
    const element = document.getElementById(elementId);
    if (element) {
      let formattedValue = value;

      if (typeof value === "number") {
        if (value >= 1000000) {
          formattedValue = (value / 1000000).toFixed(1) + "M";
        } else {
          formattedValue = value.toLocaleString();
        }
      }

      element.textContent = `${prefix}${formattedValue}${suffix}`;
    }
  }

  updateMetricChange(elementId, change) {
    const element = document.getElementById(elementId);
    if (element && typeof change === "number") {
      const sign = change > 0 ? "+" : "";
      const percentage = change.toFixed(1);
      element.textContent = `${sign}${percentage}%`;

      element.className = "metric-change";
      if (change > 0) {
        element.classList.add("positive");
      } else if (change < 0) {
        element.classList.add("negative");
      } else {
        element.classList.add("neutral");
      }
    }
  }

  updateMetricDisplay(elementId, label) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = label;
      element.className = "metric-change neutral";
    }
  }

  updateActivityList(activities) {
    const activityList = document.getElementById("activityList");
    if (!activityList) return;

    if (!activities || activities.length === 0) {
      activityList.innerHTML =
        '<div class="activity-placeholder">No recent activity</div>';
      return;
    }

    const activityHTML = activities
      .slice(0, 5)
      .map(
        (activity) => `
            <div class="activity-item">
                <div>${
                  activity.description || activity.message || "Activity"
                }</div>
                <div class="activity-time">${this.formatTime(
                  activity.timestamp || activity.time
                )}</div>
            </div>
        `
      )
      .join("");

    activityList.innerHTML = activityHTML;
  }

  storeMRRData(mrrValue) {
    try {
      const now = new Date();
      const currentHour = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours()
      );

      const existingData = localStorage.getItem(this.mrrHistoryKey);
      let mrrHistory = existingData ? JSON.parse(existingData) : [];

      const existingEntryIndex = mrrHistory.findIndex(
        (entry) => new Date(entry.timestamp).getTime() === currentHour.getTime()
      );

      if (existingEntryIndex >= 0) {
        mrrHistory[existingEntryIndex].value = mrrValue;
      } else {
        mrrHistory.push({
          timestamp: currentHour.toISOString(),
          value: mrrValue,
        });
      }

      const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      mrrHistory = mrrHistory.filter(
        (entry) => new Date(entry.timestamp) >= cutoffTime
      );

      mrrHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      localStorage.setItem(this.mrrHistoryKey, JSON.stringify(mrrHistory));
    } catch (error) {
      console.error("Error storing MRR data:", error);
    }
  }

  updateMRRChart() {
    const chartElement = document.getElementById("performanceChart");
    if (!chartElement) return;

    try {
      const existingData = localStorage.getItem(this.mrrHistoryKey);
      const mrrHistory = existingData ? JSON.parse(existingData) : [];

      if (mrrHistory.length === 0) {
        chartElement.innerHTML =
          '<div class="chart-placeholder">No MRR history available yet</div>';
        return;
      }

      const latest = mrrHistory[mrrHistory.length - 1];
      const oldest = mrrHistory[0];
      const change = latest.value - oldest.value;
      const changePercent =
        oldest.value > 0 ? ((change / oldest.value) * 100).toFixed(1) : 0;

      const maxValue = Math.max(...mrrHistory.map((entry) => entry.value));
      const minValue = Math.min(...mrrHistory.map((entry) => entry.value));
      const range = maxValue - minValue;

      const chartData = mrrHistory.slice(-12);
      const chartHeight = 8;

      let chartLines = [];

      for (let row = chartHeight - 1; row >= 0; row--) {
        let line = "";
        for (let i = 0; i < chartData.length; i++) {
          const value = chartData[i].value;
          const normalizedValue = range > 0 ? (value - minValue) / range : 0.5;
          const barHeight = Math.round(normalizedValue * (chartHeight - 1));

          if (barHeight >= row) {
            line += "██";
          } else {
            line += "  ";
          }
        }
        chartLines.push(line);
      }

      const timeLabels = chartData
        .map((entry) => {
          const time = new Date(entry.timestamp);
          return time.getHours().toString().padStart(2, "0");
        })
        .join(" ");

      const chartHTML = `
        <div style="font-family: 'JetBrains Mono', monospace; color: white; line-height: 1.1; text-align: left; width: 100%; height: 100%; display: flex; flex-direction: column;">
          <div style="margin-bottom: 8px; text-align: left;">
            <div style="font-size: 0.8rem; color: #808080; margin-bottom: 2px;">
              MRR TREND (${mrrHistory.length}h)
            </div>
            <div style="font-size: 1rem; margin-bottom: 1px;">
              $${latest.value.toLocaleString()}
            </div>
            <div style="font-size: 0.75rem; color: ${
              change >= 0 ? "white" : "#ff4444"
            };">
              ${
                change >= 0 ? "+" : ""
              }$${change.toLocaleString()} (${changePercent}%)
            </div>
          </div>
          
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; text-align: left;">
            <div style="font-size: 0.6rem; color: #808080; margin-bottom: 1px;">
              $${maxValue.toLocaleString()}
            </div>
            <div style="margin: 2px 0; flex: 1; display: flex; flex-direction: column; justify-content: flex-end;">
              ${chartLines
                .map(
                  (line) =>
                    `<div style="font-size: 8px; line-height: 6px; color: white;">${line}</div>`
                )
                .join("")}
            </div>
            <div style="font-size: 0.6rem; color: #808080; margin-top: 1px;">
              $${minValue.toLocaleString()}
            </div>
            <div style="font-size: 0.55rem; color: #808080; margin-top: 3px; letter-spacing: 0.5px;">
              ${timeLabels}h
            </div>
          </div>
        </div>
      `;
      chartElement.innerHTML = chartHTML;
    } catch (error) {
      console.error("Error updating MRR chart:", error);
      chartElement.innerHTML =
        '<div class="chart-placeholder">Error loading MRR data</div>';
    }
  }

  formatTime(timestamp) {
    if (!timestamp) return "Unknown time";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }

  updateLastUpdated(timestamp = null) {
    const lastUpdated = document.getElementById("lastUpdated");
    if (lastUpdated) {
      const updateTime = timestamp ? new Date(timestamp) : new Date();
      lastUpdated.textContent = updateTime.toLocaleTimeString();
    }
  }

  showCacheIndicator() {
    const indicator = document.getElementById("cacheIndicator");
    if (indicator) {
      indicator.style.display = "inline";
    } else {
      console.error("Cache indicator element not found!");
    }
  }

  hideCacheIndicator() {
    const indicator = document.getElementById("cacheIndicator");
    if (indicator) {
      indicator.style.display = "none";
    }
  }

  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    if (this.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => {
        this.loadMetrics();
      }, this.refreshInterval * 60 * 1000);
    }
  }

  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MetricsDashboard();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
  } else {
  }
});
