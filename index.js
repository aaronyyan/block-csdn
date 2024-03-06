(function () {
 
    // 标题
    const titleArr = ["CSDN博客", "简书", "51CTO", "博客园", "软件园", "下载之家", "下载网",
        "百度健康", "快速问医生", "求医网", "求医问药", "家庭医生", "亿速云", "动力节点在线", "IT 技术博客",
        "千锋教育", "虎课网", "黑马程序员", "FinClip", "tie.pub", "php中文网", "mybj123.com", "脚本之家",
        "今日头条", "慕课网实战课程", "群英网络", "百度知道"];
 
    // 标题匹配正则
    const titleRegex = ["- csdn$"];
 
    // 描述
    const descArr = ["为您推荐的内容", "阿里云为您提供"];
 
    // 屏蔽来源(包含关键字则屏蔽)
    const sourceArr = ["博客园", "CSDN博客", "CSDN技术社区", "csdn.net", "百度知道", "腾讯云计算",
        "百度文库", "华军软件园", "当下软件园", "东坡下载站",
        "系统之家", "软件园", "/soft/", "软件", "下载网", "寻医",
        "健康", "健客网", "医生", "柠檬爱美", "紫一商城", "120.net", "求医", "宝宝知道", "58codes.com",
        "itgh.cn", "frontend.devrank.cn", "codeleading.com", "nzw6.com", "悠悠之家", "pythonjishu.com",
        "脚本之家", "jb51.net", "zhidao.baidu.com"];
 
    window.exec = function () {
        const searchEngines = {
            'baidu':{
                tag: 'div',
                id: 'content_left',
                className: 'result',
                contentTag: '.t',
            },
            'google': {
                tag: 'div',
                id: 'center_col',
                className: 'MjjYud',
                contentTag: '.GTRloc',
            },
            'bing': {
                tag: 'li',
                id: 'b_results',
                className: 'b_algo',
                contentTag: '.tptt',
            }
        }
        const selectorID = {
            'baidu':{
                content: document.getElementById(`${searchEngines.baidu.id}`),
            },
            'google': {
                content: document.getElementById(`${searchEngines.google.id}`),
            },
            'bing': {
                content: document.getElementById(`${searchEngines.bing.id}`),
            }
        }
 
        const selectors = {
            'baidu':{
                documents: $(selectorID.baidu.content).find(`${searchEngines.baidu.tag}[class*=${searchEngines.baidu.className}]`)
            },
            'google': {
                documents: $(selectorID.google.content).find(`${searchEngines.google.tag}[class*=${searchEngines.google.className}]`)
            },
            'bing': {
                documents: $(selectorID.bing.content).find(`${searchEngines.bing.tag}[class*=${searchEngines.bing.className}]`)
            }
        }
 
        if (selectorID.baidu.content) {
            for (let i = selectors.baidu.documents.length - 1; i >= 0; i--) {
                isRemove(selectors.baidu.documents[i], searchEngines.baidu.contentTag);
            }
        }
        if(selectorID.google.content) {
            for (let i = selectors.google.documents.length - 1; i >= 0; i--) {
                isRemove(selectors.google.documents[i], searchEngines.google.contentTag);
            }
        }
        if(selectorID.bing.content) {
            for (let i = selectors.bing.documents.length - 1; i >= 0; i--) {
                isRemove(selectors.bing.documents[i], searchEngines.bing.contentTag);
            }
        }
    };
 
    function isRemove(document, selector) {
        const title = getTitle(document, selector);
        const desc = getDesc(document);
        const source = getSource(document);
 
        const removeByArray = (text, arr, type) => {
            for (const element of arr) {
                if (text.includes(element)) {
                    document.remove();
                    return;
                }
            }
        };
 
        if (title) {
            for (const element of titleRegex) {
                if (new RegExp(element).test(title)) {
                    document.remove();
                    return;
                }
            }
            removeByArray(title, titleArr, 'title');
        }
 
        if (desc) {
            removeByArray(desc, descArr, 'desc');
        }
 
        if (source) {
            removeByArray(source, sourceArr, 'source');
        }
    }
 
    /**
     * 获取文章信息
     * @param {string} element
     * @param {string} selector
     * @returns {string}
     */
    function getArticleInfo(element, selector) {
        try {
            const selectedElement = element.querySelector(selector);
            return selectedElement ? selectedElement.innerText : "";
        } catch (error) {
            handleError(`get ${element} or ${selector} error`, error);
        }
        return "";
    }
 
    /**
     * 获取文章标题
     * @param {string} element
     * @param {string} selector
     * @returns {string}
     */
    function getTitle(element, selector) {
        return getArticleInfo(element, selector);
    }
 
    /**
     * 获取文章描述
     * @param {*} element
     * @returns {string}
     */
    function getDesc(element) {
        return getArticleInfo(element, 'span[class*="content"]');
    }
 
    /**
     * 获取文章来源
     * @param {*} element
     * @returns {string}
     */
    function getSource(element) {
        return getArticleInfo(element, 'div[class*="source"]');
    }
 
    /**
     * 通用错误处理函数
     * @param {string} message
     * @param {Error} error
     */
    function handleError(message, error) {
        console.error(`${message}`, error);
    }
 
    /**
     * 屏蔽内容
     */
    function hiddenContent() {
        let timer;
 
        document.body.addEventListener("DOMNodeInserted", (e) => {
            if (timer) {
                window.clearTimeout(timer);
            }
            timer = window.setTimeout(() => {
                exec();
            }, 100);
        });
    }
 
    $(function () {
        hiddenContent();
    });
 
})();
