// 初始化存储数据
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    userBehavior: [],      // 用户行为记录
    recommendations: [],   // 推荐内容列表
    diversityScore: 0,     // 多样性分数
    badges: [],            // 用户成就徽章
    lastPromptTime: null,  // 上次提示时间
    thresholdPercentage: 70  // 默认阈值70%
  });

  console.log("信息茧房破除插件已安装");
});

// 监听内容脚本消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case "recordBehavior":
      recordUserBehavior(request.data);
      sendResponse({ status: "success" });
      break;
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

// 分析用户行为生成推荐
function analyzeBehavior() {
  chrome.storage.local.get(["userBehavior"], (result) => {
    const behaviorHistory = result.userBehavior || [];
    if (behaviorHistory.length < 5) return;

    // 提取用户兴趣标签
    const tagFrequency = {};
    behaviorHistory.forEach(record => {
      record.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });
    
    // 生成推荐标签（简化版）
    const interestTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(item => item[0]);
    
    // 生成多样化推荐
    const diverseTags = getDiverseTags(interestTags);
    chrome.storage.local.set({ recommendations: diverseTags });
    
    // 检查是否需要显示提示
    checkPromptNeed(behaviorHistory);
  });
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

// 检查是否需要显示多样性提示
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
    record.tags.forEach(tag => {
      const domain = getDomainFromTag(tag);
      if (domain) domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });
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
