// AI驱动的两步式分类器
// 第一步：确定主类别，第二步：细分子类别

class AIClassifier {
  constructor(apiClient, categorySchema) {
    this.apiClient = apiClient;
    this.categorySchema = categorySchema;
    this.classificationCache = new Map();
    this.confidenceThreshold = 0.7;
    this.fallbackEnabled = true;
  }

  // 主要分类方法：两步式分类
  async classifyContent(content) {
    console.log('🚀 ===== AI分类开始 =====');
    console.log('📝 输入内容:', {
      title: content.title?.substring(0, 50) + (content.title?.length > 50 ? '...' : ''),
      description: content.description?.substring(0, 50) + (content.description?.length > 50 ? '...' : ''),
      tags: content.tags,
      platform: content.platform,
      rawTextLength: content.rawText?.length || 0
    });

    if (!content || !content.rawText || content.rawText.length < 10) {
      console.error('❌ 内容不足，无法进行分类');
      throw new Error('内容不足，无法进行分类');
    }

    // 检查缓存
    const cacheKey = this.generateCacheKey(content.rawText);
    if (this.classificationCache.has(cacheKey)) {
      const cachedResult = this.classificationCache.get(cacheKey);
      console.log('💾 使用缓存的分类结果:', cachedResult.classificationPath);
      console.log('🏁 ===== AI分类结束（缓存） =====');
      return cachedResult;
    }

    try {
      console.log('🎯 开始第一步：主类别分类...');
      // 第一步：确定主类别
      const mainCategoryResult = await this.classifyMainCategory(content);
      console.log('✅ 主类别分类完成:', {
        category: mainCategoryResult.category,
        categoryName: mainCategoryResult.categoryName,
        confidence: mainCategoryResult.confidence,
        reasoning: mainCategoryResult.reasoning
      });
      
      console.log('🎯 开始第二步：子类别分类...');
      // 第二步：确定子类别
      const subCategoryResult = await this.classifySubCategory(
        content, 
        mainCategoryResult.category
      );
      console.log('✅ 子类别分类完成:', {
        category: subCategoryResult.category,
        categoryName: subCategoryResult.categoryName,
        confidence: subCategoryResult.confidence,
        reasoning: subCategoryResult.reasoning
      });

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
        contentSummary: content.rawText.substring(0, 100) + (content.rawText.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString(),
        method: 'ai_two_step'
      };

      console.log('🔍 验证分类结果...');
      // 验证分类结果
      const validation = this.validateClassificationResult(finalResult);
      if (!validation.valid) {
        console.warn('❌ 分类结果验证失败:', validation.error);
        if (this.fallbackEnabled) {
          console.log('🔄 启用备用分类方法...');
          const fallbackResult = this.fallbackClassification(content);
          console.log('🏁 ===== AI分类结束（备用） =====');
          return fallbackResult;
        }
        throw new Error(validation.error);
      }

      console.log('✅ 分类结果验证通过');
      console.log('💾 缓存分类结果...');
      // 缓存结果
      this.classificationCache.set(cacheKey, finalResult);
      
      console.log('🎉 AI分类成功完成!');
      console.log('📊 最终结果:', {
        classificationPath: finalResult.classificationPath,
        overallConfidence: finalResult.overallConfidence,
        method: finalResult.method
      });
      console.log('🏁 ===== AI分类结束 =====');
      
      return finalResult;

    } catch (error) {
      console.error('❌ AI分类失败:', error);
      
      if (this.fallbackEnabled) {
        console.log('🔄 使用备用分类方法...');
        const fallbackResult = this.fallbackClassification(content);
        console.log('🏁 ===== AI分类结束（备用） =====');
        return fallbackResult;
      }
      
      console.log('💥 AI分类完全失败，抛出错误');
      console.log('🏁 ===== AI分类结束（失败） =====');
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

    console.log('📤 主类别分类 - 发送API请求...');
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

    const response = await this.apiClient.chatCompletion(messages, {
      temperature: 0.3,
      max_tokens: 500
    });

    console.log('📥 主类别分类 - API响应收到');
    console.log('🔤 主类别分类 - 原始响应:', response.choices[0].message.content);
    
    const result = this.parseClassificationResponse(response.choices[0].message.content, 'main');
    console.log('✅ 主类别分类 - 解析完成');
    
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

    console.log(`📊 子类别分类 - 可选子类别数量: ${subCategories.length}`);
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

    console.log('📤 子类别分类 - 发送API请求...');
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

    const response = await this.apiClient.chatCompletion(messages, {
      temperature: 0.2,
      max_tokens: 400
    });

    console.log('📥 子类别分类 - API响应收到');
    console.log('🔤 子类别分类 - 原始响应:', response.choices[0].message.content);
    
    const result = this.parseClassificationResponse(response.choices[0].message.content, 'sub');
    console.log('✅ 子类别分类 - 解析完成');
    
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

      console.log(`✅ ${type}分类响应 - 提取到JSON`);
      const result = JSON.parse(jsonMatch[0]);
      
      // 验证必需字段
      if (!result.category || !result.categoryName || result.confidence === undefined) {
        console.error(`❌ ${type}分类响应缺少必需字段:`, result);
        throw new Error('响应缺少必需字段');
      }

      // 验证置信度范围
      if (result.confidence < 0 || result.confidence > 1) {
        console.log(`⚠️ ${type}分类置信度超出范围，进行修正: ${result.confidence}`);
        result.confidence = Math.max(0, Math.min(1, result.confidence));
      }

      console.log(`✅ ${type}分类响应解析成功:`, {
        category: result.category,
        categoryName: result.categoryName,
        confidence: result.confidence
      });

      return result;

    } catch (error) {
      console.error(`❌ 解析${type}分类响应失败:`, error);
      console.log('🔤 原始响应内容:', responseContent);
      
      // 尝试备用解析方法
      console.log(`🔄 尝试${type}分类备用解析方法...`);
      return this.parseResponseFallback(responseContent, type);
    }
  }

  // 备用响应解析
  parseResponseFallback(responseContent, type) {
    const text = responseContent.toLowerCase();
    
    // 根据类型选择备用策略
    if (type === 'main') {
      const categories = this.categorySchema.getMainCategories();
      
      for (const cat of categories) {
        if (text.includes(cat.name.toLowerCase()) || text.includes(cat.id.toLowerCase())) {
          return {
            category: cat.id,
            categoryName: cat.name,
            confidence: 0.6,
            reasoning: '备用解析方法识别'
          };
        }
      }
      
      // 默认返回第一个类别
      return {
        category: categories[0].id,
        categoryName: categories[0].name,
        confidence: 0.3,
        reasoning: '备用解析，默认分类'
      };
    } else {
      // 子类别备用解析
      throw new Error('子类别解析失败，无法使用备用方法');
    }
  }

  // 验证分类结果
  validateClassificationResult(result) {
    // 验证主类别
    const mainCategories = this.categorySchema.getMainCategories();
    const validMainCategory = mainCategories.find(cat => cat.id === result.mainCategory.id);
    
    if (!validMainCategory) {
      return { valid: false, error: `无效的主类别: ${result.mainCategory.id}` };
    }

    // 验证子类别
    const subCategories = this.categorySchema.getSubcategories(result.mainCategory.id);
    const validSubCategory = subCategories.find(cat => cat.id === result.subCategory.id);
    
    if (!validSubCategory) {
      return { valid: false, error: `无效的子类别: ${result.subCategory.id}` };
    }

    // 验证置信度
    if (result.overallConfidence < this.confidenceThreshold) {
      return { 
        valid: false, 
        error: `分类置信度过低: ${result.overallConfidence} < ${this.confidenceThreshold}` 
      };
    }

    return { valid: true };
  }

  // 备用分类方法（基于关键词匹配）
  fallbackClassification(content) {
    console.log('使用备用关键词分类方法');
    
    const matches = this.categorySchema.findCategoriesByKeywords(content.rawText);
    
    if (matches.length === 0) {
      // 默认分类
      return {
        mainCategory: {
          id: 'lifestyle',
          name: '生活方式',
          confidence: 0.3,
          reasoning: '备用分类：默认分类'
        },
        subCategory: {
          id: 'food_cooking',
          name: '美食烹饪',
          confidence: 0.3,
          reasoning: '备用分类：默认子分类'
        },
        overallConfidence: 0.3,
        classificationPath: '生活方式 > 美食烹饪',
        contentSummary: content.rawText.substring(0, 100),
        timestamp: new Date().toISOString(),
        method: 'keyword_fallback'
      };
    }

    const bestMatch = matches[0];
    const mainCategoryInfo = this.categorySchema.CATEGORY_SCHEMA[bestMatch.mainCategory];
    const subCategoryInfo = mainCategoryInfo.subcategories[bestMatch.subCategory];

    return {
      mainCategory: {
        id: bestMatch.mainCategory,
        name: mainCategoryInfo.name,
        confidence: Math.min(0.8, bestMatch.score * 0.1 + 0.5),
        reasoning: `关键词匹配，得分: ${bestMatch.score}`
      },
      subCategory: {
        id: bestMatch.subCategory,
        name: subCategoryInfo.name,
        confidence: Math.min(0.8, bestMatch.score * 0.1 + 0.5),
        reasoning: `关键词匹配，得分: ${bestMatch.score}`
      },
      overallConfidence: Math.min(0.8, bestMatch.score * 0.1 + 0.5),
      classificationPath: `${mainCategoryInfo.name} > ${subCategoryInfo.name}`,
      contentSummary: content.rawText.substring(0, 100),
      timestamp: new Date().toISOString(),
      method: 'keyword_fallback'
    };
  }

  // 批量分类
  async batchClassify(contentList, options = {}) {
    const { batchSize = 3, delay = 2000 } = options;
    const results = [];
    
    for (let i = 0; i < contentList.length; i += batchSize) {
      const batch = contentList.slice(i, i + batchSize);
      console.log(`处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(contentList.length / batchSize)}`);
      
      const batchPromises = batch.map(async (content, index) => {
        try {
          await new Promise(resolve => setTimeout(resolve, index * 500)); // 批次内错开
          return await this.classifyContent(content);
        } catch (error) {
          console.error(`批次${i + index}分类失败:`, error);
          return this.fallbackClassification(content);
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : null));
      
      // 批次间延迟
      if (i + batchSize < contentList.length) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  // 生成缓存键
  generateCacheKey(text) {
    // 使用文本的哈希值作为缓存键
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').substring(0, 200);
    return btoa(encodeURIComponent(normalized)).substring(0, 32);
  }

  // 设置配置
  setConfig(config) {
    if (config.confidenceThreshold !== undefined) {
      this.confidenceThreshold = Math.max(0.1, Math.min(1.0, config.confidenceThreshold));
    }
    if (config.fallbackEnabled !== undefined) {
      this.fallbackEnabled = config.fallbackEnabled;
    }
  }

  // 获取统计信息
  getStats() {
    return {
      cacheSize: this.classificationCache.size,
      confidenceThreshold: this.confidenceThreshold,
      fallbackEnabled: this.fallbackEnabled,
      supportedCategories: {
        main: this.categorySchema.getMainCategories().length,
        total: this.categorySchema.getFlatCategories().length
      }
    };
  }

  // 清空缓存
  clearCache() {
    this.classificationCache.clear();
  }
}

// 分类结果分析器
class ClassificationAnalyzer {
  static analyzeResults(results) {
    const analysis = {
      total: results.length,
      successful: 0,
      failed: 0,
      averageConfidence: 0,
      methodDistribution: {},
      categoryDistribution: {},
      lowConfidenceResults: []
    };

    let totalConfidence = 0;

    results.forEach(result => {
      if (result && result.overallConfidence !== undefined) {
        analysis.successful++;
        totalConfidence += result.overallConfidence;
        
        // 方法分布
        const method = result.method || 'unknown';
        analysis.methodDistribution[method] = (analysis.methodDistribution[method] || 0) + 1;
        
        // 类别分布
        const categoryPath = result.classificationPath || 'unknown';
        analysis.categoryDistribution[categoryPath] = (analysis.categoryDistribution[categoryPath] || 0) + 1;
        
        // 低置信度结果
        if (result.overallConfidence < 0.6) {
          analysis.lowConfidenceResults.push({
            content: result.contentSummary,
            confidence: result.overallConfidence,
            path: categoryPath
          });
        }
      } else {
        analysis.failed++;
      }
    });

    analysis.averageConfidence = analysis.successful > 0 ? totalConfidence / analysis.successful : 0;
    
    return analysis;
  }

  static generateReport(analysis) {
    return `
分类结果分析报告
================
总数量: ${analysis.total}
成功分类: ${analysis.successful} (${((analysis.successful / analysis.total) * 100).toFixed(1)}%)
失败分类: ${analysis.failed} (${((analysis.failed / analysis.total) * 100).toFixed(1)}%)
平均置信度: ${(analysis.averageConfidence * 100).toFixed(1)}%

分类方法分布:
${Object.entries(analysis.methodDistribution)
  .map(([method, count]) => `  ${method}: ${count}`)
  .join('\n')}

主要类别分布:
${Object.entries(analysis.categoryDistribution)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10)
  .map(([category, count]) => `  ${category}: ${count}`)
  .join('\n')}

低置信度结果数量: ${analysis.lowConfidenceResults.length}
`;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AIClassifier,
    ClassificationAnalyzer
  };
} else if (typeof window !== 'undefined') {
  window.AIClassifier = AIClassifier;
  window.ClassificationAnalyzer = ClassificationAnalyzer;
}