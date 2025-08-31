// Data Visualization Dashboard JavaScript - Real Data Version
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// Load all data
async function loadData() {
    try {
        showLoading(true);
        
        // Get all stored data
        const data = await new Promise((resolve, reject) => {
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([
                    'userBehavior', 
                    'diversityScore', 
                    'badges', 
                    'recommendations',
                    'classificationStats'
                ], (result) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(result);
                    }
                });
            } else {
                // If not in extension environment, show prompt message
                resolve({
                    userBehavior: [],
                    diversityScore: 0,
                    badges: [],
                    recommendations: [],
                    classificationStats: {}
                });
            }
        });
        
        // Process data
        const userBehavior = data.userBehavior || [];
        const diversityScore = data.diversityScore || 0;
        const badges = data.badges || [];
        const recommendations = data.recommendations || [];
        const classificationStats = data.classificationStats || {};
        
        console.log('Loaded real data:', {
            userBehaviorCount: userBehavior.length,
            diversityScore,
            badgesCount: badges.length,
            recommendationsCount: recommendations.length,
            classificationStats
        });
        
        // If no data, show prompt message
        if (userBehavior.length === 0) {
            showEmptyDataMessage();
            showLoading(false);
            return;
        }
        
        // Update statistics cards
        updateStatsCards(userBehavior, diversityScore, badges);
        
        // Render charts
        renderPlatformChart(userBehavior);
        renderCategoryChart(userBehavior, classificationStats);
        renderTrendChart(userBehavior);
        renderTagChart(userBehavior);
        
        // Render detailed data
        renderBehaviorTable(userBehavior);
        renderBadgesSection(badges);
        renderRecommendationsSection(recommendations);
        
        showLoading(false);
        
    } catch (error) {
        console.error('Failed to load data:', error);
        showError('Failed to load data: ' + error.message);
        showLoading(false);
    }
}

// Show empty data prompt
function showEmptyDataMessage() {
    const contentElement = document.getElementById('content');
    contentElement.innerHTML = `
        <div style="text-align: center; padding: 50px; color: white;">
            <h2 style="margin-bottom: 20px;">📊 No Data Available</h2>
            <p style="margin-bottom: 15px;">You haven't used the Information Cocoon Breaker plugin to browse content yet</p>
            <p style="margin-bottom: 20px;">Please browse some content on supported platforms (such as Bilibili, Zhihu, Weibo, etc.) first</p>
            <button class="refresh-btn" onclick="loadData()">🔄 Recheck Data</button>
        </div>
    `;
    contentElement.style.display = 'block';
}

// Update statistics cards
function updateStatsCards(userBehavior, diversityScore, badges) {
    // Total browsing records
    document.getElementById('totalRecords').textContent = userBehavior.length;
    
    // Diversity score
    const diversityElement = document.getElementById('diversityScore');
    const progressElement = document.getElementById('diversityProgress');
    diversityElement.textContent = Math.round(diversityScore);
    progressElement.style.width = diversityScore + '%';
    
    // Set color based on score
    diversityElement.className = 'value diversity-score';
    if (diversityScore >= 80) {
        diversityElement.classList.add('score-excellent');
    } else if (diversityScore >= 60) {
        diversityElement.classList.add('score-good');
    } else {
        diversityElement.classList.add('score-poor');
    }
    
    // Number of active platforms
    const platforms = new Set(userBehavior.map(record => record.platform).filter(Boolean));
    document.getElementById('activePlatforms').textContent = platforms.size;
    
    // Number of badges
    document.getElementById('totalBadges').textContent = badges.length;
}

// 渲染平台使用分布图表（简化版饼图）
function renderPlatformChart(userBehavior) {
    const platformCounts = {};
    
    userBehavior.forEach(record => {
        const platform = record.platform || '未知';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
    });
    
    const total = Object.values(platformCounts).reduce((sum, count) => sum + count, 0);
    document.getElementById('platformTotal').textContent = total;
    
    // 动态生成饼图
    const pieChart = document.getElementById('platformChart');
    const colors = ['#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', '#45b7d1'];
    
    if (total > 0) {
        let conicGradient = '';
        let currentAngle = 0;
        
        Object.entries(platformCounts).forEach(([platform, count], index) => {
            const percentage = (count / total) * 100;
            const angle = (percentage / 100) * 360;
            const color = colors[index % colors.length];
            
            if (index > 0) conicGradient += ', ';
            conicGradient += `${color} ${currentAngle}deg ${currentAngle + angle}deg`;
            currentAngle += angle;
        });
        
        pieChart.style.background = `conic-gradient(${conicGradient})`;
    } else {
        pieChart.style.background = '#f0f0f0';
    }
    
    // 生成图例
    const legendContainer = document.getElementById('platformLegend');
    
    let legendHTML = '';
    Object.entries(platformCounts).forEach(([platform, count], index) => {
        const percentage = Math.round((count / total) * 100);
        const color = colors[index % colors.length];
        
        legendHTML += `
            <div class="legend-item">
                <div class="legend-color" style="background: ${color}"></div>
                <span>${platform}: ${count} (${percentage}%)</span>
            </div>
        `;
    });
    
    legendContainer.innerHTML = legendHTML;
}

// 渲染内容分类分布图表（柱状图）
function renderCategoryChart(userBehavior, classificationStats) {
    // 从用户行为中分析内容分类
    const categoryFromBehavior = {};
    
    userBehavior.forEach(record => {
        if (record.tags && Array.isArray(record.tags)) {
            record.tags.forEach(tag => {
                // 根据标签判断分类
                const category = classifyTagToCategory(tag);
                if (category) {
                    categoryFromBehavior[category] = (categoryFromBehavior[category] || 0) + 1;
                }
            });
        }
        
        // 如果有分类信息，也加入统计
        if (record.classification) {
            // classification是一个对象，包含mainCategory和subCategory
            if (record.classification.mainCategory && record.classification.mainCategory.id) {
                const mainCategory = record.classification.mainCategory.id;
                categoryFromBehavior[mainCategory] = (categoryFromBehavior[mainCategory] || 0) + 1;
            }
        }
    });
    
    // 过滤掉非内容分类的统计数据
    const validCategories = [
        'technology', 'culture_arts', 'science_exploration', 
        'society_humanity', 'lifestyle', 'education_growth', 'business_finance',
        'entertainment'
    ];
    
    // 只保留有效的分类数据
    const filteredCategoryData = {};
    Object.entries(categoryFromBehavior).forEach(([category, count]) => {
        if (validCategories.includes(category)) {
            filteredCategoryData[category] = count;
        }
    });
    
    const categoryData = Object.entries(filteredCategoryData).map(([category, count]) => ({
        name: getCategoryDisplayName(category),
        value: count
    })).filter(item => item.value > 0);
    
    const chartContainer = document.getElementById('categoryChart');
    
    if (categoryData.length === 0) {
        chartContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 50px;">No category data available</p>';
        return;
    }
    
    const maxValue = Math.max(...categoryData.map(item => item.value));
    
    let chartHTML = '';
    categoryData.forEach(item => {
        const height = (item.value / maxValue) * 200; // 最大高度200px
        chartHTML += `
            <div class="bar" style="height: ${height}px;" title="${item.name}: ${item.value}">
                <div class="bar-label">${item.name}</div>
            </div>
        `;
    });
    
    chartContainer.innerHTML = chartHTML;
}

// 根据标签分类到内容类别
function classifyTagToCategory(tag) {
    const categoryKeywords = {
        'technology': ['科技', 'AI', '编程', '人工智能', '技术', '代码', '软件', '硬件', '芯片', '算法', '开发', '程序', '计算机', 'technology', 'ai', 'programming', 'software', 'hardware', 'development'],
        'culture_arts': ['文化', '艺术', '历史', '哲学', '文学', '音乐', '电影', '书籍', '诗歌', '绘画', '传统', '古典', '文艺', 'culture', 'art', 'history', 'philosophy', 'literature', 'music', 'film'],
        'science_exploration': ['科学', '物理', '化学', '生物', '医学', '健康', '环境', '天文', '地理', '实验', '研究', '自然', 'science', 'physics', 'chemistry', 'biology', 'medical', 'health', 'environment'],
        'society_humanity': ['社会', '新闻', '时事', '政治', '法律', '心理学', '社会学', '人文', '思想', '公共', '议题', 'society', 'news', 'politics', 'law', 'psychology', 'humanity'],
        'lifestyle': ['生活', '美食', '旅行', '时尚', '家居', '烹饪', '购物', '娱乐', '休闲', '穿搭', '美妆', '日常', 'lifestyle', 'food', 'travel', 'fashion', 'home', 'cooking'],
        'education_growth': ['学习', '教育', '成长', '职业', '技能', '培训', '课程', '知识', '方法', '发展', '提升', 'education', 'learning', 'career', 'skill', 'training'],
        'business_finance': ['商业', '投资', '创业', '金融', '经济', '市场', '管理', '财经', '理财', '资本', '企业', 'business', 'investment', 'finance', 'economy', 'market'],
        'entertainment': ['娱乐', '游戏', '体育', '综艺', '休闲', '娱乐', 'entertainment', 'gaming', 'sports', 'leisure']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => tag.toLowerCase().includes(keyword.toLowerCase()))) {
            return category;
        }
    }
    
    return null;
}

// 渲染时间趋势分析图表（柱状图）
function renderTrendChart(userBehavior) {
    // 按日期分组
    const dailyCounts = {};
    const today = new Date();
    
    // 初始化最近7天的数据
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dailyCounts[dateStr] = 0;
    }
    
    // 统计每天的数据
    userBehavior.forEach(record => {
        if (record.timestamp) {
            const date = new Date(record.timestamp);
            const dateStr = date.toISOString().split('T')[0];
            if (dailyCounts.hasOwnProperty(dateStr)) {
                dailyCounts[dateStr]++;
            }
        }
    });
    
    const maxValue = Math.max(...Object.values(dailyCounts));
    const chartContainer = document.getElementById('trendChart');
    
    let chartHTML = '';
    Object.entries(dailyCounts).forEach(([date, count]) => {
        const height = maxValue > 0 ? (count / maxValue) * 200 : 0;
        const displayDate = new Date(date);
        const label = `${displayDate.getMonth() + 1}/${displayDate.getDate()}`;
        
        chartHTML += `
            <div class="bar" style="height: ${height}px;" title="${label}: ${count}">
                <div class="bar-label">${label}</div>
            </div>
        `;
    });
    
    chartContainer.innerHTML = chartHTML;
}

// 渲染标签云图表
function renderTagChart(userBehavior) {
    const tagCounts = {};
    
    userBehavior.forEach(record => {
        if (record.tags && Array.isArray(record.tags)) {
            record.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        }
    });
    
    const tagData = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const chartContainer = document.getElementById('tagChart');
    
    if (tagData.length === 0) {
        chartContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 50px;">No tag data</p>';
        return;
    }
    
    let chartHTML = '';
    tagData.forEach(([tag, count]) => {
        const fontSize = Math.max(14, Math.min(24, count * 2 + 14));
        chartHTML += `
            <span class="tag" style="font-size: ${fontSize}px;" title="${tag}: ${count}次">
                ${tag}
            </span>
        `;
    });
    
    chartContainer.innerHTML = chartHTML;
}

// 渲染行为记录表格
function renderBehaviorTable(userBehavior) {
    const tableContainer = document.getElementById('behaviorTable');
    
    if (userBehavior.length === 0) {
        tableContainer.innerHTML = '<p style="color: #666; text-align: center;">No browsing records</p>';
        return;
    }
    
    const recentRecords = userBehavior.slice(-20).reverse(); // 显示最近20条记录
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Platform</th>
                    <th>Action</th>
                    <th>Tags</th>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recentRecords.forEach(record => {
        const timestamp = record.timestamp ? new Date(record.timestamp).toLocaleString('en-US') : 'Unknown';
        const platform = record.platform || 'Unknown';
        const action = record.action || 'Browse';
        const tags = record.tags && record.tags.length > 0 
            ? record.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : 'No tags';
        const url = record.url || '#';
        
        tableHTML += `
            <tr>
                <td>${timestamp}</td>
                <td><span class="platform-badge platform-${platform.toLowerCase()}">${platform}</span></td>
                <td>${action}</td>
                <td>${tags}</td>
                <td><a href="${url}" target="_blank" style="color: #667eea; text-decoration: none;">View</a></td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}

// 渲染徽章部分
function renderBadgesSection(badges) {
    const badgesContainer = document.getElementById('badgesSection');
    
    if (badges.length === 0) {
        badgesContainer.innerHTML = '<p style="color: #666; text-align: center;">No badges earned</p>';
        return;
    }
    
    let badgesHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">';
    
    badges.forEach(badge => {
        badgesHTML += `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 10px;">${badge.icon || '🏆'}</div>
                <div style="font-weight: bold; margin-bottom: 5px;">${badge.name}</div>
                <div style="color: #666; font-size: 0.9rem;">${badge.description || ''}</div>
                <div style="color: #999; font-size: 0.8rem; margin-top: 5px;">
                    ${badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString('en-US') : ''}
                </div>
            </div>
        `;
    });
    
    badgesHTML += '</div>';
    badgesContainer.innerHTML = badgesHTML;
}

// 渲染推荐部分
function renderRecommendationsSection(recommendations) {
    const recommendationsContainer = document.getElementById('recommendationsSection');
    
    if (recommendations.length === 0) {
        recommendationsContainer.innerHTML = '<p style="color: #666; text-align: center;">No recommendations</p>';
        return;
    }
    
    let recommendationsHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">';
    
    recommendations.forEach((recommendation, index) => {
        recommendationsHTML += `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="font-size: 1.2rem; margin-bottom: 10px;">💡 Recommendation ${index + 1}</div>
                <div style="font-weight: bold;">${recommendation}</div>
            </div>
        `;
    });
    
    recommendationsHTML += '</div>';
    recommendationsContainer.innerHTML = recommendationsHTML;
}

// 获取分类显示名称
function getCategoryDisplayName(category) {
    const categoryNames = {
        'technology': 'Technology Innovation',
        'culture_arts': 'Culture & Arts',
        'science_exploration': 'Science Exploration',
        'society_humanity': 'Society & Humanities',
        'lifestyle': 'Lifestyle',
        'education_growth': 'Education & Growth',
        'business_finance': 'Business & Finance',
        'entertainment': 'Entertainment & Leisure'
    };
    
    return categoryNames[category] || category;
}

// 显示/隐藏加载状态
function showLoading(show) {
    const loadingElement = document.getElementById('loading');
    const contentElement = document.getElementById('content');
    
    if (show) {
        loadingElement.style.display = 'block';
        contentElement.style.display = 'none';
    } else {
        loadingElement.style.display = 'none';
        contentElement.style.display = 'block';
    }
}

// 显示错误信息
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    // 插入到刷新按钮之后
    const refreshBtn = document.querySelector('.refresh-btn');
    refreshBtn.parentNode.insertBefore(errorDiv, refreshBtn.nextSibling);
    
    // 3秒后自动移除错误信息
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}