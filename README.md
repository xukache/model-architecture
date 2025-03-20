# 大模型架构可视化平台

本项目旨在通过交互式可视化的方式，展示主流大型语言模型的内部架构和核心工作原理，帮助读者直观地理解复杂的模型结构和算法机制。

## 项目特点

-**交互式可视化**：使用动态图表和交互式演示，直观展示大模型内部复杂机制

-**全面的模型覆盖**：包含Transformer、LLaMA、GPT、Deepseek等主流大模型架构

-**深入浅出的讲解**：将复杂的技术概念以直观、易懂的方式呈现

-**响应式设计**：在各种设备上（手机、平板、桌面）提供优秀的浏览体验

-**深色/浅色模式**：支持自动跟随系统设置的外观模式切换

## 技术栈

- HTML5
- TailwindCSS 3.0+
- JavaScript
- Font Awesome图标库

## 项目结构

```
├── index.html # 主页面，展示所有模型架构
├── models/ # 各个模型的详细页面
│ ├── rope/ # 旋转位置编码(RoPE)可视化
│ │ └── index.html # RoPE可视化详细页面
│ └── ... # 其他模型子页面
└── README.md # 项目说明文档
```

## 已实现的内容

- [X] 主页设计与实现
- [X] 响应式布局适配
- [X] 深色/浅色模式切换
- [ ] LLaMA3架构解析
  - [X] 旋转位置编码(RoPE)可视化
- [ ] Transformer架构详解
- [ ] GPT系列模型解析
- [ ] Deepseek模型分析
- [ ] 更多模型架构...

## 如何使用

1. 克隆本仓库到本地
2. 直接在浏览器中打开 `index.html`文件
3. 点击各模型卡片，探索相应的架构详情

## 贡献指南

欢迎对本项目做出贡献！无论是添加新的模型解析、改进现有可视化，还是修复错误，都请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参见LICENSE文件

## 联系方式

如有任何问题或建议，请通过以下方式联系：

- 项目Issues页面
- 电子邮件：[example@example.com](mailto:example@example.com)

---

© 2024 大模型架构可视化平台 | 使用HTML5 + TailwindCSS构建
