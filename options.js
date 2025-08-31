// Preset configurations - Only supports Zhipu GLM-4.5
const PRESET_CONFIGS = {
    zhipu: {
        name: "Zhipu AI GLM-4.5",
        baseUrl: "https://open.bigmodel.cn/api/paas/v4",
        model: "glm-4.5",
        description: "Zhipu AI GLM-4.5, stable access in China, supports Chinese",
        keyExample: "xxxx.xxxxxxxxxxxxxxxxx"
    }
};

// Page initialization
document.addEventListener('DOMContentLoaded', async () => {
    await loadCurrentConfig();
    setupEventListeners();
    renderPresetConfigs();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('enableAI').addEventListener('change', toggleAIConfig);
    document.getElementById('apiProvider').addEventListener('change', onProviderChange);
}

// Render preset configuration cards
function renderPresetConfigs() {
    const container = document.getElementById('presetConfigs');
    container.innerHTML = '';
    
    Object.entries(PRESET_CONFIGS).forEach(([key, config]) => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.innerHTML = `
            <h3>${config.name}</h3>
            <p><strong>Model:</strong> ${config.model}</p>
            <p><strong>Description:</strong> ${config.description}</p>
            <p><strong>Key Format:</strong> ${config.keyExample}</p>
            <button onclick="usePreset('${key}')" style="margin-top: 10px;">Use This Configuration</button>
        `;
        container.appendChild(card);
    });
}

// Use Zhipu GLM configuration
function usePreset(presetKey = 'zhipu') {
    const config = PRESET_CONFIGS.zhipu; // Only use Zhipu configuration
    
    document.getElementById('apiProvider').value = 'zhipu';
    document.getElementById('baseUrl').value = config.baseUrl;
    document.getElementById('model').value = config.model;
    
    showStatus(`Applied ${config.name} configuration, please enter your API key`, 'success');
}

// Provider change updates form - Fixed to use Zhipu
function onProviderChange() {
    usePreset('zhipu'); // Force use of Zhipu configuration
}

// Toggle AI configuration display
function toggleAIConfig() {
    const enabled = document.getElementById('enableAI').checked;
    const configDiv = document.getElementById('aiConfig');
    configDiv.style.display = enabled ? 'block' : 'none';
}

// Load current configuration
async function loadCurrentConfig() {
    try {
        const result = await chrome.storage.local.get(['aiClassificationEnabled', 'aiApiConfig']);
        
        // Set switch state
        const enabledCheckbox = document.getElementById('enableAI');
        enabledCheckbox.checked = result.aiClassificationEnabled || false;
        toggleAIConfig();
        
        // If there's saved configuration, populate the form
        if (result.aiApiConfig) {
            const config = result.aiApiConfig;
            document.getElementById('apiKey').value = config.apiKey || '';
            document.getElementById('baseUrl').value = config.baseUrl || '';
            document.getElementById('model').value = config.model || '';
            
            // Try to match preset provider
            const matchedProvider = findMatchingProvider(config);
            if (matchedProvider) {
                document.getElementById('apiProvider').value = matchedProvider;
            }
        }
        
        showStatus('Configuration loaded', 'success');
    } catch (error) {
        showStatus('Failed to load configuration: ' + error.message, 'error');
    }
}

// Find matching provider - Only supports Zhipu
function findMatchingProvider(config) {
    if (config.baseUrl && config.baseUrl.includes('bigmodel.cn')) {
        return 'zhipu';
    }
    return 'zhipu'; // Default to Zhipu
}

// Save configuration
async function saveConfig() {
    try {
        const enabled = document.getElementById('enableAI').checked;
        
        if (!enabled) {
            // Only save switch state
            await chrome.storage.local.set({
                aiClassificationEnabled: false
            });
            showStatus('AI classification disabled', 'success');
            return;
        }
        
        // Get form data
        const apiKey = document.getElementById('apiKey').value.trim();
        const baseUrl = document.getElementById('baseUrl').value.trim();
        const model = document.getElementById('model').value.trim();
        
        // Validate required fields
        if (!apiKey || !baseUrl || !model) {
            showStatus('Please fill in complete API configuration information', 'error');
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
        
        // Save to chrome storage
        await chrome.storage.local.set({
            aiClassificationEnabled: true,
            aiApiConfig: config.apiConfig
        });
        
        // Notify background script to update configuration
        const response = await chrome.runtime.sendMessage({
            action: "updateAIConfig",
            config: config
        });
        
        if (response.status === 'success') {
            showStatus('✅ Configuration saved successfully! AI classification feature enabled', 'success');
        } else {
            showStatus('Configuration save failed: ' + response.message, 'error');
        }
        
    } catch (error) {
        showStatus('Save failed: ' + error.message, 'error');
    }
}

// Test connection
async function testConnection() {
    try {
        showStatus('Testing connection...', 'info');
        
        // Save current configuration first
        await saveConfig();
        
        // Test connection
        const response = await chrome.runtime.sendMessage({
            action: "testAIConnection"
        });
        
        if (response.success) {
            showStatus(`✅ Connection test successful!\nResponse: ${response.response}\nModel: ${response.model}`, 'success');
        } else {
            showStatus(`❌ Connection test failed: ${response.message}`, 'error');
        }
        
    } catch (error) {
        showStatus('Test failed: ' + error.message, 'error');
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
            showStatus('Configuration reset', 'success');
            
        } catch (error) {
            showStatus('Reset failed: ' + error.message, 'error');
        }
    }
}

// Development quick setup
async function quickSetup() {
    const apiKey = document.getElementById('quickApiKey').value.trim();
    
    if (!apiKey) {
        showStatus('Please enter API key', 'error');
        return;
    }
    
    if (!apiKey.startsWith('sk-')) {
        if (!confirm('API key format may be incorrect (usually starts with sk-), continue anyway?')) {
            return;
        }
    }
    
    try {
        // Use OpenAI preset configuration
        const config = {
            enabled: true,
            apiConfig: {
                apiKey: apiKey,
                baseUrl: "https://api.openai.com/v1",
                model: "gpt-3.5-turbo",
                name: "OpenAI GPT (Quick Setup)",
                updatedAt: new Date().toISOString()
            }
        };
        
        // Save configuration
        await chrome.storage.local.set({
            aiClassificationEnabled: true,
            aiApiConfig: config.apiConfig
        });
        
        // Update form display
        document.getElementById('enableAI').checked = true;
        document.getElementById('apiProvider').value = 'openai';
        document.getElementById('apiKey').value = apiKey;
        document.getElementById('baseUrl').value = config.apiConfig.baseUrl;
        document.getElementById('model').value = config.apiConfig.model;
        toggleAIConfig();
        
        // Notify background script
        const response = await chrome.runtime.sendMessage({
            action: "updateAIConfig",
            config: config
        });
        
        if (response.status === 'success') {
            showStatus('🚀 Quick setup complete! OpenAI GPT-3.5 enabled', 'success');
            
            // Auto test connection
            setTimeout(testConnection, 1000);
        } else {
            showStatus('Quick setup failed: ' + response.message, 'error');
        }
        
    } catch (error) {
        showStatus('Quick setup failed: ' + error.message, 'error');
    }
}

// Show status message
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.className = `status ${type}`;
    statusDiv.innerHTML = message.replace(/\n/g, '<br>');
    
    // Fade out info messages after 3 seconds
    if (type === 'info') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
            statusDiv.className = 'status';
        }, 3000);
    }
}

// Check if extension is running in valid environment
if (typeof chrome === 'undefined' || !chrome.runtime) {
    showStatus('⚠️ This page needs to run in Chrome extension environment', 'error');
}