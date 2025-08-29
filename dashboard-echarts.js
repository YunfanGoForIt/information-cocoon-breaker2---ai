// 数据可视化仪表板 JavaScript
let charts = {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待ECharts加载完成
    const checkECharts = () => {
        if (typeof echarts !== 'undefined') {
            console.log('ECharts已加载，开始初始化仪表板');
            loadData();
        } else {
            console.log('等待ECharts加载...');
            setTimeout(checkECharts, 100);
        }
    };
    
    checkECharts();
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
                    userBehavior: [],
                    diversityScore: 0,
                    badges: [],
                    recommendations: [],
                    classificationStats: {}
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
        renderCategoryChart(classificationStats);
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
    diversityElement.textContent = Math.round(diversityScore);
    
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

// 渲染平台使用分布图表
function renderPlatformChart(userBehavior) {
    try {
        const platformCounts = {};
        
        userBehavior.forEach(record => {
            const platform = record.platform || '未知';
            platformCounts[platform] = (platformCounts[platform] || 0) + 1;
        });
        
        const chartData = Object.entries(platformCounts).map(([platform, count]) => ({
            name: platform,
            value: count
        }));
        
        const chartElement = document.getElementById('platformChart');
        if (!chartElement) {
            console.error('找不到平台图表容器元素');
            return;
        }
        
        const chart = echarts.init(chartElement);
        
        const option = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: chartData.map(item => item.name)
            },
            series: [
                {
                    name: '平台使用',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: chartData
                }
            ]
        };
        
        chart.setOption(option);
        charts.platformChart = chart;
    } catch (error) {
        console.error('渲染平台图表失败:', error);
        document.getElementById('platformChart').innerHTML = '<p style="color: #666; text-align: center;">图表加载失败</p>';
    }
}

// 渲染内容分类分布图表
function renderCategoryChart(classificationStats) {
    try {
        const categoryData = Object.entries(classificationStats).map(([category, count]) => ({
            name: getCategoryDisplayName(category),
            value: count
        })).filter(item => item.value > 0);
        
        const chartElement = document.getElementById('categoryChart');
        if (!chartElement) {
            console.error('找不到分类图表容器元素');
            return;
        }
        
        const chart = echarts.init(chartElement);
        
        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: categoryData.map(item => item.name),
                axisLabel: {
                    rotate: 45
                }
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '分类数量',
                    type: 'bar',
                    data: categoryData.map(item => item.value),
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#667eea' },
                            { offset: 1, color: '#764ba2' }
                        ])
                    }
                }
            ]
        };
        
        chart.setOption(option);
        charts.categoryChart = chart;
    } catch (error) {
        console.error('渲染分类图表失败:', error);
        document.getElementById('categoryChart').innerHTML = '<p style="color: #666; text-align: center;">图表加载失败</p>';
    }
}

// 渲染时间趋势分析图表
function renderTrendChart(userBehavior) {
    try {
        // 按日期分组
        const dailyCounts = {};
        const today = new Date();
        
        // 初始化最近30天的数据
        for (let i = 29; i >= 0; i--) {
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
        
        const dates = Object.keys(dailyCounts);
        const counts = Object.values(dailyCounts);
        
        const chartElement = document.getElementById('trendChart');
        if (!chartElement) {
            console.error('找不到趋势图表容器元素');
            return;
        }
        
        const chart = echarts.init(chartElement);
        
        const option = {
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: dates.map(date => {
                    const d = new Date(date);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                })
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '浏览数量',
                    type: 'line',
                    smooth: true,
                    data: counts,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                            { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
                        ])
                    },
                    lineStyle: {
                        color: '#667eea'
                    }
                }
            ]
        };
        
        chart.setOption(option);
        charts.trendChart = chart;
    } catch (error) {
        console.error('渲染趋势图表失败:', error);
        document.getElementById('trendChart').innerHTML = '<p style="color: #666; text-align: center;">图表加载失败</p>';
    }
}

// 渲染标签云图表
function renderTagChart(userBehavior) {
    try {
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
            .slice(0, 20)
            .map(([tag, count]) => ({
                name: tag,
                value: count,
                textStyle: {
                    fontSize: Math.max(12, Math.min(30, count * 2 + 12))
                }
            }));
        
        const chartElement = document.getElementById('tagChart');
        if (!chartElement) {
            console.error('找不到标签云图表容器元素');
            return;
        }
        
        const chart = echarts.init(chartElement);
        
        const option = {
            tooltip: {
                show: true
            },
            series: [{
                type: 'wordCloud',
                shape: 'circle',
                left: 'center',
                top: 'center',
                width: '70%',
                height: '80%',
                right: null,
                bottom: null,
                sizeRange: [12, 30],
                rotationRange: [-90, 90],
                rotationStep: 45,
                gridSize: 8,
                drawOutOfBound: false,
                textStyle: {
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    color: function () {
                        return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                    }
                },
                emphasis: {
                    focus: 'self',
                    textStyle: {
                        shadowBlur: 10,
                        shadowColor: '#333'
                    }
                },
                data: tagData
            }]
        };
        
        chart.setOption(option);
        charts.tagChart = chart;
    } catch (error) {
        console.error('渲染标签云图表失败:', error);
        document.getElementById('tagChart').innerHTML = '<p style="color: #666; text-align: center;">图表加载失败</p>';
    }
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

// 窗口大小改变时重新调整图表
window.addEventListener('resize', function() {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
});

// 检查是否在扩展环境中运行
if (typeof chrome === 'undefined' || !chrome.storage) {
    // 如果不是在扩展环境中，显示模拟数据
    console.log('在非扩展环境中运行，使用模拟数据');
    
    // 模拟数据
    const mockData = {
        userBehavior: [
            {
                platform: 'bilibili',
                action: '观看视频',
                tags: ['科技', 'AI', '编程'],
                timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                url: 'https://www.bilibili.com/video/example'
            },
            {
                platform: 'zhihu',
                action: '阅读文章',
                tags: ['历史', '文化', '哲学'],
                timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
                url: 'https://www.zhihu.com/question/example'
            },
            {
                platform: 'weibo',
                action: '浏览动态',
                tags: ['社会', '新闻', '时事'],
                timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
                url: 'https://weibo.com/example'
            }
        ],
        diversityScore: 75,
        badges: [
            {
                name: '多样性探索者',
                description: '浏览了多种不同类型的内容',
                icon: '🌟',
                earnedAt: new Date().toISOString()
            }
        ],
        recommendations: [
            '探索古典文学的魅力',
            '了解最新的科技发展趋势',
            '关注环境保护话题'
        ],
        classificationStats: {
            'technology': 5,
            'culture_arts': 3,
            'science_exploration': 2,
            'society_humanity': 4
        }
    };
    
    // 覆盖chrome.storage.local.get方法
    window.chrome = {
        storage: {
            local: {
                get: function(keys, callback) {
                    setTimeout(() => {
                        const result = {};
                        keys.forEach(key => {
                            result[key] = mockData[key] || null;
                        });
                        callback(result);
                    }, 100);
                }
            }
        }
    };
}
