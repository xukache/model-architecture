/**
 * 导航脚本 - 处理移动菜单、滚动效果和返回顶部按钮
 */
document.addEventListener('DOMContentLoaded', function() {
    // 移动菜单设置
    setupMobileMenu();

    // 返回顶部按钮
    setupBackToTop();

    // 滚动动画
    setupScrollAnimations();
});

/**
 * 设置移动菜单的交互行为
 */
function setupMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

    if (mobileMenuButton && mobileMenu) {
        // 点击菜单按钮时切换菜单显示状态
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });

        // 点击菜单项后关闭菜单
        const mobileMenuLinks = mobileMenu.querySelectorAll('a');
        mobileMenuLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.add('hidden');
            });
        });

        // 移动端主题切换按钮
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', function() {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
                mobileMenu.classList.add('hidden');
            });
        }

        // 点击页面其他区域关闭菜单
        document.addEventListener('click', function(event) {
            if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }
}

/**
 * 设置返回顶部按钮的行为
 */
function setupBackToTop() {
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        // 根据滚动位置显示/隐藏按钮
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        });

        // 点击按钮返回顶部
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * 设置滚动相关的动画效果
 */
function setupScrollAnimations() {
    // 添加平滑滚动到所有锚链接
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // 忽略空锚链接
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 偏移量，考虑固定导航栏
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 可以在这里添加滚动触发的动画效果
    // 例如：当元素进入视口时添加动画类
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-fade-in');
            }
        });
    };
    
    // 首次加载时执行一次
    animateOnScroll();
    
    // 滚动时执行
    window.addEventListener('scroll', animateOnScroll);
}