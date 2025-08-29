document.addEventListener('DOMContentLoaded', initPopup);

function initPopup() {
  // 加载用户数据
  loadUserData();
  
  // 获取推荐内容
  chrome.runtime.sendMessage({ action: "getRecommendations" }, (response) => {
    renderRecommendations(response.recommendations);
  });

  // 初始化阈值滑动条
  initThresholdSlider();
}

// 加载用户数据
function loadUserData() {
  chrome.storage.local.get(["diversityScore", "badges", "thresholdPercentage"], (result) => {
    const diversityScore = result.diversityScore || 0;
    const badges = result.badges || ["新手探索者"];
    const thresholdPercentage = result.thresholdPercentage || 70;
    
    // 更新多样性分数
    document.getElementById("diversity-score").textContent = diversityScore;
    
    // 更新进度条
    const progressBar = document.getElementById("progress-bar");
    progressBar.value = Math.min(diversityScore * 10, 100);
    
    // 更新阈值滑动条
    updateThresholdDisplay(thresholdPercentage);
    
    // 渲染徽章
    renderBadges(badges);
  });
}

// 渲染推荐内容
function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendations-list");
  container.innerHTML = "";
  
  if (recommendations.length === 0) {
    container.innerHTML = '<div class="recommendation-item">暂无推荐内容</div>';
    return;
  }
  
  recommendations.forEach(tag => {
    const item = document.createElement("div");
    item.className = "recommendation-item";
    item.textContent = tag;
    
    // 点击推荐标签搜索相关内容
    item.addEventListener("click", () => {
      searchContent(tag);
    });
    
    container.appendChild(item);
  });
}

// 渲染徽章
function renderBadges(badges) {
  const container = document.getElementById("badges-container");
  
  badges.forEach(badge => {
    const badgeElement = document.createElement("span");
    badgeElement.className = "badge";
    badgeElement.textContent = badge;
    container.appendChild(badgeElement);
  });
}

// 在当前平台搜索推荐内容
function searchContent(tag) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    let searchUrl;

    if (currentTab.url.includes("douyin.com")) {
      searchUrl = `https://www.douyin.com/search/${encodeURIComponent(tag)}`;
    } else if (currentTab.url.includes("xiaohongshu.com")) {
      searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(tag)}`;
    } else {
      searchUrl = `https://www.douyin.com/search/${encodeURIComponent(tag)}`;
    }

    chrome.tabs.update(currentTab.id, { url: searchUrl });
  });
}

// 阈值配置管理类
class ThresholdConfigManager {
  // 获取当前阈值配置
  static async getThreshold() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["thresholdPercentage"], (result) => {
        resolve(result.thresholdPercentage || 70);
      });
    });
  }
  
  // 更新阈值配置
  static async setThreshold(percentage) {
    return new Promise((resolve) => {
      const validPercentage = Math.max(30, Math.min(90, percentage));
      chrome.storage.local.set({ 
        thresholdPercentage: validPercentage 
      }, () => {
        // 通知background.js更新阈值
        chrome.runtime.sendMessage({
          action: "updateThreshold",
          threshold: validPercentage
        });
        resolve(validPercentage);
      });
    });
  }
  
  // 重置为默认值
  static async resetToDefault() {
    return this.setThreshold(70);
  }
}

// 初始化阈值滑动条
function initThresholdSlider() {
  const slider = document.getElementById('threshold-slider');
  
  // 加载当前阈值设置
  ThresholdConfigManager.getThreshold().then(threshold => {
    slider.value = threshold;
    updateThresholdDisplay(threshold);
  });
  
  // 监听滑动条变化
  slider.addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    updateThresholdDisplay(value);
  });
  
  // 监听滑动条释放事件，保存配置
  slider.addEventListener('change', (e) => {
    const value = parseInt(e.target.value);
    ThresholdConfigManager.setThreshold(value).then(() => {
      console.log(`阈值已更新为: ${value}%`);
    });
  });
}

// 更新阈值显示
function updateThresholdDisplay(percentage) {
  const slider = document.getElementById('threshold-slider');
  const valueElement = document.getElementById('threshold-value');
  const descElement = document.getElementById('threshold-desc');
  
  slider.value = percentage;
  valueElement.textContent = percentage;
  
  // 更新描述文字
  let desc;
  if (percentage <= 40) {
    desc = "高敏感 - 经常提醒探索";
  } else if (percentage <= 60) {
    desc = "适中敏感 - 平衡提醒";
  } else if (percentage <= 80) {
    desc = "默认敏感 - 标准提醒";
  } else {
    desc = "低敏感 - 较少提醒";
  }
  
  descElement.textContent = desc;
}

// 添加仪表板按钮事件监听
document.addEventListener('DOMContentLoaded', function() {
  const dashboardBtn = document.getElementById('dashboard-btn');
  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', function() {
      // 在新标签页中打开数据仪表板
      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard.html')
      });
    });
  }
});
