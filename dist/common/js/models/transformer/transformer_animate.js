document.addEventListener("DOMContentLoaded", function () {
  // 组件详细描述信息
  const componentDescriptions = {
    "input-embedding":
      "输入嵌入层将输入序列中的每个标记转换为高维向量表示。这是将文本转换为模型可处理的数值形式的第一步。",
    "output-embedding":
      "输出嵌入层与输入嵌入类似，但用于目标序列。在训练过程中，它将目标序列中的标记转换为向量表示。",
    "input-pos-enc":
      "位置编码将序列中每个标记的位置信息注入到嵌入中，因为自注意力机制本身不包含位置信息。",
    "output-pos-enc": "解码器侧的位置编码，同样为输出序列提供位置信息。",
    "input-residual":
      "残差连接将位置编码与原始嵌入相加，有助于信息在深层网络中的传播，防止梯度消失问题。",
    "output-residual": "解码器侧的残差连接，将位置编码与输出嵌入相结合。",
    "encoder-module":
      "编码器将输入序列转换为连续表示（编码）。该表示会被传递给解码器以生成输出序列。Transformer通常有多个编码器层（Nx）堆叠在一起。",
    "encoder-mha":
      '多头注意力机制允许模型关注输入序列的不同部分，提取复杂的特征关系。"多头"指的是并行运行多个注意力计算，每个关注不同的表示空间。',
    "encoder-add-norm2":
      "残差连接加上层归一化。残差连接将多头注意力的输出与来自输入的直接连接相加，帮助信息流动和梯度传递。层归一化稳定深度网络的训练。",
    "encoder-ff":
      "前馈神经网络对每个位置独立应用相同的变换，通常包含两个线性变换和一个ReLU激活函数，用于增强模型的表达能力。",
    "encoder-add-norm1":
      "另一个残差连接和层归一化组合，将前馈网络的输出与其输入相加，防止梯度消失并加速训练。",
    "decoder-module":
      "解码器根据编码器的输出和自己已生成的输出来生成序列。解码器同样是堆叠的形式，有多个解码器层。",
    "decoder-masked-mha":
      "带掩码的多头注意力确保预测只依赖于已生成的输出，通过掩盖未来位置来实现自回归生成。",
    "decoder-add-norm3":
      "残差连接和层归一化组合，应用于掩码多头注意力层之后。残差连接将原始输入与注意力输出相结合。",
    "decoder-mha":
      "这一多头注意力层关注编码器的输出，允许解码器访问输入序列信息，实现输入序列到输出序列的条件生成。",
    "decoder-add-norm2":
      "残差连接和层归一化，应用于解码器的第二个多头注意力层之后。残差连接将前一层输出与注意力输出相结合。",
    "decoder-ff":
      "与编码器中的前馈网络类似，但应用于解码器中。处理包含了输入信息的上下文向量。",
    "decoder-add-norm1":
      "解码器中的最后一个残差连接和层归一化组合。将前馈网络的输出与前一步的输出相加。",
    linear:
      "线性变换层将解码器的输出映射到词汇表大小的向量，每个元素代表对应词的分数。",
    softmax:
      "Softmax将线性层的分数转换为概率分布，确定最可能的下一个标记。最高概率的标记通常被选为输出。",
    "output-module":
      "输出模块将解码器的表示转换为最终预测。每个时间步，它预测序列中的下一个标记。",
  };

  // 残差连接描述
  const residualDescriptions = {
    "encoder-residual-1":
      "编码器中的第一个残差连接允许原始输入信息直接跳过多头注意力层，与注意力层的输出相加。这帮助模型保留原始信息，同时整合上下文感知的信息。",
    "encoder-residual-2":
      "编码器中的第二个残差连接允许多头注意力处理后的信息直接跳过前馈网络，与前馈网络的输出相加。这为网络提供了多个信息路径，有助于训练更深的模型。",
    "decoder-residual-1":
      "解码器中的第一个残差连接允许原始输入信息直接跳过掩码自注意力层，与注意力输出相加。这保留了原始序列信息。",
    "decoder-residual-2":
      '解码器中的第二个残差连接允许第一层注意力输出直接跳过编码器-解码器注意力层，与该层输出相加。这确保解码器不会"忘记"自己的状态。',
    "decoder-residual-3":
      "解码器中的第三个残差连接允许编码器-解码器注意力输出直接跳过前馈网络，与前馈网络输出相加。这保持了信息流，并帮助训练深层网络。",
  };

  // 动画控制变量
  let isAnimating = false;
  let isPaused = false;
  let animationTimeout = null;
  let particles = [];
  let currentStep = 0;
  let showDetails = false;
  let activePathElements = [];
  let speedFactor = 1.0;

  // 获取DOM元素
  const startButton = document.getElementById("start-animation");
  const resetButton = document.getElementById("reset-animation");
  const pauseResumeButton = document.getElementById("pause-resume");
  const stepForwardButton = document.getElementById("step-forward");
  const stepBackwardButton = document.getElementById("step-backward");
  const showDetailsCheckbox = document.getElementById("show-details");
  const speedSlider = document.getElementById("animation-speed");
  const speedValue = document.getElementById("speed-value");
  const flowDetails = document.getElementById("flow-details");
  const svgContainer = document.getElementById("transformer-svg");
  const dataFlowContainer = document.getElementById("data-flow-container");
  const attentionVisualization = document.getElementById(
    "attention-visualization"
  );
  const attentionHeatmap = document.getElementById("attention-heatmap");
  const annotation = document.getElementById("annotation");
  const stepIndicator = document.getElementById("step-indicator");

  // 获取SVG的视口变换信息
  const svgPoint = svgContainer.createSVGPoint();

  // 动画步骤和描述 - 改进路径定义，确保准确匹配SVG中的线条，增加残差连接
  const animationSteps = [
    {
      name: "input-embedding",
      description:
        "步骤1：文本输入首先被转换成标记（tokens），然后通过输入嵌入层转换为向量表示。",
      path: [
        { x: 217, y: 675 }, // 输入起点
        { x: 217, y: 620 }, // 输入嵌入
      ],
      highlights: ["line-in-to-emb", "input-embedding"],
      particleType: "input",
      duration: 1000,
    },
    {
      name: "input-residual",
      description: "步骤2：向量表示与位置编码相结合，注入序列位置信息。",
      path: [
        [
          { x: 217, y: 620 }, // 输入嵌入
          { x: 217, y: 580 }, // 向上到残差连接
          { x: 217, y: 570 },
        ], // 残差连接中心

        // 位置编码路径
        [
          { x: 180, y: 570 }, // 位置编码
          { x: 195, y: 570 }, // 中间点
          { x: 217, y: 570 },
        ], // 残差连接中心
      ],
      highlights: [
        "line-emb-to-res",
        "input-pos-enc",
        "line-pe-to-res",
        "input-residual",
      ],
      particleType: "input",
      residualEffect: {
        center: { x: 217, y: 570 },
        radius: 15,
      },
      duration: 1500,
    },
    {
      name: "encoder-mha",
      description:
        "步骤3：编码器的多头自注意力层处理输入。每个标记可以关注序列中的所有标记，捕获相互关系。",
      path: [
        // 中间路径
        [
          { x: 217, y: 570 }, // 残差连接中心
          { x: 217, y: 520 }, // 向上到分支点
          { x: 217, y: 495 }, // 继续向上到编码器
          { x: 217, y: 475 },
        ], // 多头注意力

        // 左侧支路
        [
          { x: 217, y: 570 }, // 残差连接中心
          { x: 180, y: 520 }, // 左侧分支点
          { x: 180, y: 495 }, // 继续向上到编码器
          { x: 200, y: 475 },
        ], // 多头注意力左侧

        // 右侧支路
        [
          { x: 217, y: 570 }, // 残差连接中心
          { x: 254, y: 520 }, // 右侧分支点
          { x: 254, y: 495 }, // 继续向上到编码器
          { x: 234, y: 475 },
        ], // 多头注意力右侧
      ],
      highlights: [
        "line-res-to-enc",
        "line-left-res-to-enc",
        "line-left-h-res",
        "line-right-res-to-enc",
        "line-right-h-res",
        "encoder-mha",
      ],
      particleType: "encoder",
      duration: 1500,
      showAttention: true,
    },
    {
      name: "encoder-add-norm2",
      description:
        "步骤4：自注意力的输出通过残差连接和层归一化，稳定信号并帮助训练。",
      path: [
        // 注意力输出路径
        [
          { x: 217, y: 475 }, // 多头注意力
          { x: 217, y: 445 }, // 向上到Add & Norm 2
          { x: 217, y: 430 },
        ], // Add & Norm 2

        // 残差连接路径（原始输入绕过注意力层）
        [
          { x: 217, y: 520 }, // 分支点
          { x: 110, y: 520 }, // 向左
          { x: 110, y: 430 }, // 向上到Add & Norm 2
          { x: 130, y: 430 },
        ], // Add & Norm 2入口
      ],
      highlights: [
        "line-mha-to-addnorm2",
        "line-add-norm2-h",
        "line-add-norm2-v",
        "line-add-norm2-entry",
        "encoder-add-norm2",
      ],
      particleType: "encoder",
      residualEffect: {
        target: "encoder-residual-1",
        duration: 1500,
      },
      duration: 1500,
    },
    {
      name: "encoder-ff",
      description:
        "步骤5：前馈神经网络独立处理每个位置的表示，增强模型的表达能力。",
      path: [
        { x: 217, y: 430 }, // Add & Norm 2
        { x: 217, y: 385 }, // 向上到前馈
        { x: 217, y: 372 }, // 前馈网络
      ],
      highlights: ["line-addnorm2-to-ff", "encoder-ff"],
      particleType: "encoder",
      duration: 1000,
    },
    {
      name: "encoder-add-norm1",
      description:
        "步骤6：另一层残差连接和层归一化处理前馈网络的输出，完成一个编码器层。实际应用中可能有多个这样的层堆叠。",
      path: [
        // 前馈网络输出路径
        [
          { x: 217, y: 372 }, // 前馈网络
          { x: 217, y: 350 }, // 向上到Add & Norm 1
          { x: 217, y: 335 },
        ], // Add & Norm 1

        // 残差连接路径（绕过前馈网络）
        [
          { x: 217, y: 430 }, // Add & Norm 2
          { x: 110, y: 405 }, // 通过水平和垂直线
          { x: 110, y: 335 }, // 向上到Add & Norm 1
          { x: 130, y: 335 },
        ], // Add & Norm 1入口
      ],
      highlights: [
        "line-ff-to-addnorm1",
        "line-addnorm2-to-addnorm1-h",
        "line-addnorm2-to-addnorm1-v",
        "line-addnorm2-to-addnorm1-entry",
        "encoder-add-norm1",
      ],
      particleType: "encoder",
      residualEffect: {
        target: "encoder-residual-2",
        duration: 1500,
      },
      duration: 1500,
    },
    {
      name: "output-embedding",
      description:
        "步骤7：同时，目标序列（右移一位）也经过相似的嵌入和位置编码处理，作为解码器的输入。",
      path: [
        { x: 475, y: 675 }, // 输出起点
        { x: 475, y: 620 }, // 输出嵌入
      ],
      highlights: ["line-out-to-emb", "output-embedding"],
      particleType: "decoder",
      duration: 1000,
    },
    {
      name: "output-residual",
      description: "步骤8：与输入端类似，解码器输入也添加位置编码。",
      path: [
        // 输出嵌入路径
        [
          { x: 475, y: 620 }, // 输出嵌入
          { x: 475, y: 580 }, // 向上到残差连接
          { x: 475, y: 570 },
        ], // 残差连接中心

        // 位置编码路径
        [
          { x: 520, y: 570 }, // 位置编码
          { x: 506, y: 570 }, // 中间点
          { x: 475, y: 570 },
        ], // 残差连接中心
      ],
      highlights: [
        "line-emb-to-res-dec",
        "output-pos-enc",
        "line-pe-to-res-dec",
        "output-residual",
      ],
      particleType: "decoder",
      residualEffect: {
        center: { x: 475, y: 570 },
        radius: 15,
      },
      duration: 1500,
    },
    {
      name: "decoder-masked-mha",
      description:
        "步骤9：解码器的掩码多头注意力处理目标序列，但使用掩码确保每个位置只能关注到自己及之前的位置，防止信息泄露。",
      path: [
        // 中间路径
        [
          { x: 475, y: 570 }, // 残差连接中心
          { x: 475, y: 510 }, // 向上到分支点
          { x: 475, y: 495 }, // 继续向上到解码器
          { x: 475, y: 475 },
        ], // 掩码多头注意力中心

        // 左侧支路
        [
          { x: 475, y: 570 }, // 残差连接中心
          { x: 440, y: 510 }, // 左侧分支点
          { x: 440, y: 495 }, // 继续向上到解码器
          { x: 455, y: 475 },
        ], // 掩码多头注意力左侧

        // 右侧支路
        [
          { x: 475, y: 570 }, // 残差连接中心
          { x: 510, y: 510 }, // 右侧分支点
          { x: 510, y: 495 }, // 继续向上到解码器
          { x: 495, y: 475 },
        ], // 掩码多头注意力右侧
      ],
      highlights: [
        "line-res-to-dec",
        "line-left-dec-h",
        "line-left-dec-v",
        "line-right-dec-h",
        "line-right-dec-v",
        "decoder-masked-mha",
      ],
      particleType: "decoder",
      duration: 1500,
      showAttention: true,
    },
    {
      name: "decoder-add-norm3",
      description: "步骤10：掩码自注意力的输出通过残差连接和层归一化处理。",
      path: [
        // 掩码注意力输出路径
        [
          { x: 475, y: 475 }, // 掩码多头注意力
          { x: 475, y: 445 }, // 向上到Add & Norm 3
          { x: 475, y: 430 },
        ], // Add & Norm 3

        // 残差连接路径（原始输入绕过掩码注意力）
        [
          { x: 475, y: 510 }, // 分支点
          { x: 595, y: 525 }, // 向右上
          { x: 595, y: 430 }, // 向上到Add & Norm 3
          { x: 570, y: 430 },
        ], // Add & Norm 3入口
      ],
      highlights: [
        "line-masked-to-addnorm3",
        "line-res-to-addnorm3-h",
        "line-res-to-addnorm3-v",
        "line-res-to-addnorm3-entry",
        "decoder-add-norm3",
      ],
      particleType: "decoder",
      residualEffect: {
        target: "decoder-residual-1",
        duration: 1500,
      },
      duration: 1500,
    },
    {
      name: "decoder-mha",
      description:
        "步骤11：第二个多头注意力层接收来自编码器的输出，允许解码器关注输入序列中的相关部分。这是输入和输出序列之间的桥梁。",
      path: [
        // 从编码器输出到解码器的路径
        [
          { x: 217, y: 320 }, // 编码器输出
          { x: 217, y: 305 }, // 向上
          { x: 340, y: 305 }, // 右转
          { x: 340, y: 395 }, // 向下
          { x: 435, y: 395 }, // 右转到解码器
          { x: 435, y: 380 },
        ], // 到多头注意力

        // 从Add & Norm 3到多头注意力的路径 - 直接路径
        [
          { x: 475, y: 430 }, // Add & Norm 3
          { x: 475, y: 400 }, // 向上
          { x: 475, y: 380 },
        ], // 到多头注意力中心

        // 从Add & Norm 3到多头注意力的路径 - 绕行路径
        [
          { x: 475, y: 430 }, // Add & Norm 3
          { x: 475, y: 400 }, // 向上
          { x: 510, y: 400 }, // 右转
          { x: 510, y: 380 },
        ], // 到多头注意力右侧
      ],
      highlights: [
        "line-enc-out-v",
        "line-enc-to-dec-h",
        "line-enc-to-dec-v",
        "line-enc-to-dec-entry-h",
        "line-enc-to-dec-entry-v",
        "line-addnorm3-to-mha-direct",
        "line-addnorm3-to-mha-h",
        "line-addnorm3-to-mha-entry",
        "decoder-mha",
      ],
      particleType: ["encoder", "decoder", "decoder"],
      duration: 2000,
      showEncDecAttention: true,
    },
    {
      name: "decoder-add-norm2",
      description: "步骤12：交叉注意力的输出通过残差连接和层归一化处理。",
      path: [
        // 交叉注意力输出路径
        [
          { x: 475, y: 365 }, // 多头注意力
          { x: 475, y: 340 }, // 向上到Add & Norm 2
          { x: 475, y: 330 },
        ], // Add & Norm 2

        // 残差连接路径（Add & Norm 3输出绕过交叉注意力）
        [
          { x: 475, y: 430 }, // Add & Norm 3
          { x: 595, y: 405 }, // 向右
          { x: 595, y: 325 }, // 向上到Add & Norm 2
          { x: 570, y: 325 },
        ], // Add & Norm 2入口
      ],
      highlights: [
        "line-mha-to-addnorm2-dec",
        "line-addnorm3-to-addnorm2-h",
        "line-addnorm3-to-addnorm2-v",
        "line-addnorm3-to-addnorm2-entry",
        "decoder-add-norm2",
      ],
      particleType: "decoder",
      residualEffect: {
        target: "decoder-residual-2",
        duration: 1500,
      },
      duration: 1500,
    },
    {
      name: "decoder-ff",
      description:
        "步骤13：解码器的前馈神经网络处理交叉注意力的输出，增强表达能力。",
      path: [
        { x: 475, y: 330 }, // Add & Norm 2
        { x: 475, y: 285 }, // 向上到前馈
        { x: 475, y: 272 }, // 前馈网络
      ],
      highlights: ["line-addnorm2-to-ff-dec", "decoder-ff"],
      particleType: "decoder",
      duration: 1000,
    },
    {
      name: "decoder-add-norm1",
      description:
        "步骤14：前馈网络的输出经过最后一个残差连接和层归一化，完成一个解码器层。实际应用中可能有多个这样的层堆叠。",
      path: [
        // 前馈网络输出路径
        [
          { x: 475, y: 272 }, // 前馈网络
          { x: 475, y: 250 }, // 向上到Add & Norm 1
          { x: 475, y: 235 },
        ], // Add & Norm 1

        // 残差连接路径（绕过前馈网络）
        [
          { x: 475, y: 330 }, // Add & Norm 2
          { x: 595, y: 300 }, // 通过水平和垂直线
          { x: 595, y: 235 }, // 向上到Add & Norm 1
          { x: 570, y: 235 },
        ], // Add & Norm 1入口
      ],
      highlights: [
        "line-ff-to-addnorm1-dec",
        "line-addnorm2-to-addnorm1-h-dec",
        "line-addnorm2-to-addnorm1-v-dec",
        "line-addnorm2-to-addnorm1-entry-dec",
        "decoder-add-norm1",
      ],
      particleType: "decoder",
      residualEffect: {
        target: "decoder-residual-3",
        duration: 1500,
      },
      duration: 1500,
    },
    {
      name: "linear",
      description:
        "步骤15：线性层将解码器的输出映射到词汇表大小，每个词的得分表示该词是下一个标记的可能性。",
      path: [
        { x: 475, y: 220 }, // 解码器输出
        { x: 475, y: 135 }, // 向上到线性层
        { x: 475, y: 122 }, // 线性层
      ],
      highlights: ["line-dec-to-linear", "linear"],
      particleType: "output",
      duration: 1000,
    },
    {
      name: "softmax",
      description:
        "步骤16：Softmax函数将线性层的得分转换为概率分布，通常选择概率最高的词作为输出。",
      path: [
        { x: 475, y: 122 }, // 线性层
        { x: 475, y: 90 }, // 向上到Softmax
        { x: 475, y: 77 }, // Softmax
      ],
      highlights: ["line-linear-to-softmax", "softmax"],
      particleType: "output",
      duration: 1000,
    },
    {
      name: "output-module",
      description:
        "步骤17：输出模块生成最终预测。在推理过程中，该预测会被输入回解码器来生成下一个标记，直到生成结束标记或达到最大长度。",
      path: [
        { x: 475, y: 77 }, // Softmax
        { x: 475, y: 45 }, // 向上到输出
        { x: 500, y: 40 }, // 输出
      ],
      highlights: ["line-softmax-to-output", "output-module"],
      particleType: "output",
      duration: 1000,
      isFinal: true,
    },
  ];

  // 初始化函数
  function init() {
    // 为所有组件添加鼠标悬停事件
    document.querySelectorAll(".component").forEach((component) => {
      component.addEventListener("mouseenter", showComponentDetails);
      component.addEventListener("mouseleave", hideComponentDetails);
    });

    // 按钮事件监听
    startButton.addEventListener("click", startAnimation);
    resetButton.addEventListener("click", resetAnimation);
    pauseResumeButton.addEventListener("click", togglePauseResume);
    stepForwardButton.addEventListener("click", stepForward);
    stepBackwardButton.addEventListener("click", stepBackward);
    showDetailsCheckbox.addEventListener("change", toggleDetails);

    // 速度滑块事件监听
    speedSlider.addEventListener("input", function () {
      speedFactor = parseFloat(this.value);
      speedValue.textContent = `${speedFactor.toFixed(1)}x`;
    });

    // 初始化注意力热图
    initializeAttentionHeatmap();
  }

  // 将SVG坐标转换为DOM坐标
  function svgToScreenCoords(x, y) {
    svgPoint.x = x;
    svgPoint.y = y;
    const screenPoint = svgPoint.matrixTransform(svgContainer.getScreenCTM());

    // 获取SVG容器的位置
    const containerRect = dataFlowContainer.getBoundingClientRect();

    return {
      x: screenPoint.x - containerRect.left,
      y: screenPoint.y - containerRect.top,
    };
  }

  // 显示组件详细信息
  function showComponentDetails(e) {
    if (!isAnimating || isPaused) {
      const componentId = e.currentTarget.id;

      // 首先检查是否是残差连接描述
      let description =
        residualDescriptions[componentId] || componentDescriptions[componentId];

      if (description) {
        const componentRect = e.currentTarget.getBoundingClientRect();
        const containerRect = dataFlowContainer.getBoundingClientRect();

        // 计算注释框的位置
        let x =
          componentRect.left + componentRect.width / 2 - containerRect.left;
        let y = componentRect.top - containerRect.top;

        // 调整位置避免超出边界
        annotation.textContent = description;
        annotation.style.left = `${x}px`;
        annotation.style.top = `${y - 10}px`;
        annotation.style.transform = "translate(-50%, -100%)";
        annotation.style.opacity = "1";
      }
    }
  }

  // 隐藏组件详细信息
  function hideComponentDetails() {
    if (!isAnimating || isPaused) {
      annotation.style.opacity = "0";
    }
  }

  // 开始动画
  function startAnimation() {
    if (isAnimating) return;

    isAnimating = true;
    isPaused = false;
    currentStep = 0;

    // 显示控制按钮
    pauseResumeButton.classList.remove("hidden");
    stepForwardButton.classList.remove("hidden");
    stepBackwardButton.classList.remove("hidden");

    // 清空流程描述
    flowDetails.innerHTML = "";

    // 显示步骤指示器
    stepIndicator.textContent = `步骤 ${currentStep + 1}/${
      animationSteps.length
    }`;
    stepIndicator.classList.remove("hidden");

    // 显示第一步的描述
    updateDescription(currentStep);

    // 启动动画序列
    animateNextStep();
  }

  // 暂停/恢复动画
  function togglePauseResume() {
    if (!isAnimating) return;

    isPaused = !isPaused;

    if (isPaused) {
      // 暂停：清除定时器
      clearTimeout(animationTimeout);
      pauseResumeButton.innerHTML = '<i class="fas fa-play mr-2"></i>继续';
    } else {
      // 恢复：准备下一步
      pauseResumeButton.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';
      prepareNextStep();
    }
  }

  // 单步前进
  function stepForward() {
    if (!isAnimating) return;

    // 如果是最后一步，重置
    if (currentStep >= animationSteps.length - 1) {
      return;
    }

    // 清除当前可能正在进行的动画
    clearTimeout(animationTimeout);

    // 如果不是暂停状态，先暂停
    if (!isPaused) {
      isPaused = true;
      pauseResumeButton.innerHTML = '<i class="fas fa-play mr-2"></i>继续';
    }

    // 移除当前组件的高亮
    const currentStepData = animationSteps[currentStep];
    const currentComponentEl = document.getElementById(currentStepData.name);
    if (currentComponentEl) {
      currentComponentEl.classList.remove("component-highlight");
    }

    // 清除当前粒子
    particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    particles = [];

    // 前进到下一步
    currentStep++;

    // 更新描述和步骤指示器
    updateDescription(currentStep);

    // 立即显示下一步的内容
    animateStepImmediately(currentStep);
  }

  // 单步后退
  function stepBackward() {
    if (!isAnimating || currentStep <= 0) return;

    // 清除当前可能正在进行的动画
    clearTimeout(animationTimeout);

    // 如果不是暂停状态，先暂停
    if (!isPaused) {
      isPaused = true;
      pauseResumeButton.innerHTML = '<i class="fas fa-play mr-2"></i>继续';
    }

    // 移除当前组件的高亮
    const currentStepData = animationSteps[currentStep];
    const currentComponentEl = document.getElementById(currentStepData.name);
    if (currentComponentEl) {
      currentComponentEl.classList.remove("component-highlight");
    }

    // 清除当前粒子
    particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    particles = [];

    // 后退到上一步
    currentStep--;

    // 更新描述和步骤指示器
    updateDescription(currentStep);

    // 立即显示上一步的内容
    animateStepImmediately(currentStep);
  }

  // 立即显示特定步骤状态（不使用动画）
  function animateStepImmediately(stepIndex) {
    const step = animationSteps[stepIndex];

    // 高亮当前组件
    const componentEl = document.getElementById(step.name);
    if (componentEl) {
      componentEl.classList.add("component-highlight");
    }

    // 确定粒子类型
    let particleType = step.particleType || "default";

    // 高亮路径
    if (step.highlights && step.highlights.length > 0) {
      highlightPathElements(
        step.highlights,
        Array.isArray(particleType) ? particleType[0] : particleType
      );
    }

    // 如果是注意力层，显示注意力可视化
    if (step.showAttention || step.showEncDecAttention) {
      attentionVisualization.classList.remove("hidden");
      updateAttentionHeatmap(step.showEncDecAttention);
    } else {
      attentionVisualization.classList.add("hidden");
    }
  }

  // 重置动画
  function resetAnimation() {
    isAnimating = false;
    isPaused = false;
    clearTimeout(animationTimeout);

    // 隐藏控制按钮
    pauseResumeButton.classList.add("hidden");
    stepForwardButton.classList.add("hidden");
    stepBackwardButton.classList.add("hidden");
    pauseResumeButton.innerHTML = '<i class="fas fa-pause mr-2"></i>暂停';

    // 隐藏步骤指示器
    stepIndicator.classList.add("hidden");

    // 清除所有粒子
    particles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    particles = [];

    // 移除所有路径高亮
    activePathElements.forEach((element) => {
      if (element) {
        element.classList.remove("highlight-path");
        element.classList.remove("encoder");
        element.classList.remove("decoder");
        element.classList.remove("input");
        element.classList.remove("output");
      }
    });
    activePathElements = [];

    // 重置残差效果
    document.querySelectorAll(".residual-circle").forEach((circle) => {
      circle.setAttribute("r", "0");
      circle.style.opacity = "0";
    });

    // 重置高亮
    document.querySelectorAll(".component-highlight").forEach((el) => {
      el.classList.remove("component-highlight");
    });

    // 隐藏注意力可视化
    attentionVisualization.classList.add("hidden");

    // 重置描述
    flowDetails.innerHTML =
      '<p class="leading-relaxed mb-2">点击"启动数据流"按钮来观察数据在Transformer模型中的流转过程。</p>';
  }

  // 切换详细说明
  function toggleDetails() {
    showDetails = showDetailsCheckbox.checked;

    if (isAnimating && currentStep < animationSteps.length) {
      updateDescription(currentStep);
    }
  }

  // 更新描述文本
  function updateDescription(stepIndex) {
    const step = animationSteps[stepIndex];

    // 更新文本描述
    if (showDetails && componentDescriptions[step.name]) {
      flowDetails.innerHTML = `
                <p class="leading-relaxed mb-2">${step.description}</p>
                <p class="leading-relaxed mb-2">${
                  componentDescriptions[step.name]
                }</p>
            `;
    } else {
      flowDetails.innerHTML = `<p class="leading-relaxed mb-2">${step.description}</p>`;
    }

    // 更新步骤指示器
    stepIndicator.textContent = `步骤 ${stepIndex + 1}/${
      animationSteps.length
    }`;
  }

  // 高亮路径元素
  function highlightPathElements(elementIds, particleType) {
    // 清除之前的高亮
    activePathElements.forEach((element) => {
      if (element) {
        element.classList.remove("highlight-path");
        element.classList.remove("encoder");
        element.classList.remove("decoder");
        element.classList.remove("input");
        element.classList.remove("output");
      }
    });
    activePathElements = [];

    // 添加新的高亮
    elementIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element && element.tagName === "line") {
        element.classList.add("highlight-path");

        // 根据粒子类型设置高亮颜色
        if (particleType === "encoder") {
          element.classList.add("encoder");
        } else if (particleType === "decoder") {
          element.classList.add("decoder");
        } else if (particleType === "input") {
          element.classList.add("input");
        } else if (particleType === "output") {
          element.classList.add("output");
        }

        activePathElements.push(element);
      }
    });
  }

  // 创建残差效果
  function createResidualEffect(options) {
    if (options.center) {
      // 创建径向残差动画（从中心发散的圆圈）
      const pulses = 3;
      for (let i = 0; i < pulses; i++) {
        setTimeout(() => {
          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          circle.setAttribute("cx", options.center.x);
          circle.setAttribute("cy", options.center.y);
          circle.setAttribute("r", "0");
          circle.setAttribute("fill", "none");
          circle.setAttribute("stroke", "rgba(59, 130, 246, 0.7)");
          circle.setAttribute("stroke-width", "2");
          circle.style.opacity = "0";

          svgContainer.appendChild(circle);

          // 动画
          setTimeout(() => {
            circle.style.transition = `all ${
              options.duration || 1000
            }ms ease-out`;
            circle.style.opacity = "0.7";
            circle.setAttribute("r", options.radius || "20");

            setTimeout(() => {
              circle.style.opacity = "0";
              setTimeout(() => {
                if (circle.parentNode) {
                  circle.parentNode.removeChild(circle);
                }
              }, 500);
            }, options.duration || 1000);
          }, 50);
        }, i * 300);
      }
    } else if (options.target) {
      // 激活预定义的残差连接
      const residualCircle = document.getElementById(options.target);
      if (residualCircle) {
        // 显示残差连接的注释
        if (residualDescriptions[options.target]) {
          const circleEl = residualCircle;
          const cx = parseFloat(circleEl.getAttribute("cx"));
          const cy = parseFloat(circleEl.getAttribute("cy"));

          // 转换坐标
          const screenCoords = svgToScreenCoords(cx, cy);

          annotation.textContent = residualDescriptions[options.target];
          annotation.style.left = `${screenCoords.x}px`;
          annotation.style.top = `${screenCoords.y - 10}px`;
          annotation.style.transform = "translate(-50%, -100%)";
          annotation.style.opacity = "1";

          setTimeout(() => {
            // 等动画进行一半再隐藏
            annotation.style.opacity = "0";
          }, options.duration / 2);
        }

        // 设置动画持续时间
        residualCircle.style.animation = `residual-pulse ${
          options.duration / 1000
        }s ease-in-out 2`;

        // 触发动画
        residualCircle.style.opacity = "1";
        residualCircle.setAttribute("r", "20");

        // 动画结束后重置
        setTimeout(() => {
          residualCircle.style.opacity = "0";
          residualCircle.setAttribute("r", "0");
        }, options.duration);
      }
    }
  }

  // 动画下一步
  function animateNextStep() {
    if (currentStep >= animationSteps.length || !isAnimating || isPaused) {
      if (currentStep >= animationSteps.length) {
        isAnimating = false;
        pauseResumeButton.classList.add("hidden");
        stepForwardButton.classList.add("hidden");
      }
      return;
    }

    const step = animationSteps[currentStep];

    // 高亮当前组件
    const componentEl = document.getElementById(step.name);
    if (componentEl) {
      componentEl.classList.add("component-highlight");
    }

    // 确定粒子类型
    let particleType = step.particleType || "default";

    // 高亮路径
    if (step.highlights && step.highlights.length > 0) {
      highlightPathElements(
        step.highlights,
        Array.isArray(particleType) ? particleType[0] : particleType
      );
    }

    // 创建和移动数据粒子
    if (Array.isArray(step.path[0])) {
      // 多路径情况
      if (Array.isArray(particleType)) {
        // 如果粒子类型是数组，为每条路径分配对应类型
        step.path.forEach((singlePath, pathIndex) => {
          const type =
            pathIndex < particleType.length
              ? particleType[pathIndex]
              : particleType[0];
          animateParticleAlongPath(
            singlePath,
            step.duration,
            pathIndex === step.path.length - 1,
            type
          );
        });
      } else {
        // 否则所有路径使用同一种类型
        step.path.forEach((singlePath, pathIndex) => {
          animateParticleAlongPath(
            singlePath,
            step.duration,
            pathIndex === step.path.length - 1,
            particleType
          );
        });
      }
    } else {
      // 单路径情况
      animateParticleAlongPath(step.path, step.duration, true, particleType);
    }

    // 如果有残差连接效果
    if (step.residualEffect) {
      setTimeout(() => {
        createResidualEffect(step.residualEffect);
      }, step.duration / 3); // 在粒子移动三分之一处触发残差效果
    }

    // 如果是注意力层，显示注意力可视化
    if (step.showAttention || step.showEncDecAttention) {
      setTimeout(() => {
        attentionVisualization.classList.remove("hidden");
        updateAttentionHeatmap(step.showEncDecAttention);
      }, step.duration / 2); // 在粒子移动途中显示
    } else {
      attentionVisualization.classList.add("hidden");
    }
  }

  // 沿着路径移动粒子
  function animateParticleAlongPath(path, duration, isLastPath, particleType) {
    // 调整持续时间
    const adjustedDuration = duration / speedFactor;

    // 创建数据粒子
    const particle = document.createElement("div");
    particle.className = `data-particle ${particleType}`;

    // 设置粒子初始位置（转换SVG坐标到屏幕坐标）
    const startCoords = svgToScreenCoords(path[0].x, path[0].y);
    particle.style.left = `${startCoords.x}px`;
    particle.style.top = `${startCoords.y}px`;

    dataFlowContainer.appendChild(particle);
    particles.push(particle);

    // 粒子初始状态
    setTimeout(() => {
      particle.classList.add("active");

      // 计算每段路径的时间，总时间为duration
      const segmentDuration = adjustedDuration / (path.length - 1);

      // 逐段移动粒子
      let currentSegment = 0;

      function moveToNextSegment() {
        if (currentSegment < path.length - 1) {
          const nextCoords = svgToScreenCoords(
            path[currentSegment + 1].x,
            path[currentSegment + 1].y
          );

          // 设置粒子过渡动画
          particle.style.transition = `all ${
            segmentDuration / 1000
          }s ease-in-out`;
          particle.style.left = `${nextCoords.x}px`;
          particle.style.top = `${nextCoords.y}px`;

          currentSegment++;

          // 继续移动到下一段
          if (currentSegment < path.length - 1) {
            animationTimeout = setTimeout(moveToNextSegment, segmentDuration);
          } else if (isLastPath) {
            // 如果是最后一段，准备下一个步骤
            animationTimeout = setTimeout(() => {
              prepareNextStep();
            }, segmentDuration);
          }
        }
      }

      // 开始移动
      moveToNextSegment();
    }, 100);
  }

  // 准备下一个步骤
  function prepareNextStep() {
    if (!isAnimating) return;

    // 如果已暂停，就不自动前进到下一步
    if (isPaused) return;

    const step = animationSteps[currentStep];

    // 如果不是最后一步，移除当前组件的高亮
    if (!step.isFinal) {
      const componentEl = document.getElementById(step.name);
      if (componentEl) {
        componentEl.classList.remove("component-highlight");
      }
    }

    currentStep++;

    // 如果还有下一步，更新描述并继续
    if (currentStep < animationSteps.length) {
      updateDescription(currentStep);
      animateNextStep();
    } else {
      isAnimating = false;
      pauseResumeButton.classList.add("hidden");
      stepForwardButton.classList.add("hidden");
      stepBackwardButton.classList.add("hidden"); // 隐藏上一步按钮
      flowDetails.innerHTML +=
        '<p class="leading-relaxed mt-4 font-medium">动画完成！现在你可以看到Transformer模型如何处理数据从输入到输出的整个流程，包括关键的残差连接。</p>';
    }
  }

  // 初始化注意力热图
  function initializeAttentionHeatmap() {
    const heatmapContainer = document.getElementById("attention-heatmap");
    if (!heatmapContainer) {
      console.error("注意力热图容器不存在");
      return;
    }

    heatmapContainer.innerHTML = ""; // 清空容器

    // 创建注意力矩阵
    const matrix = document.createElement("div");
    matrix.className = "attention-matrix";

    // 创建6x6的热图单元格
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const cell = document.createElement("div");
        cell.className = "attention-cell";
        // 显示注意力值
        cell.setAttribute("data-row", i);
        cell.setAttribute("data-col", j);
        cell.textContent = "0.0"; // 初始值
        matrix.appendChild(cell);
      }
    }

    heatmapContainer.appendChild(matrix);
  }

  // 更新注意力热图
  function updateAttentionHeatmap(isEncoderDecoderAttention) {
    const cells = document.querySelectorAll(".attention-cell");

    if (cells.length === 0) {
      console.error("找不到注意力单元格，可能是初始化失败");
      // 重新尝试初始化
      initializeAttentionHeatmap();
      setTimeout(() => updateAttentionHeatmap(isEncoderDecoderAttention), 100);
      return;
    }

    // 正确确定当前步骤 - 需要使用正确的索引
    const currentAttentionStep = animationSteps[currentStep].name;

    // 根据当前步骤和注意力类型设置不同的注意力矩阵
    let attentionMatrix;
    let explanationText = "";
    let colorScheme = "rgba(59, 130, 246, {opacity})"; // 默认蓝色
    let attentionType = "";
    let attentionColor = "#3b82f6"; // 默认颜色

    if (isEncoderDecoderAttention) {
      // 编码器-解码器注意力 (交叉注意力)
      attentionMatrix = [
        [0.9, 0.3, 0.6, 0.2, 0.1, 0.1],
        [0.1, 0.8, 0.4, 0.5, 0.2, 0.1],
        [0.2, 0.1, 0.7, 0.3, 0.5, 0.2],
        [0.3, 0.2, 0.3, 0.6, 0.3, 0.6],
        [0.1, 0.3, 0.2, 0.4, 0.7, 0.3],
        [0.1, 0.2, 0.1, 0.3, 0.2, 0.8],
      ];
      colorScheme = "rgba(139, 92, 246, {opacity})"; // 紫色
      attentionType = "编码器-解码器交叉注意力";
      attentionColor = "#8b5cf6"; // 紫色

      explanationText = `
                <p>编码器-解码器注意力是解码器关注编码器输出的机制。这使解码器可以在生成输出时集中于输入序列的相关部分，建立输入和输出间的联系。</p>
                <p class="mt-2">在矩阵中，每行表示解码器的一个位置，每列表示编码器的一个位置。颜色越深表示解码器位置对相应编码器位置的关注度越高。</p>
            `;
    } else if (currentAttentionStep === "encoder-mha") {
      // 编码器的自注意力 (非掩码 - 全局关注)
      attentionMatrix = [
        [0.8, 0.3, 0.4, 0.2, 0.1, 0.2],
        [0.3, 0.7, 0.2, 0.3, 0.1, 0.1],
        [0.2, 0.4, 0.6, 0.3, 0.2, 0.1],
        [0.1, 0.2, 0.3, 0.7, 0.2, 0.3],
        [0.2, 0.1, 0.4, 0.3, 0.8, 0.2],
        [0.3, 0.2, 0.1, 0.2, 0.3, 0.9],
      ];
      colorScheme = "rgba(205, 92, 92, {opacity})"; // 使用编码器的红色
      attentionType = "编码器全局自注意力";
      attentionColor = "#cd5c5c"; // 编码器红色

      explanationText = `
                <p>编码器中的自注意力允许模型查看输入序列中的所有位置，捕获全局依赖关系。</p>
                <p class="mt-2">在矩阵中，行和列都表示输入序列中的位置。每个单元格(i,j)表示位置i对位置j的注意力权重。颜色越深表示关注度越高，对角线上值较高表示词倾向于关注自身。</p>
            `;
    } else if (currentAttentionStep === "decoder-masked-mha") {
      // 解码器的掩码自注意力 (只关注当前及之前的位置)
      // 使用对象数组来处理特殊值和样式
      attentionMatrix = [
        [
          { value: 0.9, display: "0.9" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
        ],
        [
          { value: 0.4, display: "0.4" },
          { value: 0.6, display: "0.6" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
        ],
        [
          { value: 0.2, display: "0.2" },
          { value: 0.3, display: "0.3" },
          { value: 0.5, display: "0.5" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
        ],
        [
          { value: 0.1, display: "0.1" },
          { value: 0.2, display: "0.2" },
          { value: 0.3, display: "0.3" },
          { value: 0.4, display: "0.4" },
          { value: 0, display: "遮罩" },
          { value: 0, display: "遮罩" },
        ],
        [
          { value: 0.1, display: "0.1" },
          { value: 0.1, display: "0.1" },
          { value: 0.1, display: "0.1" },
          { value: 0.2, display: "0.2" },
          { value: 0.5, display: "0.5" },
          { value: 0, display: "遮罩" },
        ],
        [
          { value: 0.1, display: "0.1" },
          { value: 0.1, display: "0.1" },
          { value: 0.1, display: "0.1" },
          { value: 0.1, display: "0.1" },
          { value: 0.2, display: "0.2" },
          { value: 0.4, display: "0.4" },
        ],
      ];
      colorScheme = "rgba(70, 130, 180, {opacity})"; // 使用解码器的蓝色
      attentionType = "解码器掩码自注意力";
      attentionColor = "#4682b4"; // 解码器蓝色

      explanationText = `
                <p>解码器中的掩码自注意力确保每个位置只能关注自身和之前的位置，符合因果关系。上三角形标记为"遮罩"的区域表示未来信息不可见。</p>
                <p class="mt-2">在矩阵中，行和列都表示输出序列中的位置。每个单元格(i,j)表示位置i对位置j的注意力权重，但仅当j≤i时。这种掩码机制使模型在生成序列时只能看到已经生成的部分。</p>
            `;
    } else {
      // 默认情况 - 虽然不应该到达这里
      attentionMatrix = Array(6)
        .fill()
        .map(() => Array(6).fill(0.1));
      attentionType = "未知注意力类型";
    }

    // 添加注意力类型标记到解释文本上方
    const typeLabel = `<div style="margin-bottom: 10px; padding: 4px 8px; background-color: ${attentionColor}; 
                    color: white; border-radius: 4px; display: inline-block; font-weight: 500;">
                    <i class="fas fa-info-circle mr-1"></i>${attentionType}</div>`;

    // 更新解释文本和注意力类型标记
    document.getElementById("attention-explanation").innerHTML =
      typeLabel + explanationText;

    // 清除旧的高亮效果
    cells.forEach((cell) => {
      cell.classList.remove("high-attention");
      // 重置背景色和样式
      cell.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
      cell.style.color = "rgba(0, 0, 0, 0.5)";
      cell.style.fontStyle = "normal";
      cell.textContent = "0.0";
    });

    // 用动画方式更新热图单元格
    let index = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const cell = cells[index];

        // 处理不同类型的注意力矩阵数据
        let cellValue, displayText;
        if (currentAttentionStep === "decoder-masked-mha") {
          // 对于掩码自注意力，使用特殊格式
          cellValue = attentionMatrix[i][j].value;
          displayText = attentionMatrix[i][j].display;
        } else {
          cellValue = attentionMatrix[i][j];
          displayText = cellValue.toFixed(1);
        }

        const delay = 100 + Math.random() * 300; // 更均匀的延迟分布

        setTimeout(() => {
          if (cell) {
            if (displayText === "遮罩") {
              // 特殊样式：遮罩区域
              cell.style.backgroundColor = "#f0f0f0";
              cell.style.color = "#999";
              cell.style.fontStyle = "italic";
              cell.textContent = displayText;
            } else {
              // 正常注意力值
              const color = colorScheme.replace("{opacity}", cellValue);
              cell.style.backgroundColor = color;
              cell.textContent = displayText;

              // 设置文本颜色以确保可读性
              cell.style.color =
                cellValue > 0.4 ? "white" : "rgba(0, 0, 0, 0.7)";
            }

            // 为高权重单元格添加强调动画
            if (cellValue > 0.6) {
              // 延迟添加高亮类，让效果更明显
              setTimeout(() => {
                cell.classList.add("high-attention");
                // 移除高亮后允许悬停效果
                setTimeout(() => {
                  cell.classList.remove("high-attention");
                }, 1000);
              }, 200);
            }
          }
        }, delay);

        index++;
      }
    }
  }
  // 初始化
  init();
});
