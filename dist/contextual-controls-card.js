const CARD_TAG = "contextual-controls-card";
const LEARNING_CARD_TAG = "contextual-controls-learning-card";

const TEXT = {
  en: {
    name: "Contextual Controls",
    description: "Shows the controls suggested by Contextual Controls.",
    defaultTitle: "For you now",
    morning: "Good morning",
    afternoon: "For you now",
    evening: "This evening",
    night: "Before sleep",
    empty: "No suggestions yet",
    missing: "Select a Contextual Controls sensor",
    updated: "Updated",
    sensor: "Sensor",
    title: "Title",
    maxControls: "Maximum controls",
    columns: "Desktop columns",
    mobileColumns: "Mobile columns",
    showState: "Show state",
    showReason: "Show reason",
    showScore: "Show score",
    showLastUpdate: "Show last update",
    hideEmpty: "Hide when empty",
    showPinned: "Show pinned controls",
    dynamicTitle: "Dynamic title",
    tapAction: "Tap action",
    automatic: "Automatic",
    toggle: "Toggle",
    moreInfo: "More info",
    layout: "Layout",
    tiles: "Tiles",
    compact: "Compact",
    chips: "Chips",
    icons: "Icons",
    entityIcons: "Entity icons",
    nativeIcons: "Domain icons",
    learningName: "Contextual Controls Learning",
    learningDescription: "Shows how adaptive suggestions are learning locally.",
    learningTitle: "Adaptive learning",
    learningSensor: "Learning sensor",
    confidence: "Confidence",
    top1: "Top-1 hit rate",
    top3: "Top-3 hit rate",
    acceptedRate: "Accepted",
    comparison: "Base vs adaptive",
    baseRanking: "Base ranking",
    adaptiveRanking: "Adaptive ranking",
    transitions: "Frequent transitions",
    sequences: "Frequent sequences",
    feedback: "Suggestion feedback",
    occurrences: "occurrences",
    averageDelay: "average delay",
    noLearningData: "Learning data will appear after repeated actions and suggestions.",
    enableLearningSensor: "Enable the Contextual Controls Learning diagnostic sensor first.",
    maxPatterns: "Maximum patterns",
    showComparison: "Show ranking comparison",
    showTransitions: "Show transitions",
    showSequences: "Show sequences",
    showFeedback: "Show suggestion feedback",
  },
  it: {
    name: "Contextual Controls",
    description: "Mostra i controlli suggeriti da Contextual Controls.",
    defaultTitle: "Per te adesso",
    morning: "Buongiorno",
    afternoon: "Per te adesso",
    evening: "Questa sera",
    night: "Prima di dormire",
    empty: "Nessun suggerimento per ora",
    missing: "Seleziona un sensore Contextual Controls",
    updated: "Aggiornato",
    sensor: "Sensore",
    title: "Titolo",
    maxControls: "Numero massimo di controlli",
    columns: "Colonne desktop",
    mobileColumns: "Colonne mobile",
    showState: "Mostra stato",
    showReason: "Mostra motivo",
    showScore: "Mostra punteggio",
    showLastUpdate: "Mostra ultimo aggiornamento",
    hideEmpty: "Nascondi se vuoto",
    showPinned: "Mostra controlli fissi",
    dynamicTitle: "Titolo dinamico",
    tapAction: "Azione al tocco",
    automatic: "Automatica",
    toggle: "Toggle",
    moreInfo: "Più informazioni",
    layout: "Layout",
    tiles: "Tiles",
    compact: "Compatto",
    chips: "Chips",
    icons: "Icone",
    entityIcons: "Icone delle entità",
    nativeIcons: "Icone del dominio",
    learningName: "Apprendimento Contextual Controls",
    learningDescription: "Mostra come i suggerimenti adattivi imparano in locale.",
    learningTitle: "Apprendimento adattivo",
    learningSensor: "Sensore apprendimento",
    confidence: "Confidenza",
    top1: "Precisione Top-1",
    top3: "Precisione Top-3",
    acceptedRate: "Accettati",
    comparison: "Base e adattivo",
    baseRanking: "Ranking base",
    adaptiveRanking: "Ranking adattivo",
    transitions: "Transizioni frequenti",
    sequences: "Sequenze frequenti",
    feedback: "Utilità dei suggerimenti",
    occurrences: "occorrenze",
    averageDelay: "ritardo medio",
    noLearningData: "I dati compariranno dopo azioni e suggerimenti ripetuti.",
    enableLearningSensor: "Abilita prima il sensore diagnostico Contextual Controls Learning.",
    maxPatterns: "Numero massimo di pattern",
    showComparison: "Mostra confronto ranking",
    showTransitions: "Mostra transizioni",
    showSequences: "Mostra sequenze",
    showFeedback: "Mostra utilità suggerimenti",
  },
};

const TOGGLE_DOMAINS = new Set(["light", "switch", "fan", "input_boolean"]);
const MORE_INFO_DOMAINS = new Set([
  "alarm_control_panel",
  "climate",
  "cover",
  "lock",
  "media_player",
  "number",
  "select",
  "siren",
  "vacuum",
]);

function language() {
  return (navigator.language || "en").toLowerCase().startsWith("it") ? "it" : "en";
}

function t(key) {
  return TEXT[language()][key] || TEXT.en[key] || key;
}

function bool(config, key, fallback) {
  return config[key] === undefined ? fallback : Boolean(config[key]);
}

function domainOf(entityId) {
  return String(entityId || "").split(".", 1)[0];
}

function automaticAction(entityId) {
  const domain = domainOf(entityId);
  if (TOGGLE_DOMAINS.has(domain)) return { domain: "homeassistant", service: "toggle" };
  if (domain === "scene") return { domain: "scene", service: "turn_on" };
  if (domain === "script") return { domain: "script", service: "turn_on" };
  if (domain === "button") return { domain: "button", service: "press" };
  if (MORE_INFO_DOMAINS.has(domain)) return null;
  return null;
}

function defaultIcon(entityId) {
  const icons = {
    button: "mdi:gesture-tap-button",
    climate: "mdi:thermostat",
    cover: "mdi:window-shutter",
    fan: "mdi:fan",
    input_boolean: "mdi:toggle-switch",
    light: "mdi:lightbulb",
    lock: "mdi:lock",
    media_player: "mdi:cast",
    number: "mdi:numeric",
    scene: "mdi:palette",
    script: "mdi:script-text-play",
    select: "mdi:form-dropdown",
    switch: "mdi:toggle-switch",
    vacuum: "mdi:robot-vacuum",
  };
  return icons[domainOf(entityId)] || "mdi:gesture-tap-button";
}

function dynamicTitle(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 11) return t("morning");
  if (hour >= 11 && hour < 17) return t("afternoon");
  if (hour >= 17 && hour < 22) return t("evening");
  return t("night");
}

function clampRate(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(1, number)) : 0;
}

function rateLabel(value) {
  return `${Math.round(clampRate(value) * 100)}%`;
}

function delayLabel(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  if (value < 60) return `${Math.round(value)}s`;
  if (value < 3600) return `${Math.round(value / 60)}m`;
  return `${Math.round(value / 360) / 10}h`;
}

function fireMoreInfo(element, entityId) {
  element.dispatchEvent(
    new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }),
  );
}

class ContextualControlsCard extends HTMLElement {
  static getStubConfig() {
    return {
      sensor: "sensor.contextual_controls",
      title: t("defaultTitle"),
      columns: 3,
      mobile_columns: 2,
      show_state: true,
      show_reason: false,
      show_score: false,
      show_last_update: false,
      hide_empty: true,
      show_pinned: true,
      dynamic_title: false,
      tap_action: "automatic",
      layout: "tiles",
      icons: "entity",
    };
  }

  static getConfigForm() {
    const labels = {
      sensor: "sensor",
      title: "title",
      max_controls: "maxControls",
      columns: "columns",
      mobile_columns: "mobileColumns",
      show_state: "showState",
      show_reason: "showReason",
      show_score: "showScore",
      show_last_update: "showLastUpdate",
      hide_empty: "hideEmpty",
      show_pinned: "showPinned",
      dynamic_title: "dynamicTitle",
      tap_action: "tapAction",
      layout: "layout",
      icons: "icons",
    };
    return {
      schema: [
        {
          name: "sensor",
          required: true,
          selector: { entity: { filter: { domain: "sensor" } } },
        },
        { name: "title", selector: { text: {} } },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            {
              name: "layout",
              selector: {
                select: {
                  options: [
                    { value: "tiles", label: t("tiles") },
                    { value: "compact", label: t("compact") },
                    { value: "chips", label: t("chips") },
                  ],
                },
              },
            },
            {
              name: "icons",
              selector: {
                select: {
                  options: [
                    { value: "entity", label: t("entityIcons") },
                    { value: "native", label: t("nativeIcons") },
                  ],
                },
              },
            },
          ],
        },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            { name: "max_controls", selector: { number: { min: 1, max: 12, mode: "box" } } },
            { name: "columns", selector: { number: { min: 1, max: 6, mode: "box" } } },
            {
              name: "mobile_columns",
              selector: { number: { min: 1, max: 3, mode: "box" } },
            },
          ],
        },
        {
          name: "tap_action",
          selector: {
            select: {
              options: [
                { value: "automatic", label: t("automatic") },
                { value: "toggle", label: t("toggle") },
                { value: "more-info", label: t("moreInfo") },
              ],
            },
          },
        },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            { name: "show_state", selector: { boolean: {} } },
            { name: "show_reason", selector: { boolean: {} } },
            { name: "show_score", selector: { boolean: {} } },
            { name: "show_last_update", selector: { boolean: {} } },
            { name: "hide_empty", selector: { boolean: {} } },
            { name: "show_pinned", selector: { boolean: {} } },
            { name: "dynamic_title", selector: { boolean: {} } },
          ],
        },
      ],
      computeLabel: (schema) => t(labels[schema.name] || schema.name),
      assertConfig: (config) => {
        if (!config.sensor || typeof config.sensor !== "string") {
          throw new Error(t("missing"));
        }
      },
    };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error(t("missing"));
    this._config = { ...ContextualControlsCard.getStubConfig(), ...config };
    this._signature = undefined;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const sensor = hass?.states?.[this._config?.sensor];
    const rows = Array.isArray(sensor?.attributes?.entities) ? sensor.attributes.entities : [];
    const visible = rows.filter((row) => bool(this._config, "show_pinned", true) || !row.pinned);
    const states = visible.map((row) => {
      const state = hass.states[row.entity_id];
      return [row.entity_id, state?.state, state?.attributes?.friendly_name, state?.attributes?.icon];
    });
    const signature = JSON.stringify([
      sensor?.state,
      sensor?.attributes?.last_update,
      visible,
      states,
      this._config,
    ]);
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    const count = this._visibleRows().length;
    const columns = Math.max(1, Number(this._config?.columns) || 3);
    return Math.max(1, Math.ceil(count / columns) * 2 + 1);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, min_rows: 2 };
  }

  _visibleRows() {
    const sensor = this._hass?.states?.[this._config?.sensor];
    const rows = Array.isArray(sensor?.attributes?.entities) ? sensor.attributes.entities : [];
    const filtered = rows.filter(
      (row) => bool(this._config, "show_pinned", true) || !Boolean(row.pinned),
    );
    const limit = Math.min(12, Math.max(1, Number(this._config?.max_controls) || 12));
    return filtered.slice(0, limit);
  }

  _title() {
    if (bool(this._config, "dynamic_title", false)) return dynamicTitle();
    return this._config?.title ?? t("defaultTitle");
  }

  _render() {
    if (!this._config) return;
    const sensor = this._hass?.states?.[this._config.sensor];
    const rows = this._visibleRows();
    if (sensor && rows.length === 0 && bool(this._config, "hide_empty", true)) {
      this.replaceChildren();
      return;
    }

    const card = document.createElement("ha-card");
    const layout = ["tiles", "compact", "chips"].includes(this._config.layout)
      ? this._config.layout
      : "tiles";
    card.className = `cc-card cc-layout-${layout}`;
    card.style.setProperty("--cc-columns", String(this._config.columns || 3));
    card.style.setProperty("--cc-mobile-columns", String(this._config.mobile_columns || 2));

    const style = document.createElement("style");
    style.textContent = `
      .cc-card { padding: 16px; }
      .cc-header { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:0 0 14px; }
      .cc-title { color:var(--primary-text-color); font-size:20px; font-weight:500; line-height:1.25; }
      .cc-updated { color:var(--secondary-text-color); font-size:12px; white-space:nowrap; }
      .cc-grid { display:grid; grid-template-columns:repeat(var(--cc-columns), minmax(0, 1fr)); gap:10px; }
      .cc-tile { appearance:none; box-sizing:border-box; min-width:0; min-height:88px; padding:12px; border:0;
        border-radius:var(--ha-card-border-radius, 12px); color:var(--primary-text-color);
        background:var(--secondary-background-color); font:inherit; text-align:left; cursor:pointer;
        display:grid; grid-template-columns:38px minmax(0,1fr); column-gap:10px; align-items:center;
        transition:background-color .15s ease, transform .08s ease; }
      .cc-tile:hover { background:color-mix(in srgb, var(--secondary-background-color) 88%, var(--primary-color)); }
      .cc-tile:active { transform:scale(.985); }
      .cc-icon { width:38px; height:38px; border-radius:50%; display:grid; place-items:center;
        background:color-mix(in srgb, var(--primary-color) 16%, transparent); color:var(--primary-color); }
      .cc-icon ha-icon { --mdc-icon-size:22px; }
      .cc-copy { min-width:0; }
      .cc-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; line-height:1.3; }
      .cc-state, .cc-reason, .cc-score { overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        color:var(--secondary-text-color); font-size:12px; line-height:1.35; }
      .cc-reason { margin-top:3px; white-space:normal; display:-webkit-box; -webkit-line-clamp:2;
        -webkit-box-orient:vertical; }
      .cc-empty, .cc-missing { color:var(--secondary-text-color); padding:8px 0 2px; }
      .cc-layout-compact .cc-grid { display:flex; flex-direction:column; gap:6px; }
      .cc-layout-compact .cc-tile { min-height:58px; padding:8px 12px; grid-template-columns:34px minmax(0,1fr); }
      .cc-layout-compact .cc-icon { width:32px; height:32px; }
      .cc-layout-chips .cc-grid { display:flex; flex-wrap:wrap; gap:8px; }
      .cc-layout-chips .cc-tile { width:auto; min-height:40px; padding:7px 11px; border-radius:999px;
        grid-template-columns:24px max-content; column-gap:7px; }
      .cc-layout-chips .cc-icon { width:24px; height:24px; background:transparent; }
      .cc-layout-chips .cc-icon ha-icon { --mdc-icon-size:20px; }
      .cc-layout-chips .cc-copy { max-width:180px; }
      .cc-layout-chips .cc-state, .cc-layout-chips .cc-reason, .cc-layout-chips .cc-score { display:none; }
      @media (max-width:600px) {
        .cc-card { padding:14px; }
        .cc-grid { grid-template-columns:repeat(var(--cc-mobile-columns), minmax(0, 1fr)); gap:8px; }
        .cc-tile { min-height:82px; padding:10px; grid-template-columns:34px minmax(0,1fr); column-gap:8px; }
        .cc-icon { width:34px; height:34px; }
      }
    `;
    card.append(style);

    const title = this._title();
    if (title || bool(this._config, "show_last_update", false)) {
      const header = document.createElement("div");
      header.className = "cc-header";
      const heading = document.createElement("div");
      heading.className = "cc-title";
      heading.textContent = title;
      header.append(heading);
      const updated = sensor?.attributes?.last_update;
      if (updated && bool(this._config, "show_last_update", false)) {
        const timestamp = document.createElement("div");
        timestamp.className = "cc-updated";
        timestamp.textContent = `${t("updated")} ${new Intl.DateTimeFormat(language(), {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(updated))}`;
        header.append(timestamp);
      }
      card.append(header);
    }

    if (!sensor) {
      const missing = document.createElement("div");
      missing.className = "cc-missing";
      missing.textContent = t("missing");
      card.append(missing);
    } else if (rows.length === 0) {
      const empty = document.createElement("div");
      empty.className = "cc-empty";
      empty.textContent = t("empty");
      card.append(empty);
    } else {
      const grid = document.createElement("div");
      grid.className = "cc-grid";
      for (const row of rows) grid.append(this._tile(row));
      card.append(grid);
    }
    this.replaceChildren(card);
  }

  _tile(row) {
    const entityId = row.entity_id;
    const stateObj = this._hass?.states?.[entityId];
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "cc-tile";
    tile.title = stateObj?.attributes?.friendly_name || entityId;
    tile.setAttribute("aria-label", stateObj?.attributes?.friendly_name || entityId);

    const iconWrap = document.createElement("span");
    iconWrap.className = "cc-icon";
    const icon = document.createElement("ha-icon");
    const configuredIcon = this._config.icons === "native" ? null : stateObj?.attributes?.icon;
    icon.setAttribute("icon", configuredIcon || defaultIcon(entityId));
    iconWrap.append(icon);

    const copy = document.createElement("span");
    copy.className = "cc-copy";
    const name = document.createElement("div");
    name.className = "cc-name";
    name.textContent = stateObj?.attributes?.friendly_name || entityId;
    copy.append(name);
    if (bool(this._config, "show_state", true) && stateObj) {
      const state = document.createElement("div");
      state.className = "cc-state";
      state.textContent = this._hass?.formatEntityState?.(stateObj) || stateObj.state;
      copy.append(state);
    }
    if (bool(this._config, "show_reason", false) && row.reason) {
      const reason = document.createElement("div");
      reason.className = "cc-reason";
      reason.textContent = row.reason;
      copy.append(reason);
    }
    if (bool(this._config, "show_score", false) && Number.isFinite(Number(row.score))) {
      const score = document.createElement("div");
      score.className = "cc-score";
      score.textContent = `${Math.round(Number(row.score) * 100)}%`;
      copy.append(score);
    }
    tile.append(iconWrap, copy);

    let held = false;
    let timer;
    tile.addEventListener("pointerdown", () => {
      held = false;
      timer = window.setTimeout(() => {
        held = true;
        fireMoreInfo(this, entityId);
      }, 550);
    });
    for (const eventName of ["pointerup", "pointercancel", "pointerleave"]) {
      tile.addEventListener(eventName, () => window.clearTimeout(timer));
    }
    tile.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      fireMoreInfo(this, entityId);
    });
    tile.addEventListener("click", () => {
      if (held) {
        held = false;
        return;
      }
      this._tap(entityId);
    });
    return tile;
  }

  _tap(entityId) {
    const configured = this._config.tap_action || "automatic";
    if (configured === "more-info") {
      fireMoreInfo(this, entityId);
      return;
    }
    let action = automaticAction(entityId);
    if (configured === "toggle") {
      action = TOGGLE_DOMAINS.has(domainOf(entityId))
        ? { domain: "homeassistant", service: "toggle" }
        : automaticAction(entityId);
    }
    if (!action) {
      fireMoreInfo(this, entityId);
      return;
    }
    this._hass.callService(action.domain, action.service, { entity_id: entityId });
  }
}

class ContextualControlsLearningCard extends HTMLElement {
  static getStubConfig() {
    return {
      sensor: "sensor.contextual_controls_learning",
      title: t("learningTitle"),
      max_patterns: 6,
      show_comparison: true,
      show_transitions: true,
      show_sequences: true,
      show_feedback: true,
    };
  }

  static getConfigForm() {
    const labels = {
      sensor: "learningSensor",
      title: "title",
      max_patterns: "maxPatterns",
      show_comparison: "showComparison",
      show_transitions: "showTransitions",
      show_sequences: "showSequences",
      show_feedback: "showFeedback",
    };
    return {
      schema: [
        {
          name: "sensor",
          required: true,
          selector: { entity: { filter: { domain: "sensor" } } },
        },
        { name: "title", selector: { text: {} } },
        { name: "max_patterns", selector: { number: { min: 1, max: 10, mode: "box" } } },
        {
          type: "grid",
          name: "",
          flatten: true,
          schema: [
            { name: "show_comparison", selector: { boolean: {} } },
            { name: "show_transitions", selector: { boolean: {} } },
            { name: "show_sequences", selector: { boolean: {} } },
            { name: "show_feedback", selector: { boolean: {} } },
          ],
        },
      ],
      computeLabel: (schema) => t(labels[schema.name] || schema.name),
      assertConfig: (config) => {
        if (!config.sensor || typeof config.sensor !== "string") {
          throw new Error(t("missing"));
        }
      },
    };
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error(t("missing"));
    this._config = { ...ContextualControlsLearningCard.getStubConfig(), ...config };
    this._signature = undefined;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const sensor = hass?.states?.[this._config?.sensor];
    const attributes = sensor?.attributes || {};
    const referenced = [
      ...(attributes.top_transitions || []).flatMap((row) => [
        row.from_entity_id,
        row.to_entity_id,
      ]),
      ...(attributes.top_sequences || []).flatMap((row) => row.entity_ids || []),
      ...(attributes.entity_feedback || []).map((row) => row.entity_id),
    ];
    const names = referenced.map((entityId) => [
      entityId,
      hass?.states?.[entityId]?.attributes?.friendly_name,
    ]);
    const signature = JSON.stringify([sensor?.state, attributes, names, this._config]);
    if (signature !== this._signature) {
      this._signature = signature;
      this._render();
    }
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 6;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6, min_rows: 4 };
  }

  _entityName(entityId) {
    return this._hass?.states?.[entityId]?.attributes?.friendly_name || entityId;
  }

  _entity(entityId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ccl-entity";
    button.textContent = this._entityName(entityId);
    button.title = entityId;
    button.addEventListener("click", () => fireMoreInfo(this, entityId));
    return button;
  }

  _metric(label, value, accent = false) {
    const metric = document.createElement("div");
    metric.className = `ccl-metric${accent ? " ccl-accent" : ""}`;
    const number = document.createElement("div");
    number.className = "ccl-metric-value";
    number.textContent = value;
    const name = document.createElement("div");
    name.className = "ccl-metric-label";
    name.textContent = label;
    metric.append(number, name);
    return metric;
  }

  _bar(label, value, accent = false) {
    const row = document.createElement("div");
    row.className = "ccl-bar-row";
    const copy = document.createElement("div");
    copy.className = "ccl-bar-copy";
    const name = document.createElement("span");
    name.textContent = label;
    const amount = document.createElement("span");
    amount.textContent = rateLabel(value);
    copy.append(name, amount);
    const track = document.createElement("div");
    track.className = "ccl-bar-track";
    const fill = document.createElement("div");
    fill.className = `ccl-bar-fill${accent ? " ccl-bar-accent" : ""}`;
    fill.style.width = rateLabel(value);
    track.append(fill);
    row.append(copy, track);
    return row;
  }

  _section(title, rows, renderer) {
    if (!rows.length) return null;
    const section = document.createElement("section");
    section.className = "ccl-section";
    const heading = document.createElement("div");
    heading.className = "ccl-section-title";
    heading.textContent = title;
    const list = document.createElement("div");
    list.className = "ccl-list";
    rows.forEach((row) => list.append(renderer.call(this, row)));
    section.append(heading, list);
    return section;
  }

  _pattern(entityIds, row) {
    const item = document.createElement("div");
    item.className = "ccl-pattern";
    const path = document.createElement("div");
    path.className = "ccl-path";
    entityIds.forEach((entityId, index) => {
      if (index) {
        const arrow = document.createElement("ha-icon");
        arrow.className = "ccl-arrow";
        arrow.setAttribute("icon", "mdi:chevron-right");
        path.append(arrow);
      }
      path.append(this._entity(entityId));
    });
    const meta = document.createElement("div");
    meta.className = "ccl-meta";
    meta.textContent = `${row.count} ${t("occurrences")} · ${rateLabel(row.confidence)} · ${t("averageDelay")} ${delayLabel(row.average_delay_seconds)}`;
    item.append(path, meta);
    return item;
  }

  _feedback(row) {
    const item = document.createElement("div");
    item.className = "ccl-feedback-row";
    const top = document.createElement("div");
    top.className = "ccl-feedback-copy";
    top.append(this._entity(row.entity_id));
    const stats = document.createElement("span");
    stats.textContent = `${row.accepted}/${row.suggestions} · ${rateLabel(row.acceptance_rate)}`;
    top.append(stats);
    const track = document.createElement("div");
    track.className = "ccl-bar-track";
    const fill = document.createElement("div");
    fill.className = "ccl-bar-fill ccl-bar-accent";
    fill.style.width = rateLabel(row.acceptance_rate);
    track.append(fill);
    item.append(top, track);
    return item;
  }

  _render() {
    if (!this._config) return;
    const sensor = this._hass?.states?.[this._config.sensor];
    const attributes = sensor?.attributes || {};
    const limit = Math.max(1, Math.min(10, Number(this._config.max_patterns) || 6));
    const card = document.createElement("ha-card");
    card.className = "ccl-card";
    const style = document.createElement("style");
    style.textContent = `
      .ccl-card { padding:16px; color:var(--primary-text-color); }
      .ccl-title { font-size:20px; font-weight:500; margin:0 0 14px; }
      .ccl-metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
      .ccl-metric { min-width:0; padding:12px; border-radius:var(--ha-card-border-radius,12px);
        background:var(--secondary-background-color); }
      .ccl-metric-value { font-size:23px; font-weight:600; line-height:1.2; }
      .ccl-metric-label { color:var(--secondary-text-color); font-size:12px; margin-top:4px; }
      .ccl-accent .ccl-metric-value { color:var(--primary-color); }
      .ccl-section { margin-top:18px; }
      .ccl-section-title { font-size:14px; font-weight:600; margin-bottom:8px; }
      .ccl-list { display:flex; flex-direction:column; gap:7px; }
      .ccl-pattern,.ccl-feedback-row,.ccl-comparison { padding:10px 12px; border-radius:10px;
        background:var(--secondary-background-color); }
      .ccl-path { display:flex; align-items:center; min-width:0; gap:3px; overflow:hidden; }
      .ccl-entity { appearance:none; border:0; padding:0; min-width:0; overflow:hidden;
        text-overflow:ellipsis; white-space:nowrap; background:transparent; color:var(--primary-text-color);
        font:inherit; font-weight:500; cursor:pointer; }
      .ccl-entity:hover { color:var(--primary-color); }
      .ccl-arrow { flex:0 0 auto; color:var(--secondary-text-color); --mdc-icon-size:18px; }
      .ccl-meta { margin-top:4px; color:var(--secondary-text-color); font-size:12px; }
      .ccl-bar-row + .ccl-bar-row { margin-top:10px; }
      .ccl-bar-copy,.ccl-feedback-copy { display:flex; justify-content:space-between; gap:12px;
        align-items:center; font-size:13px; }
      .ccl-bar-track { height:6px; margin-top:6px; overflow:hidden; border-radius:999px;
        background:color-mix(in srgb,var(--secondary-text-color) 18%,transparent); }
      .ccl-bar-fill { height:100%; border-radius:inherit; background:var(--secondary-text-color); }
      .ccl-bar-accent { background:var(--primary-color); }
      .ccl-missing,.ccl-empty { color:var(--secondary-text-color); padding:6px 0; }
      @media(max-width:600px) {
        .ccl-card { padding:14px; }
        .ccl-metrics { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .ccl-path { flex-wrap:wrap; }
      }
    `;
    card.append(style);
    if (this._config.title) {
      const heading = document.createElement("div");
      heading.className = "ccl-title";
      heading.textContent = this._config.title;
      card.append(heading);
    }
    if (!sensor) {
      const missing = document.createElement("div");
      missing.className = "ccl-missing";
      missing.textContent = t("enableLearningSensor");
      card.append(missing);
      this.replaceChildren(card);
      return;
    }
    const metrics = document.createElement("div");
    metrics.className = "ccl-metrics";
    metrics.append(
      this._metric(t("confidence"), `${Math.round(Number(sensor.state) || 0)}%`, true),
      this._metric(t("top1"), rateLabel(attributes.top1_hit_rate)),
      this._metric(t("top3"), rateLabel(attributes.top3_hit_rate)),
      this._metric(t("acceptedRate"), rateLabel(attributes.accepted_rate)),
    );
    card.append(metrics);
    if (bool(this._config, "show_comparison", true)) {
      const comparison = document.createElement("section");
      comparison.className = "ccl-section";
      const title = document.createElement("div");
      title.className = "ccl-section-title";
      title.textContent = t("comparison");
      const body = document.createElement("div");
      body.className = "ccl-comparison";
      body.append(
        this._bar(t("baseRanking"), attributes.base_top3_hit_rate),
        this._bar(t("adaptiveRanking"), attributes.adaptive_top3_hit_rate, true),
      );
      comparison.append(title, body);
      card.append(comparison);
    }
    const sections = [
      bool(this._config, "show_sequences", true)
        ? this._section(
            t("sequences"),
            (attributes.top_sequences || []).slice(0, limit),
            function renderSequence(row) {
              return this._pattern(row.entity_ids || [], row);
            },
          )
        : null,
      bool(this._config, "show_transitions", true)
        ? this._section(
            t("transitions"),
            (attributes.top_transitions || []).slice(0, limit),
            function renderTransition(row) {
              return this._pattern([row.from_entity_id, row.to_entity_id], row);
            },
          )
        : null,
      bool(this._config, "show_feedback", true)
        ? this._section(
            t("feedback"),
            (attributes.entity_feedback || []).slice(0, limit),
            this._feedback,
          )
        : null,
    ].filter(Boolean);
    sections.forEach((section) => card.append(section));
    if (!sections.length) {
      const empty = document.createElement("div");
      empty.className = "ccl-empty";
      empty.textContent = t("noLearningData");
      card.append(empty);
    }
    this.replaceChildren(card);
  }
}

if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, ContextualControlsCard);
if (!customElements.get(LEARNING_CARD_TAG)) {
  customElements.define(LEARNING_CARD_TAG, ContextualControlsLearningCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: t("name"),
    description: t("description"),
    preview: true,
    documentationURL: "https://github.com/monkeypr00f/contextual-controls-card",
    getEntitySuggestion: (_hass, entityId) =>
      entityId.startsWith("sensor.contextual_controls")
        ? { config: { type: `custom:${CARD_TAG}`, sensor: entityId } }
        : null,
  });
}
if (!window.customCards.some((card) => card.type === LEARNING_CARD_TAG)) {
  window.customCards.push({
    type: LEARNING_CARD_TAG,
    name: t("learningName"),
    description: t("learningDescription"),
    preview: true,
    documentationURL: "https://github.com/monkeypr00f/contextual-controls-card",
    getEntitySuggestion: (_hass, entityId) =>
      entityId.startsWith("sensor.contextual_controls_learning")
        ? { config: { type: `custom:${LEARNING_CARD_TAG}`, sensor: entityId } }
        : null,
  });
}

window.ContextualControlsCardTest = Object.freeze({
  automaticAction,
  defaultIcon,
  domainOf,
  dynamicTitle,
  clampRate,
  delayLabel,
  rateLabel,
});

console.info("%c CONTEXTUAL-CONTROLS-CARD %c 1.1.0 ", "color:white;background:#03a9f4;font-weight:700", "color:#03a9f4;background:white;font-weight:700");
