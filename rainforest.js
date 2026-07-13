(() => {
  "use strict";

  const bridge = window.StarSproutBridge;
  if (!bridge) return;

  const catalog = bridge.getRainforestCatalog();
  const CATEGORIES = catalog.categories;

  const CATEGORY_DETAILS = {
    river: {
      asset: "assets/rf-river.png",
      size: 300,
      min: 0.45,
      max: 1.65,
      habitat: "水域",
      description: "连接不同方向的河段，组成雨林的淡水生态。"
    },
    lily: {
      asset: "assets/rf-lily.png",
      size: 190,
      min: 0.35,
      max: 1.45,
      habitat: "水域",
      description: "巨大的王莲漂浮在水面，是青蛙休息的平台。"
    },
    tree: {
      assets: ["assets/rf-tree-left.png", "assets/rf-tree-right.png"],
      size: 340,
      min: 0.35,
      max: 1.45,
      habitat: "陆地",
      description: "没有动物背景的纯古树素材。"
    },
    vine: {
      asset: "assets/rf-vine.png",
      size: 145,
      min: 0.35,
      max: 1.65,
      habitat: "树木与陆地",
      description: "藤蔓可以挂在古树旁，增加雨林的层次。"
    },
    rafflesia: {
      asset: "assets/rf-rafflesia.png",
      size: 175,
      min: 0.35,
      max: 1.45,
      habitat: "湿润陆地",
      description: "醒目的大王花适合放在阴凉湿润的地面。"
    },
    rain: {
      asset: "assets/rf-rain.png",
      size: 390,
      min: 0.55,
      max: 1.65,
      habitat: "天空与全景",
      description: "局部雨幕可以营造雨林天气。"
    },
    dew: {
      asset: "assets/rf-dew.png",
      size: 135,
      min: 0.35,
      max: 1.65,
      habitat: "植物表面",
      description: "露水可以放在植物和古树附近。"
    },
    piranha: {
      asset: "assets/rf-piranha.png",
      size: 120,
      min: 0.35,
      max: 1.35,
      habitat: "水域",
      description: "透明背景的纯食人鱼素材。"
    },
    arapaima: {
      asset: "assets/rf-arapaima.png",
      size: 300,
      min: 0.35,
      max: 1.35,
      habitat: "深水区域",
      description: "透明背景的纯巨骨舌鱼素材。"
    },
    animal: {
      assets: [
        "assets/rf-parrot.png",
        "assets/rf-monkey.png",
        "assets/rf-toucan.png",
        "assets/rf-sloth.png",
        "assets/rf-jaguar.png",
        "assets/rf-frog-green.png",
        "assets/rf-frog-blue.png",
        "assets/rf-capybara.png",
        "assets/rf-butterfly.png",
        null,
        null,
        null
      ],
      emojis: ["🦜", "🐒", "🐦", "🦥", "🐆", "🐸", "🐸", "🐹", "🦋", "🐊", "🦎", "🪲"],
      size: 120,
      min: 0.35,
      max: 1.45,
      habitat: "陆地、树木或水边",
      description: "透明背景的独立雨林动物素材。"
    },
    soil: {
      asset: "assets/rf-soil.png",
      size: 230,
      min: 0.4,
      max: 1.75,
      habitat: "陆地底层",
      description: "湿泥、苔藓和积水地块可以铺在植物下方。"
    },
    plant: {
      asset: "assets/rf-plant.png",
      size: 145,
      min: 0.3,
      max: 1.65,
      habitat: "陆地与水边",
      description: "蕨类、灌木、苔藓和花草组成雨林下层。"
    }
  };

  const VARIANTS = [];
  const VARIANT_MAP = {};

  Object.entries(CATEGORIES).forEach(([category, config]) => {
    const details = CATEGORY_DETAILS[category];

    config.names.forEach((name, index) => {
      const variant = {
        id: `${category}-${index + 1}`,
        category,
        categoryLabel: config.label,
        categoryIcon: config.icon,
        name,
        asset:
          details.assets?.[index] ||
          details.assets?.[index % (details.assets?.length || 1)] ||
          details.asset ||
          null,
        emoji: details.emojis?.[index] || config.icon,
        size: details.size,
        min: details.min,
        max: details.max,
        habitat: details.habitat,
        description: details.description,
        rotation: ((index % 5) - 2) * 7,
        flip: index % 3 === 2 ? -1 : 1,
        hue:
          category === "plant"
            ? ((index % 6) - 3) * 7
            : category === "river"
              ? ((index % 4) - 2) * 4
              : 0
      };

      VARIANTS.push(variant);
      VARIANT_MAP[variant.id] = variant;
    });
  });

  const BASE_Z = {
    soil: 2,
    river: 4,
    lily: 9,
    piranha: 10,
    arapaima: 11,
    plant: 18,
    rafflesia: 20,
    tree: 24,
    vine: 28,
    animal: 32,
    dew: 40,
    rain: 45
  };

  const STARTER = [
    { variantId: "river-1", x: 50, y: 67, scale: 1.0, rotation: 0, z: 4 },
    { variantId: "tree-1", x: 24, y: 50, scale: 0.72, rotation: -3, z: 24 },
    { variantId: "lily-1", x: 51, y: 65, scale: 0.68, rotation: 0, z: 9 },
    { variantId: "arapaima-1", x: 55, y: 77, scale: 0.62, rotation: 0, z: 12 },
    { variantId: "rafflesia-1", x: 79, y: 73, scale: 0.55, rotation: 0, z: 22 },
    { variantId: "animal-1", x: 25, y: 73, scale: 0.52, rotation: 0, z: 34 }
  ];

  const $ = selector => document.querySelector(selector);

  const world = $("#rainforestWorld");
  const itemsLayer = $("#rfItemsLayer");
  const selectionToolbar = $("#rfSelectionToolbar");
  const categoryRow = $("#rfCategoryRow");
  const variantRow = $("#rfVariantRow");

  let activeCategory = "river";
  let selectedId = null;
  let dragging = null;
  let undoStack = [];
  let redoStack = [];
  let saveTimer = null;

  function appState() {
    return bridge.getState();
  }

  function rainforestState() {
    return appState().rainforest;
  }

  function makeId() {
    return (
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  }

  function unlockedIds() {
    return new Set(bridge.getRainforestUnlockedMaterials());
  }

  function isUnlocked(variantId) {
    return bridge.isRainforestMaterialUnlocked(variantId);
  }

  function cloneItems(items = rainforestState().items) {
    return JSON.parse(JSON.stringify(items));
  }

  function snapshot() {
    return JSON.stringify(rainforestState().items);
  }

  function recordHistory() {
    undoStack.push(snapshot());
    if (undoStack.length > 30) undoStack.shift();
    redoStack = [];
    updateUndoButtons();
  }

  function updateUndoButtons() {
    $("#rfUndoBtn").disabled = undoStack.length === 0;
    $("#rfRedoBtn").disabled = redoStack.length === 0;
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => bridge.saveState(), 220);
  }

  function selectedItem() {
    return (
      rainforestState().items.find(item => item.id === selectedId) || null
    );
  }

  function selectedVariant() {
    const item = selectedItem();
    return item ? VARIANT_MAP[item.variantId] : null;
  }

  function countCategoryUnlocked(category) {
    const unlocked = unlockedIds();
    return VARIANTS.filter(
      variant =>
        variant.category === category && unlocked.has(variant.id)
    ).length;
  }

  function renderLibrary() {
    const unlocked = unlockedIds();

    categoryRow.innerHTML = Object.entries(CATEGORIES).map(
      ([category, config]) => {
        const count = countCategoryUnlocked(category);

        return `
          <button
            class="rf-category-chip ${category === activeCategory ? "active" : ""}"
            data-rf-category="${category}"
            type="button"
          >
            <span>${config.icon}</span>
            <strong>${config.label}</strong>
            <small>${count}/${config.count}</small>
          </button>
        `;
      }
    ).join("");

    const activeVariants = VARIANTS.filter(
      variant => variant.category === activeCategory
    );

    variantRow.innerHTML = activeVariants.map(variant => {
      const available = unlocked.has(variant.id);

      return `
        <button
          class="rf-material-card ${available ? "" : "locked"}"
          data-rf-variant="${variant.id}"
          type="button"
          aria-disabled="${available ? "false" : "true"}"
          title="${available ? `添加${variant.name}` : "尚未随机解锁"}"
        >
          <span class="rf-material-picture">
            ${
              variant.asset
                ? `<img src="${variant.asset}" alt="">`
                : `<span class="rf-material-emoji">${variant.emoji}</span>`
            }
          </span>
          <strong>${variant.name}</strong>
          <small>${available ? "点击添加" : "🔒 等待随机解锁"}</small>
        </button>
      `;
    }).join("");

    const unlockedTotal = unlocked.size;
    $("#rfLibraryUnlockedTotal").textContent =
      `${unlockedTotal} / ${VARIANTS.length}`;
    $("#rfLibraryProgressBar").style.width =
      `${Math.round(unlockedTotal / VARIANTS.length * 100)}%`;
  }

  function renderProgress() {
    const unlocked = unlockedIds();
    const total = unlocked.size;

    $("#rfProgressTotal").textContent = `${total} / ${VARIANTS.length}`;
    $("#rfProgressBar").style.width =
      `${Math.round(total / VARIANTS.length * 100)}%`;
    $("#rfProgressTip").textContent =
      total >= VARIANTS.length
        ? "全部素材已经解锁，已解锁素材可无限重复使用。"
        : `还剩 ${VARIANTS.length - total} 种素材。完成任意任务会随机解锁其中一种。`;

    $("#rfCategoryProgress").innerHTML = Object.entries(CATEGORIES).map(
      ([category, config]) => {
        const count = countCategoryUnlocked(category);
        const percent = Math.round(count / config.count * 100);

        return `
          <div class="rf-progress-card">
            <span class="rf-progress-icon">${config.icon}</span>
            <div>
              <strong>${config.label}</strong>
              <span>${count} / ${config.count}</span>
              <div class="rf-mini-progress">
                <span style="width:${percent}%"></span>
              </div>
            </div>
          </div>
        `;
      }
    ).join("");
  }

  function renderItems() {
    const ordered = cloneItems().sort(
      (a, b) => (a.z || 0) - (b.z || 0)
    );

    itemsLayer.innerHTML = ordered.map(item => {
      const variant = VARIANT_MAP[item.variantId];
      if (!variant) return "";

      const visual = variant.asset
        ? `<img src="${variant.asset}" alt="${variant.name}" draggable="false">`
        : `<span class="rf-world-emoji">${variant.emoji}</span>`;

      return `
        <div
          class="rf-world-item rf-world-${variant.category} ${item.id === selectedId ? "selected" : ""}"
          data-rf-item="${item.id}"
          role="button"
          tabindex="0"
          aria-label="${variant.name}"
          style="
            left:${item.x}%;
            top:${item.y}%;
            width:${variant.size}px;
            z-index:${item.z || BASE_Z[variant.category] || 10};
            --rf-scale:${item.scale};
            --rf-rotation:${item.rotation}deg;
            --rf-flip:${item.flip ?? variant.flip};
            --rf-hue:${variant.hue}deg;
          "
        >
          ${visual}
        </div>
      `;
    }).join("");

    renderSelectionToolbar();
  }

  function renderSelectionToolbar() {
    const item = selectedItem();
    const variant = selectedVariant();

    if (!item || !variant) {
      selectionToolbar.hidden = true;
      return;
    }

    selectionToolbar.hidden = false;
    $("#rfToolbarName").textContent = variant.name;
  }

  function render() {
    if (appState().currentIsland !== "rainforest") return;

    renderItems();
    renderLibrary();
    renderProgress();
    updateUndoButtons();

    const total = unlockedIds().size;
    $("#rfUnlockedBadge").textContent = `${total} / ${VARIANTS.length}`;
  }

  function defaultPosition(category) {
    if (["river", "lily", "piranha", "arapaima"].includes(category)) {
      return {
        x: 44 + Math.random() * 16,
        y: 57 + Math.random() * 18
      };
    }

    if (["rain", "dew"].includes(category)) {
      return {
        x: 34 + Math.random() * 32,
        y: 31 + Math.random() * 28
      };
    }

    return {
      x: 24 + Math.random() * 52,
      y: 46 + Math.random() * 31
    };
  }

  function nextZ(category) {
    return (
      rainforestState().items.reduce(
        (maximum, item) => Math.max(maximum, Number(item.z) || 0),
        BASE_Z[category] || 10
      ) + 1
    );
  }

  function addVariant(variantId) {
    const variant = VARIANT_MAP[variantId];
    if (!variant) return;

    if (!isUnlocked(variantId)) {
      bridge.showToast("这个素材还没有随机解锁");
      return;
    }

    if (rainforestState().items.length >= 100) {
      bridge.showToast("雨林岛最多放置 100 个可编辑物品");
      return;
    }

    recordHistory();

    const position = defaultPosition(variant.category);
    const item = {
      id: makeId(),
      variantId,
      category: variant.category,
      x: position.x,
      y: position.y,
      scale: variant.category === "tree" ? 0.62 : 0.78,
      rotation: variant.rotation,
      z: nextZ(variant.category),
      flip: variant.flip
    };

    rainforestState().items.push(item);
    selectedId = item.id;
    saveSoon();
    render();
    bridge.closeAllModals();
    bridge.showToast(`已添加：${variant.name}`);
  }

  function constrain(variant, x, y) {
    if (
      ["river", "lily", "piranha", "arapaima"].includes(
        variant.category
      )
    ) {
      return {
        x: Math.min(79, Math.max(22, x)),
        y: Math.min(87, Math.max(43, y))
      };
    }

    if (["rain", "dew"].includes(variant.category)) {
      return {
        x: Math.min(92, Math.max(8, x)),
        y: Math.min(82, Math.max(10, y))
      };
    }

    return {
      x: Math.min(93, Math.max(7, x)),
      y: Math.min(89, Math.max(23, y))
    };
  }

  function performAction(action) {
    const item = selectedItem();
    const variant = selectedVariant();
    if (!item || !variant) return;

    if (action === "delete") {
      recordHistory();
      rainforestState().items = rainforestState().items.filter(
        entry => entry.id !== item.id
      );
      selectedId = null;
      saveSoon();
      render();
      return;
    }

    if (action === "duplicate") {
      if (rainforestState().items.length >= 100) {
        bridge.showToast("雨林岛最多放置 100 个可编辑物品");
        return;
      }

      recordHistory();
      const duplicate = {
        ...JSON.parse(JSON.stringify(item)),
        id: makeId(),
        x: Math.min(90, item.x + 5),
        y: Math.min(86, item.y + 5),
        z: nextZ(variant.category)
      };

      rainforestState().items.push(duplicate);
      selectedId = duplicate.id;
      saveSoon();
      render();
      return;
    }

    recordHistory();

    if (action === "grow") {
      item.scale = Math.min(variant.max, item.scale + 0.1);
    }
    if (action === "shrink") {
      item.scale = Math.max(variant.min, item.scale - 0.1);
    }
    if (action === "rotate-left") item.rotation -= 15;
    if (action === "rotate-right") item.rotation += 15;
    if (action === "front") item.z = nextZ(variant.category);
    if (action === "back") {
      item.z = Math.max(1, (Number(item.z) || 1) - 1);
    }

    saveSoon();
    render();
  }

  function beginDrag(event, element) {
    const item = rainforestState().items.find(
      entry => entry.id === element.dataset.rfItem
    );
    if (!item) return;

    const variant = VARIANT_MAP[item.variantId];
    if (!variant) return;

    event.preventDefault();
    event.stopPropagation();

    selectedId = item.id;
    recordHistory();

    dragging = {
      pointerId: event.pointerId,
      item,
      variant,
      startX: item.x,
      startY: item.y,
      clientX: event.clientX,
      clientY: event.clientY,
      rect: world.getBoundingClientRect()
    };

    element.setPointerCapture?.(event.pointerId);
    renderSelectionToolbar();
  }

  function moveDrag(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;

    event.preventDefault();

    const x =
      dragging.startX +
      (event.clientX - dragging.clientX) /
        dragging.rect.width *
        100;
    const y =
      dragging.startY +
      (event.clientY - dragging.clientY) /
        dragging.rect.height *
        100;

    const position = constrain(dragging.variant, x, y);
    dragging.item.x = position.x;
    dragging.item.y = position.y;

    const element = itemsLayer.querySelector(
      `[data-rf-item="${dragging.item.id}"]`
    );

    if (element) {
      element.style.left = `${position.x}%`;
      element.style.top = `${position.y}%`;
    }
  }

  function endDrag(event) {
    if (!dragging || event.pointerId !== dragging.pointerId) return;

    dragging = null;
    saveSoon();
    render();
  }

  function undo() {
    if (!undoStack.length) return;

    redoStack.push(snapshot());
    rainforestState().items = JSON.parse(undoStack.pop());
    selectedId = null;
    bridge.saveState();
    render();
  }

  function redo() {
    if (!redoStack.length) return;

    undoStack.push(snapshot());
    rainforestState().items = JSON.parse(redoStack.pop());
    selectedId = null;
    bridge.saveState();
    render();
  }

  function clearAll() {
    rainforestState().items = [];
    rainforestState().initialized = true;
    rainforestState().layoutVersion = 2;
    selectedId = null;
    undoStack = [];
    redoStack = [];
    bridge.saveState();
    render();
    bridge.showToast("雨林岛已摆放的素材已清空");
  }

  function restoreStarter() {
    recordHistory();
    rainforestState().items = STARTER.map(seed => ({
      id: makeId(),
      ...seed
    }));
    selectedId = null;
    bridge.saveState();
    render();
    bridge.showToast("雨林岛示例布局已载入");
  }

  function openLibrary() {
    renderLibrary();
    bridge.openModal("rfLibraryModal");
  }

  function openProgress() {
    renderProgress();
    bridge.openModal("rainforestProgressModal");
  }

  categoryRow.addEventListener("click", event => {
    const button = event.target.closest("[data-rf-category]");
    if (!button) return;

    activeCategory = button.dataset.rfCategory;
    renderLibrary();
  });

  variantRow.addEventListener("click", event => {
    const button = event.target.closest("[data-rf-variant]");
    if (!button) return;

    addVariant(button.dataset.rfVariant);
  });

  itemsLayer.addEventListener("pointerdown", event => {
    const element = event.target.closest("[data-rf-item]");
    if (element) beginDrag(event, element);
  });

  itemsLayer.addEventListener("click", event => {
    const element = event.target.closest("[data-rf-item]");
    if (!element) return;

    selectedId = element.dataset.rfItem;
    render();
  });

  itemsLayer.addEventListener("keydown", event => {
    const element = event.target.closest("[data-rf-item]");
    if (!element || !["Enter", " "].includes(event.key)) return;

    event.preventDefault();
    selectedId = element.dataset.rfItem;
    render();
  });

  world.addEventListener("pointermove", moveDrag);
  world.addEventListener("pointerup", endDrag);
  world.addEventListener("pointercancel", endDrag);
  world.addEventListener("click", event => {
    if (
      event.target.closest(
        "[data-rf-item], .rainforest-edit-toolbar, .rainforest-stage-actions"
      )
    ) {
      return;
    }

    selectedId = null;
    render();
  });

  selectionToolbar.addEventListener("click", event => {
    const button = event.target.closest("[data-rf-action]");
    if (button) performAction(button.dataset.rfAction);
  });

  $("#rfUndoBtn").addEventListener("click", undo);
  $("#rfRedoBtn").addEventListener("click", redo);
  $("#rfOpenLibraryBtn").addEventListener("click", openLibrary);
  $("#rfSaveBtn").addEventListener("click", () => {
    bridge.saveState();
    bridge.showToast("雨林岛已保存到这台设备");
  });

  $("#rfProgressOpenLibrary").addEventListener("click", () => {
    bridge.closeAllModals();
    setTimeout(openLibrary, 30);
  });

  $("#rfClearPlacedItems").addEventListener("click", () => {
    if (!window.confirm("确定清空雨林岛上已经摆放的素材吗？")) return;
    clearAll();
    bridge.closeAllModals();
  });

  window.addEventListener("keydown", event => {
    if (appState().currentIsland !== "rainforest") return;

    const command = event.ctrlKey || event.metaKey;

    if (command && event.key.toLowerCase() === "z") {
      event.preventDefault();
      event.shiftKey ? redo() : undo();
    }

    if (command && event.key.toLowerCase() === "s") {
      event.preventDefault();
      bridge.saveState();
      bridge.showToast("雨林岛已保存");
    }

    if (
      (event.key === "Delete" || event.key === "Backspace") &&
      selectedId &&
      !event.target.closest("input, textarea")
    ) {
      event.preventDefault();
      performAction("delete");
    }
  });

  window.RainforestEditor = {
    render,
    openLibrary,
    openProgress,
    restoreStarter,
    clearAll,
    unlockAllMaterials: () => {
      bridge.setRainforestUnlockedMaterials(
        VARIANTS.map(variant => variant.id)
      );
      bridge.showToast("80 种雨林素材已全部解锁");
    },
    resetMaterialUnlocks: () => {
      bridge.setRainforestUnlockedMaterials(catalog.baseMaterials);
      bridge.showToast("素材解锁已重置为每类 1 种基础素材");
    },
    getVariantCount: () => VARIANTS.length
  };

  renderLibrary();
  renderProgress();
})();