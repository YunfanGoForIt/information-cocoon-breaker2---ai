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
          keywords: ["ChatGPT实战技巧", "MidJourney绘画教程", "Python机器学习项目示例", "PyTorch深度学习入门", "卷积神经网络可视化", "Transformer原理解析", "AI绘画工具测评", "ChatGPT应用案例", "自动驾驶感知算法", "OpenCV视觉项目", "自然语言处理应用案例", "AI写作助手教程", "客服机器人开发", "AI辅助医疗诊断演示", "AI教育辅助工具"]
        },
        hardware_tech: {
          name: "硬件科技",
          description: "电子设备、芯片、硬件创新等",
          keywords: ["iPhone 15拍照性能测试", "麒麟芯片架构解析", "RTX显卡性能对比", "MacBook拆机教程", "手机摄影参数优化", "5G网络测速实测", "Apple Watch功能评测", "AirPods音质分析", "DIY电脑组装教程", "新款数码开箱视频", "台积电芯片工艺揭秘", "处理器跑分对比", "手机电池续航优化技巧", "索尼相机传感器解析", "Oculus VR设备体验指南"]
        },
        software_dev: {
          name: "软件开发",
          description: "编程、软件工程、开发技术等",
          keywords: ["Python爬虫项目实战", "Vue 3组合式API教程", "Java项目实战案例", "React Hooks进阶指南", "MySQL数据库设计示例", "Git常用命令实操", "LeetCode编程题解析", "开源项目架构分析", "代码重构最佳实践", "Flutter跨平台应用开发", "Docker容器部署教程", "微服务架构设计案例", "微信小程序实战项目", "前端性能优化技巧", "算法可视化工具开发"]
        },
        digital_life: {
          name: "数字生活",
          description: "数字化应用、智能生活、科技体验等",
          keywords: ["智能家居系统搭建教程", "必备APP功能推荐", "远程办公高效工具", "个人云盘使用技巧", "智能音箱语音操控演示", "扫地机器人评测与优化", "在线学习平台深度体验", "数字支付安全实用技巧", "智能穿戴设备使用心得", "远程协作软件操作指南", "智能门锁安装流程", "智能家电远程控制技巧", "数字钱包应用案例", "视频会议软件实操教程", "智能灯光系统自动化"]
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
          keywords: ["故宫文物修复视频", "春节民俗体验指南", "古代建筑艺术解析", "手工刺绣制作教程", "唐诗宋词赏析与解读", "京剧表演技巧解析", "汉服穿搭教程", "传统糕点制作方法", "古代礼仪实景展示", "民族乐器演奏视频", "四大名著精读导览", "国画技法解析", "中医经典医书介绍", "古代发明与科技解析", "传统陶瓷制作工艺"]
        },
        modern_arts: {
          name: "现代艺术",
          description: "当代艺术、设计、创意表达等",
          keywords: ["当代艺术展览点评", "现代建筑设计案例解析", "平面设计实操教程", "数字插画创作流程", "摄影构图与光影技巧", "数字艺术作品展示", "装置艺术创作案例", "现代雕塑设计解析", "艺术展策展思路分享", "创意思维训练方法", "现代绘画作品赏析", "艺术市场趋势分析", "设计师访谈记录", "艺术教育创新方法", "跨界艺术合作案例"]
        },
        literature: {
          name: "文学创作",
          description: "文学作品、写作、诗歌散文等",
          keywords: ["网络小说创作经验", "现代诗歌写作技巧", "散文写作案例分析", "文学名著深度解读", "写作素材整理方法", "小说人物塑造方法", "诗歌朗诵技巧训练", "文学评论写作方法", "作家访谈精选", "国内外文学奖项介绍", "儿童文学创作案例", "科幻小说创作技巧", "推理小说悬疑构建", "翻译文学实践案例", "文学史重点梳理"]
        },
        media_film: {
          name: "音乐影视",
          description: "音乐、电影、电视剧、媒体内容等",
          keywords: ["热门电影观影指南", "经典电视剧解析", "音乐创作软件教程", "影视后期特效制作", "演员表演技巧剖析", "导演作品创作背景解析", "电影原声配乐赏析", "电视剧剧情深入解析", "音乐节现场演出分享", "影视拍摄技巧讲解", "电影票房与市场分析", "音乐制作DAW软件教程", "影视特效制作案例", "演员访谈精彩片段", "影视奖项颁布及解析"]
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
          keywords: ["量子力学实验演示", "元素周期表趣味实验", "达尔文进化理论解析", "科学实验视频教程", "经典物理定律讲解", "化学反应实验演示", "CRISPR基因编辑解析", "实验室仪器操作指南", "实验室安全操作流程", "科学论文解读技巧", "著名物理学家传记", "化学工业应用案例", "生物多样性保护实践", "科学史趣闻解析", "前沿科学技术突破"]
        },
        medical_health: {
          name: "医学健康",
          description: "医学知识、健康养生、医疗技术等",
          keywords: ["中医养生食疗方案", "西医诊疗技术解析", "心理健康自我调节方法", "营养搭配健康计划", "健身训练课程指导", "常见疾病预防方法", "医疗设备使用视频", "药物作用机制讲解", "手术技术发展趋势", "康复治疗案例分享", "医学研究最新进展", "年度健康体检指南", "急救技能操作教程", "慢性病管理方案", "医学伦理案例分析"]
        },
        environment: {
          name: "环境生态",
          description: "环境保护、生态系统、可持续发展等",
          keywords: ["气候变化科学解析", "新型环保技术应用", "生态修复案例分享", "可持续发展模式探索", "环境污染治理实践", "绿色能源开发案例", "濒危野生动物保护", "海洋生态系统研究", "森林资源管理方法", "垃圾分类与回收实践", "清洁能源技术展示", "生态农业示范项目", "环境监测仪器使用", "环保政策解读与影响", "生态旅游规划案例"]
        },
        astronomy_geo: {
          name: "天文地理",
          description: "天文学、地理学、宇宙探索等",
          keywords: ["天文观测技巧教程", "地貌形成科学解析", "宇宙探测任务分享", "星空摄影拍摄教程", "地球气候变化研究", "太空站生活体验", "行星探测项目解析", "地质构造分析案例", "天文望远镜使用指南", "地理信息系统实操教程", "宇宙起源理论讲解", "地球资源分布数据分析", "太空技术发展进展", "天文摄影后期技巧", "地理环境变化记录"]
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
          keywords: ["重大历史事件解析", "哲学思想专题探讨", "古代文明发展研究", "思想家传记精选", "历史人物影响评价", "哲学流派体系介绍", "文化传承研究案例", "历史考古发现分享", "哲学经典原文解读", "思想史系统梳理", "历史文献考证方法", "哲学问题实用讨论", "文化比较研究方法", "历史研究方法论", "哲学应用实践案例"]
        },
        psychology: {
          name: "心理学",
          description: "心理健康、行为分析、心理学知识等",
          keywords: ["心理咨询实用技巧", "情绪管理科学方法", "人际沟通与关系处理", "心理疾病治疗方案", "行为心理学实验案例", "认知心理学应用场景", "儿童心理发展指南", "职场心理调适方法", "恋爱心理学分析", "压力缓解训练方法", "心理测评工具使用", "心理治疗案例分析", "社会心理学研究方法", "心理危机干预指南", "心理健康教育课程"]
        },
        social_issues: {
          name: "社会议题",
          description: "社会现象、公共话题、时事评论等",
          keywords: ["社会热点事件解析", "时事新闻深度评论", "社会现象调查分析", "公共政策研讨", "民生问题案例研究", "社会发展趋势分析", "城市治理经验分享", "社会公平与正义讨论", "人口政策影响案例", "教育制度改革案例", "医疗体系改革分析", "住房政策研究", "就业形势数据分析", "社会保障制度研究", "社会创新实践案例"]
        },
        law_politics: {
          name: "法律政治",
          description: "法律知识、政治制度、公共政策等",
          keywords: ["典型法律案例解析", "政治制度对比研究", "政策法规解读技巧", "宪法知识普及讲解", "国际法案例分析", "政治体制改革方案", "法律实务操作指南", "政策影响评估方法", "法律制度建设案例", "政治理论专题探讨", "法律维权实用技巧", "政策制定流程分析", "国际政治关系解析", "法律职业发展路径", "政治参与形式分析"]
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
          keywords: ["家常菜具体做法", "烘焙详细教程", "火锅底料配方解析", "餐厅美食点评", "地方小吃制作技巧", "营养搭配食谱", "调味料使用教程", "食材挑选指南", "厨房工具使用方法", "美食摄影拍摄技巧", "地方特色菜制作", "素食料理详细步骤", "饮品调制配方", "美食文化背景介绍", "厨房收纳整理技巧"]
        },
        travel_adventure: {
          name: "旅行探险",
          description: "旅游攻略、探险体验、地方文化等",
          keywords: ["旅行线路详细规划", "探险装备使用指南", "景点门票预订攻略", "文化体验活动推荐", "旅行摄影技巧教学", "酒店住宿评价与选择", "当地美食体验分享", "旅行路线优化策略", "户外探险技巧教程", "文化遗产参观指南", "旅行预算管理技巧", "旅行安全注意事项", "民俗文化体验", "旅行装备清单准备", "旅行保险购买攻略"]
        },
        fashion_beauty: {
          name: "时尚美妆",
          description: "时尚搭配、美妆护肤、潮流趋势等",
          keywords: ["服装搭配实用技巧", "美妆产品真实测评", "护肤步骤详细教程", "潮流趋势分析报告", "化妆技巧实操教学", "发型设计灵感推荐", "服饰搭配指南", "美妆工具使用方法", "护肤成分解析与推荐", "知名时尚品牌介绍", "美妆博主推荐案例", "护肤误区纠正指南", "时尚摄影技巧实操", "美妆产品选购指南", "时尚文化背景解读"]
        },
        home_decor: {
          name: "家居装饰",
          description: "家居设计、装修装饰、生活用品等",
          keywords: ["家居设计风格解析", "装修材料选择技巧", "装饰品搭配方法", "家具选购实用指南", "生活用品推荐与评测", "室内设计布局案例", "装修预算规划方法", "家居收纳整理方案", "软装搭配技巧分享", "家居风水布局解析", "装修施工流程指导", "家居品牌推荐案例", "生活用品使用评测", "DIY家居制作教程", "家居保养与维护技巧"]
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
          keywords: ["高效学习方法实操", "记忆力训练方法", "时间管理技巧教程", "学习计划制定实例", "知识整理技巧", "学习效率提升方案", "考试复习策略分享", "学习动机培养方法", "知识体系搭建案例", "学习环境优化技巧", "学习工具实用教程", "学习方法测评案例", "良好学习习惯养成", "知识应用实战", "学习成果评估方法"]
        },
        career_dev: {
          name: "职业发展",
          description: "职场技能、职业规划、工作经验等",
          keywords: ["职场技能提升案例", "职业规划详细指南", "职场工作经验分享", "面试技巧实操", "简历制作模板与指导", "职场人际沟通技巧", "职业转型策略", "薪资谈判技巧分享", "职场礼仪规范讲解", "职业发展路径分析", "工作压力管理方法", "职业倦怠预防指南", "职场沟通实用技巧", "职业资格证书获取方法", "创业经验分享案例"]
        },
        skill_training: {
          name: "技能培训",
          description: "专业技能、实用技能、培训课程等",
          keywords: ["专业技能培训课程", "实用技能学习方法", "在线课程精选推荐", "专业能力提升指南", "技能认证考试指导", "培训课程设计案例", "技能学习高效方法", "专业工具使用教程", "技能实践项目分享", "培训效果评估方法", "技能竞赛参与案例", "专业技能测评标准", "技能应用案例分析", "培训资源推荐平台", "技能发展路径规划"]
        },
        parenting_education: {
          name: "亲子教育",
          description: "育儿知识、家庭教育、儿童成长等",
          keywords: ["育儿知识具体方法", "亲子活动设计方案", "家庭教育技巧分享", "儿童成长指导案例", "教育理念解析与实践", "亲子沟通实用技巧", "儿童心理发展分析", "家庭教育真实案例", "育儿经验交流分享", "儿童教育游戏推荐", "亲子阅读推广方法", "家庭教育资源整理", "儿童行为管理技巧", "亲子关系维护方案", "家庭教育规划方法"]
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
          keywords: ["创业经验分享案例", "投资理念实用解析", "商业模式设计方法", "企业发展战略案例", "资本运作技巧分享", "融资渠道选择指南", "创业项目评估方法", "投资风险控制策略", "商业计划书撰写案例", "创业团队建设方法", "市场调研实操方法", "投资组合管理技巧", "创业政策解读案例", "投资成功案例分析", "商业创新思维训练"]
        },
        market_analysis: {
          name: "市场分析",
          description: "市场趋势、行业分析、商业洞察等",
          keywords: ["市场趋势数据分析", "行业研究报告解读", "商业洞察案例分享", "市场调研方法实操", "商业分析工具使用", "市场研究技巧分享", "行业竞争态势分析", "市场预测模型应用", "商业数据解析技巧", "市场机会识别方法", "行业发展趋势分析", "商业策略制定指南", "市场风险评估方法", "商业案例实战分析", "市场调研报告制作"]
        },
        economic_trends: {
          name: "经济趋势",
          description: "经济形势、宏观经济、政策影响等",
          keywords: ["经济形势深度分析", "宏观经济政策解读", "政策影响评估方法", "经济趋势预测案例", "金融政策解析", "经济数据分析方法", "货币政策研究", "财政政策影响分析", "经济周期研究案例", "通货膨胀趋势分析", "经济增长模式解析", "经济结构调整案例", "国际经济关系研究", "经济风险评估方法", "经济政策建议案例"]
        },
        personal_finance: {
          name: "理财规划",
          description: "个人理财、财务规划、投资建议等",
          keywords: ["个人理财规划实例", "财务规划技巧教程", "投资理财具体建议", "财富管理实用方法", "资产配置策略案例", "理财产品分析评测", "投资风险评估方法", "财务自由规划方案", "税务筹划实用技巧", "保险产品选择指南", "退休金规划方法", "子女教育金规划技巧", "房产投资分析案例", "基金投资操作方法", "股票投资入门教程"]
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
          keywords: ["电子游戏通关攻略", "电竞比赛直播解说", "竞技游戏实战技巧", "游戏文化分析", "比赛战术策略解析", "娱乐游戏推荐合集", "知名游戏主播推荐", "游戏评测与分析", "电竞产业发展趋势", "游戏开发技术分享", "游戏剧情解析与讲解", "游戏音乐欣赏指南", "游戏周边产品推荐", "游戏社区交流技巧", "游戏历史发展回顾"]
        },
        sports: {
          name: "体育运动",
          description: "体育赛事、运动健身、体育文化等",
          keywords: ["体育赛事直播回顾", "运动健身训练指导", "比赛战术策略分析", "体育文化背景解读", "运动健身计划制定", "足球比赛战术讲解", "欧冠赛事精彩回顾", "篮球技能训练教程", "健身器材使用方法", "体育明星访谈精选", "运动营养搭配方案", "体育场馆设施介绍", "运动损伤预防技巧", "体育产业发展分析", "运动装备使用与推荐"]
        },
        variety_shows: {
          name: "综艺娱乐",
          description: "综艺节目、娱乐节目、明星八卦等",
          keywords: ["热门综艺节目推荐", "娱乐节目点评解析", "明星八卦新闻精选", "娱乐资讯分享与分析", "节目制作幕后揭秘", "明星访谈精彩片段", "综艺节目策划案例", "娱乐产业发展趋势", "明星生活经验分享", "节目收视率分析方法", "娱乐新闻评论解读", "综艺节目剪辑技巧", "明星时尚穿搭指南", "娱乐营销策略案例", "节目嘉宾详细介绍"]
        },
        comedy_humor: {
          name: "搞笑幽默",
          description: "幽默内容、搞笑视频、段子等",
          keywords: ["搞笑视频精选合集", "幽默段子分享精选", "喜剧表演视频欣赏", "趣味内容推荐", "搞笑娱乐合集精选", "网友神评论整理", "搞笑图片幽默分享", "幽默故事讲述合集", "喜剧电影推荐解析", "搞笑配音作品精选", "幽默对话集锦分享", "搞笑表情包使用教程", "喜剧小品表演精选", "创意幽默广告案例", "搞笑综艺精彩片段"]
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
  
  // 重新注入内容脚本到所有匹配的标签页
  setTimeout(async () => {
    try {
      const contentScripts = chrome.runtime.getManifest().content_scripts;
      for (const cs of contentScripts) {
        const tabs = await chrome.tabs.query({ url: cs.matches });
        for (const tab of tabs) {
          const target = { tabId: tab.id, allFrames: cs.all_frames };
          if (cs.js) {
            chrome.scripting.executeScript({
              target,
              files: cs.js,
            }).catch(error => {
              console.log(`重新注入脚本到标签页 ${tab.id} 失败:`, error.message);
            });
          }
          if (cs.css) {
            chrome.scripting.insertCSS({
              target,
              files: cs.css,
            }).catch(error => {
              console.log(`重新注入CSS到标签页 ${tab.id} 失败:`, error.message);
            });
          }
        }
      }
      console.log('✅ 内容脚本重新注入完成');
    } catch (error) {
      console.error('❌ 重新注入内容脚本失败:', error);
    }
  }, 1000); // 延迟1秒执行
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
    console.log('🔄 开始基于历史记录生成AI推荐...');
    console.log('📊 总行为记录数:', behaviorHistory.length);
    
    if (behaviorHistory.length < 5) {
      console.log('⚠️ 行为记录不足5条，跳过推荐生成');
      return;
    }

    // 分析AI分类的行为记录
    const aiClassifiedBehaviors = behaviorHistory.filter(record => record.classification);
    console.log('🤖 AI分类记录数:', aiClassifiedBehaviors.length);
    
    if (aiClassifiedBehaviors.length >= 3) {
      console.log('✅ AI分类记录充足，开始生成智能推荐');
      // 使用AI分类结果生成推荐
      const recommendations = generateAIBasedRecommendations(aiClassifiedBehaviors);
      
      // 保存推荐结果
      chrome.storage.local.set({ recommendations }, () => {
        console.log('💾 推荐内容已保存到存储');
      });
      
      // 检查是否需要显示提示
      checkPromptNeed(behaviorHistory);
    } else {
      console.log('⚠️ AI分类记录不足3条，无法生成智能推荐');
      // 如果没有足够的AI分类数据，生成默认推荐
      const defaultRecommendations = getDefaultRecommendations();
      chrome.storage.local.set({ recommendations: defaultRecommendations }, () => {
        console.log('💾 默认推荐内容已保存到存储');
      });
    }
}

// 基于AI分类结果生成推荐
function generateAIBasedRecommendations(aiClassifiedBehaviors) {
  console.log('🎯 开始生成AI推荐，基于', aiClassifiedBehaviors.length, '条行为记录');
  
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
  
  console.log('📊 用户兴趣分布:', categoryCount);
  
  // 找出用户较少涉及的类别
  const allMainCategories = CategorySchema ? CategorySchema.getMainCategories() : [];
  const recommendations = [];
  
  allMainCategories.forEach(category => {
    const userCount = categoryCount[category.id] || 0;
    const totalUserBehaviors = aiClassifiedBehaviors.length;
    const ratio = totalUserBehaviors > 0 ? userCount / totalUserBehaviors : 0;
    
    console.log(`📈 ${category.name}: ${userCount}/${totalUserBehaviors} = ${(ratio * 100).toFixed(1)}%`);
    
    // 如果用户在该类别的行为占比较低，推荐该类别
    if (ratio < 0.3) {
      console.log(`🎯 推荐类别: ${category.name} (占比${(ratio * 100).toFixed(1)}% < 30%)`);
      
      // 获取该主类别下的所有子类别及其关键词
      const subCategories = CategorySchema.CATEGORY_SCHEMA[category.id]?.subcategories || {};
      
      // 遍历所有子类别，收集关键词
      Object.keys(subCategories).forEach(subKey => {
        const subCategory = subCategories[subKey];
        if (subCategory.keywords && subCategory.keywords.length > 0) {
          // 随机选择1-2个关键词（避免推荐过多）
          const numKeywords = Math.min(2, Math.max(1, Math.floor(Math.random() * 2) + 1));
          const shuffledKeywords = [...subCategory.keywords].sort(() => 0.5 - Math.random());
          const selectedKeywords = shuffledKeywords.slice(0, numKeywords);
          
          selectedKeywords.forEach(keyword => {
            recommendations.push({
              keyword: keyword,
              category: category.name,
              subCategory: subCategory.name,
              reason: '增加内容多样性',
              diversityScore: 1 - ratio
            });
          });
          
          console.log(`  📝 ${subCategory.name}: 选择${numKeywords}个关键词`);
        }
      });
    }
  });
  
  console.log('📋 收集到', recommendations.length, '个推荐项');
  
  // 按多样性得分排序，随机打乱，返回前6个具体关键词
  const finalRecommendations = recommendations
    .sort((a, b) => b.diversityScore - a.diversityScore)
    .sort(() => 0.5 - Math.random()) // 随机打乱
    .slice(0, 6)
    .map(item => item.keyword);
  
  console.log('✅ 最终推荐关键词:', finalRecommendations);
  return finalRecommendations;
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
  console.log('📝 生成默认推荐内容');
  
  if (tags && tags.length > 0) {
    // 基于输入标签生成相关推荐
    const tagBasedRecommendations = tags.map(tag => `${tag}相关内容`);
    console.log('🏷️ 基于标签的推荐:', tagBasedRecommendations);
    return tagBasedRecommendations;
  } else {
    // 从所有类别中随机选择一些具体的关键词作为默认推荐
    const defaultRecommendations = [];
    const allCategories = CategorySchema ? CategorySchema.CATEGORY_SCHEMA : {};
    
    // 随机选择几个主类别
    const categoryKeys = Object.keys(allCategories);
    const shuffledCategories = categoryKeys.sort(() => 0.5 - Math.random());
    const selectedCategories = shuffledCategories.slice(0, 3);
    
    selectedCategories.forEach(categoryKey => {
      const category = allCategories[categoryKey];
      const subCategoryKeys = Object.keys(category.subcategories);
      const randomSubKey = subCategoryKeys[Math.floor(Math.random() * subCategoryKeys.length)];
      const subCategory = category.subcategories[randomSubKey];
      
      if (subCategory.keywords && subCategory.keywords.length > 0) {
        const randomKeyword = subCategory.keywords[Math.floor(Math.random() * subCategory.keywords.length)];
        defaultRecommendations.push(randomKeyword);
      }
    });
    
    // 如果收集的关键词不够，添加一些通用推荐
    while (defaultRecommendations.length < 4) {
      const fallbackKeywords = [
        "ChatGPT使用技巧", "故宫文物修复", "量子物理实验", "心理咨询技巧",
        "家常菜制作", "旅游攻略制作", "高效学习方法", "创业经验分享"
      ];
      const randomFallback = fallbackKeywords[Math.floor(Math.random() * fallbackKeywords.length)];
      if (!defaultRecommendations.includes(randomFallback)) {
        defaultRecommendations.push(randomFallback);
      }
    }
    
    console.log('🎲 默认多样化推荐:', defaultRecommendations);
    return defaultRecommendations;
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


