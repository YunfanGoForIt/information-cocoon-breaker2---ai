# AI驱动的信息茧房破除系统 - 设置指南

## 🎯 系统概述

本系统实现了基于AI大模型的两步式视频内容分类，通过智能分析替代固定标签池，提供更精准的内容分类和多样化推荐。

## 📁 文件结构

```
information-cocoon-breaker2/
├── category-schema.js      # 3级层级分类体系定义
├── api-client.js          # OpenAI兼容API客户端
├── ai-classifier.js       # AI两步式分类器
├── content-extractor.js   # 增强内容提取器
├── background.js          # 背景脚本（已集成AI功能）
├── content.js            # 内容脚本（已增强）
├── manifest.json         # 扩展清单（已更新）
└── README-AI-Setup.md    # 本文档
```

## 🔧 系统特性

### 1. 智能内容提取
- 支持多平台：抖音、小红书、快手、YouTube、TikTok
- 自动提取标题、描述、标签等关键信息
- 内容质量评估和智能增强

### 2. 两步式AI分类
- **第一步**：确定8个主类别之一
- **第二步**：在主类别下细分到32个子类别
- 置信度评估和结果验证

### 3. 分层类别体系
```
8个主类别：
├── 科技创新 (4个子类别)
├── 文化艺术 (4个子类别)  
├── 科学探索 (4个子类别)
├── 社会人文 (4个子类别)
├── 生活方式 (4个子类别)
├── 教育成长 (4个子类别)
├── 商业财经 (4个子类别)
└── 娱乐休闲 (4个子类别)
```

## 🚀 快速开始

### 步骤1：配置API密钥

在浏览器控制台或扩展设置中配置AI API：

```javascript
// 方式1：使用OpenAI API
chrome.runtime.sendMessage({
  action: "updateAIConfig",
  config: {
    enabled: true,
    apiConfig: {
      apiKey: "your-openai-api-key",
      baseUrl: "https://api.openai.com/v1",
      model: "gpt-3.5-turbo"
    }
  }
});

// 方式2：使用其他兼容API
chrome.runtime.sendMessage({
  action: "updateAIConfig", 
  config: {
    enabled: true,
    apiConfig: {
      apiKey: "your-api-key",
      baseUrl: "https://your-api-endpoint/v1",
      model: "your-model-name"
    }
  }
});
```

### 步骤2：测试连接

```javascript
chrome.runtime.sendMessage({
  action: "testAIConnection"
}, (response) => {
  console.log('连接测试结果:', response);
});
```

### 步骤3：查看分类统计

```javascript
chrome.runtime.sendMessage({
  action: "getClassificationStats"
}, (stats) => {
  console.log('分类统计:', stats);
});
```

## 📊 使用示例

### 1. 内容提取示例

```javascript
// 在任意社交媒体页面的控制台运行
const extractor = new ContentExtractor();
const content = extractor.smartExtract();
console.log('提取的内容:', content);

// 输出示例：
{
  platform: "douyin",
  title: "AI技术的最新发展趋势",
  description: "探讨人工智能在各个领域的应用前景和挑战",
  tags: ["AI", "人工智能", "科技"],
  rawText: "AI技术的最新发展趋势 探讨人工智能在各个领域的应用前景和挑战 AI 人工智能 科技"
}
```

### 2. AI分类示例

系统会自动进行分类，结果示例：

```javascript
{
  mainCategory: {
    id: "technology",
    name: "科技创新",
    confidence: 0.89,
    reasoning: "内容主要讨论AI技术发展，属于科技创新类别"
  },
  subCategory: {
    id: "ai_tech", 
    name: "AI技术",
    confidence: 0.92,
    reasoning: "内容具体聚焦于人工智能技术，符合AI技术子类别"
  },
  overallConfidence: 0.905,
  classificationPath: "科技创新 > AI技术"
}
```

## 🔧 配置选项

### 1. API服务商配置

支持多种AI服务：

```javascript
const apiConfigs = {
  // OpenAI官方
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-3.5-turbo"
  },
  
  // Azure OpenAI
  azure: {
    baseUrl: "https://your-resource.openai.azure.com/openai/deployments/your-deployment",
    model: "gpt-35-turbo"
  },
  
  // 国产大模型示例
  domestic: {
    baseUrl: "https://your-domestic-api/v1", 
    model: "your-model"
  }
};
```

### 2. 分类参数调整

```javascript
// 调整置信度阈值
aiClassifier.setConfig({
  confidenceThreshold: 0.7,  // 最低置信度要求
  fallbackEnabled: true      // 启用备用分类方法
});
```

### 3. 缓存设置

```javascript
// 清理分类缓存
aiClassifier.clearCache();

// 查看缓存状态
console.log('缓存统计:', aiClassifier.getStats());
```

## 📈 性能优化

### 1. 请求频率控制
- 每分钟最多20次API调用
- 智能缓存机制减少重复请求
- 自动重试和错误恢复

### 2. 内容质量过滤
- 只对高质量内容进行AI分析
- 质量评分低于40分的内容使用备用方法
- 避免无效API调用

### 3. 批量处理
```javascript
// 批量分类多个内容
const results = await aiClassifier.batchClassify(contentList, {
  batchSize: 3,    // 每批处理3个
  delay: 2000      // 批次间延迟2秒
});
```

## 🔍 故障排除

### 1. API连接问题
```javascript
// 检查API配置
chrome.storage.local.get(['aiApiConfig'], (result) => {
  console.log('当前API配置:', result.aiApiConfig);
});

// 测试网络连接
fetch('https://api.openai.com/v1/models', {
  headers: { 'Authorization': 'Bearer your-api-key' }
}).then(r => r.json()).then(console.log);
```

### 2. 分类结果异常
```javascript
// 查看错误日志
chrome.storage.local.get(['userBehavior'], (result) => {
  const failedClassifications = result.userBehavior.filter(
    b => b.classification && b.classification.method === 'keyword_fallback'
  );
  console.log('降级分类记录:', failedClassifications);
});
```

### 3. 内容提取失败
```javascript
// 检查内容质量
const content = extractor.smartExtract();
const quality = ContentQualityAssessor.assessContent(content);
console.log('内容质量评分:', quality);
```

## 📊 监控和分析

### 1. 分类效果统计
```javascript
chrome.runtime.sendMessage({
  action: "getClassificationStats"
}, (stats) => {
  console.log(`
总分类次数: ${stats.totalClassified}
成功率: ${(stats.successfulClassifications / stats.totalClassified * 100).toFixed(1)}%
平均置信度: ${(stats.averageConfidence * 100).toFixed(1)}%
AI分类比例: ${(stats.classificationRate * 100).toFixed(1)}%
  `);
});
```

### 2. 用户行为分析
```javascript
chrome.storage.local.get(['userBehavior'], (result) => {
  const analyzer = ClassificationAnalyzer;
  const analysis = analyzer.analyzeResults(result.userBehavior);
  console.log(analyzer.generateReport(analysis));
});
```

## 🔮 扩展功能

### 1. 自定义分类体系
可以修改 `category-schema.js` 来定制分类类别：

```javascript
// 添加新的主类别
CATEGORY_SCHEMA.new_category = {
  name: "新类别",
  description: "新类别描述",
  subcategories: {
    sub1: { name: "子类别1", description: "...", keywords: [...] }
  }
};
```

### 2. 多语言支持
系统支持中英文内容分析，可扩展其他语言：

```javascript
// 在prompt中指定语言
const prompt = `Please analyze the following ${language} content...`;
```

### 3. 个性化推荐
基于用户历史行为优化推荐算法：

```javascript
// 自定义推荐权重
function generatePersonalizedRecommendations(userProfile) {
  // 实现个性化推荐逻辑
}
```

## 💡 最佳实践

1. **API密钥安全**：不要在代码中硬编码API密钥
2. **成本控制**：合理设置缓存和过滤策略
3. **用户体验**：提供降级方案确保系统稳定性
4. **隐私保护**：仅发送必要的内容元数据到AI服务
5. **效果监控**：定期检查分类准确性和用户满意度

## 📞 技术支持

如需技术支持，请检查：
1. 浏览器控制台的错误信息
2. 扩展程序的详细日志
3. API服务的响应状态
4. 网络连接和防火墙设置

---

本系统实现了从固定标签池到AI驱动的智能分类的升级，显著提升了内容分类的准确性和推荐的多样性。通过合理配置和使用，能够有效帮助用户破除信息茧房，获得更丰富的内容体验。