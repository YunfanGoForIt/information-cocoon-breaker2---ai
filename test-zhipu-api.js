// 智谱GLM API测试工具 - 外部JavaScript文件
// 解决CSP违规问题

// 插件API客户端实例
let pluginApiClient = null;
let pluginClassifier = null;

// 统计数据
let stats = {
    totalRequests: 0,
    successCount: 0,
    totalTime: 0,
    totalTokens: 0
};

// 示例内容
const sampleContents = [
    {
        title: "如何制作美味的红烧肉",
        description: "详细介绍红烧肉的制作步骤，包括选材、调料搭配和烹饪技巧",
        tags: "美食,烹饪,家常菜",
        platform: "小红书",
        text: "如何制作美味的红烧肉。今天分享一道经典的红烧肉做法，选用五花肉，先焯水去腥，然后用冰糖炒糖色，加入生抽老抽调色，最后小火慢炖一小时。这样做出来的红烧肉色泽红亮，肥而不腻，入口即化。"
    },
    {
        title: "Python编程入门教程",
        description: "从零开始学习Python编程，包括基础语法、数据结构和实践项目",
        tags: "编程,Python,教程",
        platform: "抖音",
        text: "Python编程入门教程第一课。Python是一门简单易学的编程语言，语法清晰，功能强大。今天我们来学习变量的定义和基本数据类型。Python中定义变量非常简单，直接赋值即可。"
    },
    {
        title: "春季穿搭指南",
        description: "分享春季时尚穿搭技巧，如何搭配出清新自然的春日风格",
        tags: "时尚,穿搭,春季",
        platform: "小红书",
        text: "春季穿搭指南来啦！春天是万物复苏的季节，穿搭也要充满活力。推荐浅色系搭配，白色T恤配牛仔裤永远不会错，外套可以选择薄款针织开衫或者轻薄的风衣。"
    }
];

// 测试基本功能
function testBasicFunction() {
    console.log('📝 测试基本功能...');
    try {
        showStatus('🎉 JavaScript功能正常！', 'success');
        showResult('👍 基本功能测试', {
            测试时间: new Date().toISOString(),
            页面状态: 'OK',
            JavaScript: '正常工作'
        });
        console.log('✅ 基本功能测试成功');
    } catch (error) {
        console.error('❌ 基本功能测试失败:', error);
        showStatus('❌ 基本功能测试失败: ' + error.message, 'error');
    }
}

// 加载示例内容
function loadSampleContent() {
    console.log('📝 开始加载示例内容...');
    try {
        const randomSample = sampleContents[Math.floor(Math.random() * sampleContents.length)];
        document.getElementById('contentTitle').value = randomSample.title;
        document.getElementById('contentDescription').value = randomSample.description;
        document.getElementById('contentTags').value = randomSample.tags;
        document.getElementById('contentPlatform').value = randomSample.platform;
        document.getElementById('contentText').value = randomSample.text;
        showStatus('已加载示例内容', 'success');
        console.log('✅ 示例内容加载成功');
    } catch (error) {
        console.error('❌ 加载示例内容失败:', error);
        showStatus('加载示例内容失败: ' + error.message, 'error');
    }
}

// 显示状态信息
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('statusDisplay');
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
}

// 显示结果
function showResult(title, data, isError = false) {
    const resultsDiv = document.getElementById('resultsDisplay');
    const timestamp = new Date().toLocaleString();
    const resultClass = isError ? 'error' : 'success';
    
    const resultHtml = `
        <div class="status ${resultClass}">
            <strong>${title}</strong> - ${timestamp}
        </div>
        <div class="json-display">${JSON.stringify(data, null, 2)}</div>
    `;
    
    resultsDiv.innerHTML = resultHtml + resultsDiv.innerHTML;
}

// 更新统计数据
function updateStats(responseTime, tokens = 0, success = true) {
    stats.totalRequests++;
    if (success) stats.successCount++;
    stats.totalTime += responseTime;
    stats.totalTokens += tokens;
    
    document.getElementById('totalRequests').textContent = stats.totalRequests;
    document.getElementById('successCount').textContent = stats.successCount;
    document.getElementById('averageTime').textContent = 
        stats.totalRequests > 0 ? Math.round(stats.totalTime / stats.totalRequests) + 'ms' : '0ms';
    document.getElementById('totalTokens').textContent = stats.totalTokens;
}

// 初始化插件API客户端
function initializePluginAPI() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
        throw new Error('请输入API密钥');
    }
    
    // 使用插件中的实际API客户端，使用默认配置
    pluginApiClient = new AIApiClient({
        apiKey: apiKey,
        model: 'glm-4.5',  // 固定使用GLM-4.5
        temperature: 0.6   // 固定温度参数
    });
    
    // 初始化AI分类器（如果需要测试分类功能）
    if (typeof CategorySchema !== 'undefined') {
        pluginClassifier = new AIClassifier(pluginApiClient, CategorySchema);
    }
    
    showStatus(`✅ 插件API客户端已初始化 (glm-4.5)`, 'success');
    return pluginApiClient;
}

// 使用插件API客户端调用
async function callZhipuAPI(messages, model = 'glm-4.5') {
    try {
        // 确保API客户端已初始化
        if (!pluginApiClient) {
            initializePluginAPI();
        }
        
        const startTime = Date.now();
        
        // 显示发送的数据
        showResult('📤 使用插件API客户端发送请求', {
            apiClient: 'AIApiClient (插件代码)',
            config: pluginApiClient.getConfig(),
            messages: messages
        });
        
        // 调用插件中的实际API客户端
        const result = await pluginApiClient.chatCompletion(messages);
        
        const responseTime = Date.now() - startTime;
        const tokens = result.usage?.total_tokens || 0;
        
        // 显示返回的数据
        showResult('📥 插件API客户端返回响应', {
            ...result,
            responseTime: responseTime + 'ms',
            usageStats: pluginApiClient.getUsageStats()
        });
        
        updateStats(responseTime, tokens, true);
        return result;
        
    } catch (error) {
        const responseTime = Date.now() - (performance.now() - 1000);
        showResult('❌ 插件API调用失败', {
            error: error.message,
            stack: error.stack
        }, true);
        updateStats(responseTime, 0, false);
        throw error;
    }
}

// 清空结果
function clearResults() {
    console.log('🧹 开始清空结果...');
    try {
        document.getElementById('resultsDisplay').innerHTML = '';
        document.getElementById('statusDisplay').innerHTML = '';
        showStatus('结果已清空', 'info');
        console.log('✅ 结果清空成功');
    } catch (error) {
        console.error('❌ 清空结果失败:', error);
    }
}

// 保存配置
function saveConfig() {
    console.log('💾 开始保存配置...');
    try {
        const config = {
            apiKey: document.getElementById('apiKey').value,
            contentTitle: document.getElementById('contentTitle').value,
            contentDescription: document.getElementById('contentDescription').value,
            contentTags: document.getElementById('contentTags').value,
            contentPlatform: document.getElementById('contentPlatform').value,
            contentText: document.getElementById('contentText').value
        };
        
        localStorage.setItem('aiClassificationTestConfig', JSON.stringify(config));
        showStatus('✅ 配置已保存到本地存储', 'success');
        console.log('✅ 配置保存成功');
    } catch (error) {
        console.error('❌ 保存配置失败:', error);
        showStatus('保存配置失败: ' + error.message, 'error');
    }
}

// 加载配置
function loadConfig() {
    console.log('📂 开始加载配置...');
    try {
        const saved = localStorage.getItem('aiClassificationTestConfig');
        if (saved) {
            const config = JSON.parse(saved);
            document.getElementById('apiKey').value = config.apiKey || '';
            document.getElementById('contentTitle').value = config.contentTitle || '';
            document.getElementById('contentDescription').value = config.contentDescription || '';
            document.getElementById('contentTags').value = config.contentTags || '';
            document.getElementById('contentPlatform').value = config.contentPlatform || '小红书';
            document.getElementById('contentText').value = config.contentText || '';
            showStatus('✅ 配置已从本地存储加载', 'success');
            console.log('✅ 配置加载成功');
        } else {
            showStatus('⚠️ 未找到保存的配置', 'info');
            console.log('⚠️ 未找到保存的配置');
        }
    } catch (error) {
        console.error('❌ 加载配置失败:', error);
        showStatus('加载配置失败: ' + error.message, 'error');
    }
}

// 测试AI分类功能（标准模式）
async function testAIClassification() {
    console.log('🎯 开始标准AI分类测试...');
    try {
        // 获取用户输入的内容
        const title = document.getElementById('contentTitle').value.trim();
        const description = document.getElementById('contentDescription').value.trim();
        const tagsText = document.getElementById('contentTags').value.trim();
        const platform = document.getElementById('contentPlatform').value;
        const rawText = document.getElementById('contentText').value.trim();
        
        console.log('📝 用户输入内容:', { title, description, tagsText, platform, rawText });
        
        if (!title && !description && !rawText) {
            showStatus('请至少输入标题、描述或内容文本其中一项', 'error');
            return;
        }
        
        if (!pluginClassifier) {
            console.log('🔧 初始化插件API客户端...');
            initializePluginAPI();
            if (!pluginClassifier) {
                showStatus('❌ AI分类器初始化失败，请检查CategorySchema', 'error');
                return;
            }
        }
        
        showStatus('正在使用插件AI分类器进行内容分析...', 'info');
        
        // 构建内容数据
        const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        const contentData = {
            title: title,
            description: description,
            tags: tags,
            platform: platform,
            rawText: rawText || `${title} ${description} ${tags.join(' ')}`
        };
        
        console.log('🗺️ 构建的内容数据:', contentData);
        showResult('📝 待分析内容', contentData);
        
        console.log('🤖 开始调用AI分类器...');
        const result = await pluginClassifier.classifyContent(contentData);
        
        console.log('✅ AI分类完成:', result);
        showStatus('✅ AI内容分类完成！', 'success');
        showResult('🎯 AI分类结果', {
            分类路径: result.classificationPath,
            主类别: {
                ID: result.mainCategory.id,
                名称: result.mainCategory.name,
                置信度: result.mainCategory.confidence,
                理由: result.mainCategory.reasoning
            },
            子类别: {
                ID: result.subCategory.id,
                名称: result.subCategory.name,
                置信度: result.subCategory.confidence,
                理由: result.subCategory.reasoning
            },
            总体置信度: result.overallConfidence,
            分类方法: result.method,
            时间戳: result.timestamp
        });
        
    } catch (error) {
        console.error('❌ AI分类失败:', error);
        showStatus(`❌ AI分类失败: ${error.message}`, 'error');
        showResult('❌ AI分类错误详情', { error: error.message, stack: error.stack }, true);
    }
}

// 测试AI分类功能（分步模式）
async function testStepByStepClassification() {
    console.log('🔍 开始分步AI分类测试...');
    try {
        // 获取用户输入的内容
        const title = document.getElementById('contentTitle').value.trim();
        const description = document.getElementById('contentDescription').value.trim();
        const tagsText = document.getElementById('contentTags').value.trim();
        const platform = document.getElementById('contentPlatform').value;
        const rawText = document.getElementById('contentText').value.trim();
        
        console.log('📝 用户输入内容:', { title, description, tagsText, platform, rawText });
        
        if (!title && !description && !rawText) {
            showStatus('请至少输入标题、描述或内容文本其中一项', 'error');
            return;
        }
        
        if (!pluginClassifier) {
            console.log('🔧 初始化插件API客户端...');
            initializePluginAPI();
            if (!pluginClassifier) {
                showStatus('❌ AI分类器初始化失败，请检查CategorySchema', 'error');
                return;
            }
        }
        
        showStatus('正在使用插件AI分类器进行分步分类分析...', 'info');
        
        // 构建内容数据
        const tags = tagsText ? tagsText.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        const contentData = {
            title: title,
            description: description,
            tags: tags,
            platform: platform,
            rawText: rawText || `${title} ${description} ${tags.join(' ')}`
        };
        
        console.log('🗺️ 构建的内容数据:', contentData);
        showResult('📝 待分析内容', contentData);
        
        // 执行分步分类测试
        await performStepByStepClassification(contentData);
        
    } catch (error) {
        console.error('❌ AI分类失败:', error);
        showStatus(`❌ AI分类失败: ${error.message}`, 'error');
        showResult('❌ AI分类错误详情', { error: error.message, stack: error.stack }, true);
    }
}

// 执行分步分类测试
async function performStepByStepClassification(contentData) {
    try {
        console.log('🎯 开始分步AI分类测试...');
        
        // ============ 第一步：主类别分类 ============
        showStatus('🔄 第一步：正在进行主类别分类...', 'info');
        
        console.log('📋 构建主类别分类提示词...');
        const mainCategories = pluginClassifier.categorySchema.getMainCategories();
        const mainCategoryList = mainCategories
            .map(cat => `${cat.id}: ${cat.name} - ${cat.description}`)
            .join('\n');

        const mainPrompt = `请分析以下内容并确定其所属的主要类别。

内容信息：
标题：${contentData.title || '无'}
描述：${contentData.description || '无'}
标签：${contentData.tags ? contentData.tags.join(', ') : '无'}
平台：${contentData.platform || '未知'}

可选的主类别：
${mainCategoryList}

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
        
        const mainMessages = [
            {
                role: "system",
                content: "你是一个专业的内容分类专家，擅长准确分析和分类各种类型的内容。请严格按照要求的JSON格式返回结果。"
            },
            {
                role: "user", 
                content: mainPrompt
            }
        ];
        
        // 显示第一步的输入
        showResult('📤 第一步：主类别分类 - 输入', {
            系统提示词: mainMessages[0].content,
            用户提示词: mainPrompt,
            可选主类别数量: mainCategories.length,
            主类别列表: mainCategories.map(cat => `${cat.id} (${cat.name})`)
        });
        
        console.log('🚀 发送主类别分类请求...');
        const mainResponse = await pluginApiClient.chatCompletion(mainMessages);
        
        // 显示第一步的输出
        showResult('📥 第一步：主类别分类 - 输出', {
            原始响应: mainResponse.choices[0].message.content,
            API使用情况: mainResponse.usage,
            响应状态: 'success'
        });
        
        // 解析主类别结果
        const mainResult = pluginClassifier.parseClassificationResponse(mainResponse.choices[0].message.content, 'main');
        
        showResult('✅ 第一步：主类别分类 - 解析结果', {
            类别ID: mainResult.category,
            类别名称: mainResult.categoryName,
            置信度: mainResult.confidence,
            选择理由: mainResult.reasoning
        });
        
        // ============ 第二步：子类别分类 ============
        showStatus('🔄 第二步：正在进行子类别分类...', 'info');
        
        console.log('📋 构建子类别分类提示词...');
        const subCategories = pluginClassifier.categorySchema.getSubcategories(mainResult.category);
        
        if (subCategories.length === 0) {
            throw new Error(`主类别 ${mainResult.category} 没有可用的子类别`);
        }
        
        const subCategoryList = subCategories
            .map(cat => `${cat.id}: ${cat.name} - ${cat.description}`)
            .join('\n');
        
        const mainCategoryInfo = pluginClassifier.categorySchema.CATEGORY_SCHEMA[mainResult.category];
        
        const subPrompt = `请对以下内容进行更细致的分类，确定其在"${mainCategoryInfo.name}"类别下的具体子类别。

内容信息：
标题：${contentData.title || '无'}
描述：${contentData.description || '无'}
标签：${contentData.tags ? contentData.tags.join(', ') : '无'}
平台：${contentData.platform || '未知'}

已确定的主类别：${mainCategoryInfo.name} - ${mainCategoryInfo.description}

可选的子类别：
${subCategoryList}

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
        
        const subMessages = [
            {
                role: "system",
                content: "你是一个专业的内容分类专家，特别擅长细分类别的精准判断。请仔细分析内容特征，严格按照JSON格式返回结果。"
            },
            {
                role: "user",
                content: subPrompt
            }
        ];
        
        // 显示第二步的输入
        showResult('📤 第二步：子类别分类 - 输入', {
            系统提示词: subMessages[0].content,
            用户提示词: subPrompt,
            上下文信息: {
                已确定主类别: `${mainResult.category} (${mainResult.categoryName})`,
                主类别置信度: mainResult.confidence
            },
            可选子类别数量: subCategories.length,
            子类别列表: subCategories.map(cat => `${cat.id} (${cat.name})`)
        });
        
        console.log('🚀 发送子类别分类请求...');
        const subResponse = await pluginApiClient.chatCompletion(subMessages);
        
        // 显示第二步的输出
        showResult('📥 第二步：子类别分类 - 输出', {
            原始响应: subResponse.choices[0].message.content,
            API使用情况: subResponse.usage,
            响应状态: 'success'
        });
        
        // 解析子类别结果
        const subResult = pluginClassifier.parseClassificationResponse(subResponse.choices[0].message.content, 'sub');
        
        showResult('✅ 第二步：子类别分类 - 解析结果', {
            类别ID: subResult.category,
            类别名称: subResult.categoryName,
            置信度: subResult.confidence,
            选择理由: subResult.reasoning
        });
        
        // ============ 最终结果汇总 ============
        const overallConfidence = (mainResult.confidence + subResult.confidence) / 2;
        const classificationPath = `${mainResult.categoryName} > ${subResult.categoryName}`;
        
        showResult('🎯 最终分类结果汇总', {
            完整分类路径: classificationPath,
            主类别: {
                ID: mainResult.category,
                名称: mainResult.categoryName,
                置信度: mainResult.confidence,
                理由: mainResult.reasoning
            },
            子类别: {
                ID: subResult.category,
                名称: subResult.categoryName,
                置信度: subResult.confidence,
                理由: subResult.reasoning
            },
            总体置信度: overallConfidence,
            分类方法: 'ai_two_step',
            处理时间戳: new Date().toISOString(),
            API调用次数: 2
        });
        
        showStatus('✅ 两步分类测试完成！查看上方详细的分类过程', 'success');
        
    } catch (error) {
        console.error('❌ 分步分类测试失败:', error);
        showStatus(`❌ 分步分类测试失败: ${error.message}`, 'error');
        showResult('❌ 分步分类错误详情', { 
            error: error.message, 
            stack: error.stack,
            发生阶段: '分步分类过程中' 
        }, true);
    }
}

// 初始化页面
function initializePage() {
    console.log('🚀 页面加载中...');
    
    // 绑定按钮事件
    document.getElementById('testBasicBtn').addEventListener('click', testBasicFunction);
    document.getElementById('testAIBtn').addEventListener('click', testAIClassification);
    document.getElementById('testStepByStepBtn').addEventListener('click', testStepByStepClassification);
    document.getElementById('loadSampleBtn').addEventListener('click', loadSampleContent);
    document.getElementById('clearResultsBtn').addEventListener('click', clearResults);
    document.getElementById('saveConfigBtn').addEventListener('click', saveConfig);
    document.getElementById('loadConfigBtn').addEventListener('click', loadConfig);
    
    console.log('✅ 按钮事件已绑定');
    
    // 加载配置
    loadConfig();
    
    // 检查插件模块是否加载成功
    setTimeout(() => {
        console.log('🔍 检查插件模块...');
        console.log('AIApiClient:', typeof AIApiClient);
        console.log('CategorySchema:', typeof CategorySchema);
        
        if (typeof AIApiClient !== 'undefined' && typeof CategorySchema !== 'undefined') {
            showStatus('✅ 插件模块加载成功，可以开始AI分类测试', 'success');
            console.log('✅ 所有插件模块加载成功');
        } else {
            showStatus('⚠️ 插件模块未加载，请确保文件路径正确', 'error');
            console.error('❌ 插件模块加载失败');
        }
        
        // 添加全局错误监听
        window.addEventListener('error', function(e) {
            console.error('🚨 全局错误:', e.error);
            showStatus('发生错误: ' + e.error.message, 'error');
        });
        
        console.log('🎉 页面初始化完成');
    }, 500);
}

// 页面加载时自动初始化
window.addEventListener('DOMContentLoaded', initializePage);