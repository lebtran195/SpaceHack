"use strict";
// Visual crew mini-activities. No timers or arithmetic gates; every station can be revised.
const CrewActivities = (() => {
  const kinds = new Set(["garden", "airloop", "inventory", "relay", "window"]);
  const escapeText = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  function mount(host, kind, options = {}) {
    if (!host || !kinds.has(kind))
      throw new Error("Unknown crew activity: " + kind);
    const state = {
      kind,
      easy: !!options.easy,
      completed: false,
      mistakes: 0,
      destroyed: false,
    };
    let draw = () => {},
      keyHandler = null;
    host.classList.add("crew-activity");
    host.dataset.activity = kind;
    host.innerHTML =
      '<div class="ca-body"></div><p class="ca-feedback" role="status" aria-live="polite"></p><p class="ca-note">Simplified training exercise\u2003\u2003take your time, try again, and verify the result.</p>';
    const body = host.querySelector(".ca-body"),
      feedbackEl = host.querySelector(".ca-feedback");
    const paused = () =>
      typeof GameRules !== "undefined" &&
      typeof GameRules.isPaused === "function" &&
      GameRules.isPaused();
    const live = () => !state.completed && !state.destroyed && !paused();
    function feedback(message, mistake = false) {
      if (state.destroyed) return;
      if (mistake) state.mistakes++;
      feedbackEl.textContent = message;
      feedbackEl.classList.toggle("bad", mistake);
      options.onFeedback?.(message, mistake);
    }
    function bind(selector, handler) {
      body.querySelectorAll(selector).forEach((node) =>
        node.addEventListener("click", (event) => {
          if (!live()) return;
          const focused = document.activeElement === node,
            attribute = node
              .getAttributeNames()
              .find((a) => a.startsWith("data-")),
            value = attribute ? node.getAttribute(attribute) : "";
          handler(node, event);
          if (
            focused &&
            !node.isConnected &&
            !state.completed &&
            !state.destroyed &&
            attribute
          ) {
            const replacement = body.querySelector(
              "[" + attribute + '="' + value + '"]',
            );
            if (replacement && !replacement.disabled)
              replacement.focus({ preventScroll: true });
          }
        }),
      );
    }
    function finish(message) {
      if (!live()) return;
      state.completed = true;
      feedbackEl.textContent = message;
      feedbackEl.classList.remove("bad");
      body.querySelectorAll("button,input").forEach((b) => (b.disabled = true));
      if (keyHandler) host.removeEventListener("keydown", keyHandler);
      options.onComplete?.(Math.max(0.6, 1 - state.mistakes * 0.08));
    }
    function draggable(node, payload) {
      node.draggable = true;
      node.addEventListener("dragstart", (e) => {
        if (!live()) {
          e.preventDefault();
          return;
        }
        e.dataTransfer?.setData("text/plain", payload);
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
      });
    }
    function dropTarget(node, prefix, onDrop) {
      node.addEventListener("dragover", (e) => {
        if (!live()) return;
        e.preventDefault();
        node.classList.add("drop-ready");
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      });
      node.addEventListener("dragleave", () =>
        node.classList.remove("drop-ready"),
      );
      node.addEventListener("drop", (e) => {
        e.preventDefault();
        node.classList.remove("drop-ready");
        if (!live()) return;
        const value = e.dataTransfer?.getData("text/plain") || "";
        if (value.startsWith(prefix)) onDrop(value.slice(prefix.length));
      });
    }
    const progress = (items, current, done) =>
      '<div class="ca-progress">' +
      items
        .map(
          (p, i) =>
            `<span class="${done(p, i) ? "done" : i === current ? "current" : ""}">${done(p, i) ? "✓ " : ""}${escapeText(p.name || p.label)}</span>`,
        )
        .join("") +
      "</div>";
    if (kind === "garden") {
      state.plants = [
        {
          id: "lettuce",
          name: "Lettuce",
          need: "water",
          cue: "The root pad looks dry. Leaves are curled and limp.",
          icon: "♧",
          treatment: null,
          verified: false,
        },
        {
          id: "seedling",
          name: "Seedling",
          need: "light",
          cue: "The root pad is moist, but the pale stem leans toward a shaded lamp.",
          icon: "✧",
          treatment: null,
          verified: false,
        },
        {
          id: "herbs",
          name: "Herbs",
          need: "airflow",
          cue: "Water beads cling to the leaves. The small circulation fan is off.",
          icon: "❀",
          treatment: null,
          verified: false,
        },
      ].slice(0, state.easy ? 2 : 3);
      state.at = 0;
      const tools = [
        ["water", "◒", "Water root pad"],
        ["light", "☀", "Adjust grow light"],
        ["airflow", "≋", "Restore airflow"],
      ];
      function plantSVG(p) {
        const healthy = p.treatment === p.need,
          leaf = healthy
            ? "#83dd91"
            : p.need === "light"
              ? "#bcc582"
              : "#6d987a",
          droop = healthy ? 0 : 10;
        return `<svg class="ca-plant-art" viewBox="0 0 260 210" role="img" aria-label="${escapeText(p.name)} ${healthy ? "responding to treatment" : "needs care"}"><rect x="44" y="12" width="172" height="12" fill="#728ba6"/><rect x="63" y="24" width="134" height="8" fill="${p.treatment === "light" ? "#fff0a0" : "#968f7c"}"/><path d="M70 32L44 105M190 32L216 105" stroke="#c6c38a" opacity=".25"/><path d="M109 174L99 112H164L152 174Z" fill="#957366" stroke="#c8a58a" stroke-width="3"/><rect x="96" y="108" width="71" height="12" fill="#4b6575"/><path d="M132 112V63" stroke="#6bb377" stroke-width="7"/><path d="M132 85Q76 ${50 + droop} 81 ${88 + droop}Q109 109 132 85M134 76Q183 ${46 + droop} 187 ${83 + droop}Q163 104 134 76M131 66Q105 ${29 + droop} 122 29Q146 33 131 66" fill="${leaf}" stroke="#4d8c64" stroke-width="2"/>${p.need === "water" && !healthy ? '<path d="M103 121l13 8-5 10m19-17l8 10-4 8m13-18l9 7" stroke="#a3836b" stroke-width="2" fill="none"/>' : ""}${p.need === "airflow" && !healthy ? '<g fill="#84cadb"><circle cx="90" cy="92" r="4"/><circle cx="174" cy="90" r="4"/><circle cx="126" cy="48" r="3"/></g>' : ""}<rect x="204" y="73" width="30" height="31" fill="#36546b" stroke="#91b0be" stroke-width="2"/><path d="M219 77v23m-12-11h24m-20-8l16 16m0-16l-16 16" stroke="${p.treatment === "airflow" ? "#8ff3d0" : "#6b8091"}" stroke-width="3"/>${healthy ? '<path d="M190 149l8 8 16-22" stroke="#a3ffd2" stroke-width="5" fill="none"/>' : ""}</svg>`;
      }
      draw = () => {
        const p = state.plants[state.at];
        body.innerHTML =
          '<p class="ca-kicker">SPACE GARDEN / OBSERVE → CARE → VERIFY</p>' +
          progress(state.plants, state.at, (p) => p.verified) +
          `<div class="ca-screen ca-plant-stage">${plantSVG(p)}<div><b class="ca-plant-state">${p.name}</b><p class="ca-observation">${p.cue}</p>${state.easy ? `<p class="ca-caption">Crew hint: try the ${p.need === "water" ? "water pouch" : p.need === "light" ? "grow light" : "circulation fan"}.</p>` : ""}<div class="ca-growth"><i style="width:${p.treatment === p.need ? "100" : "28"}%"></i></div><span class="ca-pill">${p.treatment === p.need ? "Leaves responding — verify growth" : "Observe the leaf and root clues"}</span></div></div><div class="ca-care-tools ca-actions">${tools.map(([id, icon, label]) => `<button class="ca-tool ${p.treatment === id ? "chosen" : ""}" type="button" data-care="${id}" aria-pressed="${p.treatment === id}"><b>${icon}</b>${label}</button>`).join("")}</div><div class="ca-actions"><button class="btn green" type="button" data-growth-check>Verify new growth</button><button class="btn small" type="button" data-care-reset>Reset care trial</button></div>`;
        bind("[data-care]", (b) => {
          p.treatment = b.dataset.care;
          feedback(
            p.treatment === p.need
              ? "The plant is responding. Verify the new growth."
              : "Care trial applied. Check whether it addresses the observed clue.",
          );
          draw();
        });
        bind("[data-care-reset]", () => {
          p.treatment = null;
          feedback("Care trial reset. Look at the leaf and root clues again.");
          draw();
        });
        bind("[data-growth-check]", () => {
          if (p.treatment !== p.need) {
            feedback(
              "The original symptom remains. Match the care tool to the observed need.",
              true,
            );
            return;
          }
          p.verified = true;
          if (state.plants.every((p) => p.verified)) {
            draw();
            finish(
              "Garden checks complete. Root moisture, light and circulation are part of a healthy growing environment.",
            );
            return;
          }
          state.at++;
          feedback("Growth verified. Move to the next specimen.");
          draw();
        });
      };
    } else if (kind === "airloop") {
      state.inspected = new Set();
      state.active = "A";
      state.blocked = true;
      state.replaced = false;
      state.verified = false;
      draw = () => {
        const activeBlocked = state.active === "A" && state.blocked,
          trend = state.replaced
            ? "clearing"
            : state.active === "B"
              ? "stable"
              : "";
        body.innerHTML =
          '<p class="ca-kicker">CABIN AIR / CO₂-SCRUBBER TRAINING SCHEMATIC</p><p class="ca-intro">Inspect a blocked CO₂-scrubber training cartridge, protect the cabin with the alternate loop, fit a replacement in the schematic, then check the air-quality trend.</p><div class="ca-screen"><div class="ca-air-diagram"><button type="button" class="ca-air-node" data-air-inspect="inlet"><b>≋</b>Cabin inlet<small>Inspect flow</small></button><div class="ca-air-loops">' +
          ["A", "B"]
            .map(
              (id) =>
                `<button type="button" class="ca-air-loop ${state.active === id ? "active" : ""} ${id === "A" && state.blocked ? "blocked" : ""}" data-air-inspect="${id}">FILTER ${id}<div class="ca-cartridge ${id === "A" && state.blocked ? "blocked" : ""}"><i></i><i></i><i></i><i></i></div><small>${state.active === id ? "ACTIVE" : "ISOLATED / STANDBY"}${id === "A" && state.replaced ? "\u2003\u2003FRESH CARTRIDGE" : ""}</small></button>`,
            )
            .join("") +
          '</div><button type="button" class="ca-air-node" data-air-inspect="outlet"><b>◉</b>Cabin sensor<small>Inspect trend</small></button></div><p class="ca-flow-line">' +
          (activeBlocked
            ? "⚠ Restricted flow through A"
            : state.replaced
              ? "✓ Alternate loop protects cabin; fresh cartridge installed"
              : "↗ Alternate loop B carrying cabin flow") +
          '</p><div class="ca-trend ' +
          trend +
          '" aria-label="Air quality ' +
          (trend === "clearing"
            ? "improving"
            : trend === "stable"
              ? "stable"
              : "worsening") +
          '">' +
          (trend === "clearing"
            ? [50, 43, 36, 29, 22, 15]
            : trend === "stable"
              ? [48, 48, 47, 47, 46, 46]
              : [16, 22, 29, 36, 43, 50]
          )
            .map((h) => '<i style="height:' + h + 'px"></i>')
            .join("") +
          '</div><p class="ca-caption">CO₂ trend: ' +
          (trend === "clearing"
            ? "falling toward the training baseline"
            : trend === "stable"
              ? "rise stopped — cartridge still needs service"
              : "rising while the training filter is blocked") +
          '</p></div><p class="ca-observation" data-air-evidence>' +
          airEvidence() +
          '</p><div class="ca-actions"><button type="button" class="btn small" data-air-switch>Switch to alternate loop B</button><button type="button" class="btn small" data-air-replace>Replace isolated cartridge A</button><button type="button" class="btn green" data-air-verify>Verify cabin trend</button></div><p class="ca-note">This is a fictional training schematic, not instructions for servicing real life-support equipment.</p>';
        bind("[data-air-inspect]", (b) => {
          state.inspected.add(b.dataset.airInspect);
          state.lastInspected = b.dataset.airInspect;
          feedback(
            b.dataset.airInspect === "A"
              ? "A blockage is visible in cartridge A. Alternate loop B is available."
              : "Inspection recorded. Compare the restricted filter with the standby path.",
          );
          draw();
        });
        bind("[data-air-switch]", () => {
          if (!state.inspected.has("A")) {
            feedback(
              "Training interlock: inspect the restricted filter before changing the active path.",
              true,
            );
            return;
          }
          state.active = "B";
          feedback(
            "Alternate loop B is carrying flow. Cartridge A is isolated in this schematic.",
          );
          draw();
        });
        bind("[data-air-replace]", () => {
          if (state.active !== "B") {
            feedback(
              "Training interlock: the cabin needs the alternate path before this cartridge can be removed.",
              true,
            );
            return;
          }
          state.blocked = false;
          state.replaced = true;
          feedback(
            "Fresh training cartridge seated. Check the trend rather than assuming the repair worked.",
          );
          draw();
        });
        bind("[data-air-verify]", () => {
          if (!state.replaced || state.active !== "B") {
            feedback(
              "The training trend has not recovered. Inspect, use the alternate loop, and fit the replacement first.",
              true,
            );
            return;
          }
          state.verified = true;
          finish(
            "Air-loop exercise verified. The cabin trend is improving and the independent flow path stayed available.",
          );
        });
      };
      function airEvidence() {
        if (state.replaced)
          return "Inspection log: fresh cartridge in A. Verify that the cabin trend is improving.";
        if (state.lastInspected === "A")
          return "Filter A inspection: visible blockage in the training cartridge. Filter B is clear and ready.";
        if (state.lastInspected === "B")
          return "Filter B inspection: clear cartridge; alternate flow path available.";
        if (state.lastInspected === "outlet")
          return state.active === "B"
            ? "Cabin trend: the rise has stopped, but the blocked cartridge is still tagged for replacement."
            : "Cabin trend: CO₂ rising with restricted flow.";
        if (state.lastInspected === "inlet")
          return "Inlet inspection: fan operating. Compare the two filter paths.";
        return state.easy
          ? "Crew hint: inspect the red filter A first."
          : "Tap the modules to gather evidence before acting.";
      }
    } else if (kind === "inventory") {
      state.items = [
        {
          id: "wrench",
          name: "Hand wrench",
          icon: "⚒",
          slot: "Tool tether",
          note: "Secure the hand tool",
        },
        {
          id: "tablet",
          name: "Crew tablet",
          icon: "▤",
          slot: "Tablet dock",
          note: "Lock the display in its dock",
        },
        {
          id: "sample",
          name: "Specimen jar",
          icon: "◈",
          slot: "Padded specimen locker",
          note: "Protect the research sample",
        },
        {
          id: "drink",
          name: "Drink pouch",
          icon: "◒",
          slot: "Drink-pouch clip",
          note: "Keep the pouch within reach",
        },
        {
          id: "cable",
          name: "Loose cable",
          icon: "⌁",
          slot: "Cable reel",
          note: "Coil and secure the cable",
        },
      ].slice(0, state.easy ? 3 : 5);
      state.selected = null;
      state.stored = {};
      function store(id, slot) {
        const item = state.items.find((p) => p.id === id);
        if (!item || state.stored[id]) return;
        if (id !== slot) {
          feedback(
            "That location is not labeled for this item. Keep the item selected and try its matching restraint.",
            true,
          );
          return;
        }
        state.stored[id] = slot;
        state.selected = null;
        feedback(
          item.name +
            " secured. Floating equipment belongs in a labeled restraint.",
        );
        draw();
        if (Object.keys(state.stored).length === state.items.length)
          finish(
            "Cabin stowage complete. Every loose item is restrained and the walkway is clear.",
          );
      }
      draw = () => {
        body.innerHTML =
          '<p class="ca-kicker">ZERO-G STOWAGE / CATCH → MATCH → SECURE</p><p class="ca-intro">Drag a floating item into its labeled restraint, or tap the item and then its storage location. Everything can be secured without racing a timer.</p><div class="ca-float-bay">' +
          state.items
            .map(
              (p) =>
                `<button type="button" class="ca-floating-item ${state.selected === p.id ? "selected" : ""}" data-floating="${p.id}" aria-pressed="${state.selected === p.id}" ${state.stored[p.id] ? "disabled" : ""}><span class="ca-item-icon">${p.icon}</span>${p.name}${state.stored[p.id] ? "<br>SECURED ✓" : ""}</button>`,
            )
            .join("") +
          '</div><p class="ca-caption">' +
          (state.selected
            ? "Selected: " +
              state.items.find((p) => p.id === state.selected).name +
              ". Choose its labeled restraint."
            : "Tap an item to catch it. Enter or Space works on focused cards.") +
          '</p><div class="ca-inventory-rack">' +
          state.items
            .map(
              (p) =>
                `<button type="button" class="ca-storage-slot ${state.stored[p.id] ? "filled" : ""}" data-storage="${p.id}"><span class="ca-item-icon">${state.stored[p.id] ? p.icon : "□"}</span><b>${p.slot}</b><br>${state.stored[p.id] ? "LATCHED ✓" : state.easy ? p.name : p.note}</button>`,
            )
            .join("") +
          "</div>";
        bind("[data-floating]", (b) => {
          state.selected = b.dataset.floating;
          draw();
        });
        bind("[data-storage]", (b) => {
          if (!state.selected) {
            feedback("Catch a floating item first, then choose its restraint.");
            return;
          }
          store(state.selected, b.dataset.storage);
        });
        body.querySelectorAll("[data-floating]").forEach((b) => {
          draggable(b, "crew-tool:" + b.dataset.floating);
          b.addEventListener("dragstart", () => {
            if (live()) state.selected = b.dataset.floating;
          });
        });
        body
          .querySelectorAll("[data-storage]")
          .forEach((b) =>
            dropTarget(b, "crew-tool:", (id) => store(id, b.dataset.storage)),
          );
      };
    } else if (kind === "relay") {
      state.cards = [
        { id: "antenna", label: "Check antenna", icon: "⌁" },
        { id: "channel", label: "Confirm clear channel", icon: "◉" },
        ...(state.easy
          ? []
          : [{ id: "readback", label: "Read message back", icon: "↔" }]),
        { id: "status", label: "Send crew status", icon: "▤" },
      ];
      state.expected = state.cards.map((c) => c.id);
      state.hand = [...state.cards].reverse();
      state.order = [];
      const instruction = state.easy
        ? "Check the antenna, confirm the channel is clear, then send the crew status."
        : "Check the antenna, confirm the channel is clear, read the message back, then send the crew status.";
      function put(id, index = state.order.length) {
        if (!state.cards.some((c) => c.id === id)) return;
        const old = state.order.indexOf(id);
        if (old >= 0) state.order.splice(old, 1);
        state.order.splice(Math.min(index, state.order.length), 0, id);
        feedback(
          "Readback updated. You can tap a placed card to remove it or drag it into another position.",
        );
        draw();
      }
      draw = () => {
        body.innerHTML =
          '<p class="ca-kicker">RADIO READBACK / BUILD THE RECEIVED INSTRUCTION</p><p class="ca-radio-message">“' +
          instruction +
          '”</p><p class="ca-received">Choose command cards in the same order as the received message. Drag also works. This is a communication check, not a memory timer.</p><div class="ca-relay-hand">' +
          state.hand
            .map(
              (c) =>
                `<button type="button" class="ca-command-card" data-command="${c.id}" ${state.order.includes(c.id) ? "disabled" : ""}><span class="ca-item-icon">${c.icon}</span>${c.label}</button>`,
            )
            .join("") +
          '</div><p class="ca-kicker" style="margin-top:15px">YOUR READBACK →</p><div class="ca-relay-order">' +
          state.cards
            .map((_, i) => {
              const c = state.cards.find((p) => p.id === state.order[i]);
              return `<button type="button" class="ca-relay-slot ${c ? "filled" : ""}" data-relay-slot="${i}" ${c ? 'data-placed="' + c.id + '"' : ""}>${c ? c.icon + " " + c.label : "Drop next command here"}</button>`;
            })
            .join("") +
          '</div><div class="ca-actions"><button class="btn green" type="button" data-relay-verify>Transmit readback</button><button class="btn small" type="button" data-relay-undo>Undo last card</button><button class="btn small" type="button" data-relay-reset>Clear readback</button></div>';
        bind("[data-command]", (b) => put(b.dataset.command));
        bind("[data-placed]", (b) => {
          state.order = state.order.filter((id) => id !== b.dataset.placed);
          feedback("Card returned to the command hand.");
          draw();
        });
        bind("[data-relay-undo]", () => {
          state.order.pop();
          feedback("Last command returned. Build or revise the readback.");
          draw();
        });
        bind("[data-relay-reset]", () => {
          state.order = [];
          feedback("Readback cleared. The received message stays visible.");
          draw();
        });
        bind("[data-relay-verify]", () => {
          if (state.order.length !== state.expected.length) {
            feedback(
              "Readback incomplete. Include each received instruction before transmitting.",
              true,
            );
            return;
          }
          if (state.order.some((id, i) => id !== state.expected[i])) {
            feedback(
              "The order differs from Mission Control’s message. Remove or move the misplaced cards and try again.",
              true,
            );
            return;
          }
          finish(
            "Readback confirmed. The crew and Mission Control share the same instruction.",
          );
        });
        body
          .querySelectorAll("[data-command]")
          .forEach((b) => draggable(b, "crew-command:" + b.dataset.command));
        body.querySelectorAll("[data-relay-slot]").forEach((b) => {
          if (b.dataset.placed)
            draggable(b, "crew-command:" + b.dataset.placed);
          dropTarget(b, "crew-command:", (id) => put(id, +b.dataset.relaySlot));
        });
      };
    } else {
      state.features = [
        { id: "crater", name: "Rim crater", icon: "◉", x: 110, y: 92 },
        { id: "ridge", name: "Forked ridge", icon: "≋", x: 422, y: 182 },
        { id: "bright", name: "Bright patch", icon: "✧", x: 242, y: 308 },
      ].slice(0, state.easy ? 2 : 3);
      state.at = 0;
      state.x = 270;
      state.y = 200;
      state.photos = [];
      function terrain() {
        return (
          '<rect x="0" y="0" width="600" height="400" fill="#45616a"/><path d="M0 60Q170 130 300 30T600 85V0H0Z" fill="#647c78"/><path d="M0 240Q140 180 300 260T600 240V400H0Z" fill="#65736f"/><path d="M0 320L160 220L290 270L415 190L600 220" fill="none" stroke="#344e5b" stroke-width="24"/><g fill="#7b8f85" stroke="#2c4655" stroke-width="3"><circle cx="110" cy="92" r="29"/><circle cx="110" cy="92" r="19" fill="#3c5861"/><circle cx="530" cy="300" r="23"/><circle cx="44" cy="185" r="17"/></g><path d="M360 152L405 177L453 147M405 177L425 213" stroke="#c7b896" stroke-width="11" fill="none"/><path d="M218 292L240 281L268 303L257 327L224 325Z" fill="#d8cfb0" stroke="#edf2ca" stroke-width="2"/>' +
          state.features
            .map(
              (f) =>
                `<text x="${f.x - 37}" y="${f.y - 35}" fill="#f0f5dd" font-size="11" font-family="monospace">${f.name}</text>`,
            )
            .join("")
        );
      }
      function pan(direction) {
        const delta = state.easy ? 24 : 20,
          shift = {
            left: [-delta, 0],
            right: [delta, 0],
            up: [0, -delta],
            down: [0, delta],
          }[direction];
        if (!shift) return;
        state.x = Math.max(90, Math.min(510, state.x + shift[0]));
        state.y = Math.max(60, Math.min(340, state.y + shift[1]));
        draw();
      }
      function capture() {
        const target = state.features[state.at],
          distance = Math.hypot(state.x - target.x, state.y - target.y);
        if (distance > (state.easy ? 29 : 23)) {
          feedback(
            "The requested feature is outside the center reticle. Pan toward the highlighted feature on the overview.",
            true,
          );
          return;
        }
        state.photos.push(target.id);
        if (state.photos.length === state.features.length) {
          draw();
          finish(
            "Observation set complete. Each photo is labeled and centered on its requested surface feature.",
          );
          return;
        }
        state.at++;
        feedback(
          target.name +
            " captured. Point the camera toward the next requested feature.",
        );
        draw();
      }
      draw = () => {
        const target = state.features[state.at],
          distance = Math.hypot(state.x - target.x, state.y - target.y),
          locked = distance <= (state.easy ? 29 : 23),
          horizontal =
            target.x < state.x - 20
              ? "left"
              : target.x > state.x + 20
                ? "right"
                : "",
          vertical =
            target.y < state.y - 20
              ? "up"
              : target.y > state.y + 20
                ? "down"
                : "",
          hint = locked
            ? "Target centered — capture when ready."
            : "Pan " +
              ([vertical, horizontal].filter(Boolean).join(" and ") ||
                (Math.abs(target.x - state.x) > Math.abs(target.y - state.y)
                  ? target.x < state.x
                    ? "left"
                    : "right"
                  : target.y < state.y
                    ? "up"
                    : "down")) +
              ".";
        body.innerHTML = `<p class="ca-kicker">OBSERVATION WINDOW / POINT → IDENTIFY → CAPTURE</p><p class="ca-intro">Find <b>${target.name}</b>. Use the arrow controls or keyboard arrows to bring it inside the center reticle, then capture an observation.</p><div class="ca-window-layout"><div class="ca-camera-screen"><svg viewBox="${state.x - 90} ${state.y - 60} 180 120" role="img" aria-label="Camera view of fictional planetary terrain">${terrain()}<g fill="none" stroke="${locked ? "#77ffb1" : "#ffcd65"}" stroke-width="1.5"><circle cx="${state.x}" cy="${state.y}" r="${state.easy ? 29 : 23}"/><path d="M${state.x - 34} ${state.y}H${state.x + 34}M${state.x} ${state.y - 34}V${state.y + 34}"/></g></svg></div><div class="ca-window-side"><svg class="ca-map-overview" viewBox="0 0 600 400" role="img" aria-label="Surface overview with requested feature highlighted">${terrain()}<circle cx="${target.x}" cy="${target.y}" r="43" fill="none" stroke="#a5ffd0" stroke-width="8"/><rect x="${state.x - 90}" y="${state.y - 60}" width="180" height="120" fill="none" stroke="#ffcd65" stroke-width="6"/></svg><div><p class="ca-feature-label">${hint}</p><div class="ca-camera-controls">${[
          ["up", "▲"],
          ["left", "◀"],
          ["down", "▼"],
          ["right", "▶"],
        ]
          .map(
            ([id, label]) =>
              `<button type="button" data-pan="${id}" aria-label="Pan camera ${id}">${label}</button>`,
          )
          .join(
            "",
          )}</div></div></div></div><div class="ca-actions"><button class="btn green" type="button" data-camera-capture>Capture ${target.name}</button><button class="btn small" type="button" data-camera-center>Reset camera view</button></div><div class="ca-photo-strip">${state.features.map((f) => `<div class="ca-photo ${state.photos.includes(f.id) ? "captured" : ""}"><b>${state.photos.includes(f.id) ? "✓" : f.icon}</b>${f.name}<br>${state.photos.includes(f.id) ? "LABELED PHOTO" : "NOT CAPTURED"}</div>`).join("")}</div><p class="ca-caption">Fictional terrain combines training features; it is not an image of a specific world.</p>`;
        bind("[data-pan]", (b) => pan(b.dataset.pan));
        bind("[data-camera-capture]", capture);
        bind("[data-camera-center]", () => {
          state.x = 270;
          state.y = 200;
          feedback(
            "View reset. Use the overview to find your requested feature.",
          );
          draw();
        });
      };
      keyHandler = (e) => {
        if (!live() || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
        const direction = {
          ArrowLeft: "left",
          ArrowRight: "right",
          ArrowUp: "up",
          ArrowDown: "down",
        }[e.key];
        if (direction) {
          e.preventDefault();
          e.stopPropagation();
          pan(direction);
          host.focus({ preventScroll: true });
        }
        if (
          (e.key === " " || e.code === "Space") &&
          !e.repeat &&
          e.target === host
        ) {
          e.preventDefault();
          capture();
        }
      };
      host.addEventListener("keydown", keyHandler);
      host.tabIndex = 0;
    }
    draw();
    return {
      state,
      render: () => {
        if (!state.destroyed) draw();
      },
      destroy() {
        state.destroyed = true;
        if (keyHandler) host.removeEventListener("keydown", keyHandler);
      },
    };
  }
  return { supports: (kind) => kinds.has(kind), mount };
})();
