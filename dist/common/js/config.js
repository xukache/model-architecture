/**
 * Tailwind配置加载脚本
 * 确保所有页面使用相同的配置
 */
document.addEventListener('DOMContentLoaded', function() {
  // 只有当页面使用了CDN版本的tailwindcss时才需要设置配置
  if (window.tailwind) {
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#f0f9ff',
              100: '#e0f2fe',
              200: '#bae6fd',
              300: '#7dd3fc',
              400: '#38bdf8',
              500: '#0ea5e9',
              600: '#0284c7',
              700: '#0369a1',
              800: '#075985',
              900: '#0c4a6e',
              950: '#082f49',
            },
            secondary: {
              50: '#f5f3ff',
              100: '#ede9fe',
              200: '#ddd6fe',
              300: '#c4b5fd',
              400: '#a78bfa',
              500: '#8b5cf6',
              600: '#7c3aed',
              700: '#6d28d9',
              800: '#5b21b6',
              900: '#4c1d95',
              950: '#2e1065',
            },
            accent: {
              50: '#fff1f2',
              100: '#ffe4e6',
              200: '#fecdd3',
              300: '#fda4af',
              400: '#fb7185',
              500: '#f43f5e',
              600: '#e11d48',
              700: '#be123c',
              800: '#9f1239',
              900: '#881337',
              950: '#4c0519',
            },
            neutral: {
              50: 'rgb(242 245 250)',
              100: '#f5f5f5',
              200: '#e5e5e5',
              300: '#d4d4d4',
              400: '#a3a3a3',
              500: '#737373',
              600: '#525252',
              700: '#404040',
              800: '#262626',
              900: '#171717',
              950: '#0a0a0a',
            }
          },
          fontFamily: {
            sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            mono: ['SF Mono', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-in-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'pulse-slow': 'pulse 3s ease-in-out infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            slideUp: {
              '0%': { transform: 'translateY(20px)', opacity: '0' },
              '100%': { transform: 'translateY(0)', opacity: '1' },
            },
          },
          transitionProperty: {
            'height': 'height',
            'spacing': 'margin, padding',
          },
          backgroundImage: {
            'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
          }
        },
      },
      plugins: [],
    };
    console.log('Tailwind配置已全局加载');
  }
}); 