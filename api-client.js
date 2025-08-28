// 智谱GLM-4.5 API客户端
// 专门针对智谱大模型优化的简化版本

class AIApiClient {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      model: config.model || 'glm-4.5',
      timeout: config.timeout || 60000, // 60秒超时
      temperature: config.temperature || 0.6
    };
    
    this.requestCache = new Map();
    this.rateLimiter = {
      requests: 0,
      resetTime: Date.now() + 60000 // 1分钟重置
    };
  }

  // 更新配置
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // 检查速率限制
  checkRateLimit() {
    const now = Date.now();
    
    if (now > this.rateLimiter.resetTime) {
      this.rateLimiter.requests = 0;
      this.rateLimiter.resetTime = now + 60000;
    }
    
    if (this.rateLimiter.requests >= 20) { // 每分钟最多20次请求
      throw new Error('API请求频率过高，请稍后再试');
    }
    
    this.rateLimiter.requests++;
    return true;
  }

  // 生成缓存键（使用完整提示词的哈希值）
  generateCacheKey(messages) {
    // 构建完整的请求上下文，包括所有消息的完整内容
    const requestContext = {
      messages: messages.map(m => ({
        role: m.role,
        content: m.content // 使用完整内容，不截断
      })),
      model: this.config.model,
      temperature: this.config.temperature
    };
    
    // 序列化完整上下文
    const fullContent = JSON.stringify(requestContext);
    
    // 使用SHA-256风格的简单哈希算法
    const hash = this.generateHash(fullContent);
    
    console.log('🔑 缓存键生成:', {
      contentLength: fullContent.length,
      hashValue: hash,
      messagesCount: messages.length,
      // 显示前100个字符用于调试
      contentPreview: fullContent.substring(0, 100) + '...'
    });
    
    return hash;
  }
  
  // 生成字符串的哈希值
  generateHash(str) {
    let hash = 0;
    
    // 如果字符串为空，返回固定值
    if (str.length === 0) return '0';
    
    // 使用改进的哈希算法，避免冲突
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    // 转换为正数并用36进制表示（包含0-9和a-z）
    const hashStr = Math.abs(hash).toString(36);
    
    // 添加长度信息以进一步避免冲突
    const lengthHash = (str.length % 1000).toString(36);
    
    return `${hashStr}_${lengthHash}`;
  }

  // 智谱GLM聊天完成接口
  async chatCompletion(messages, options = {}) {
    console.log('🌐 ===== 智谱GLM API调用开始 =====');
    console.log('📊 API调用参数:', {
      messagesCount: messages.length,
      model: this.config.model,
      temperature: this.config.temperature
    });
    
    this.checkRateLimit();
    
    // 🔧 [修复] 完全禁用缓存机制，确保每次都发送真实请求
    console.log('🔧 [修复] 缓存机制已完全禁用，确保真实API调用');
    
    // 验证API配置
    if (!this.config.apiKey || this.config.apiKey.length < 10) {
      throw new Error('API密钥配置无效');
    }
    
    console.log('📤 准备发送智谱GLM请求:', {
      hasApiKey: !!this.config.apiKey,
      keyLength: this.config.apiKey?.length || 0,
      apiKeyPreview: this.config.apiKey?.substring(0, 8) + '...'
    });

    try {
      const result = await this.callZhipuAPI(messages);
      
      console.log('✅ 智谱GLM调用成功');
      console.log('📥 API响应摘要:', {
        hasChoices: !!result.choices,
        choicesCount: result.choices?.length || 0,
        usage: result.usage
      });
      
      // 输出完整的响应内容
      if (result.choices && result.choices[0] && result.choices[0].message) {
        console.log('📝 智谱GLM响应内容:');
        console.log(result.choices[0].message.content);
      }
      
      console.log('🏁 ===== 智谱GLM调用结束 =====');
      return result;
    } catch (error) {
      console.error('❌ 智谱GLM调用失败:', error);
      console.log('🔍 调用错误详情:', {
        errorName: error.name,
        errorMessage: error.message,
        hasApiKey: !!this.config.apiKey,
        apiKeyLength: this.config.apiKey?.length || 0
      });
      console.log('🏁 ===== 智谱GLM调用结束（失败）=====');
      throw error;
    }
  }

  // 调用智谱GLM API的核心方法
  async callZhipuAPI(messages) {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    const requestStartTime = Date.now();
    
    console.log('🚀 开始智谱GLM API请求...');
    console.log(`⏰ 超时设置: ${this.config.timeout}ms`);

    // 添加超时处理
    const controller = new AbortController();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const elapsed = Date.now() - requestStartTime;
        console.warn(`⏰ API请求超时（${elapsed}ms > ${this.config.timeout}ms），取消请求`);
        controller.abort();
        reject(new Error(`API请求超时（${elapsed}ms）`));
      }, this.config.timeout);
    });

    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        temperature: this.config.temperature
      }),
      signal: controller.signal
    });

    try {
      console.log(`🌐 发送请求到智谱GLM: ${url}`);
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      const elapsed = Date.now() - requestStartTime;
      console.log(`✅ 请求响应时间: ${elapsed}ms`);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`智谱GLM API调用失败: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('智谱GLM返回数据格式错误');
      }

      console.log(`✅ 智谱GLM请求成功，共耗时: ${elapsed}ms`);
      return data;
    } catch (error) {
      const elapsed = Date.now() - requestStartTime;
      
      // 处理中断错误
      if (error.name === 'AbortError') {
        console.error(`❌ 智谱GLM请求超时（${elapsed}ms）`);
        throw new Error(`智谱GLM请求超时（${elapsed}ms）`);
      }
      
      console.error('❌ 智谱GLM请求失败:', error);
      throw error;
    }
  }

  // 清理过期缓存
  cleanupCache() {
    if (this.requestCache.size > 100) { // 保持缓存大小在合理范围
      const entries = Array.from(this.requestCache.entries());
      entries.slice(50).forEach(([key]) => {
        this.requestCache.delete(key);
      });
    }
  }

  // 获取API使用统计
  getUsageStats() {
    return {
      cacheSize: this.requestCache.size,
      requestsThisMinute: this.rateLimiter.requests,
      timeUntilReset: Math.max(0, this.rateLimiter.resetTime - Date.now())
    };
  }

  // 清空缓存
  clearCache() {
    this.requestCache.clear();
  }

  // 测试智谱GLM连接
  async testConnection() {
    try {
      const testMessages = [
        { role: "user", content: "测试连接，请回复'连接成功'" }
      ];
      
      const response = await this.chatCompletion(testMessages);
      
      const content = response.choices[0].message.content;
      return {
        success: true,
        message: '连接成功',
        response: content,
        model: this.config.model
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }

  // 检查API密钥有效性
  validateApiKey() {
    if (!this.config.apiKey) {
      throw new Error('智谱GLM API密钥未配置');
    }
    
    if (this.config.apiKey.length < 10) {
      throw new Error('智谱GLM API密钥格式不正确');
    }
    
    return true;
  }

  // 获取配置信息
  getConfig() {
    return { ...this.config };
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIApiClient;
} else if (typeof window !== 'undefined') {
  window.AIApiClient = AIApiClient;
}