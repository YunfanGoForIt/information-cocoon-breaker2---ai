// 导入新的内容提取器
let contentExtractor;
let recentTopics = [];

// 防重复分析机制
let analysisState = {
  lastAnalyzedUrl: '',
  lastContentHash: '',
  analysisInProgress: false,
  isStaticPage: false // 标记是否为静态页面
};

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
  console.log('🎯 ===== 平台页面分析触发 =====');
  
  const currentUrl = window.location.href;
  
  // 检查是否正在分析中
  if (analysisState.analysisInProgress) {
    console.log('⏳ 分析正在进行中，跳过本次触发');
    return;
  }
  
  // 如果是静态页面且已分析过，跳过
  if (analysisState.isStaticPage && currentUrl === analysisState.lastAnalyzedUrl) {
    console.log('📄 静态页面已分析过，跳过重复分析');
    return;
  }
  
  // 检查URL是否变化
  if (currentUrl === analysisState.lastAnalyzedUrl) {
    console.log('🔗 URL未变化，检查内容是否有更新...');
    // 如果是同一URL，需要检查内容是否真的变化了
    // 这里会继续执行，但在内容提取后会进一步检查
  } else {
    console.log('🔗 URL已变化，开始新的分析');
    // 重置静态页面标记
    analysisState.isStaticPage = false;
  }
  
  console.log('🌐 检测平台...');
  
  const platform = window.location.host.includes("douyin.com") ? "douyin" : 
                   window.location.host.includes("xiaohongshu.com") ? "xiaohongshu" :
                   window.location.host.includes("kuaishou.com") ? "kuaishou" :
                   window.location.host.includes("tiktok.com") ? "tiktok" :
                   window.location.host.includes("youtube.com") ? "youtube" : "unknown";

  console.log('📱 检测到平台:', platform);
  console.log('🔧 检查内容提取器状态...');

  // 标记分析开始
  analysisState.analysisInProgress = true;
  analysisState.lastAnalyzedUrl = currentUrl;

  // 使用新的内容提取器
  if (contentExtractor) {
    console.log('✅ 内容提取器已就绪，使用智能分析');
    analyzePageWithExtractor(platform);
  } else {
    console.log('⚠️ 内容提取器未就绪，使用备用方法');
    // 备用方法
    analyzePageLegacy(platform);
  }
}

// 使用新提取器分析页面
function analyzePageWithExtractor(platform) {
  console.log('🔍 ===== 页面分析开始 =====');
  console.log('📍 当前平台:', platform);
  console.log('🌐 当前页面:', window.location.href);
  
  try {
    console.log('📤 开始智能内容提取...');
    const extractedContent = contentExtractor.smartExtract();
    
    // 生成内容哈希，用于去重
    const contentHash = generateContentHash(extractedContent);
    
    // 检查内容是否真的有变化
    if (contentHash === analysisState.lastContentHash) {
      console.log('🔄 内容未变化，跳过重复分析');
      resetAnalysisState();
      return;
    }
    
    console.log('🆕 检测到新内容，继续分析...');
    analysisState.lastContentHash = contentHash;
    
    // 评估内容质量
    console.log('📊 评估内容质量...');
    const qualityScore = typeof ContentQualityAssessor !== 'undefined' 
      ? ContentQualityAssessor.assessContent(extractedContent)
      : { overall: 50 };
    
    console.log('✅ 内容提取完成!');
    console.log('📝 提取的内容:', {
      platform: extractedContent.platform,
      title: extractedContent.title?.substring(0, 50) + (extractedContent.title?.length > 50 ? '...' : ''),
      description: extractedContent.description?.substring(0, 50) + (extractedContent.description?.length > 50 ? '...' : ''),
      tags: extractedContent.tags,
      rawTextLength: extractedContent.rawText?.length || 0
    });
    console.log('📊 内容质量评分:', qualityScore);
    
    // 如果内容质量足够，发送给背景脚本进行AI分类
    if (qualityScore.overall >= 40) {
      console.log('✅ 内容质量达标，准备AI分类...');
      console.log('🚀 发送数据到背景脚本进行AI分类...');
      
      // 准备发送给AI分类的数据
      const behaviorData = {
        platform: extractedContent.platform,
        action: "view",
        extractedContent: extractedContent,
        timestamp: new Date().toISOString(),
        qualityScore: qualityScore,
        url: window.location.href
      };
      
      console.log('📦 发送数据包:', {
        platform: behaviorData.platform,
        action: behaviorData.action,
        hasContent: !!behaviorData.extractedContent,
        qualityScore: behaviorData.qualityScore,
        url: behaviorData.url
      });
      
      // 发送给背景脚本
      chrome.runtime.sendMessage({
        action: "recordBehaviorWithAI",
        data: behaviorData
      }, (response) => {
        console.log('📥 收到背景脚本响应:', response);
        
        if (response && response.classification) {
          console.log('🎉 AI分类成功!');
          console.log('📋 AI分类结果:', {
            classificationPath: response.classification.classificationPath,
            confidence: response.classification.overallConfidence,
            method: response.classification.method
          });
          
          // 更新用户活动记录
          const aiTags = [
            response.classification.mainCategory.name,
            response.classification.subCategory.name
          ];
          console.log('🏷️ 更新用户活动记录:', aiTags);
          recordRecentActivity(aiTags);
        } else {
          console.log('⚠️ AI分类失败或无分类结果，降级到传统方法');
          // 降级到传统标签提取
          const legacyTags = extractLegacyTags(extractedContent);
          if (legacyTags.length > 0) {
            console.log('🏷️ 使用传统标签:', legacyTags);
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
        
        // 检查是否为静态页面，如果是则标记为已分析
        if (isStaticPagePattern(window.location.href)) {
          console.log('📄 检测到静态页面，标记为已分析');
          analysisState.isStaticPage = true;
        }
        
        console.log('🏁 ===== 页面分析结束 =====');
        resetAnalysisState();
      });
    } else {
      console.log('❌ 内容质量不足，跳过AI分析');
      console.log('📊 质量评分:', qualityScore.overall, '< 40');
      // 仍然尝试传统方法
      console.log('🔄 降级到传统页面分析方法...');
      analyzePageLegacy(platform);
      console.log('🏁 ===== 页面分析结束（质量不足） =====');
      resetAnalysisState();
    }
    
  } catch (error) {
    console.error('❌ 内容提取失败:', error);
    console.log('🔄 降级到传统页面分析方法...');
    // 降级到传统方法
    analyzePageLegacy(platform);
    console.log('🏁 ===== 页面分析结束（提取失败） =====');
    resetAnalysisState();
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

// 生成内容哈希，用于去重
function generateContentHash(content) {
  const contentString = [
    content.title || '',
    content.description || '',
    content.tags.join(','),
    content.rawText?.substring(0, 200) || ''
  ].join('|');
  
  // 简单的哈希算法
  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(36);
}

// 重置分析状态
function resetAnalysisState() {
  analysisState.analysisInProgress = false;
}

// 检测是否为静态页面（单个帖子/视频页面）
function isStaticPagePattern(url) {
  const staticPatterns = {
    douyin: [/\/video\/\d+/, /\/note\/\d+/],
    xiaohongshu: [/\/explore\/.+/, /\/note\/\d+/],
    youtube: [/\/watch\?v=[^&]+/, /\/shorts\/[^\/]+/],
    tiktok: [/\/@.+\/video\/\d+/, /\/t\/\w+/],
    kuaishou: [/\/short-video\/\d+/, /\/video\/\d+/]
  };

  const platform = url.includes("douyin.com") ? "douyin" : 
                   url.includes("xiaohongshu.com") ? "xiaohongshu" :
                   url.includes("kuaishou.com") ? "kuaishou" :
                   url.includes("tiktok.com") ? "tiktok" :
                   url.includes("youtube.com") ? "youtube" : "unknown";

  if (platform === 'unknown' || !staticPatterns[platform]) {
    return false;
  }

  return staticPatterns[platform].some(pattern => pattern.test(url));
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
  console.log('🔄 使用传统页面分析方法:', platform);
  
  try {
    if (platform === "douyin") {
      analyzeDouyinPage();
    } else if (platform === "xiaohongshu") {
      analyzeXiaohongshuPage();
    } else if (platform === "kuaishou") {
      analyzeKuaishouPage();
    } else if (platform === "youtube") {
      analyzeYoutubePage();
    }
  } catch (error) {
    console.error('传统页面分析失败:', error);
  } finally {
    // 确保状态被重置
    resetAnalysisState();
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

// 监听页面内容变化 - 优化版
function setupPageObserver() {
  if (pageObserver) {
    pageObserver.disconnect();
  }
  
  // 防抖变量
  let debounceTimer = null;
  
  pageObserver = new MutationObserver((mutations) => {
    // 如果正在分析中，跳过
    if (analysisState.analysisInProgress) {
      return;
    }
    
    let shouldAnalyze = false;
    let hasSignificantChange = false;
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // 检查是否有新的视频或内容节点
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // 更精确的内容节点检测
            const contentSelectors = [
              '[data-e2e="video-desc"]',
              '.video-info', 
              '.note-item',
              '.feed-item',
              '.ytd-video-renderer',
              '[data-testid="video-title"]',
              '.video-title-link'
            ];
            
            for (const selector of contentSelectors) {
              if (node.querySelector && node.querySelector(selector)) {
                hasSignificantChange = true;
                break;
              }
            }
            
            // 检查是否是视频容器
            if (node.classList && (
              node.classList.contains('video-card') ||
              node.classList.contains('feed-item') ||
              node.classList.contains('video-item') ||
              node.classList.contains('ytd-video-renderer')
            )) {
              hasSignificantChange = true;
            }
          }
        }
      }
    });
    
    if (hasSignificantChange) {
      // 清除之前的防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // 防抖处理：等待500ms，确保内容加载完成
      debounceTimer = setTimeout(() => {
        console.log('🔄 检测到页面内容变化，准备分析...');
        analyzePlatformPage();
      }, 500);
    }
  });
  
  // 更精确的观察配置
  pageObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
}

// 初始化页面监听
setupPageObserver();

// 移除了定时分析机制 - 仅依靠真正的页面变化监听

// 页面可见性变化时处理 - 简化版
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('👁️ 页面变为可见');
    // 页面变为可见时，如果URL变化了可能会需要分析
    // 但主要依靠MutationObserver来检测真正的内容变化
  }
});

// 页面URL变化检测（单页应用支持）
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    console.log('🔄 检测到URL变化:', url);
    lastUrl = url;
    
    // 重置状态，允许对新URL进行分析
    analysisState.lastAnalyzedUrl = '';
    analysisState.lastContentHash = '';
    analysisState.isStaticPage = false; // 重置静态页面标记
    
    setTimeout(analyzePlatformPage, 2000);
  }
}).observe(document, { subtree: true, childList: true });
