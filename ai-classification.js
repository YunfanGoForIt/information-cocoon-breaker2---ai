// AI驱动的视频分类系统
// 集成多个AI服务进行智能内容分析

class AIVideoClassifier {
  constructor() {
    this.apiKeys = {
      openai: '', // 需要配置OpenAI API密钥
      google: '', // 需要配置Google Cloud API密钥
      azure: ''   // 需要配置Azure API密钥
    };
    
    this.classificationCache = new Map();
    this.rateLimiter = new Map();
  }

  // 主要分类方法 - 智能选择最佳AI服务
  async classifyVideoContent(videoData) {
    const cacheKey = this.generateCacheKey(videoData);
    
    // 检查缓存
    if (this.classificationCache.has(cacheKey)) {
      return this.classificationCache.get(cacheKey);
    }

    try {
      let result;
      
      // 根据内容类型和可用性选择最佳AI服务
      if (videoData.hasVisualContent && this.apiKeys.openai) {
        result = await this.classifyWithOpenAI(videoData);
      } else if (this.apiKeys.google) {
        result = await this.classifyWithGoogleVideoAI(videoData);
      } else if (this.apiKeys.azure) {
        result = await this.classifyWithAzureVideoIndexer(videoData);
      } else {
        // 降级到基于规则的分类
        result = this.fallbackClassification(videoData);
      }

      // 缓存结果
      this.classificationCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error('AI分类失败，使用备用方案:', error);
      return this.fallbackClassification(videoData);
    }
  }

  // OpenAI GPT-4V 视频内容分析
  async classifyWithOpenAI(videoData) {
    if (!this.checkRateLimit('openai')) {
      throw new Error('OpenAI API rate limit exceeded');
    }

    const prompt = `
    请分析这个视频内容并提供分类标签。
    视频信息：
    - 标题: ${videoData.title || '未知'}
    - 描述: ${videoData.description || '未知'}
    - 已有标签: ${videoData.existingTags?.join(', ') || '无'}
    
    请返回JSON格式的分类结果：
    {
      "primaryCategory": "主要类别",
      "secondaryCategories": ["次要类别1", "次要类别2"],
      "contentTags": ["内容标签1", "内容标签2", "内容标签3"],
      "diversityLevel": "多样性评分(1-10)",
      "recommendedAlternatives": ["推荐的多样化标签1", "推荐的多样化标签2"]
    }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKeys.openai}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...(videoData.thumbnails ? videoData.thumbnails.map(url => ({
                type: 'image_url',
                image_url: { url }
              })) : [])
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  // Google Video Intelligence API
  async classifyWithGoogleVideoAI(videoData) {
    if (!this.checkRateLimit('google')) {
      throw new Error('Google API rate limit exceeded');
    }

    const response = await fetch(`https://videointelligence.googleapis.com/v1/videos:annotate?key=${this.apiKeys.google}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputUri: videoData.videoUrl,
        features: [
          'LABEL_DETECTION',
          'OBJECT_TRACKING',
          'TEXT_DETECTION',
          'FACE_DETECTION'
        ],
        videoContext: {
          labelDetectionConfig: {
            labelDetectionMode: 'SHOT_AND_FRAME_MODE',
            stationaryCamera: false
          }
        }
      })
    });

    const result = await response.json();
    return this.processGoogleResponse(result);
  }

  // Azure Video Indexer
  async classifyWithAzureVideoIndexer(videoData) {
    if (!this.checkRateLimit('azure')) {
      throw new Error('Azure API rate limit exceeded');
    }

    // Azure Video Indexer 实现
    const response = await fetch(`https://api.videoindexer.ai/trial/Accounts/{accountId}/Videos`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKeys.azure,
        'Content-Type': 'multipart/form-data'
      },
      body: this.createAzureRequestBody(videoData)
    });

    const result = await response.json();
    return this.processAzureResponse(result);
  }

  // 备用分类方法（基于规则和关键词）
  fallbackClassification(videoData) {
    const keywordMappings = {
      technology: ['AI', '人工智能', '科技', '编程', '互联网', '数字化', '算法'],
      culture_arts: ['文化', '艺术', '音乐', '电影', '文学', '历史', '传统'],
      science_nature: ['科学', '自然', '环境', '生物', '物理', '化学', '医学'],
      society_humanity: ['社会', '政治', '经济', '法律', '教育', '哲学', '心理'],
      lifestyle_wellness: ['生活', '健康', '运动', '美食', '旅行', '时尚', '家居'],
      education_knowledge: ['教育', '学习', '知识', '技能', '培训', '课程', '研究']
    };

    const text = `${videoData.title} ${videoData.description} ${videoData.existingTags?.join(' ')}`.toLowerCase();
    const categoryScores = {};

    Object.entries(keywordMappings).forEach(([category, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      categoryScores[category] = score;
    });

    const primaryCategory = Object.entries(categoryScores)
      .sort(([,a], [,b]) => b - a)[0][0];

    return {
      primaryCategory,
      secondaryCategories: Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)
        .slice(1, 3)
        .map(([cat]) => cat),
      contentTags: this.extractContentTags(text),
      diversityLevel: this.calculateDiversityScore(categoryScores),
      recommendedAlternatives: this.generateAlternatives(primaryCategory)
    };
  }

  // 处理Google API响应
  processGoogleResponse(response) {
    const labels = response.annotation_results?.[0]?.segment_label_annotations || [];
    const objects = response.annotation_results?.[0]?.object_annotations || [];
    
    return {
      primaryCategory: labels[0]?.entity?.description || 'unknown',
      secondaryCategories: labels.slice(1, 3).map(l => l.entity.description),
      contentTags: [...labels, ...objects].slice(0, 10).map(item => item.entity?.description),
      diversityLevel: this.calculateGoogleDiversityScore(labels),
      recommendedAlternatives: this.generateAlternatives(labels[0]?.entity?.description)
    };
  }

  // 处理Azure API响应
  processAzureResponse(response) {
    const insights = response.insights || {};
    const topics = insights.topics || [];
    const keywords = insights.keywords || [];
    
    return {
      primaryCategory: topics[0]?.name || 'unknown',
      secondaryCategories: topics.slice(1, 3).map(t => t.name),
      contentTags: keywords.slice(0, 10).map(k => k.name),
      diversityLevel: this.calculateAzureDiversityScore(topics),
      recommendedAlternatives: this.generateAlternatives(topics[0]?.name)
    };
  }

  // 速率限制检查
  checkRateLimit(service) {
    const now = Date.now();
    const limit = this.rateLimiter.get(service) || { count: 0, resetTime: now };
    
    if (now > limit.resetTime) {
      this.rateLimiter.set(service, { count: 1, resetTime: now + 60000 }); // 1分钟重置
      return true;
    }
    
    if (limit.count >= 10) { // 每分钟最多10次请求
      return false;
    }
    
    limit.count++;
    return true;
  }

  // 生成缓存键
  generateCacheKey(videoData) {
    const keyData = {
      title: videoData.title,
      description: videoData.description?.substring(0, 100),
      tags: videoData.existingTags?.slice(0, 5)
    };
    return btoa(JSON.stringify(keyData));
  }

  // 计算多样性分数
  calculateDiversityScore(categoryScores) {
    const values = Object.values(categoryScores);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    
    // 如果分布越均匀，多样性分数越高
    return sum > 0 ? Math.round((1 - max / sum) * 10) : 5;
  }

  // 提取内容标签
  extractContentTags(text) {
    const commonTags = [
      '教育', '娱乐', '科技', '生活', '文化', '艺术', '科学', '社会',
      '健康', '运动', '音乐', '电影', '游戏', '美食', '旅行', '时尚'
    ];
    
    return commonTags.filter(tag => text.includes(tag)).slice(0, 5);
  }

  // 生成多样化替代标签
  generateAlternatives(primaryCategory) {
    const alternatives = {
      technology: ['人文思考', '艺术创作', '自然探索', '社会议题'],
      culture_arts: ['科学发现', '技术创新', '健康生活', '社会发展'],
      science_nature: ['文化体验', '艺术欣赏', '技术应用', '社会关怀'],
      society_humanity: ['科技前沿', '自然奇观', '文化传承', '个人成长'],
      lifestyle_wellness: ['学术研究', '科技趋势', '文化探索', '社会现象'],
      education_knowledge: ['生活技巧', '娱乐休闲', '艺术鉴赏', '科学实验']
    };
    
    return alternatives[primaryCategory] || ['多元文化', '跨界思维', '创新实践', '全球视野'];
  }

  // Google多样性分数计算
  calculateGoogleDiversityScore(labels) {
    const categories = new Set(labels.map(l => l.entity?.description?.split(' ')[0]));
    return Math.min(10, categories.size * 2);
  }

  // Azure多样性分数计算
  calculateAzureDiversityScore(topics) {
    const uniqueCategories = new Set(topics.map(t => t.name?.split(' ')[0]));
    return Math.min(10, uniqueCategories.size * 2);
  }
}

// 使用示例和配置
class VideoClassificationService {
  constructor() {
    this.classifier = new AIVideoClassifier();
    this.isInitialized = false;
  }

  async initialize(apiKeys) {
    this.classifier.apiKeys = { ...this.classifier.apiKeys, ...apiKeys };
    this.isInitialized = true;
    console.log('AI视频分类服务已初始化');
  }

  async analyzeVideoContent(videoData) {
    if (!this.isInitialized) {
      console.warn('服务未初始化，使用基本分类');
      return this.classifier.fallbackClassification(videoData);
    }

    try {
      const result = await this.classifier.classifyVideoContent(videoData);
      
      // 记录分析结果用于改进
      this.logAnalysisResult(videoData, result);
      
      return result;
    } catch (error) {
      console.error('视频分析失败:', error);
      return this.classifier.fallbackClassification(videoData);
    }
  }

  logAnalysisResult(input, output) {
    // 可以发送到分析服务器以改进模型
    console.log('分析结果:', {
      input: { title: input.title, tagsCount: input.existingTags?.length },
      output: { category: output.primaryCategory, diversity: output.diversityLevel }
    });
  }

  // 批量分析多个视频
  async batchAnalyze(videoDataList, options = {}) {
    const { batchSize = 5, delay = 1000 } = options;
    const results = [];
    
    for (let i = 0; i < videoDataList.length; i += batchSize) {
      const batch = videoDataList.slice(i, i + batchSize);
      const batchPromises = batch.map(video => this.analyzeVideoContent(video));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : null));
        
        // 批次间延迟，避免API限制
        if (i + batchSize < videoDataList.length) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error('批量分析错误:', error);
      }
    }
    
    return results;
  }
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIVideoClassifier, VideoClassificationService };
} else if (typeof window !== 'undefined') {
  window.VideoClassificationService = VideoClassificationService;
}