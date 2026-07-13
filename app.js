(() => {
  "use strict";

  const STORAGE_KEY = "starSprout-iPad-production-v1";
  const MAX_BUILD = 60;
  const PARENT_HOLD_MS = 1800;

  const RAINFOREST_MATERIAL_CATEGORIES = {
    river: {
      label: "河流",
      icon: "🌊",
      count: 8,
      names: ["直线河段", "左弯河段", "右弯河段", "S形河段", "浅水河湾", "深水河道", "小瀑布河段", "河口水潭"]
    },
    lily: {
      label: "王莲",
      icon: "🪷",
      count: 6,
      names: ["小王莲", "中型王莲", "巨型王莲", "开花王莲", "双叶王莲", "王莲群"]
    },
    tree: {
      label: "古树",
      icon: "🌳",
      count: 6,
      names: ["板根古树", "参天古树", "空心古树", "双生古树", "藤蔓古树", "守护古树"]
    },
    vine: {
      label: "藤蔓",
      icon: "🌿",
      count: 8,
      names: ["短垂藤", "长垂藤", "弯曲藤蔓", "缠树藤蔓", "双股藤蔓", "开花藤蔓", "幼嫩藤蔓", "古老粗藤"]
    },
    rafflesia: {
      label: "大王花",
      icon: "🌺",
      count: 4,
      names: ["大王花花苞", "初开大王花", "盛开大王花", "大王花群"]
    },
    rain: {
      label: "雨滴",
      icon: "🌧️",
      count: 5,
      names: ["细雨", "中雨", "大雨", "斜雨", "局部雨幕"]
    },
    dew: {
      label: "露水",
      icon: "💧",
      count: 5,
      names: ["单颗露水", "叶尖水滴", "露珠串", "闪光露珠", "大片湿润"]
    },
    piranha: {
      label: "食人鱼",
      icon: "🐟",
      count: 5,
      names: ["单条食人鱼", "双鱼同行", "小鱼群", "中型鱼群", "大鱼群"]
    },
    arapaima: {
      label: "巨骨舌鱼",
      icon: "🐠",
      count: 3,
      names: ["幼年巨骨舌鱼", "成年巨骨舌鱼", "稀有巨型巨骨舌鱼"]
    },
    animal: {
      label: "雨林动物",
      icon: "🐒",
      count: 12,
      names: ["金刚鹦鹉", "猴子", "巨嘴鸟", "树懒", "美洲豹", "红眼树蛙", "蓝色箭毒蛙", "水豚", "蓝闪蝶", "鳄鱼", "蜥蜴", "甲虫"]
    },
    soil: {
      label: "湿润土地",
      icon: "🟫",
      count: 6,
      names: ["湿润泥土", "浅泥地", "深泥地", "苔藓地", "积水泥地", "动物脚印地"]
    },
    plant: {
      label: "雨林植物",
      icon: "🌱",
      count: 12,
      names: ["大型蕨类", "小型蕨类", "芭蕉叶", "棕榈幼苗", "雨林灌木", "苔藓簇", "蘑菇群", "开花植物", "阔叶植物", "幼苗", "水边植物", "混合植物群"]
    }
  };

  const RAINFOREST_ALL_MATERIALS = Object.entries(
    RAINFOREST_MATERIAL_CATEGORIES
  ).flatMap(([category, config]) =>
    config.names.map((name, index) => ({
      id: `${category}-${index + 1}`,
      category,
      name,
      icon: config.icon,
      categoryLabel: config.label
    }))
  );

  const RAINFOREST_BASE_MATERIALS = Object.keys(
    RAINFOREST_MATERIAL_CATEGORIES
  ).map(category => `${category}-1`);

  function validRainforestMaterialIds(values) {
    const validIds = new Set(
      RAINFOREST_ALL_MATERIALS.map(material => material.id)
    );
    return [...new Set(
      (Array.isArray(values) ? values : [])
        .filter(value => validIds.has(String(value)))
        .map(String)
    )];
  }

  function rainforestUnlockedCount(source = state) {
    return validRainforestMaterialIds(
      source?.rainforest?.unlockedMaterials
    ).length;
  }

  function randomIndex(length) {
    if (length <= 1) return 0;

    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);
      return values[0] % length;
    }

    return Math.floor(Math.random() * length);
  }

  const ISLANDS = {
    nature: {
      title: "我的世界・自然小木屋岛",
      icon: "🏡",
      stages: [
        { max: 0, icon: "🌱", name: "荒地起步" },
        { max: 5, icon: "🪨", name: "铺设小路" },
        { max: 13, icon: "🌲", name: "森林萌芽" },
        { max: 22, icon: "📚", name: "树洞图书馆" },
        { max: 42, icon: "🏡", name: "建造小木屋" },
        { max: 52, icon: "🛝", name: "添置彩虹滑梯" },
        { max: 59, icon: "✨", name: "完善岛屿细节" },
        { max: 60, icon: "🌟", name: "自然小木屋岛完成" }
      ]
    },
    robot: {
      title: "我的世界・机器人基地岛",
      icon: "🤖",
      stages: [
        { max: 0, icon: "🤖", name: "基地起步" },
        { max: 8, icon: "🛤️", name: "铺设科技通道" },
        { max: 20, icon: "☀️", name: "安装太阳能板" },
        { max: 32, icon: "⚙️", name: "机械工坊" },
        { max: 48, icon: "🧪", name: "机器人实验室" },
        { max: 56, icon: "📡", name: "通讯塔" },
        { max: 60, icon: "🌟", name: "机器人基地岛完成" }
      ]
    },
    ocean: {
      title: "我的世界・海底邮局岛",
      icon: "🐚",
      stages: [
        { max: 0, icon: "🐟", name: "海底起步" },
        { max: 8, icon: "🐚", name: "铺设贝壳小路" },
        { max: 20, icon: "🪸", name: "珊瑚花园" },
        { max: 32, icon: "📦", name: "包裹配送站" },
        { max: 50, icon: "📮", name: "贝壳邮局" },
        { max: 57, icon: "🫧", name: "泡泡传送管" },
        { max: 60, icon: "🌟", name: "海底邮局岛完成" }
      ]
    },
    coconut: {
      title: "我的世界・椰子岛",
      icon: "🥥",
      stages: [
        { max: 0, icon: "🌊", name: "蔚蓝海面" },
        { max: 8, icon: "🏝️", name: "建设小岛" },
        { max: 18, icon: "🦀", name: "沙滩动物来安家" },
        { max: 30, icon: "🌱", name: "种下椰子树" },
        { max: 40, icon: "🌴", name: "长出椰子树叶" },
        { max: 50, icon: "🥥", name: "结出香甜椰子" },
        { max: 58, icon: "🌴", name: "椰林越来越茂盛" },
        { max: 60, icon: "🌟", name: "椰子岛完成" }
      ]
    },
    rainforest: {
      title: "雨林岛・自由建造",
      icon: "🌧️",
      freeBuild: true,
      stages: []
    }
  };

  const DEFAULT_STATE = {
    version: 1,
    currentIsland: "nature",
    lastDate: "",
    progress: {
      nature: 0,
      robot: 0,
      ocean: 0,
      coconut: 0
    },
    tasks: [
      {
        id: "math-default",
        title: "数学练习",
        subtitle: "让数字世界多一点星光",
        icon: "🧮",
        kind: "fixed",
        type: "math",
        progress: 0,
        target: 1
      },
      {
        id: "chinese-default",
        title: "语文阅读",
        subtitle: "给故事森林添一本新书",
        icon: "📚",
        kind: "fixed",
        type: "language",
        progress: 0,
        target: 1
      },
      {
        id: "english-default",
        title: "英语听读",
        subtitle: "让小岛响起新的音符",
        icon: "🔤",
        kind: "fixed",
        type: "english",
        progress: 0,
        target: 1
      },
      {
        id: "habit-default",
        title: "整理书包",
        subtitle: "为明天的冒险做好准备",
        icon: "🎒",
        kind: "fixed",
        type: "habit",
        progress: 0,
        target: 1
      }
    ],
    logs: [
      {
        id: "welcome-log",
        island: "nature",
        icon: "🌱",
        title: "星芽岛从零开始",
        detail: "完成每天的小任务，逐步建设属于自己的成长世界。",
        time: "建设起点"
      }
    ],
    growth: {
      nature: [],
      robot: [],
      ocean: [],
      coconut: []
    },
    rainforest: {
      initialized: true,
      layoutVersion: 2,
      unlockVersion: 2,
      unlockedMaterials: [
        "river-1",
        "lily-1",
        "tree-1",
        "vine-1",
        "rafflesia-1",
        "rain-1",
        "dew-1",
        "piranha-1",
        "arapaima-1",
        "animal-1",
        "soil-1",
        "plant-1"
      ],
      items: []
    },
    lastStandardIsland: "coconut"
  };

  const EFFECTS = {
    nature: {
      math: [
        { icon: "⭐", message: "草地上亮起了一颗数字星星。" },
        { icon: "💎", message: "小岛发现了一颗闪亮的数字宝石。" },
        { icon: "🌿", message: "森林里的藤蔓又长高了一点。" }
      ],
      language: [
        { icon: "📖", message: "树洞图书馆收藏了一本新书。" },
        { icon: "🌼", message: "故事森林开出了一朵文字花。" },
        { icon: "🕊️", message: "一只书鸟来到小岛安家。" }
      ],
      english: [
        { icon: "🎵", message: "小木屋旁响起了新的音符。" },
        { icon: "🔤", message: "草地上出现了一张单词卡。" },
        { icon: "🌈", message: "彩虹滑梯亮起了柔和的光。" }
      ],
      habit: [
        { icon: "🌱", message: "小岛上冒出了一棵新嫩芽。" },
        { icon: "🍃", message: "森林里多了一片轻轻摇动的叶子。" },
        { icon: "🌻", message: "小路边开出了一朵太阳花。" }
      ]
    },
    robot: {
      math: [
        { icon: "⚙️", message: "机器人基地安装了一个精密齿轮。" },
        { icon: "🔋", message: "基地获得了一块新的能量电池。" }
      ],
      language: [
        { icon: "📡", message: "通讯系统收到了一条星光消息。" },
        { icon: "🧠", message: "小机器人学会了一个新知识。" }
      ],
      english: [
        { icon: "🛰️", message: "基地成功连接了远方信号。" },
        { icon: "💡", message: "实验室亮起了一盏智慧灯。" }
      ],
      habit: [
        { icon: "🔧", message: "机械工坊整理好了一套工具。" },
        { icon: "🤖", message: "小机器人学会了一个新动作。" }
      ]
    },
    ocean: {
      math: [
        { icon: "🐚", message: "海底邮路多了一枚漂亮的贝壳。" },
        { icon: "🫧", message: "泡泡传送管又点亮了一段。" }
      ],
      language: [
        { icon: "💌", message: "海底邮局收到了一封新的故事信。" },
        { icon: "📮", message: "贝壳邮箱里多了一张明信片。" }
      ],
      english: [
        { icon: "🐠", message: "小鱼邮差学会了一句新的问候。" },
        { icon: "🌊", message: "远方海流送来了一封英文信。" }
      ],
      habit: [
        { icon: "🪸", message: "珊瑚花园长出了一簇新珊瑚。" },
        { icon: "🦈", message: "友好的鲨鱼又完成了一次巡游。" }
      ]
    },
    coconut: {
      math: [
        { icon: "⭐", message: "沙滩上多了一颗闪亮的数学海星。" },
        { icon: "🥥", message: "椰子树积攒了一份成长能量。" }
      ],
      language: [
        { icon: "🐚", message: "海风送来了一枚装着故事的贝壳。" },
        { icon: "🌺", message: "椰林旁开出了一朵文字花。" }
      ],
      english: [
        { icon: "🌊", message: "海浪学会了一句新的英文问候。" },
        { icon: "🦜", message: "热带小鸟记住了一个新单词。" }
      ],
      habit: [
        { icon: "🦀", message: "小螃蟹在整洁的沙滩上安家啦。" },
        { icon: "🌴", message: "椰子树又长高了一点。" }
      ]
    }
  };

  const GROWTH_POSITIONS = [
    { left: 48, top: 70 },
    { left: 42, top: 60 },
    { left: 70, top: 68 },
    { left: 31, top: 72 },
    { left: 58, top: 55 },
    { left: 80, top: 73 },
    { left: 22, top: 66 },
    { left: 64, top: 76 }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const buildCountEl = $("#buildCount");
  const buildMaxEl = $("#buildMax");
  const dailyLightEl = $("#dailyLight");
  const islandTitleEl = $("#islandTitle");
  const taskListEl = $("#taskList");
  const growthLayerEl = $("#growthLayer");
  const logListEl = $("#logList");
  const parentTaskListEl = $("#parentTaskList");
  const islandStageEl = $("#islandStage");
  const parentBtnEl = $("#parentBtn");

  let state = loadState();
  let activeTaskId = null;
  let toastTimer = null;
  let sceneTipTimer = null;
  let parentHoldTimer = null;
  let parentOpenedByHold = false;

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function todayKey() {
    const date = new Date();
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function formatTime(date = new Date()) {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function normalizeState(input) {
    const result = {
      ...deepClone(DEFAULT_STATE),
      ...(input || {})
    };

    result.progress = {
      nature: clampNumber(input?.progress?.nature, 0, MAX_BUILD),
      robot: clampNumber(input?.progress?.robot, 0, MAX_BUILD),
      ocean: clampNumber(input?.progress?.ocean, 0, MAX_BUILD),
      coconut: clampNumber(input?.progress?.coconut, 0, MAX_BUILD)
    };

    result.tasks = Array.isArray(input?.tasks)
      ? input.tasks.map(task => ({
          id: String(task.id || makeId()),
          title: String(task.title || "学习任务").slice(0, 18),
          subtitle: String(task.subtitle || "完成后小岛会继续成长").slice(0, 28),
          icon: String(task.icon || "⭐"),
          kind: task.kind === "temporary" ? "temporary" : "fixed",
          type: ["math", "language", "english", "habit"].includes(task.type)
            ? task.type
            : "habit",
          progress: Math.max(0, Math.floor(Number(task.progress) || 0)),
          target: clampNumber(task.target, 1, 99)
        }))
      : deepClone(DEFAULT_STATE.tasks);

    result.logs = Array.isArray(input?.logs)
      ? input.logs.slice(0, 100)
      : deepClone(DEFAULT_STATE.logs);

    result.growth = {
      nature: Array.isArray(input?.growth?.nature) ? input.growth.nature.slice(-20) : [],
      robot: Array.isArray(input?.growth?.robot) ? input.growth.robot.slice(-20) : [],
      ocean: Array.isArray(input?.growth?.ocean) ? input.growth.ocean.slice(-20) : [],
      coconut: Array.isArray(input?.growth?.coconut) ? input.growth.coconut.slice(-20) : []
    };

    const rainforestLayoutCurrent =
      Number(input?.rainforest?.layoutVersion) === 2;

    let unlockedMaterials = validRainforestMaterialIds(
      input?.rainforest?.unlockedMaterials
    );

    if (!unlockedMaterials.length && input?.rainforest?.materialProgress) {
      Object.entries(RAINFOREST_MATERIAL_CATEGORIES).forEach(
        ([category, config]) => {
          const oldPoints = Math.max(
            0,
            Math.floor(
              Number(input.rainforest.materialProgress[category]) || 0
            )
          );
          const oldUnlocked = Math.min(config.count, 1 + oldPoints);

          for (let index = 1; index <= oldUnlocked; index += 1) {
            unlockedMaterials.push(`${category}-${index}`);
          }
        }
      );
    }

    unlockedMaterials = validRainforestMaterialIds([
      ...RAINFOREST_BASE_MATERIALS,
      ...unlockedMaterials
    ]);

    result.rainforest = {
      initialized: true,
      layoutVersion: 2,
      unlockVersion: 2,
      unlockedMaterials,
      items: rainforestLayoutCurrent && Array.isArray(input?.rainforest?.items)
        ? input.rainforest.items.slice(0, 100)
        : []
    };

    result.lastStandardIsland =
      ["nature", "robot", "ocean", "coconut"].includes(input?.lastStandardIsland)
        ? input.lastStandardIsland
        : "coconut";

    result.currentIsland =
      ["nature", "robot", "ocean", "coconut", "rainforest"].includes(input?.currentIsland)
        ? input.currentIsland
        : "nature";

    if (!isIslandUnlocked(result.currentIsland, result)) {
      const available = ["coconut", "ocean", "robot", "nature"]
        .find(island => isIslandUnlocked(island, result));
      result.currentIsland = available || "nature";
    }

    return result;
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return normalizeState(raw ? JSON.parse(raw) : deepClone(DEFAULT_STATE));
    } catch (error) {
      console.warn("读取本地数据失败，已使用默认状态。", error);
      return deepClone(DEFAULT_STATE);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function rolloverDay() {
    const today = todayKey();

    if (!state.lastDate) {
      state.lastDate = today;
      saveState();
      return;
    }

    if (state.lastDate === today) return;

    state.tasks = state.tasks
      .filter(task => task.kind !== "temporary")
      .map(task => ({ ...task, progress: 0 }));

    state.lastDate = today;
    addLog({
      island: state.currentIsland,
      icon: "☀️",
      title: "新的一天开始啦",
      detail: "固定任务已经准备好，临时任务已清空。"
    });
    saveState();
  }

  function isIslandUnlocked(island, source = state) {
    if (island === "nature") return true;
    if (island === "robot") return source.progress.nature >= MAX_BUILD;
    if (island === "ocean") return source.progress.robot >= MAX_BUILD;
    if (island === "coconut") return source.progress.ocean >= MAX_BUILD;
    if (island === "rainforest") {
      return source.progress.coconut >= MAX_BUILD;
    }
    return false;
  }

  function currentProgress() {
    return state.progress[state.currentIsland] || 0;
  }

  function taskIsComplete(task) {
    return Number(task.progress) >= Number(task.target);
  }

  function segmentProgress(value, start, end) {
    if (value <= start) return 0;
    if (value >= end) return 1;
    return (value - start) / (end - start);
  }

  function setLayerProgress(element, progress) {
    if (!element) return;
    const p = Math.max(0, Math.min(1, progress));
    element.style.setProperty("--layer-opacity", p === 0 ? 0 : 0.22 + p * 0.78);
    element.style.setProperty("--layer-clip", `${(1 - p) * 100}%`);
    element.style.setProperty("--layer-shift", `${(1 - p) * 12}px`);
    element.style.setProperty("--layer-scale", 0.96 + p * 0.04);
  }

  function currentStage() {
    const stages = ISLANDS[state.currentIsland].stages;
    return stages.find(stage => currentProgress() <= stage.max) || stages.at(-1);
  }

  function render() {
    rolloverDay();

    const rainforestMode = state.currentIsland === "rainforest";
    document.body.classList.remove("rainforest-mode");

    const completedCount = state.tasks.reduce(
      (sum, task) => sum + Math.max(0, Number(task.progress) || 0),
      0
    );
    const targetCount = state.tasks.reduce(
      (sum, task) => sum + Math.max(1, Number(task.target) || 1),
      0
    );
    dailyLightEl.textContent = `${completedCount} / ${targetCount}`;

    renderTasks();
    renderIslandMap();
    renderParentTasks();

    if (rainforestMode) {
      const unlocked = rainforestUnlockedCount();
      islandTitleEl.textContent = "我的世界・雨林岛";
      buildCountEl.textContent = unlocked;
      buildMaxEl.textContent = RAINFOREST_ALL_MATERIALS.length;
      islandStageEl.dataset.buildCount = String(unlocked);

      $("#logBtnIcon").textContent = "🌱";
      $("#logBtnText").textContent = "建设进度";

      renderBuildStage();
      window.RainforestEditor?.render();
      return;
    }

    const progress = currentProgress();
    buildCountEl.textContent = progress;
    buildMaxEl.textContent = MAX_BUILD;
    islandTitleEl.textContent = ISLANDS[state.currentIsland].title;
    islandStageEl.dataset.buildCount = String(progress);

    $("#logBtnIcon").textContent = "✨";
    $("#logBtnText").textContent = "建设记录";

    renderGrowth();
    renderBuildStage();
  }

  function renderTasks() {
    if (!state.tasks.length) {
      taskListEl.innerHTML = `
        <div class="empty-state">
          今天还没有任务。请长按“家长设置”添加任务。
        </div>
      `;
      return;
    }

    taskListEl.innerHTML = state.tasks.map(task => {
      const percent = Math.min(100, Math.round((task.progress / task.target) * 100));
      const complete = taskIsComplete(task);

      return `
        <button
          class="task-card ${complete ? "completed" : ""}"
          type="button"
          data-task-id="${escapeHtml(task.id)}"
        >
          <span class="task-icon">${escapeHtml(task.icon)}</span>
          <span class="task-copy">
            <span class="task-title-row">
              <strong>${escapeHtml(task.title)}</strong>
              ${complete ? `<span class="check" aria-label="已完成">●</span>` : ""}
            </span>
            <span class="task-subtitle">${escapeHtml(task.subtitle)}</span>
            <span class="task-progress">
              <span>${task.progress} / ${task.target}</span>
              <span class="task-mini-track">
                <span style="width:${percent}%"></span>
              </span>
            </span>
          </span>
        </button>
      `;
    }).join("");

    $$(".task-card", taskListEl).forEach(button => {
      button.addEventListener("click", () => openTaskModal(button.dataset.taskId));
    });
  }

  function renderGrowth() {
    const items = state.growth[state.currentIsland].slice(-8);

    growthLayerEl.innerHTML = items.map((item, index) => {
      const position = item.position || GROWTH_POSITIONS[index % GROWTH_POSITIONS.length];
      return `
        <span
          class="growth-item"
          style="left:${position.left}%;top:${position.top}%"
        >${escapeHtml(item.icon)}</span>
      `;
    }).join("");
  }

  function renderBuildStage() {
    const value = currentProgress();
    const natureMode = state.currentIsland === "nature";
    const robotMode = state.currentIsland === "robot";
    const oceanMode = state.currentIsland === "ocean";
    const coconutMode = state.currentIsland === "coconut";
    const rainforestMode = state.currentIsland === "rainforest";

    islandStageEl.classList.toggle("robot-island", robotMode);
    islandStageEl.classList.toggle("ocean-island", oceanMode);
    islandStageEl.classList.toggle("coconut-island", coconutMode);
    islandStageEl.classList.toggle("rainforest-island", rainforestMode);
    islandStageEl.classList.toggle(
      "is-complete",
      !rainforestMode && value >= MAX_BUILD
    );

    $("#finalScene").style.opacity = 0;
    $("#robotFinalScene").style.opacity = 0;
    $("#oceanFinalScene").style.opacity = 0;
    $("#coconutFinalScene").style.opacity = 0;

    if (natureMode) {
      setLayerProgress($("#mascotLayer"), 1);
      setLayerProgress($("#pathLayer"), segmentProgress(value, 0, 5));
      setLayerProgress($("#forestLayer"), segmentProgress(value, 4, 13));
      setLayerProgress($("#libraryLayer"), segmentProgress(value, 10, 22));
      setLayerProgress($("#cottageLayer"), segmentProgress(value, 20, 42));
      setLayerProgress($("#slideLayer"), segmentProgress(value, 40, 52));
      $("#finalScene").style.opacity = segmentProgress(value, 55, 60);
    }

    if (robotMode) {
      setLayerProgress($("#robotPathLayer"), segmentProgress(value, 0, 8));
      setLayerProgress($("#robotSolarLayer"), segmentProgress(value, 6, 20));
      setLayerProgress($("#robotGearsLayer"), segmentProgress(value, 16, 32));
      setLayerProgress($("#robotLabLayer"), segmentProgress(value, 28, 48));
      setLayerProgress($("#robotTowerLayer"), segmentProgress(value, 44, 56));
      $("#robotFinalScene").style.opacity = segmentProgress(value, 56, 60);
    }

    if (oceanMode) {
      setLayerProgress($("#oceanPathLayer"), segmentProgress(value, 0, 8));
      setLayerProgress($("#oceanCoralLayer"), segmentProgress(value, 6, 20));
      setLayerProgress($("#oceanDeliveryLayer"), segmentProgress(value, 16, 32));
      setLayerProgress($("#oceanPostOfficeLayer"), segmentProgress(value, 28, 50));
      setLayerProgress($("#oceanBubblesLayer"), segmentProgress(value, 45, 57));
      $("#oceanFinalScene").style.opacity = segmentProgress(value, 56, 60);
    }

    if (coconutMode) {
      setLayerProgress($("#coconutIslandLayer"), segmentProgress(value, 0, 8));
      setLayerProgress($("#coconutAnimalsLayer"), segmentProgress(value, 7, 18));
      setLayerProgress($("#coconutTrunkLayer"), segmentProgress(value, 16, 30));
      setLayerProgress($("#coconutLeavesLayer"), segmentProgress(value, 27, 40));
      setLayerProgress($("#coconutFruitLayer"), segmentProgress(value, 38, 50));
      setLayerProgress($("#coconutGroveLayer"), segmentProgress(value, 47, 58));
      $("#coconutFinalScene").style.opacity = segmentProgress(value, 56, 60);
    }

    if (rainforestMode) {
      const unlocked = rainforestUnlockedCount();
      $("#buildStageIcon").textContent = "🌿";
      $("#buildStageName").textContent =
        `素材解锁 ${unlocked} / ${RAINFOREST_ALL_MATERIALS.length}`;
      $("#sceneTip").textContent =
        unlocked >= RAINFOREST_ALL_MATERIALS.length
          ? "全部雨林素材已经解锁，可以自由创造完整生态"
          : "完成任意任务，会随机解锁一个新的雨林素材";
      return;
    }

    const stage = currentStage();
    $("#buildStageIcon").textContent = stage.icon;
    $("#buildStageName").textContent = stage.name;
  }

  function renderIslandMap() {
    const natureComplete = state.progress.nature >= MAX_BUILD;
    const robotUnlocked = isIslandUnlocked("robot");
    const robotComplete = state.progress.robot >= MAX_BUILD;
    const oceanUnlocked = isIslandUnlocked("ocean");
    const oceanComplete = state.progress.ocean >= MAX_BUILD;
    const coconutUnlocked = isIslandUnlocked("coconut");
    const coconutComplete = state.progress.coconut >= MAX_BUILD;
    const rainforestUnlocked = isIslandUnlocked("rainforest");

    updateIslandCard({
      card: $("#natureIslandCard"),
      island: "nature",
      unlocked: true,
      complete: natureComplete,
      progress: state.progress.nature,
      description: natureComplete ? "已完成，可随时返回" : "当前建设中的成长世界",
      status: natureComplete ? "已完成" : `${state.progress.nature} / ${MAX_BUILD}`
    });

    updateIslandCard({
      card: $("#robotIslandCard"),
      island: "robot",
      unlocked: robotUnlocked,
      complete: robotComplete,
      progress: state.progress.robot,
      description: !robotUnlocked
        ? "完成自然小木屋岛后解锁"
        : robotComplete
          ? "机器人基地建设完成"
          : "新的成长世界，点击进入建设",
      status: !robotUnlocked
        ? "尚未解锁"
        : robotComplete
          ? "已完成"
          : `${state.progress.robot} / ${MAX_BUILD}`
    });

    updateIslandCard({
      card: $("#oceanIslandCard"),
      island: "ocean",
      unlocked: oceanUnlocked,
      complete: oceanComplete,
      progress: state.progress.ocean,
      description: !oceanUnlocked
        ? "完成机器人基地岛后解锁"
        : oceanComplete
          ? "海底邮局建设完成"
          : "新的海底成长世界，点击进入建设",
      status: !oceanUnlocked
        ? "尚未解锁"
        : oceanComplete
          ? "已完成"
          : `${state.progress.ocean} / ${MAX_BUILD}`
    });

    updateIslandCard({
      card: $("#coconutIslandCard"),
      island: "coconut",
      unlocked: coconutUnlocked,
      complete: coconutComplete,
      progress: state.progress.coconut,
      description: !coconutUnlocked
        ? "完成海底邮局岛后解锁"
        : coconutComplete
          ? "椰子岛建设完成"
          : "从大海开始建设热带椰林",
      status: !coconutUnlocked
        ? "尚未解锁"
        : coconutComplete
          ? "已完成"
          : `${state.progress.coconut} / ${MAX_BUILD}`
    });

    updateIslandCard({
      card: $("#rainforestIslandCard"),
      island: "rainforest",
      unlocked: rainforestUnlocked,
      complete: false,
      progress: 0,
      description: !rainforestUnlocked
        ? "完成椰子岛后解锁"
        : "自由摆放河流、古树、王莲和雨林动物",
      status: !rainforestUnlocked
        ? "尚未解锁"
        : `素材 ${rainforestUnlockedCount()} / ${RAINFOREST_ALL_MATERIALS.length}`
    });
  }

  function updateIslandCard({ card, island, unlocked, complete, description, status }) {
    if (!card) return;

    card.disabled = !unlocked;
    card.classList.toggle("locked", !unlocked);
    card.classList.toggle("unlocked", unlocked && !complete);
    card.classList.toggle("completed", complete);
    card.classList.toggle("current", state.currentIsland === island);

    $(`#${island}IslandDescription`).textContent = description;
    $(`#${island}IslandStatus`).textContent = status;
  }

  function renderParentTasks() {
    if (!state.tasks.length) {
      parentTaskListEl.innerHTML = `<div class="empty-state">还没有任务。</div>`;
      return;
    }

    parentTaskListEl.innerHTML = state.tasks.map(task => `
      <div class="parent-task-row">
        <span class="icon">${escapeHtml(task.icon)}</span>
        <div>
          <strong>${escapeHtml(task.title)}</strong>
          <small>
            ${task.kind === "fixed" ? "固定任务" : "临时任务"}
            · ${task.progress}/${task.target}
          </small>
        </div>
        <button
          class="delete-task"
          type="button"
          data-delete-task="${escapeHtml(task.id)}"
          aria-label="删除 ${escapeHtml(task.title)}"
        >×</button>
      </div>
    `).join("");

    $$("[data-delete-task]", parentTaskListEl).forEach(button => {
      button.addEventListener("click", () => {
        state.tasks = state.tasks.filter(
          task => task.id !== button.dataset.deleteTask
        );
        saveState();
        render();
        showToast("任务已删除");
      });
    });
  }

  function openTaskModal(taskId) {
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return;

    activeTaskId = taskId;
    $("#taskModalIcon").textContent = task.icon;
    $("#taskModalTitle").textContent = task.title;
    $("#taskModalDescription").textContent = task.subtitle;
    $("#taskModalProgress").textContent = `${task.progress} / ${task.target}`;
    $("#taskModalProgressBar").style.width =
      `${Math.min(100, (task.progress / task.target) * 100)}%`;

    const button = $("#completeTaskBtn");
    button.disabled = false;
    button.textContent = taskIsComplete(task)
      ? "再完成一次"
      : task.target > 1
        ? "完成一次"
        : "我完成啦";

    openModal("taskModal");
  }


  function awardRandomRainforestMaterial() {
    const unlocked = new Set(
      validRainforestMaterialIds(state.rainforest.unlockedMaterials)
    );

    const locked = RAINFOREST_ALL_MATERIALS.filter(
      material => !unlocked.has(material.id)
    );

    if (!locked.length) {
      return {
        newlyUnlocked: false,
        icon: "🌟",
        name: "全部雨林素材",
        message: "🌟 80 种雨林素材已经全部解锁"
      };
    }

    const material = locked[randomIndex(locked.length)];
    unlocked.add(material.id);
    state.rainforest.unlockedMaterials = [...unlocked];

    return {
      ...material,
      newlyUnlocked: true,
      message:
        `${material.icon} 随机解锁：${material.name}` +
        `（${unlocked.size}/${RAINFOREST_ALL_MATERIALS.length}）`
    };
  }

  function completeActiveTask() {
    const task = state.tasks.find(item => item.id === activeTaskId);
    if (!task) return;

    const hadReachedTarget = taskIsComplete(task);
    task.progress = Math.max(0, Math.floor(Number(task.progress) || 0)) + 1;
    const materialReward = awardRandomRainforestMaterial();

    const taskLogTitle = hadReachedTarget
      ? `${task.title}又完成一次`
      : taskIsComplete(task)
        ? `${task.title}完成啦`
        : `${task.title}前进了一步`;

    const rainforestMode = state.currentIsland === "rainforest";
    let reachedCompletion = false;
    let toastMessage = "";

    if (rainforestMode) {
      const rainforestEffects = [
        {
          icon: "💧",
          message: "雨林岛记录了一滴成长雨露，素材仍由你自由摆放。"
        },
        {
          icon: "🍃",
          message: "雨林里吹来一阵成长微风，自由建造画布保持原样。"
        },
        {
          icon: "✨",
          message: "今天的努力化成了一点雨林星光。"
        },
        {
          icon: "🌱",
          message: "雨林岛记录了一次新的成长努力。"
        }
      ];

      const effect =
        rainforestEffects[Math.floor(Math.random() * rainforestEffects.length)];

      addLog({
        island: "rainforest",
        icon: materialReward.icon || "🎁",
        title: taskLogTitle,
        detail: `${effect.message} ${materialReward.message}`
      });

      toastMessage = materialReward.message;
    } else {
      const previousProgress = currentProgress();
      state.progress[state.currentIsland] = Math.min(
        MAX_BUILD,
        previousProgress + 1
      );

      const effectPool =
        EFFECTS[state.currentIsland]?.[task.type] ||
        EFFECTS[state.currentIsland]?.habit ||
        EFFECTS.nature.habit;

      const effect =
        effectPool[Math.floor(Math.random() * effectPool.length)];

      const growthItems = state.growth[state.currentIsland];
      const position =
        GROWTH_POSITIONS[growthItems.length % GROWTH_POSITIONS.length];

      growthItems.push({
        id: makeId(),
        icon: effect.icon,
        message: effect.message,
        position
      });
      state.growth[state.currentIsland] = growthItems.slice(-20);

      addLog({
        island: state.currentIsland,
        icon: effect.icon,
        title: taskLogTitle,
        detail: `${effect.message} ${materialReward.message}`
      });

      reachedCompletion =
        previousProgress < MAX_BUILD &&
        state.progress[state.currentIsland] >= MAX_BUILD;

      if (reachedCompletion) {
        handleIslandCompletion(state.currentIsland);
      }

      toastMessage = reachedCompletion
        ? `${completionMessage(state.currentIsland)}；${materialReward.message}`
        : `${effect.message} ${materialReward.message}`;
    }

    saveState();
    closeAllModals();
    render();
    playCelebration();
    showToast(toastMessage);
  }

  function handleIslandCompletion(island) {
    if (island === "nature") {
      addLog({
        island: "nature",
        icon: "🤖",
        title: "机器人基地岛已解锁",
        detail: "新的成长世界已经出现在岛屿地图中。"
      });
    }

    if (island === "robot") {
      addLog({
        island: "robot",
        icon: "🐚",
        title: "海底邮局岛已解锁",
        detail: "海底邮局岛已经出现在岛屿地图中。"
      });
    }

    if (island === "ocean") {
      addLog({
        island: "ocean",
        icon: "🥥",
        title: "椰子岛已解锁",
        detail: "新的热带成长世界已经出现在岛屿地图中。"
      });
    }

    if (island === "coconut") {
      addLog({
        island: "coconut",
        icon: "🌧️",
        title: "雨林岛已解锁",
        detail: "第五座岛已经开放，可以自由摆放雨林素材。"
      });
    }
  }

  function completionMessage(island) {
    if (island === "nature") {
      return "自然小木屋岛完成！机器人基地岛已经解锁";
    }
    if (island === "robot") {
      return "机器人基地岛完成！海底邮局岛已经解锁";
    }
    if (island === "ocean") {
      return "海底邮局岛完成！椰子岛已经解锁";
    }
    return "椰子岛完成！第五座雨林岛已经解锁";
  }

  function addLog({ island, icon, title, detail }) {
    state.logs.unshift({
      id: makeId(),
      island,
      icon,
      title,
      detail,
      time: formatTime()
    });
    state.logs = state.logs.slice(0, 100);
  }

  function renderLogs() {
    const logs = state.logs.filter(log =>
      !log.island || log.island === state.currentIsland
    );

    if (!logs.length) {
      logListEl.innerHTML = `
        <div class="empty-state">
          完成任务后，建设记录会出现在这里。
        </div>
      `;
      return;
    }

    logListEl.innerHTML = logs.map(log => `
      <div class="log-entry">
        <div class="log-icon">${escapeHtml(log.icon)}</div>
        <div>
          <strong>${escapeHtml(log.title)}</strong>
          <div>${escapeHtml(log.detail)}</div>
          <small>${escapeHtml(log.time)}</small>
        </div>
      </div>
    `).join("");
  }

  function switchIsland(island) {
    if (!isIslandUnlocked(island)) {
      const lockedMessages = {
        robot: "完成自然小木屋岛后才能解锁机器人基地岛",
        ocean: "完成机器人基地岛后才能解锁海底邮局岛",
        coconut: "完成海底邮局岛后才能解锁椰子岛",
        rainforest: "完成椰子岛后才能解锁雨林岛"
      };
      showToast(lockedMessages[island] || "这座岛还没有解锁");
      return;
    }

    if (island === "rainforest" && state.currentIsland !== "rainforest") {
      state.lastStandardIsland = state.currentIsland;
    } else if (island !== "rainforest") {
      state.lastStandardIsland = island;
    }

    state.currentIsland = island;
    saveState();
    closeAllModals();
    render();
    showToast(`已进入${ISLANDS[island].title.replace("我的世界・", "")}`);
  }

  function openModal(id) {
    $("#modalBackdrop").hidden = false;
    $(`#${id}`).hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeAllModals() {
    $("#modalBackdrop").hidden = true;
    $$(".modal").forEach(modal => {
      modal.hidden = true;
    });
    document.body.style.overflow = "";
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function showSceneTip(message) {
    const tip = $("#sceneTip");
    tip.textContent = message;
    tip.classList.add("show");

    clearTimeout(sceneTipTimer);
    sceneTipTimer = setTimeout(() => {
      tip.classList.remove("show");
    }, 2200);
  }

  function playCelebration() {
    const celebration = $("#celebration");
    celebration.classList.remove("active");
    void celebration.offsetWidth;
    celebration.classList.add("active");

    setTimeout(() => {
      celebration.classList.remove("active");
    }, 1250);
  }

  function inferType(title) {
    if (/数学|口算|计算|算术|题目/.test(title)) return "math";
    if (/语文|阅读|生字|古诗|写字|故事|作文/.test(title)) return "language";
    if (/英语|单词|听读|英文|跟读/.test(title)) return "english";
    return "habit";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  $("#completeTaskBtn").addEventListener("click", completeActiveTask);

  $("#mapBtn").addEventListener("click", () => {
    renderIslandMap();
    openModal("mapModal");
  });

  $("#logBtn").addEventListener("click", () => {
    if (state.currentIsland === "rainforest") {
      window.RainforestEditor?.openProgress();
      return;
    }

    renderLogs();
    openModal("logModal");
  });

  $("#natureIslandCard").addEventListener("click", () => switchIsland("nature"));
  $("#robotIslandCard").addEventListener("click", () => switchIsland("robot"));
  $("#oceanIslandCard").addEventListener("click", () => switchIsland("ocean"));
  $("#coconutIslandCard").addEventListener("click", () => switchIsland("coconut"));
  $("#rainforestIslandCard").addEventListener("click", () => switchIsland("rainforest"));

  $("#modalBackdrop").addEventListener("click", closeAllModals);
  $$("[data-close-modal]").forEach(button => {
    button.addEventListener("click", closeAllModals);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeAllModals();
  });

  // 家长入口：长按约 2 秒，防止孩子误触。
  const startParentHold = event => {
    event.preventDefault();
    parentOpenedByHold = false;
    clearTimeout(parentHoldTimer);
    parentBtnEl.classList.add("holding");

    parentHoldTimer = setTimeout(() => {
      parentOpenedByHold = true;
      parentBtnEl.classList.remove("holding");
      renderParentTasks();
      openModal("parentModal");
    }, PARENT_HOLD_MS);
  };

  const cancelParentHold = () => {
    clearTimeout(parentHoldTimer);
    parentBtnEl.classList.remove("holding");

    if (!parentOpenedByHold) {
      showToast("请长按“家长设置”约 2 秒");
    }
  };

  parentBtnEl.addEventListener("pointerdown", startParentHold);
  parentBtnEl.addEventListener("pointerup", cancelParentHold);
  parentBtnEl.addEventListener("pointercancel", cancelParentHold);
  parentBtnEl.addEventListener("pointerleave", event => {
    if (event.buttons) cancelParentHold();
  });
  parentBtnEl.addEventListener("contextmenu", event => event.preventDefault());

  $$(".scene-hotspot").forEach(button => {
    button.addEventListener("click", () => {
      const place = button.dataset.place;
      const progress = currentProgress();
      const messages = {
        "树洞图书馆": progress < 10
          ? "继续完成任务，森林成长后会开始建造树洞图书馆。"
          : "树洞图书馆正在收藏每一次努力带来的新故事。",
        "自然小木屋": progress < 20
          ? "小木屋还没有开工，要先铺路、种森林并建好图书馆。"
          : "自然小木屋正在一层一层地变得更温暖。",
        "彩虹滑梯": progress < 40
          ? "彩虹滑梯会在小木屋之后开始建设。"
          : "彩虹滑梯正在一点点出现。"
      };

      showSceneTip(messages[place] || place);
    });
  });

  $("#taskForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("#taskTitleInput").value.trim();
    if (!title) return;

    const taskType = inferType(title);

    state.tasks.push({
      id: makeId(),
      title,
      subtitle:
        $("#taskSubtitleInput").value.trim() ||
        "完成后小岛会继续成长",
      icon: $("#taskIconInput").value,
      kind: $("#taskKindInput").value === "temporary"
        ? "temporary"
        : "fixed",
      type: taskType,
      progress: 0,
      target: clampNumber($("#taskTargetInput").value, 1, 99)
    });

    saveState();
    render();
    event.currentTarget.reset();
    $("#taskTargetInput").value = 1;
    showToast("新任务已加入今日任务");
  });

  $("#resetTodayBtn").addEventListener("click", () => {
    state.tasks = state.tasks.map(task => ({
      ...task,
      progress: 0
    }));

    addLog({
      island: state.currentIsland,
      icon: "↺",
      title: "今日任务已重置",
      detail: "只重置今天的任务，岛屿长期建设进度不会倒退。"
    });

    saveState();
    render();
    showToast("今日任务进度已重置");
  });

  $("#restoreDefaultBtn").addEventListener("click", () => {
    const confirmed = window.confirm(
      "确定清除全部进度吗？五座岛、任务和记录都会恢复到初始状态。"
    );

    if (!confirmed) return;

    state = deepClone(DEFAULT_STATE);
    state.lastDate = todayKey();
    saveState();
    closeAllModals();
    render();
    showToast("全部进度已清除，星芽岛从 0 开始");
  });


  window.StarSproutBridge = {
    getState: () => state,
    saveState,
    render,
    showToast,
    switchIsland,
    openTaskModal,
    openModal,
    closeAllModals,
    openParentSettings: () => {
      renderParentTasks();
      openModal("parentModal");
    },
    openMap: () => {
      renderIslandMap();
      openModal("mapModal");
    },
    getRainforestCatalog: () => ({
      categories: RAINFOREST_MATERIAL_CATEGORIES,
      materials: RAINFOREST_ALL_MATERIALS,
      baseMaterials: RAINFOREST_BASE_MATERIALS
    }),
    getRainforestUnlockedMaterials: () =>
      validRainforestMaterialIds(state.rainforest.unlockedMaterials),
    setRainforestUnlockedMaterials: values => {
      state.rainforest.unlockedMaterials =
        validRainforestMaterialIds([
          ...RAINFOREST_BASE_MATERIALS,
          ...(Array.isArray(values) ? values : [])
        ]);
      saveState();
      render();
    },
    isRainforestMaterialUnlocked: materialId =>
      validRainforestMaterialIds(
        state.rainforest.unlockedMaterials
      ).includes(String(materialId)),
    isIslandUnlocked,
    getIslandConfig: () => ISLANDS,
    getMaxBuild: () => MAX_BUILD
  };

  rolloverDay();
  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(error => {
        console.warn("离线缓存注册失败：", error);
      });
    });
  }
})();
