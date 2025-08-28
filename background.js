// AI分类系统相关变量
let pluginApiClient = null;
let pluginClassifier = null;

// 🔄 AI分析队列系统
const analysisQueue = [];
let isQueueProcessorRunning = false;

// 🔧 [简化] 直接使用内联AI模块，不再尝试外部模块
let CategorySchema, AIApiClient, AIClassifier;

console.log('🔧 使用内联AI模块...');

// 内联完整版本的CategorySchema
CategorySchema = {
  CATEGORY_SCHEMA: {
    // 科技创新类
    technology: {
      name: "科技创新",
      description: "技术发展、创新应用、数字化转型相关内容",
      subcategories: {
        ai_tech: {
          name: "AI技术",
          description: "人工智能、机器学习、深度学习等AI相关技术",
          keywords: ["人工智能", "AI", "机器学习", "深度学习", "神经网络", "算法"]
        },
        hardware_tech: {
          name: "硬件科技", 
          description: "电子设备、芯片、硬件创新等",
          keywords: ["芯片", "处理器", "硬件", "电子设备", "半导体", "科技产品"]
        },
        software_dev: {
          name: "软件开发",
          description: "编程、软件工程、开发技术等",
          keywords: ["编程", "代码", "软件开发", "程序设计", "开发工具", "框架"]
        },
        digital_life: {
          name: "数字生活",
          description: "数字化应用、智能生活、科技体验等",
          keywords: ["数字化", "智能家居", "物联网", "APP", "数字生活", "科技体验"]
        }
      }
    },

    // 文化艺术类
    culture_arts: {
      name: "文化艺术",
      description: "文化传承、艺术创作、文学影视相关内容",
      subcategories: {
        traditional_culture: {
          name: "传统文化",
          description: "历史文化、传统艺术、民俗文化等",
          keywords: ["传统文化", "历史", "古典", "民俗", "文化遗产", "传统艺术"]
        },
        modern_arts: {
          name: "现代艺术",
          description: "当代艺术、设计、创意表达等",
          keywords: ["现代艺术", "设计", "创意", "艺术作品", "当代", "视觉艺术"]
        },
        literature: {
          name: "文学创作",
          description: "文学作品、写作、诗歌散文等",
          keywords: ["文学", "小说", "诗歌", "散文", "写作", "文学作品"]
        },
        media_film: {
          name: "音乐影视",
          description: "音乐、电影、电视剧、媒体内容等",
          keywords: ["音乐", "电影", "电视剧", "影视", "娱乐", "媒体"]
        }
      }
    },

    // 科学探索类
    science_exploration: {
      name: "科学探索",
      description: "科学研究、自然探索、医学健康相关内容",
      subcategories: {
        natural_science: {
          name: "自然科学",
          description: "物理、化学、生物等基础科学",
          keywords: ["物理", "化学", "生物", "科学实验", "自然科学", "科学研究"]
        },
        medical_health: {
          name: "医学健康",
          description: "医学知识、健康养生、医疗技术等",
          keywords: ["医学", "健康", "医疗", "养生", "疾病", "治疗"]
        },
        environment: {
          name: "环境生态",
          description: "环境保护、生态系统、可持续发展等",
          keywords: ["环境", "生态", "环保", "可持续", "气候", "自然保护"]
        },
        astronomy_geo: {
          name: "天文地理",
          description: "天文学、地理学、宇宙探索等",
          keywords: ["天文", "地理", "宇宙", "星空", "地球", "太空"]
        }
      }
    },

    // 社会人文类
    society_humanity: {
      name: "社会人文",
      description: "社会议题、人文思考、哲学心理相关内容",
      subcategories: {
        history_philosophy: {
          name: "历史哲学",
          description: "历史事件、哲学思辨、思想文化等",
          keywords: ["历史", "哲学", "思想", "文化", "思辨", "人文"]
        },
        psychology: {
          name: "心理学",
          description: "心理健康、行为分析、心理学知识等",
          keywords: ["心理学", "心理健康", "情感", "行为", "心理", "情绪"]
        },
        social_issues: {
          name: "社会议题",
          description: "社会现象、公共话题、时事评论等",
          keywords: ["社会", "时事", "新闻", "社会现象", "公共", "议题"]
        },
        law_politics: {
          name: "法律政治",
          description: "法律知识、政治制度、公共政策等",
          keywords: ["法律", "政治", "政策", "制度", "法规", "治理"]
        }
      }
    },

    // 生活方式类
    lifestyle: {
      name: "生活方式",
      description: "日常生活、个人兴趣、生活技能相关内容",
      subcategories: {
        food_cooking: {
          name: "美食烹饪",
          description: "美食制作、烹饪技巧、餐厅推荐等",
          keywords: ["美食", "烹饪", "食谱", "料理", "餐厅", "小吃", "火锅"]
        },
        travel_adventure: {
          name: "旅行探险",
          description: "旅游攻略、探险体验、地方文化等",
          keywords: ["旅行", "旅游", "探险", "攻略", "景点", "文化体验"]
        },
        fashion_beauty: {
          name: "时尚美妆",
          description: "时尚搭配、美妆护肤、潮流趋势等",
          keywords: ["时尚", "美妆", "护肤", "搭配", "潮流", "化妆"]
        },
        home_decor: {
          name: "家居装饰",
          description: "家居设计、装修装饰、生活用品等",
          keywords: ["家居", "装修", "装饰", "设计", "家具", "生活用品"]
        }
      }
    },

    // 教育成长类
    education_growth: {
      name: "教育成长",
      description: "学习教育、个人发展、技能提升相关内容",
      subcategories: {
        learning_methods: {
          name: "学习方法",
          description: "学习技巧、教育方法、知识获取等",
          keywords: ["学习", "教育", "方法", "技巧", "知识", "学习方法"]
        },
        career_dev: {
          name: "职业发展",
          description: "职场技能、职业规划、工作经验等",
          keywords: ["职业", "职场", "工作", "职业规划", "技能", "就业"]
        },
        skill_training: {
          name: "技能培训",
          description: "专业技能、实用技能、培训课程等",
          keywords: ["技能", "培训", "课程", "专业", "实用技能", "能力提升"]
        },
        parenting_education: {
          name: "亲子教育",
          description: "育儿知识、家庭教育、儿童成长等",
          keywords: ["育儿", "亲子", "家庭教育", "儿童", "成长", "教育"]
        }
      }
    },

    // 商业财经类
    business_finance: {
      name: "商业财经",
      description: "商业模式、投资理财、经济分析相关内容",
      subcategories: {
        entrepreneurship: {
          name: "创业投资",
          description: "创业经验、投资理念、商业模式等",
          keywords: ["创业", "投资", "商业", "企业", "资本", "融资"]
        },
        market_analysis: {
          name: "市场分析",
          description: "市场趋势、行业分析、商业洞察等",
          keywords: ["市场", "分析", "趋势", "行业", "商业分析", "市场研究"]
        },
        economic_trends: {
          name: "经济趋势",
          description: "经济形势、宏观经济、政策影响等",
          keywords: ["经济", "宏观", "政策", "经济形势", "经济趋势", "金融"]
        },
        personal_finance: {
          name: "理财规划",
          description: "个人理财、财务规划、投资建议等",
          keywords: ["理财", "财务", "投资理财", "理财规划", "财富", "资产"]
        }
      }
    },

    // 娱乐休闲类
    entertainment: {
      name: "娱乐休闲",
      description: "娱乐活动、休闲爱好、体育竞技相关内容",
      subcategories: {
        gaming: {
          name: "游戏竞技",
          description: "电子游戏、竞技比赛、游戏文化等",
          keywords: ["游戏", "电竞", "竞技", "游戏文化", "比赛", "娱乐游戏"]
        },
        sports: {
          name: "体育运动",
          description: "体育赛事、运动健身、体育文化等",
          keywords: ["体育", "运动", "健身", "比赛", "体育赛事", "运动健身", "足球", "欧冠"]
        },
        variety_shows: {
          name: "综艺娱乐",
          description: "综艺节目、娱乐节目、明星八卦等",
          keywords: ["综艺", "娱乐节目", "明星", "八卦", "娱乐", "节目"]
        },
        comedy_humor: {
          name: "搞笑幽默",
          description: "幽默内容、搞笑视频、段子等",
          keywords: ["搞笑", "幽默", "段子", "喜剧", "有趣", "娱乐", "神评论"]
        }
      }
    }
  },

  // 获取所有主类别
  getMainCategories() {
    return Object.keys(this.CATEGORY_SCHEMA).map(key => ({
      id: key,
      name: this.CATEGORY_SCHEMA[key].name,
      description: this.CATEGORY_SCHEMA[key].description
    }));
  },

  // 获取指定主类别的子类别
  getSubcategories(mainCategory) {
    if (!this.CATEGORY_SCHEMA[mainCategory]) return [];
    return Object.keys(this.CATEGORY_SCHEMA[mainCategory].subcategories).map(key => ({
      id: key,
      name: this.CATEGORY_SCHEMA[mainCategory].subcategories[key].name,
      description: this.CATEGORY_SCHEMA[mainCategory].subcategories[key].description
    }));
  }
};

// 内联简化版本的AIApiClient
AIApiClient = class {
    constructor(config) {
      this.config = {
        apiKey: config.apiKey || '',
        model: config.model || 'glm-4.5',
        timeout: config.timeout || 60000,
        temperature: config.temperature || 0.6
      };
    }
    
    async chatCompletion(messages) {
      console.log('🌐 发送API请求到智谱GLM...');
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: this.config.temperature
        })
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API响应成功');
      return data;
    }
    
    async testConnection() {
      try {
        const result = await this.chatCompletion([
          { role: "user", content: "测试连接，请回复'连接成功'" }
        ]);
        return { success: true, response: result.choices[0].message.content };
      } catch (error) {
        return { success: false, message: error.message };
      }
    }
    
  clearCache() {}
  getConfig() { return {...this.config}; }
};

// 内联完整版本的AIClassifier（两步分类法）
AIClassifier = class {
  constructor(apiClient, categorySchema) {
    this.apiClient = apiClient;
    this.categorySchema = categorySchema;
  }
  
  async classifyContent(content) {
    console.log('🎯 开始AI分类（两步分类法）...');
    
    // 标准化内容格式
    const normalizedContent = {
      title: content.title || '',
      description: content.description || '',
      tags: content.tags || [],
      platform: content.platform || '',
      rawText: content.rawText || content.title + ' ' + content.description
    };

    try {
      console.log('🎯 开始第一步：主类别分类...');
      // 第一步：确定主类别
      const mainCategoryResult = await this.classifyMainCategory(normalizedContent);
      console.log('✅ 主类别分类完成:', mainCategoryResult);
      
      console.log('🎯 开始第二步：子类别分类...');
      // 第二步：确定子类别
      const subCategoryResult = await this.classifySubCategory(
        normalizedContent, 
        mainCategoryResult.category
      );
      console.log('✅ 子类别分类完成:', subCategoryResult);

      // 合并结果
      const finalResult = {
        mainCategory: {
          id: mainCategoryResult.category,
          name: mainCategoryResult.categoryName,
          confidence: mainCategoryResult.confidence,
          reasoning: mainCategoryResult.reasoning
        },
        subCategory: {
          id: subCategoryResult.category,
          name: subCategoryResult.categoryName, 
          confidence: subCategoryResult.confidence,
          reasoning: subCategoryResult.reasoning
        },
        overallConfidence: (mainCategoryResult.confidence + subCategoryResult.confidence) / 2,
        classificationPath: `${mainCategoryResult.categoryName} > ${subCategoryResult.categoryName}`,
        contentSummary: normalizedContent.rawText.substring(0, 100) + (normalizedContent.rawText.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString(),
        method: 'ai_two_step'
      };

      console.log('🎉 AI两步分类成功完成!');
      return finalResult;
      
    } catch (error) {
      console.error('❌ AI分类失败:', error);
      throw error;
    }
  }

  // 第一步：主类别分类
  async classifyMainCategory(content) {
    console.log('📋 主类别分类 - 构建提示词...');
    const mainCategories = this.categorySchema.getMainCategories();
    const categoryList = mainCategories
      .map(cat => `${cat.id}: ${cat.name} - ${cat.description}`)
      .join('\n');

    const prompt = `请分析以下内容并确定其所属的主要类别。

内容信息：
标题：${content.title || '无'}
描述：${content.description || '无'}
标签：${content.tags ? content.tags.join(', ') : '无'}
平台：${content.platform || '未知'}

可选的主类别：
${categoryList}

请根据内容的主题和性质，选择最合适的主类别。

请严格按照以下JSON格式返回结果：
{
  "category": "类别ID",
  "categoryName": "类别名称", 
  "confidence": 0.85,
  "reasoning": "选择这个类别的理由"
}

注意：
1. category必须是上述列表中的有效ID
2. confidence是0-1之间的数值，表示分类的置信度
3. reasoning简要说明选择理由`;

    const messages = [
      {
        role: "system",
        content: "你是一个专业的内容分类专家，擅长准确分析和分类各种类型的内容。请严格按照要求的JSON格式返回结果。"
      },
      {
        role: "user", 
        content: prompt
      }
    ];

    const response = await this.apiClient.chatCompletion(messages);
    const result = this.parseClassificationResponse(response.choices[0].message.content, 'main');
    
    return result;
  }

  // 第二步：子类别分类
  async classifySubCategory(content, mainCategory) {
    console.log(`📋 子类别分类 - 主类别: ${mainCategory}，构建提示词...`);
    const subCategories = this.categorySchema.getSubcategories(mainCategory);
    
    if (subCategories.length === 0) {
      console.error(`❌ 主类别 ${mainCategory} 没有可用的子类别`);
      throw new Error(`主类别 ${mainCategory} 没有可用的子类别`);
    }

    const categoryList = subCategories
      .map(cat => `${cat.id}: ${cat.name} - ${cat.description}`)
      .join('\n');

    const mainCategoryInfo = this.categorySchema.CATEGORY_SCHEMA[mainCategory];

    const prompt = `请对以下内容进行更细致的分类，确定其在"${mainCategoryInfo.name}"类别下的具体子类别。

内容信息：
标题：${content.title || '无'}
描述：${content.description || '无'}
标签：${content.tags ? content.tags.join(', ') : '无'}
平台：${content.platform || '未知'}

已确定的主类别：${mainCategoryInfo.name} - ${mainCategoryInfo.description}

可选的子类别：
${categoryList}

请根据内容的具体特征和细节，选择最合适的子类别。

请严格按照以下JSON格式返回结果：
{
  "category": "子类别ID",
  "categoryName": "子类别名称",
  "confidence": 0.85,
  "reasoning": "选择这个子类别的理由"
}

注意：
1. category必须是上述子类别列表中的有效ID
2. confidence是0-1之间的数值，表示分类的置信度
3. reasoning简要说明选择理由，特别是为什么选择这个子类别而不是其他的`;

    const messages = [
      {
        role: "system",
        content: "你是一个专业的内容分类专家，特别擅长细分类别的精准判断。请仔细分析内容特征，严格按照JSON格式返回结果。"
      },
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await this.apiClient.chatCompletion(messages);
    const result = this.parseClassificationResponse(response.choices[0].message.content, 'sub');
    
    return result;
  }

  // 解析AI响应
  parseClassificationResponse(responseContent, type) {
    console.log(`🔍 解析${type}分类响应...`);
    try {
      // 尝试提取JSON
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(`❌ ${type}分类响应中未找到有效的JSON`);
        throw new Error('未找到有效的JSON响应');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      // 验证必需字段
      if (!result.category || !result.categoryName || result.confidence === undefined) {
        console.error(`❌ ${type}分类响应缺少必需字段:`, result);
        throw new Error('响应缺少必需字段');
      }

      // 验证置信度范围
      if (result.confidence < 0 || result.confidence > 1) {
        result.confidence = Math.max(0, Math.min(1, result.confidence));
      }

      console.log(`✅ ${type}分类响应解析成功:`, result);
      return result;

  } catch (error) {
      console.error(`❌ 解析${type}分类响应失败:`, error);
      throw error;
    }
  }
  
  clearCache() {}
};

console.log('✅ 内联AI模块加载完成');
console.log('🔄 队列系统已就绪');

// 🔄 队列管理函数
// 添加到分析队列
function addToAnalysisQueue(content, url, data) {
  const queueItem = {
    url: url,
    content: content,
    data: data,
    timestamp: Date.now(),
    retryCount: 0
  };
  
  analysisQueue.push(queueItem);
  console.log(`📥 添加到分析队列，当前队列长度: ${analysisQueue.length}`);
  
  // 启动队列处理器（如果还没运行）
  startQueueProcessor();
  
  return {
    status: "queued",
    queueLength: analysisQueue.length,
    message: "已加入分析队列"
  };
}

// 队列处理器
async function startQueueProcessor() {
  if (isQueueProcessorRunning) {
    return; // 已经在运行了
  }
  
  isQueueProcessorRunning = true;
  console.log('🚀 启动队列处理器');
  
  while (analysisQueue.length > 0) {
    const item = analysisQueue.shift();
    console.log(`🎯 处理队列项: ${item.url}`);
    
    try {
      // 执行AI分析
      const result = await performAIAnalysis(item.content, item.data);
      
      // 保存结果
      await saveAnalysisResult(item.url, result, item.data);
      
      console.log(`✅ 队列项处理完成: ${item.url}`);
      
    } catch (error) {
      console.error(`❌ 队列项处理失败: ${item.url}`, error);
      
      // 重试机制
      if (item.retryCount < 2) {
        item.retryCount++;
        analysisQueue.unshift(item); // 重新加入队列头部
        console.log(`🔄 重试队列项: ${item.url} (第${item.retryCount + 1}次)`);
      } else {
        console.log(`💀 队列项处理失败，放弃重试: ${item.url}`);
        // 降级处理
        await handleAnalysisFailure(item.data, error);
      }
    }
    
    // 添加延迟，避免API限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  isQueueProcessorRunning = false;
  console.log('🏁 队列处理器完成');
}

// 执行AI分析
async function performAIAnalysis(content, data) {
  // 简单检查：如果没有初始化，先初始化
  if (!pluginApiClient || !pluginClassifier) {
    console.log('🔄 AI系统未初始化，开始初始化...');
    
    const result = await chrome.storage.local.get(['aiApiConfig']);
    if (result.aiApiConfig) {
      initializePluginAPI(result.aiApiConfig);
    } else {
      throw new Error('未找到API配置');
    }
  }

  let classification = null;
  
  // 执行AI分类
  if (pluginClassifier && content) {
    console.log('🎯 开始AI分类...');
    classification = await pluginClassifier.classifyContent(content);
    console.log('✅ AI分类完成!', classification);
    
    // 更新统计信息
    await updateClassificationStats(classification);
  } else {
    console.log('⚠️ AI分类器未就绪或无内容');
  }
  
  return classification;
}

// 保存分析结果
async function saveAnalysisResult(url, classification, data) {
  // 记录行为数据
  console.log('💾 准备行为记录数据...');
  const behaviorRecord = {
    timestamp: new Date().toISOString(),
    platform: data.platform,
    action: data.action,
    url: url,
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
    console.log('🏷️ 基于AI分类生成标签...');
    tags = [
      classification.mainCategory.name,
      classification.subCategory.name
    ];
    console.log('✅ AI标签生成完成:', tags);
  } else {
    console.log('🏷️ 使用备用标签生成...');
    // 备用标签生成
    tags = generateFallbackTags(data.extractedContent);
    console.log('✅ 备用标签生成完成:', tags);
  }
  
  behaviorRecord.tags = tags;
  
  // 保存到存储
  console.log('💾 保存行为记录到存储...');
  const result = await chrome.storage.local.get(["userBehavior"]);
  const behaviorHistory = result.userBehavior || [];
  behaviorHistory.push(behaviorRecord);
  
  // 保留最近100条记录
  const limitedHistory = behaviorHistory.slice(-100);
  await chrome.storage.local.set({ userBehavior: limitedHistory });
  
  console.log('✅ 行为记录已保存');
  console.log('📊 当前行为记录数量:', limitedHistory.length);
  
  // 直接生成AI推荐
  generateAIBasedRecommendationsFromHistory(limitedHistory);
  
  return {
    classification: classification,
    tags: tags
  };
}

// 处理分析失败
async function handleAnalysisFailure(data, error) {
  console.log('🔄 降级到传统方法...');
  
  // 降级到传统方法
  const fallbackTags = generateFallbackTags(data.extractedContent);
  console.log('🏷️ 生成备用标签:', fallbackTags);
  
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

// 获取队列状态
function getQueueStatus() {
  return {
    queueLength: analysisQueue.length,
    isProcessing: isQueueProcessorRunning,
    nextItem: analysisQueue[0] ? {
      url: analysisQueue[0].url,
      timestamp: analysisQueue[0].timestamp
    } : null
  };
}

// 开发阶段默认配置（生产环境请删除或注释掉）
const DEV_DEFAULT_CONFIG = {
  enabled: true,  // 设置为false可禁用开发默认配置
  apiConfig: {
    // 在这里填入您的开发API密钥
    apiKey: "e45bb7e5b3c24248ad2a5e2d8be06387.n3V6k3bs2cczwDvi",  // 替换为您的实际API密钥
    model: "glm-4.5",
    name: "开发默认配置",
    temperature: 0.6,
    timeout: 60000  // 明确设置60秒超时，确保与测试代码保持一致
  }
};

// 简单初始化AI系统 - 完全仿照测试网页
function initializePluginAPI(apiConfig) {
  console.log('🔧 简单初始化AI系统...');
  
  if (!apiConfig || !apiConfig.apiKey) {
    throw new Error('请输入API密钥');
  }
  
  // 使用插件中的实际API客户端，使用默认配置
  pluginApiClient = new AIApiClient({
    apiKey: apiConfig.apiKey,
    model: apiConfig.model || 'glm-4.5',
    temperature: apiConfig.temperature || 0.6
  });
  
  // 初始化AI分类器
  if (typeof CategorySchema !== 'undefined') {
    pluginClassifier = new AIClassifier(pluginApiClient, CategorySchema);
    console.log('✅ 插件API客户端和分类器已初始化');
    return true;
  }
  
  throw new Error('CategorySchema未加载');
}

// 初始化存储数据
chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 ===== 扩展安装/更新事件触发 =====');
  
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
  
  // 开发阶段自动配置 - 简化版本
  if (DEV_DEFAULT_CONFIG.enabled && 
      DEV_DEFAULT_CONFIG.apiConfig.apiKey && 
      DEV_DEFAULT_CONFIG.apiConfig.apiKey !== "your-api-key-here") {
    
    console.log("✅ 检测到开发默认配置，自动启用AI分类...");
    
    chrome.storage.local.set({
      aiClassificationEnabled: true,
      aiApiConfig: DEV_DEFAULT_CONFIG.apiConfig
    }, () => {
      console.log("✅ AI分类已自动启用（开发模式）");
      
      // 简单初始化
      try {
        initializePluginAPI(DEV_DEFAULT_CONFIG.apiConfig);
          console.log('🎉 AI分类系统初始化完成！');
      } catch (error) {
          console.error('❌ AI分类系统初始化失败:', error);
      }
    });
  } else {
    console.log("⚠️ 未检测到有效的开发配置，请手动配置API密钥");
  }
});

// 监听内容脚本消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 background.js收到消息:', {
    action: request.action,
    senderTab: sender.tab?.id,
    senderUrl: sender.tab?.url,
    timestamp: new Date().toISOString()
  });
  
  switch(request.action) {
    case "recordBehavior":
      recordUserBehavior(request.data);
      sendResponse({ status: "success" });
      break;
    case "recordBehaviorWithAI":
      console.log('🤖 处理AI行为记录请求...');
      recordBehaviorWithAI(request.data).then(result => {
        console.log('✅ AI行为记录完成，返回结果:', result);
        sendResponse(result);
      }).catch(error => {
        console.error('❌ AI行为记录失败:', error);
        sendResponse({ status: "error", error: error.message });
      });
      return true; // 异步响应标记
    case "clearAICache":
      console.log('🧹 处理清除AI缓存请求...');
      try {
        if (pluginApiClient) {
          pluginApiClient.clearCache();
          console.log('✅ API客户端缓存已清除');
        }
        if (pluginClassifier) {
          pluginClassifier.clearCache();
          console.log('✅ AI分类器缓存已清除');
        }
        sendResponse({ status: "success", message: "缓存已清除" });
      } catch (error) {
        console.error('❌ 清除缓存失败:', error);
        sendResponse({ status: "error", message: error.message });
      }
      break;
    case "getAISystemStatus":
      console.log('🔍 处理AI系统状态查询...');
      const aiStatus = {
        aiApiClient: !!pluginApiClient,
        aiClassifier: !!pluginClassifier,
        categorySchema: typeof CategorySchema !== 'undefined',
        apiConfig: pluginApiClient ? {
          hasApiKey: !!pluginApiClient.config?.apiKey,
          keyLength: pluginApiClient.config?.apiKey?.length || 0,
          model: pluginApiClient.config?.model,
          temperature: pluginApiClient.config?.temperature
        } : null,
        classifierConfig: pluginClassifier ? {
          confidenceThreshold: pluginClassifier.confidenceThreshold,
          fallbackEnabled: pluginClassifier.fallbackEnabled
        } : null
      };
      console.log('📊 返回AI系统状态:', aiStatus);
      sendResponse(aiStatus);
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
    case "debugAIClassification":
      debugAIClassification(request.testContent).then(result => {
        sendResponse(result);
      });
      return true;
    case "getQueueStatus":
      sendResponse(getQueueStatus());
      break;
    case "addToQueue":
      console.log('🧪 测试添加到队列...');
      const testResult = addToAnalysisQueue(
        request.testContent || { title: "测试内容", description: "测试描述" },
        request.testUrl || "https://test.com",
        request.testData || { platform: "test", action: "view" }
      );
      sendResponse(testResult);
      break;
    default:
      console.warn('⚠️ 未知的消息类型:', request.action);
      sendResponse({ status: "error", error: "Unknown action" });
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
      // 直接生成AI推荐
      generateAIBasedRecommendationsFromHistory(limitedHistory);
    });
  });
}

// 基于历史记录生成AI推荐
function generateAIBasedRecommendationsFromHistory(behaviorHistory) {
    if (behaviorHistory.length < 5) return;

    // 分析AI分类的行为记录
    const aiClassifiedBehaviors = behaviorHistory.filter(record => record.classification);
    
    if (aiClassifiedBehaviors.length >= 3) {
      // 使用AI分类结果生成推荐
      const recommendations = generateAIBasedRecommendations(aiClassifiedBehaviors);
      chrome.storage.local.set({ recommendations });
    
    // 检查是否需要显示提示
    checkPromptNeed(behaviorHistory);
  }
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
  const allMainCategories = CategorySchema ? CategorySchema.getMainCategories() : [];
  const recommendations = [];
  
  allMainCategories.forEach(category => {
    const userCount = categoryCount[category.id] || 0;
    const totalUserBehaviors = aiClassifiedBehaviors.length;
    const ratio = totalUserBehaviors > 0 ? userCount / totalUserBehaviors : 0;
    
    // 如果用户在该类别的行为占比较低，推荐该类别
    if (ratio < 0.3) {
      const subCategories = CategorySchema ? CategorySchema.getSubcategories(category.id) : [];
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

// 获取推荐内容（智能推荐版）
async function getRecommendations(tags) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['recommendations', 'userBehavior'], (result) => {
      const storedRecommendations = result.recommendations || [];
      const behaviorHistory = result.userBehavior || [];
      
      console.log('📊 获取推荐内容:', {
        storedRecommendationsCount: storedRecommendations.length,
        behaviorHistoryCount: behaviorHistory.length,
        inputTags: tags
      });
      
      // 如果有存储的智能推荐，优先使用
      if (storedRecommendations.length > 0) {
        console.log('✅ 使用智能生成的推荐内容:', storedRecommendations);
        resolve(storedRecommendations);
      } else if (behaviorHistory.length >= 5) {
        // 如果有足够的行为数据但没有推荐，触发重新生成
        console.log('🔄 触发推荐重新生成...');
        generateAIBasedRecommendationsFromHistory(behaviorHistory);
        
        // 等待推荐生成完成后返回
        setTimeout(() => {
          chrome.storage.local.get(['recommendations'], (updatedResult) => {
            const newRecommendations = updatedResult.recommendations || [];
            if (newRecommendations.length > 0) {
              console.log('✅ 重新生成的推荐内容:', newRecommendations);
              resolve(newRecommendations);
            } else {
              console.log('⚠️ 重新生成失败，使用默认推荐');
              resolve(getDefaultRecommendations(tags));
            }
          });
        }, 200); // 给推荐生成一些时间
      } else {
        // 使用默认推荐
        console.log('📝 使用默认推荐内容');
        resolve(getDefaultRecommendations(tags));
      }
    });
  });
}

// 获取默认推荐内容
function getDefaultRecommendations(tags) {
  if (tags && tags.length > 0) {
    // 基于输入标签生成相关推荐
    return tags.map(tag => `${tag}相关内容`);
  } else {
    // 基于分层标签系统的默认多样化推荐
    return ["人工智能伦理", "古典文学", "气候科学", "城市规划"];
  }
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

// 使用AI记录用户行为 - 队列版本
async function recordBehaviorWithAI(data) {
  console.log('🤖 ===== AI行为记录开始（队列版本） =====');
  
  // 直接添加到队列，无需任何判断
  const result = addToAnalysisQueue(data.extractedContent, data.url, data);
  
  console.log('📥 请求已加入队列:', result);
  console.log('🏁 ===== AI行为记录结束（队列版本） =====');
  
  return result;
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

// 更新AI配置 - 简化版本
async function updateAIConfig(config) {
  try {
    await chrome.storage.local.set({
      aiClassificationEnabled: config.enabled || false,
      aiApiConfig: config.apiConfig || null
    });
    
    // 重新初始化AI系统
    if (config.enabled && config.apiConfig) {
      initializePluginAPI(config.apiConfig);
    } else {
      // 禁用AI系统
      pluginApiClient = null;
      pluginClassifier = null;
    }
    
    return { status: "success", message: "AI配置已更新" };
  } catch (error) {
    return { status: "error", message: error.message };
  }
}

// 测试AI连接 - 简化版本
async function testAIConnection() {
  if (!pluginApiClient) {
    return { success: false, message: "AI系统未初始化" };
  }
  
  try {
    const result = await pluginApiClient.testConnection();
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

// 调试工具：手动测试AI分类 - 简化版本
async function debugAIClassification(testContent) {
  console.log('🔧 开始AI分类调试测试...');
  
  try {
    // 简单检查
    if (!pluginApiClient || !pluginClassifier) {
      // 尝试初始化
      const result = await chrome.storage.local.get(['aiApiConfig']);
      if (result.aiApiConfig) {
        initializePluginAPI(result.aiApiConfig);
      } else {
        return { success: false, error: '未找到API配置' };
      }
    }
    
    // 测试API连接
    const connectionTest = await pluginApiClient.testConnection();
    if (!connectionTest.success) {
      return { success: false, error: 'API连接失败: ' + connectionTest.message };
    }
    
    // 执行分类测试
    const startTime = Date.now();
    const classification = await pluginClassifier.classifyContent(testContent);
    const duration = Date.now() - startTime;
    
    console.log('✅ 调试测试完成:', classification);
    
    return {
      success: true,
      classification: classification,
      duration: duration,
      connectionTest: connectionTest
    };
    
  } catch (error) {
    console.error('❌ 调试测试失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
