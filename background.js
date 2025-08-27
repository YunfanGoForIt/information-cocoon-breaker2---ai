// 导入AI分类相关模块
importScripts('category-schema.js', 'api-client.js', 'ai-classifier.js');

// 开发阶段默认配置（生产环境请删除或注释掉）
const DEV_DEFAULT_CONFIG = {
  enabled: true,  // 设置为false可禁用开发默认配置
  apiConfig: {
    // 在这里填入您的开发API密钥
    apiKey: "e45bb7e5b3c24248ad2a5e2d8be06387.n3V6k3bs2cczwDvi",  // 替换为您的实际API密钥
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/",
    model: "glm-4.5",
    name: "开发默认配置"
  }
};

// AI分类系统相关变量
let aiApiClient = null;
let aiClassifier = null;
let categorySchema = null;

// 初始化AI分类系统
async function initializeAIClassification() {
  try {
    console.log('开始初始化AI分类系统...');
    
    // 等待模块加载完成
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      if (typeof CategorySchema !== 'undefined' && 
          typeof AIApiClient !== 'undefined' && 
          typeof AIClassifier !== 'undefined') {
        break;
      }
      attempts++;
      console.log(`等待AI模块加载... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (attempts >= maxAttempts) {
      console.warn('AI模块加载超时，将在用户配置后重新尝试');
      return;
    }
    
    // 加载类别模式
    if (typeof CategorySchema !== 'undefined') {
      categorySchema = CategorySchema;
      console.log('✅ 类别模式已加载');
    }
    
    // 检查AI功能是否启用
    const result = await chrome.storage.local.get(['aiClassificationEnabled', 'aiApiConfig']);
    
    if (result.aiClassificationEnabled && result.aiApiConfig) {
      // 初始化API客户端
      if (typeof AIApiClient !== 'undefined') {
        aiApiClient = new AIApiClient(result.aiApiConfig);
        console.log('✅ API客户端已初始化');
        
        // 初始化分类器
        if (categorySchema && typeof AIClassifier !== 'undefined') {
          aiClassifier = new AIClassifier(aiApiClient, categorySchema);
          console.log('✅ AI分类器已初始化');
          console.log('🎉 AI分类系统初始化完成！');
        }
      }
    } else {
      console.log('⚠️ AI分类功能未启用或配置不完整');
    }
  } catch (error) {
    console.error('❌ AI分类系统初始化失败:', error);
  }
}

// 初始化存储数据
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    userBehavior: [],      // 用户行为记录
    recommendations: [],   // 推荐内容列表
    diversityScore: 0,     // 多样性分数
    badges: [],            // 用户成就徽章
    lastPromptTime: null,  // 上次提示时间
    thresholdPercentage: 70,  // 默认阈值70%
    aiClassificationEnabled: false, // AI分类功能开关
    aiApiConfig: null,     // AI API配置
    classificationStats: { // 分类统计
      totalClassified: 0,
      successfulClassifications: 0,
      averageConfidence: 0
    }
  });

  console.log("信息茧房破除插件已安装");
  
  // 开发阶段自动配置（仅在API密钥已填写时生效）
  if (DEV_DEFAULT_CONFIG.enabled && 
      DEV_DEFAULT_CONFIG.apiConfig.apiKey && 
      DEV_DEFAULT_CONFIG.apiConfig.apiKey !== "your-api-key-here") {
    
    console.log("检测到开发默认配置，自动启用AI分类...");
    
    chrome.storage.local.set({
      aiClassificationEnabled: true,
      aiApiConfig: DEV_DEFAULT_CONFIG.apiConfig
    }, () => {
      console.log("✅ AI分类已自动启用（开发模式）");
      
      // 延迟初始化AI系统
      setTimeout(initializeAIClassification, 2000);
    });
  } else {
    console.log("⚠️ 未检测到有效的开发配置，请手动配置API密钥");
    console.log("请访问 chrome-extension://" + chrome.runtime.id + "/options.html 进行配置");
  }
});

// 监听内容脚本消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case "recordBehavior":
      recordUserBehavior(request.data);
      sendResponse({ status: "success" });
      break;
    case "recordBehaviorWithAI":
      recordBehaviorWithAI(request.data).then(result => {
        sendResponse(result);
      }).catch(error => {
        console.error('AI行为记录失败:', error);
        sendResponse({ status: "error", error: error.message });
      });
      return true; // 异步响应标记
    case "getRecommendations":
      getRecommendations(request.tags).then(recommendations => {
        sendResponse({ recommendations });
      });
      return true; // 异步响应标记
    case "showDiversityPrompt":
      showDiversityPrompt();
      sendResponse({ status: "prompt_shown" });
      break;
    case "updateThreshold":
      updateThresholdConfig(request.threshold);
      sendResponse({ status: "success" });
      break;
    case "updateAIConfig":
      updateAIConfig(request.config).then(result => {
        sendResponse(result);
      });
      return true;
    case "testAIConnection":
      testAIConnection().then(result => {
        sendResponse(result);
      });
      return true;
    case "getClassificationStats":
      getClassificationStats().then(stats => {
        sendResponse(stats);
      });
      return true;
  }
});

// 记录用户行为
function recordUserBehavior(data) {
  chrome.storage.local.get(["userBehavior"], (result) => {
    const behaviorHistory = result.userBehavior || [];
    
    // 添加新行为记录
    behaviorHistory.push({
      timestamp: new Date().toISOString(),
      platform: data.platform,
      action: data.action,
      tags: data.tags || [],
      duration: data.duration || 0
    });
    
    // 保留最近100条记录
    const limitedHistory = behaviorHistory.slice(-100);
    chrome.storage.local.set({ userBehavior: limitedHistory }, () => {
      analyzeBehavior(); // 分析行为并更新推荐
    });
  });
}

// 分析用户行为生成推荐（增强版）
function analyzeBehavior() {
  chrome.storage.local.get(["userBehavior"], (result) => {
    const behaviorHistory = result.userBehavior || [];
    if (behaviorHistory.length < 5) return;

    // 分析AI分类的行为记录
    const aiClassifiedBehaviors = behaviorHistory.filter(record => record.classification);
    
    if (aiClassifiedBehaviors.length >= 3) {
      // 使用AI分类结果生成推荐
      const recommendations = generateAIBasedRecommendations(aiClassifiedBehaviors);
      chrome.storage.local.set({ recommendations });
    } else {
      // 使用传统方法
      const legacyRecommendations = generateLegacyRecommendations(behaviorHistory);
      chrome.storage.local.set({ recommendations: legacyRecommendations });
    }
    
    // 检查是否需要显示提示
    checkPromptNeed(behaviorHistory);
  });
}

// 基于AI分类结果生成推荐
function generateAIBasedRecommendations(aiClassifiedBehaviors) {
  // 统计用户兴趣分布
  const categoryCount = {};
  const subCategoryCount = {};
  
  aiClassifiedBehaviors.forEach(record => {
    if (record.classification) {
      const mainCat = record.classification.mainCategory.id;
      const subCat = record.classification.subCategory.id;
      
      categoryCount[mainCat] = (categoryCount[mainCat] || 0) + 1;
      subCategoryCount[subCat] = (subCategoryCount[subCat] || 0) + 1;
    }
  });
  
  // 找出用户较少涉及的类别
  const allMainCategories = categorySchema ? categorySchema.getMainCategories() : [];
  const recommendations = [];
  
  allMainCategories.forEach(category => {
    const userCount = categoryCount[category.id] || 0;
    const totalUserBehaviors = aiClassifiedBehaviors.length;
    const ratio = totalUserBehaviors > 0 ? userCount / totalUserBehaviors : 0;
    
    // 如果用户在该类别的行为占比较低，推荐该类别
    if (ratio < 0.3) {
      const subCategories = categorySchema ? categorySchema.getSubcategories(category.id) : [];
      const randomSubCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
      
      if (randomSubCategory) {
        recommendations.push({
          category: category.name,
          subCategory: randomSubCategory.name,
          reason: '增加内容多样性',
          diversityScore: 1 - ratio
        });
      }
    }
  });
  
  // 按多样性得分排序，返回前4个
  return recommendations
    .sort((a, b) => b.diversityScore - a.diversityScore)
    .slice(0, 4)
    .map(item => `${item.category}·${item.subCategory}`);
}

// 传统推荐方法备用
function generateLegacyRecommendations(behaviorHistory) {
  // 提取用户兴趣标签
  const tagFrequency = {};
  behaviorHistory.forEach(record => {
    if (record.tags) {
      record.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    }
  });
  
  const interestTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(item => item[0]);
  
  // 使用改进的分层分类系统
  return getDiverseTags(interestTags);
}

// 获取多样化标签（改进的分层分类系统）
function getDiverseTags(interestTags) {
  // 基于研究的最优分层标签系统
  const hierarchicalTagPool = {
    technology: {
      ai_tech: ["人工智能伦理", "机器学习应用", "AI安全", "算法公平性"],
      emerging_tech: ["量子计算", "区块链技术", "生物技术", "新能源技术"],
      digital_society: ["网络安全", "数字隐私", "网络治理", "数字鸿沟"]
    },
    culture_arts: {
      traditional: ["古典文学", "传统工艺", "历史文化", "民间艺术"],
      contemporary: ["现代艺术", "流行文化", "数字艺术", "创意产业"],
      global: ["世界音乐", "跨文化交流", "国际艺术", "文化多样性"]
    },
    science_nature: {
      environmental: ["气候科学", "生物多样性", "可持续发展", "环境保护"],
      life_sciences: ["神经科学", "基因科学", "医学前沿", "健康科学"],
      physical_sciences: ["空间探索", "物理前沿", "天文发现", "材料科学"]
    },
    society_humanity: {
      social_issues: ["社会心理学", "城市规划", "社会公正", "人口问题"],
      governance: ["公共政策", "国际关系", "政治科学", "法律制度"],
      economics: ["经济史", "发展经济学", "行为经济学", "全球化"]
    },
    lifestyle_wellness: {
      health: ["心理健康", "运动科学", "营养学", "预防医学"],
      personal_dev: ["终身学习", "技能发展", "创业精神", "职业规划"],
      relationships: ["人际关系", "家庭教育", "社区建设", "志愿服务"]
    },
    education_knowledge: {
      learning_methods: ["教育创新", "在线学习", "技能培训", "知识管理"],
      academic: ["科学研究", "学术写作", "批判思维", "研究方法"],
      practical: ["实用技能", "生活技巧", "手工制作", "日常科学"]
    }
  };

  return generateDiverseRecommendations(interestTags, hierarchicalTagPool);
}

// 智能推荐算法
function generateDiverseRecommendations(userInterests, tagPool) {
  const recommendations = [];
  const usedCategories = new Set();
  
  // 分析用户兴趣所属的主要类别
  const userMainCategories = identifyUserCategories(userInterests, tagPool);
  
  // 从每个主要类别中选择推荐
  Object.keys(tagPool).forEach(mainCategory => {
    // 优先推荐用户较少涉及的类别
    const categoryWeight = userMainCategories[mainCategory] || 0;
    const inverseWeight = 1 - (categoryWeight / Math.max(...Object.values(userMainCategories), 1));
    
    if (inverseWeight > 0.3) { // 阈值可调整
      const subCategories = Object.keys(tagPool[mainCategory]);
      const randomSubCategory = subCategories[Math.floor(Math.random() * subCategories.length)];
      const tags = tagPool[mainCategory][randomSubCategory];
      
      // 选择用户未接触过的标签
      const novelTag = tags.find(tag => !userInterests.includes(tag));
      if (novelTag && recommendations.length < 6) {
        recommendations.push({
          tag: novelTag,
          category: mainCategory,
          subCategory: randomSubCategory,
          diversityScore: inverseWeight
        });
      }
    }
  });
  
  // 按多样性得分排序并返回标签
  return recommendations
    .sort((a, b) => b.diversityScore - a.diversityScore)
    .slice(0, 4)
    .map(item => item.tag);
}

// 识别用户兴趣的主要类别分布
function identifyUserCategories(userInterests, tagPool) {
  const categoryCount = {};
  
  userInterests.forEach(interest => {
    Object.keys(tagPool).forEach(mainCategory => {
      Object.values(tagPool[mainCategory]).forEach(subCategoryTags => {
        if (subCategoryTags.includes(interest)) {
          categoryCount[mainCategory] = (categoryCount[mainCategory] || 0) + 1;
        }
      });
    });
  });
  
  return categoryCount;
}

// 从标签或分类结果获取领域信息（增强版）
function getDomainFromTag(tag) {
  // 首先尝试从AI分类结果中获取
  if (typeof tag === 'object' && tag.classification) {
    return tag.classification.mainCategory.id;
  }
  
  // 传统的标签到领域映射
  const domainMapping = {
    "科技创新": "technology",
    "AI技术": "technology", 
    "硬件科技": "technology",
    "软件开发": "technology",
    "数字生活": "technology",
    "文化艺术": "culture_arts",
    "传统文化": "culture_arts",
    "现代艺术": "culture_arts", 
    "文学创作": "culture_arts",
    "音乐影视": "culture_arts",
    "科学探索": "science_exploration",
    "自然科学": "science_exploration",
    "医学健康": "science_exploration",
    "环境生态": "science_exploration",
    "天文地理": "science_exploration",
    "社会人文": "society_humanity",
    "历史哲学": "society_humanity",
    "心理学": "society_humanity",
    "社会议题": "society_humanity",
    "法律政治": "society_humanity",
    "生活方式": "lifestyle",
    "美食烹饪": "lifestyle",
    "旅行探险": "lifestyle",
    "时尚美妆": "lifestyle",
    "家居装饰": "lifestyle",
    "教育成长": "education_growth",
    "学习方法": "education_growth",
    "职业发展": "education_growth",
    "技能培训": "education_growth",
    "亲子教育": "education_growth",
    "商业财经": "business_finance",
    "创业投资": "business_finance",
    "市场分析": "business_finance",
    "经济趋势": "business_finance",
    "理财规划": "business_finance",
    "娱乐休闲": "entertainment",
    "游戏竞技": "entertainment",
    "体育运动": "entertainment",
    "综艺娱乐": "entertainment",
    "搞笑幽默": "entertainment"
  };
  
  // 直接匹配
  if (domainMapping[tag]) {
    return domainMapping[tag];
  }
  
  // 模糊匹配
  for (const [keyword, domain] of Object.entries(domainMapping)) {
    if (tag.includes(keyword) || keyword.includes(tag)) {
      return domain;
    }
  }
  
  // 默认返回
  return "lifestyle";
}

// 显示多样性提示弹窗
function showDiversityPrompt() {
  chrome.windows.create({
    url: "diversity-prompt.html",
    type: "popup",
    width: 400,
    height: 300,
    left: Math.round((screen.width - 400) / 2),
    top: Math.round((screen.height - 300) / 2)
  });
}

// 获取推荐内容
async function getRecommendations(tags) {
  // 根据最近的标签生成多样化推荐
  const recommendations = tags ? tags.map(tag => `${tag}相关内容`) : ["人工智能伦理", "古典文学", "气候科学", "城市规划"];
  return new Promise(resolve => resolve(recommendations));
}

// 更新阈值配置
function updateThresholdConfig(percentage) {
  const validPercentage = Math.max(30, Math.min(90, percentage));
  chrome.storage.local.set({ 
    thresholdPercentage: validPercentage 
  }, () => {
    console.log(`阈值配置已更新为: ${validPercentage}%`);
  });
}

// 使用AI记录用户行为
async function recordBehaviorWithAI(data) {
  try {
    let classification = null;
    
    // 尝试AI分类
    if (aiClassifier && data.extractedContent) {
      console.log('开始AI分类...');
      classification = await aiClassifier.classifyContent(data.extractedContent);
      console.log('AI分类完成:', classification);
      
      // 更新统计信息
      await updateClassificationStats(classification);
    }
    
    // 记录行为数据
    const behaviorRecord = {
      timestamp: new Date().toISOString(),
      platform: data.platform,
      action: data.action,
      url: data.url,
      extractedContent: {
        title: data.extractedContent?.title || '',
        description: data.extractedContent?.description?.substring(0, 200) || '',
        platform: data.extractedContent?.platform || data.platform
      },
      classification: classification,
      qualityScore: data.qualityScore
    };
    
    // 生成用于传统系统的标签
    let tags = [];
    if (classification) {
      tags = [
        classification.mainCategory.name,
        classification.subCategory.name
      ];
    } else {
      // 备用标签生成
      tags = generateFallbackTags(data.extractedContent);
    }
    
    behaviorRecord.tags = tags;
    
    // 保存到存储
    chrome.storage.local.get(["userBehavior"], (result) => {
      const behaviorHistory = result.userBehavior || [];
      behaviorHistory.push(behaviorRecord);
      
      // 保留最近100条记录
      const limitedHistory = behaviorHistory.slice(-100);
      chrome.storage.local.set({ userBehavior: limitedHistory }, () => {
        analyzeBehavior(); // 分析行为并更新推荐
      });
    });
    
    return {
      status: "success",
      classification: classification,
      tags: tags
    };
    
  } catch (error) {
    console.error('AI行为记录失败:', error);
    
    // 降级到传统方法
    const fallbackTags = generateFallbackTags(data.extractedContent);
    recordUserBehavior({
      platform: data.platform,
      action: data.action,
      tags: fallbackTags
    });
    
    return {
      status: "fallback",
      tags: fallbackTags,
      error: error.message
    };
  }
}

// 生成备用标签
function generateFallbackTags(extractedContent) {
  const tags = [];
  
  if (extractedContent?.title) {
    tags.push(extractedContent.title.substring(0, 20));
  }
  
  if (extractedContent?.tags && extractedContent.tags.length > 0) {
    tags.push(...extractedContent.tags.slice(0, 3));
  }
  
  if (extractedContent?.platform) {
    tags.push(extractedContent.platform + '内容');
  }
  
  return tags.filter(tag => tag && tag.length > 1).slice(0, 5);
}

// 更新分类统计信息
async function updateClassificationStats(classification) {
  if (!classification) return;
  
  const result = await chrome.storage.local.get(['classificationStats']);
  const stats = result.classificationStats || {
    totalClassified: 0,
    successfulClassifications: 0,
    averageConfidence: 0
  };
  
  stats.totalClassified += 1;
  
  if (classification.overallConfidence >= 0.5) {
    stats.successfulClassifications += 1;
  }
  
  // 更新平均置信度
  const previousTotal = (stats.averageConfidence * (stats.totalClassified - 1));
  stats.averageConfidence = (previousTotal + classification.overallConfidence) / stats.totalClassified;
  
  await chrome.storage.local.set({ classificationStats: stats });
}

// 更新AI配置
async function updateAIConfig(config) {
  try {
    await chrome.storage.local.set({
      aiClassificationEnabled: config.enabled || false,
      aiApiConfig: config.apiConfig || null
    });
    
    // 重新初始化AI系统
    if (config.enabled && config.apiConfig) {
      await initializeAIClassification();
    } else {
      // 禁用AI系统
      aiApiClient = null;
      aiClassifier = null;
    }
    
    return { status: "success", message: "AI配置已更新" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// 测试AI连接
async function testAIConnection() {
  if (!aiApiClient) {
    return { success: false, message: "AI系统未初始化" };
  }
  
  try {
    const result = await aiApiClient.testConnection();
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// 获取分类统计信息
async function getClassificationStats() {
  const result = await chrome.storage.local.get(['classificationStats', 'userBehavior']);
  const stats = result.classificationStats || {
    totalClassified: 0,
    successfulClassifications: 0,
    averageConfidence: 0
  };
  
  const behaviorHistory = result.userBehavior || [];
  const aiClassifiedCount = behaviorHistory.filter(b => b.classification).length;
  
  return {
    ...stats,
    totalBehaviorRecords: behaviorHistory.length,
    aiClassifiedRecords: aiClassifiedCount,
    classificationRate: behaviorHistory.length > 0 ? aiClassifiedCount / behaviorHistory.length : 0
  };
}

// 检查是否需要显示多样性提示（增强版）
function checkPromptNeed(behaviorHistory) {
  const recentBehavior = behaviorHistory.filter(record => {
    const behaviorTime = new Date(record.timestamp);
    const now = new Date();
    return now - behaviorTime <= 48 * 60 * 60 * 1000; // 48小时内
  });

  if (recentBehavior.length < 10) return;
  
  // 分析领域分布
  const domainCounts = {};
  recentBehavior.forEach(record => {
    if (record.tags) {
      record.tags.forEach(tag => {
        const domain = getDomainFromTag(tag);
        if (domain) domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });
    }
  });

  // 读取用户配置的阈值
  chrome.storage.local.get(["thresholdPercentage"], (result) => {
    const thresholdPercentage = result.thresholdPercentage || 70;
    const thresholdCount = Math.floor(10 * thresholdPercentage / 100);
    
    console.log(`当前阈值设置: ${thresholdPercentage}%, 对应计数: ${thresholdCount}`);

    // 如果单一领域占比超过用户设置的阈值，显示提示
    const maxDomainCount = Math.max(...Object.values(domainCounts), 0);
    if (maxDomainCount > thresholdCount) {
      chrome.storage.local.get(["lastPromptTime"], (result) => {
        const lastPrompt = result.lastPromptTime ? new Date(result.lastPromptTime) : null;
        const now = new Date();

        // 3天内未提示过才显示
        if (!lastPrompt || now - lastPrompt > 3 * 24 * 60 * 60 * 1000) {
          console.log(`触发提示: 单一领域计数(${maxDomainCount}) > 阈值(${thresholdCount})`);
          showDiversityPrompt();
          chrome.storage.local.set({ lastPromptTime: now.toISOString() });
        }
      });
    }
  });
}
