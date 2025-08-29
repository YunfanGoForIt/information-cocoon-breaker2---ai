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
    // Technology Innovation
    technology: {
      name: "Technology Innovation",
      description: "Technology development, innovative applications, digital transformation related content",
      subcategories: {
        ai_tech: {
          name: "AI Technology",
          description: "Artificial intelligence, machine learning, deep learning and other AI-related technologies",
          keywords: ["ChatGPT practical tips", "MidJourney painting tutorials", "Python machine learning project examples", "PyTorch deep learning introduction", "Convolutional neural network visualization", "Transformer principle analysis", "AI painting tool reviews", "ChatGPT application cases", "Autonomous driving perception algorithms", "OpenCV vision projects", "Natural language processing application cases", "AI writing assistant tutorials", "Customer service chatbot development", "AI-assisted medical diagnosis demonstrations", "AI educational assistance tools"]
        },
        hardware_tech: {
          name: "Hardware Technology",
          description: "Electronic devices, chips, hardware innovations, etc.",
          keywords: ["iPhone 15 camera performance test", "Kirin chip architecture analysis", "RTX graphics card performance comparison", "MacBook teardown tutorial", "Mobile photography parameter optimization", "5G network speed test", "Apple Watch feature review", "AirPods sound quality analysis", "DIY computer assembly tutorial", "New digital product unboxing videos", "TSMC chip process revealed", "Processor benchmark comparison", "Mobile battery life optimization tips", "Sony camera sensor analysis", "Oculus VR device experience guide"]
        },
        software_dev: {
          name: "Software Development",
          description: "Programming, software engineering, development technologies, etc.",
          keywords: ["Python web scraping project practice", "Vue 3 Composition API tutorial", "Java project practice cases", "React Hooks advanced guide", "MySQL database design examples", "Git common commands practice", "LeetCode programming problem analysis", "Open source project architecture analysis", "Code refactoring best practices", "Flutter cross-platform app development", "Docker container deployment tutorial", "Microservices architecture design cases", "WeChat mini-program practical projects", "Frontend performance optimization tips", "Algorithm visualization tool development"]
        },
        digital_life: {
          name: "Digital Lifestyle",
          description: "Digital applications, smart living, technology experiences, etc.",
          keywords: ["Smart home system setup tutorial", "Essential APP feature recommendations", "Remote work efficiency tools", "Personal cloud storage usage tips", "Smart speaker voice control demonstration", "Robot vacuum review and optimization", "Online learning platform in-depth experience", "Digital payment security practical tips", "Smart wearable device usage insights", "Remote collaboration software operation guide", "Smart door lock installation process", "Smart home appliance remote control tips", "Digital wallet application cases", "Video conferencing software operation tutorial", "Smart lighting system automation"]
        }
      }
    },

    // Culture & Arts
    culture_arts: {
      name: "Culture & Arts",
      description: "Cultural heritage, artistic creation, literature and film related content",
      subcategories: {
        traditional_culture: {
          name: "Traditional Culture",
          description: "Historical culture, traditional arts, folk culture, etc.",
          keywords: ["Forbidden City artifact restoration videos", "Spring Festival folk experience guide", "Ancient architectural art analysis", "Handmade embroidery production tutorial", "Tang poetry and Song lyrics appreciation and interpretation", "Peking opera performance technique analysis", "Hanfu styling tutorial", "Traditional pastry making methods", "Ancient etiquette live demonstration", "Folk instrument performance videos", "Four great classical novels reading guide", "Traditional Chinese painting technique analysis", "Traditional Chinese medicine classic book introduction", "Ancient inventions and technology analysis", "Traditional ceramic production process"]
        },
        modern_arts: {
          name: "Modern Arts",
          description: "Contemporary art, design, creative expression, etc.",
          keywords: ["Contemporary art exhibition reviews", "Modern architectural design case analysis", "Graphic design practical tutorials", "Digital illustration creation process", "Photography composition and lighting techniques", "Digital art works display", "Installation art creation cases", "Modern sculpture design analysis", "Art exhibition curation idea sharing", "Creative thinking training methods", "Modern painting works appreciation", "Art market trend analysis", "Designer interview recordings", "Art education innovation methods", "Cross-border art collaboration cases"]
        },
        literature: {
          name: "Literature & Writing",
          description: "Literary works, writing, poetry and prose, etc.",
          keywords: ["Online novel writing experience", "Modern poetry writing techniques", "Prose writing case analysis", "Literary masterpiece in-depth interpretation", "Writing material organization methods", "Novel character creation methods", "Poetry recitation skill training", "Literary criticism writing methods", "Writer interview selections", "Domestic and international literary award introductions", "Children's literature creation cases", "Science fiction novel writing techniques", "Mystery novel suspense construction", "Translation literature practice cases", "Literary history key points summary"]
        },
        media_film: {
          name: "Music & Film",
          description: "Music, movies, TV series, media content, etc.",
          keywords: ["Popular movie viewing guide", "Classic TV series analysis", "Music creation software tutorials", "Film and TV post-production effects", "Actor performance technique analysis", "Director work creation background analysis", "Movie soundtrack appreciation", "TV series plot in-depth analysis", "Music festival live performance sharing", "Film and TV shooting technique explanation", "Movie box office and market analysis", "Music production DAW software tutorials", "Film and TV special effects production cases", "Actor interview highlights", "Film and TV award ceremonies and analysis"]
        }
      }
    },

    // Science Exploration
    science_exploration: {
      name: "Science Exploration",
      description: "Scientific research, natural exploration, medical health related content",
      subcategories: {
        natural_science: {
          name: "Natural Sciences",
          description: "Physics, chemistry, biology and other basic sciences",
          keywords: ["Quantum mechanics experiment demonstration", "Periodic table fun experiments", "Darwin's evolution theory analysis", "Science experiment video tutorials", "Classical physics law explanation", "Chemical reaction experiment demonstration", "CRISPR gene editing analysis", "Laboratory equipment operation guide", "Laboratory safety operation procedures", "Scientific paper reading techniques", "Famous physicist biographies", "Chemical industry application cases", "Biodiversity protection practices", "Science history anecdotes analysis", "Frontier science technology breakthroughs"]
        },
        medical_health: {
          name: "Medical & Health",
          description: "Medical knowledge, health and wellness, medical technology, etc.",
          keywords: ["Traditional Chinese Medicine health diet plans", "Western medicine diagnosis and treatment technology analysis", "Mental health self-regulation methods", "Nutritional balance health plans", "Fitness training course guidance", "Common disease prevention methods", "Medical equipment usage videos", "Drug mechanism explanation", "Surgical technology development trends", "Rehabilitation treatment case sharing", "Latest medical research progress", "Annual health checkup guide", "First aid skill operation tutorial", "Chronic disease management plans", "Medical ethics case analysis"]
        },
        environment: {
          name: "Environment & Ecology",
          description: "Environmental protection, ecosystems, sustainable development, etc.",
          keywords: ["Climate change scientific analysis", "New environmental technology applications", "Ecological restoration case sharing", "Sustainable development model exploration", "Environmental pollution treatment practices", "Green energy development cases", "Endangered wildlife protection", "Marine ecosystem research", "Forest resource management methods", "Waste sorting and recycling practices", "Clean energy technology display", "Ecological agriculture demonstration projects", "Environmental monitoring equipment usage", "Environmental policy interpretation and impact", "Eco-tourism planning cases"]
        },
        astronomy_geo: {
          name: "Astronomy & Geography",
          description: "Astronomy, geography, space exploration, etc.",
          keywords: ["Astronomical observation technique tutorials", "Landform formation scientific analysis", "Space exploration mission sharing", "Starry sky photography shooting tutorial", "Earth climate change research", "Space station life experience", "Planetary exploration project analysis", "Geological structure analysis cases", "Astronomical telescope usage guide", "Geographic information system practical tutorial", "Universe origin theory explanation", "Earth resource distribution data analysis", "Space technology development progress", "Astrophotography post-processing techniques", "Geographic environment change records"]
        }
      }
    },

    // Society & Humanities
    society_humanity: {
      name: "Society & Humanities",
      description: "Social issues, humanistic thinking, philosophy and psychology related content",
      subcategories: {
        history_philosophy: {
          name: "History & Philosophy",
          description: "Historical events, philosophical thinking, intellectual culture, etc.",
          keywords: ["Major historical event analysis", "Philosophy thought topic discussions", "Ancient civilization development research", "Thinker biography selections", "Historical figure impact evaluation", "Philosophy school system introduction", "Cultural heritage research cases", "Historical archaeological discovery sharing", "Philosophy classic original text interpretation", "Intellectual history systematic sorting", "Historical document verification methods", "Philosophy problem practical discussions", "Cultural comparative research methods", "Historical research methodology", "Philosophy application practice cases"]
        },
        psychology: {
          name: "Psychology",
          description: "Mental health, behavioral analysis, psychological knowledge, etc.",
          keywords: ["Psychological counseling practical techniques", "Emotion management scientific methods", "Interpersonal communication and relationship handling", "Mental illness treatment plans", "Behavioral psychology experimental cases", "Cognitive psychology application scenarios", "Child psychological development guide", "Workplace psychological adjustment methods", "Love psychology analysis", "Stress relief training methods", "Psychological assessment tool usage", "Psychotherapy case analysis", "Social psychology research methods", "Psychological crisis intervention guide", "Mental health education courses"]
        },
        social_issues: {
          name: "Social Issues",
          description: "Social phenomena, public topics, current affairs commentary, etc.",
          keywords: ["Social hot event analysis", "Current affairs news in-depth commentary", "Social phenomenon investigation and analysis", "Public policy discussions", "People's livelihood issue case studies", "Social development trend analysis", "Urban governance experience sharing", "Social equity and justice discussions", "Population policy impact cases", "Education system reform cases", "Healthcare system reform analysis", "Housing policy research", "Employment situation data analysis", "Social security system research", "Social innovation practice cases"]
        },
        law_politics: {
          name: "Law & Politics",
          description: "Legal knowledge, political systems, public policy, etc.",
          keywords: ["Typical legal case analysis", "Political system comparative research", "Policy regulation interpretation techniques", "Constitutional knowledge popularization explanation", "International law case analysis", "Political system reform plans", "Legal practice operation guide", "Policy impact assessment methods", "Legal system construction cases", "Political theory topic discussions", "Legal rights protection practical techniques", "Policy formulation process analysis", "International political relations analysis", "Legal profession development path", "Political participation form analysis"]
        }
      }
    },

    // Lifestyle
    lifestyle: {
      name: "Lifestyle",
      description: "Daily life, personal interests, life skills related content",
      subcategories: {
        food_cooking: {
          name: "Food & Cooking",
          description: "Food preparation, cooking techniques, restaurant recommendations, etc.",
          keywords: ["Home cooking specific methods", "Detailed baking tutorials", "Hot pot base recipe analysis", "Restaurant food reviews", "Local snack preparation techniques", "Nutritional meal recipes", "Seasoning usage tutorials", "Ingredient selection guide", "Kitchen tool usage methods", "Food photography shooting techniques", "Local specialty dish preparation", "Vegetarian cooking detailed steps", "Beverage mixing recipes", "Food culture background introduction", "Kitchen organization tips"]
        },
        travel_adventure: {
          name: "Travel & Adventure",
          description: "Travel guides, adventure experiences, local culture, etc.",
          keywords: ["Detailed travel route planning", "Adventure equipment usage guide", "Attraction ticket booking strategies", "Cultural experience activity recommendations", "Travel photography technique teaching", "Hotel accommodation evaluation and selection", "Local food experience sharing", "Travel route optimization strategies", "Outdoor adventure technique tutorials", "Cultural heritage visit guide", "Travel budget management tips", "Travel safety precautions", "Folk culture experience", "Travel equipment checklist preparation", "Travel insurance purchase strategies"]
        },
        fashion_beauty: {
          name: "Fashion & Beauty",
          description: "Fashion styling, beauty and skincare, trend analysis, etc.",
          keywords: ["Clothing styling practical tips", "Beauty product authentic reviews", "Skincare routine detailed tutorials", "Trend analysis reports", "Makeup technique practical teaching", "Hairstyle design inspiration recommendations", "Clothing styling guide", "Beauty tool usage methods", "Skincare ingredient analysis and recommendations", "Famous fashion brand introductions", "Beauty blogger recommendation cases", "Skincare misconception correction guide", "Fashion photography technique practice", "Beauty product shopping guide", "Fashion culture background interpretation"]
        },
        home_decor: {
          name: "Home & Decoration",
          description: "Home design, renovation and decoration, household items, etc.",
          keywords: ["Home design style analysis", "Renovation material selection tips", "Decoration item matching methods", "Furniture shopping practical guide", "Household item recommendations and reviews", "Interior design layout cases", "Renovation budget planning methods", "Home organization solutions", "Soft furnishing matching tips sharing", "Home feng shui layout analysis", "Renovation construction process guidance", "Home brand recommendation cases", "Household item usage reviews", "DIY home creation tutorials", "Home maintenance and care tips"]
        }
      }
    },

    // Education & Growth
    education_growth: {
      name: "Education & Growth",
      description: "Learning education, personal development, skill enhancement related content",
      subcategories: {
        learning_methods: {
          name: "Learning Methods",
          description: "Learning techniques, educational methods, knowledge acquisition, etc.",
          keywords: ["Effective learning method practice", "Memory training methods", "Time management technique tutorials", "Study plan formulation examples", "Knowledge organization techniques", "Learning efficiency improvement plans", "Exam review strategy sharing", "Learning motivation cultivation methods", "Knowledge system construction cases", "Learning environment optimization tips", "Learning tool practical tutorials", "Learning method evaluation cases", "Good study habit formation", "Knowledge application practice", "Learning outcome assessment methods"]
        },
        career_dev: {
          name: "Career Development",
          description: "Workplace skills, career planning, work experience, etc.",
          keywords: ["Workplace skill improvement cases", "Career planning detailed guide", "Workplace work experience sharing", "Interview technique practice", "Resume creation templates and guidance", "Workplace interpersonal communication skills", "Career transition strategies", "Salary negotiation technique sharing", "Workplace etiquette standard explanation", "Career development path analysis", "Work stress management methods", "Career burnout prevention guide", "Workplace communication practical skills", "Professional qualification certificate acquisition methods", "Entrepreneurship experience sharing cases"]
        },
        skill_training: {
          name: "Skill Training",
          description: "Professional skills, practical skills, training courses, etc.",
          keywords: ["Professional skill training courses", "Practical skill learning methods", "Online course selection recommendations", "Professional ability improvement guide", "Skill certification exam guidance", "Training course design cases", "Skill learning efficient methods", "Professional tool usage tutorials", "Skill practice project sharing", "Training effectiveness evaluation methods", "Skill competition participation cases", "Professional skill assessment standards", "Skill application case analysis", "Training resource recommendation platforms", "Skill development path planning"]
        },
        parenting_education: {
          name: "Parenting & Education",
          description: "Parenting knowledge, family education, child development, etc.",
          keywords: ["Parenting knowledge specific methods", "Parent-child activity design plans", "Family education technique sharing", "Child development guidance cases", "Educational philosophy analysis and practice", "Parent-child communication practical skills", "Child psychological development analysis", "Family education real cases", "Parenting experience exchange sharing", "Children's educational game recommendations", "Parent-child reading promotion methods", "Family education resource organization", "Child behavior management techniques", "Parent-child relationship maintenance plans", "Family education planning methods"]
        }
      }
    },

    // Business & Finance
    business_finance: {
      name: "Business & Finance",
      description: "Business models, investment and finance, economic analysis related content",
      subcategories: {
        entrepreneurship: {
          name: "Entrepreneurship & Investment",
          description: "Entrepreneurial experience, investment philosophy, business models, etc.",
          keywords: ["Entrepreneurship experience sharing cases", "Investment philosophy practical analysis", "Business model design methods", "Enterprise development strategy cases", "Capital operation technique sharing", "Financing channel selection guide", "Startup project evaluation methods", "Investment risk control strategies", "Business plan writing cases", "Startup team building methods", "Market research practical methods", "Investment portfolio management techniques", "Startup policy interpretation cases", "Investment success case analysis", "Business innovation thinking training"]
        },
        market_analysis: {
          name: "Market Analysis",
          description: "Market trends, industry analysis, business insights, etc.",
          keywords: ["Market trend data analysis", "Industry research report interpretation", "Business insight case sharing", "Market research method practice", "Business analysis tool usage", "Market research technique sharing", "Industry competition situation analysis", "Market prediction model application", "Business data analysis techniques", "Market opportunity identification methods", "Industry development trend analysis", "Business strategy formulation guide", "Market risk assessment methods", "Business case practical analysis", "Market research report production"]
        },
        economic_trends: {
          name: "Economic Trends",
          description: "Economic situation, macroeconomics, policy impact, etc.",
          keywords: ["Economic situation in-depth analysis", "Macroeconomic policy interpretation", "Policy impact assessment methods", "Economic trend prediction cases", "Financial policy analysis", "Economic data analysis methods", "Monetary policy research", "Fiscal policy impact analysis", "Economic cycle research cases", "Inflation trend analysis", "Economic growth model analysis", "Economic structure adjustment cases", "International economic relations research", "Economic risk assessment methods", "Economic policy recommendation cases"]
        },
        personal_finance: {
          name: "Financial Planning",
          description: "Personal finance, financial planning, investment advice, etc.",
          keywords: ["Personal financial planning examples", "Financial planning technique tutorials", "Investment finance specific advice", "Wealth management practical methods", "Asset allocation strategy cases", "Financial product analysis and review", "Investment risk assessment methods", "Financial freedom planning solutions", "Tax planning practical techniques", "Insurance product selection guide", "Pension planning methods", "Children's education fund planning tips", "Real estate investment analysis cases", "Fund investment operation methods", "Stock investment beginner tutorials"]
        }
      }
    },

    // Entertainment & Leisure
    entertainment: {
      name: "Entertainment & Leisure",
      description: "Entertainment activities, leisure hobbies, sports competition related content",
      subcategories: {
        gaming: {
          name: "Gaming & Esports",
          description: "Video games, competitive games, gaming culture, etc.",
          keywords: ["Video game walkthrough strategies", "Esports competition live commentary", "Competitive gaming practical techniques", "Gaming culture analysis", "Competition tactical strategy analysis", "Entertainment game recommendation collections", "Famous game streamer recommendations", "Game reviews and analysis", "Esports industry development trends", "Game development technology sharing", "Game plot analysis and explanation", "Game music appreciation guide", "Gaming merchandise recommendations", "Gaming community communication tips", "Gaming history development review"]
        },
        sports: {
          name: "Sports & Fitness",
          description: "Sports events, fitness training, sports culture, etc.",
          keywords: ["Sports event live reviews", "Fitness training guidance", "Competition tactical strategy analysis", "Sports culture background interpretation", "Fitness plan formulation", "Football match tactical explanation", "Champions League highlights review", "Basketball skill training tutorials", "Fitness equipment usage methods", "Sports star interview highlights", "Sports nutrition matching plans", "Sports venue facility introductions", "Sports injury prevention tips", "Sports industry development analysis", "Sports equipment usage and recommendations"]
        },
        variety_shows: {
          name: "Variety & Entertainment",
          description: "Variety shows, entertainment programs, celebrity gossip, etc.",
          keywords: ["Popular variety show recommendations", "Entertainment program commentary analysis", "Celebrity gossip news selections", "Entertainment news sharing and analysis", "Program production behind-the-scenes revelations", "Celebrity interview highlights", "Variety show planning cases", "Entertainment industry development trends", "Celebrity life experience sharing", "Program rating analysis methods", "Entertainment news commentary interpretation", "Variety show editing techniques", "Celebrity fashion styling guide", "Entertainment marketing strategy cases", "Program guest detailed introductions"]
        },
        comedy_humor: {
          name: "Comedy & Humor",
          description: "Humorous content, funny videos, jokes, etc.",
          keywords: ["Funny video selection collections", "Humorous joke sharing selections", "Comedy performance video appreciation", "Interesting content recommendations", "Funny entertainment collection selections", "Netizen divine comment compilations", "Funny picture humor sharing", "Humorous story telling collections", "Comedy movie recommendation analysis", "Funny dubbing work selections", "Humorous dialogue collection sharing", "Funny emoji usage tutorials", "Comedy sketch performance selections", "Creative humorous advertising cases", "Funny variety show highlights"]
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
      console.log('🌐 Sending API request to Zhipu GLM...');
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
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ API response successful');
      return data;
    }
    
    async testConnection() {
      try {
        const result = await this.chatCompletion([
          { role: "user", content: "Test connection, please reply 'Connection successful'" }
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


