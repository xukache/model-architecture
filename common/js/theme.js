class ThemeManager {
    constructor() {
        this.isDark = document.documentElement.classList.contains('dark');
        this.init();
    }

    init() {
        // 检查本地存储中的主题设置
        if (localStorage.getItem('theme') === 'light') {
            document.documentElement.classList.remove('dark');
            this.isDark = false;
        } else {
            document.documentElement.classList.add('dark');
            this.isDark = true;
        }

        this.setupEventListeners();
    }

    setupEventListeners() {
        // 主题切换按钮
        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.isDark = !this.isDark;
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');

        // 触发主题变更事件
        const event = new CustomEvent('themeChanged', { detail: { isDark: this.isDark } });
        document.dispatchEvent(event);
    }

    static getInstance() {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }
}
