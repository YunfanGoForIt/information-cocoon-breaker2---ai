// 增强的内容提取器
// 支持多平台的文本内容精准提取

class ContentExtractor {
  constructor() {
    this.platformConfigs = {
      douyin: {
        selectors: {
          title: [
            '[data-e2e="video-desc"]',
            '.video-info-detail .title',
            '.video-desc',
            'h1[data-e2e="video-desc"]'
          ],
          description: [
            '[data-e2e="video-desc"]',
            '.video-info .desc',
            '.video-detail-info .desc'
          ],
          tags: [
            '[data-e2e="video-tag"]',
            '.tag-list .tag',
            '.hashtag-item',
            'a[href*="#hashtag"]'
          ],
          author: [
            '[data-e2e="video-author-name"]',
            '.author-info .name',
            '.author-name'
          ]
        },
        cleanupRules: [
          /^#/,  // 移除井号
          /^\@/, // 移除@符号
          /\s+/g // 合并空格
        ]
      },
      
      xiaohongshu: {
        selectors: {
          title: [
            '#noteContainer #detail-title',
            '#noteContainer .title',
            '.note-container #detail-title',
            '.note-container .title',
            '.note-item .title',
            '.feed-title',
            '[data-v-*] .title',
            '.note-detail .title'
          ],
          description: [
            '#noteContainer #detail-desc .note-text',
            '#noteContainer .desc .note-text',
            '.note-container #detail-desc .note-text',
            '.note-container .desc .note-text',
            '#detail-desc .note-text span',
            '.note-content .note-text',
            '.note-item .desc',
            '.feed-content .desc',
            '.note-content .text',
            '.note-detail .content'
          ],
          tags: [
            '#noteContainer .tag-item',
            '#noteContainer .topic-tag',
            '#noteContainer .hashtag',
            '.note-container .tag-item',
            '.note-container .topic-tag',
            '.note-container .hashtag',
            '.tag-item',
            '.topic-tag',
            '.hashtag',
            'a[href*="/search_result"]'
          ],
          author: [
            '#noteContainer .author-wrapper .username',
            '#noteContainer .author .name',
            '.note-container .author-wrapper .username',
            '.note-container .author .name',
            '.author-info .name',
            '.user-name',
            '.author-name'
          ]
        },
        cleanupRules: [
          /^#/,
          /展开全文/,
          /收起全文/,
          /说点什么\.\.\./, // 移除占位符文本
          /共\s*\d+\s*条评论/, // 移除评论计数
          /昨天\s*\d{1,2}:\d{2}/, // 移除时间信息
          /\d+小时前/, // 移除相对时间
          /北京|上海|广东|四川/, // 移除地理位置
          /\s+/g
        ],
        // 小红书特殊的容器过滤规则
        containerFilter: {
          include: ['#noteContainer', '.note-container'],
          exclude: ['.interaction-container', '.comments-el', '.engage-bar']
        }
      },

      kuaishou: {
        selectors: {
          title: [
            '.video-info .title',
            '.kwai-video-title',
            '[data-test="video-title"]'
          ],
          description: [
            '.video-info .desc',
            '.video-desc',
            '.content-desc'
          ],
          tags: [
            '.tag-list .tag',
            '.topic-tag',
            '.hashtag-item'
          ],
          author: [
            '.author-info .name',
            '.user-name'
          ]
        },
        cleanupRules: [
          /^#/,
          /\s+/g
        ]
      },

      youtube: {
        selectors: {
          title: [
            'h1.title.style-scope.ytd-video-primary-info-renderer',
            '#container h1',
            '.title.style-scope.ytd-video-primary-info-renderer'
          ],
          description: [
            '#description.style-scope.ytd-video-secondary-info-renderer',
            '.content.style-scope.ytd-video-secondary-info-renderer',
            '#meta #description'
          ],
          tags: [
            '.super-title a',
            '#info .super-title a',
            'a[href*="/hashtag/"]'
          ],
          author: [
            '#text.style-scope.ytd-channel-name',
            '#owner-name a',
            '.ytd-channel-name a'
          ]
        },
        cleanupRules: [
          /^#/,
          /Show more/,
          /Show less/,
          /\s+/g
        ]
      },

      tiktok: {
        selectors: {
          title: [
            '[data-e2e="video-desc"]',
            '.tiktok-video-desc',
            '.video-meta .desc'
          ],
          description: [
            '[data-e2e="video-desc"]',
            '.video-desc-content'
          ],
          tags: [
            '[data-e2e="hashtag-link"]',
            '.hashtag-link',
            'a[href*="/tag/"]'
          ],
          author: [
            '[data-e2e="video-author-uniqueid"]',
            '.author-uniqueid'
          ]
        },
        cleanupRules: [
          /^#/,
          /\s+/g
        ]
      }
    };
    
    this.extractionCache = new Map();
  }

  // 检测当前平台
  detectPlatform(url = window.location.href) {
    const platformMap = {
      'douyin.com': 'douyin',
      'xiaohongshu.com': 'xiaohongshu', 
      'kuaishou.com': 'kuaishou',
      'youtube.com': 'youtube',
      'tiktok.com': 'tiktok'
    };

    for (const [domain, platform] of Object.entries(platformMap)) {
      if (url.includes(domain)) {
        return platform;
      }
    }
    
    return 'unknown';
  }

  // 使用选择器提取文本
  extractTextBySelectors(selectors, cleanupRules = [], containerFilter = null) {
    let text = '';
    
    for (const selector of selectors) {
      try {
        let elements;
        
        // 如果指定了容器过滤器，先在容器内查找
        if (containerFilter && containerFilter.include) {
          elements = [];
          for (const containerSelector of containerFilter.include) {
            const containers = document.querySelectorAll(containerSelector);
            containers.forEach(container => {
              const foundElements = container.querySelectorAll(selector);
              elements.push(...foundElements);
            });
          }
        } else {
          elements = document.querySelectorAll(selector);
        }
        
        if (elements.length > 0) {
          const extractedTexts = Array.from(elements)
            .map(el => el.textContent || el.innerText || '')
            .filter(t => t.trim().length > 0);
          
          if (extractedTexts.length > 0) {
            text = extractedTexts.join(' ').trim();
            break;
          }
        }
      } catch (error) {
        console.warn(`选择器 ${selector} 提取失败:`, error);
      }
    }
    
    // 应用清理规则
    return this.cleanupText(text, cleanupRules);
  }

  // 文本清理
  cleanupText(text, rules = []) {
    let cleaned = text.trim();
    
    rules.forEach(rule => {
      if (rule instanceof RegExp) {
        if (rule.global) {
          cleaned = cleaned.replace(rule, ' ');
        } else {
          cleaned = cleaned.replace(rule, '');
        }
      }
    });
    
    // 通用清理
    cleaned = cleaned
      .replace(/\s+/g, ' ')  // 合并多个空格
      .replace(/\n+/g, ' ')  // 换行符转空格
      .replace(/[^\u4e00-\u9fa5\u0030-\u0039\u0041-\u005a\u0061-\u007a\s\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\u300a\u300b\u3008\u3009\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015]/g, ' ') // 保留中英文、数字、常用标点
      .trim();
    
    return cleaned;
  }

  // 提取页面内容
  extractPageContent(platform = null) {
    const detectedPlatform = platform || this.detectPlatform();
    
    if (detectedPlatform === 'unknown') {
      return this.extractGenericContent();
    }

    const config = this.platformConfigs[detectedPlatform];
    if (!config) {
      return this.extractGenericContent();
    }

    const content = {
      platform: detectedPlatform,
      url: window.location.href,
      extractedAt: new Date().toISOString(),
      title: '',
      description: '',
      tags: [],
      author: '',
      rawText: ''
    };

    // 提取标题
    content.title = this.extractTextBySelectors(
      config.selectors.title,
      config.cleanupRules,
      config.containerFilter
    );

    // 提取描述
    content.description = this.extractTextBySelectors(
      config.selectors.description,
      config.cleanupRules,
      config.containerFilter
    );

    // 提取标签
    const tagElements = this.extractMultipleElements(
      config.selectors.tags,
      config.containerFilter
    );
    content.tags = tagElements
      .map(text => this.cleanupText(text, config.cleanupRules))
      .filter(tag => tag.length > 0 && tag.length < 50)
      .slice(0, 10); // 最多保留10个标签

    // 提取作者
    content.author = this.extractTextBySelectors(
      config.selectors.author,
      config.cleanupRules,
      config.containerFilter
    );

    // 生成原始文本用于AI分析
    content.rawText = [
      content.title,
      content.description,
      content.tags.join(' ')
    ].filter(t => t.length > 0).join(' ');

    // 验证提取结果
    if (content.rawText.length < 10) {
      console.warn('提取的内容过少，尝试通用提取方法');
      const genericContent = this.extractGenericContent();
      if (genericContent.rawText.length > content.rawText.length) {
        return { ...content, ...genericContent };
      }
    }

    return content;
  }

  // 提取多个元素的文本
  extractMultipleElements(selectors, containerFilter = null) {
    const texts = [];
    
    for (const selector of selectors) {
      try {
        let elements;
        
        // 如果指定了容器过滤器，先在容器内查找
        if (containerFilter && containerFilter.include) {
          elements = [];
          for (const containerSelector of containerFilter.include) {
            const containers = document.querySelectorAll(containerSelector);
            containers.forEach(container => {
              const foundElements = container.querySelectorAll(selector);
              elements.push(...foundElements);
            });
          }
        } else {
          elements = document.querySelectorAll(selector);
        }
        
        elements.forEach(el => {
          const text = (el.textContent || el.innerText || '').trim();
          if (text.length > 0) {
            texts.push(text);
          }
        });
        
        if (texts.length > 0) break; // 找到内容就停止
      } catch (error) {
        console.warn(`多元素提取失败 ${selector}:`, error);
      }
    }
    
    return [...new Set(texts)]; // 去重
  }

  // 通用内容提取（备用方案）
  extractGenericContent() {
    const content = {
      platform: 'generic',
      url: window.location.href,
      extractedAt: new Date().toISOString(),
      title: '',
      description: '',
      tags: [],
      author: '',
      rawText: ''
    };

    // 尝试提取页面标题
    content.title = document.title || '';

    // 尝试提取描述
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      content.description = metaDesc.getAttribute('content') || '';
    }

    // 尝试提取页面主要文本内容
    const mainContentSelectors = [
      'main',
      '[role="main"]',
      '.main-content',
      '.content',
      'article',
      '.post-content',
      '.video-info',
      '.desc'
    ];

    let mainText = '';
    for (const selector of mainContentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainText = element.textContent || element.innerText || '';
        if (mainText.length > 50) break;
      }
    }

    // 如果还是没有足够内容，提取body中的可见文本
    if (mainText.length < 50) {
      const bodyText = document.body.textContent || document.body.innerText || '';
      mainText = bodyText.substring(0, 500); // 限制长度
    }

    content.description = this.cleanupText(mainText);
    content.rawText = [content.title, content.description]
      .filter(t => t.length > 0)
      .join(' ');

    return content;
  }

  // 智能内容提取（结合多种策略）
  smartExtract() {
    const cacheKey = window.location.href;
    
    // 检查缓存
    if (this.extractionCache.has(cacheKey)) {
      const cached = this.extractionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5分钟缓存
        return cached.content;
      }
    }

    // 首先尝试平台特定提取
    let content = this.extractPageContent();
    
    // 对小红书平台使用特殊的验证和增强
    if (content.platform === 'xiaohongshu') {
      content = this.validateAndEnhanceXiaohongshuContent(content);
    }
    
    // 如果内容不足，尝试智能增强
    if (content.rawText.length < 30) {
      content = this.enhanceContent(content);
    }

    // 缓存结果
    this.extractionCache.set(cacheKey, {
      content: content,
      timestamp: Date.now()
    });

    return content;
  }

  // 小红书特定的内容验证和增强
  validateAndEnhanceXiaohongshuContent(content) {
    // 检查是否在帖子详情页
    const noteContainer = document.querySelector('#noteContainer') || document.querySelector('.note-container');
    if (!noteContainer) {
      console.warn('未找到小红书帖子容器，可能不在帖子详情页');
      return content;
    }

    // 增强内容提取：如果没有提取到标题，尝试其他方法
    if (!content.title || content.title.length < 5) {
      const alternativeTitleSelectors = [
        '#noteContainer .note-text span:first-child',
        '.note-container .note-text span:first-child',
        '#detail-title',
        '[data-v-610be4fa] .title'
      ];
      
      for (const selector of alternativeTitleSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            const titleText = element.textContent || element.innerText || '';
            if (titleText.trim().length > 5) {
              content.title = this.cleanupText(titleText.trim().substring(0, 100)); // 限制标题长度
              break;
            }
          }
        } catch (error) {
          console.warn(`备用标题提取失败 ${selector}:`, error);
        }
      }
    }

    // 增强描述提取
    if (!content.description || content.description.length < 10) {
      const alternativeDescSelectors = [
        '#noteContainer #detail-desc',
        '.note-container #detail-desc', 
        '#detail-desc .note-text',
        '[data-v-610be4fa] .desc'
      ];
      
      for (const selector of alternativeDescSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element) {
            const descText = element.textContent || element.innerText || '';
            if (descText.trim().length > 10) {
              content.description = this.cleanupText(descText.trim());
              break;
            }
          }
        } catch (error) {
          console.warn(`备用描述提取失败 ${selector}:`, error);
        }
      }
    }

    // 特殊清理：移除小红书特有的干扰内容
    const xiaohongshuSpecificCleanup = [
      /关注/, // 移除“关注”按钮文本
      /\d+\/\d+/, // 移除分页数字
      /赞|collect|回复/, // 移除互动按钮文本
      /MacTalk|作者/, // 移除作者标签
      /展开\s*\d+\s*条回复/ // 移除回复展开按钮
    ];

    xiaohongshuSpecificCleanup.forEach(rule => {
      content.title = content.title.replace(rule, '').trim();
      content.description = content.description.replace(rule, '').trim();
    });

    // 重新生成rawText
    content.rawText = [
      content.title,
      content.description,
      content.tags.join(' ')
    ].filter(t => t.length > 0).join(' ');

    return content;
  }

  // 内容增强
  enhanceContent(baseContent) {
    // 尝试从页面中提取更多信息
    const enhancedContent = { ...baseContent };
    
    // 查找视频相关信息
    const videoSelectors = [
      'video',
      '[data-video]',
      '[class*="video"]',
      '[id*="video"]'
    ];

    for (const selector of videoSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // 提取视频相关属性
        const title = el.getAttribute('title') || el.getAttribute('data-title') || '';
        const desc = el.getAttribute('description') || el.getAttribute('data-desc') || '';
        
        if (title) enhancedContent.title = enhancedContent.title || title;
        if (desc) enhancedContent.description = enhancedContent.description || desc;
      });
    }

    // 查找隐藏的结构化数据
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => {
        try {
          const data = JSON.parse(script.textContent);
          if (data.name) enhancedContent.title = enhancedContent.title || data.name;
          if (data.description) enhancedContent.description = enhancedContent.description || data.description;
        } catch (e) {
          // 忽略JSON解析错误
        }
      });
    } catch (error) {
      console.warn('结构化数据提取失败:', error);
    }

    // 重新生成rawText
    enhancedContent.rawText = [
      enhancedContent.title,
      enhancedContent.description,
      enhancedContent.tags.join(' ')
    ].filter(t => t.length > 0).join(' ');

    return enhancedContent;
  }

  // 清空缓存
  clearCache() {
    this.extractionCache.clear();
  }

  // 获取提取统计
  getStats() {
    return {
      cacheSize: this.extractionCache.size,
      supportedPlatforms: Object.keys(this.platformConfigs)
    };
  }
}

// 内容质量评估器
class ContentQualityAssessor {
  static assessContent(content) {
    const score = {
      completeness: 0,  // 完整性
      relevance: 0,     // 相关性
      clarity: 0,       // 清晰度
      overall: 0        // 总体质量
    };

    // 评估完整性
    if (content.title && content.title.length > 5) score.completeness += 30;
    if (content.description && content.description.length > 20) score.completeness += 40;
    if (content.tags && content.tags.length > 0) score.completeness += 20;
    if (content.rawText && content.rawText.length > 50) score.completeness += 10;

    // 评估相关性（基于内容长度和信息密度）
    const textLength = content.rawText.length;
    if (textLength > 100) score.relevance += 40;
    else if (textLength > 50) score.relevance += 25;
    else if (textLength > 20) score.relevance += 10;

    const uniqueWords = new Set(content.rawText.split(/\s+/)).size;
    if (uniqueWords > 20) score.relevance += 30;
    else if (uniqueWords > 10) score.relevance += 20;
    else if (uniqueWords > 5) score.relevance += 10;

    // 评估清晰度（中文字符比例、标点使用等）
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const chineseMatches = content.rawText.match(chineseCharRegex);
    const chineseRatio = chineseMatches ? chineseMatches.length / content.rawText.length : 0;
    
    if (chineseRatio > 0.3) score.clarity += 40;
    else if (chineseRatio > 0.1) score.clarity += 20;
    
    const punctuationRegex = /[。！？，、；：]/g;
    const hasPunctuation = punctuationRegex.test(content.rawText);
    if (hasPunctuation) score.clarity += 30;

    const hasRepeatedChars = /(.)\1{3,}/.test(content.rawText);
    if (!hasRepeatedChars) score.clarity += 30;

    // 计算总体分数
    score.overall = Math.round((score.completeness + score.relevance + score.clarity) / 3);

    return score;
  }

  static isHighQuality(content) {
    const score = this.assessContent(content);
    return score.overall >= 60;
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ContentExtractor,
    ContentQualityAssessor
  };
} else if (typeof window !== 'undefined') {
  window.ContentExtractor = ContentExtractor;
  window.ContentQualityAssessor = ContentQualityAssessor;
}