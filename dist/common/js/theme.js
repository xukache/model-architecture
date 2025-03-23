/**
 * 主题切换脚本 - 处理深色/浅色模式切换
 */
document.addEventListener('DOMContentLoaded', function() {
    setupThemeToggle();
    initTheme();
});

/**
 * 设置主题切换按钮行为
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    // 桌面端主题切换
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
    
    // 移动端主题切换按钮
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
}

/**
 * 切换深色/浅色主题
 */
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

/**
 * 初始化主题设置
 * 根据本地存储或系统偏好设置主题
 */
function initTheme() {
    // 检查本地存储
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
        // 如果有存储的主题偏好，使用它
        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    } else {
        // 如果没有存储的主题，检查系统偏好
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (prefersDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
}

/**
 * 监听系统主题变化
 */
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newTheme = e.matches ? 'dark' : 'light';
    
    // 只有当用户未设置主题偏好时才跟随系统变化
    if (!localStorage.getItem('theme')) {
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
});
