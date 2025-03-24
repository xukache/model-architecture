/**
 * 链接有效性检查和404重定向
 * 用于检测链接是否有效，无效时重定向到404页面
 */
class LinkValidator {
    constructor() {
        this.validatedLinks = new Map(); // 用于缓存链接验证结果
        this.init();
    }

    static getInstance() {
        if (!LinkValidator.instance) {
            LinkValidator.instance = new LinkValidator();
        }
        return LinkValidator.instance;
    }

    init() {
        this.prevalidateLinks();
        this.attachLinkHandlers();
        console.log('链接验证器初始化完成');
    }

    prevalidateLinks() {
        // 获取所有非锚点链接
        const links = document.querySelectorAll('a:not([href^="#"])');
        const uniqueUrls = new Set();
        
        // 收集所有唯一的内部URL
        links.forEach(link => {
            const href = link.getAttribute('href');
            
            // 忽略锚点链接、空链接和javascript:void(0)
            if (!href || href.startsWith('#') || href.startsWith('javascript')) {
                return;
            }
            
            // 忽略外部链接
            if (link.href.startsWith('http') && !link.href.includes(window.location.hostname)) {
                return;
            }
            
            uniqueUrls.add(href);
        });
        
        // 预先验证所有链接
        uniqueUrls.forEach(url => {
            this.checkFileExists(url)
                .then(exists => {
                    this.validatedLinks.set(url, exists);
                })
                .catch(error => {
                    console.error(`预验证链接 ${url} 时出错:`, error);
                    this.validatedLinks.set(url, false); // 出错时假设链接无效
                });
        });
    }

    attachLinkHandlers() {
        // 获取所有非锚点链接
        const links = document.querySelectorAll('a:not([href^="#"])');
        
        links.forEach(link => {
            // 跳过外部链接
            if (link.href.startsWith('http') && !link.href.includes(window.location.hostname)) {
                return;
            }
            
            link.addEventListener('click', this.handleLinkClick.bind(this));
        });
    }

    handleLinkClick(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // 忽略锚点链接、空链接和javascript:void(0)
        if (!href || href.startsWith('#') || href.startsWith('javascript')) {
            return;
        }
        
        // 忽略外部链接
        if (link.href.startsWith('http') && !link.href.includes(window.location.hostname)) {
            return;
        }

        // 如果链接已经验证过
        if (this.validatedLinks.has(href)) {
            if (!this.validatedLinks.get(href)) {
                event.preventDefault(); // 阻止默认行为
                window.location.href = '/404.html'; // 重定向到404页面
            }
            return;
        }

        // 如果链接尚未验证，立即验证
        this.checkFileExists(href)
            .then(exists => {
                this.validatedLinks.set(href, exists); // 缓存结果
                
                if (!exists) {
                    event.preventDefault(); // 阻止默认行为
                    window.location.href = '/404.html'; // 重定向到404页面
                }
            })
            .catch(error => {
                console.error('检查文件是否存在时出错:', error);
                event.preventDefault(); // 出错时也阻止默认行为
                window.location.href = '/404.html'; // 重定向到404页面
            });
    }

    checkFileExists(url) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, true);
            
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            };
            
            xhr.onerror = function() {
                resolve(false);
            };
            
            xhr.timeout = 3000; // 设置3秒超时
            xhr.ontimeout = function() {
                resolve(false);
            };
            
            xhr.send();
        });
    }
}

// 初始化链接验证器
document.addEventListener('DOMContentLoaded', () => {
    const linkValidator = LinkValidator.getInstance();
}); 