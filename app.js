const API_MULTIPLIER = 1_000_000;
const TARGET_RTP = 1;
const SEGMENT_HITS_TO_BREAK = 2;
const MAX_COLLISIONS_PER_ROUND = 220;
const BALL_RADIUS_PX = 10;
const BALL_SPEED_PX_PER_SEC = 420;
const COLLISION_EPSILON_SEC = 0.0009;
const REFLECT_JITTER_MAX_RAD = 0.28;
const REFLECT_SWAY_MAX_RAD = 0.16;
const PRELAUNCH_INNER_LAYER_MS = 340;
const PRELAUNCH_OUTER_LAYER_MS = 620;
const PRELAUNCH_MIN_TURNS = 0.6;
const PRELAUNCH_MAX_TURNS = 1.6;
const FINAL_HIT_SLOW_FACTOR = 1.65;
const FINAL_HIT_END_SPEED_RATIO = 0.45;
const BREAK_EFFECT_MS = 150;
const LANDING_REVEAL_MS = 140;
const BIG_REVEAL_MS = 520;
const ZERO_MULTIPLIER_REVEAL_MS = 0;
const FAIR_ROLL_COUNT = 192;
const RTP_DISPLAY_TOLERANCE = 0.0005;
const SIMULATION_BATCH_COUNTS = new Set([100, 300, 500, 1000, 10000, 100000]);
const SIMULATION_GRAPH_MAX_POINTS = 320;
const UP_SEGMENT_ICON = "\u2B06";
const PROFILE_STORAGE_KEY = "the-wheel-profile";
// CC0 crack silhouette from Wikimedia Commons (CrackedWindow1.png).
const UP_BREAK_TEXTURE_URL =
  "https://commons.wikimedia.org/wiki/Special:FilePath/CrackedWindow1.png";
const SFX_LIBRARY = {
  spinStart: {
    src: "AUDIO/UI/Swipe_Swoosh/SFX_UI_Swipe_Swoosh_Medium_1.wav",
    volume: 0.44,
    pool: 2,
  },
  collision: {
    src: "AUDIO/Collect/Pop/SFX_Player_Collect_Pop_1.wav",
    volume: 0.1,
    pool: 6,
    throttleMs: 55,
  },
  upArm: {
    src: "AUDIO/UI/Notification/SFX_UI_Notification_Popup_1.wav",
    volume: 0.42,
    pool: 3,
    throttleMs: 80,
  },
  upBreakthrough: {
    src: "AUDIO/Rattle/Glass/SFX_Rattle_Glass_Thick_2.wav",
    volume: 0.24,
    pool: 2,
    throttleMs: 120,
  },
  loseZero: {
    src: "AUDIO/UI/Click/Negative/SFX_UI_Button_Click_Generic_Negative_2.wav",
    volume: 0.34,
    pool: 2,
    throttleMs: 90,
  },
  winSmall: {
    src: "AUDIO/Collect/Coin/SFX_Player_Collect_Coin_2.wav",
    volume: 0.34,
    pool: 2,
    throttleMs: 40,
  },
  winMedium: {
    src: "AUDIO/UI/Bonus/SFX_UI_Bonus_1.wav",
    volume: 0.42,
    pool: 2,
    throttleMs: 60,
  },
  winBig: {
    src: "AUDIO/UI/Success/SFX_UI_Success_Bright_Rich_1.wav",
    volume: 0.52,
    pool: 2,
    throttleMs: 60,
  },
  winMax: {
    src: "AUDIO/Firework/SFX_Firework_Explosion_2.wav",
    volume: 0.62,
    pool: 2,
    throttleMs: 140,
  },
  uiClick: {
    src: "AUDIO/UI/Click/Select/SFX_UI_Button_Click_Select_1.wav",
    volume: 0.24,
    pool: 2,
    throttleMs: 45,
  },
};

const FAIR_STORAGE_KEYS = {
  serverSeed: "the-wheel-server-seed",
  clientSeed: "the-wheel-client-seed",
  nonce: "the-wheel-seed-nonce",
  lastRoundHash: "the-wheel-last-round-hash",
};

const StakeSDK = {
  DisplayAmount: null,
  ParseAmount: null,
  RGSClient: null,
};

const SIMULATED_CONFIG = {
  minBet: 100_000,
  maxBet: 20_000_000,
  stepBet: 100_000,
  defaultBetLevel: 1_000_000,
  betLevels: [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000],
};

const SIMULATED_BALANCE = {
  amount: 300 * API_MULTIPLIER,
  currency: "USD",
};

const DEFAULT_WHEEL_PROFILE_KEY = "high_legacy_1000";

const LAYER_BLUEPRINTS = {
  high_legacy_1000: {
    key: "high_legacy_1000",
    label: "High Legacy",
    volatility: "High",
    description: "Six-layer high profile tuned to 100.00% RTP with an always-paying outer crown (1,000x max path).",
    targetRtp: TARGET_RTP,
    maxWinMultiplier: 1000,
    expectedUpChances: [1 / 4, 3 / 12, 2 / 11, 1 / 10, 1 / 10, 0],
    finalLayerMinRewardChance: 1,
    layers: [
      {
        name: "Core",
        upSlices: 1,
        multipliers: [0, 0, 0],
      },
      {
        name: "Layer 2",
        upSlices: 3,
        multipliers: [0, 0, 0, 0, 0, 2, 2, 4, 10],
      },
      {
        name: "Layer 3",
        upSlices: 2,
        multipliers: [0, 0, 0, 2, 2, 4, 6, 10, 16],
      },
      {
        name: "Layer 4",
        upSlices: 1,
        multipliers: [0, 0, 4, 8, 14, 24, 36, 64, 100],
      },
      {
        name: "Layer 5",
        upSlices: 1,
        multipliers: [0, 0, 6, 14, 28, 50, 80, 130, 160],
      },
      {
        name: "Outer Crown",
        upSlices: 0,
        multipliers: [
          { value: 1000, weight: 2 },
          940,
          800,
          740,
          680,
          620,
          580,
          540,
          500,
          470,
          440,
          410,
          380,
          350,
          320,
          280,
          240,
          200,
          150,
        ],
      },
    ],
  },
  medium_balanced_100: {
    key: "medium_balanced_100",
    label: "Medium Balanced",
    volatility: "Medium",
    description: "Five-layer 100x profile tuned to 100.00% RTP with an always-paying final crown.",
    targetRtp: TARGET_RTP,
    maxWinMultiplier: 100,
    expectedUpChances: [1 / 4, 2 / 10, 1 / 9, 1 / 9, 0],
    finalLayerMinRewardChance: 1,
    layers: [
      {
        name: "Core",
        upSlices: 1,
        multipliers: [0, 0, 2],
      },
      {
        name: "Layer 2",
        upSlices: 2,
        multipliers: [4, 4, 2, 2, 0, 0, 0, 0],
      },
      {
        name: "Layer 3",
        upSlices: 1,
        multipliers: [6, 6, 4, 4, 2, 2, 0, 0],
      },
      {
        name: "Layer 4",
        upSlices: 1,
        multipliers: [8, 6, 6, 4, 4, 2, 2, 0],
      },
      {
        name: "Outer Crown",
        upSlices: 0,
        multipliers: [100, 98, 96, 94, 92, 90, 88, 86, 84, 82, 80, 78, 76, 74, 72, 70, 68, 66, 24, 2],
      },
    ],
  },
};

const els = {
  modeText: document.getElementById("modeText"),
  statusText: document.getElementById("statusText"),
  layerIndexText: document.getElementById("layerIndexText"),
  layerCountText: document.getElementById("layerCountText"),
  livesText: document.getElementById("livesText"),
  maxPathText: document.getElementById("maxPathText"),
  rtpText: document.getElementById("rtpText"),
  balanceText: document.getElementById("balanceText"),
  winText: document.getElementById("winText"),
  betText: document.getElementById("betText"),
  betAmountInput: document.getElementById("betAmountInput"),
  betDownButton: document.getElementById("betDownButton"),
  betUpButton: document.getElementById("betUpButton"),
  wheelProfileSelect: document.getElementById("wheelProfileSelect"),
  wheelProfileSummary: document.getElementById("wheelProfileSummary"),
  spinButton: document.getElementById("spinButton"),
  wheelCanvas: document.getElementById("wheelCanvas"),
  paytable: document.getElementById("paytable"),
  clientSeedInput: document.getElementById("clientSeedInput"),
  applySeedButton: document.getElementById("applySeedButton"),
  rotateSeedButton: document.getElementById("rotateSeedButton"),
  serverSeedHashText: document.getElementById("serverSeedHashText"),
  fairNonceText: document.getElementById("fairNonceText"),
  lastRoundHashText: document.getElementById("lastRoundHashText"),
  simStatusText: document.getElementById("simStatusText"),
  simReplayHint: document.getElementById("simReplayHint"),
  simTopList: document.getElementById("simTopList"),
  simButtons: Array.from(document.querySelectorAll("[data-sim-count]")),
  simReplayInput: document.getElementById("simReplayInput"),
  simReplayButton: document.getElementById("simReplayButton"),
  simMetricsSpins: document.getElementById("simMetricsSpins"),
  simMetricsWager: document.getElementById("simMetricsWager"),
  simMetricsReturn: document.getElementById("simMetricsReturn"),
  simMetricsNet: document.getElementById("simMetricsNet"),
  simMetricsRtp: document.getElementById("simMetricsRtp"),
  simMetricsEdge: document.getElementById("simMetricsEdge"),
  simMetricsHitRate: document.getElementById("simMetricsHitRate"),
  simMetricsZeroRate: document.getElementById("simMetricsZeroRate"),
  simMetricsAvgMult: document.getElementById("simMetricsAvgMult"),
  simMetricsBestHit: document.getElementById("simMetricsBestHit"),
  simTrendCanvas: document.getElementById("simTrendCanvas"),
  rulesButton: document.getElementById("rulesButton"),
  rulesModal: document.getElementById("rulesModal"),
  rulesCloseButton: document.getElementById("rulesCloseButton"),
  rulesBackdrop: document.getElementById("rulesBackdrop"),
  provablyFairButton: document.getElementById("provablyFairButton"),
  provablyFairModal: document.getElementById("provablyFairModal"),
  provablyFairCloseButton: document.getElementById("provablyFairCloseButton"),
  provablyFairBackdrop: document.getElementById("provablyFairBackdrop"),
};

const ctx = els.wheelCanvas.getContext("2d", {
  alpha: false,
  desynchronized: true,
});

const state = {
  mode: "simulation",
  client: null,
  authenticated: false,
  config: { ...SIMULATED_CONFIG },
  balance: { ...SIMULATED_BALANCE },
  betIndex: 3,
  betAmount: SIMULATED_CONFIG.betLevels[3],
  displayedWinAmount: 0,
  lastWinAmount: 0,
  lastResolvedMultiplier: 0,
  activeProfileKey: DEFAULT_WHEEL_PROFILE_KEY,
  activeProfile: null,
  roundActive: false,
  spinning: false,
  activeLayerIndex: 0,
  liveRound: null,
  layers: [],
  theoreticalRtp: 0,
  terminalLayerProbabilities: [],
  maxWinMultiplier: 0,
  layerRotations: [],
  layerGone: [],
  latestOutcomeByLayer: [],
  segmentHitsByLayer: [],
  upSegmentsGoneByLayer: [],
  revealState: null,
  finalWinFocus: null,
  winAnimationFrame: null,
  ballVisible: true,
  ballPosition: { x: els.wheelCanvas.width / 2, y: els.wheelCanvas.height / 2 },
  ballTrail: [],
  breakEffect: null,
  upBreakTexture: null,
  simulationTopWins: [],
  simulationNonceCursor: 0,
  simulationLastBatch: null,
  simulationStats: null,
  sound: {
    enabled: true,
    pools: {},
    lastPlayByKey: {},
  },
  provablyFair: {
    serverSeed: "",
    serverSeedHash: "",
    clientSeed: "",
    nonce: 0,
    lastRoundHash: "",
  },
  ui: {
    rulesOpen: false,
    provablyFairOpen: false,
  },
  canvas: {
    logicalWidth: 720,
    logicalHeight: 720,
    pixelRatio: 1,
    resizeObserver: null,
  },
};

function setStatus(text) {
  void text;
}

function openProvablyFairModal() {
  if (!els.provablyFairModal || state.ui.provablyFairOpen) {
    return;
  }
  closeRulesModal(false);
  state.ui.provablyFairOpen = true;
  els.provablyFairModal.hidden = false;
  els.provablyFairModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => {
    els.clientSeedInput?.focus();
    els.clientSeedInput?.select();
  });
}

function closeProvablyFairModal() {
  if (!els.provablyFairModal || !state.ui.provablyFairOpen) {
    return;
  }
  state.ui.provablyFairOpen = false;
  els.provablyFairModal.hidden = true;
  els.provablyFairModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  els.provablyFairButton?.focus();
}

function openRulesModal() {
  if (!els.rulesModal || state.ui.rulesOpen) {
    return;
  }
  closeProvablyFairModal();
  state.ui.rulesOpen = true;
  els.rulesModal.hidden = false;
  els.rulesModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  requestAnimationFrame(() => {
    els.rulesCloseButton?.focus();
  });
}

function closeRulesModal(returnFocus = true) {
  if (!els.rulesModal || !state.ui.rulesOpen) {
    return;
  }
  state.ui.rulesOpen = false;
  els.rulesModal.hidden = true;
  els.rulesModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (returnFocus) {
    els.rulesButton?.focus();
  }
}

function getEffectivePixelRatio() {
  const raw = window.devicePixelRatio || 1;
  return Math.max(1, Math.min(2, raw));
}

function resizeCanvasToDisplaySize() {
  if (!ctx || !els.wheelCanvas) {
    return;
  }

  const rect = els.wheelCanvas.getBoundingClientRect();
  const displaySize = Math.max(1, Math.floor(Math.min(rect.width, rect.height)));
  if (displaySize <= 1) {
    return;
  }

  const pixelRatio = getEffectivePixelRatio();
  const renderWidth = Math.max(1, Math.round(displaySize * pixelRatio));
  const renderHeight = Math.max(1, Math.round(displaySize * pixelRatio));
  const changed =
    els.wheelCanvas.width !== renderWidth ||
    els.wheelCanvas.height !== renderHeight ||
    state.canvas.pixelRatio !== pixelRatio;

  if (!changed) {
    return;
  }

  state.canvas.logicalWidth = displaySize;
  state.canvas.logicalHeight = displaySize;
  state.canvas.pixelRatio = pixelRatio;

  els.wheelCanvas.width = renderWidth;
  els.wheelCanvas.height = renderHeight;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  if (!state.roundActive && !state.spinning) {
    resetRoundVisualState();
  } else {
    state.ballTrail = [];
  }

  drawWheel();
}

function attachCanvasResizeObserver() {
  if (state.canvas.resizeObserver || !els.wheelCanvas) {
    return;
  }

  if (typeof ResizeObserver === "function") {
    state.canvas.resizeObserver = new ResizeObserver(() => {
      resizeCanvasToDisplaySize();
    });
    state.canvas.resizeObserver.observe(els.wheelCanvas);
  } else {
    const onResize = () => resizeCanvasToDisplaySize();
    window.addEventListener("resize", onResize, { passive: true });
    state.canvas.resizeObserver = {
      disconnect() {
        window.removeEventListener("resize", onResize);
      },
    };
  }
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clampAudioRate(value) {
  if (!Number.isFinite(value)) {
    return 1;
  }
  return Math.max(0.6, Math.min(1.65, value));
}

function initSoundPools() {
  if (typeof Audio === "undefined") {
    state.sound.enabled = false;
    return;
  }

  const pools = {};
  for (const [key, config] of Object.entries(SFX_LIBRARY)) {
    const poolSize = Math.max(1, Math.round(config.pool || 1));
    const items = [];
    for (let i = 0; i < poolSize; i += 1) {
      const audio = new Audio(config.src);
      audio.preload = "auto";
      audio.volume = clamp01(config.volume ?? 0.5);
      items.push(audio);
    }
    pools[key] = {
      baseVolume: clamp01(config.volume ?? 0.5),
      throttleMs: Math.max(0, Math.round(config.throttleMs || 0)),
      items,
      cursor: 0,
    };
  }

  state.sound.pools = pools;
  state.sound.lastPlayByKey = {};
}

function playSfx(key, options = {}) {
  if (!state.sound.enabled) {
    return;
  }

  const pool = state.sound.pools[key];
  if (!pool || pool.items.length === 0) {
    return;
  }

  const now = performance.now();
  const lastTime = state.sound.lastPlayByKey[key] ?? -Infinity;
  if (now - lastTime < pool.throttleMs) {
    return;
  }
  state.sound.lastPlayByKey[key] = now;

  const audio = pool.items[pool.cursor];
  pool.cursor = (pool.cursor + 1) % pool.items.length;

  try {
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = clampAudioRate(options.playbackRate ?? 1);
    audio.volume = clamp01(pool.baseVolume * (options.volumeScale ?? 1));
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  } catch {
    // ignore sound playback failures (autoplay policy, decode errors, etc.)
  }
}

function playWinSfx(multiplier) {
  if (!Number.isFinite(multiplier)) {
    return;
  }

  if (multiplier <= 0) {
    playSfx("loseZero");
    return;
  }

  if (multiplier >= state.maxWinMultiplier) {
    playSfx("winMax");
    return;
  }
  if (multiplier >= 100) {
    playSfx("winBig");
    return;
  }
  if (multiplier >= 20) {
    playSfx("winMedium");
    return;
  }
  playSfx("winSmall");
}

function formatMultiplier(value) {
  if (value >= 1000) {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}x`;
  }
  if (value === 0) {
    return "0x";
  }
  if (value >= 10) {
    return `${value.toFixed(1).replace(/\.0$/, "")}x`;
  }
  return `${value.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}x`;
}

function replayClass(element, className) {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function parseAmountFallback(rawAmount) {
  return rawAmount / API_MULTIPLIER;
}

function formatMoney(amount, currency = state.balance.currency) {
  try {
    if (StakeSDK.DisplayAmount) {
      return StakeSDK.DisplayAmount({ amount, currency });
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(parseAmountFallback(amount));
  } catch {
    const parse = StakeSDK.ParseAmount || parseAmountFallback;
    return `${parse(amount).toFixed(2)} ${currency}`;
  }
}

function formatSignedMoney(amount, currency = state.balance.currency) {
  const sign = amount >= 0 ? "+" : "-";
  return `${sign}${formatMoney(Math.abs(amount), currency)}`;
}

function formatPercent(value, fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  return `${value.toFixed(fractionDigits)}%`;
}

function formatSignedPercent(value, fractionDigits = 2) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(fractionDigits)}%`;
}

function formatCompactNumber(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return Math.round(value).toLocaleString("en-US");
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0.75) {
    return "<1s";
  }
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
}

function formatBetInputValue(rawAmount) {
  const amount = parseAmountFallback(rawAmount);
  if (!Number.isFinite(amount)) {
    return "0";
  }
  return amount.toFixed(6).replace(/\.?0+$/, "");
}

function clampBetAmount(rawAmount) {
  const minBet = Number.isFinite(state.config.minBet) ? state.config.minBet : SIMULATED_CONFIG.minBet;
  const maxBet = Number.isFinite(state.config.maxBet) ? state.config.maxBet : SIMULATED_CONFIG.maxBet;
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return Math.max(1, Math.round(minBet));
  }
  return Math.max(Math.round(minBet), Math.min(Math.round(maxBet), Math.round(rawAmount)));
}

function setBetFromInputValue(rawValue) {
  const normalized = String(rawValue).trim().replace(/,/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    updateHud();
    return false;
  }

  const rawAmount = clampBetAmount(parsed * API_MULTIPLIER);
  state.betAmount = rawAmount;
  updateHud();
  return true;
}

function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

function hasLiveSession() {
  const params = getQueryParams();
  return Boolean(params.get("sessionID") && params.get("rgs_url"));
}

function buildClientUrl() {
  const url = new URL(window.location.href);
  const rgs = url.searchParams.get("rgs_url");
  if (rgs) {
    url.searchParams.set("rgs_url", rgs.replace(/^https?:\/\//i, ""));
  }
  return url.href;
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function getLayerTravelTimeScale(layerIndex, layerCount) {
  if (layerCount <= 1) {
    return 1;
  }

  const progress = layerIndex / (layerCount - 1);
  if (progress < 0.2) {
    return 0.98;
  }
  if (progress < 0.45) {
    return 0.8;
  }
  if (progress < 0.65) {
    return 0.88;
  }
  if (progress < 0.85) {
    return 1.08;
  }
  return 1.34;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateSeed(prefix) {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return `${prefix}-${bytesToHex(bytes)}`;
}

function sanitizeSeed(raw) {
  const cleaned = raw.trim().replace(/[^a-zA-Z0-9:_-]/g, "-").slice(0, 64);
  return cleaned || generateSeed("client");
}

async function sha256Hex(input) {
  if (!globalThis.crypto?.subtle) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const fallback = (hash >>> 0).toString(16).padStart(8, "0");
    return fallback.repeat(8);
  }

  const encoded = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(digest));
}

function loadStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore storage failures
  }
}

function getWheelProfiles() {
  return Object.values(LAYER_BLUEPRINTS);
}

function getWheelProfileByKey(profileKey) {
  if (profileKey && LAYER_BLUEPRINTS[profileKey]) {
    return LAYER_BLUEPRINTS[profileKey];
  }
  return LAYER_BLUEPRINTS[DEFAULT_WHEEL_PROFILE_KEY] ?? null;
}

function calculateMultiplierRewardChance(layer) {
  const multiplierSegments = layer?.segments?.filter((segment) => segment.type === "mult") ?? [];
  const multiplierWeight = multiplierSegments.reduce(
    (sum, segment) => sum + Math.max(1, segment.weight || 1),
    0,
  );
  if (multiplierWeight <= 0) {
    return 0;
  }
  const rewardWeight = multiplierSegments.reduce(
    (sum, segment) => sum + (segment.value > 0 ? Math.max(1, segment.weight || 1) : 0),
    0,
  );
  return rewardWeight / multiplierWeight;
}

function getActiveFinalLayerRewardChance() {
  if (!state.layers.length) {
    return 0;
  }
  return calculateMultiplierRewardChance(state.layers[state.layers.length - 1]);
}

function renderWheelProfileSelect() {
  if (!els.wheelProfileSelect) {
    return;
  }

  const options = getWheelProfiles()
    .map(
      (profile) =>
        `<option value="${profile.key}">${profile.label} | ${profile.volatility} | ${formatMultiplier(profile.maxWinMultiplier)} max</option>`,
    )
    .join("");
  els.wheelProfileSelect.innerHTML = options;
  els.wheelProfileSelect.value = state.activeProfileKey;
}

function updateWheelProfileSummary() {
  if (!els.wheelProfileSummary) {
    return;
  }

  const profile = state.activeProfile;
  if (!profile) {
    els.wheelProfileSummary.textContent = "Wheel profile unavailable.";
    return;
  }

  const finalRewardChance = getActiveFinalLayerRewardChance() * 100;
  const rtpPercent = state.theoreticalRtp * 100;
  els.wheelProfileSummary.textContent =
    `${profile.description} RTP ${rtpPercent.toFixed(2)}%, max ${formatMultiplier(state.maxWinMultiplier)}, final-layer reward ${finalRewardChance.toFixed(1)}%.`;
}

function persistProvablyFairState() {
  saveStorage(FAIR_STORAGE_KEYS.serverSeed, state.provablyFair.serverSeed);
  saveStorage(FAIR_STORAGE_KEYS.clientSeed, state.provablyFair.clientSeed);
  saveStorage(FAIR_STORAGE_KEYS.nonce, String(state.provablyFair.nonce));
  saveStorage(FAIR_STORAGE_KEYS.lastRoundHash, state.provablyFair.lastRoundHash || "");
}

async function initProvablyFairState() {
  const storedServerSeed = loadStorage(FAIR_STORAGE_KEYS.serverSeed);
  const storedClientSeed = loadStorage(FAIR_STORAGE_KEYS.clientSeed);
  const storedNonce = Number.parseInt(loadStorage(FAIR_STORAGE_KEYS.nonce) || "0", 10);

  state.provablyFair.serverSeed = storedServerSeed || generateSeed("server");
  state.provablyFair.clientSeed = sanitizeSeed(storedClientSeed || generateSeed("client"));
  state.provablyFair.nonce = Number.isFinite(storedNonce) && storedNonce >= 0 ? storedNonce : 0;
  state.provablyFair.lastRoundHash = loadStorage(FAIR_STORAGE_KEYS.lastRoundHash) || "";
  state.provablyFair.serverSeedHash = await sha256Hex(state.provablyFair.serverSeed);

  persistProvablyFairState();
  updateProvablyFairPanel();
}

function updateProvablyFairPanel() {
  els.clientSeedInput.value = state.provablyFair.clientSeed;
  els.serverSeedHashText.textContent = state.provablyFair.serverSeedHash;
  els.fairNonceText.textContent = String(state.provablyFair.nonce);
  els.lastRoundHashText.textContent = state.provablyFair.lastRoundHash || "-";
}

function setSimulationStatus(text) {
  if (els.simStatusText) {
    els.simStatusText.textContent = text;
  }
}

function setSimulationReplayHint(text) {
  if (els.simReplayHint) {
    els.simReplayHint.textContent = text;
  }
}

function updateSimulationReplayUi() {
  const maxSpins = state.simulationLastBatch?.count || 0;
  const hasBatch = maxSpins > 0;
  const busy = state.spinning || state.roundActive;

  if (els.simReplayInput) {
    els.simReplayInput.disabled = !hasBatch || busy;
    els.simReplayInput.min = "1";
    els.simReplayInput.max = hasBatch ? String(maxSpins) : "1";
    if (!hasBatch) {
      els.simReplayInput.value = "";
    }
  }

  if (els.simReplayButton) {
    els.simReplayButton.disabled = !hasBatch || busy;
  }

  if (!hasBatch) {
    setSimulationReplayHint("Run a simulation batch first, then pick a spin.");
    return;
  }

  const selected = Number.parseInt(els.simReplayInput?.value || "", 10);
  if (!Number.isFinite(selected) || selected < 1 || selected > maxSpins) {
    setSimulationReplayHint(`Pick a spin from 1 to ${formatCompactNumber(maxSpins)}.`);
    return;
  }

  setSimulationReplayHint(
    `Ready to replay spin ${formatCompactNumber(selected)}/${formatCompactNumber(maxSpins)}.`,
  );
}

function setSimulationMetricValue(element, text, tone = "neutral") {
  if (!element) {
    return;
  }

  element.textContent = text;
  element.classList.remove("tone-positive", "tone-negative", "tone-neutral");
  if (tone === "positive" || tone === "negative" || tone === "neutral") {
    element.classList.add(`tone-${tone}`);
  }
}

function renderSimulationMetrics(stats = state.simulationStats) {
  if (!stats) {
    setSimulationMetricValue(els.simMetricsSpins, "-");
    setSimulationMetricValue(els.simMetricsWager, "-");
    setSimulationMetricValue(els.simMetricsReturn, "-");
    setSimulationMetricValue(els.simMetricsNet, "-");
    setSimulationMetricValue(els.simMetricsRtp, "-");
    setSimulationMetricValue(els.simMetricsEdge, "-");
    setSimulationMetricValue(els.simMetricsHitRate, "-");
    setSimulationMetricValue(els.simMetricsZeroRate, "-");
    setSimulationMetricValue(els.simMetricsAvgMult, "-");
    setSimulationMetricValue(els.simMetricsBestHit, "-");
    return;
  }

  const netTone = stats.net > 0 ? "positive" : stats.net < 0 ? "negative" : "neutral";
  const rtpTone =
    stats.rtpPercent > 100 ? "positive" : stats.rtpPercent < 100 ? "negative" : "neutral";
  const edgeTone =
    stats.edgePercent < 0 ? "positive" : stats.edgePercent > 0 ? "negative" : "neutral";
  const avgTone =
    stats.avgMultiplier > 1 ? "positive" : stats.avgMultiplier < 1 ? "negative" : "neutral";
  const hitTone =
    stats.hitRatePercent >= 50 ? "positive" : stats.hitRatePercent < 20 ? "negative" : "neutral";
  const zeroTone =
    stats.zeroRatePercent > 50 ? "negative" : stats.zeroRatePercent < 20 ? "positive" : "neutral";

  setSimulationMetricValue(els.simMetricsSpins, formatCompactNumber(stats.count));
  setSimulationMetricValue(els.simMetricsWager, formatMoney(stats.totalWager));
  setSimulationMetricValue(els.simMetricsReturn, formatMoney(stats.totalReturn));
  setSimulationMetricValue(els.simMetricsNet, formatSignedMoney(stats.net), netTone);
  setSimulationMetricValue(els.simMetricsRtp, formatPercent(stats.rtpPercent), rtpTone);
  setSimulationMetricValue(els.simMetricsEdge, formatSignedPercent(stats.edgePercent), edgeTone);
  setSimulationMetricValue(els.simMetricsHitRate, formatPercent(stats.hitRatePercent), hitTone);
  setSimulationMetricValue(els.simMetricsZeroRate, formatPercent(stats.zeroRatePercent), zeroTone);
  setSimulationMetricValue(els.simMetricsAvgMult, formatMultiplier(stats.avgMultiplier), avgTone);

  if (stats.best) {
    const bestText = `${formatMultiplier(stats.best.multiplier)} (Spin ${formatCompactNumber(stats.best.spin)})`;
    setSimulationMetricValue(els.simMetricsBestHit, bestText, "positive");
  } else {
    setSimulationMetricValue(els.simMetricsBestHit, "-");
  }
}

function renderSimulationTrendGraph(stats = state.simulationStats) {
  const canvas = els.simTrendCanvas;
  if (!canvas) {
    return;
  }

  const graphCtx = canvas.getContext("2d");
  if (!graphCtx) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const cssWidth = Math.max(320, Math.round(rect.width || canvas.clientWidth || 960));
  const cssHeight = Math.max(140, Math.round(rect.height || canvas.clientHeight || 220));
  const pixelRatio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const renderWidth = Math.round(cssWidth * pixelRatio);
  const renderHeight = Math.round(cssHeight * pixelRatio);

  if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
    canvas.width = renderWidth;
    canvas.height = renderHeight;
  }

  graphCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  graphCtx.clearRect(0, 0, cssWidth, cssHeight);

  const points = stats?.trendPoints ?? [];
  const padLeft = 44;
  const padRight = 12;
  const padTop = 12;
  const padBottom = 20;
  const chartWidth = Math.max(10, cssWidth - padLeft - padRight);
  const chartHeight = Math.max(10, cssHeight - padTop - padBottom);

  graphCtx.strokeStyle = "rgba(146, 164, 196, 0.2)";
  graphCtx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padTop + (chartHeight / 4) * i;
    graphCtx.beginPath();
    graphCtx.moveTo(padLeft, y);
    graphCtx.lineTo(padLeft + chartWidth, y);
    graphCtx.stroke();
  }

  if (points.length < 2) {
    graphCtx.fillStyle = "rgba(193, 205, 227, 0.72)";
    graphCtx.font = '600 12px "Space Grotesk", "Segoe UI", sans-serif';
    graphCtx.textAlign = "center";
    graphCtx.fillText("Run a simulation batch to draw trend data.", cssWidth / 2, cssHeight / 2 + 4);
    return;
  }

  let minNet = 0;
  let maxNet = 0;
  for (const point of points) {
    minNet = Math.min(minNet, point.net);
    maxNet = Math.max(maxNet, point.net);
  }
  if (Math.abs(maxNet - minNet) < 1) {
    minNet -= Math.max(state.betAmount, 1);
    maxNet += Math.max(state.betAmount, 1);
  }

  const toX = (spin) => padLeft + (spin / Math.max(1, stats.count)) * chartWidth;
  const toY = (net) => {
    const range = Math.max(1, maxNet - minNet);
    return padTop + ((maxNet - net) / range) * chartHeight;
  };

  const zeroY = toY(0);
  graphCtx.setLineDash([5, 4]);
  graphCtx.strokeStyle = "rgba(204, 214, 234, 0.45)";
  graphCtx.beginPath();
  graphCtx.moveTo(padLeft, zeroY);
  graphCtx.lineTo(padLeft + chartWidth, zeroY);
  graphCtx.stroke();
  graphCtx.setLineDash([]);

  const lineColor = stats.net >= 0 ? "#6de8a8" : "#ff8d8d";
  graphCtx.lineWidth = 2;
  graphCtx.strokeStyle = lineColor;
  graphCtx.beginPath();
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i];
    const x = toX(point.spin);
    const y = toY(point.net);
    if (i === 0) {
      graphCtx.moveTo(x, y);
    } else {
      graphCtx.lineTo(x, y);
    }
  }
  graphCtx.stroke();

  graphCtx.fillStyle = "rgba(221, 230, 247, 0.86)";
  graphCtx.font = '600 11px "JetBrains Mono", "Consolas", monospace';
  graphCtx.textAlign = "left";
  graphCtx.fillText(formatSignedMoney(maxNet), 4, padTop + 8);
  graphCtx.fillText(formatSignedMoney(minNet), 4, padTop + chartHeight);
  graphCtx.textAlign = "right";
  graphCtx.fillText(formatCompactNumber(stats.count), padLeft + chartWidth, cssHeight - 4);
}

function renderSimulationTopWins(entries = state.simulationTopWins) {
  if (!els.simTopList) {
    return;
  }

  if (!entries.length) {
    els.simTopList.innerHTML = "<li>No simulation run yet.</li>";
    return;
  }

  const rows = entries
    .slice(0, 3)
    .map(
      (entry, index) =>
        `<li><span>#${index + 1} Spin ${formatCompactNumber(entry.spin)} | ${formatMultiplier(entry.multiplier)} | ${formatMoney(entry.winAmount)} | ${entry.layerName}</span><button class="mini-btn" type="button" data-replay-spin="${entry.spin}">Watch</button></li>`,
    )
    .join("");

  els.simTopList.innerHTML = rows;
}

function recordSimulationTopWin(topEntries, entry) {
  topEntries.push(entry);
  topEntries.sort((a, b) => {
    if (b.multiplier !== a.multiplier) {
      return b.multiplier - a.multiplier;
    }
    if (b.winAmount !== a.winAmount) {
      return b.winAmount - a.winAmount;
    }
    return a.spin - b.spin;
  });
  if (topEntries.length > 3) {
    topEntries.length = 3;
  }
}

async function createFairRolls(serverSeed, clientSeed, nonce, count) {
  const material = `${serverSeed}:${clientSeed}:${nonce}`;
  const rolls = [];
  let cursor = 0;

  while (rolls.length < count) {
    const hash = await sha256Hex(`${material}:${cursor}`);
    for (let i = 0; i <= hash.length - 8; i += 8) {
      const chunk = hash.slice(i, i + 8);
      const raw = Number.parseInt(chunk, 16);
      rolls.push(raw / 0x100000000);
      if (rolls.length >= count) {
        break;
      }
    }
    cursor += 1;
  }

  return { material, rolls };
}

function buildLayersFromBlueprint(profile) {
  const layers = Array.isArray(profile?.layers) ? profile.layers : [];
  return layers.map((blueprint) => {
    const multiplierSegments = blueprint.multipliers.map((entry) => {
      if (typeof entry === "number") {
        return {
          type: "mult",
          value: entry,
          weight: 1,
        };
      }

      const parsedValue = Number(entry?.value);
      const parsedWeight = Number(entry?.weight);
      return {
        type: "mult",
        value: Number.isFinite(parsedValue) ? parsedValue : 0,
        weight: Number.isFinite(parsedWeight) ? Math.max(1, Math.round(parsedWeight)) : 1,
      };
    });

    const segments = [...multiplierSegments];

    if (blueprint.upSlices > 0) {
      segments.length = 0;
      const upSegments = Array.from({ length: blueprint.upSlices }, () => ({
        type: "up",
        value: null,
        weight: 1,
      }));

      let insertedUps = 0;
      const multiCount = multiplierSegments.length;

      for (let i = 0; i <= multiCount; i += 1) {
        const targetInserted = Math.round(((i + 1) / (multiCount + 1)) * upSegments.length);
        while (insertedUps < targetInserted && insertedUps < upSegments.length) {
          segments.push(upSegments[insertedUps]);
          insertedUps += 1;
        }
        if (i < multiCount) {
          segments.push(multiplierSegments[i]);
        }
      }
    }

    const totalWeight = segments.reduce(
      (sum, segment) => sum + Math.max(1, segment.weight || 1),
      0,
    );
    const upWeight = segments.reduce(
      (sum, segment) =>
        sum + (segment.type === "up" ? Math.max(1, segment.weight || 1) : 0),
      0,
    );
    const multiplierWeight = segments.reduce(
      (sum, segment) =>
        sum + (segment.type === "mult" ? Math.max(1, segment.weight || 1) : 0),
      0,
    );
    const multiplierWeightedSum = segments.reduce(
      (sum, segment) =>
        sum +
        (segment.type === "mult"
          ? segment.value * Math.max(1, segment.weight || 1)
          : 0),
      0,
    );

    const terminalMean = multiplierWeightedSum / Math.max(multiplierWeight, 1);

    return {
      name: blueprint.name,
      segments: segments.map((segment) => {
        const segmentWeight = Math.max(1, segment.weight || 1);
        return {
          ...segment,
          weight: segmentWeight,
          chance: segmentWeight / totalWeight,
          label:
            segment.type === "up"
              ? UP_SEGMENT_ICON
              : formatMultiplier(segment.value),
        };
      }),
      totalWeight,
      upChance: upWeight / totalWeight,
      terminalMean,
    };
  });
}

function expectedFromState(layerIndex, memo) {
  const key = String(layerIndex);
  if (memo.has(key)) {
    return memo.get(key);
  }

  const layer = state.layers[layerIndex];
  const upProbability = layer.upChance;
  const terminalProbability = 1 - upProbability;

  let expectation = terminalProbability * layer.terminalMean;
  if (upProbability > 0 && layerIndex < state.layers.length - 1) {
    expectation += upProbability * expectedFromState(layerIndex + 1, memo);
  }

  memo.set(key, expectation);
  return expectation;
}

function calculateTerminalLayerProbabilities() {
  const probabilities = state.layers.map(() => 0);
  let carry = 1;
  for (let i = 0; i < state.layers.length; i += 1) {
    const upProbability = state.layers[i].upChance;
    probabilities[i] = carry * (1 - upProbability);
    carry *= upProbability;
  }
  return probabilities;
}

function updateDerivedMath() {
  state.theoreticalRtp = expectedFromState(0, new Map());
  state.terminalLayerProbabilities = calculateTerminalLayerProbabilities();

  state.maxWinMultiplier = state.layers.reduce((max, layer) => {
    const layerMax = layer.segments
      .filter((segment) => segment.type === "mult")
      .reduce((innerMax, segment) => Math.max(innerMax, segment.value), 0);
    return Math.max(max, layerMax);
  }, 0);
}

function runMathSanityChecks(profile) {
  if (!profile) {
    throw new Error("Sanity failed: active wheel profile is missing.");
  }

  if (!state.layers.length) {
    throw new Error("Sanity failed: active wheel profile has no layers.");
  }

  if (state.maxWinMultiplier !== profile.maxWinMultiplier) {
    throw new Error(
      `Max path sanity failed for ${profile.label}: expected ${formatMultiplier(profile.maxWinMultiplier)}.`,
    );
  }

  const badLowMultiplier = state.layers
    .flatMap((layer) => layer.segments)
    .find((segment) => segment.type === "mult" && segment.value > 0 && segment.value < 2);

  if (badLowMultiplier) {
    throw new Error("Sanity failed: multipliers between 0x and 2x are not allowed.");
  }

  const expectedUpChances = Array.isArray(profile.expectedUpChances)
    ? profile.expectedUpChances
    : [];
  if (expectedUpChances.length !== state.layers.length) {
    throw new Error(
      `Sanity failed for ${profile.label}: expected UP-chance definitions for each layer.`,
    );
  }

  const upChanceMismatch = state.layers.find((layer, index) => {
    const expected = expectedUpChances[index];
    return Math.abs(layer.upChance - expected) > 1e-9;
  });

  if (upChanceMismatch) {
    throw new Error(`Sanity failed for ${profile.label}: UP chances drifted from profile config.`);
  }

  const targetRtp = Number.isFinite(profile.targetRtp) ? profile.targetRtp : TARGET_RTP;
  if (Math.abs(state.theoreticalRtp - targetRtp) > 0.001) {
    throw new Error(
      `Sanity failed for ${profile.label}: RTP moved to ${(state.theoreticalRtp * 100).toFixed(4)}%, expected ~${(targetRtp * 100).toFixed(2)}%.`,
    );
  }

  if (Number.isFinite(profile.finalLayerMinRewardChance)) {
    const finalRewardChance = getActiveFinalLayerRewardChance();
    if (finalRewardChance + 1e-9 < profile.finalLayerMinRewardChance) {
      throw new Error(
        `Sanity failed for ${profile.label}: final layer reward chance ${(finalRewardChance * 100).toFixed(2)}% is below ${(profile.finalLayerMinRewardChance * 100).toFixed(2)}%.`,
      );
    }
  }
}

function runPacingSanityChecks() {
  if (ZERO_MULTIPLIER_REVEAL_MS !== 0) {
    throw new Error("Pacing sanity failed: 0x reveal must be instant.");
  }
  if (LANDING_REVEAL_MS <= 0) {
    throw new Error("Pacing sanity failed: base landing reveal must be positive.");
  }
  if (BIG_REVEAL_MS <= LANDING_REVEAL_MS) {
    throw new Error("Pacing sanity failed: big reveal must be longer than base reveal.");
  }
}

function applyWheelProfile(profileKey, options = {}) {
  const {
    persist = true,
    announce = false,
    resetSimulation = true,
    refreshUi = true,
  } = options;

  const profile = getWheelProfileByKey(profileKey);
  if (!profile) {
    return false;
  }

  state.activeProfileKey = profile.key;
  state.activeProfile = profile;
  state.activeLayerIndex = 0;
  state.layers = buildLayersFromBlueprint(profile);
  state.layerRotations = state.layers.map(() => 0);
  state.layerGone = state.layers.map(() => false);
  state.latestOutcomeByLayer = state.layers.map(() => null);
  state.segmentHitsByLayer = state.layers.map((layer) => layer.segments.map(() => 0));
  state.upSegmentsGoneByLayer = state.layers.map((layer) => layer.segments.map(() => false));

  updateDerivedMath();
  runMathSanityChecks(profile);
  resetRoundVisualState();

  if (resetSimulation) {
    state.simulationLastBatch = null;
    state.simulationTopWins = [];
    state.simulationStats = null;
    renderSimulationTopWins([]);
    renderSimulationMetrics();
    renderSimulationTrendGraph();
    setSimulationReplayHint("Profile changed. Run a simulation batch first, then pick a spin.");
    setSimulationStatus(
      state.mode === "stake"
        ? "Profile switched. Local simulation uses this version; Stake settlement still comes from backend."
        : "Profile switched. Run a simulation batch to evaluate this version.",
    );
    if (els.simReplayInput) {
      els.simReplayInput.value = "";
    }
    updateSimulationReplayUi();
  }

  renderWheelProfileSelect();

  if (persist) {
    saveStorage(PROFILE_STORAGE_KEY, profile.key);
  }

  if (announce) {
    void profile;
  }

  if (refreshUi) {
    renderPaytable();
    updateHud();
    drawWheel();
  }

  return true;
}

function renderPaytable() {
  const rows = state.layers
    .map((layer, layerIndex) => {
      const multiplierSegments = layer.segments
        .filter((segment) => segment.type === "mult")
        .map((segment) => ({
          value: segment.value,
          weight: Math.max(1, segment.weight || 1),
        }));

      const nonZero = multiplierSegments.filter((segment) => segment.value > 0);
      const zeroWeight = multiplierSegments.reduce(
        (sum, segment) => sum + (segment.value === 0 ? segment.weight : 0),
        0,
      );
      const multiplierWeight = multiplierSegments.reduce((sum, segment) => sum + segment.weight, 0);
      const valueLine =
        nonZero.length > 0
          ? nonZero.map((segment) => formatMultiplier(segment.value)).join(" -> ")
          : "No payout slices";

      const upChanceText =
        layer.upChance > 0
          ? `UP chance ${(layer.upChance * 100).toFixed(2)}%`
          : "No UP (final layer)";

      const terminalChance = state.terminalLayerProbabilities[layerIndex] * 100;

      return `
        <div class="pay-layer">
          <div class="pay-layer-title">${layerIndex + 1}. ${layer.name}</div>
          <div class="pay-layer-values">Terminal hit chance at this layer: ${terminalChance.toFixed(3)}%</div>
          <div class="pay-layer-values">${upChanceText}</div>
          <div class="pay-layer-values">Non-zero ladder: ${valueLine}</div>
          <div class="pay-layer-values">Dead slices: ${zeroWeight}/${Math.max(1, multiplierWeight)}</div>
        </div>
      `;
    })
    .join("");

  const profileLabel = state.activeProfile?.label || "Wheel";
  els.paytable.innerHTML = `<h3>2-Hit Segment Math (${profileLabel})</h3>${rows}`;
}

function updateHud() {
  els.modeText.textContent = state.mode === "stake" ? "StakeEngine" : "Simulation";
  els.balanceText.textContent = formatMoney(state.balance.amount);
  els.winText.textContent = formatMoney(state.displayedWinAmount);
  els.betText.textContent = formatMoney(state.betAmount);
  if (els.betAmountInput && document.activeElement !== els.betAmountInput) {
    els.betAmountInput.value = formatBetInputValue(state.betAmount);
  }
  if (els.betAmountInput) {
    els.betAmountInput.min = formatBetInputValue(
      Number.isFinite(state.config.minBet) ? state.config.minBet : SIMULATED_CONFIG.minBet,
    );
    els.betAmountInput.max = formatBetInputValue(
      Number.isFinite(state.config.maxBet) ? state.config.maxBet : SIMULATED_CONFIG.maxBet,
    );
    els.betAmountInput.step = formatBetInputValue(
      Number.isFinite(state.config.stepBet) && state.config.stepBet > 0
        ? state.config.stepBet
        : SIMULATED_CONFIG.stepBet,
    );
  }
  els.layerIndexText.textContent = String(state.activeLayerIndex + 1);
  els.layerCountText.textContent = String(state.layers.length);
  els.livesText.textContent = `${SEGMENT_HITS_TO_BREAK}-hit`;
  els.maxPathText.textContent = formatMultiplier(state.maxWinMultiplier);

  const rtp = state.theoreticalRtp * 100;
  const targetRtp = Number.isFinite(state.activeProfile?.targetRtp)
    ? state.activeProfile.targetRtp
    : TARGET_RTP;
  const rtpDrift = Math.abs(state.theoreticalRtp - targetRtp);
  els.rtpText.textContent =
    rtpDrift <= RTP_DISPLAY_TOLERANCE ? `${rtp.toFixed(2)}%` : `${rtp.toFixed(2)}%*`;

  updateWheelProfileSummary();
}

function clearWinAnimation() {
  if (state.winAnimationFrame) {
    cancelAnimationFrame(state.winAnimationFrame);
    state.winAnimationFrame = null;
  }
}

function animateDisplayedWin(targetAmount, duration = 1200, superWin = false) {
  clearWinAnimation();
  const startValue = 0;
  const startTime = performance.now();

  replayClass(els.winText, superWin ? "win-super" : "win-pop");

  const frame = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    state.displayedWinAmount = Math.round(startValue + (targetAmount - startValue) * eased);
    els.winText.textContent = formatMoney(state.displayedWinAmount);

    if (progress < 1) {
      state.winAnimationFrame = requestAnimationFrame(frame);
    } else {
      state.displayedWinAmount = targetAmount;
      els.winText.textContent = formatMoney(state.displayedWinAmount);
      state.winAnimationFrame = null;
    }
  };

  state.winAnimationFrame = requestAnimationFrame(frame);
}

function syncBetFromConfig() {
  const configuredDefault = Number.isFinite(state.config.defaultBetLevel)
    ? state.config.defaultBetLevel
    : Number.isFinite(state.config.minBet)
      ? state.config.minBet
      : SIMULATED_CONFIG.defaultBetLevel;
  state.betAmount = clampBetAmount(configuredDefault);
  state.betIndex = 0;
}

async function loadStakeSdk() {
  try {
    const mod = await import("https://esm.sh/stake-engine@0.1.29?bundle");
    StakeSDK.DisplayAmount = mod.DisplayAmount ?? null;
    StakeSDK.ParseAmount = mod.ParseAmount ?? null;
    StakeSDK.RGSClient = mod.RGSClient ?? null;
    return true;
  } catch {
    StakeSDK.DisplayAmount = null;
    StakeSDK.ParseAmount = null;
    StakeSDK.RGSClient = null;
    return false;
  }
}

async function bootstrapSession() {
  if (!hasLiveSession()) {
    setStatus("Simulation mode ready");
    return;
  }

  if (!StakeSDK.RGSClient) {
    state.mode = "simulation";
    state.client = null;
    state.authenticated = false;
    setStatus("Stake SDK unavailable. Simulation mode ready.");
    return;
  }

  try {
    state.client = StakeSDK.RGSClient({
      url: buildClientUrl(),
      protocol: "https",
      enforceBetLevels: false,
    });

    const auth = await state.client.Authenticate();
    state.mode = "stake";
    state.authenticated = true;
    state.balance = auth.balance;
    state.config = auth.config;
    syncBetFromConfig();
    setStatus("StakeEngine session authenticated");
  } catch (error) {
    state.mode = "simulation";
    state.client = null;
    state.authenticated = false;
    state.balance = { ...SIMULATED_BALANCE };
    state.config = { ...SIMULATED_CONFIG };
    syncBetFromConfig();

    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Live connection failed (${message}). Simulation active.`);
  }
}

function setSpinDisabled(disabled) {
  state.spinning = disabled;
  els.spinButton.disabled = disabled;
  els.betDownButton.disabled = disabled || state.roundActive;
  els.betUpButton.disabled = disabled || state.roundActive;
  if (els.wheelProfileSelect) {
    els.wheelProfileSelect.disabled = disabled || state.roundActive;
  }
  els.applySeedButton.disabled = disabled || state.roundActive;
  els.rotateSeedButton.disabled = disabled || state.roundActive;
  els.clientSeedInput.disabled = disabled || state.roundActive;
  if (els.simButtons?.length) {
    for (const button of els.simButtons) {
      button.disabled = disabled || state.roundActive;
    }
  }
  updateSimulationReplayUi();
}

function getWheelGeometry() {
  const width =
    state.canvas.logicalWidth ||
    Math.max(1, Math.floor(els.wheelCanvas.getBoundingClientRect().width)) ||
    720;
  const height =
    state.canvas.logicalHeight ||
    Math.max(1, Math.floor(els.wheelCanvas.getBoundingClientRect().height)) ||
    720;
  const wheelSize = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const centerRadius = Math.max(44, Math.min(84, wheelSize * 0.105));
  const outerRadius = wheelSize / 2 - Math.max(12, wheelSize * 0.022);
  const ringThickness =
    state.layers.length > 0 ? (outerRadius - centerRadius) / state.layers.length : 0;

  return {
    width,
    height,
    cx,
    cy,
    centerRadius,
    outerRadius,
    ringThickness,
  };
}

function getCurrentActiveLayerIndex(layerGone) {
  const next = layerGone.findIndex((isGone) => !isGone);
  return next < 0 ? state.layers.length - 1 : next;
}

function getLayerTotalWeight(layer) {
  if (Number.isFinite(layer.totalWeight) && layer.totalWeight > 0) {
    return layer.totalWeight;
  }
  const fallbackWeight = layer.segments.reduce(
    (sum, segment) => sum + Math.max(1, segment.weight || 1),
    0,
  );
  return Math.max(1, fallbackWeight);
}

function getSegmentIndexFromAngle(layer, impactAngle, rotation) {
  const localAngle = normalizeAngle(impactAngle - normalizeAngle(rotation));
  const totalWeight = getLayerTotalWeight(layer);
  const localWeightPosition = (localAngle / (Math.PI * 2)) * totalWeight;
  let cumulativeWeight = 0;

  for (let index = 0; index < layer.segments.length; index += 1) {
    cumulativeWeight += Math.max(1, layer.segments[index].weight || 1);
    if (localWeightPosition < cumulativeWeight - 1e-9) {
      return index;
    }
  }

  return layer.segments.length - 1;
}

function getCenterPoint() {
  return {
    x: state.canvas.logicalWidth / 2,
    y: state.canvas.logicalHeight / 2,
  };
}

function normalizeVector(vector) {
  const magnitude = Math.hypot(vector.x, vector.y);
  if (magnitude <= 1e-9) {
    return { x: 1, y: 0 };
  }
  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

function rotateVector(vector, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
  };
}

function reflectVector(vector, normal) {
  const dot = vector.x * normal.x + vector.y * normal.y;
  return {
    x: vector.x - 2 * dot * normal.x,
    y: vector.y - 2 * dot * normal.y,
  };
}

function canvasFromLocal(local) {
  const center = getCenterPoint();
  return {
    x: center.x + local.x,
    y: center.y + local.y,
  };
}

function getTimeToCircleCollision(positionLocal, velocityLocal, radius) {
  const a = velocityLocal.x ** 2 + velocityLocal.y ** 2;
  const b = 2 * (positionLocal.x * velocityLocal.x + positionLocal.y * velocityLocal.y);
  const c = positionLocal.x ** 2 + positionLocal.y ** 2 - radius ** 2;
  const discriminant = b ** 2 - 4 * a * c;

  if (discriminant < -1e-9) {
    return null;
  }

  const sqrtDisc = Math.sqrt(Math.max(0, discriminant));
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  let best = Number.POSITIVE_INFINITY;
  if (t1 > COLLISION_EPSILON_SEC) {
    best = Math.min(best, t1);
  }
  if (t2 > COLLISION_EPSILON_SEC) {
    best = Math.min(best, t2);
  }

  return Number.isFinite(best) ? best : null;
}

function applyLayerRotationsForElapsed(plan, elapsedSeconds) {
  void elapsedSeconds;
  state.layerRotations = [...plan.initialLayerRotations];
}

async function animateLayersIntoStartRotation(plan) {
  const fullTurn = Math.PI * 2;
  const startRotations = [...state.layerRotations];
  const layerCount = Math.max(1, state.layers.length);
  const layerDurations = state.layers.map((_, index) => {
    const progress = layerCount <= 1 ? 0 : index / (layerCount - 1);
    return PRELAUNCH_INNER_LAYER_MS + (PRELAUNCH_OUTER_LAYER_MS - PRELAUNCH_INNER_LAYER_MS) * progress;
  });
  const endRotations = plan.initialLayerRotations.map((targetRotation, index) => {
    const startNorm = normalizeAngle(startRotations[index] || 0);
    const stopNorm = normalizeAngle(targetRotation);
    const deltaToStop = normalizeAngle(stopNorm - startNorm);
    const spinTurns = Math.max(1, Math.round(plan.preLaunchTurns[index] || 1));
    const extraTurns = fullTurn * spinTurns;
    return (startRotations[index] || 0) + extraTurns + deltaToStop;
  });
  const totalDuration = Math.max(...layerDurations, PRELAUNCH_INNER_LAYER_MS);
  const startTime = performance.now();

  await new Promise((resolve) => {
    const frame = (now) => {
      const elapsed = Math.min(now - startTime, totalDuration);
      let completedLayers = 0;
      state.layerRotations = startRotations.map((start, index) => {
        const progress = Math.min(elapsed / layerDurations[index], 1);
        if (progress >= 1) {
          completedLayers += 1;
        }
        const eased = easeInOutCubic(progress);
        return start + (endRotations[index] - start) * eased;
      });
      drawWheel();

      if (completedLayers < layerCount) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(frame);
  });

  state.layerRotations = [...plan.initialLayerRotations];
  drawWheel();
}

function pushBallTrail(position) {
  void position;
}

function resetRoundVisualState() {
  state.layerGone = state.layers.map(() => false);
  state.latestOutcomeByLayer = state.layers.map(() => null);
  state.segmentHitsByLayer = state.layers.map((layer) => layer.segments.map(() => 0));
  state.upSegmentsGoneByLayer = state.layers.map((layer) => layer.segments.map(() => false));
  state.revealState = null;
  state.finalWinFocus = null;
  state.breakEffect = null;
  state.ballTrail = [];
  state.ballVisible = true;
  const center = getCenterPoint();
  state.ballPosition = center;
}

function loadUpBreakTexture() {
  const image = new Image();
  image.decoding = "async";
  image.crossOrigin = "anonymous";
  image.onload = () => {
    state.upBreakTexture = image;
    drawWheel();
  };
  image.onerror = () => {
    state.upBreakTexture = null;
  };
  image.src = UP_BREAK_TEXTURE_URL;
}

function drawUpTextureInSlice(image, cx, cy, inner, outer, start, end) {
  const mid = start + (end - start) / 2;
  const textureSize = outer * 1.85;
  const drift = outer * 0.08;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, outer, start, end);
  ctx.arc(cx, cy, inner, end, start, true);
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = 0.26;
  ctx.drawImage(
    image,
    cx - textureSize / 2 + Math.cos(mid) * drift,
    cy - textureSize / 2 + Math.sin(mid) * drift,
    textureSize,
    textureSize,
  );
  ctx.restore();
}

function drawDoubleUpChevronGlyph(size, color) {
  const width = size * 0.88;
  const height = size * 0.34;
  const gap = size * 0.2;
  const topY = -height * 0.74;
  const bottomY = topY + height + gap;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.14);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  const drawChevron = (centerY) => {
    ctx.beginPath();
    ctx.moveTo(-width / 2, centerY + height / 2);
    ctx.lineTo(0, centerY - height / 2);
    ctx.lineTo(width / 2, centerY + height / 2);
    ctx.stroke();
  };

  drawChevron(topY);
  drawChevron(bottomY);
}

function drawLabel(text, midAngle, radius, fontSize, color = "#fef3cb", glow = false, centerX, centerY) {
  ctx.save();
  ctx.translate(
    centerX + Math.cos(midAngle) * radius,
    centerY + Math.sin(midAngle) * radius,
  );

  ctx.rotate(midAngle + Math.PI / 2);

  if (glow) {
    ctx.shadowColor = "#ffe3a3";
    ctx.shadowBlur = 14;
  }

  const isUpIcon = text === UP_SEGMENT_ICON;
  if (isUpIcon) {
    drawDoubleUpChevronGlyph(fontSize * 1.14, color);
  } else {
    ctx.fillStyle = color;
    ctx.font = `700 ${fontSize}px "Trebuchet MS", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

function getSegmentPalette(segment) {
  if (segment.type === "up") {
    return { fill: "#2f9bff", label: "#f5fbff" };
  }

  if (segment.value === 0) {
    return { fill: "#1a1d23", label: "#e9edf5" };
  }

  if (segment.value === 1000) {
    return { fill: "#f2c14f", label: "#ffffff" };
  }

  if (segment.value >= 250) {
    return { fill: "#20d095", label: "#ffffff" };
  }

  if (segment.value >= 100) {
    return { fill: "#2d7d72", label: "#ffffff" };
  }

  if (segment.value >= 40) {
    return { fill: "#5f4b7f", label: "#ffffff" };
  }

  if (segment.value >= 10) {
    return { fill: "#4d4469", label: "#ffffff" };
  }

  return { fill: "#2f3949", label: "#ffffff" };
}

function drawBreakEffect() {
  const effect = state.breakEffect;
  if (!effect) {
    return;
  }

  const now = performance.now();
  const progress = Math.min((now - effect.startTime) / effect.duration, 1);
  const fade = 1 - progress;

  for (const particle of effect.particles) {
    const x = particle.x + particle.vx * progress + particle.ax * progress ** 2;
    const y = particle.y + particle.vy * progress + particle.ay * progress ** 2;
    const size = Math.max(0.8, particle.size * fade);

    ctx.save();
    ctx.globalAlpha = Math.max(0, fade * particle.alpha);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (progress >= 1) {
    state.breakEffect = null;
  }
}

function drawBall() {
  if (!state.ballVisible) {
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.arc(state.ballPosition.x, state.ballPosition.y, BALL_RADIUS_PX, 0, Math.PI * 2);
  ctx.fillStyle = "#f7f8fb";
  ctx.shadowColor = "rgba(255, 255, 255, 0.55)";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#1b1f26";
  ctx.stroke();
  ctx.restore();

}

function drawWheel() {
  const { width, height, cx, cy, centerRadius, outerRadius, ringThickness } = getWheelGeometry();
  const now = performance.now();
  const labels = [];
  const hasFinalWinFocus = Boolean(state.finalWinFocus);
  const focusedOverlays = [];

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius + 7, 0, Math.PI * 2);
  ctx.fillStyle = "#151921";
  ctx.fill();

  state.layers.forEach((layer, layerIndex) => {
    const inner = centerRadius + layerIndex * ringThickness + 2;
    const outer = inner + ringThickness - 5;
    const rotation = normalizeAngle(state.layerRotations[layerIndex] || 0);
    const totalWeight = getLayerTotalWeight(layer);
    const layerRemoved = state.layerGone[layerIndex];
    let consumedWeight = 0;

    layer.segments.forEach((segment, segmentIndex) => {
      const segmentWeight = Math.max(1, segment.weight || 1);
      const sweep = (Math.PI * 2 * segmentWeight) / totalWeight;
      const start = rotation + (Math.PI * 2 * consumedWeight) / totalWeight;
      const end = start + sweep;
      const palette = getSegmentPalette(segment);
      const nextIndex = (segmentIndex + 1) % layer.segments.length;
      const prevIndex = (segmentIndex - 1 + layer.segments.length) % layer.segments.length;
      const nextSegment = layer.segments[nextIndex];
      const prevSegment = layer.segments[prevIndex];
      const nextWeight = Math.max(1, nextSegment?.weight || 1);
      const nextSweep = (Math.PI * 2 * nextWeight) / totalWeight;
      const upSegmentArmed = state.upSegmentsGoneByLayer[layerIndex]?.[segmentIndex] ?? false;
      const reveal =
        state.revealState &&
        state.revealState.layerIndex === layerIndex &&
        (state.revealState.segmentIndex === segmentIndex ||
          (state.revealState.span > 1 &&
            segmentIndex === (state.revealState.segmentIndex + 1) % layer.segments.length));
      const isMaxWin = segment.type === "mult" && segment.value === state.maxWinMultiplier;
      const mergedMaxWithNext =
        isMaxWin &&
        nextSegment?.type === "mult" &&
        nextSegment.value === state.maxWinMultiplier;
      const mergedMaxWithPrev =
        isMaxWin &&
        prevSegment?.type === "mult" &&
        prevSegment.value === state.maxWinMultiplier;
      const focusSpan = hasFinalWinFocus ? Math.max(1, state.finalWinFocus.span || 1) : 1;
      const isFocusedSegment =
        hasFinalWinFocus &&
        state.finalWinFocus.layerIndex === layerIndex &&
        (segmentIndex === state.finalWinFocus.segmentIndex ||
          (focusSpan > 1 &&
            segmentIndex === (state.finalWinFocus.segmentIndex + 1) % layer.segments.length));
      if (isFocusedSegment) {
        focusedOverlays.push({
          layerIndex,
          segmentIndex,
          segment,
          inner,
          outer,
          start,
          end,
          sweep,
          nextSweep,
          palette,
          layerRemoved,
          isMaxWin,
          mergedMaxWithNext,
          mergedMaxWithPrev,
          upSegmentArmed,
        });
      }

      ctx.beginPath();
      ctx.arc(cx, cy, outer, start, end);
      ctx.arc(cx, cy, inner, end, start, true);
      ctx.closePath();

      if (layerRemoved) {
        ctx.fillStyle = "rgba(8, 8, 12, 0.6)";
      } else if (segment.type === "up" && upSegmentArmed) {
        ctx.fillStyle = "rgba(26, 116, 224, 0.96)";
      } else {
        ctx.fillStyle = palette.fill;
      }
      ctx.fill();

      if (!layerRemoved && segment.type === "up" && !upSegmentArmed && state.upBreakTexture) {
        drawUpTextureInSlice(state.upBreakTexture, cx, cy, inner, outer, start, end);
      }

      if (hasFinalWinFocus && !isFocusedSegment) {
        ctx.save();
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = "#06080d";
        ctx.fill();
        ctx.restore();
      }

      if (reveal) {
        const pulse = 0.45 + 0.55 * (0.5 + Math.sin((now - state.revealState.startTime) / 80) * 0.5);
        ctx.save();
        ctx.globalAlpha = 0.3 + pulse * 0.25;
        ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.shadowColor = state.revealState.carnival ? "#ffe082" : "#f5f8ff";
        ctx.shadowBlur = state.revealState.carnival ? 20 : 12;
        ctx.strokeStyle = state.revealState.carnival ? "#ffd166" : "#f5f8ff";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();
      }

      const skipStartBorder = mergedMaxWithPrev;
      const skipEndBorder = mergedMaxWithNext;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, outer, start, end);
      if (!skipEndBorder) {
        ctx.lineTo(cx + Math.cos(end) * inner, cy + Math.sin(end) * inner);
      }
      ctx.arc(cx, cy, inner, end, start, true);
      if (!skipStartBorder) {
        ctx.lineTo(cx + Math.cos(start) * outer, cy + Math.sin(start) * outer);
      }
      ctx.strokeStyle = "#12161d";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      if (!layerRemoved && segment.type === "up" && upSegmentArmed) {
        const inset = Math.max(3, ringThickness * 0.11);
        const borderOuter = Math.max(inner + inset + 1, outer - inset);
        const borderInner = inner + inset;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, borderOuter, start + 0.012, end - 0.012);
        ctx.arc(cx, cy, borderInner, end - 0.012, start + 0.012, true);
        ctx.closePath();
        ctx.shadowColor = "rgba(132, 204, 255, 0.8)";
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(178, 226, 255, 0.98)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      const hitCount = state.segmentHitsByLayer[layerIndex]?.[segmentIndex] ?? 0;
      if (
        !layerRemoved &&
        segment.type === "mult" &&
        hitCount > 0 &&
        hitCount < SEGMENT_HITS_TO_BREAK
      ) {
        const inset = Math.max(3, ringThickness * 0.11);
        const borderOuter = Math.max(inner + inset + 1, outer - inset);
        const borderInner = inner + inset;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, borderOuter, start + 0.015, end - 0.015);
        ctx.arc(cx, cy, borderInner, end - 0.015, start + 0.015, true);
        ctx.closePath();
        ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = 12;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
        ctx.lineWidth = 2.4;
        ctx.stroke();
        ctx.restore();
      }

      if (
        !layerRemoved &&
        sweep >= 0.11 &&
        !mergedMaxWithPrev &&
        (!hasFinalWinFocus || isFocusedSegment)
      ) {
        const mid = start + sweep / 2;
        const labelRadius = (inner + outer) / 2;
        const labelFont = Math.max(8, Math.min(14, ringThickness * 0.33));
        const maxWinLabelScale = segment.value === state.maxWinMultiplier ? 1.65 : 1;
        labels.push({
          text: segment.label,
          angle: mergedMaxWithNext ? start + (sweep + nextSweep) / 2 : mid,
          radius: labelRadius,
          font: isMaxWin
            ? labelFont * (mergedMaxWithNext ? maxWinLabelScale * 1.18 : maxWinLabelScale)
            : labelFont,
          color: palette.label,
          glow: false,
        });
      }

      consumedWeight += segmentWeight;

    });

    if (layerRemoved) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, (inner + outer) / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(170, 180, 198, 0.5)";
      ctx.setLineDash([6, 8]);
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  });

  if (hasFinalWinFocus && focusedOverlays.length > 0) {
    for (const overlay of focusedOverlays) {
      if (overlay.layerRemoved) {
        continue;
      }

      ctx.beginPath();
      ctx.arc(cx, cy, overlay.outer, overlay.start, overlay.end);
      ctx.arc(cx, cy, overlay.inner, overlay.end, overlay.start, true);
      ctx.closePath();

      if (overlay.segment.type === "up" && overlay.upSegmentArmed) {
        ctx.fillStyle = "rgba(26, 116, 224, 0.96)";
      } else {
        ctx.fillStyle = overlay.palette.fill;
      }
      ctx.fill();

      if (overlay.segment.type === "up" && !overlay.upSegmentArmed && state.upBreakTexture) {
        drawUpTextureInSlice(
          state.upBreakTexture,
          cx,
          cy,
          overlay.inner,
          overlay.outer,
          overlay.start,
          overlay.end,
        );
      }

      const skipStartBorder = overlay.mergedMaxWithPrev;
      const skipEndBorder = overlay.mergedMaxWithNext;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, overlay.outer, overlay.start, overlay.end);
      if (!skipEndBorder) {
        ctx.lineTo(
          cx + Math.cos(overlay.end) * overlay.inner,
          cy + Math.sin(overlay.end) * overlay.inner,
        );
      }
      ctx.arc(cx, cy, overlay.inner, overlay.end, overlay.start, true);
      if (!skipStartBorder) {
        ctx.lineTo(
          cx + Math.cos(overlay.start) * overlay.outer,
          cy + Math.sin(overlay.start) * overlay.outer,
        );
      }
      ctx.strokeStyle = "#12161d";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.globalAlpha = 1;
      if (overlay.isMaxWin) {
        ctx.shadowBlur = 0;
      } else {
        ctx.shadowColor = "#f4d37b";
        ctx.shadowBlur = 22;
      }
      ctx.strokeStyle = "#f8e0a0";
      ctx.lineWidth = 4.2;
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.beginPath();
  ctx.arc(cx, cy, centerRadius - 8, 0, Math.PI * 2);
  ctx.fillStyle = "#10151d";
  ctx.fill();
  ctx.strokeStyle = "#f8e0a0";
  ctx.lineWidth = 3;
  ctx.stroke();

  labels.forEach((label) => {
    drawLabel(label.text, label.angle, label.radius, label.font, label.color, label.glow, cx, cy);
  });

  drawBreakEffect();
  drawBall();
}

function mapProgressForFinalHitSlowdown(progress, slowdownFactor) {
  const clampedProgress = clamp01(progress);
  const exponent = Math.max(1, slowdownFactor);
  if (exponent <= 1.001) {
    return clampedProgress;
  }
  // Cubic Hermite remap with non-zero end slope:
  // starts at full speed (relative to base segment speed), then eases into a slower end speed.
  const startSlope = exponent;
  const endSlope = exponent * FINAL_HIT_END_SPEED_RATIO;
  const t = clampedProgress;
  const t2 = t * t;
  const t3 = t2 * t;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;
  const remapped = h10 * startSlope + h01 + h11 * endSlope;
  return clamp01(remapped);
}

async function animateBallSegment(
  startLocal,
  endLocal,
  durationSec,
  plan,
  elapsedStartSec,
  options = {},
) {
  const durationMs = Math.max(16, durationSec * 1000);
  const startTime = performance.now();
  const easeIntoSlowdown = Boolean(options.easeIntoSlowdown);
  const slowdownFactor = Number.isFinite(options.slowdownFactor)
    ? Math.max(1, options.slowdownFactor)
    : 1;

  await new Promise((resolve) => {
    const frame = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const movementProgress = easeIntoSlowdown
        ? mapProgressForFinalHitSlowdown(progress, slowdownFactor)
        : progress;
      const local = {
        x: startLocal.x + (endLocal.x - startLocal.x) * movementProgress,
        y: startLocal.y + (endLocal.y - startLocal.y) * movementProgress,
      };

      applyLayerRotationsForElapsed(plan, elapsedStartSec + durationSec * progress);
      state.ballPosition = canvasFromLocal(local);
      pushBallTrail(state.ballPosition);
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(frame);
  });
}

function startLayerBreakEffect(event) {
  const { cx, cy } = getWheelGeometry();
  const impactCanvas = canvasFromLocal(event.endLocal);
  const particles = [];
  const particleCount = 24;

  for (let i = 0; i < particleCount; i += 1) {
    const t = i / particleCount;
    const angle = event.impactAngle + (t - 0.5) * Math.PI * 1.35;
    const speed = 42 + (i % 5) * 14;
    particles.push({
      x: impactCanvas.x,
      y: impactCanvas.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      ax: (impactCanvas.x - cx) * 0.03,
      ay: (impactCanvas.y - cy) * 0.03,
      size: 1.6 + (i % 4) * 0.8,
      alpha: 0.75 + (i % 3) * 0.08,
      color: i % 2 === 0 ? "#9fd6ff" : "#e8f4ff",
    });
  }

  state.breakEffect = {
    startTime: performance.now(),
    duration: BREAK_EFFECT_MS,
    particles,
  };
}

async function playBreakEffect(plan, elapsedStartSec) {
  const startTime = performance.now();
  await new Promise((resolve) => {
    const frame = (now) => {
      const progress = Math.min((now - startTime) / BREAK_EFFECT_MS, 1);
      applyLayerRotationsForElapsed(plan, elapsedStartSec + (BREAK_EFFECT_MS / 1000) * progress);
      drawWheel();
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });
  return BREAK_EFFECT_MS / 1000;
}

async function playLandingReveal(event, plan, elapsedStartSec) {
  const isCarnival =
    event.segment.type === "mult" &&
    (event.segment.value >= 50 || event.segment.value === state.maxWinMultiplier);
  let duration = isCarnival ? BIG_REVEAL_MS : LANDING_REVEAL_MS;
  if (event.segment.type === "mult" && event.segment.value === 0) {
    duration = ZERO_MULTIPLIER_REVEAL_MS;
  }
  if (duration <= 0) {
    state.revealState = null;
    drawWheel();
    return 0;
  }
  const startTime = performance.now();
  let revealSegmentIndex = event.segmentIndex;
  let revealSpan = 1;
  const revealLayer = state.layers[event.layerIndex];
  if (
    revealLayer &&
    event.segment.type === "mult" &&
    event.segment.value === state.maxWinMultiplier
  ) {
    const nextIndex = (event.segmentIndex + 1) % revealLayer.segments.length;
    const prevIndex = (event.segmentIndex - 1 + revealLayer.segments.length) % revealLayer.segments.length;
    const nextSegment = revealLayer.segments[nextIndex];
    const prevSegment = revealLayer.segments[prevIndex];
    if (nextSegment?.type === "mult" && nextSegment.value === state.maxWinMultiplier) {
      revealSpan = 2;
    } else if (prevSegment?.type === "mult" && prevSegment.value === state.maxWinMultiplier) {
      revealSegmentIndex = prevIndex;
      revealSpan = 2;
    }
  }

  state.revealState = {
    layerIndex: event.layerIndex,
    segmentIndex: revealSegmentIndex,
    span: revealSpan,
    startTime,
    carnival: isCarnival,
  };

  await new Promise((resolve) => {
    const frame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      applyLayerRotationsForElapsed(plan, elapsedStartSec + (duration / 1000) * progress);
      drawWheel();
      if (now < startTime + duration) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(frame);
  });

  state.revealState = null;
  drawWheel();
  return duration / 1000;
}

function canAffordCurrentBet() {
  return state.balance.amount >= state.betAmount;
}

async function beginStakeRound() {
  const response = await state.client.Play({
    amount: state.betAmount,
    mode: "base",
  });

  state.liveRound = response.round;
  state.balance = response.balance;
}

async function endStakeRound() {
  const before = state.balance.amount;
  if (state.liveRound?.active) {
    const end = await state.client.EndRound();
    state.balance = end.balance;
  }
  state.liveRound = null;
  return Math.max(0, state.balance.amount - before);
}

function beginSimulationRound() {
  state.balance.amount -= state.betAmount;
}

function applySimulationPayout(multiplier) {
  const payoutAmount = Math.floor(state.betAmount * multiplier);
  state.balance.amount += payoutAmount;
  state.lastWinAmount = payoutAmount;
  state.lastResolvedMultiplier = multiplier;

  if (multiplier >= 20) {
    animateDisplayedWin(payoutAmount, 1450, true);
  } else {
    state.displayedWinAmount = payoutAmount;
    els.winText.textContent = formatMoney(state.displayedWinAmount);
    replayClass(els.winText, "win-pop");
  }
}

async function simulateSpins(count) {
  if (!Number.isFinite(count) || count <= 0) {
    return;
  }
  if (state.spinning || state.roundActive) {
    setStatus("Wait for the current launch to finish before simulation.");
    return;
  }

  setSpinDisabled(true);
  const localTop = [];
  const baseNonce = state.provablyFair.nonce + state.simulationNonceCursor;
  let processedSpins = 0;
  let totalSimulatedReturn = 0;
  let totalSimulatedWager = 0;
  let cumulativeNet = 0;
  let totalMultiplier = 0;
  let hitCount = 0;
  let zeroCount = 0;
  const trendPoints = [{ spin: 0, net: 0 }];
  const trendSampleStep = Math.max(1, Math.floor(count / SIMULATION_GRAPH_MAX_POINTS));
  const progressStep = count >= 100000 ? 1000 : count >= 10000 ? 250 : 50;
  const startedAt = performance.now();

  try {
    setSimulationStatus(
      state.mode === "stake"
        ? `Simulating ${formatCompactNumber(count)} local spins (Stake payout is not affected)...`
        : `Simulating ${formatCompactNumber(count)} spins...`,
    );
    state.simulationLastBatch = null;
    state.simulationTopWins = [];
    state.simulationStats = null;
    renderSimulationTopWins([]);
    renderSimulationMetrics();
    renderSimulationTrendGraph();
    updateSimulationReplayUi();

    for (let i = 0; i < count; i += 1) {
      const plan = await buildRoundPlan(baseNonce + i);
      processedSpins += 1;
      const multiplier = plan.winner.segment.value;
      const winAmount = Math.floor(state.betAmount * multiplier);
      totalSimulatedReturn += winAmount;
      totalSimulatedWager += state.betAmount;
      totalMultiplier += multiplier;
      if (multiplier > 0) {
        hitCount += 1;
      } else {
        zeroCount += 1;
      }
      cumulativeNet += winAmount - state.betAmount;
      if ((i + 1) % trendSampleStep === 0 || i === count - 1) {
        trendPoints.push({
          spin: i + 1,
          net: cumulativeNet,
        });
      }
      const layerName = state.layers[plan.winner.layerIndex]?.name ?? "Unknown Layer";

      recordSimulationTopWin(localTop, {
        spin: i + 1,
        multiplier,
        winAmount,
        layerName,
      });

      if ((i + 1) % progressStep === 0 || i === count - 1) {
        state.simulationTopWins = [...localTop];
        renderSimulationTopWins();
        const elapsedSeconds = Math.max((performance.now() - startedAt) / 1000, 0.001);
        const completed = i + 1;
        const spinsPerSecond = completed / elapsedSeconds;
        const remainingSpins = count - completed;
        const etaSeconds = remainingSpins / Math.max(spinsPerSecond, 0.001);
        const progressPercent = (completed / count) * 100;
        setSimulationStatus(
          `Simulating ${formatCompactNumber(count)} spins... ${formatCompactNumber(completed)}/${formatCompactNumber(count)} (${progressPercent.toFixed(1)}%), ETA ${formatDuration(etaSeconds)}.`,
        );
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    }

    const best = localTop[0] ?? null;
    const net = totalSimulatedReturn - totalSimulatedWager;
    const rtpPercent =
      totalSimulatedWager > 0 ? (totalSimulatedReturn / totalSimulatedWager) * 100 : 0;
    const edgePercent = 100 - rtpPercent;
    const hitRatePercent = processedSpins > 0 ? (hitCount / processedSpins) * 100 : 0;
    const zeroRatePercent = processedSpins > 0 ? (zeroCount / processedSpins) * 100 : 0;
    const avgMultiplier = processedSpins > 0 ? totalMultiplier / processedSpins : 0;

    state.simulationTopWins = [...localTop];
    state.simulationStats = {
      count: processedSpins,
      totalWager: totalSimulatedWager,
      totalReturn: totalSimulatedReturn,
      net,
      rtpPercent,
      edgePercent,
      hitRatePercent,
      zeroRatePercent,
      avgMultiplier,
      best,
      trendPoints,
    };
    state.simulationLastBatch = {
      baseNonce,
      count: processedSpins,
    };
    renderSimulationTopWins();
    renderSimulationMetrics();
    renderSimulationTrendGraph();

    if (els.simReplayInput && best) {
      els.simReplayInput.value = String(best.spin);
    }
    updateSimulationReplayUi();
    if (best) {
      setSimulationStatus(
        `Done ${formatCompactNumber(count)} spins. RTP ${formatPercent(rtpPercent)}. Net ${formatSignedMoney(net)}. Best ${formatMultiplier(best.multiplier)} on spin ${formatCompactNumber(best.spin)}.`,
      );
      setSimulationReplayHint(
        `Batch ready. Replays available for spins 1-${formatCompactNumber(processedSpins)}.`,
      );
    } else {
      setSimulationStatus(`Done ${formatCompactNumber(count)} spins.`);
      setSimulationReplayHint("Batch complete but no replayable spins were found.");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    state.simulationLastBatch = null;
    state.simulationStats = null;
    renderSimulationMetrics();
    renderSimulationTrendGraph();
    updateSimulationReplayUi();
    setSimulationStatus(`Simulation failed: ${message}`);
  } finally {
    state.simulationNonceCursor += processedSpins;
    setSpinDisabled(false);
    updateHud();
  }
}

async function replaySimulationSpin(spinOverride) {
  if (state.spinning || state.roundActive) {
    setStatus("Wait for the current launch to finish before replay.");
    return;
  }

  const batch = state.simulationLastBatch;
  if (!batch || batch.count < 1) {
    setSimulationStatus("Run a simulation batch first, then replay a specific spin.");
    updateSimulationReplayUi();
    return;
  }

  const requestedSpin = Number.parseInt(
    Number.isFinite(spinOverride) ? String(spinOverride) : els.simReplayInput?.value || "",
    10,
  );

  if (!Number.isFinite(requestedSpin) || requestedSpin < 1 || requestedSpin > batch.count) {
    setSimulationReplayHint(`Pick a spin from 1 to ${formatCompactNumber(batch.count)}.`);
    updateSimulationReplayUi();
    return;
  }

  const spinNumber = requestedSpin;
  const replayNonce = batch.baseNonce + (spinNumber - 1);

  setSpinDisabled(true);
  state.roundActive = true;

  try {
    clearWinAnimation();
    resetRoundVisualState();
    state.activeLayerIndex = 0;

    const plan = await buildRoundPlan(replayNonce);
    const winningMultiplier = plan.winner.segment.value;
    const layerName = state.layers[plan.winner.layerIndex]?.name ?? "Unknown Layer";

    state.lastResolvedMultiplier = winningMultiplier;
    state.lastWinAmount = Math.floor(state.betAmount * winningMultiplier);
    state.displayedWinAmount = state.lastWinAmount;
    els.winText.textContent = formatMoney(state.displayedWinAmount);
    replayClass(els.winText, "win-pop");

    updateHud();
    drawWheel();
    await animateLayersIntoStartRotation(plan);

    await playRoundPlan(plan);

    state.activeLayerIndex = 0;
    setStatus("Replay complete (no balance change).");
    setSimulationStatus(
      `Replayed spin ${formatCompactNumber(spinNumber)}/${formatCompactNumber(batch.count)}: ${formatMultiplier(winningMultiplier)} on ${layerName}.`,
    );
    if (els.simReplayInput) {
      els.simReplayInput.value = String(spinNumber);
    }
    updateSimulationReplayUi();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Replay failed: ${message}`);
  } finally {
    state.roundActive = false;
    state.activeLayerIndex = 0;
    updateHud();
    drawWheel();
    setSpinDisabled(false);
  }
}

async function buildRoundPlan(nonceOverride = state.provablyFair.nonce) {
  const nonce = nonceOverride;
  const { material, rolls } = await createFairRolls(
    state.provablyFair.serverSeed,
    state.provablyFair.clientSeed,
    nonce,
    FAIR_ROLL_COUNT,
  );

  let cursor = 0;
  const nextRoll = () => {
    const roll = rolls[cursor % rolls.length];
    cursor += 1;
    return roll;
  };

  const initialLayerRotations = state.layers.map(() => normalizeAngle(nextRoll() * Math.PI * 2));
  const preLaunchTurns = state.layers.map(
    () => PRELAUNCH_MIN_TURNS + nextRoll() * (PRELAUNCH_MAX_TURNS - PRELAUNCH_MIN_TURNS),
  );
  const geometry = getWheelGeometry();
  const activeRadii = state.layers.map(
    (_, index) =>
      geometry.centerRadius + index * geometry.ringThickness + 2 - BALL_RADIUS_PX,
  );

  const layerGone = state.layers.map(() => false);
  const segmentHits = state.layers.map((layer) => layer.segments.map(() => 0));
  const upSegmentsGone = state.layers.map((layer) => layer.segments.map(() => false));
  const collisions = [];
  let elapsedSeconds = 0;
  let winnerEvent = null;

  const launchAngle = normalizeAngle(nextRoll() * Math.PI * 2);
  let positionLocal = { x: 0, y: 0 };
  let visualStartLocal = { x: 0, y: 0 };
  let velocityLocal = {
    x: Math.cos(launchAngle) * BALL_SPEED_PX_PER_SEC,
    y: Math.sin(launchAngle) * BALL_SPEED_PX_PER_SEC,
  };

  let guard = 0;
  while (!winnerEvent && guard < MAX_COLLISIONS_PER_ROUND) {
    guard += 1;

    const layerIndex = getCurrentActiveLayerIndex(layerGone);
    const layer = state.layers[layerIndex];
    const activeRadius = activeRadii[layerIndex];

    let hitTime = getTimeToCircleCollision(positionLocal, velocityLocal, activeRadius);
    if (!hitTime) {
      const radialDistance = Math.hypot(positionLocal.x, positionLocal.y);
      const radialNormal =
        radialDistance > 1e-6
          ? { x: positionLocal.x / radialDistance, y: positionLocal.y / radialDistance }
          : normalizeVector(velocityLocal);
      const tangent = { x: -radialNormal.y, y: radialNormal.x };
      const tangentBias = (nextRoll() - 0.5) * 0.36;
      const correctedDirection = normalizeVector({
        x: -radialNormal.x + tangent.x * tangentBias,
        y: -radialNormal.y + tangent.y * tangentBias,
      });
      velocityLocal = {
        x: correctedDirection.x * BALL_SPEED_PX_PER_SEC,
        y: correctedDirection.y * BALL_SPEED_PX_PER_SEC,
      };

      const clampedRadius = Math.max(0, Math.min(activeRadius - 0.25, radialDistance));
      positionLocal = {
        x: radialNormal.x * clampedRadius,
        y: radialNormal.y * clampedRadius,
      };
      hitTime = getTimeToCircleCollision(positionLocal, velocityLocal, activeRadius);
    }
    if (!hitTime) {
      const bias = nextRoll() - 0.5;
      const emergencyDirection = normalizeVector({
        x: -positionLocal.x + bias * 0.01,
        y: -positionLocal.y - bias * 0.01,
      });
      velocityLocal = {
        x: emergencyDirection.x * BALL_SPEED_PX_PER_SEC,
        y: emergencyDirection.y * BALL_SPEED_PX_PER_SEC,
      };
      hitTime = COLLISION_EPSILON_SEC * 2;
    }

    const impactLocal = {
      x: positionLocal.x + velocityLocal.x * hitTime,
      y: positionLocal.y + velocityLocal.y * hitTime,
    };
    elapsedSeconds += hitTime;

    const impactAngle = normalizeAngle(Math.atan2(impactLocal.y, impactLocal.x));
    const rotationAtImpact = initialLayerRotations[layerIndex];
    const segmentIndex = getSegmentIndexFromAngle(layer, impactAngle, rotationAtImpact);
    const segment = layer.segments[segmentIndex];
    const travelDistance = Math.hypot(
      impactLocal.x - visualStartLocal.x,
      impactLocal.y - visualStartLocal.y,
    );
    const travelSeconds = travelDistance / BALL_SPEED_PX_PER_SEC;
    const hitsBefore = segmentHits[layerIndex][segmentIndex];
    let hitsAfter = hitsBefore;
    let brokeSegment = false;
    let brokeLayer = false;
    let isWinningHit = false;
    let passThroughUp = false;
    let armedUpOnHit = false;

    if (segment.type === "up") {
      if (upSegmentsGone[layerIndex][segmentIndex]) {
        hitsAfter = SEGMENT_HITS_TO_BREAK;
        segmentHits[layerIndex][segmentIndex] = hitsAfter;
        brokeSegment = true;
        passThroughUp = true;
        brokeLayer = true;
      } else {
        hitsAfter = 1;
        segmentHits[layerIndex][segmentIndex] = hitsAfter;
        upSegmentsGone[layerIndex][segmentIndex] = true;
        armedUpOnHit = true;
      }
    } else {
      hitsAfter = Math.min(SEGMENT_HITS_TO_BREAK, hitsBefore + 1);
      segmentHits[layerIndex][segmentIndex] = hitsAfter;
      brokeSegment = hitsAfter >= SEGMENT_HITS_TO_BREAK;
      isWinningHit = brokeSegment;
    }

    const event = {
      layerIndex,
      segmentIndex,
      segment,
      impactAngle,
      startLocal: { ...visualStartLocal },
      endLocal: { ...impactLocal },
      travelSeconds,
      impactTimeSeconds: elapsedSeconds,
      hitsBefore,
      hitsAfter,
      brokeSegment,
      brokeLayer,
      isWinningHit,
      passThroughUp,
      armedUpOnHit,
    };

    if (brokeLayer) {
      layerGone[layerIndex] = true;
    }

    if (isWinningHit) {
      winnerEvent = event;
    } else if (passThroughUp) {
      // Keep trajectory unchanged while the armed UP segment burns the layer.
    } else {
      const normal = normalizeVector(impactLocal);
      const reflected = reflectVector(velocityLocal, normal);
      const jitter = (nextRoll() - 0.5) * 2 * REFLECT_JITTER_MAX_RAD;
      const sway = (nextRoll() - 0.5) * 2 * REFLECT_SWAY_MAX_RAD;
      const reflectedDirection = normalizeVector(rotateVector(reflected, jitter + sway));
      const inwardDot = reflectedDirection.x * normal.x + reflectedDirection.y * normal.y;
      let safeDirection = reflectedDirection;
      if (inwardDot > -0.02) {
        const tangent = { x: -normal.y, y: normal.x };
        const tangentSign = nextRoll() < 0.5 ? -1 : 1;
        safeDirection = normalizeVector({
          x: -normal.x * 0.92 + tangent.x * tangentSign * 0.38,
          y: -normal.y * 0.92 + tangent.y * tangentSign * 0.38,
        });
      }
      velocityLocal = {
        x: safeDirection.x * BALL_SPEED_PX_PER_SEC,
        y: safeDirection.y * BALL_SPEED_PX_PER_SEC,
      };
    }

    collisions.push(event);
    visualStartLocal = { ...impactLocal };
    positionLocal = {
      x: impactLocal.x + velocityLocal.x * COLLISION_EPSILON_SEC,
      y: impactLocal.y + velocityLocal.y * COLLISION_EPSILON_SEC,
    };
  }

  if (!winnerEvent) {
    const fallbackLayerIndex = getCurrentActiveLayerIndex(layerGone);
    const fallbackLayer = state.layers[fallbackLayerIndex];
    const fallbackAngle = normalizeAngle(Math.atan2(positionLocal.y, positionLocal.x));
    const multiplierIndexes = fallbackLayer.segments
      .map((segment, index) => (segment.type === "mult" ? index : -1))
      .filter((index) => index >= 0);

    const safeMultiplierIndexes =
      multiplierIndexes.length > 0
        ? multiplierIndexes
        : state.layers[0].segments
            .map((segment, index) => (segment.type === "mult" ? index : -1))
            .filter((index) => index >= 0);

    const chosenIndex =
      safeMultiplierIndexes[Math.floor(nextRoll() * safeMultiplierIndexes.length) % safeMultiplierIndexes.length];
    const chosenSegment =
      multiplierIndexes.length > 0
        ? fallbackLayer.segments[chosenIndex]
        : state.layers[0].segments[chosenIndex];
    const fallbackEvent = {
      layerIndex: multiplierIndexes.length > 0 ? fallbackLayerIndex : 0,
      segmentIndex: chosenIndex,
      segment: chosenSegment,
      impactAngle: fallbackAngle,
      startLocal: { ...visualStartLocal },
      endLocal: { ...positionLocal },
      travelSeconds: 0,
      impactTimeSeconds: elapsedSeconds,
      hitsBefore: SEGMENT_HITS_TO_BREAK - 1,
      hitsAfter: SEGMENT_HITS_TO_BREAK,
      brokeSegment: true,
      brokeLayer: false,
      isWinningHit: true,
      passThroughUp: false,
      armedUpOnHit: false,
    };
    collisions.push(fallbackEvent);
    winnerEvent = fallbackEvent;
  }

  if (collisions.length === 0) {
    const fallbackLayer = state.layers[0];
    const fallbackIndex = Math.max(
      0,
      fallbackLayer.segments.findIndex((segment) => segment.type === "mult"),
    );
    const fallbackSegment = fallbackLayer.segments[fallbackIndex];
    const fallbackEvent = {
      layerIndex: 0,
      segmentIndex: fallbackIndex,
      segment: fallbackSegment,
      impactAngle: 0,
      startLocal: { x: 0, y: 0 },
      endLocal: { x: 0, y: 0 },
      travelSeconds: 0,
      impactTimeSeconds: 0,
      hitsBefore: SEGMENT_HITS_TO_BREAK - 1,
      hitsAfter: SEGMENT_HITS_TO_BREAK,
      brokeSegment: true,
      brokeLayer: false,
      isWinningHit: true,
      passThroughUp: false,
      armedUpOnHit: false,
    };
    collisions.push(fallbackEvent);
    winnerEvent = fallbackEvent;
  }

  const roundHash = await sha256Hex(`${material}:round`);

  return {
    nonce,
    roundHash,
    material,
    initialLayerRotations,
    preLaunchTurns,
    collisions,
    winner: winnerEvent,
  };
}

async function playRoundPlan(plan) {
  state.layerRotations = [...plan.initialLayerRotations];
  state.layerGone = state.layers.map(() => false);
  state.latestOutcomeByLayer = state.layers.map(() => null);
  state.segmentHitsByLayer = state.layers.map((layer) => layer.segments.map(() => 0));
  state.upSegmentsGoneByLayer = state.layers.map((layer) => layer.segments.map(() => false));
  state.revealState = null;
  state.ballTrail = [];
  state.ballVisible = true;
  state.activeLayerIndex = 0;
  state.ballPosition = canvasFromLocal({ x: 0, y: 0 });
  let elapsedSeconds = 0;
  drawWheel();

  for (const event of plan.collisions) {
    state.activeLayerIndex = event.layerIndex;

    updateHud();
    const layerSpeedScale = getLayerTravelTimeScale(event.layerIndex, state.layers.length);
    const isZeroMultiplierWin =
      event.isWinningHit && event.segment.type === "mult" && event.segment.value === 0;
    const shatterScale = event.isWinningHit && !isZeroMultiplierWin ? FINAL_HIT_SLOW_FACTOR : 1;
    const travelScale = layerSpeedScale * shatterScale;
    await animateBallSegment(
      event.startLocal,
      event.endLocal,
      event.travelSeconds * travelScale,
      plan,
      elapsedSeconds,
      {
        easeIntoSlowdown: event.isWinningHit && !isZeroMultiplierWin,
        slowdownFactor: shatterScale,
      },
    );
    elapsedSeconds += event.travelSeconds * travelScale;

    state.segmentHitsByLayer[event.layerIndex][event.segmentIndex] = event.hitsAfter;
    if (event.segment.type === "up") {
      if (event.armedUpOnHit) {
        playSfx("upArm", { playbackRate: 0.96 + Math.random() * 0.18 });
      }
    } else {
      playSfx("collision", { playbackRate: 0.9 + Math.random() * 0.2 });
    }

    if (event.armedUpOnHit) {
      state.upSegmentsGoneByLayer[event.layerIndex][event.segmentIndex] = true;
    }
    if (event.isWinningHit) {
      const focus = {
        layerIndex: event.layerIndex,
        segmentIndex: event.segmentIndex,
        span: 1,
      };
      const focusLayer = state.layers[event.layerIndex];
      const focusSegment = focusLayer?.segments[event.segmentIndex];
      if (focusLayer && focusSegment?.type === "mult" && focusSegment.value === state.maxWinMultiplier) {
        const nextIndex = (event.segmentIndex + 1) % focusLayer.segments.length;
        const prevIndex = (event.segmentIndex - 1 + focusLayer.segments.length) % focusLayer.segments.length;
        const nextSegment = focusLayer.segments[nextIndex];
        const prevSegment = focusLayer.segments[prevIndex];
        if (nextSegment?.type === "mult" && nextSegment.value === state.maxWinMultiplier) {
          focus.span = 2;
        } else if (prevSegment?.type === "mult" && prevSegment.value === state.maxWinMultiplier) {
          focus.segmentIndex = prevIndex;
          focus.span = 2;
        }
      }
      state.finalWinFocus = focus;
    }
    updateHud();
    drawWheel();

    if (event.brokeLayer) {
      state.layerGone[event.layerIndex] = true;
      playSfx("upBreakthrough", { playbackRate: 0.94 + Math.random() * 0.12 });
      startLayerBreakEffect(event);
      const breakSeconds = await playBreakEffect(plan, elapsedSeconds);
      elapsedSeconds += breakSeconds;
      state.activeLayerIndex = getCurrentActiveLayerIndex(state.layerGone);
      updateHud();
      drawWheel();
      continue;
    }

    if (event.segment.type === "up") {
      updateHud();
      continue;
    }

    const revealSeconds = await playLandingReveal(event, plan, elapsedSeconds);
    elapsedSeconds += revealSeconds;

    if (event.isWinningHit) {
      playWinSfx(event.segment.value);
      break;
    }
  }

  applyLayerRotationsForElapsed(plan, elapsedSeconds);
  drawWheel();
}

async function spinFlow() {
  if (state.spinning) {
    return;
  }

  setSpinDisabled(true);

  let wagerDeducted = false;
  let roundSettled = false;

  try {
    if (!canAffordCurrentBet()) {
      throw new Error("Insufficient balance for current bet.");
    }

    state.lastWinAmount = 0;
    state.displayedWinAmount = 0;
    els.winText.textContent = formatMoney(0);
    clearWinAnimation();

    if (state.mode === "stake") {
      await beginStakeRound();
    } else {
      beginSimulationRound();
    }

    wagerDeducted = true;
    state.roundActive = true;
    state.activeLayerIndex = 0;
    resetRoundVisualState();
    playSfx("spinStart");

    const plan = await buildRoundPlan();
    state.provablyFair.lastRoundHash = plan.roundHash;

    updateProvablyFairPanel();
    updateHud();
    drawWheel();
    await animateLayersIntoStartRotation(plan);

    await playRoundPlan(plan);

    const winningMultiplier = plan.winner.segment.value;
    state.lastResolvedMultiplier = winningMultiplier;

    if (state.mode === "simulation") {
      applySimulationPayout(winningMultiplier);
      roundSettled = true;
    } else {
      const settlementWin = await endStakeRound();
      state.lastWinAmount = settlementWin;
      roundSettled = true;

      if (winningMultiplier >= 20 || settlementWin > state.betAmount * 8) {
        animateDisplayedWin(settlementWin, 1450, true);
      } else {
        state.displayedWinAmount = settlementWin;
        els.winText.textContent = formatMoney(state.displayedWinAmount);
        replayClass(els.winText, "win-pop");
      }
    }

    state.roundActive = false;
    state.activeLayerIndex = 0;
    state.provablyFair.nonce += 1;
    persistProvablyFairState();
    updateProvablyFairPanel();

    setStatus("Ready");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Error: ${message}`);

    if (state.mode === "simulation" && wagerDeducted && !roundSettled) {
      state.balance.amount += state.betAmount;
    }

    if (state.mode === "stake" && state.liveRound?.active) {
      try {
        await endStakeRound();
      } catch {
        // ignore secondary end-round failures
      }
    }

    state.roundActive = false;
    state.activeLayerIndex = 0;
    resetRoundVisualState();
  } finally {
    updateHud();
    drawWheel();
    setSpinDisabled(false);
  }
}

function adjustBet(direction) {
  if (state.roundActive || state.spinning) {
    return;
  }

  const stepBet =
    Number.isFinite(state.config.stepBet) && state.config.stepBet > 0
      ? state.config.stepBet
      : SIMULATED_CONFIG.stepBet;
  const nextAmount = state.betAmount + direction * stepBet;
  state.betAmount = clampBetAmount(nextAmount);
  updateHud();
}

function applyClientSeed() {
  if (state.roundActive || state.spinning) {
    setStatus("Wait for the current round to finish before changing seed.");
    return;
  }

  state.provablyFair.clientSeed = sanitizeSeed(els.clientSeedInput.value);
  state.provablyFair.nonce = 0;
  state.simulationNonceCursor = 0;
  state.simulationLastBatch = null;
  state.simulationTopWins = [];
  state.simulationStats = null;
  persistProvablyFairState();
  updateProvablyFairPanel();
  renderSimulationTopWins();
  renderSimulationMetrics();
  renderSimulationTrendGraph();
  setSimulationStatus("Seed updated. Run a new simulation batch for replay data.");
  updateSimulationReplayUi();
  setStatus("Client seed applied and nonce reset.");
}

function rotateClientSeed() {
  if (state.roundActive || state.spinning) {
    setStatus("Wait for the current round to finish before rotating seed.");
    return;
  }

  state.provablyFair.clientSeed = generateSeed("client");
  state.provablyFair.nonce = 0;
  state.simulationNonceCursor = 0;
  state.simulationLastBatch = null;
  state.simulationTopWins = [];
  state.simulationStats = null;
  persistProvablyFairState();
  updateProvablyFairPanel();
  renderSimulationTopWins();
  renderSimulationMetrics();
  renderSimulationTrendGraph();
  setSimulationStatus("Seed rotated. Run a new simulation batch for replay data.");
  updateSimulationReplayUi();
  setStatus("Client seed rotated and nonce reset.");
}

function attachEvents() {
  els.rulesButton?.addEventListener("click", () => {
    playSfx("uiClick");
    openRulesModal();
  });

  els.rulesCloseButton?.addEventListener("click", () => {
    closeRulesModal();
  });

  els.rulesBackdrop?.addEventListener("click", () => {
    closeRulesModal();
  });

  els.provablyFairButton?.addEventListener("click", () => {
    playSfx("uiClick");
    openProvablyFairModal();
  });

  els.provablyFairCloseButton?.addEventListener("click", () => {
    closeProvablyFairModal();
  });

  els.provablyFairBackdrop?.addEventListener("click", () => {
    closeProvablyFairModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.ui.provablyFairOpen) {
      event.preventDefault();
      closeProvablyFairModal();
      return;
    }
    if (event.key === "Escape" && state.ui.rulesOpen) {
      event.preventDefault();
      closeRulesModal();
    }
  });

  els.spinButton.addEventListener("click", async () => {
    await spinFlow();
  });

  els.betDownButton.addEventListener("click", () => {
    playSfx("uiClick");
    adjustBet(-1);
  });

  els.betUpButton.addEventListener("click", () => {
    playSfx("uiClick");
    adjustBet(1);
  });

  els.wheelProfileSelect?.addEventListener("change", () => {
    if (state.roundActive || state.spinning) {
      els.wheelProfileSelect.value = state.activeProfileKey;
      setStatus("Wait for the current round to finish before switching wheel profile.");
      return;
    }

    const selectedProfileKey = els.wheelProfileSelect.value;
    if (selectedProfileKey === state.activeProfileKey) {
      return;
    }

    playSfx("uiClick");
    const applied = applyWheelProfile(selectedProfileKey, {
      persist: true,
      announce: true,
      resetSimulation: true,
      refreshUi: true,
    });

    if (!applied) {
      els.wheelProfileSelect.value = state.activeProfileKey;
      setStatus("Unable to switch wheel profile.");
    }
  });

  els.betAmountInput?.addEventListener("change", () => {
    setBetFromInputValue(els.betAmountInput.value);
  });

  els.betAmountInput?.addEventListener("blur", () => {
    setBetFromInputValue(els.betAmountInput.value);
  });

  els.betAmountInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const applied = setBetFromInputValue(els.betAmountInput.value);
      if (applied) {
        setStatus("Bet updated.");
      }
      event.preventDefault();
      els.betAmountInput.blur();
    }
  });

  els.applySeedButton.addEventListener("click", () => {
    playSfx("uiClick");
    applyClientSeed();
  });

  els.rotateSeedButton.addEventListener("click", () => {
    playSfx("uiClick");
    rotateClientSeed();
  });

  els.clientSeedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      applyClientSeed();
    }
  });

  for (const button of els.simButtons) {
    button.addEventListener("click", async () => {
      playSfx("uiClick");
      const count = Number.parseInt(button.dataset.simCount || "", 10);
      if (!SIMULATION_BATCH_COUNTS.has(count)) {
        setSimulationStatus("Unsupported simulation batch requested.");
        return;
      }
      await simulateSpins(count);
    });
  }

  els.simReplayButton?.addEventListener("click", async () => {
    playSfx("uiClick");
    await replaySimulationSpin();
  });

  els.simReplayInput?.addEventListener("input", () => {
    updateSimulationReplayUi();
  });

  els.simReplayInput?.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      await replaySimulationSpin();
    }
  });

  els.simTopList?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const replayButton = target.closest("[data-replay-spin]");
    if (!(replayButton instanceof HTMLElement)) {
      return;
    }
    const spin = Number.parseInt(replayButton.dataset.replaySpin || "", 10);
    if (!Number.isFinite(spin)) {
      return;
    }
    if (els.simReplayInput) {
      els.simReplayInput.value = String(spin);
    }
    updateSimulationReplayUi();
    await replaySimulationSpin(spin);
  });

  let resizeGraphRaf = 0;
  window.addEventListener(
    "resize",
    () => {
      if (resizeGraphRaf) {
        cancelAnimationFrame(resizeGraphRaf);
      }
      resizeGraphRaf = requestAnimationFrame(() => {
        resizeGraphRaf = 0;
        renderSimulationTrendGraph();
      });
    },
    { passive: true },
  );
}

async function init() {
  if (!ctx) {
    throw new Error("Canvas 2D context is unavailable.");
  }

  if (window.location.protocol === "file:") {
    setStatus("Open via http://localhost, not file://");
    console.error("Run `python -m http.server 8080` and open http://localhost:8080");
    return;
  }

  runPacingSanityChecks();

  const storedProfileKey = loadStorage(PROFILE_STORAGE_KEY);
  const applied = applyWheelProfile(storedProfileKey || DEFAULT_WHEEL_PROFILE_KEY, {
    persist: false,
    announce: false,
    resetSimulation: false,
    refreshUi: false,
  });
  if (!applied) {
    throw new Error("Unable to initialize wheel profile.");
  }

  syncBetFromConfig();
  attachCanvasResizeObserver();
  resizeCanvasToDisplaySize();

  // Render profile-driven HUD/canvas immediately so UI does not wait on networked SDK/session work.
  renderPaytable();
  updateHud();
  resetRoundVisualState();
  drawWheel();

  await loadStakeSdk();
  await bootstrapSession();
  await initProvablyFairState();
  loadUpBreakTexture();
  initSoundPools();

  renderPaytable();
  updateHud();
  renderSimulationTopWins();
  renderSimulationMetrics();
  renderSimulationTrendGraph();
  setSimulationStatus(
    state.mode === "stake"
      ? "Simulation available: does not change Stake balance or nonce."
      : "Run a simulation batch to track top wins.",
  );
  updateSimulationReplayUi();
  resetRoundVisualState();
  drawWheel();
  attachEvents();
}

init().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Initialization failed: ${message}`);
  if (els.wheelProfileSummary && els.wheelProfileSummary.textContent.includes("Loading wheel profile")) {
    els.wheelProfileSummary.textContent = `Wheel profile load failed: ${message}`;
  }
});

