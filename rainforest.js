(() => {
  "use strict";

  const bridge = window.StarSproutBridge;
  if (!bridge) {
    console.warn("RainforestEditor：StarSproutBridge 尚未初始化。");
    return;
  }

  const catalog = bridge.getRainforestCatalog();
  const CATEGORIES = catalog.categories;
  const FALLBACK_ICONS = {
    river: "🏞️",
    lily: "🪷",
    tree: "🌳",
    vine: "🌿",
    rafflesia: "🌺",
    rain: "🌧️",
    dew: "💧",
    piranha: "🐟",
    arapaima: "🐠",
    animal: "🐾",
    soil: "🟫",
    plant: "🌱"
  };

  const CATEGORY_DETAILS = {
    river: { size: 300, min: 0.45, max: 1.65, habitat: "水域", description: "不同轮廓的河段可以连接成完整水系。" },
    lily: { size: 190, min: 0.35, max: 1.45, habitat: "水域", description: "大小、花朵和叶片数量各不相同的王莲。" },
    tree: { size: 340, min: 0.35, max: 1.45, habitat: "陆地", description: "板根、树洞、双生和藤蔓等不同结构的古树。" },
    vine: { size: 145, min: 0.35, max: 1.65, habitat: "树木与陆地", description: "长度、走向、粗细和花叶均不同的藤蔓。" },
    rafflesia: { size: 175, min: 0.35, max: 1.45, habitat: "湿润陆地", description: "从花苞到盛开花群的不同生长状态。" },
    rain: { size: 390, min: 0.55, max: 1.65, habitat: "天空与全景", description: "雨量、方向和覆盖范围各不相同的雨幕。" },
    dew: { size: 135, min: 0.35, max: 1.65, habitat: "植物表面", description: "单滴、叶尖、串珠和湿润叶面等露水形态。" },
    piranha: { size: 120, min: 0.35, max: 1.35, habitat: "水域", description: "单鱼、双鱼及不同规模的食人鱼群。" },
    arapaima: { size: 300, min: 0.35, max: 1.35, habitat: "深水区域", description: "幼年、成年与稀有巨型巨骨舌鱼。" },
    animal: { size: 120, min: 0.35, max: 1.45, habitat: "陆地、树木或水边", description: "十二种拥有独立轮廓的雨林动物。" },
    soil: { size: 230, min: 0.4, max: 1.75, habitat: "陆地底层", description: "泥土深浅、苔藓、积水和脚印各不相同。" },
    plant: { size: 145, min: 0.3, max: 1.65, habitat: "陆地与水边", description: "蕨类、芭蕉、棕榈、蘑菇及多种下层植物。" }
  };

  const VARIANTS = [];
  const VARIANT_MAP = Object.create(null);

  Object.entries(CATEGORIES).forEach(([category, config]) => {
    const details = CATEGORY_DETAILS[category];
    if (!details) {
      console.warn(`RainforestEditor：缺少类别配置 ${category}`);
      return;
    }
    if (config.names.length !== config.count) {
      console.warn(`RainforestEditor：${category} 的名称数量与 count 不一致。`);
    }

    config.names.forEach((name, index) => {
      const variant = {
        id: `${category}-${index + 1}`,
        category,
        categoryLabel: config.label,
        categoryIcon: config.icon || FALLBACK_ICONS[category],
        name,
        asset: `assets/rf-v2-${category}-${String(index + 1).padStart(2, "0")}.svg`,
        emoji: FALLBACK_ICONS[category],
        size: details.size,
        min: details.min,
        max: details.max,
        habitat: details.habitat,
        description: details.description,
        rotation: 0,
        flip: 1,
        hue: 0
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
    { variantId: "river-1", x: 50, y: 67, scale: 1.0, rotation: 0, z: 4, flip: 1 },
    { variantId: "tree-1", x: 24, y: 50, scale: 0.72, rotation: -3, z: 24, flip: 1 },
    { variantId: "lily-1", x: 51, y: 65, scale: 0.68, rotation: 0, z: 9, flip: 1 },
    { variantId: "arapaima-1", x: 55, y: 77, scale: 0.62, rotation: 0, z: 12, flip: 1 },
    { variantId: "rafflesia-1", x: 79, y: 73, scale: 0.55, rotation: 0, z: 22, flip: 1 },
    { variantId: "animal-1", x: 25, y: 73, scale: 0.52, rotation: 0, z: 34, flip: 1 }
  ];

  const $ = selector => document.querySelector(selector);
  const world = $("#rainforestWorld");
  const itemsLayer = $("#rfItemsLayer");
  const selectionToolbar = $("#rfSelectionToolbar");
  const categoryRow = $("#rfCategoryRow");
  const variantRow = $("#rfVariantRow");

  if (!world || !itemsLayer || !selectionToolbar || !categoryRow || !variantRow) {
    console.warn("RainforestEditor：雨林页面节点不完整，编辑器未启动。");
    return;
  }

  let activeCategory = "river";
  let selectedId = null;
  let dragging = null;
  let undoStack = [];
  let redoStack = [];
  let saveTimer = null;
  const missingAssets = new Set();

  function injectFixStyles() {
    if (document.getElementById("rf-v135-fix-styles")) return;
    const style = document.createElement("style");
    style.id = "rf-v135-fix-styles";
    style.textContent = `
      .rf-material-picture { position: relative; overflow: hidden; }
      .rf-material-picture img { width: 100%; height: 100%; object-fit: contain; }
      .rf-material-fallback,
      .rf-world-fallback {
        display: none;
        place-items: center;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: clamp(28px, 5vw, 54px);
      }
      .rf-asset-missing > img { display: none !important; }
      .rf-asset-missing > .rf-material-fallback,
      .rf-asset-missing > .rf-world-fallback { display: flex; }
      .rf-world-item img {
        width: 100%;
        height: auto;
        object-fit: contain;
        user-select: none;
        -webkit-user-drag: none;
        pointer-events: none;
      }
      .rf-material-card img { transform: none !important; filter: none !important; }
      .rf-material-card.locked img { filter: grayscale(.55) opacity(.48) !important; }
      .rf-material-card:not(.locked) .rf-material-picture {
        background: radial-gradient(circle at 50% 55%, rgba(242,255,238,.95), rgba(209,239,217,.55));
      }
    `;
    document.head.appendChild(style);
  }

  function appState() {
    return bridge.getState();
  }

  function rainforestState() {
    return appState().rainforest;
  }

  function makeId() {
    return window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function safeNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function unlockedIds() {
    return new Set(bridge.getRainforestUnlockedMaterials());
  }

  function isUnlocked(variantId) {
    return bridge.isRainforestMaterialUnlocked(variantId);
  }

  function cloneItems(items = rainforestState().items) {
    return JSON.parse(JSON.stringify(Array.isArray(items) ? items : []));
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
    const undo = $("#rfUndoBtn");
    const redo = $("#rfRedoBtn");
    if (undo) undo.disabled = undoStack.length === 0;
    if (redo) redo.disabled = redoStack.length === 0;
  }

  function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => bridge.saveState(), 220);
  }

  function selectedItem() {
    return rainforestState().items.find(item => item.id === selectedId) || null;
  }

  function selectedVariant() {
    const item = selectedItem();
    return item ? VARIANT_MAP[item.variantId] : null;
  }

  function countCategoryUnlocked(category) {
    const unlocked = unlockedIds();
    return VARIANTS.filter(variant =>
      variant.category === category && unlocked.has(variant.id)
    ).length;
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll("img[data-rf-image]").forEach(img => {
      const parent = img.parentElement;
      const markMissing = () => {
        missingAssets.add(img.getAttribute("src") || "");
        parent?.classList.add("rf-asset-missing");
        console.warn(`RainforestEditor：图片加载失败 ${img.getAttribute("src")}`);
      };
      img.addEventListener("error", markMissing, { once: true });
      img.addEventListener("load", () => parent?.classList.remove("rf-asset-missing"), { once: true });
      if (img.complete && !img.naturalWidth) markMissing();
    });
  }

  function renderLibrary() {
    const unlocked = unlockedIds();

    categoryRow.innerHTML = Object.entries(CATEGORIES).map(([category, config]) => {
      const count = countCategoryUnlocked(category);
      const icon = config.icon || FALLBACK_ICONS[category];
      return `
        <button
          class="rf-category-chip ${category === activeCategory ? "active" : ""}"
          data-rf-category="${escapeHtml(category)}"
          type="button"
        >
          <span>${escapeHtml(icon)}</span>
          <strong>${escapeHtml(config.label)}</strong>
          <small>${count}/${config.count}</small>
        </button>
      `;
    }).join("");

    const activeVariants = VARIANTS.filter(variant => variant.category === activeCategory);
    variantRow.innerHTML = activeVariants.map(variant => {
      const available = unlocked.has(variant.id);
      return `
        <button
          class="rf-material-card ${available ? "" : "locked"}"
          data-rf-variant="${escapeHtml(variant.id)}"
          type="button"
          aria-disabled="${available ? "false" : "true"}"
          title="${available ? `添加${escapeHtml(variant.name)}` : "尚未随机解锁"}"
        >
          <span class="rf-material-picture">
            <img
              src="${escapeHtml(variant.asset)}"
              alt="${escapeHtml(variant.name)}"
              loading="lazy"
              decoding="async"
              data-rf-image
            >
            <span class="rf-material-fallback" aria-hidden="true">${escapeHtml(variant.emoji)}</span>
          </span>
          <strong>${escapeHtml(variant.name)}</strong>
          <small>${available ? "点击添加" : "完成任务后出现"}</small>
        </button>
      `;
    }).join("");
    attachImageFallbacks(variantRow);

    const unlockedTotal = unlocked.size;
    const totalNode = $("#rfLibraryUnlockedTotal");
    const bar = $("#rfLibraryProgressBar");
    if (totalNode) totalNode.textContent = `${unlockedTotal} / ${VARIANTS.length}`;
    if (bar) bar.style.width = `${Math.round(unlockedTotal / VARIANTS.length * 100)}%`;
  }

  function renderProgress() {
    const unlocked = unlockedIds();
    const total = unlocked.size;
    const progressTotal = $("#rfProgressTotal");
    const progressBar = $("#rfProgressBar");
    const progressTip = $("#rfProgressTip");
    const categoryProgress = $("#rfCategoryProgress");

    if (progressTotal) progressTotal.textContent = `${total} / ${VARIANTS.length}`;
    if (progressBar) progressBar.style.width = `${Math.round(total / VARIANTS.length * 100)}%`;
    if (progressTip) {
      progressTip.textContent = total >= VARIANTS.length
        ? "全部素材已经解锁，已解锁素材可无限重复使用。"
        : `还剩 ${VARIANTS.length - total} 种素材。完成任务会随机解锁其中一种，并直接把完整素材放到岛上。`;
    }

    if (categoryProgress) {
      categoryProgress.innerHTML = Object.entries(CATEGORIES).map(([category, config]) => {
        const count = countCategoryUnlocked(category);
        const percent = Math.round(count / config.count * 100);
        const icon = config.icon || FALLBACK_ICONS[category];
        return `
          <div class="rf-category-progress-item">
            <span class="rf-category-progress-icon">${escapeHtml(icon)}</span>
            <div>
              <strong>${escapeHtml(config.label)} <span>${count} / ${config.count}</span></strong>
              <div class="rf-mini-progress"><span style="width:${percent}%"></span></div>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  function renderItems() {
    const ordered = cloneItems().sort((a, b) =>
      safeNumber(a.z, 0) - safeNumber(b.z, 0)
    );

    itemsLayer.innerHTML = ordered.map(item => {
      const variant = VARIANT_MAP[item.variantId];
      if (!variant) return "";

      const x = safeNumber(item.x, 50);
      const y = safeNumber(item.y, 60);
      const scale = safeNumber(item.scale, 0.78);
      const rotation = safeNumber(item.rotation, variant.rotation);
      const flip = safeNumber(item.flip, variant.flip);
      const z = safeNumber(item.z, BASE_Z[variant.category] || 10);

      return `
        <div
          class="rf-world-item rf-world-${escapeHtml(variant.category)} ${item.id === selectedId ? "selected" : ""}"
          data-rf-item="${escapeHtml(item.id)}"
          role="button"
          tabindex="0"
          aria-label="${escapeHtml(variant.name)}"
          style="
            left:${x}%;
            top:${y}%;
            width:${variant.size}px;
            z-index:${z};
            --rf-scale:${scale};
            --rf-rotation:${rotation}deg;
            --rf-flip:${flip};
            --rf-hue:0deg;
          "
        >
          <img
            src="${escapeHtml(variant.asset)}"
            alt="${escapeHtml(variant.name)}"
            draggable="false"
            decoding="async"
            data-rf-image
          >
          <span class="rf-world-fallback" aria-hidden="true">${escapeHtml(variant.emoji)}</span>
        </div>
      `;
    }).join("");

    attachImageFallbacks(itemsLayer);
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
    const toolbarName = $("#rfToolbarName");
    if (toolbarName) toolbarName.textContent = variant.name;
  }

  function render() {
    if (appState().currentIsland !== "rainforest") return;
    renderItems();
    renderLibrary();
    renderProgress();
    updateUndoButtons();
    const badge = $("#rfUnlockedBadge");
    if (badge) badge.textContent = `${unlockedIds().size} / ${VARIANTS.length}`;
  }

  function defaultPosition(category) {
    if (["river", "lily", "piranha", "arapaima"].includes(category)) {
      return { x: 44 + Math.random() * 16, y: 57 + Math.random() * 18 };
    }
    if (["rain", "dew"].includes(category)) {
      return { x: 34 + Math.random() * 32, y: 31 + Math.random() * 28 };
    }
    return { x: 24 + Math.random() * 52, y: 46 + Math.random() * 31 };
  }

  function nextZ(category) {
    return rainforestState().items.reduce(
      (maximum, item) => Math.max(maximum, safeNumber(item.z, 0)),
      BASE_Z[category] || 10
    ) + 1;
  }

  function newItemForVariant(variant, position) {
    return {
      id: makeId(),
      variantId: variant.id,
      category: variant.category,
      x: position.x,
      y: position.y,
      scale: variant.category === "tree" ? 0.62 : 0.78,
      rotation: variant.rotation,
      z: nextZ(variant.category),
      flip: variant.flip
    };
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
    const item = newItemForVariant(variant, defaultPosition(variant.category));
    rainforestState().items.push(item);
    selectedId = item.id;
    saveSoon();
    render();
    bridge.closeAllModals();
    bridge.showToast(`已添加：${variant.name}`);
  }

  function autoPlaceUnlockedMaterial(variantId) {
    const variant = VARIANT_MAP[variantId];
    if (!variant || rainforestState().items.length >= 100) return false;
    rainforestState().items.push(
      newItemForVariant(variant, defaultPosition(variant.category))
    );
    selectedId = null;
    return true;
  }

  function constrain(variant, x, y) {
    if (["river", "lily", "piranha", "arapaima"].includes(variant.category)) {
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
      rainforestState().items = rainforestState().items.filter(entry => entry.id !== item.id);
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
        x: Math.min(90, safeNumber(item.x, 50) + 5),
        y: Math.min(86, safeNumber(item.y, 60) + 5),
        z: nextZ(variant.category)
      };
      rainforestState().items.push(duplicate);
      selectedId = duplicate.id;
      saveSoon();
      render();
      return;
    }

    recordHistory();
    const currentScale = safeNumber(item.scale, 0.78);
    if (action === "grow") item.scale = Math.min(variant.max, currentScale + 0.1);
    if (action === "shrink") item.scale = Math.max(variant.min, currentScale - 0.1);
    if (action === "rotate-left") item.rotation = safeNumber(item.rotation, 0) - 15;
    if (action === "rotate-right") item.rotation = safeNumber(item.rotation, 0) + 15;
    if (action === "front") item.z = nextZ(variant.category);
    if (action === "back") item.z = Math.max(1, safeNumber(item.z, 1) - 1);
    saveSoon();
    render();
  }

  function beginDrag(event, element) {
    const item = rainforestState().items.find(entry => entry.id === element.dataset.rfItem);
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
      startX: safeNumber(item.x, 50),
      startY: safeNumber(item.y, 60),
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

    const x = dragging.startX +
      (event.clientX - dragging.clientX) / dragging.rect.width * 100;
    const y = dragging.startY +
      (event.clientY - dragging.clientY) / dragging.rect.height * 100;
    const position = constrain(dragging.variant, x, y);
    dragging.item.x = position.x;
    dragging.item.y = position.y;

    const element = itemsLayer.querySelector(`[data-rf-item="${CSS.escape(dragging.item.id)}"]`);
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
    rainforestState().items = STARTER.map(seed => ({ id: makeId(), ...seed }));
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

  function validateAssets() {
    return Promise.all(VARIANTS.map(variant => new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve({ asset: variant.asset, ok: true });
      image.onerror = () => {
        missingAssets.add(variant.asset);
        resolve({ asset: variant.asset, ok: false });
      };
      image.src = variant.asset;
    }))).then(results => {
      const failed = results.filter(result => !result.ok);
      if (failed.length) {
        console.warn("RainforestEditor：素材预检发现缺图", failed);
      }
      return failed;
    });
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
    if (event.target.closest("[data-rf-item], .rainforest-edit-toolbar, .rainforest-stage-actions")) {
      return;
    }
    selectedId = null;
    render();
  });

  selectionToolbar.addEventListener("click", event => {
    const button = event.target.closest("[data-rf-action]");
    if (button) performAction(button.dataset.rfAction);
  });

  $("#rfUndoBtn")?.addEventListener("click", undo);
  $("#rfRedoBtn")?.addEventListener("click", redo);
  $("#rfOpenLibraryBtn")?.addEventListener("click", openLibrary);
  $("#rfSaveBtn")?.addEventListener("click", () => {
    bridge.saveState();
    bridge.showToast("雨林岛已保存到这台设备");
  });
  $("#rfProgressOpenLibrary")?.addEventListener("click", () => {
    bridge.closeAllModals();
    setTimeout(openLibrary, 30);
  });
  $("#rfClearPlacedItems")?.addEventListener("click", () => {
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

  injectFixStyles();

  window.RainforestEditor = {
    autoPlaceUnlockedMaterial,
    render,
    openLibrary,
    openProgress,
    restoreStarter,
    clearAll,
    validateAssets,
    getMissingAssets: () => [...missingAssets],
    getAssetManifest: () => VARIANTS.map(variant => ({ ...variant })),
    unlockAllMaterials: () => {
      bridge.setRainforestUnlockedMaterials(VARIANTS.map(variant => variant.id));
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

  const scheduleValidation = () => validateAssets();
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(scheduleValidation, { timeout: 5000 });
  } else {
    setTimeout(scheduleValidation, 1500);
  }
})();
