"use strict";
// Browser adaptation of the supplied crew-demo idea. The reference is not executed.
function startCrewInterior(done) {
  return CrewInterior.start(done);
}
const CrewInterior = (() => {
  const TILE = 8,
    COLS = 48,
    ROWS = 28,
    W = 384,
    H = 224,
    SPD = 47;
  const rooms = [
    { id: "cockpit", label: "COCKPIT", x: 2, y: 3, w: 13, h: 8 },
    { id: "command", label: "COMMAND", x: 17, y: 3, w: 13, h: 8 },
    { id: "lab", label: "SCIENCE LAB", x: 32, y: 3, w: 14, h: 8 },
    { id: "garden", label: "CREW GARDEN", x: 2, y: 17, w: 13, h: 8 },
    { id: "engine", label: "ENGINE BAY", x: 17, y: 17, w: 13, h: 8 },
    { id: "airlock", label: "AIRLOCK", x: 32, y: 17, w: 14, h: 8 },
  ];
  const crewHome = {
    engineer: { name: "Pip", x: 194, y: 178, color: "#ffb55e" },
    scientist: { name: "Ari", x: 322, y: 68, color: "#9a84ff" },
    pilot: { name: "Sol", x: 74, y: 68, color: "#62adff" },
    diplomat: { name: "Mira", x: 184, y: 68, color: "#77ffb1" },
  };
  const stations = {
    power: {
      id: "power",
      name: "Restore the power bus",
      room: "engine",
      x: 184,
      y: 151,
      puzzle: "power",
      fact: "Spacecraft crews protect essential electrical loads before optional experiments. This training board is simplified.",
      reward: { energy: 5 },
    },
    leak: {
      id: "leak",
      name: "Find and seal the air leak",
      room: "airlock",
      x: 315,
      y: 151,
      puzzle: "leak",
      fact: "A useful repair includes inspection and a final function check. Actual crew emergency procedures are vehicle-specific; this is a fictional training exercise.",
      reward: { hull: 5 },
    },
    airloop: {
      id: "airloop",
      name: "Give the cabin a clean-air check",
      room: "engine",
      x: 209,
      y: 180,
      puzzle: "airloop",
      fact: "Life-support systems remove carbon dioxide and manage ventilation. A CO₂ filter does not make oxygen. Crews inspect equipment, coordinate maintenance and verify its operation.",
      reward: { hull: 3, energy: 2 },
    },
    garden: {
      id: "garden",
      name: "Bring the orbital garden back to life",
      room: "garden",
      x: 58,
      y: 151,
      puzzle: "garden",
      fact: "NASA plant experiments use seed pillows, check water needs, photograph growth and preserve samples. Leaf clues in this game are simplified training cues.",
      reward: { science: 5 },
    },
    inventory: {
      id: "inventory",
      name: "Catch, tether and stow the tools",
      room: "airlock",
      x: 342,
      y: 180,
      puzzle: "inventory",
      fact: "A microgravity workspace needs organized, secured tools. Choose the matching storage point and keep the cabin passage clear.",
      reward: { hull: 3, energy: 2 },
    },
    samples: {
      id: "samples",
      name: "Store the research specimens",
      room: "lab",
      x: 315,
      y: 43,
      puzzle: "samples",
      fact: "Specimens need the correct storage environment and clear labels so that later measurements remain useful.",
      reward: { science: 6 },
    },
    calibrate: {
      id: "calibrate",
      name: "Check the experiment sensor",
      room: "engine",
      x: 184,
      y: 151,
      puzzle: "thermal",
      fact: "Cross-checking independent sensors helps distinguish equipment trouble from an unreliable measurement.",
      reward: { science: 4 },
    },
    window: {
      id: "window",
      name: "Frame a science photograph",
      room: "cockpit",
      x: 90,
      y: 65,
      puzzle: "window",
      fact: "Crew observation photography combines a target brief, useful framing and a recorded image. These landscapes are fictional and the scene is not a live orbital map.",
      reward: { science: 5 },
    },
    attitude: {
      id: "attitude",
      name: "Orient the spacecraft for work",
      room: "cockpit",
      x: 58,
      y: 43,
      puzzle: "attitude",
      fact: "Attitude-control pulses change where a vehicle points, helping align its instruments, antenna or solar arrays.",
      reward: { fuel: 3 },
    },
    dock: {
      id: "dock",
      name: "Run the arrival interlocks",
      room: "airlock",
      x: 315,
      y: 151,
      puzzle: "dock",
      fact: "Visiting vehicles require coordinated crew monitoring and verification. This fictional exercise is not an operational docking checklist.",
      reward: { hull: 4 },
    },
    relay: {
      id: "relay",
      name: "Read back the ground-team plan",
      room: "command",
      x: 184,
      y: 43,
      puzzle: "relay",
      fact: "Distributed teams need clear shared plans. A readback catches a misunderstood sequence before work starts; actual communication protocols depend on the mission.",
      reward: { signal: 5 },
    },
    welfare: {
      id: "welfare",
      name: "Build a crew care plan",
      room: "garden",
      x: 58,
      y: 151,
      puzzle: "welfare",
      fact: "Spaceflight schedules include sleep, meals, exercise and time for personal needs. Asking for support helps crews coordinate safe work.",
      reward: { hull: 3 },
    },
    resources: {
      id: "resources",
      name: "Agree on a protected work plan",
      room: "engine",
      x: 184,
      y: 151,
      puzzle: "negotiation",
      fact: "Mission teams protect essential systems and agree on which optional activities fit the resources available.",
      reward: { science: 3, energy: 3 },
    },
  };
  const tasksByRole = {
    engineer: ["airloop", "leak", "power", "inventory"],
    scientist: ["garden", "samples", "calibrate", "window"],
    pilot: ["attitude", "dock", "relay", "window"],
    diplomat: ["welfare", "relay", "resources", "inventory"],
  };
  const missionStories = {
    engineer: {
      title: "Keep the lights on",
      badge: "Systems guardian",
      story:
        "A filter warning arrives as tools drift across the service bay. Inspect the cabin systems, restore a dependable workspace, and check in with your crew before the next watch.",
    },
    scientist: {
      title: "Life in little places",
      badge: "Orbital naturalist",
      story:
        "The garden has a new growth cycle and the research freezer is waiting. Care for living experiments, preserve useful evidence, and make sure your crewmate is ready for the next shift.",
    },
    pilot: {
      title: "A steady hand",
      badge: "Flight watch",
      story:
        "An arrival is approaching and mission control needs clear observations. Prepare the vehicle, coordinate the handover, and check that your crewmate is ready to share the watch.",
    },
    diplomat: {
      title: "Hold it together",
      badge: "Crew anchor",
      story:
        "The cabin is busy and everyone has different priorities. Listen, share a clear ground-team plan, and protect the work that helps the whole crew succeed.",
    },
  };
  const walkable = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (const r of rooms)
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++) walkable[y][x] = true;
  for (let x = 14; x <= 32; x++)
    for (const y of [7, 8, 21, 22]) walkable[y][x] = true;
  for (let y = 10; y <= 17; y++)
    for (let x = 22; x <= 24; x++) walkable[y][x] = true;
  // Cabinet collision cells stay away from the doors and the central shaft.
  const cabinets = [
    [3, 4],
    [4, 4],
    [18, 4],
    [19, 4],
    [33, 4],
    [34, 4],
    [3, 18],
    [4, 18],
    [18, 18],
    [19, 18],
    [33, 18],
    [34, 18],
  ];
  for (const [x, y] of cabinets) walkable[y][x] = false;
  let ui = null,
    s = null,
    raf = 0,
    focusBefore = null;
  const held = { up: false, down: false, left: false, right: false };
  const get = (id) => document.getElementById(id);
  const isKid = () =>
    typeof GameRules !== "undefined" &&
    typeof GameRules.isKid === "function" &&
    GameRules.isKid();
  const paused = () =>
    !!(typeof CrewMissionLog !== "undefined" && CrewMissionLog.active) ||
    (typeof GameRules !== "undefined" &&
    typeof GameRules.isPaused === "function"
      ? GameRules.isPaused()
      : !!(
          (typeof Guidebook !== "undefined" && Guidebook.active) ||
          (typeof CalculatorPad !== "undefined" &&
            (CalculatorPad.active || CalculatorPad.isOpen))
        ));
  const dead = () =>
    ["hull", "energy", "signal", "fuel"].some((k) => flight[k] <= 0);
  const save = (title, note, good = true) => {
    flight.logs.push(`${title}: ${note}`);
    if (typeof snapshotFlight === "function")
      snapshotFlight(title, note, "crew", good);
  };
  const roleName = (r) =>
    ({
      engineer: "Engineer",
      scientist: "Scientist",
      pilot: "Pilot",
      diplomat: "Diplomat",
    })[r] || "Engineer";
  function color(kind, defaultColor) {
    if (typeof palette === "undefined") return defaultColor;
    const v = palette[kind]?.[captain[kind]];
    return typeof v === "string" ? v : v?.color || defaultColor;
  }
  function clearHeld() {
    for (const k in held) held[k] = false;
  }
  function floorAt(x, y) {
    return (
      x >= 0 &&
      y >= 0 &&
      x < W &&
      y < H &&
      !!walkable[Math.floor(y / TILE)]?.[Math.floor(x / TILE)]
    );
  }
  function canStand(x, y) {
    return [
      [-3, -3],
      [3, -3],
      [-3, 3],
      [3, 3],
    ].every(([dx, dy]) => floorAt(x + dx, y + dy));
  }
  function create() {
    if (ui) return;
    const dialog = document.createElement("dialog");
    dialog.id = "crewInterior";
    dialog.setAttribute("aria-labelledby", "ciTitle");
    dialog.innerHTML =
      '<div class="ci-top"><div><span class="ci-kicker">CREW OPERATIONS / WALKABLE SHIP</span><h2 class="ci-title" id="ciTitle">Nobody gets home alone.</h2></div><div class="ci-top-actions"><button type="button" class="btn small" id="ciOpenLog">M / Mission log</button><button type="button" class="btn small" id="ciSkipStage">Skip interior stage</button></div></div><div class="ci-layout"><section><div class="ci-map-frame"><canvas id="ciCanvas" class="ci-canvas" width="768" height="448" aria-label="Walkable six-room spacecraft interior. Use WASD, arrow keys, or tap a floor tile to walk." tabindex="0"></canvas></div><div id="ciHud" class="ci-hud"></div><p class="ci-status" id="ciStatus" role="status"></p><div class="ci-controls"><div class="ci-dpad" aria-label="Movement controls"><button type="button" data-ci-direction="up" aria-label="Move up">▲</button><button type="button" data-ci-direction="left" aria-label="Move left">◀</button><button type="button" data-ci-direction="down" aria-label="Move down">▼</button><button type="button" data-ci-direction="right" aria-label="Move right">▶</button></div><button class="btn primary" id="ciInteract" type="button">E / INTERACT</button><button class="btn green" id="ciFinish" type="button" hidden>Continue mission →</button></div><p class="ci-help">WASD / arrows: move\u2003\u2003E / Space: interact nearby\u2003\u2003tap a room to walk\u2003\u2003M: mission log\u2003\u2003select a mission, then Start to walk to its station.</p><p class="ci-model">Educational crew simulation. Stamina and resource effects are game values; the floor plan is fictional.</p></section><aside class="ci-mission-log" id="ciMissionLog"></aside></div>';
    document.body.append(dialog);
    const task = document.createElement("dialog");
    task.id = "crewInteriorTask";
    task.setAttribute("aria-labelledby", "ciTaskTitle");
    document.body.append(task);
    ui = {
      dialog,
      task,
      canvas: get("ciCanvas"),
      ctx: get("ciCanvas").getContext("2d"),
    };
    ui.ctx.imageSmoothingEnabled = false;
    get("ciOpenLog").onclick = () => openJournal();
    get("ciSkipStage").onclick = () => askSkip("stage");
    get("ciInteract").onclick = () => interact();
    get("ciFinish").onclick = () => finish();
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      askSkip("stage");
    });
    task.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeTask();
    });
    ui.canvas.addEventListener("pointerdown", (e) => {
      if (!s || s.taskOpen || paused()) return;
      const box = ui.canvas.getBoundingClientRect();
      const x = ((e.clientX - box.left) / box.width) * W,
        y = ((e.clientY - box.top) / box.height) * H;
      const target = s.tasks.find(
        (t) => !t.done && Math.hypot(t.x - x, t.y - y) < 14,
      );
      walkTo(x, y, target?.id);
    });
    document.querySelectorAll("[data-ci-direction]").forEach((b) => {
      const direction = b.dataset.ciDirection;
      b.addEventListener("pointerdown", (e) => {
        if (!s || s.taskOpen || paused()) return;
        e.preventDefault();
        s.path = [];
        held[direction] = true;
        b.setPointerCapture?.(e.pointerId);
      });
      for (const ev of ["pointerup", "pointercancel", "pointerleave"])
        b.addEventListener(ev, () => (held[direction] = false));
      b.addEventListener("click", (e) => {
        if (e.detail === 0 && s && !s.taskOpen && !paused()) {
          const [dx, dy] = {
            up: [0, -8],
            down: [0, 8],
            left: [-8, 0],
            right: [8, 0],
          }[direction];
          move(dx, dy);
        }
      });
    });
  }
  function openDialog(dialog) {
    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else dialog.setAttribute("open", "");
  }
  function closeDialog(dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }
  function start(done) {
    create();
    if (s) finish(false);
    focusBefore = document.activeElement;
    const role = campaign?.specialty || captain.specialty || "engineer",
      definitions = (tasksByRole[role] || tasksByRole.engineer).map(
        (id) => stations[id],
      ),
      kid = isKid();
    const npcs = Object.entries(crewHome)
        .filter(([r]) => r !== role)
        .map(([r, v]) => ({ ...v, role: r })),
      buddy = npcs.find((n) => n.role === "diplomat") || npcs[0];
    const check = {
      id: "crewcheck",
      name: "Check on " + buddy.name,
      room:
        buddy.role === "engineer"
          ? "engine"
          : buddy.role === "scientist"
            ? "lab"
            : buddy.role === "pilot"
              ? "cockpit"
              : "command",
      x: buddy.x,
      y: buddy.y,
      puzzle: "crewcheck",
      fact: "Crew check-ins help people notice fatigue, share concerns and agree on a safe next step. Asking for support is part of reliable mission work.",
      reward: { hull: 2, signal: 2 },
    };
    const required = [...(kid ? definitions.slice(0, 2) : definitions), check];
    const optionalInventory = required.some((t) => t.id === "inventory")
      ? {
          ...stations.garden,
          id: "sidegarden",
          x: 88,
          y: 151,
          name: "Tend the off-duty garden",
        }
      : { ...stations.inventory, id: "sidestow" };
    const rest = {
      id: "quiet",
      name: "Take a quiet moment or share a meal",
      room: "garden",
      x: 92,
      y: 178,
      puzzle: "rest",
      optional: true,
      fact: "Protected rest, meals and personal time are part of an astronaut’s schedule. Both privacy and companionship can be useful; choose what your crew needs.",
      reward: {},
    };
    const tasks = [
      ...required.map((t) => ({ ...t, optional: false })),
      rest,
      { ...optionalInventory, optional: true },
    ].map((t) => ({ ...t, done: false, skipped: false }));
    const story = missionStories[role] || missionStories.engineer,
      missions = [
        {
          id: "watch",
          title: story.title,
          type: "MAIN",
          level: 1,
          description: story.story,
          taskIds: required.map((t) => t.id),
          rewards: { xp: kid ? 180 : 300, badge: story.badge },
          optional: false,
        },
        {
          id: "quiet-hours",
          title: "Quiet hours",
          type: "SIDE",
          level: 1,
          description:
            "The ship can wait a moment. Restore your stamina in private, or invite the crew to a shared meal. Both choices have a visible resource trade-off.",
          taskIds: ["quiet"],
          rewards: { xp: 60, badge: "Room to breathe" },
          optional: true,
        },
        {
          id: "little-things",
          title:
            optionalInventory.puzzle === "garden"
              ? "Something green"
              : "A place for everything",
          type: "SIDE",
          level: 2,
          description:
            optionalInventory.puzzle === "garden"
              ? "A little care can turn a spare plant station into a welcome patch of green. Follow the leaf clues and verify the new growth."
              : "Loose tools make a tiny cabin harder to work in. Put the right equipment in its matching tethered storage.",
          taskIds: [optionalInventory.id],
          rewards: {
            xp: 80,
            badge:
              optionalInventory.puzzle === "garden"
                ? "Green thumb"
                : "Cabin keeper",
          },
          optional: true,
        },
      ];
    s = {
      done,
      completed: false,
      role,
      kid,
      tasks,
      missions,
      selectedMission: "watch",
      npcs,
      player: { x: 188, y: 67, facing: 0 },
      path: [],
      queued: null,
      tracked: tasks[0].id,
      taskOpen: false,
      activeTask: null,
      solver: null,
      support: null,
      last: 0,
      walkPhase: 0,
      stamina: Math.max(
        0,
        Math.min(
          100,
          Number.isFinite(Number(campaign.crewStamina))
            ? Number(campaign.crewStamina)
            : 100,
        ),
      ),
      helpCount: 0,
      soloCount: 0,
      skipped: 0,
      taskAttempts: 0,
    };
    campaign.crewStamina = s.stamina;
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", clearHeld);
    window.addEventListener("guidebook:open", clearHeld);
    window.addEventListener("guidebook:close", clearHeld);
    openDialog(ui.dialog);
    get("ciFinish").hidden = true;
    get("ciInteract").disabled = false;
    status(
      `You are the ${roleName(role)}. ${required.length} main objectives, plus optional side missions. Open the mission log to choose your next move. There is no timer.`,
    );
    renderLog();
    updateHud();
    ui.canvas.focus();
    save(
      "Crew interior entered",
      `${roleName(role)} ${kid ? "Easy" : "Standard"} watch: ${required.length} main objectives and 2 optional side missions.`,
      true,
    );
    raf = requestAnimationFrame(loop);
    return { stop: () => finish() };
  }
  function journalSummary(state) {
    const verified = state.missions.filter(
      (m) =>
        m.taskIds.length &&
        m.taskIds.every((id) => {
          const t = state.tasks.find((t) => t.id === id);
          return t?.done && !t.skipped;
        }),
    );
    return {
      mode: state.kid ? "easy" : "standard",
      xp: verified.reduce((n, m) => n + m.rewards.xp, 0),
      badges: verified.map((m) => m.rewards.badge),
      missions: state.missions.map((m) => ({
        id: m.id,
        title: m.title,
        optional: m.optional,
        verified: verified.includes(m),
      })),
    };
  }
  function finish(invoke = true, skipped = false) {
    const old = s;
    if (!old || old.completed) return;
    old.completed = true;
    clearHeld();
    s = null;
    cancelAnimationFrame(raf);
    raf = 0;
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    window.removeEventListener("blur", clearHeld);
    window.removeEventListener("guidebook:open", clearHeld);
    window.removeEventListener("guidebook:close", clearHeld);
    if (typeof CrewMissionLog !== "undefined") CrewMissionLog.close();
    old.solver?.destroy?.();
    closeDialog(ui.task);
    closeDialog(ui.dialog);
    campaign.crewStamina = old.stamina;
    campaign.crewSupport = {
      role: old.role,
      help: old.helpCount,
      solo: old.soloCount,
      skipped: old.skipped,
      completed: old.tasks.filter((t) => t.done && !t.skipped).length,
    };
    campaign.crewJournal = journalSummary(old);
    if (invoke) {
      save(
        "Crew operations complete",
        `${old.helpCount} tasks with crew support; ${old.soloCount} solo; ${old.skipped} delegated/skipped. Stamina ${Math.round(old.stamina)}%. ${campaign.crewJournal.xp} crew XP; ${campaign.crewJournal.badges.length} badges.`,
        !skipped,
      );
      focusBefore?.focus?.();
      old.done?.({ failed: dead(), skipped, mode: "crew" });
    }
  }
  function status(text) {
    get("ciStatus").textContent = text;
  }
  function updateHud() {
    if (!s) return;
    const main = s.tasks.filter((t) => !t.optional);
    get("ciHud").innerHTML =
      [
        ["STAMINA", s.stamina, "#77ffb1"],
        ["SHIP / HULL", flight.hull, "#ff8095"],
        ["SHIP ENERGY", flight.energy, "#62adff"],
      ]
        .map(
          ([label, value, tint]) =>
            `<div class="ci-meter"><span>${label} <b>${Math.round(value)}%</b></span><div role="progressbar" aria-label="${label}" aria-valuenow="${Math.round(value)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${clamp(value)}%;background:${tint}"></i></div></div>`,
        )
        .join("") +
      `<div class="ci-duty">${roleName(s.role)}<strong>${main.filter((t) => t.done).length}/${main.length} MAIN GOALS</strong></div>`;
  }
  function journalOptions() {
    return {
      missions: s.missions,
      tasks: s.tasks,
      selectedId: s.selectedMission,
      trackedTaskId: s.tracked,
      mode: s.kid ? "easy" : "standard",
      onSelect: (id) => {
        if (!s) return;
        s.selectedMission = id;
        if (!CrewMissionLog.active) openJournal();
        else renderLog();
      },
      onTrack: (id) => trackTask(id, false),
      onStart: (id) => trackTask(id, true),
    };
  }
  function renderLog() {
    if (!s) return;
    if (typeof CrewMissionLog !== "undefined")
      CrewMissionLog.mount(get("ciMissionLog"), journalOptions());
  }
  function openJournal() {
    if (!s || s.taskOpen) return;
    clearHeld();
    s.path = [];
    s.queued = null;
    CrewMissionLog.open(journalOptions());
  }
  function trackTask(id, startWalking) {
    if (!s || s.taskOpen) return;
    const task = s.tasks.find((t) => t.id === id && !t.done);
    if (!task) return;
    s.tracked = id;
    renderLog();
    if (startWalking) {
      CrewMissionLog.close();
      walkTo(task.x, task.y, task.id);
    } else
      status(
        `${task.name}\u2003\u2003${roomLabel(task.room)}. The gold marker shows your station. Choose Start in the log to walk there.`,
      );
  }
  function roomLabel(id) {
    return rooms.find((r) => r.id === id)?.label || id;
  }
  function nearestTask() {
    if (!s) return null;
    return s.tasks
      .filter((t) => !t.done)
      .map((t) => ({ t, d: Math.hypot(t.x - s.player.x, t.y - s.player.y) }))
      .sort((a, b) => a.d - b.d)[0];
  }
  function move(dx, dy) {
    if (!s || s.taskOpen || paused()) return;
    const p = s.player;
    if (canStand(p.x + dx, p.y)) p.x += dx;
    if (canStand(p.x, p.y + dy)) p.y += dy;
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      p.facing =
        Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : dy > 0 ? 2 : 0;
      s.walkPhase += Math.abs(dx) + Math.abs(dy);
    }
  }
  function pathfind(x, y) {
    const from = [Math.floor(s.player.x / TILE), Math.floor(s.player.y / TILE)],
      goal = [Math.floor(x / TILE), Math.floor(y / TILE)];
    if (!walkable[goal[1]]?.[goal[0]]) return [];
    const queue = [from],
      seen = new Map([[from.join(","), null]]);
    for (let q = 0; q < queue.length; q++) {
      const at = queue[q];
      if (at[0] === goal[0] && at[1] === goal[1]) break;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const next = [at[0] + dx, at[1] + dy],
          key = next.join(",");
        if (
          !walkable[next[1]]?.[next[0]] ||
          seen.has(key) ||
          !canStand(next[0] * TILE + 4, next[1] * TILE + 4)
        )
          continue;
        seen.set(key, at);
        queue.push(next);
      }
    }
    if (!seen.has(goal.join(","))) return [];
    const path = [];
    let at = goal;
    while (at) {
      path.unshift({ x: at[0] * TILE + 4, y: at[1] * TILE + 4 });
      at = seen.get(at.join(","));
    }
    path.shift();
    return path;
  }
  function walkTo(x, y, taskId = null) {
    if (!s || s.taskOpen || paused()) return false;
    s.path = pathfind(x, y);
    s.queued = taskId;
    if (!s.path.length) {
      status(
        floorAt(x, y)
          ? "Already nearby. Press E or Interact to use the station."
          : "That is a wall or cabinet. Tap the floor inside a room or corridor.",
      );
      if (taskId) interact(taskId);
      return false;
    }
    status("Walking through the connected corridors.");
    return true;
  }
  function interact(id) {
    if (!s || s.taskOpen || paused()) return false;
    const near = id ? { t: s.tasks.find((t) => t.id === id) } : nearestTask();
    if (!near?.t || near.t.done) {
      status("No unfinished task here. Select a task in the mission log.");
      return false;
    }
    if (Math.hypot(near.t.x - s.player.x, near.t.y - s.player.y) > 28) {
      status("Move closer to the station or crewmate before interacting.");
      return false;
    }
    s.path = [];
    s.queued = null;
    s.tracked = near.t.id;
    clearHeld();
    openTask(near.t);
    return true;
  }
  function openTask(task) {
    s.taskOpen = true;
    s.activeTask = task;
    s.support = null;
    s.solver?.destroy?.();
    s.solver = null;
    s.taskAttempts = 0;
    ui.task.innerHTML = `<span class="ci-kicker">${roomLabel(task.room)} / ${task.optional ? "SIDE MISSION" : roleName(s.role) + " TASK"}</span><h2 class="ci-title" id="ciTaskTitle">${task.name}</h2><p class="ci-task-text">${task.fact}</p><div id="ciTaskBody"></div><p class="ci-task-feedback" id="ciTaskFeedback" role="status"></p><div class="ci-task-footer"><button class="btn small" type="button" id="ciTaskBack">Back to walking</button><button class="btn small" type="button" id="ciSkipTask">Skip this task with cost</button></div>`;
    get("ciTaskBack").onclick = closeTask;
    get("ciSkipTask").onclick = () => askSkip("task");
    if (task.puzzle === "rest") {
      restPuzzle(get("ciTaskBody"));
      get("ciSkipTask").hidden = true;
    } else {
      get("ciTaskBody").innerHTML =
        `<div class="ci-decision"><span>DECISION / HOW WILL YOU WORK?</span><p>${s.kid ? "Choose a crewmate for an extra pair of eyes, or try the task yourself." : "Both choices let you perform the activity. Shared work uses a little more ship energy and saves personal stamina."}</p><div class="ci-support"><button type="button" class="btn" id="ciSolo">Work independently<small>−${s.kid ? 6 : 10} stamina\u2003\u2003−1 ship energy<br>Your tools and careful observations.</small></button><button type="button" class="btn green" id="ciHelp">Work with a crewmate<small>−3 stamina\u2003\u2003−3 ship energy<br>Independent check adds +2 hull integrity.</small></button></div></div>`;
      get("ciSolo").onclick = () => beginPuzzle("solo");
      get("ciHelp").onclick = () => beginPuzzle("help");
    }
    openDialog(ui.task);
    get(
      task.puzzle === "rest" ? "ciRestAlone" : s.kid ? "ciHelp" : "ciSolo",
    ).focus();
  }
  function closeTask() {
    if (!s) return;
    const completed = !!s.activeTask?.done;
    closeDialog(ui.task);
    s.solver?.destroy?.();
    s.taskOpen = false;
    s.activeTask = null;
    s.solver = null;
    clearHeld();
    ui.canvas.focus();
    if (completed) afterTask();
  }
  function beginPuzzle(support) {
    if (!s?.activeTask) return;
    s.support = support;
    const task = s.activeTask,
      host = get("ciTaskBody");
    host.innerHTML =
      '<p class="ci-evidence">' +
      (support === "help"
        ? "Crew support selected. A second pair of eyes is ready."
        : "Solo work selected. Take each check in order.") +
      '</p><div id="ciPuzzle"></div>';
    const puzzle = get("ciPuzzle");
    if (
      typeof CrewActivities !== "undefined" &&
      CrewActivities.supports(task.puzzle)
    ) {
      s.solver = CrewActivities.mount(puzzle, task.puzzle, {
        easy: s.kid,
        onComplete: (q) => completeTask(q),
        onFeedback: (message, mistake) => feedback(message, mistake),
      });
    } else if (
      ["power", "thermal", "signal", "attitude", "negotiation"].includes(
        task.puzzle,
      )
    ) {
      s.solver = ProblemSolvers.mount(puzzle, task.puzzle, (q) =>
        completeTask(q),
      );
    } else if (task.puzzle === "leak") leakPuzzle(puzzle);
    else if (task.puzzle === "samples") samplesPuzzle(puzzle);
    else if (task.puzzle === "dock") dockPuzzle(puzzle);
    else if (task.puzzle === "welfare") welfarePuzzle(puzzle);
    else crewPuzzle(puzzle);
    if (task.puzzle === "window") puzzle.focus();
    else puzzle.querySelector("button")?.focus();
  }
  function restPuzzle(host) {
    host.innerHTML =
      '<div class="ci-decision"><span>DECISION / HOW DO YOU STEADY YOURSELF?</span><p>There is room for a pause. Choose once; both options restore your stamina and use supplies.</p><div class="ci-support"><button class="btn" type="button" id="ciRestAlone">Take a quiet moment alone<small>+8 stamina\u2003\u2003−2 ship energy<br>Dim the cabin lights and enjoy some privacy.</small></button><button class="btn green" type="button" id="ciRestMeal">Share a meal with the crew<small>+12 stamina\u2003\u2003−5 ship energy<br>Warm the food and make time for conversation.</small></button></div></div>';
    for (const [id, choice] of [
      ["ciRestAlone", "quiet"],
      ["ciRestMeal", "meal"],
    ])
      get(id).onclick = () => {
        s.support = choice;
        completeTask(1);
      };
  }
  function feedback(message, bad = false) {
    get("ciTaskFeedback").textContent = message;
    if (bad) {
      s.taskAttempts++;
      sfxSafe("miss");
    }
  }
  function sfxSafe(name) {
    if (typeof sfx === "function") sfx(name);
  }
  function leakPuzzle(host) {
    const state = {
      kind: "leak",
      inspected: new Set(),
      fault: 2,
      isolated: false,
      patched: false,
    };
    s.solver = { state };
    host.innerHTML =
      '<p class="ci-task-text">Find the leaking section before patching it. Inspect each sensor, isolate the affected valve, apply the seal, then verify pressure.</p><div class="ci-puzzle-grid">' +
      ["A", "B", "C"]
        .map(
          (n, i) =>
            `<button class="ci-puzzle-card" type="button" data-leak-probe="${i}">SECTION ${n}<strong>${i === 2 ? "94 → 91" : "101 → 101"} kPa</strong>Inspect fitting</button>`,
        )
        .join("") +
      '</div><p class="ci-evidence" id="ciLeakEvidence">No inspection yet.</p><div class="ci-task-actions"><button type="button" class="btn small" id="ciIsolateLeak">Isolate section C</button><button type="button" class="btn small" id="ciPatchLeak">Apply seal patch</button><button type="button" class="btn green" id="ciVerifyLeak">Verify pressure</button></div>';
    host.querySelectorAll("[data-leak-probe]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.leakProbe;
          state.inspected.add(i);
          b.classList.add("checked");
          get("ciLeakEvidence").textContent =
            i === state.fault
              ? "Section C: a loose seal is leaking. Isolate this section before placing a patch."
              : "This fitting is secure and its pressure is stable.";
        }),
    );
    get("ciIsolateLeak").onclick = () => {
      if (!state.inspected.has(2)) {
        feedback(
          "Inspect the falling-pressure section before isolating it.",
          true,
        );
        return;
      }
      state.isolated = true;
      get("ciIsolateLeak").disabled = true;
      feedback("Leaking section isolated. Now apply the seal.");
    };
    get("ciPatchLeak").onclick = () => {
      if (!state.isolated) {
        feedback("Isolate the leak first so the patch can hold.", true);
        return;
      }
      state.patched = true;
      get("ciPatchLeak").disabled = true;
      feedback("Patch fitted. Verify that pressure remains stable.");
    };
    get("ciVerifyLeak").onclick = () => {
      if (!state.patched) {
        feedback(
          "A verified repair needs isolation and a fitted seal first.",
          true,
        );
        return;
      }
      completeTask(Math.max(0.6, 1 - s.taskAttempts * 0.1));
    };
  }
  function samplesPuzzle(host) {
    const state = {
      kind: "samples",
      selected: null,
      stored: {},
      items: [
        {
          id: "ice",
          label: "Ice-core specimen",
          store: "freezer",
          note: "Keep frozen at −20 °C.",
        },
        {
          id: "optics",
          label: "Dry optical reference",
          store: "cabinet",
          note: "Keep dry at room temperature.",
        },
        {
          id: "culture",
          label: "Sterile sealed culture",
          store: "sealed",
          note: "Keep in its labeled sterile container.",
        },
      ],
    };
    s.solver = { state };
    const draw = () => {
      host.innerHTML =
        '<p class="ci-task-text">Read each specimen label, select it, then select the matching storage location. Preserve the stated conditions.</p><div class="ci-puzzle-grid">' +
        state.items
          .map(
            (i) =>
              `<button class="ci-puzzle-card ${state.selected === i.id ? "selected" : ""} ${state.stored[i.id] ? "checked" : ""}" type="button" data-sample="${i.id}" ${state.stored[i.id] ? "disabled" : ""}>${i.label}<strong>${state.stored[i.id] ? "STORED ✓" : ""}</strong>${i.note}</button>`,
          )
          .join("") +
        '</div><div class="ci-task-actions">' +
        [
          ["freezer", "Cold freezer"],
          ["cabinet", "Dry cabinet"],
          ["sealed", "Sterile container"],
        ]
          .map(
            ([id, l]) =>
              `<button class="btn small" type="button" data-store="${id}">${l}</button>`,
          )
          .join("") +
        "</div>";
      host.querySelectorAll("[data-sample]").forEach(
        (b) =>
          (b.onclick = () => {
            state.selected = b.dataset.sample;
            draw();
          }),
      );
      host.querySelectorAll("[data-store]").forEach(
        (b) =>
          (b.onclick = () => {
            const item = state.items.find((i) => i.id === state.selected);
            if (!item) {
              feedback("Select a specimen first.");
              return;
            }
            if (item.store !== b.dataset.store) {
              feedback(
                "That storage condition does not match the specimen label.",
                true,
              );
              return;
            }
            state.stored[item.id] = b.dataset.store;
            state.selected = null;
            if (Object.keys(state.stored).length === 3) {
              completeTask(Math.max(0.6, 1 - s.taskAttempts * 0.1));
              return;
            }
            feedback("Correct storage recorded. Choose the next specimen.");
            draw();
          }),
      );
    };
    draw();
  }
  function dockPuzzle(host) {
    const state = { kind: "dock", step: 0 };
    s.solver = { state };
    const order = [
      "Confirm zero relative motion",
      "Verify docking latch",
      "Check pressure equalization",
      "Open inner hatch",
    ];
    host.innerHTML =
      '<p class="ci-task-text">The vehicles are in contact. Choose each safety interlock in order. Motion must stop before latching, and pressure must match before opening a hatch.</p><div class="ci-puzzle-grid">' +
      [2, 0, 3, 1]
        .map(
          (i) =>
            `<button type="button" class="ci-puzzle-card" data-dock="${i}">${order[i]}</button>`,
        )
        .join("") +
      '</div><p class="ci-evidence" id="ciDockState">Relative motion: not yet confirmed\u2003\u2003hatch closed.</p>';
    host.querySelectorAll("[data-dock]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.dock;
          if (i !== state.step) {
            feedback(
              "This interlock is not ready. Next: " + order[state.step] + ".",
              true,
            );
            return;
          }
          state.step++;
          b.disabled = true;
          b.classList.add("checked");
          get("ciDockState").textContent =
            "Verified " +
            state.step +
            " / 4 checks. " +
            (state.step < 4
              ? "Next: " + order[state.step]
              : "Hatch safe to open.");
          if (state.step === 4)
            completeTask(Math.max(0.6, 1 - s.taskAttempts * 0.1));
        }),
    );
  }
  function welfarePuzzle(host) {
    const state = { kind: "welfare", at: 0 };
    s.solver = { state };
    const cases = [
      {
        name: "Pip",
        need: "I have been on watch for hours and keep losing my place in the checklist.",
        right: 0,
        answers: [
          "Arrange a rest handover",
          "Ask for a longer solo shift",
          "Skip the safety checklist",
        ],
      },
      {
        name: "Ari",
        need: "The specimen work is behind and I am trying to hold the sample and tools at the same time.",
        right: 2,
        answers: [
          "Rush every step",
          "Leave the experiment unattended",
          "Pair a helper with Ari",
        ],
      },
      {
        name: "Sol",
        need: "Ground control sent an unclear instruction. I am not sure which configuration they mean.",
        right: 1,
        answers: [
          "Guess the command",
          "Read it back and request clarification",
          "Hide the uncertainty",
        ],
      },
    ];
    const draw = () => {
      const c = cases[state.at];
      host.innerHTML = `<p class="ci-evidence">${c.name}: “${c.need}”</p><div class="ci-task-actions">${c.answers.map((a, i) => `<button class="btn small" type="button" data-welfare="${i}">${a}</button>`).join("")}</div>`;
      host.querySelectorAll("[data-welfare]").forEach(
        (b) =>
          (b.onclick = () => {
            if (+b.dataset.welfare !== c.right) {
              feedback(
                "Choose support that addresses the concern while preserving safe work.",
                true,
              );
              return;
            }
            state.at++;
            if (state.at === cases.length) {
              completeTask(Math.max(0.6, 1 - s.taskAttempts * 0.1));
              return;
            }
            feedback("Support agreed. Check the next crew concern.");
            draw();
          }),
      );
    };
    draw();
  }
  function crewPuzzle(host) {
    const state = { kind: "crewcheck", step: 0 };
    s.solver = { state };
    host.innerHTML =
      '<p class="ci-task-text">Your crewmate says, “I am tired and worried about a task I have not checked yet.” Start with a useful check-in, then agree on the next action.</p><div class="ci-task-actions" id="ciCrewChoices"><button class="btn green" type="button" id="ciListen">Ask what support they need</button><button class="btn" type="button" id="ciDismiss">Tell them to ignore it</button></div>';
    get("ciDismiss").onclick = () =>
      feedback(
        "Dismissing fatigue can hide an important warning. Listen and clarify.",
        true,
      );
    get("ciListen").onclick = () => {
      state.step = 1;
      get("ciCrewChoices").innerHTML =
        '<button class="btn green" type="button" id="ciHandover">Agree a rest handover and a shared checklist</button><button class="btn" type="button" id="ciRush">Add another solo task</button>';
      get("ciRush").onclick = () =>
        feedback(
          "More solo work adds fatigue. Share the check and agree on rest.",
          true,
        );
      get("ciHandover").onclick = () => {
        state.step = 2;
        completeTask(Math.max(0.7, 1 - s.taskAttempts * 0.1));
      };
    };
  }
  function completeTask(quality) {
    if (!s?.activeTask || s.activeTask.done) return;
    const task = s.activeTask,
      help = s.support === "help";
    let note;
    if (task.puzzle === "rest") {
      const shared = s.support === "meal",
        recovery = shared ? 12 : 8,
        cost = shared ? 5 : 2;
      s.stamina = clamp(s.stamina + recovery);
      flight.energy = clamp(flight.energy - cost);
      note = `${shared ? "Shared a meal with the crew" : "Took a quiet personal break"}; +${recovery} stamina (maximum 100), −${cost} ship energy.`;
    } else {
      const loss = help ? 3 : s.kid ? 6 : 10;
      s.stamina = clamp(s.stamina - loss);
      if (help) {
        s.helpCount++;
        flight.energy = clamp(flight.energy - 3);
        flight.hull = clamp(flight.hull + 2);
      } else {
        s.soloCount++;
        flight.energy = clamp(flight.energy - 1);
      }
      for (const [k, v] of Object.entries(task.reward || {}))
        flight[k] = clamp(flight[k] + Math.max(1, Math.round(v * quality)));
      note = `${help ? "Worked with crew support" : "Completed independently"}; −${loss} stamina, −${help ? 3 : 1} ship energy${help ? ", +2 hull from independent verification" : ""}.`;
    }
    campaign.crewStamina = s.stamina;
    task.done = true;
    save(task.name, note, true);
    flight.lessons.push(task.fact);
    get("ciTaskBody").innerHTML =
      `<div class="ci-completed"><p>✓ ${task.name} complete.</p><p>${note}</p><p>${task.fact}</p><button type="button" class="btn green" id="ciReturnToDeck">Return to the deck →</button></div>`;
    get("ciTaskFeedback").textContent =
      "Verified and recorded in the mission log. " +
      journalSummary(s).xp +
      " crew XP earned.";
    get("ciSkipTask").hidden = true;
    get("ciReturnToDeck").onclick = () => closeTask();
    get("ciReturnToDeck").focus();
    updateHud();
    renderLog();
    sfxSafe("lock");
  }
  function afterTask() {
    if (!s) return;
    if (dead()) {
      finish();
      return;
    }
    const required = s.tasks.filter((t) => !t.optional);
    if (required.every((t) => t.done)) {
      get("ciFinish").hidden = false;
      status(
        "Main watch complete. Continue the mission now, or choose an optional side mission from the log.",
      );
    } else {
      const next = required.find((t) => !t.done);
      s.tracked = next.id;
      status(
        "Next main goal: " +
          next.name +
          " in " +
          roomLabel(next.room) +
          ". Side missions are optional.",
      );
    }
    renderLog();
    updateHud();
  }
  function money(value) {
    return typeof cash === "function"
      ? cash(value)
      : String(Math.round(value)) + " budget units";
  }
  function quote(kind) {
    if (
      typeof GameRules !== "undefined" &&
      typeof GameRules.quoteSkip === "function"
    )
      return GameRules.quoteSkip(kind);
    return {
      cost: 0,
      penalty: { energy: -5 },
      label: "Mission reserves will cover outside assistance.",
    };
  }
  function penaltyText(p) {
    if (!p || typeof p !== "object") return String(p || "resource risk");
    return (
      Object.entries(p)
        .map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${v}`)
        .join("\u2003\u2003") || "no additional resource loss"
    );
  }
  function askSkip(kind) {
    if (!s || paused()) return;
    const target = kind === "task" ? s.activeTask : null;
    if (kind === "task" && !target) return;
    clearHeld();
    s.taskOpen = true;
    const kindLabel = kind === "task" ? "crew task" : "crew stage",
      q = quote(kindLabel);
    ui.task.innerHTML = `<span class="ci-kicker">OUTSIDE ASSISTANCE / OPTIONAL SKIP</span><h2 class="ci-title" id="ciTaskTitle">${kind === "task" ? "Delegate this task?" : "Leave the crew stage?"}</h2><p class="ci-task-text">${kind === "task" ? "Mission support will take over this unfinished task." : "You can continue the mission without finishing the interior work."} Skipping always allows progression, but assistance uses budget and reserves.</p><p class="ci-skip-price">Cost: ${money(q.cost)}\u2003\u2003Risk: ${penaltyText(q.penalty)}</p><p class="ci-task-text">${q.label || ""}</p><div class="ci-task-actions"><button type="button" class="btn green" id="ciCancelSkip">Keep working</button><button type="button" class="btn red" id="ciConfirmSkip">Confirm paid skip</button></div>`;
    openDialog(ui.task);
    get("ciCancelSkip").onclick = () => {
      if (target) openTask(target);
      else closeTask();
    };
    if (q.affordable === false) {
      get("ciConfirmSkip").remove();
      ui.task.querySelector(".ci-skip-price").textContent =
        `Not enough mission funds: assistance costs ${money(q.cost)}, but only ${money(q.funds)} of the grant is left. Finish this work yourself.`;
      get("ciCancelSkip").focus();
      return;
    }
    let used = false;
    get("ciConfirmSkip").onclick = () => {
      if (used || !s) return;
      used = true;
      const result =
        typeof GameRules !== "undefined" && typeof GameRules.skip === "function"
          ? GameRules.skip(kindLabel)
          : q;
      if (typeof GameRules === "undefined")
        flight.energy = clamp(flight.energy - 5);
      if (kind === "stage") {
        s.skipped += s.tasks.filter((t) => !t.done && !t.optional).length;
        save(
          "Crew stage delegated",
          `${money(result.cost)} assistance; ${penaltyText(result.penalty)}.`,
          false,
        );
        finish(true, true);
      } else {
        target.done = true;
        target.skipped = true;
        s.skipped++;
        save(
          target.name,
          `Delegated with ${money(result.cost)} assistance; ${penaltyText(result.penalty)}.`,
          false,
        );
        closeTask();
        renderLog();
        updateHud();
        afterTask();
      }
    };
    get("ciCancelSkip").focus();
  }
  function keydown(e) {
    if (
      !s ||
      paused() ||
      s.taskOpen ||
      /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)
    )
      return;
    if (
      (e.key.toLowerCase() === "m" ||
        (e.key === "Tab" && e.target === ui.canvas)) &&
      !e.repeat
    ) {
      e.preventDefault();
      openJournal();
      return;
    }
    if (e.code === "Space" && e.target.closest?.("button")) return;
    const k = e.key.toLowerCase(),
      direction = {
        w: "up",
        arrowup: "up",
        s: "down",
        arrowdown: "down",
        a: "left",
        arrowleft: "left",
        d: "right",
        arrowright: "right",
      }[k];
    if (direction) {
      e.preventDefault();
      s.path = [];
      s.queued = null;
      held[direction] = true;
    }
    if ((k === "e" || e.code === "Space") && !e.repeat) {
      e.preventDefault();
      interact();
    }
  }
  function keyup(e) {
    const direction = {
      w: "up",
      arrowup: "up",
      s: "down",
      arrowdown: "down",
      a: "left",
      arrowleft: "left",
      d: "right",
      arrowright: "right",
    }[e.key.toLowerCase()];
    if (direction) held[direction] = false;
  }
  function update(dt) {
    if (!s || s.taskOpen || paused()) return;
    const dx = (held.right ? 1 : 0) - (held.left ? 1 : 0),
      dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    if (dx || dy) {
      const n = Math.hypot(dx, dy);
      move((dx / n) * SPD * dt, (dy / n) * SPD * dt);
    } else if (s.path.length) {
      const target = s.path[0],
        ax = target.x - s.player.x,
        ay = target.y - s.player.y,
        distance = Math.hypot(ax, ay),
        step = SPD * dt;
      if (distance <= step + 1) {
        move(ax, ay);
        s.path.shift();
      } else move((ax / distance) * step, (ay / distance) * step);
      if (s.queued) {
        const task = s.tasks.find((t) => t.id === s.queued);
        if (task && Math.hypot(task.x - s.player.x, task.y - s.player.y) < 21) {
          interact(task.id);
          return;
        }
      }
    }
    const near = nearestTask();
    get("ciInteract").disabled = !near || near.d > 28;
    get("ciInteract").textContent =
      near && near.d <= 28
        ? "E / " + (near.t.id === "crewcheck" ? "TALK TO CREW" : "USE STATION")
        : "E / INTERACT";
  }
  function astronaut(c, x, y, suit, skin, hair, player = false) {
    const px = Math.round(x),
      py = Math.round(y);
    c.fillStyle = "#0006";
    c.fillRect(px - 5, py + 7, 10, 3);
    c.fillStyle = hair;
    c.fillRect(px - 4, py - 9, 8, 5);
    c.fillStyle = skin;
    c.fillRect(px - 3, py - 6, 6, 5);
    c.fillStyle = "#1b283a";
    c.fillRect(px - 2, py - 4, 4, 2);
    c.fillStyle = suit;
    c.fillRect(px - 4, py, 8, 7);
    c.fillRect(px - 6, py + 1, 2, 5);
    c.fillRect(px + 4, py + 1, 2, 5);
    c.fillStyle = "#e8e5df";
    c.fillRect(px - 2, py + 1, 4, 2);
    c.fillStyle = "#8f9cb3";
    const walk = player ? (Math.sin(s.walkPhase * 0.45) > 0 ? 1 : -1) : 0;
    c.fillRect(px - 4, py + 7, 3, 3 + walk);
    c.fillRect(px + 1, py + 7, 3, 3 - walk);
    if (player) {
      c.strokeStyle = "#ffcd65";
      c.lineWidth = 1;
      c.strokeRect(px - 8, py - 12, 16, 24);
    }
  }
  function drawRoomDetails(c) {
    // Low-contrast light pools keep task markers and walking routes legible.
    for (const r of rooms) {
      const x = r.x * TILE + 52,
        y = r.y * TILE + 2;
      c.fillStyle = "#c9e7ff07";
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - 27, y + 55);
      c.lineTo(x + 27, y + 55);
      c.closePath();
      c.fill();
      c.fillStyle = "#c8ced8";
      c.fillRect(x - 4, y, 8, 2);
    }
    // Garden beds with leaves, mess table, observation window, and service-bay pipes.
    c.fillStyle = "#634f43";
    c.fillRect(29, 186, 43, 8);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = i % 2 ? "#78b961" : "#47945e";
      c.fillRect(32 + i * 5, 181 - (i % 3), 3, 7);
    }
    c.fillStyle = "#424e71";
    c.fillRect(84, 187, 23, 8);
    c.fillStyle = "#eab883";
    c.fillRect(89, 188, 4, 3);
    c.fillRect(100, 188, 4, 3);
    c.fillStyle = "#213d65";
    c.fillRect(78, 28, 25, 8);
    c.fillStyle = "#74bfd4";
    c.fillRect(80, 29, 21, 5);
    c.fillStyle = "#d8d3bc";
    c.fillRect(96, 30, 3, 2);
    c.fillStyle = "#596c8e";
    c.fillRect(210, 154, 10, 32);
    c.fillStyle = "#77a3b8";
    for (let i = 0; i < 3; i++) c.fillRect(212, 157 + i * 9, 6, 4);
    c.fillStyle = "#2d4858";
    c.fillRect(277, 31, 6, 18);
    c.fillStyle = "#77ffb1";
    c.fillRect(278, 33, 4, 3);
    c.fillStyle = "#9a84ff";
    c.fillRect(278, 39, 4, 3);
  }
  function draw() {
    if (!s) return;
    const c = ui.ctx;
    c.setTransform(2, 0, 0, 2, 0, 0);
    c.clearRect(0, 0, W, H);
    c.fillStyle = "#050811";
    c.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) {
      c.fillStyle = i % 7 ? "#35425e" : "#7383a0";
      c.fillRect((i * 79 + 17) % W, (i * 47 + 11) % H, 1, 1);
    }
    for (let y = 0; y < ROWS; y++)
      for (let x = 0; x < COLS; x++) {
        if (!walkable[y][x]) continue;
        c.fillStyle = (x + y) % 2 ? "#182339" : "#1b2840";
        c.fillRect(x * TILE, y * TILE, TILE, TILE);
        for (const [dx, dy] of [
          [0, -1],
          [1, 0],
          [0, 1],
          [-1, 0],
        ])
          if (!walkable[y + dy]?.[x + dx]) {
            c.fillStyle = "#657697";
            if (dx) c.fillRect(x * TILE + (dx > 0 ? 7 : 0), y * TILE, 1, 8);
            else c.fillRect(x * TILE, y * TILE + (dy > 0 ? 7 : 0), 8, 1);
          }
      }
    for (const r of rooms) {
      c.fillStyle = "#a6b8d5";
      c.font = "5px monospace";
      c.fillText(r.label, r.x * TILE + 8, r.y * TILE - 5);
      c.fillStyle = "#284569";
      c.fillRect(r.x * TILE + 10, r.y * TILE + 3, 22, 5);
      c.fillStyle = "#61a4d5";
      c.fillRect(r.x * TILE + 12, r.y * TILE + 4, 18, 2);
    }
    for (const [x, y] of cabinets) {
      c.fillStyle = "#526987";
      c.fillRect(x * TILE, y * TILE, 8, 8);
      c.fillStyle = "#91a7be";
      c.fillRect(x * TILE + 1, y * TILE + 1, 6, 1);
    }
    drawRoomDetails(c);
    for (const t of s.tasks) {
      if (t.id === "crewcheck") continue;
      const x = Math.round(t.x),
        y = Math.round(t.y);
      c.fillStyle = t.done ? "#1b5140" : "#374d72";
      c.fillRect(x - 8, y - 4, 16, 10);
      c.fillStyle = t.done ? "#77ffb1" : "#5ceaff";
      c.fillRect(x - 6, y - 2, 12, 4);
      c.fillStyle = "#a2b1c5";
      c.fillRect(x - 5, y + 7, 10, 2);
      if (!t.done) {
        c.strokeStyle = s.tracked === t.id ? "#ffcd65" : "#5ceaff";
        c.strokeRect(x - 11, y - 7, 22, 20);
        c.fillStyle = "#ffcd65";
        c.font = "7px monospace";
        c.fillText(t.optional ? "+" : "!", x - 2, y - 11);
      }
    }
    for (const npc of s.npcs) {
      astronaut(c, npc.x, npc.y, npc.color, "#d8aa80", "#382a32");
      c.fillStyle = "#c4d5e7";
      c.font = "5px monospace";
      c.fillText(npc.name, npc.x - 8, npc.y + 18);
      const check = s.tasks.find((t) => t.id === "crewcheck");
      if (
        check &&
        !check.done &&
        Math.hypot(check.x - npc.x, check.y - npc.y) < 2
      ) {
        c.fillStyle = "#ffcd65";
        c.fillText("TALK", npc.x - 10, npc.y - 14);
      }
    }
    if (s.path.length) {
      c.fillStyle = "#ffcd6555";
      for (const p of s.path) c.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
    astronaut(
      c,
      s.player.x,
      s.player.y,
      color("suit", "#fe738a"),
      color("skin", "#dfa477"),
      color("hair", "#261e33"),
      true,
    );
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  function loop(now) {
    if (!s) return;
    const dt =
      s.last && !document.hidden && !paused()
        ? Math.min(0.05, (now - s.last) / 1000)
        : 0;
    s.last = now;
    update(dt);
    if (!s) return;
    draw();
    raf = requestAnimationFrame(loop);
  }
  return {
    start,
    get state() {
      return s;
    },
    get active() {
      return !!s;
    },
    walkTo,
    interact,
    canStand,
    pathfind: (x, y) => (s ? pathfind(x, y) : []),
    stop: () => finish(),
    get rooms() {
      return rooms.map((r) => ({ ...r }));
    },
  };
})();

// Carry earned crew rewards into the existing report, without changing its layout.
const crewJournalReportBase = renderExpandedReport;
renderExpandedReport = function (end) {
  crewJournalReportBase(end);
  const journal = campaign.crewJournal,
    host = document.getElementById("familyMissionSummary");
  if (!journal || !host) return;
  host.querySelector(".ci-report-journal")?.remove();
  const section = document.createElement("div");
  section.className = "ci-report-journal";
  const score = document.createElement("p");
  score.textContent =
    journal.xp +
    " crew XP\u2003\u2003" +
    journal.missions.filter((m) => m.verified).length +
    " missions verified";
  section.append(score);
  const badges = document.createElement("div");
  badges.className = "ci-report-badges";
  for (const badge of journal.badges) {
    const item = document.createElement("span");
    item.textContent = badge;
    badges.append(item);
  }
  if (!journal.badges.length) {
    const p = document.createElement("p");
    p.textContent =
      "Crew badges are earned by verifying every objective in a mission. Skipped work earns no crew XP.";
    section.append(p);
  }
  section.append(badges);
  host.append(section);
};
