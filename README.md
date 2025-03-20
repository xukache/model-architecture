# 大模型架构可视化平台

本项目旨在通过交互式可视化的方式，展示主流大型语言模型的内部架构和核心工作原理，帮助读者直观地理解复杂的模型结构和算法机制。

## 项目特点

- **交互式可视化**：使用动态SVG图表和交互式演示，直观展示大模型内部复杂机制
- **全面的模型覆盖**：包含Transformer、LLaMA、GPT、Deepseek等主流大模型架构
- **深入浅出的讲解**：将复杂的技术概念以直观、易懂的方式呈现
- **响应式设计**：在各种设备上（手机、平板、桌面）提供优秀的浏览体验
- **深色/浅色模式**：支持自动跟随系统设置的外观模式切换，默认启用暗色主题
- **精细化组件解析**：拆解模型关键组件（如RoPE位置编码），单独进行可视化说明

## 技术栈

- HTML5
- TailwindCSS 3.0+（通过CDN引入）
- JavaScript
- Font Awesome图标库
- SVG图形可视化

## 项目结构

```├──
├── index.html # 主页面，展示所有模型架构
├── models/ # 各个模型的详细页面
│ ├── components/ # 通用模型组件
│ │ └── rope/ # 旋转位置编码(RoPE)可视化
│ │ └── index.html # RoPE旋转位置编码作用Q、K矩阵的详细页面
│ ├── llama/ # LLaMA模型架构
│ │ └── index.html # LLaMA模型架构概览页面
│ ├── transformer/ # Transformer模型架构（计划中）
│ ├── gpt/ # GPT系列模型架构（计划中）
│ └── deepseek/ # Deepseek模型架构（计划中）
└── README.md # 项目说明文档
```

## 功能特性

- **统一的设计风格**：所有页面采用Linear App风格的简约现代设计
- **深色/浅色模式切换**：支持一键切换主题，默认使用暗色主题
- **响应式导航**：桌面端和移动端均有优化的导航体验
- **返回顶部功能**：长页面浏览时的便捷导航
- **模块化组织**：将不同模型和技术组件独立展示，便于扩展
- **目录导航系统**：每个模型页面都有相关组件的目录导航，方便查找
- **SVG架构图**：使用可缩放矢量图形展示模型架构，保证在任何设备上的清晰度
- **代码示例对照**：提供实现细节的代码示例，帮助深入理解技术原理

## 已实现的内容

- [X] 主页设计与实现
- [X] 响应式布局适配
- [X] 深色/浅色模式切换
- [X] 返回顶部功能
- [X] LLaMA模型架构解析
  - [X] 整体架构概览（SVG可视化）
  - [X] 自注意力机制讲解
  - [X] 前馈网络实现
  - [X] 组件目录导航
- [X] 模型组件详解
  - [X] 旋转位置编码(RoPE)可视化详解
- [ ] Transformer架构详解
- [ ] GPT系列模型解析
- [ ] Deepseek模型分析

## 架构图特性

- **精确的组件结构**：SVG图形准确展示模型各层次的组成和连接关系
- **清晰的数据流向**：使用带箭头的连接线展示信息在模型中的流动方向
- **特殊组件标注**：如RoPE位置编码、Grouped Multi-Query Attention等创新点都有特别标注
- **分层次的视觉区分**：使用不同颜色和形状区分不同功能的组件
- **残差连接可视化**：清晰展示LLaMA等模型中的残差连接路径

## 开发计划

- [ ] 完成更多模型组件的可视化（如多头注意力、LayerNorm等）
- [ ] 添加更多交互式动画展示模型训练和推理过程
- [ ] 实现模型对比功能，直观展示不同架构的异同
- [ ] 优化移动端体验，提高页面加载性能
- [ ] 增加更多代码示例，配合可视化深入讲解原理

## 如何使用

1. 克隆本仓库到本地
2. 直接在浏览器中打开 `index.html` 文件
3. 点击各模型卡片，探索相应的架构详情
4. 使用右上角的主题切换按钮可以在深色/浅色模式之间切换

## 如何贡献

欢迎对本项目做出贡献！无论是添加新的模型解析、改进现有可视化，还是修复错误，都请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 贡献指南

- 保持与现有设计风格一致
- 确保深色/浅色模式都能正常显示
- 为新添加的模型或组件创建清晰的文档
- 使用TailwindCSS进行样式设计
- 优化SVG和Canvas内容，确保性能良好

## 许可证

本项目采用MIT许可证 - 详情请参见LICENSE文件

## 联系方式

如有任何问题或建议，请通过以下方式联系：

- 项目Issues页面
- 电子邮件：[example@example.com](mailto:example@example.com)

---

© 2024 大模型架构可视化平台 | 使用HTML5 + TailwindCSS构建
