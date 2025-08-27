// 导入新的内容提取器
let contentExtractor;
let recentTopics = [];

// 初始化内容提取器
function initializeExtractor() {
  if (typeof ContentExtractor !== 'undefined') {
    contentExtractor = new ContentExtractor();
  } else {
    console.warn('ContentExtractor未加载，使用备用方法');
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtractor);
} else {
  initializeExtractor();
}

function recordRecentActivity(tags) {
  const now = new Date().getTime();
  recentTopics.push({ tags, timestamp: now });
  
  // 仅保留30分钟内的记录
  recentTopics = recentTopics.filter(item => now - item.timestamp <= 30 * 60 * 1000);
  localStorage.setItem('recentTopics', JSON.stringify(recentTopics));
}

// 增强的页面分析函数
function analyzePlatformPage() {
  const platform = window.location.host.includes("douyin.com") ? "douyin" : 
                   window.location.host.includes("xiaohongshu.com") ? "xiaohongshu" :
                   window.location.host.includes("kuaishou.com") ? "kuaishou" :
                   window.location.host.includes("tiktok.com") ? "tiktok" :
                   window.location.host.includes("youtube.com") ? "youtube" : "unknown";

  // 使用新的内容提取器
  if (contentExtractor) {
    analyzePageWithExtractor(platform);
  } else {
    // 备用方法
    analyzePageLegacy(platform);
  }
}

// 使用新提取器分析页面
function analyzePageWithExtractor(platform) {
  try {
    const extractedContent = contentExtractor.smartExtract();
    
    // 评估内容质量
    const qualityScore = typeof ContentQualityAssessor !== 'undefined' 
      ? ContentQualityAssessor.assessContent(extractedContent)
      : { overall: 50 };
    
    console.log('提取的内容:', extractedContent);
    console.log('内容质量评分:', qualityScore);
    
    // 如果内容质量足够，发送给背景脚本进行AI分类
    if (qualityScore.overall >= 40) {
      // 准备发送给AI分类的数据
      const behaviorData = {
        platform: extractedContent.platform,
        action: "view",
        extractedContent: extractedContent,
        timestamp: new Date().toISOString(),
        qualityScore: qualityScore,
        url: window.location.href
      };
      
      // 发送给背景脚本
      chrome.runtime.sendMessage({
        action: "recordBehaviorWithAI",
        data: behaviorData
      }, (response) => {
        if (response && response.classification) {
          console.log('AI分类结果:', response.classification);
          
          // 更新用户活动记录
          const aiTags = [
            response.classification.mainCategory.name,
            response.classification.subCategory.name
          ];
          recordRecentActivity(aiTags);
        } else {
          // 降级到传统标签提取
          const legacyTags = extractLegacyTags(extractedContent);
          if (legacyTags.length > 0) {
            recordRecentActivity(legacyTags);
            chrome.runtime.sendMessage({
              action: "recordBehavior",
              data: {
                platform: extractedContent.platform,
                action: "view",
                tags: legacyTags
              }
            });
          }
        }
      });
    } else {
      console.log('内容质量不足，跳过AI分析');
      // 仍然尝试传统方法
      analyzePageLegacy(platform);
    }
    
  } catch (error) {
    console.error('内容提取失败:', error);
    // 降级到传统方法
    analyzePageLegacy(platform);
  }
}

// 从提取的内容中生成传统标签
function extractLegacyTags(extractedContent) {
  const tags = [];
  
  // 从标题提取
  if (extractedContent.title) {
    tags.push(extractedContent.title.substring(0, 20));
  }
  
  // 添加已有标签
  if (extractedContent.tags && extractedContent.tags.length > 0) {
    tags.push(...extractedContent.tags.slice(0, 3));
  }
  
  // 从描述中提取关键词
  if (extractedContent.description) {
    const keywords = extractKeywordsFromText(extractedContent.description);
    tags.push(...keywords.slice(0, 2));
  }
  
  return tags.filter(tag => tag && tag.length > 1).slice(0, 5);
}

// 简单的关键词提取
function extractKeywordsFromText(text) {
  const commonWords = ['的', '了', '是', '在', '有', '和', '就', '不', '人', '都', '一', '个', '也', '上', '很', '到', '说', '要', '去', '你', '会', '着', '没', '看', '好', '自己', '这', '那', '里', '后', '小', '么', '什么', '怎么'];
  
  return text
    .split(/[\s，。！？；：、]/)
    .filter(word => word.length >= 2 && word.length <= 10)
    .filter(word => !commonWords.includes(word))
    .slice(0, 5);
}

// 传统的页面分析方法（备用）
function analyzePageLegacy(platform) {
  if (platform === "douyin") {
    analyzeDouyinPage();
  } else if (platform === "xiaohongshu") {
    analyzeXiaohongshuPage();
  } else if (platform === "kuaishou") {
    analyzeKuaishouPage();
  } else if (platform === "youtube") {
    analyzeYoutubePage();
  }
}

// 增强的抖音页面分析
function analyzeDouyinPage() {
  const tags = Array.from(document.querySelectorAll(".tag-item, .hashtag-item, [data-e2e='video-tag'], [data-e2e='hashtag-link']"))
    .map(el => el.textContent.trim())
    .filter(tag => tag.length > 1 && tag.length < 30);

  if (tags.length > 0) {
    recordRecentActivity(tags);
    chrome.runtime.sendMessage({
      action: "recordBehavior",
      data: { platform: "douyin", action: "view", tags }
    });
  }
}

// 增强的小红书页面分析
function analyzeXiaohongshuPage() {
  const tags = Array.from(document.querySelectorAll(".tag, .hashtag, .topic-tag, .tag-item"))
    .map(el => el.textContent.replace(/#/g, "").trim())
    .filter(tag => tag.length > 1 && tag.length < 30);

  if (tags.length > 0) {
    recordRecentActivity(tags);
    chrome.runtime.sendMessage({
      action: "recordBehavior",
      data: { platform: "xiaohongshu", action: "view", tags }
    });
  }
}

// 增强的快手页面分析
function analyzeKuaishouPage() {
  const tags = Array.from(document.querySelectorAll(".tag-list .tag, .topic-tag, .hashtag-item"))
    .map(el => el.textContent.trim())
    .filter(tag => tag.length > 1 && tag.length < 30);

  if (tags.length > 0) {
    recordRecentActivity(tags);
    chrome.runtime.sendMessage({
      action: "recordBehavior",
      data: { platform: "kuaishou", action: "view", tags }
    });
  }
}

// 增强的YouTube页面分析
function analyzeYoutubePage() {
  const tags = Array.from(document.querySelectorAll("a[href*='/hashtag/'], .super-title a, #info .super-title a"))
    .map(el => el.textContent.replace(/#/g, "").trim())
    .filter(tag => tag.length > 1 && tag.length < 30);

  if (tags.length > 0) {
    recordRecentActivity(tags);
    chrome.runtime.sendMessage({
      action: "recordBehavior",
      data: { platform: "youtube", action: "view", tags }
    });
  }
}

// 页面变化监听器
let pageObserver;

// 监听页面内容变化
function setupPageObserver() {
  if (pageObserver) {
    pageObserver.disconnect();
  }
  
  pageObserver = new MutationObserver((mutations) => {
    let shouldAnalyze = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 检查是否有新的视频或内容节点
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.querySelector && (
              node.querySelector('[data-e2e="video-desc"]') ||
              node.querySelector('.video-info') ||
              node.querySelector('.note-item') ||
              node.querySelector('.feed-item')
            )) {
              shouldAnalyze = true;
              break;
            }
          }
        }
      }
    });
    
    if (shouldAnalyze) {
      // 延迟分析，等待内容完全加载
      setTimeout(analyzePlatformPage, 1000);
    }
  });
  
  pageObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// 初始化页面监听
setupPageObserver();

// 定期分析页面（备用机制）
setInterval(() => {
  if (document.visibilityState === 'visible') {
    analyzePlatformPage();
  }
}, 10000); // 每10秒检查一次

// 页面可见性变化时重新分析
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setTimeout(analyzePlatformPage, 2000);
  }
});
