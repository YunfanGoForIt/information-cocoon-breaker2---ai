// 预设配置
const PRESET_CONFIGS = {
    openai: {
        name: "OpenAI GPT",
        baseUrl: "https://api.openai.com/v1",
        model: "gpt-3.5-turbo",
        description: "OpenAI官方API，需要科学上网",
        keyExample: "sk-..."
    },
    zhipu: {
        name: "智谱AI GLM",
        baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
        model: "glm-3-turbo",
        description: "智谱AI，国内访问稳定，支持中文",
        keyExample: "..."
    },
    baidu: {
        name: "百度文心一言",
        baseUrl: "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions",
        model: "ERNIE-Bot-turbo",
        description: "百度文心一言，国内服务",
        keyExample: "..."
    },
    qwen: {
        name: "阿里通义千问",
        baseUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
        model: "qwen-turbo",
        description: "阿里云通义千问",
        keyExample: "sk-..."
    },
    custom: {
        name: "自定义服务",
        baseUrl: "",
        model: "",
        description: "自建或第三方代理服务",
        keyExample: "..."
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentConfig();
    setupEventListeners();
    renderPresetConfigs();
});

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('enableAI').addEventListener('change', toggleAIConfig);
    document.getElementById('apiProvider').addEventListener('change', onProviderChange);
}

// 渲染预设配置卡片
function renderPresetConfigs() {
    const container = document.getElementById('presetConfigs');
    container.innerHTML = '';
    
    Object.entries(PRESET_CONFIGS).forEach(([key, config]) => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.innerHTML = `
            <h3>${config.name}</h3>
            <p><strong>模型:</strong> ${config.model}</p>
            <p><strong>说明:</strong> ${config.description}</p>
            <p><strong>密钥格式:</strong> ${config.keyExample}</p>
            <button onclick="usePreset('${key}')" style="margin-top: 10px;">使用此配置</button>
        `;
        container.appendChild(card);
    });
}

// 使用预设配置
function usePreset(presetKey) {
    const config = PRESET_CONFIGS[presetKey];
    if (!config) return;
    
    document.getElementById('apiProvider').value = presetKey;
    document.getElementById('baseUrl').value = config.baseUrl;
    document.getElementById('model').value = config.model;
    
    showStatus(`已应用 ${config.name} 配置，请输入您的API密钥`, 'success');
}

// 提供商变化时更新表单
function onProviderChange() {
    const provider = document.getElementById('apiProvider').value;
    if (provider && PRESET_CONFIGS[provider]) {
        usePreset(provider);
    }
}

// 切换AI配置显示
function toggleAIConfig() {
    const enabled = document.getElementById('enableAI').checked;
    const configDiv = document.getElementById('aiConfig');
    configDiv.style.display = enabled ? 'block' : 'none';
}

// 加载当前配置
async function loadCurrentConfig() {
    try {
        const result = await chrome.storage.local.get(['aiClassificationEnabled', 'aiApiConfig']);
        
        // 设置开关状态
        const enabledCheckbox = document.getElementById('enableAI');
        enabledCheckbox.checked = result.aiClassificationEnabled || false;
        toggleAIConfig();
        
        // 如果有已保存的配置，填充表单
        if (result.aiApiConfig) {
            const config = result.aiApiConfig;
            document.getElementById('apiKey').value = config.apiKey || '';
            document.getElementById('baseUrl').value = config.baseUrl || '';
            document.getElementById('model').value = config.model || '';
            
            // 尝试匹配预设提供商
            const matchedProvider = findMatchingProvider(config);
            if (matchedProvider) {
                document.getElementById('apiProvider').value = matchedProvider;
            }
        }
        
        showStatus('配置已加载', 'success');
    } catch (error) {
        showStatus('加载配置失败: ' + error.message, 'error');
    }
}

// 查找匹配的提供商
function findMatchingProvider(config) {
    for (const [key, preset] of Object.entries(PRESET_CONFIGS)) {
        if (config.baseUrl && config.baseUrl.includes(preset.baseUrl.split('/')[2])) {
            return key;
        }
    }
    return '';
}

// 保存配置
async function saveConfig() {
    try {
        const enabled = document.getElementById('enableAI').checked;
        
        if (!enabled) {
            // 只保存开关状态
            await chrome.storage.local.set({
                aiClassificationEnabled: false
            });
            showStatus('AI分类已禁用', 'success');
            return;
        }
        
        // 获取表单数据
        const apiKey = document.getElementById('apiKey').value.trim();
        const baseUrl = document.getElementById('baseUrl').value.trim();
        const model = document.getElementById('model').value.trim();
        
        // 验证必填字段
        if (!apiKey || !baseUrl || !model) {
            showStatus('请填写完整的API配置信息', 'error');
            return;
        }
        
        const config = {
            enabled: true,
            apiConfig: {
                apiKey,
                baseUrl,
                model,
                updatedAt: new Date().toISOString()
            }
        };
        
        // 保存到chrome存储
        await chrome.storage.local.set({
            aiClassificationEnabled: true,
            aiApiConfig: config.apiConfig
        });
        
        // 通知背景脚本更新配置
        const response = await chrome.runtime.sendMessage({
            action: "updateAIConfig",
            config: config
        });
        
        if (response.status === 'success') {
            showStatus('✅ 配置保存成功！AI分类功能已启用', 'success');
        } else {
            showStatus('配置保存失败: ' + response.message, 'error');
        }
        
    } catch (error) {
        showStatus('保存失败: ' + error.message, 'error');
    }
}

// 测试连接
async function testConnection() {
    try {
        showStatus('正在测试连接...', 'info');
        
        // 先保存当前配置
        await saveConfig();
        
        // 测试连接
        const response = await chrome.runtime.sendMessage({
            action: "testAIConnection"
        });
        
        if (response.success) {
            showStatus(`✅ 连接测试成功！\n响应: ${response.response}\n模型: ${response.model}`, 'success');
        } else {
            showStatus(`❌ 连接测试失败: ${response.message}`, 'error');
        }
        
    } catch (error) {
        showStatus('测试失败: ' + error.message, 'error');
    }
}

// 重置配置
async function resetConfig() {
    if (confirm('确定要重置所有配置吗？')) {
        try {
            await chrome.storage.local.remove(['aiClassificationEnabled', 'aiApiConfig']);
            
            // 重置表单
            document.getElementById('enableAI').checked = false;
            document.getElementById('apiProvider').value = '';
            document.getElementById('apiKey').value = '';
            document.getElementById('baseUrl').value = '';
            document.getElementById('model').value = '';
            
            toggleAIConfig();
            showStatus('配置已重置', 'success');
            
        } catch (error) {
            showStatus('重置失败: ' + error.message, 'error');
        }
    }
}

// 开发快速配置
async function quickSetup() {
    const apiKey = document.getElementById('quickApiKey').value.trim();
    
    if (!apiKey) {
        showStatus('请输入API密钥', 'error');
        return;
    }
    
    if (!apiKey.startsWith('sk-')) {
        if (!confirm('API密钥格式可能不正确（通常以sk-开头），确定继续吗？')) {
            return;
        }
    }
    
    try {
        // 使用OpenAI预设配置
        const config = {
            enabled: true,
            apiConfig: {
                apiKey: apiKey,
                baseUrl: "https://api.openai.com/v1",
                model: "gpt-3.5-turbo",
                name: "OpenAI GPT (快速配置)",
                updatedAt: new Date().toISOString()
            }
        };
        
        // 保存配置
        await chrome.storage.local.set({
            aiClassificationEnabled: true,
            aiApiConfig: config.apiConfig
        });
        
        // 更新表单显示
        document.getElementById('enableAI').checked = true;
        document.getElementById('apiProvider').value = 'openai';
        document.getElementById('apiKey').value = apiKey;
        document.getElementById('baseUrl').value = config.apiConfig.baseUrl;
        document.getElementById('model').value = config.apiConfig.model;
        toggleAIConfig();
        
        // 通知背景脚本
        const response = await chrome.runtime.sendMessage({
            action: "updateAIConfig",
            config: config
        });
        
        if (response.status === 'success') {
            showStatus('🚀 快速配置完成！已启用OpenAI GPT-3.5', 'success');
            
            // 自动测试连接
            setTimeout(testConnection, 1000);
        } else {
            showStatus('快速配置失败: ' + response.message, 'error');
        }
        
    } catch (error) {
        showStatus('快速配置失败: ' + error.message, 'error');
    }
}

// 显示状态消息
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `status ${type}`;
    statusDiv.innerHTML = message.replace(/\n/g, '<br>');
    
    // 3秒后淡出信息类消息
    if (type === 'info') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
            statusDiv.className = 'status';
        }, 3000);
    }
}

// 检查扩展是否在有效环境中运行
if (typeof chrome === 'undefined' || !chrome.runtime) {
    showStatus('⚠️ 此页面需要在Chrome扩展环境中运行', 'error');
}