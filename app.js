const API_MULTIPLIER = 1_000_000;
const SPIN_DURATION_MS = 1450;
const POINTER_ANGLE = -Math.PI / 2;
const TARGET_RTP = 0.96;
const LANDING_REVEAL_MS = 760;
const CARNIVAL_REVEAL_MS = 2400;

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

const LAYER_BLUEPRINTS = [
  {
    name: "Core",
    upWeight: 1,
    upSlices: 1,
    multipliers: [
      { value: 0, weight: 1 },
      { value: 0, weight: 1 },
      { value: 0, weight: 1 },
    ],
  },
  {
    name: "Layer 2",
    upWeight: 1,
    upSlices: 1,
    multipliers: [
      { value: 2, weight: 1 },
      { value: 4, weight: 1 },
      { value: 0, weight: 1 },
      { value: 4, weight: 1 },
      { value: 2, weight: 1 },
      { value: 4, weight: 1 },
      { value: 4, weight: 1 },
      { value: 4, weight: 1 },
      { value: 4, weight: 1 },
    ],
  },
  {
    name: "Layer 3",
    upWeight: 1,
    upSlices: 1,
    multipliers: [
      { value: 4, weight: 1 },
      { value: 10, weight: 1 },
      { value: 0, weight: 1 },
      { value: 8, weight: 1 },
      { value: 4, weight: 1 },
      { value: 12, weight: 1 },
      { value: 6, weight: 1 },
      { value: 16, weight: 1 },
      { value: 6, weight: 1 },
    ],
  },
  {
    name: "Layer 4",
    upWeight: 1,
    upSlices: 1,
    multipliers: [
      { value: 8, weight: 1 },
      { value: 18, weight: 1 },
      { value: 0, weight: 1 },
      { value: 14, weight: 1 },
      { value: 10, weight: 1 },
      { value: 20, weight: 1 },
      { value: 12, weight: 1 },
      { value: 22, weight: 1 },
      { value: 16, weight: 1 },
    ],
  },
  {
    name: "Layer 5",
    upWeight: 1,
    upSlices: 1,
    multipliers: [
      { value: 16, weight: 1 },
      { value: 40, weight: 1 },
      { value: 0, weight: 1 },
      { value: 28, weight: 1 },
      { value: 20, weight: 1 },
      { value: 48, weight: 1 },
      { value: 24, weight: 1 },
      { value: 52, weight: 1 },
      { value: 32, weight: 1 },
    ],
  },
  {
    name: "Outer Crown",
    upWeight: 0,
    upSlices: 0,
    multipliers: [
      { value: 5000, weight: 1 },
      { value: 10000, weight: 1 },
      { value: 2500, weight: 1 },
      { value: 1200, weight: 1 },
      { value: 800, weight: 1 },
      { value: 600, weight: 1 },
      { value: 400, weight: 1 },
      { value: 300, weight: 1 },
      { value: 1600, weight: 1 },
      { value: 1000, weight: 1 },
    ],
  },
];
const els = {
  modeText: document.getElementById("modeText"),
  statusText: document.getElementById("statusText"),
  roundText: document.getElementById("roundText"),
  layerIndexText: document.getElementById("layerIndexText"),
  layerCountText: document.getElementById("layerCountText"),
  maxPathText: document.getElementById("maxPathText"),
  rtpText: document.getElementById("rtpText"),
  balanceText: document.getElementById("balanceText"),
  winText: document.getElementById("winText"),
  betText: document.getElementById("betText"),
  betDownButton: document.getElementById("betDownButton"),
  betUpButton: document.getElementById("betUpButton"),
  spinButton: document.getElementById("spinButton"),
  wheelCanvas: document.getElementById("wheelCanvas"),
  paytable: document.getElementById("paytable"),
};

const ctx = els.wheelCanvas.getContext("2d");

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
  roundActive: false,
  activeLayerIndex: 0,
  spinning: false,
  liveRound: null,
  layers: [],
  theoreticalRtp: 0,
  maxWinMultiplier: 0,
  layerRotations: [],
  latestOutcomeByLayer: [],
  winAnimationFrame: null,
  revealState: null,
};

function setStatus(text) {
  els.statusText.textContent = text;
}

function formatMultiplier(value) {
  if (value >= 1000) {
    return `${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}x`;
  }
  if (value === 0) {
    return "0x";
  }
  if (value >= 10) {
    return `${value.toFixed(1).replace(/\\.0$/, "")}x`;
  }
  return `${value.toFixed(2).replace(/0$/, "").replace(/\\.0$/, "")}x`;
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

function weightedPick(segments) {
  const total = segments.reduce((sum, segment) => sum + segment.weight, 0);
  const roll = Math.random() * total;
  let running = 0;
  for (let i = 0; i < segments.length; i += 1) {
    running += segments[i].weight;
    if (roll <= running) {
      return i;
    }
  }
  return segments.length - 1;
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

function buildLayersFromBlueprint() {
  return LAYER_BLUEPRINTS.map((blueprint) => {
    const multiplierSegments = blueprint.multipliers.map((entry) => ({
      type: "mult",
      value: entry.value,
      weight: entry.weight,
    }));

    const segments = [...multiplierSegments];
    if (blueprint.upWeight > 0 && blueprint.upSlices > 0) {
      const pieceWeight = blueprint.upWeight / blueprint.upSlices;
      const upSegments = Array.from({ length: blueprint.upSlices }, () => ({
        type: "up",
        weight: pieceWeight,
        value: null,
      }));

      segments.length = 0;
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

    const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
    const withMeta = segments.map((segment) => ({
      ...segment,
      chance: segment.weight / totalWeight,
      label:
        segment.type === "up"
          ? "UP"
          : segment.value === 10000
            ? "10Kx"
            : formatMultiplier(segment.value),
    }));

    return {
      name: blueprint.name,
      segments: withMeta,
      totalWeight,
    };
  });
}

function expectedFromLayer(layerIndex) {
  const layer = state.layers[layerIndex];
  const multiExpectation = layer.segments
    .filter((segment) => segment.type === "mult")
    .reduce(
      (sum, segment) => sum + (segment.weight / layer.totalWeight) * segment.value,
      0,
    );

  const upProbability = layer.segments
    .filter((segment) => segment.type === "up")
    .reduce((sum, segment) => sum + segment.weight / layer.totalWeight, 0);

  if (upProbability === 0 || layerIndex === state.layers.length - 1) {
    return multiExpectation;
  }

  return multiExpectation + upProbability * expectedFromLayer(layerIndex + 1);
}

function updateDerivedMath() {
  state.theoreticalRtp = expectedFromLayer(0);

  state.maxWinMultiplier = state.layers.reduce((max, layer) => {
    const layerMax = layer.segments
      .filter((segment) => segment.type === "mult")
      .reduce((innerMax, segment) => Math.max(innerMax, segment.value), 0);
    return Math.max(max, layerMax);
  }, 0);
}

function renderPaytable() {
  const rows = state.layers
    .map((layer, layerIndex) => {
      const multipliers = layer.segments.filter((segment) => segment.type === "mult");
      const upSegment = layer.segments.find((segment) => segment.type === "up");
      const totalMultiWeight = multipliers.reduce(
        (sum, segment) => sum + segment.weight,
        0,
      );

      const plinkoOdds = multipliers.map((segment) => segment.weight).join(":");
      const binLine = multipliers
        .map((segment, binIndex) => {
          const chance = (segment.weight / totalMultiWeight) * 100;
          return `L${binIndex} ${segment.label} (${chance.toFixed(1)}%)`;
        })
        .join(" -> ");

      const upChanceText = upSegment
        ? `UP ${(upSegment.chance * 100).toFixed(2)}%`
        : "No UP (final layer)";

      return `
        <div class="pay-layer">
          <div class="pay-layer-title">${layerIndex + 1}. ${layer.name}</div>
          <div class="pay-layer-values">Plinko bins (Left -> Right): ${binLine}</div>
          <div class="pay-layer-values">Equal spokes: ${layer.segments.length} total | bin odds ${plinkoOdds}</div>
          <div class="pay-layer-values">${upChanceText}</div>
        </div>
      `;
    })
    .join("");

  els.paytable.innerHTML = `<h3>Plinko Cascade</h3>${rows}`;
}

function updateHud() {
  els.modeText.textContent = state.mode === "stake" ? "StakeEngine" : "Simulation";
  els.balanceText.textContent = formatMoney(state.balance.amount);
  els.winText.textContent = formatMoney(state.displayedWinAmount);
  els.betText.textContent = formatMoney(state.betAmount);
  els.layerIndexText.textContent = String(state.activeLayerIndex + 1);
  els.layerCountText.textContent = String(state.layers.length);
  els.maxPathText.textContent = formatMultiplier(state.maxWinMultiplier);
  const rtp = state.theoreticalRtp * 100;
  const rtpDrift = Math.abs(state.theoreticalRtp - TARGET_RTP);
  els.rtpText.textContent = rtpDrift < 0.0005 ? `${rtp.toFixed(2)}%` : `${rtp.toFixed(2)}%*`;
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
  let index = state.config.betLevels.findIndex(
    (value) => value === state.config.defaultBetLevel,
  );
  if (index < 0) {
    index = 0;
  }
  state.betIndex = index;
  state.betAmount = state.config.betLevels[index];
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
      enforceBetLevels: true,
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
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function getWinningRotation(layer, selectedIndex) {
  let start = 0;
  for (let i = 0; i < selectedIndex; i += 1) {
    start += (layer.segments[i].weight / layer.totalWeight) * Math.PI * 2;
  }
  const sweep =
    (layer.segments[selectedIndex].weight / layer.totalWeight) * Math.PI * 2;
  const segmentMid = start + sweep / 2;
  return normalizeAngle(POINTER_ANGLE - segmentMid);
}

function getPointerSegmentIndex(layer, rotation) {
  const relative = normalizeAngle(POINTER_ANGLE - normalizeAngle(rotation));
  let current = 0;

  for (let i = 0; i < layer.segments.length; i += 1) {
    const sweep = (layer.segments[i].weight / layer.totalWeight) * Math.PI * 2;
    const next = current + sweep;
    if (relative >= current && relative < next) {
      return i;
    }
    current = next;
  }

  return layer.segments.length - 1;
}

async function animateLayerSpin(layerIndex, selectedIndex) {
  const layer = state.layers[layerIndex];
  const fullTurn = Math.PI * 2;
  const startRotation = state.layerRotations[layerIndex];
  const startNorm = normalizeAngle(startRotation);
  const stopNorm = getWinningRotation(layer, selectedIndex);
  const deltaToStop = normalizeAngle(stopNorm - startNorm);
  const extraTurns = fullTurn * (3 + Math.floor(Math.random() * 3));
  const endRotation = startRotation + extraTurns + deltaToStop;
  const startTime = performance.now();

  await new Promise((resolve) => {
    const frame = (now) => {
      const progress = Math.min((now - startTime) / SPIN_DURATION_MS, 1);
      const eased = easeInOutCubic(progress);
      state.layerRotations[layerIndex] =
        startRotation + (endRotation - startRotation) * eased;
      drawWheel();

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        state.layerRotations[layerIndex] = endRotation;
        drawWheel();
        resolve();
      }
    };

    requestAnimationFrame(frame);
  });

  return getPointerSegmentIndex(layer, state.layerRotations[layerIndex]);
}

function drawLabel(text, midAngle, radius, fontSize, color = "#fef3cb", glow = false) {
  ctx.save();
  ctx.translate(
    els.wheelCanvas.width / 2 + Math.cos(midAngle) * radius,
    els.wheelCanvas.height / 2 + Math.sin(midAngle) * radius,
  );
  const isUpLabel = text === "UP";
  if (!isUpLabel) {
    ctx.rotate(midAngle + Math.PI / 2);
  }
  if (glow) {
    ctx.shadowColor = "#fff1a8";
    ctx.shadowBlur = 14;
  }
  ctx.fillStyle = color;
  ctx.font = `700 ${fontSize}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function getSegmentPalette(segment) {
  if (segment.type === "up") {
    return { fill: "#42b6ff", label: "#ffffff" };
  }

  if (segment.value === state.maxWinMultiplier) {
    return { fill: "#f2c14f", label: "#1e1200" };
  }

  if (segment.value === 0) {
    return { fill: "#555a63", label: "#dce3ed" };
  }

  if (segment.value < 1.5) {
    return { fill: "#7f8793", label: "#f3f7ff" };
  }

  if (segment.value < 4) {
    return { fill: "#3aa0ff", label: "#041326" };
  }

  if (segment.value < 16) {
    return { fill: "#12c2a1", label: "#052117" };
  }

  if (segment.value < 100) {
    return { fill: "#ff7b6a", label: "#2b0902" };
  }

  if (segment.value < 1000) {
    return { fill: "#bf73ff", label: "#170323" };
  }

  return { fill: "#ff4e9d", label: "#290016" };
}

function drawLayerPointer(cx, cy, centerRadius, ringThickness) {
  const pointerLayer = state.roundActive ? state.activeLayerIndex : 0;
  const tipRadius = centerRadius + pointerLayer * ringThickness + 3;
  const baseRadius = Math.max(centerRadius - 24, tipRadius - 30);
  const halfWidth = 11;

  const tipX = cx + Math.cos(POINTER_ANGLE) * tipRadius;
  const tipY = cy + Math.sin(POINTER_ANGLE) * tipRadius;
  const baseX = cx + Math.cos(POINTER_ANGLE) * baseRadius;
  const baseY = cy + Math.sin(POINTER_ANGLE) * baseRadius;
  const perpX = Math.cos(POINTER_ANGLE + Math.PI / 2);
  const perpY = Math.sin(POINTER_ANGLE + Math.PI / 2);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(baseX + perpX * halfWidth, baseY + perpY * halfWidth);
  ctx.lineTo(baseX - perpX * halfWidth, baseY - perpY * halfWidth);
  ctx.closePath();
  ctx.fillStyle = "#fff2c9";
  ctx.fill();
  ctx.strokeStyle = "#1a1207";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawWheel() {
  const { width, height } = els.wheelCanvas;
  const cx = width / 2;
  const cy = height / 2;
  const centerRadius = 78;
  const outerRadius = Math.min(width, height) / 2 - 16;
  const ringThickness = (outerRadius - centerRadius) / state.layers.length;
  const reveal = state.revealState;
  const now = performance.now();
  const displayLayerIndex = state.roundActive ? state.activeLayerIndex : 0;
  const carnivalColors = ["#ffe97c", "#ff8352", "#7bffbe", "#82d2ff", "#ff78cf"];
  const labels = [];

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius + 7, 0, Math.PI * 2);
  ctx.fillStyle = "#3a2b14";
  ctx.fill();

  state.layers.forEach((layer, layerIndex) => {
    const inner = centerRadius + layerIndex * ringThickness + 2;
    const outer = inner + ringThickness - 5;
    let angle = normalizeAngle(state.layerRotations[layerIndex]);

    layer.segments.forEach((segment, segmentIndex) => {
      const sweep = (segment.weight / layer.totalWeight) * Math.PI * 2;
      const start = angle;
      const end = angle + sweep;
      const palette = getSegmentPalette(segment);

      const isActiveLayer = layerIndex === displayLayerIndex;
      const isMaxWin =
        segment.type === "mult" && segment.value === state.maxWinMultiplier;
      const isRevealHit =
        reveal &&
        reveal.layerIndex === layerIndex &&
        reveal.segmentIndex === segmentIndex;

      ctx.beginPath();
      ctx.arc(cx, cy, outer, start, end);
      ctx.arc(cx, cy, inner, end, start, true);
      ctx.closePath();
      ctx.fillStyle = palette.fill;
      ctx.fill();

      if (!isActiveLayer && !isMaxWin) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#0b0911";
        ctx.fill();
        ctx.restore();
      }

      if (isMaxWin) {
        ctx.save();
        ctx.shadowColor = "#ffe98f";
        ctx.shadowBlur = 16;
        ctx.strokeStyle = "#fff2b4";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }

      if (isRevealHit) {
        const pulse = 0.45 + 0.55 * (0.5 + Math.sin((now - reveal.startTime) / 70) * 0.5);
        ctx.save();
        ctx.globalAlpha = 0.32 + pulse * 0.25;
        ctx.fillStyle = "#fff7cc";
        ctx.fill();
        ctx.restore();

        ctx.save();
        if (reveal.carnival) {
          const colorIndex = Math.floor((now - reveal.startTime) / 95) % carnivalColors.length;
          ctx.shadowColor = carnivalColors[colorIndex];
          ctx.shadowBlur = 20;
          ctx.strokeStyle = carnivalColors[colorIndex];
          ctx.lineWidth = 6;
        } else {
          ctx.shadowColor = "#fff6c8";
          ctx.shadowBlur = 14;
          ctx.strokeStyle = "#fff6c8";
          ctx.lineWidth = 5;
        }
        ctx.stroke();
        ctx.restore();
      }

      ctx.strokeStyle = "#1b1307";
      ctx.lineWidth = 3;
      ctx.stroke();

      const mid = start + sweep / 2;
      const labelRadius = (inner + outer) / 2;
      const labelFont = Math.max(8, Math.min(14, ringThickness * 0.33));

      if (sweep >= 0.12) {
        const labelColor =
          !isActiveLayer && !isMaxWin
            ? "rgba(245, 234, 210, 0.55)"
            : palette.label;
        labels.push({
          text: segment.label,
          angle: mid,
          radius: labelRadius,
          font: isMaxWin ? labelFont * 1.34 : labelFont,
          color: labelColor,
          glow: isMaxWin,
        });
      }

      const latest = state.latestOutcomeByLayer[layerIndex];
      if (latest && latest.segmentIndex === segmentIndex && !isRevealHit) {
        const pulseRadius = (inner + outer) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, mid - 0.09, mid + 0.09);
        ctx.strokeStyle = "#fff7de";
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      angle += sweep;
    });

  });

  ctx.beginPath();
  ctx.arc(cx, cy, centerRadius - 8, 0, Math.PI * 2);
      ctx.fillStyle = "#20160a";
  ctx.fill();
  ctx.strokeStyle = "#f0cb6a";
  ctx.lineWidth = 3;
  ctx.stroke();

  for (const label of labels) {
    drawLabel(label.text, label.angle, label.radius, label.font, label.color, label.glow);
  }

  drawLayerPointer(cx, cy, centerRadius, ringThickness);
}

async function playLandingReveal(layerIndex, segmentIndex, isCarnival) {
  const duration = isCarnival ? CARNIVAL_REVEAL_MS : LANDING_REVEAL_MS;
  const startTime = performance.now();
  const endTime = startTime + duration;

  state.revealState = {
    layerIndex,
    segmentIndex,
    startTime,
    carnival: isCarnival,
  };

  await new Promise((resolve) => {
    const frame = (now) => {
      drawWheel();
      if (now < endTime) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(frame);
  });

  state.revealState = null;
  drawWheel();
}

function resetRoundState() {
  state.roundActive = false;
  state.activeLayerIndex = 0;
  state.latestOutcomeByLayer = state.layers.map(() => null);
  state.revealState = null;
}

function canAffordCurrentBet() {
  return state.balance.amount >= state.betAmount;
}

async function beginStakeRound() {
  const before = state.balance.amount;
  const response = await state.client.Play({
    amount: state.betAmount,
    mode: "base",
  });
  state.liveRound = response.round;
  state.balance = response.balance;
  return before;
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

  if (multiplier > 10) {
    animateDisplayedWin(payoutAmount, 1450, true);
  } else {
    state.displayedWinAmount = payoutAmount;
    els.winText.textContent = formatMoney(state.displayedWinAmount);
    replayClass(els.winText, "win-pop");
  }
}

function handleUpOutcome(layerName) {
  const nextLayer = state.activeLayerIndex + 1;
  if (nextLayer >= state.layers.length) {
    const fallback = state.maxWinMultiplier;
    applySimulationPayout(fallback);
    resetRoundState();
    els.roundText.textContent = `${layerName}: UP forced max payout ${formatMultiplier(fallback)}.`;
    return;
  }
  state.activeLayerIndex = nextLayer;
  const nextName = state.layers[nextLayer].name;
  els.roundText.textContent = `${layerName}: UP hit. Press spin for ${nextName}.`;
}

async function spinActiveLayer() {
  const layerIndex = state.activeLayerIndex;
  const layer = state.layers[layerIndex];
  const pickIndex = weightedPick(layer.segments);
  const landedIndex = await animateLayerSpin(layerIndex, pickIndex);
  const selected = layer.segments[landedIndex];
  state.latestOutcomeByLayer[layerIndex] = { segmentIndex: landedIndex };

  if (selected.type === "up") {
    els.roundText.textContent = `${layer.name}: landed UP.`;
    await playLandingReveal(layerIndex, landedIndex, false);
    handleUpOutcome(layer.name);
    return;
  }

  state.lastResolvedMultiplier = selected.value;
  const carnivalWin = selected.value >= 10 || selected.value === state.maxWinMultiplier;
  els.roundText.textContent = `${layer.name}: landed ${selected.label}.`;
  await playLandingReveal(layerIndex, landedIndex, carnivalWin);

  if (state.mode === "simulation") {
    applySimulationPayout(selected.value);
  } else {
    const settlementWin = await endStakeRound();
    state.lastWinAmount = settlementWin;
    if (selected.value > 10 || settlementWin > state.betAmount * 10) {
      animateDisplayedWin(settlementWin, 1450, true);
    } else {
      state.displayedWinAmount = settlementWin;
      els.winText.textContent = formatMoney(state.displayedWinAmount);
      replayClass(els.winText, "win-pop");
    }
  }

  resetRoundState();
  els.roundText.textContent = `${layer.name}: won ${formatMoney(
    state.lastWinAmount,
  )} (${selected.label}). Round complete.`;
}

async function spinFlow() {
  if (state.spinning) {
    return;
  }

  setSpinDisabled(true);

  try {
    if (!state.roundActive) {
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

      state.roundActive = true;
      state.activeLayerIndex = 0;
      state.latestOutcomeByLayer = state.layers.map(() => null);
      els.roundText.textContent = "Round started at Core. Spinning...";
    } else {
      els.roundText.textContent = `${state.layers[state.activeLayerIndex].name} spinning...`;
    }

    await spinActiveLayer();
    setStatus(state.roundActive ? "Round active" : "Ready");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    setStatus(`Error: ${message}`);
    if (state.mode === "simulation") {
      resetRoundState();
    }
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
  const next = Math.min(
    Math.max(state.betIndex + direction, 0),
    state.config.betLevels.length - 1,
  );
  state.betIndex = next;
  state.betAmount = state.config.betLevels[next];
  updateHud();
}

function attachEvents() {
  els.spinButton.addEventListener("click", async () => {
    await spinFlow();
  });

  els.betDownButton.addEventListener("click", () => {
    adjustBet(-1);
  });

  els.betUpButton.addEventListener("click", () => {
    adjustBet(1);
  });
}

async function init() {
  if (window.location.protocol === "file:") {
    setStatus("Open via http://localhost, not file://");
    els.roundText.textContent =
      "Run `python -m http.server 8080` and open http://localhost:8080";
    return;
  }

  state.layers = buildLayersFromBlueprint();
  state.layerRotations = state.layers.map(() => 0);
  state.latestOutcomeByLayer = state.layers.map(() => null);
  updateDerivedMath();

  syncBetFromConfig();
  await loadStakeSdk();
  await bootstrapSession();

  renderPaytable();
  updateHud();
  drawWheel();
  attachEvents();
}

init();


