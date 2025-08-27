// OpenAI兼容的API客户端
// 支持多种AI服务的统一接口调用

class AIApiClient {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      baseUrl: config.baseUrl || 'https://api.openai.com/v1',
      model: config.model || 'gpt-3.5-turbo',
      timeout: config.timeout || 30000,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000
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

  // 生成缓存键
  generateCacheKey(messages, options = {}) {
    const key = JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content.substring(0, 100) })),
      model: options.model || this.config.model,
      temperature: options.temperature || 0.7
    });
    return btoa(encodeURIComponent(key)).substring(0, 50);
  }

  // 主要的聊天完成接口
  async chatCompletion(messages, options = {}) {
    this.checkRateLimit();
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(messages, options);
    if (this.requestCache.has(cacheKey)) {
      console.log('使用缓存结果');
      return this.requestCache.get(cacheKey);
    }

    const requestBody = {
      model: options.model || this.config.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1,
      frequency_penalty: options.frequency_penalty || 0,
      presence_penalty: options.presence_penalty || 0
    };

    try {
      const result = await this.makeRequest('/chat/completions', requestBody);
      
      // 缓存结果
      this.requestCache.set(cacheKey, result);
      
      // 清理过期缓存
      this.cleanupCache();
      
      return result;
    } catch (error) {
      console.error('AI API调用失败:', error);
      throw error;
    }
  }

  // 执行HTTP请求
  async makeRequest(endpoint, body, retries = 0) {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(body)
    };

    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API返回数据格式错误');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // 处理中断错误
      if (error.name === 'AbortError') {
        throw new Error('API请求超时');
      }
      
      // 重试逻辑
      if (retries < this.config.maxRetries && this.shouldRetry(error)) {
        console.log(`第${retries + 1}次重试...`);
        await this.delay(this.config.retryDelay * (retries + 1));
        return this.makeRequest(endpoint, body, retries + 1);
      }
      
      throw error;
    }
  }

  // 判断是否应该重试
  shouldRetry(error) {
    // 网络错误、超时、5xx错误应该重试
    if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
      return true;
    }
    
    if (error.message.includes('API请求失败')) {
      const statusMatch = error.message.match(/(\d{3})/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1]);
        return status >= 500 || status === 429; // 服务器错误或频率限制
      }
    }
    
    return false;
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 清理过期缓存
  cleanupCache() {
    if (this.requestCache.size > 50) { // 保持缓存大小不超过50条
      const keys = Array.from(this.requestCache.keys());
      const keysToDelete = keys.slice(0, 20); // 删除最旧的20条
      keysToDelete.forEach(key => this.requestCache.delete(key));
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

  // 测试API连接
  async testConnection() {
    try {
      const testMessages = [
        { role: "user", content: "测试连接，请回复'连接成功'" }
      ];
      
      const response = await this.chatCompletion(testMessages, {
        max_tokens: 50,
        temperature: 0
      });
      
      const content = response.choices[0].message.content;
      return {
        success: true,
        message: '连接成功',
        response: content,
        model: response.model
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error
      };
    }
  }
}

// API配置管理器
class ApiConfigManager {
  constructor() {
    this.configs = new Map();
    this.activeConfigId = null;
  }

  // 添加API配置
  addConfig(id, config) {
    this.configs.set(id, {
      id: id,
      name: config.name || id,
      ...config,
      createdAt: new Date().toISOString()
    });
  }

  // 获取配置
  getConfig(id) {
    return this.configs.get(id);
  }

  // 设置活跃配置
  setActiveConfig(id) {
    if (this.configs.has(id)) {
      this.activeConfigId = id;
      return true;
    }
    return false;
  }

  // 获取活跃配置
  getActiveConfig() {
    return this.activeConfigId ? this.configs.get(this.activeConfigId) : null;
  }

  // 获取所有配置
  getAllConfigs() {
    return Array.from(this.configs.values());
  }

  // 删除配置
  deleteConfig(id) {
    const deleted = this.configs.delete(id);
    if (this.activeConfigId === id) {
      this.activeConfigId = null;
    }
    return deleted;
  }

  // 保存到存储
  async saveToStorage() {
    const data = {
      configs: Object.fromEntries(this.configs),
      activeConfigId: this.activeConfigId
    };
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.set({ aiApiConfigs: data });
    } else {
      localStorage.setItem('aiApiConfigs', JSON.stringify(data));
    }
  }

  // 从存储加载
  async loadFromStorage() {
    let data = null;
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get('aiApiConfigs');
      data = result.aiApiConfigs;
    } else {
      const stored = localStorage.getItem('aiApiConfigs');
      data = stored ? JSON.parse(stored) : null;
    }
    
    if (data) {
      this.configs = new Map(Object.entries(data.configs || {}));
      this.activeConfigId = data.activeConfigId;
    }
  }
}

// 预设配置
const PRESET_CONFIGS = {
  openai: {
    name: 'OpenAI GPT',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo',
    description: 'OpenAI官方API'
  },
  openai_gpt4: {
    name: 'OpenAI GPT-4',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4',
    description: 'OpenAI GPT-4模型'
  },
  claude: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-sonnet-20240229',
    description: 'Anthropic Claude模型'
  },
  azure_openai: {
    name: 'Azure OpenAI',
    baseUrl: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
    model: 'gpt-35-turbo',
    description: 'Azure OpenAI服务'
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AIApiClient,
    ApiConfigManager,
    PRESET_CONFIGS
  };
} else if (typeof window !== 'undefined') {
  window.AIApiClient = AIApiClient;
  window.ApiConfigManager = ApiConfigManager;
  window.PRESET_CONFIGS = PRESET_CONFIGS;
}