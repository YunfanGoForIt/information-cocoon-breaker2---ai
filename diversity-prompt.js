document.addEventListener('DOMContentLoaded', initPrompt);

function initPrompt() {
  // 获取推荐内容并显示
  chrome.runtime.sendMessage({ action: "getRecommendations" }, (response) => {
    renderRecommendations(response.recommendations);
  });
}

function renderRecommendations(recommendations) {
  const container = document.getElementById("recommendations-container");
  
  recommendations.forEach(tag => {
    const tagElement = document.createElement("div");
    tagElement.className = "tag";
    tagElement.textContent = tag;

    tagElement.addEventListener("click", () => {
      searchContent(tag);
    });

    container.appendChild(tagElement);
  });
}

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
