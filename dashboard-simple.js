// 简化版数据可视化仪表板 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});

// 加载所有数据
async function loadData() {
    try {
        showLoading(true);
        
        // 获取所有存储的数据
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
                // 使用模拟数据
                resolve({
                    userBehavior: [
                        {
                            platform: 'bilibili',
                            action: '观看视频',
                            tags: ['科技', 'AI', '编程', '算法'],
                            classification: 'technology',
                            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                            url: 'https://www.bilibili.com/video/example'
                        },
                        {
                            platform: 'zhihu',
                            action: '阅读文章',
                            tags: ['历史', '文化', '哲学', '思想'],
                            classification: 'culture_arts',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                            url: 'https://www.zhihu.com/question/example'
                        },
                        {
                            platform: 'weibo',
                            action: '浏览动态',
                            tags: ['社会', '新闻', '时事', '政治'],
                            classification: 'society_humanity',
                            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                            url: 'https://weibo.com/example'
                        },
                        {
                            platform: 'bilibili',
                            action: '观看视频',
                            tags: ['美食', '烹饪', '生活'],
                            classification: 'lifestyle',
                            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
                            url: 'https://www.bilibili.com/video/food'
                        },
                        {
                            platform: 'zhihu',
                            action: '阅读文章',
                            tags: ['学习', '教育', '职业发展'],
                            classification: 'education_growth',
                            timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
                            url: 'https://www.zhihu.com/question/education'
                        },
                        {
                            platform: 'xiaohongshu',
                            action: '浏览笔记',
                            tags: ['时尚', '美妆', '穿搭'],
                            classification: 'lifestyle',
                            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
                            url: 'https://www.xiaohongshu.com/note/fashion'
                        }
                    ],
                    diversityScore: 75,
                    badges: [
                        {
                            name: '多样性探索者',
                            description: '浏览了多种不同类型的内容',
                            icon: '🌟',
                            earnedAt: new Date().toISOString()
                        },
                        {
                            name: '跨平台达人',
                            description: '在多个平台上都有活跃表现',
                            icon: '🚀',
                            earnedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
                        }
                    ],
                    recommendations: [
                        '探索古典文学的魅力',
                        '了解最新的科技发展趋势',
                        '关注环境保护话题',
                        '学习投资理财知识'
                    ],
                    classificationStats: {
                        'technology': 2,
                        'culture_arts': 1,
                        'science_exploration': 0,
                        'society_humanity': 1,
                        'lifestyle': 2,
                        'education_growth': 1,
                        'business_finance': 0
                    }
                });
            }
        });
        
        // 处理数据
        const userBehavior = data.userBehavior || [];
        const diversityScore = data.diversityScore || 0;
        const badges = data.badges || [];
        const recommendations = data.recommendations || [];
        const classificationStats = data.classificationStats || {};
        
        // 更新统计卡片
        updateStatsCards(userBehavior, diversityScore, badges);
        
        // 渲染图表
        renderPlatformChart(userBehavior);
        renderCategoryChart(userBehavior, classificationStats);
        renderTrendChart(userBehavior);
        renderTagChart(userBehavior);
        
        // 渲染详细数据
        renderBehaviorTable(userBehavior);
        renderBadgesSection(badges);
        renderRecommendationsSection(recommendations);
        
        showLoading(false);
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('加载数据失败: ' + error.message);
        showLoading(false);
    }
}

// 更新统计卡片
function updateStatsCards(userBehavior, diversityScore, badges) {
    // 总浏览记录
    document.getElementById('totalRecords').textContent = userBehavior.length;
    
    // 多样性评分
    const diversityElement = document.getElementById('diversityScore');
    const progressElement = document.getElementById('diversityProgress');
    diversityElement.textContent = Math.round(diversityScore);
    progressElement.style.width = diversityScore + '%';
    
    // 根据评分设置颜色
    diversityElement.className = 'value diversity-score';
    if (diversityScore >= 80) {
        diversityElement.classList.add('score-excellent');
    } else if (diversityScore >= 60) {
        diversityElement.classList.add('score-good');
    } else {
        diversityElement.classList.add('score-poor');
    }
    
    // 活跃平台数量
    const platforms = new Set(userBehavior.map(record => record.platform).filter(Boolean));
    document.getElementById('activePlatforms').textContent = platforms.size;
    
    // 徽章数量
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
            const category = record.classification;
            categoryFromBehavior[category] = (categoryFromBehavior[category] || 0) + 1;
        }
    });
    
    // 合并classificationStats数据
    Object.entries(classificationStats).forEach(([category, count]) => {
        categoryFromBehavior[category] = (categoryFromBehavior[category] || 0) + count;
    });
    
    const categoryData = Object.entries(categoryFromBehavior).map(([category, count]) => ({
        name: getCategoryDisplayName(category),
        value: count
    })).filter(item => item.value > 0);
    
    const chartContainer = document.getElementById('categoryChart');
    
    if (categoryData.length === 0) {
        chartContainer.innerHTML = '<p style="color: #666; text-align: center; padding: 50px;">暂无分类数据</p>';
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
        'technology': ['科技', 'AI', '编程', '人工智能', '技术', '代码', '软件', '硬件', '芯片', '算法'],
        'culture_arts': ['文化', '艺术', '历史', '哲学', '文学', '音乐', '电影', '书籍', '诗歌', '绘画'],
        'science_exploration': ['科学', '物理', '化学', '生物', '医学', '健康', '环境', '天文', '地理', '实验'],
        'society_humanity': ['社会', '新闻', '时事', '政治', '法律', '心理学', '社会学', '人文', '思想'],
        'lifestyle': ['生活', '美食', '旅行', '时尚', '家居', '烹饪', '购物', '娱乐', '休闲'],
        'education_growth': ['学习', '教育', '成长', '职业', '技能', '培训', '课程', '知识', '方法'],
        'business_finance': ['商业', '投资', '创业', '金融', '经济', '市场', '管理', '财经', '理财']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => tag.includes(keyword))) {
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
        tableContainer.innerHTML = '<p style="color: #666; text-align: center;">暂无浏览记录</p>';
        return;
    }
    
    const recentRecords = userBehavior.slice(-20).reverse(); // 显示最近20条记录
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>时间</th>
                    <th>平台</th>
                    <th>操作</th>
                    <th>标签</th>
                    <th>URL</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recentRecords.forEach(record => {
        const timestamp = record.timestamp ? new Date(record.timestamp).toLocaleString('zh-CN') : '未知';
        const platform = record.platform || '未知';
        const action = record.action || '浏览';
        const tags = record.tags && record.tags.length > 0 
            ? record.tags.map(tag => `<span class="tag">${tag}</span>`).join('')
            : '无标签';
        const url = record.url || '#';
        
        tableHTML += `
            <tr>
                <td>${timestamp}</td>
                <td><span class="platform-badge platform-${platform.toLowerCase()}">${platform}</span></td>
                <td>${action}</td>
                <td>${tags}</td>
                <td><a href="${url}" target="_blank" style="color: #667eea; text-decoration: none;">查看</a></td>
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
        badgesContainer.innerHTML = '<p style="color: #666; text-align: center;">暂无获得徽章</p>';
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
                    ${badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString('zh-CN') : ''}
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
        recommendationsContainer.innerHTML = '<p style="color: #666; text-align: center;">暂无推荐内容</p>';
        return;
    }
    
    let recommendationsHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">';
    
    recommendations.forEach((recommendation, index) => {
        recommendationsHTML += `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
                <div style="font-size: 1.2rem; margin-bottom: 10px;">💡 推荐 ${index + 1}</div>
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
        'technology': '科技创新',
        'culture_arts': '文化艺术',
        'science_exploration': '科学探索',
        'society_humanity': '社会人文',
        'lifestyle': '生活方式',
        'education_growth': '教育成长',
        'business_finance': '商业财经'
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
