// 视频分类系统的3级层级结构定义
// 8个主类别 × 4个子类别 = 32个子类别

const CATEGORY_SCHEMA = {
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
        keywords: ["美食", "烹饪", "食谱", "料理", "餐厅", "小吃"]
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
        keywords: ["体育", "运动", "健身", "比赛", "体育赛事", "运动健身"]
      },
      variety_shows: {
        name: "综艺娱乐",
        description: "综艺节目、娱乐节目、明星八卦等",
        keywords: ["综艺", "娱乐节目", "明星", "八卦", "娱乐", "节目"]
      },
      comedy_humor: {
        name: "搞笑幽默",
        description: "幽默内容、搞笑视频、段子等",
        keywords: ["搞笑", "幽默", "段子", "喜剧", "有趣", "娱乐"]
      }
    }
  }
};

// 获取所有主类别
function getMainCategories() {
  return Object.keys(CATEGORY_SCHEMA).map(key => ({
    id: key,
    name: CATEGORY_SCHEMA[key].name,
    description: CATEGORY_SCHEMA[key].description
  }));
}

// 获取指定主类别的子类别
function getSubcategories(mainCategory) {
  if (!CATEGORY_SCHEMA[mainCategory]) return [];
  
  return Object.keys(CATEGORY_SCHEMA[mainCategory].subcategories).map(key => ({
    id: key,
    name: CATEGORY_SCHEMA[mainCategory].subcategories[key].name,
    description: CATEGORY_SCHEMA[mainCategory].subcategories[key].description,
    keywords: CATEGORY_SCHEMA[mainCategory].subcategories[key].keywords
  }));
}

// 获取所有类别的平铺结构
function getFlatCategories() {
  const categories = [];
  
  Object.keys(CATEGORY_SCHEMA).forEach(mainKey => {
    const mainCategory = CATEGORY_SCHEMA[mainKey];
    
    Object.keys(mainCategory.subcategories).forEach(subKey => {
      const subCategory = mainCategory.subcategories[subKey];
      categories.push({
        mainCategory: mainKey,
        mainCategoryName: mainCategory.name,
        subCategory: subKey,
        subCategoryName: subCategory.name,
        description: subCategory.description,
        keywords: subCategory.keywords
      });
    });
  });
  
  return categories;
}

// 根据关键词查找相关类别
function findCategoriesByKeywords(text) {
  const matches = [];
  const lowercaseText = text.toLowerCase();
  
  Object.keys(CATEGORY_SCHEMA).forEach(mainKey => {
    const mainCategory = CATEGORY_SCHEMA[mainKey];
    
    Object.keys(mainCategory.subcategories).forEach(subKey => {
      const subCategory = mainCategory.subcategories[subKey];
      let score = 0;
      
      subCategory.keywords.forEach(keyword => {
        if (lowercaseText.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
      
      if (score > 0) {
        matches.push({
          mainCategory: mainKey,
          subCategory: subKey,
          score: score,
          name: subCategory.name
        });
      }
    });
  });
  
  return matches.sort((a, b) => b.score - a.score);
}

// 验证分类结果的有效性
function validateClassification(mainCategory, subCategory) {
  if (!CATEGORY_SCHEMA[mainCategory]) {
    return { valid: false, error: "无效的主类别" };
  }
  
  if (!CATEGORY_SCHEMA[mainCategory].subcategories[subCategory]) {
    return { valid: false, error: "无效的子类别" };
  }
  
  return { valid: true };
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CATEGORY_SCHEMA,
    getMainCategories,
    getSubcategories,
    getFlatCategories,
    findCategoriesByKeywords,
    validateClassification
  };
} else if (typeof window !== 'undefined') {
  window.CategorySchema = {
    CATEGORY_SCHEMA,
    getMainCategories,
    getSubcategories,
    getFlatCategories,
    findCategoriesByKeywords,
    validateClassification
  };
}