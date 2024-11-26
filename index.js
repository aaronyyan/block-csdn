// ==UserScript==
// @name        屏蔽 CSDN
// @version     1.1.0
// @author      aaron yan
// @description 屏蔽 CSDN 及其它垃圾信息
// @match       https://www.baidu.com
// @match       https://www.baidu.com/s*
// @match       https://www.google.com
// @match       https://www.google.com/search*
// @match       https://www.google.com.hk/search*
// @match       https://www.google.com.tw/search*
// @grant       GM_xmlhttpRequest

// @license     MIT

// @changelog  v1.1.0 (2024-01-17)
//             1. 优化代码结构和性能
//             2. 改进屏蔽规则管理
//             3. 添加更详细的日志信息
// ==/UserScript==


    (function () {
        // 配置对象
        const CONFIG = {
            // 搜索引擎配置
            engines: {
                baidu: {
                    host: 'baidu.com',
                    container: '#content_left',
                    selectors: {
                        title: ['h3.c-title.t.tts-title', '.c-gap-right'],
                        url: '.c-showurl',
                        result: '.result',
                        source: 'div[class*="source"]'
                    }
                },
                google: {
                    host: 'google.com',
                    container: '#search',
                    selectors: {
                        title: ['.VuuXrf'],
                        result: '.MjjYud'
                    }
                }
            },

            // 屏蔽规则配置
            blockRules: {
                // 技术网站
                tech: [
                    "CSDN博客", "CSDN技术社区", "csdn.net",
                    "简书", "博客园", "PHP中文网",
                    "51CTO", "腾讯云计算",
                    "360Doc", "千锋教育"
                ],
                // 下载站点
                download: [
                    "软件园", "下载之家", "下载网",
                    "华军软件园", "当下软件园", "东坡下载站",
                    "系统之家", "/soft/"
                ],
                // 医疗健康
                health: [
                    "百度健康", "快速问医生", "求医网",
                    "求医问药", "家庭医生", "寻医",
                    "健康", "健客网", "医生"
                ],
                // 其他
                others: [
                    "亿速云", "动力节点在线", "IT 技术博客",
                    "千锋教育", "虎课网", "黑马程序员", "抖音"
                ]
            },

            // URL屏蔽规则
            blockUrls: [
                'douyin.com'
            ]
        };

        // 工具函数
        const utils = {
            // 防抖函数
            debounce(func, wait) {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },

            // 日志函数
            log(type, message, data = {}) {
                const styles = {
                    block: 'color: #ff6b6b; font-weight: bold',
                    info: 'color: #4CAF50; font-weight: bold',
                    error: 'color: #f44336; font-weight: bold'
                };
                console.log(`%c ${message}`, styles[type]);
            },

            // 获取当前搜索引擎
            getCurrentEngine() {
                const host = window.location.hostname;
                return Object.entries(CONFIG.engines).find(([, config]) =>
                    host.includes(config.host)
                )?.[0];
            },

            // 获取所有屏蔽关键词
            getAllBlockedSites() {
                return Object.values(CONFIG.blockRules)
                    .flat()
                    .filter((value, index, self) => self.indexOf(value) === index);
            }
        };

        // 搜索结果处理类
        class SearchResultHandler {
            constructor(engine) {
                this.engine = engine;
                this.config = CONFIG.engines[engine];
                this.blockedSites = utils.getAllBlockedSites();
            }

            // 检查是否应该屏蔽
            shouldBlock(element) {
                // 检查标题
                const titleSelectors = this.config.selectors.title;
                for (const selector of titleSelectors) {
                    const titleElement = element.querySelector(selector);
                    if (titleElement && this.blockedSites.some(site =>
                        titleElement.textContent.trim().includes(site))) {
                        return true;
                    }
                }

                // 检查URL（如果有URL选择器）
                if (this.config.selectors.url) {
                    const urlElement = element.querySelector(this.config.selectors.url);
                    if (urlElement && CONFIG.blockUrls.some(url =>
                        urlElement.textContent.trim().includes(url))) {
                        return true;
                    }
                }

                // 检查来源（如果有source选择器）
                if (this.config.selectors.source) {
                    const sourceElement = element.querySelector(this.config.selectors.source);
                    if (sourceElement && this.blockedSites.some(site =>
                        sourceElement.textContent.trim().includes(site))) {
                        return true;
                    }
                }

                return false;
            }

            // 移除搜索结果
            removeBlockedSites() {
                try {
                    const results = document.querySelectorAll(this.config.selectors.result);
                    results.forEach(result => {
                        if (this.shouldBlock(result)) {
                            const title = result.querySelector(this.config.selectors.title[0])?.textContent.trim();
                            const source = result.querySelector(this.config.selectors.source)?.textContent.trim();
                            utils.log('block', 'Blocked:', {
                                title,
                                source: source || 'N/A'
                            });
                            result.remove();
                        }
                    });
                } catch (error) {
                    utils.log('error', `[${this.engine}] Error:`, error);
                }
            }
        }

        // 观察器类
        class ResultObserver {
            constructor() {
                this.engine = utils.getCurrentEngine();
                if (!this.engine) return;

                this.handler = new SearchResultHandler(this.engine);
                this.container = document.querySelector(CONFIG.engines[this.engine].container);
            }

            // 初始化观察器
            init() {
                if (!this.container) return;

                // 创建MutationObserver
                const observer = new MutationObserver(
                    utils.debounce(() => this.handler.removeBlockedSites(), 100)
                );

                // 配置观察器
                observer.observe(this.container, {
                    childList: true,
                    subtree: true
                });

                // 监听滚动事件
                window.addEventListener('scroll',
                    utils.debounce(() => this.handler.removeBlockedSites(), 100),
                    { passive: true }
                );

                // 初始执行
                this.handler.removeBlockedSites();
            }
        }

        // 初始化
        function init() {
            utils.log('info', '⚡ Content Blocker Activated! ⚡');
            const observer = new ResultObserver();
            observer.init();
        }

        // 启动脚本
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
