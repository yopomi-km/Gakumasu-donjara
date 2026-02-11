const CHARACTERS = [
  { name: "咲季", color: "red" },
  { name: "手毬", color: "red" },
  { name: "ことね", color: "red" },
  { name: "リーリヤ", color: "red" },
  { name: "清夏", color: "red" },
  { name: "千奈", color: "blue" },
  { name: "広", color: "blue" },
  { name: "佑芽", color: "blue" },
  { name: "美鈴", color: "blue" },
  { name: "燕", color: "purple" },
  { name: "星南", color: "purple" },
  { name: "麻央", color: "purple" },
  { name: "莉波", color: "purple" },
  { name: "燐羽", color: "gray" },
  { name: "撫子", color: "gray" },
  { name: "四音", color: "gray" },
  { name: "月花", color: "gray" }
];

const state = {
  deck: [],
  player: [],
  opponent: [],
  riverP: [],
  riverO: [],
  turn: "player",
  started: false,
  drawnThisTurn: false,
  lastDrawnId: null,
  playerKans: [],
  playerPons: [],
  selectingKan: false,
  kanSelectNames: [],
  autoSort: true,
  pendingPon: false,
  pendingPonTile: null,
  forcePonName: null,
  forceRonName: null,
  playerFirstTurn: true,
  lastDrawFromKan: false,
  lastDrawFromDeck: false,
  dealing: false
};

const el = {
  pHand: document.getElementById("pHand"),
  oHand: document.getElementById("oHand"),
  riverO: document.getElementById("riverO"),
  riverP: document.getElementById("riverP"),
  deckCount: document.getElementById("deckCount"),
  status: document.getElementById("status"),
  log: document.getElementById("log"),
  turnBadge: document.getElementById("turnBadge"),
  btnNew: document.getElementById("btnNew"),
  btnDraw: document.getElementById("btnDraw"),
  btnKan: document.getElementById("btnKan"),
  btnDebug: document.getElementById("btnDebug"),
  btnDebugPon: document.getElementById("btnDebugPon"),
  btnDebugReiris: document.getElementById("btnDebugReiris"),
  btnDebugBegrazia: document.getElementById("btnDebugBegrazia"),
  btnDebugSyngUp: document.getElementById("btnDebugSyngUp"),
  btnDebugRed: document.getElementById("btnDebugRed"),
  btnDebugBlue: document.getElementById("btnDebugBlue"),
  btnDebugPurple: document.getElementById("btnDebugPurple"),
  kanArea: document.getElementById("kanArea"),
  ponArea: document.getElementById("ponArea"),
  chkAutoSort: document.getElementById("chkAutoSort"),
  ponPrompt: document.getElementById("ponPrompt"),
  ponText: document.getElementById("ponText"),
  btnPon: document.getElementById("btnPon"),
  btnSkip: document.getElementById("btnSkip"),
  btnRon: document.getElementById("btnRon"),
  btnTsumo: document.getElementById("btnTsumo"),
  yakuResult: document.getElementById("yakuResult"),
  winModal: document.getElementById("winModal"),
  winTiles: document.getElementById("winTiles"),
  winYaku: document.getElementById("winYaku"),
  btnWinNew: document.getElementById("btnWinNew"),
  btnDebugRon: document.getElementById("btnDebugRon")
};

function buildDeck() {
  const deck = [];
  for (const c of CHARACTERS) {
    for (let i = 0; i < 4; i++) {
      deck.push({ ...c, id: `${c.name}-${i}-${Math.random().toString(36).slice(2,6)}` });
    }
  }
  return shuffle(deck);
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function log(msg) {
  const p = document.createElement("div");
  p.textContent = msg;
  el.log.prepend(p);
}

function deal(debugKan = false, debugPon = false, debugReiris = false) {
  state.deck = buildDeck();
  if (debugKan) {
    const targetA = CHARACTERS[0];
    const targetB = CHARACTERS[5];
    const targetC = CHARACTERS[9];
    const targetD = CHARACTERS[13];
    const kanTiles = [];
    const dTiles = [];
    state.deck = state.deck.filter((t) => {
      if (t.name === targetA.name && kanTiles.filter((k) => k.name === targetA.name).length < 4) {
        kanTiles.push(t);
        return false;
      }
      if (t.name === targetB.name && kanTiles.filter((k) => k.name === targetB.name).length < 4) {
        kanTiles.push(t);
        return false;
      }
      if (t.name === targetC.name && kanTiles.filter((k) => k.name === targetC.name).length < 4) {
        kanTiles.push(t);
        return false;
      }
      if (t.name === targetD.name && dTiles.length < 4) {
        dTiles.push(t);
        return false;
      }
      return true;
    });
    const hand = kanTiles.concat(dTiles.slice(0, 1));
    const remainingD = dTiles.slice(1);
    state.deck = remainingD.concat(state.deck);
    initHands(hand, state.deck.splice(0, 13));
  } else if (debugPon) {
    const target = CHARACTERS[2];
    const ponTiles = [];
    state.deck = state.deck.filter((t) => {
      if (t.name === target.name && ponTiles.length < 3) {
        ponTiles.push(t);
        return false;
      }
      return true;
    });
    initHands(ponTiles.slice(0, 2).concat(state.deck.splice(0, 11)), [ponTiles[2]].concat(state.deck.splice(0, 12)));
    state.forcePonName = target.name;
  } else if (debugReiris) {
    const names = ["咲季", "手毬", "ことね"];
    const reirisTiles = [];
    state.deck = state.deck.filter((t) => {
      if (names.includes(t.name) && reirisTiles.filter((k) => k.name === t.name).length < 3) {
        reirisTiles.push(t);
        return false;
      }
      return true;
    });
    initHands(reirisTiles.concat(state.deck.splice(0, 4)), state.deck.splice(0, 13));
  } else {
    initHands(state.deck.splice(0, 13), state.deck.splice(0, 13));
  }
}

function initHands(playerHand, opponentHand, options = {}) {
  state.player = playerHand;
  state.opponent = opponentHand;
  state.riverP = [];
  state.riverO = [];
  state.turn = "player";
  state.started = true;
  state.drawnThisTurn = false;
  state.lastDrawnId = null;
  state.playerKans = [];
  state.playerPons = [];
  state.selectingKan = false;
  state.kanSelectNames = [];
  state.autoSort = el.chkAutoSort.checked;
  state.pendingPon = false;
  state.pendingPonTile = null;
  state.forcePonName = null;
  state.forceRonName = null;
  state.playerFirstTurn = true;
  state.lastDrawFromKan = false;
  state.lastDrawFromDeck = false;
  state.dealing = true;
  el.yakuResult.textContent = "役: なし";
  closeWinModal();
  log("新規開始: 13枚配牌");
  dealAnimation(playerHand, opponentHand, options);
}

function dealAnimation(playerHand, opponentHand, options) {
  const pQueue = playerHand.slice();
  const oQueue = opponentHand.slice();
  state.player = [];
  state.opponent = [];
  render();
  const rounds = [4, 4, 4, 1];
  let idx = 0;
  const step = () => {
    const count = rounds[idx];
    for (let i = 0; i < count; i++) {
      const p = pQueue.shift();
      const o = oQueue.shift();
      if (p) state.player.push(p);
      if (o) state.opponent.push(o);
    }
    render();
    idx += 1;
    if (idx < rounds.length) {
      setTimeout(step, 260);
      return;
    }
    sortHand(state.player);
    sortHand(state.opponent);
    state.dealing = false;
    render();
    if (!options.skipAutoDraw) autoDrawIfNeeded();
  };
  setTimeout(step, 260);
}

function dealYaku(type) {
  state.deck = buildDeck();
  if (type === "reiris") {
    const names = ["咲季", "手毬", "ことね"];
    const tiles = [];
    state.deck = state.deck.filter((t) => {
      if (names.includes(t.name) && tiles.filter((k) => k.name === t.name).length < 3) {
        tiles.push(t);
        return false;
      }
      return true;
    });
    initHands(tiles.concat(state.deck.splice(0, 4)), state.deck.splice(0, 13));
  } else if (type === "begrazia") {
    const names = ["佑芽", "美鈴", "星南"];
    const tiles = [];
    state.deck = state.deck.filter((t) => {
      if (names.includes(t.name) && tiles.filter((k) => k.name === t.name).length < 3) {
        tiles.push(t);
        return false;
      }
      return true;
    });
    initHands(tiles.concat(state.deck.splice(0, 4)), state.deck.splice(0, 13));
  } else if (type === "syngup") {
    const names = ["手毬", "美鈴", "燐羽"];
    const tiles = [];
    state.deck = state.deck.filter((t) => {
      if (names.includes(t.name) && tiles.filter((k) => k.name === t.name).length < 3) {
        tiles.push(t);
        return false;
      }
      return true;
    });
    initHands(tiles.concat(state.deck.splice(0, 4)), state.deck.splice(0, 13));
  } else if (type === "red" || type === "blue" || type === "purple") {
    const tiles = [];
    const namesByColor = {
      red: ["咲季", "手毬", "ことね", "リーリヤ", "清夏"],
      blue: ["千奈", "広", "佑芽", "美鈴"],
      purple: ["燕", "星南", "麻央", "莉波"]
    };
    const targets = namesByColor[type] || [];
    state.deck = state.deck.filter((t) => {
      if (t.color !== type) return true;
      const limit = targets.includes(t.name) ? 3 : 0;
      const current = tiles.filter((k) => k.name === t.name).length;
      if (current < limit) {
        tiles.push(t);
        return false;
      }
      return true;
    });
    if (tiles.length < 13 && targets.length > 0) {
      const extraName = targets[0];
      const extra = state.deck.findIndex((t) => t.color === type && t.name === extraName);
      if (extra >= 0) {
        tiles.push(state.deck.splice(extra, 1)[0]);
      }
    }
    initHands(tiles, state.deck.splice(0, 13));
  }
}

function drawTile() {
  if (!state.started || state.turn !== "player") return;
  if (state.dealing) return;
  if (state.drawnThisTurn) return;
  const tile = state.deck.shift();
  if (!tile) {
    log("山札が尽きた");
    return;
  }
  state.player.push(tile);
  sortHandIfNeeded(state.player);
  state.drawnThisTurn = true;
  state.lastDrawnId = tile.id;
  state.lastDrawFromKan = false;
  state.lastDrawFromDeck = true;
  log(`あなたがツモ: ${tile.name}`);
  render();
}

function discardFromPlayer(index) {
  if (!state.started || state.turn !== "player") return;
  if (state.dealing) return;
  if (!state.drawnThisTurn) {
    log("先にツモしてから捨ててください");
    return;
  }
  const [tile] = state.player.splice(index, 1);
  sortHandIfNeeded(state.player);
  state.riverP.push({ tile, by: "player" });
  log(`あなたの捨て牌: ${tile.name}`);
  state.turn = "opponent";
  state.drawnThisTurn = false;
  state.lastDrawnId = null;
  state.playerFirstTurn = false;
  state.lastDrawFromKan = false;
  state.lastDrawFromDeck = false;
  render();
  setTimeout(opponentTurn, 600);
}

function opponentTurn() {
  if (state.turn !== "opponent") return;
  const tile = state.deck.shift();
  if (!tile) {
    log("山札が尽きた");
    state.turn = "player";
    render();
    return;
  }
  state.opponent.push(tile);
  sortHand(state.opponent);
  let discardIndex = Math.floor(Math.random() * state.opponent.length);
  if (state.forcePonName || state.forceRonName) {
    const target = state.forcePonName || state.forceRonName;
    const forced = state.opponent.findIndex((t) => t.name === target);
    if (forced >= 0) discardIndex = forced;
    state.forcePonName = null;
    state.forceRonName = null;
  }
  const [discarded] = state.opponent.splice(discardIndex, 1);
  state.riverO.push({ tile: discarded, by: "opponent" });
  log(`相手の捨て牌: ${discarded.name}`);
  if (canPon(discarded)) {
    state.pendingPon = true;
    state.pendingPonTile = discarded;
    state.turn = "player";
    state.drawnThisTurn = false;
    state.lastDrawnId = null;
    render();
  } else {
    state.turn = "player";
    state.drawnThisTurn = false;
    state.lastDrawnId = null;
    state.playerFirstTurn = false;
    state.lastDrawFromKan = false;
    state.lastDrawFromDeck = false;
    render();
    autoDrawIfNeeded();
  }
}

function autoDrawIfNeeded() {
  if (!state.started || state.turn !== "player") return;
  if (state.dealing) return;
  if (state.drawnThisTurn) return;
  setTimeout(() => {
    if (!state.started || state.turn !== "player") return;
    if (state.drawnThisTurn) return;
    drawTile();
  }, 400);
}

function sortHand(hand) {
  const colorOrder = { red: 0, blue: 1, purple: 2, gray: 3 };
  const nameOrder = new Map(CHARACTERS.map((c, i) => [c.name, i]));
  hand.sort((a, b) => {
    const c = colorOrder[a.color] - colorOrder[b.color];
    if (c !== 0) return c;
    return (nameOrder.get(a.name) ?? 99) - (nameOrder.get(b.name) ?? 99);
  });
}

function sortHandIfNeeded(hand) {
  if (state.autoSort) sortHand(hand);
}

function declareWin() {
  if (!state.started) return;
  if (state.dealing) return;
  if (state.turn === "player" && !state.drawnThisTurn) {
    log("先にツモしてください");
    return;
  }
  const who = state.turn === "player" ? "あなた" : "相手";
  log(`${who}が上がり宣言！（点数計算なし）`);
  if (state.turn === "player") {
    const yaku = checkYaku();
    el.yakuResult.textContent = yaku.length ? `役: ${yaku.join(" / ")}` : "役: なし";
    openWinModal(yaku);
  }
  state.started = false;
  render();
}

function canKanNames() {
  const counts = new Map();
  for (const t of state.player) {
    counts.set(t.name, (counts.get(t.name) || 0) + 1);
  }
  return [...counts.entries()].filter(([, c]) => c >= 4).map(([name]) => name);
}

function collectPlayerTiles() {
  const tiles = state.player.map((t) => ({
    name: t.name,
    color: t.color,
    source: "hand",
    id: t.id
  }));
  state.playerKans.forEach((k) => {
    for (let i = 0; i < 4; i++) tiles.push({ name: k.name, color: k.color, source: "kan" });
  });
  state.playerPons.forEach((p) => {
    for (let i = 0; i < 3; i++) tiles.push({ name: p.name, color: p.color, source: "pon" });
  });
  return tiles;
}

function checkYaku() {
  const tiles = collectPlayerTiles();
  const counts = new Map();
  const colors = new Set();
  tiles.forEach((t) => {
    counts.set(t.name, (counts.get(t.name) || 0) + 1);
    colors.add(t.color);
  });
  const yaku = [];
  const concealedTriplets = countConcealedTriplets();
  if ((counts.get("咲季") || 0) >= 3 && (counts.get("手毬") || 0) >= 3 && (counts.get("ことね") || 0) >= 3) {
    yaku.push("Re;IRIS");
  }
  if ((counts.get("佑芽") || 0) >= 3 && (counts.get("美鈴") || 0) >= 3 && (counts.get("星南") || 0) >= 3) {
    yaku.push("Begrazia");
  }
  if ((counts.get("手毬") || 0) >= 3 && (counts.get("美鈴") || 0) >= 3 && (counts.get("燐羽") || 0) >= 3) {
    yaku.push("SyngUp!");
  }
  if (["咲季", "手毬", "ことね", "リーリヤ", "清夏"].every((n) => (counts.get(n) || 0) >= 1)) {
    yaku.push("SUPREMACY");
  }
  if (["星南", "麻央", "莉波", "燕"].every((n) => (counts.get(n) || 0) >= 1)) {
    yaku.push("ナイワ");
  }
  if (["佑芽", "千奈", "美鈴", "広"].every((n) => (counts.get(n) || 0) >= 1)) {
    yaku.push("Let's GO!! ICHI-NO-NI!!");
  }
  if (state.lastDrawFromKan && state.turn === "player") {
    yaku.push("嶺上開花");
  }
  if (state.lastDrawFromDeck && state.turn === "player" && state.deck.length === 0) {
    yaku.push("海底摸月");
  }
  if (concealedTriplets >= 3) yaku.push("三暗刻");
  if (concealedTriplets >= 4) yaku.push("四暗刻");
  if (state.playerKans.length >= 3) yaku.push("三槓子");
  if (state.playerKans.length >= 4) yaku.push("四槓子");
  if (state.playerFirstTurn && state.riverP.length === 0 && state.riverO.length === 0 && state.playerPons.length === 0 && state.playerKans.length === 0) {
    yaku.push("天和");
  }
  if (!state.playerFirstTurn && state.riverP.length === 0 && state.riverO.length === 1 && state.playerPons.length === 0 && state.playerKans.length === 0) {
    yaku.push("地和");
  }
  return yaku;
}

function countConcealedTriplets() {
  const counts = new Map();
  for (const t of state.player) {
    counts.set(t.name, (counts.get(t.name) || 0) + 1);
  }
  let triplets = 0;
  for (const c of counts.values()) {
    triplets += Math.floor(c / 3);
  }
  return triplets;
}

function openWinModal(yaku) {
  el.winTiles.innerHTML = "";
  const tiles = collectPlayerTiles();
  if (state.lastDrawnId) {
    const idx = tiles.findIndex((t) => t.id === state.lastDrawnId);
    if (idx >= 0) {
      const drawn = tiles.splice(idx, 1)[0];
      tiles.push(drawn);
    }
  }
  tiles.forEach((t) => {
    const div = document.createElement("div");
    const extra = t.source === "kan" ? " kan" : t.source === "pon" ? " pon" : "";
    const drawn = t.id && t.id === state.lastDrawnId ? " drawn" : "";
    div.className = `tile ${t.color}${extra}${drawn}`;
    div.textContent = t.name;
    el.winTiles.appendChild(div);
  });
  el.winYaku.textContent = yaku.length ? yaku.join(" / ") : "なし";
  el.winModal.classList.add("show");
  el.winModal.setAttribute("aria-hidden", "false");
}

function closeWinModal() {
  el.winModal.classList.remove("show");
  el.winModal.setAttribute("aria-hidden", "true");
  el.winTiles.innerHTML = "";
  el.winYaku.textContent = "なし";
}

function canPon(tile) {
  const count = state.player.filter((t) => t.name === tile.name).length;
  return count >= 2;
}

function declareKan() {
  if (!state.started || state.turn !== "player") return;
  if (state.dealing) return;
  const names = canKanNames();
  if (names.length === 0) return;
  state.selectingKan = true;
  state.kanSelectNames = names;
  log(`カンする牌をクリックしてください: ${names.join(" / ")}`);
  render();
}

function executeKan(name) {
  const kanTiles = [];
  state.player = state.player.filter((t) => {
    if (t.name === name && kanTiles.length < 4) {
      kanTiles.push(t);
      return false;
    }
    return true;
  });
  if (kanTiles.length === 4) {
    state.playerKans.push({ name, color: kanTiles[0].color });
    state.lastDrawnId = null;
    sortHandIfNeeded(state.player);
    log(`あなたがカン宣言: ${name}`);
    state.selectingKan = false;
    state.kanSelectNames = [];
    render();
    kanAutoDrawAndDiscard();
  }
}

function kanAutoDrawAndDiscard() {
  const tile = state.deck.shift();
  if (!tile) {
    log("山札が尽きた");
    return;
  }
  state.player.push(tile);
  sortHandIfNeeded(state.player);
  state.lastDrawnId = tile.id;
  state.drawnThisTurn = true;
  state.lastDrawFromKan = true;
  state.lastDrawFromDeck = true;
  log(`嶺上ツモ: ${tile.name}（捨て牌を選んでください）`);
  render();
}

function executePon() {
  if (!state.pendingPon || !state.pendingPonTile) return;
  if (state.dealing) return;
  const name = state.pendingPonTile.name;
  let removed = 0;
  state.player = state.player.filter((t) => {
    if (t.name === name && removed < 2) {
      removed += 1;
      return false;
    }
    return true;
  });
  if (removed === 2) {
    state.riverO.pop();
    state.playerPons.push({ name, color: state.pendingPonTile.color });
    sortHandIfNeeded(state.player);
    state.pendingPon = false;
    state.pendingPonTile = null;
    state.drawnThisTurn = true;
    state.lastDrawnId = null;
    state.playerFirstTurn = false;
    log(`ポン: ${name}（捨て牌を選んでください）`);
    render();
  }
}

function executeRon() {
  if (!state.pendingPon || !state.pendingPonTile) return;
  if (state.dealing) return;
  const tile = state.pendingPonTile;
  state.riverO.pop();
  state.player.push(tile);
  sortHandIfNeeded(state.player);
  state.pendingPon = false;
  state.pendingPonTile = null;
  state.lastDrawnId = tile.id;
  state.drawnThisTurn = true;
  state.playerFirstTurn = false;
  state.lastDrawFromKan = false;
  state.lastDrawFromDeck = false;
  log(`ロン: ${tile.name}`);
  declareWin();
}

function skipPon() {
  if (!state.pendingPon) return;
  if (state.dealing) return;
  state.pendingPon = false;
  state.pendingPonTile = null;
  render();
  autoDrawIfNeeded();
}

function moveTile(fromIndex, toIndex) {
  if (fromIndex === toIndex) return;
  const [moved] = state.player.splice(fromIndex, 1);
  state.player.splice(toIndex, 0, moved);
}

function render() {
  el.pHand.innerHTML = "";
  const drawnIndex = state.lastDrawnId
    ? state.player.findIndex((t) => t.id === state.lastDrawnId)
    : -1;
  const renderList = state.player.map((t, i) => ({ t, i }));
  if (drawnIndex >= 0) {
    const drawn = renderList.splice(drawnIndex, 1)[0];
    renderList.push(drawn);
  }
  renderList.forEach(({ t, i }) => {
    const div = document.createElement("div");
    const drawnClass = t.id === state.lastDrawnId ? " drawn" : "";
    div.className = `tile ${t.color}${drawnClass}`;
    div.textContent = t.name;
    div.title = "クリックで捨てる";
    div.draggable = state.started && state.turn === "player" && !state.autoSort && !state.selectingKan;
    div.ondragstart = (e) => {
      if (!div.draggable) return;
      e.dataTransfer.setData("text/plain", String(i));
      div.classList.add("active");
    };
    div.ondragend = () => div.classList.remove("active");
    div.ondragover = (e) => {
      if (state.autoSort || state.selectingKan) return;
      e.preventDefault();
    };
    div.ondrop = (e) => {
      if (state.autoSort || state.selectingKan) return;
      e.preventDefault();
      const fromIndex = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isNaN(fromIndex)) return;
      moveTile(fromIndex, i);
      render();
    };
  div.onclick = () => {
    if (state.selectingKan) {
      if (state.kanSelectNames.includes(t.name)) {
        executeKan(t.name);
      }
      return;
    }
    if (state.dealing) return;
    if (state.pendingPon) return;
    discardFromPlayer(i);
  };
    el.pHand.appendChild(div);
  });
  const targetSlots = state.turn === "player" && state.drawnThisTurn ? 14 : 13;
  const placeholders = Math.max(0, targetSlots - renderList.length);
  for (let i = 0; i < placeholders; i++) {
    const div = document.createElement("div");
    div.className = "tile placeholder";
    div.textContent = "";
    el.pHand.appendChild(div);
  }

  el.oHand.innerHTML = "";
  state.opponent.forEach(() => {
    const div = document.createElement("div");
    div.className = "tile back";
    div.textContent = "";
    el.oHand.appendChild(div);
  });

  el.riverO.innerHTML = "";
  state.riverO.forEach((r) => {
    const div = document.createElement("div");
    div.className = `tile ${r.tile.color}`;
    div.textContent = r.tile.name;
    div.title = r.by === "player" ? "あなた" : "相手";
    el.riverO.appendChild(div);
  });

  el.riverP.innerHTML = "";
  state.riverP.forEach((r) => {
    const div = document.createElement("div");
    div.className = `tile ${r.tile.color}`;
    div.textContent = r.tile.name;
    div.title = r.by === "player" ? "あなた" : "相手";
    el.riverP.appendChild(div);
  });

  el.deckCount.textContent = state.deck.length;
  el.turnBadge.textContent = state.turn === "player" ? "あなたの番" : "相手の番";
  el.status.textContent = state.started
    ? (state.dealing ? "配牌中"
      : state.turn === "player"
      ? (state.pendingPon ? "ポンするか選んでください" : (state.drawnThisTurn ? "捨ててください" : "自動ツモ中"))
      : "相手の思考中")
    : "新規開始を押してください";

  el.btnDraw.disabled = !state.started || state.turn !== "player" || state.drawnThisTurn || state.dealing;
  el.btnKan.disabled = !state.started || state.turn !== "player" || canKanNames().length === 0 || state.selectingKan || state.pendingPon || state.dealing;
  el.btnPon.disabled = !state.pendingPon || state.dealing;
  el.btnRon.disabled = !state.pendingPon || state.dealing;
  el.btnSkip.disabled = !state.pendingPon || state.dealing;
  el.btnTsumo.disabled = !state.started || state.turn !== "player" || !state.drawnThisTurn || state.dealing;
  el.kanArea.innerHTML = "";
  state.playerKans.forEach((k) => {
    for (let i = 0; i < 4; i++) {
      const div = document.createElement("div");
      div.className = `tile ${k.color} kan`;
      div.textContent = k.name;
      el.kanArea.appendChild(div);
    }
  });
  el.ponArea.innerHTML = "";
  state.playerPons.forEach((p) => {
    for (let i = 0; i < 3; i++) {
      const div = document.createElement("div");
      div.className = `tile ${p.color} pon`;
      div.textContent = p.name;
      el.ponArea.appendChild(div);
    }
  });

  el.ponPrompt.classList.toggle("show", state.pendingPon);
  if (state.pendingPon && state.pendingPonTile) {
    el.ponText.textContent = `ポンしますか？（${state.pendingPonTile.name}）`;
  }
}

el.btnNew.onclick = () => deal(false, false, false);
el.btnDraw.onclick = drawTile;
el.btnKan.onclick = declareKan;
el.btnDebug.onclick = () => deal(true, false, false);
el.btnDebugPon.onclick = () => deal(false, true, false);
el.btnDebugReiris.onclick = () => deal(false, false, true);
el.btnDebugBegrazia.onclick = () => dealYaku("begrazia");
el.btnDebugSyngUp.onclick = () => dealYaku("syngup");
el.btnDebugRed.onclick = () => dealYaku("red");
el.btnDebugBlue.onclick = () => dealYaku("blue");
el.btnDebugPurple.onclick = () => dealYaku("purple");
el.btnWinNew.onclick = () => deal(false, false, false);
el.btnPon.onclick = executePon;
el.btnRon.onclick = executeRon;
el.btnTsumo.onclick = declareWin;
el.btnSkip.onclick = skipPon;
el.chkAutoSort.onchange = () => {
  state.autoSort = el.chkAutoSort.checked;
  if (state.autoSort) sortHand(state.player);
  render();
};

el.btnDebugRon.onclick = () => {
  const target = CHARACTERS[3];
  const ronTiles = [];
  state.deck = buildDeck();
  state.deck = state.deck.filter((t) => {
    if (t.name === target.name && ronTiles.length < 2) {
      ronTiles.push(t);
      return false;
    }
    return true;
  });
  initHands(ronTiles.concat(state.deck.splice(0, 11)), state.deck.splice(0, 13));
  state.forceRonName = target.name;
};

render();
