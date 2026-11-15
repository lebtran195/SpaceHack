"use strict";
// All questions expose units, telemetry, a formula, and an engineering explanation.
const EngineeringProblems = {
  create(kind) {
    const r = (a, b) => rand(a, b),
      choose = (values) => values[r(0, values.length - 1)];
    let p;
    if (kind === "maxq") {
      const density = choose([0.08, 0.1, 0.12, 0.16]),
        limit = choose([20, 24, 28, 32]);
      p = {
        title: "Set a safe ascent speed",
        story:
          "Flight control has updated atmospheric density. Calculate the maximum speed that keeps dynamic pressure at the structural limit.",
        givens: [
          ["Air density", density + " kg/m³"],
          ["Dynamic-pressure limit", limit + " kPa"],
        ],
        formula: "q = ½ρv²  →  v = √(2 × q × 1000 / ρ)",
        answer: Math.sqrt((2 * limit * 1000) / density),
        unit: "m/s",
        tolerance: 5,
        explanation:
          "Convert kPa to Pa before solving for speed. Above this speed, the aerodynamic load exceeds the chosen pressure limit.",
        note: "Density is treated as constant over this short guidance interval.",
      };
    } else if (kind === "temperature") {
      const initial = choose([20, 25, 30]),
        input = choose([240, 300, 360]),
        output = input - choose([60, 90, 120]),
        duration = choose([90, 120, 150]),
        capacity = 900;
      p = {
        title: "Predict the avionics temperature",
        story:
          "Altitude and atmospheric-heating checks are clear. Use the next cooling interval to predict electronics temperature before fairing release.",
        givens: [
          ["Initial temperature", initial + " °C"],
          ["Heat input", input + " W"],
          ["Heat removed", output + " W"],
          ["Interval", duration + " s"],
          ["Heat capacity", capacity + " J/K"],
          ["Electronics limit", "60 °C"],
        ],
        formula: "Tfinal = Tinitial + (Pin − Pout) × time / heat capacity",
        answer: initial + ((input - output) * duration) / capacity,
        unit: "°C",
        tolerance: 0.5,
        explanation:
          "Net watts are joules per second. Multiply by elapsed seconds, then divide by heat capacity to find the temperature rise.",
        note: "A lumped heat-capacity estimate; radiation, gradients and changing heat loads are simplified.",
      };
    } else if (kind === "transfer") {
      if (selectedMission.key === "earth") {
        const period = design?.period || 95,
          angle = choose([30, 45, 60]);
        p = {
          title: "Plan a phasing wait",
          story:
            "Your target ground track is ahead. Estimate the time for this angular travel at the circular-orbit mean rate.",
          givens: [
            ["Orbit period", period + " min"],
            ["Angular travel needed", angle + "°"],
          ],
          formula: "wait time = angular travel × orbit period / 360",
          answer: (angle * period) / 360,
          unit: "min",
          tolerance: 0.4,
          explanation:
            "One complete orbit covers 360°. This is an angular-travel exercise, not a complete rendezvous calculation.",
        };
      } else {
        let days, period;
        if (selectedMission.key === "moon") {
          days =
            (Math.PI * Math.sqrt(((6671 + 384400) / 2) ** 3 / 398600)) / 86400;
          period = 27.32;
        } else {
          const au =
            {
              mercury: 0.387,
              venus: 0.723,
              mars: 1.524,
              europa: 5.204,
              titan: 9.58,
              neptune: 30.1,
            }[selectedMission.key] || 1.524;
          days = (365.25 / 2) * Math.sqrt(((1 + au) / 2) ** 3);
          period = 365.25 * Math.sqrt(au ** 3);
        }
        days = +days.toFixed(1);
        period = +period.toFixed(1);
        const raw = 180 - (360 * days) / period,
          lead = ((raw % 360) + 360) % 360;
        p = {
          title: "Calculate the transfer lead angle",
          story:
            "The destination keeps moving during your trip. Work out where it should be relative to departure using this ideal transfer estimate.",
          givens: [
            ["Transfer time", days + " days"],
            ["Target orbital period", period + " days"],
          ],
          formula:
            "lead = 180° − 360° × trip / target period; wrap the result into 0–360°",
          answer: lead,
          unit: "degrees",
          tolerance: 2,
          explanation:
            "The destination must travel from its departure position to the arrival point during the transfer. Wrapping an angle means adding or subtracting 360° as needed.",
          note: "Circular, coplanar single-leg transfer. Real launch opportunities also depend on inclination, ephemerides and gravity assists.",
        };
      }
    } else if (kind === "capture") {
      const [radius, mu] = planetPhysics[selectedMission.key],
        orbitRadius = radius + 500,
        circular = Math.sqrt(mu / orbitRadius),
        arrival = +(circular + choose([0.7, 1, 1.3])).toFixed(3);
      p = {
        title: "Size the arrival braking burn",
        story:
          "At the target radius, estimate the retrograde velocity change needed to reach local circular speed.",
        givens: [
          ["Gravitational parameter μ", mu + " km³/s²"],
          ["Radius from body center", orbitRadius + " km"],
          ["Arrival speed", arrival + " km/s"],
        ],
        formula:
          "vcircular = √(μ / radius); braking Δv = (varrival − vcircular) × 1000",
        answer: (arrival - circular) * 1000,
        unit: "m/s",
        tolerance: 12,
        explanation:
          "First calculate circular speed in km/s, subtract it from arrival speed, then convert the speed difference to m/s.",
        note: "An instantaneous tangential burn estimate, not a full arrival trajectory.",
      };
    } else if (kind === "downlink") {
      const data = choose([720, 960, 1200, 1440]),
        rate = choose([4, 6, 8]),
        efficiency = 0.8;
      p = {
        title: "Budget the ground-station pass",
        story:
          "Some contact time is lost to error correction. Calculate how long it takes to transmit this buffered science data.",
        givens: [
          ["Buffered data", data + " Mbit"],
          ["Raw link rate", rate + " Mbit/s"],
          ["Useful-link efficiency", "80%"],
        ],
        formula: "contact time = data / (raw rate × 0.8)",
        answer: data / (rate * efficiency),
        unit: "s",
        tolerance: 1,
        explanation:
          "Mbit divided by Mbit/s gives seconds. Only 80% of the raw link is available for useful data.",
      };
    } else if (kind === "burn") {
      const dv = choose([24, 36, 48, 60]),
        acceleration = choose([0.2, 0.3, 0.4, 0.6]);
      p = {
        title: "Program the correction burn",
        story:
          "Guidance has calculated the required velocity change. Determine how long to fire at the stated acceleration.",
        givens: [
          ["Required Δv", dv + " m/s"],
          ["Effective acceleration", acceleration + " m/s²"],
        ],
        formula: "burn duration = Δv / acceleration",
        answer: dv / acceleration,
        unit: "s",
        tolerance: 1,
        explanation:
          "Acceleration changes velocity each second. Divide the required speed change by acceleration to get burn time.",
        note: "Assumes constant acceleration; changing spacecraft mass and thrust are neglected.",
      };
    } else if (kind === "sensor") {
      const bias = choose([3, 4, 5, 6]),
        raw = choose([68, 72, 79, 84]);
      p = {
        title: "Calibrate the temperature sensor",
        story:
          "The sensor reads too warm when checked against a known reference. Correct the new reading before signing off the test.",
        givens: [
          ["Reference temperature", "0 °C"],
          ["Sensor at reference", bias + " °C"],
          ["New sensor reading", raw + " °C"],
        ],
        formula:
          "bias = sensor − reference; corrected reading = new reading − bias",
        answer: raw - bias,
        unit: "°C",
        tolerance: 0.25,
        explanation:
          "A constant positive bias must be subtracted from every reading. Calibration fixes the measurement, not the actual temperature.",
      };
    } else {
      const grant = Math.round(MAX_BUDGET || 500),
        spent = Math.round(grant * 0.82);
      p = {
        title: "Audit the remaining cost reserve",
        story:
          "Prepare a quantified appeal using the uncommitted reserve. All figures below are in millions of USD.",
        givens: [
          ["Current grant", grant + " million USD"],
          ["Audited commitments", spent + " million USD"],
        ],
        formula: "uncommitted reserve = current grant − audited commitments",
        answer: grant - spent,
        unit: "million USD",
        tolerance: 0.5,
        explanation:
          "Committed work cannot be treated as spare funding. A costed reserve statement makes the trade-off explicit.",
      };
    }
    p.kind = kind;
    return p;
  },
  view(p, prefix = "") {
    return `<div class="engineering-problem"><div class="telemetry-givens">${p.givens.map(([name, value]) => `<div><span>${name}</span><b>${value}</b></div>`).join("")}</div><div class="formula-card"><small>ENGINEER’S WORKPAD</small><p>${p.formula}</p></div><form class="engineering-answer" id="${prefix}engineeringForm"><label for="${prefix}engineeringAnswer">Your result <span>(${p.unit})</span></label><div><input type="number" inputmode="decimal" step="any" id="${prefix}engineeringAnswer" placeholder="Enter a number" autocomplete="off"><span>${p.unit}</span></div><p class="answer-tolerance">Round as needed\u2003\u2003accepted tolerance ±${+(p.tolerance * (typeof pilotWindow === "function" ? pilotWindow() : 1)).toFixed(2)} ${p.unit}</p></form><details class="calculator-pad"><summary>Open calculator ↗</summary><form id="${prefix}calculatorForm"><label class="sr-only" for="${prefix}calculatorExpression">Calculator expression</label><input type="text" id="${prefix}calculatorExpression" placeholder="Use + − * /, sqrt( ), ln( )" autocomplete="off" spellcheck="false"><button type="submit">Calculate</button></form><div><output id="${prefix}calculatorResult" aria-live="polite">Your workpad is ready.</output><button type="button" id="${prefix}calculatorUse" hidden>Use result ↑</button></div><small>Example: sqrt(2*28000/0.12). Enter numbers without units.</small></details><p id="${prefix}engineeringFeedback" class="calculation-feedback" role="status"></p>${p.note ? `<p class="engineering-note">${p.note}</p>` : ""}</div>`;
  },
  validAnswer(p, value) {
    return (
      Number.isFinite(value) &&
      Math.abs(value - p.answer) <=
        p.tolerance * (typeof pilotWindow === "function" ? pilotWindow() : 1)
    );
  },
  answerText(p) {
    return (
      Number(p.answer.toFixed(p.unit === "degrees" ? 1 : 2)).toLocaleString(
        "en-US",
      ) +
      " " +
      p.unit
    );
  },
};
function startInteractiveLaunch(done) {
  return EngineeringLaunch.start(done);
}
const EngineeringLaunch = (() => {
  let session = null,
    ui = null,
    frame = 0,
    focusBefore = null;
  const stages = [
    {
      id: "ignition",
      title: "Ignition",
      instruction:
        "One timing call: press IGNITE when the countdown reaches zero.",
      action: "Ignite engine",
      lesson: "Ignition synchronizes the vehicle with its departure window.",
    },
    {
      id: "maxq",
      title: "Power-bus recovery",
      instruction:
        "Restore a stable power bus without disconnecting essential systems.",
      action: "Test bus",
      lesson:
        "Load shedding preserves essential guidance, cooling and communication during a power fault.",
    },
    {
      id: "staging",
      title: "Booster separation checklist",
      instruction:
        "The lower-stage tank is empty. Perform the interlocks in order: isolate the feed, confirm engine cutoff, then separate the booster.",
      action: "Checklist active",
      lesson:
        "Verified interlocks prevent separating hardware while it is still producing thrust.",
    },
    {
      id: "temperature",
      title: "Find the faulty sensor",
      instruction:
        "Inspect the evidence and isolate a faulty probe without shutting down working cooling.",
      action: "Verify repair",
      lesson:
        "Compare independent readings and physical evidence before isolating a suspected sensor.",
    },
    {
      id: "insertion",
      title: "Shape the orbit",
      instruction:
        "Hold BURN to raise the opposite side of your orbit. Release when periapsis is above 150 km and eccentricity is near zero.",
      action: "Hold BURN",
      lesson:
        "A prograde burn near apoapsis raises periapsis. Orbit needs sideways speed.",
    },
    {
      id: "transfer",
      title: "Debris shield drill",
      instruction:
        "Read the radar forecast and move into a clear corridor for each debris wave.",
      action: "Protect the craft",
      lesson:
        "Tracking incoming debris lets the crew choose a clear corridor rather than reacting blindly.",
    },
    {
      id: "capture",
      title: "Arrival burn calculation",
      instruction:
        "Compute a braking maneuver that matches your speed to the target orbit.",
      action: "Execute calculated burn",
      lesson:
        "A tangential burn at closest approach changes orbital energy efficiently.",
    },
  ];
  const el = (id) => ui.dialog.querySelector("#" + id),
    dead = () => stateFailure();
  function create() {
    if (ui) return;
    const dialog = document.createElement("dialog");
    dialog.id = "engineeringLaunch";
    dialog.setAttribute("aria-labelledby", "elTitle");
    dialog.innerHTML =
      '<div class="launch-layout"><section class="launch-visual"><div class="launch-visual-top"><b>FLIGHT CONTROL</b><span id="elMission"></span></div><canvas id="elCanvas" width="650" height="440" aria-label="Launch and orbit telemetry animation"></canvas><p id="elTelemetry"></p><div id="elVitals"></div><p class="launch-model-note">Accelerated teaching simulation\u2003\u2003not to scale</p></section><section class="launch-console"><div class="launch-console-top"><span id="elStep"></span><button type="button" id="elAutopilot" class="text-button">Ask autopilot</button></div><h2 id="elTitle"></h2><p id="elInstruction"></p><div id="elTask"></div><p id="elFeedback" role="status"></p><div class="launch-buttons"><button class="btn primary" type="button" id="elAction"></button><button class="btn green" type="button" id="elNext" hidden>Next checkpoint →</button></div></section></div>';
    document.body.append(dialog);
    ui = { dialog, ctx: elFrom(dialog, "elCanvas").getContext("2d") };
    ui.ctx.imageSmoothingEnabled = false;
    dialog.addEventListener("cancel", (e) => {
      e.preventDefault();
      if (session && !session.result) el("elAutopilot").click();
      else next();
    });
    el("elAutopilot").onclick = () => {
      if (session?.result) {
        next();
        return;
      }
      GameRules.confirmSkip("launch stage", () => {
        GameRules.skip("launch stage");
        grade(0.6, true);
      });
    };
    el("elAction").onclick = (e) => {
      if (!session) return;
      if (session.stage === 4) {
        if (e.detail === 0) {
          session.holding = !session.holding;
          syncHold();
        }
        return;
      }
      submit();
    };
    el("elAction").addEventListener("pointerdown", (e) => {
      if (session?.stage === 4 && !session.result) {
        e.preventDefault();
        session.holding = true;
        syncHold();
      }
    });
    for (const evt of ["pointerup", "pointercancel", "pointerleave"])
      el("elAction").addEventListener(evt, () => {
        if (session) {
          session.holding = false;
          syncHold();
        }
      });
    el("elNext").onclick = next;
  }
  function elFrom(root, id) {
    return root.querySelector("#" + id);
  }
  function syncHold() {
    el("elAction").setAttribute("aria-pressed", String(!!session?.holding));
  }
  function start(done) {
    create();
    if (session) finish(false);
    focusBefore = document.activeElement;
    session = {
      done,
      stage: 0,
      t: 0,
      last: 0,
      result: false,
      holding: false,
      attempts: 0,
      completed: false,
      trail: [],
    };
    el("elMission").textContent = selectedMission.short;
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", blur);
    init(0);
    if (!ui.dialog.open) ui.dialog.showModal();
    frame = requestAnimationFrame(loop);
    return { stop: () => finish(true) };
  }
  function finish(invoke = true) {
    const s = session;
    if (!s || s.completed) return;
    s.completed = true;
    session = null;
    cancelAnimationFrame(frame);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
    window.removeEventListener("blur", blur);
    ui.dialog.close();
    focusBefore?.focus?.();
    if (invoke) s.done?.({ failed: dead(), mode: "launch" });
  }
  function init(index) {
    const s = session;
    s.stage = index;
    s.t = 0;
    s.result = false;
    s.holding = false;
    s.attempts = 0;
    s.sequence = 0;
    s.problem = null;
    s.solver = null;
    const st = stages[index];
    el("elStep").textContent =
      (index === 0
        ? "FLIGHT CALL"
        : index === 4
          ? "ORBIT CONTROL"
          : "ENGINEERING CHECK") +
      " #" +
      (index + 1);
    el("elTitle").textContent = st.title;
    el("elInstruction").textContent = st.instruction;
    el("elFeedback").textContent = "";
    el("elNext").hidden = true;
    el("elAction").hidden = false;
    el("elAction").disabled = false;
    el("elAction").textContent = st.action;
    el("elAutopilot").textContent = "Ask autopilot";
    el("elTask").innerHTML = "";
    syncHold();
    if (index === 0) {
      el("elTask").innerHTML =
        '<div class="ignition-count"><span>T MINUS</span><b id="elCountdown">4.0</b><small>IGNITE WHEN THE COUNT REACHES ZERO</small></div>';
      el("elAction").focus();
    } else if (index === 2) {
      el("elTask").innerHTML =
        '<div class="telemetry-givens"><div><span>Booster fuel</span><b>0%</b></div><div><span>Chamber pressure</span><b>Residual</b></div></div><div id="stagingInterlocks" class="interlock-grid"></div><p class="engineering-note">Use the physical checklist; do not guess the order.</p>';
      for (const [i, label] of [
        [2, "Separate booster"],
        [0, "Isolate fuel feed"],
        [1, "Confirm engine cutoff"],
      ]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "interlock-card";
        b.dataset.interlock = i;
        b.textContent = label;
        b.onclick = () => interlock(i, b);
        el("stagingInterlocks").append(b);
      }
      el("elAction").hidden = true;
    } else if (index === 4) {
      s.r = [6671, 0];
      s.v = [0, 7.5];
      s.burnLeft = 0.36;
      s.elements = elements(s.r, s.v);
      s.stable = 0;
      el("elTask").innerHTML =
        '<div class="orbit-readouts"><div><span>Periapsis</span><b id="elPeriapsis"></b></div><div><span>Apoapsis</span><b id="elApoapsis"></b></div><div><span>Eccentricity</span><b id="elEccentricity"></b></div></div><p class="engineering-note">Aim for eccentricity close to 0. If you overburn, release rather than adding more velocity.</p>';
      el("elAction").focus();
    } else if ([1, 3, 5].includes(index)) {
      el("elAction").hidden = true;
      s.solver = ProblemSolvers.mount(
        el("elTask"),
        { 1: "power", 3: "thermal", 5: "shield" }[index],
        (accuracy) => grade(accuracy),
      );
    } else if (index === 6 && GameRules.isKid()) {
      el("elAction").hidden = true;
      s.solver = ProblemSolvers.mount(el("elTask"), "attitude", (accuracy) =>
        grade(accuracy),
      );
    } else {
      s.problem = EngineeringProblems.create(st.id);
      el("elTask").innerHTML = EngineeringProblems.view(s.problem, "launch-");
      attachEngineeringCalculator("launch-");
      el("launch-engineeringForm").onsubmit = (e) => {
        e.preventDefault();
        submit();
      };
      el("launch-engineeringAnswer").focus();
    }
  }
  function interlock(i, button) {
    const s = session;
    if (!s || s.result) return;
    if (i !== s.sequence) {
      s.attempts++;
      el("elFeedback").textContent =
        "Interlock blocked. Isolate fuel first, verify engine cutoff second, separate last.";
      sfx("miss");
      return;
    }
    s.sequence++;
    button.disabled = true;
    button.classList.add("complete");
    button.textContent = "✓ " + button.textContent;
    el("elFeedback").textContent =
      s.sequence === 1
        ? "Feed isolated. Now confirm cutoff."
        : s.sequence === 2
          ? "Engine cutoff verified. Separation is now safe."
          : "";
    if (s.sequence === 3) grade(Math.max(0.6, 1 - s.attempts * 0.15));
  }
  function submit() {
    const s = session;
    if (!s || s.result || [2, 4].includes(s.stage)) return;
    if (s.stage === 0) {
      grade(clamp(1 - Math.abs(s.t - 4) / (0.8 * pilotWindow()), 0, 1));
      return;
    }
    const raw = el("launch-engineeringAnswer").value.trim();
    if (!raw || !Number.isFinite(Number(raw))) {
      el("launch-engineeringFeedback").textContent =
        "Enter a finite number in " + s.problem.unit + ".";
      return;
    }
    const answer = Number(raw);
    if (EngineeringProblems.validAnswer(s.problem, answer)) {
      grade(Math.max(0.55, 1 - s.attempts * 0.15));
      return;
    }
    s.attempts++;
    sfx("miss");
    el("launch-engineeringFeedback").textContent =
      s.attempts === 1
        ? "Check the units and use the formula above. You can revise the calculation."
        : `Worked result: ${EngineeringProblems.answerText(s.problem)}. ${s.problem.explanation}`;
    if (s.attempts >= 3) grade(0.35, true);
  }
  function grade(accuracy, automatic = false) {
    const s = session;
    if (!s || s.result) return;
    s.result = true;
    s.holding = false;
    const st = stages[s.stage],
      good = accuracy >= 0.55,
      loss = Math.round(
        (1 - accuracy) *
          (s.stage === 0 ? 5 : s.stage === 4 ? 10 : s.stage === 6 ? 10 : 6),
      );
    if (s.stage === 1)
      flight.hull = clamp(
        flight.hull - loss * (campaign.tests.shake ? 0.5 : 1),
      );
    else if (s.stage === 3) flight.hull = clamp(flight.hull - loss);
    else flight.fuel = clamp(flight.fuel - loss);
    if (s.stage === 6) campaign.orbitEcc = 0.04 + 0.38 * (1 - accuracy);
    const note =
      (automatic
        ? "Autopilot assisted. "
        : good
          ? "Check passed. "
          : "Check needs review. ") +
      (s.problem
        ? EngineeringProblems.answerText(s.problem) +
          ". " +
          s.problem.explanation
        : st.lesson);
    flight.logs.push(st.title + ": " + note);
    flight.lessons.push(st.lesson);
    campaign.launchAccuracy.push({
      name: st.title,
      accuracy: Math.round(accuracy * 100),
    });
    snapshotFlight(st.title, note, "launch", good);
    sfx(good ? "lock" : "miss");
    el("elFeedback").textContent = note;
    el("elFeedback").className = good ? "passed" : "review";
    el("elAction").disabled = true;
    el("elNext").hidden = false;
    el("elNext").textContent = dead()
      ? "Mission report →"
      : s.stage === 6
        ? "Deploy spacecraft →"
        : "Next checkpoint →";
    el("elAutopilot").textContent = "Continue";
    el("elTask")
      .querySelectorAll("input,button")
      .forEach((x) => (x.disabled = true));
    syncHold();
  }
  function next() {
    if (!session?.result) return;
    if (dead() || session.stage === 6) {
      finish();
      return;
    }
    init(session.stage + 1);
  }
  function elements(r, v) {
    const mu = 398600,
      rr = Math.hypot(...r),
      vv = v[0] ** 2 + v[1] ** 2,
      rv = r[0] * v[0] + r[1] * v[1],
      ex = ((vv - mu / rr) * r[0] - rv * v[0]) / mu,
      ey = ((vv - mu / rr) * r[1] - rv * v[1]) / mu,
      e = Math.hypot(ex, ey),
      a = -mu / (vv - (2 * mu) / rr);
    return {
      e,
      a,
      pe: a * (1 - e) - 6371,
      ap: a * (1 + e) - 6371,
      w: Math.atan2(ey, ex),
    };
  }
  function update(dt) {
    const s = session;
    if (s.result) return;
    s.t += dt;
    if (s.stage === 0) {
      el("elCountdown").textContent = (4 - s.t).toFixed(1);
      if (s.t > 7) grade(0.2, true);
    } else if (s.stage === 4) {
      const time = dt * 18,
        count = Math.max(1, Math.ceil(time)),
        h = time / count;
      for (let i = 0; i < count; i++) {
        if (s.holding && s.burnLeft > 0) {
          const speed = Math.hypot(...s.v),
            dv = Math.min(s.burnLeft, 0.0018 * h);
          s.v[0] += (s.v[0] / speed) * dv;
          s.v[1] += (s.v[1] / speed) * dv;
          s.burnLeft -= dv;
          flight.fuel = clamp(flight.fuel - dv * 18);
        }
        const radius = Math.hypot(...s.r),
          k = (-398600 / radius ** 3) * h;
        s.v[0] += s.r[0] * k;
        s.v[1] += s.r[1] * k;
        s.r[0] += s.v[0] * h;
        s.r[1] += s.v[1] * h;
      }
      s.elements = elements(s.r, s.v);
      el("elPeriapsis").textContent = Math.round(s.elements.pe) + " km";
      el("elApoapsis").textContent = Math.round(s.elements.ap) + " km";
      el("elEccentricity").textContent = s.elements.e.toFixed(3);
      if (!s.holding && s.elements.pe >= 150) {
        s.stable += dt;
        if (s.stable > 0.8) {
          grade(clamp(1 - s.elements.e * 3, 0, 1));
          return;
        }
      } else s.stable = 0;
      if (s.t > 35 || Math.hypot(...s.r) - 6371 < 80) grade(0.3, true);
    }
  }
  function draw() {
    const s = session,
      c = ui.ctx,
      w = 650,
      h = 440;
    c.clearRect(0, 0, w, h);
    c.fillStyle = "#1b192c";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      c.fillStyle = i % 8 ? "#756b8c" : "#b3a7c1";
      c.fillRect((i * 89 + 17) % w, (i * 57 + 23) % h, i % 6 ? 2 : 3, 2);
    }
    const n = s.stage;
    if (n < 4) {
      const ground = n === 0 ? 370 : 410;
      c.fillStyle = "#36334a";
      c.fillRect(0, ground, w, h - ground);
      c.fillStyle = "#4e5368";
      c.fillRect(0, ground, 650, 8);
      const y = n === 0 ? 280 : n === 1 ? 220 : n === 2 ? 160 : 210,
        x = 335;
      c.save();
      c.translate(x, y);
      c.rotate(n * 0.08);
      c.fillStyle = "#ece4d5";
      c.beginPath();
      c.moveTo(0, -60);
      c.lineTo(17, -28);
      c.lineTo(17, 60);
      c.lineTo(-17, 60);
      c.lineTo(-17, -28);
      c.closePath();
      c.fill();
      c.fillStyle = "#f494a5";
      c.fillRect(-17, -15, 34, 13);
      c.fillStyle = "#86bbd5";
      c.fillRect(-7, -37, 14, 12);
      c.fillStyle = "#ffc880";
      c.beginPath();
      c.moveTo(-10, 60);
      c.lineTo(0, 95 + Math.sin(s.t * 20) * 8);
      c.lineTo(10, 60);
      c.fill();
      c.restore();
      if (n === 3) {
        c.strokeStyle = "#f494a5";
        c.lineWidth = 2;
        c.beginPath();
        c.arc(x, y, 70, 0, Math.PI * 2);
        c.stroke();
      }
      c.fillStyle = "#99dfc5";
      c.font = "bold 13px monospace";
      c.fillText(
        [
          "PAD SYSTEMS",
          "POWER BUS TELEMETRY",
          "STAGE INTERLOCKS",
          "THERMAL TELEMETRY",
        ][n],
        25,
        37,
      );
    } else {
      const x = 325,
        y = 220,
        r = 76;
      c.fillStyle = selectedMission.color || "#67a2bf";
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#15132966";
      c.beginPath();
      c.ellipse(x + 38, y, r * 0.65, r, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#887499";
      c.lineWidth = 2;
      c.setLineDash([5, 6]);
      c.beginPath();
      c.ellipse(
        x,
        y,
        156,
        115,
        n === 4 ? s.elements?.w || 0 : -0.3,
        0,
        Math.PI * 2,
      );
      c.stroke();
      c.setLineDash([]);
      const angle = n === 4 ? Math.atan2(s.r[1], s.r[0]) : s.t * 0.15,
        rx = x + Math.cos(angle) * 156,
        ry = y + Math.sin(angle) * 115;
      c.save();
      c.translate(rx, ry);
      c.rotate(angle);
      c.fillStyle = "#75acd9";
      c.fillRect(-30, -9, 22, 18);
      c.fillRect(8, -9, 22, 18);
      c.fillStyle = "#ffc880";
      c.fillRect(-8, -14, 16, 28);
      c.fillStyle = "#99dfc5";
      c.fillRect(-3, -4, 6, 8);
      if (s.holding) {
        c.fillStyle = "#f494a5";
        c.fillRect(-7, 17, 14, 7);
      }
      c.restore();
      c.fillStyle = "#99dfc5";
      c.font = "bold 13px monospace";
      c.fillText(
        n === 4
          ? "TWO-BODY ORBIT CONTROL"
          : n === 5
            ? "TRANSFER GEOMETRY"
            : "ARRIVAL ENERGY BUDGET",
        25,
        37,
      );
    }
    el("elTelemetry").textContent =
      n === 4
        ? `Periapsis ${Math.round(s.elements.pe)} km\u2003\u2003burn remaining ${Math.round(s.burnLeft * 1000)} m/s`
        : n === 0
          ? "Vehicle systems ready\u2003\u2003waiting for ignition"
          : n === 1
            ? "Overloaded bus\u2003\u2003protect essential systems"
            : n === 2
              ? "Booster empty\u2003\u2003safety interlocks active"
              : n === 3
                ? "Compare independent evidence before isolating a sensor"
                : n === 5
                  ? "Plan the departure geometry before committing fuel"
                  : "Match arrival speed to the local circular orbit";
    el("elVitals").textContent =
      `♥ ${Math.round(flight.hull)}% hull\u2003\u2003⚡ ${Math.round(flight.energy)}% energy\u2003\u2003${Math.round(flight.fuel)} fuel`;
  }
  function loop(t) {
    if (!session) return;
    if (GameRules.isPaused()) {
      session.holding = false;
      syncHold();
    }
    const dt =
      session.last && !document.hidden && !GameRules.isPaused()
        ? Math.min(0.05, (t - session.last) / 1000)
        : 0;
    session.last = t;
    update(dt);
    if (!session) return;
    draw();
    frame = requestAnimationFrame(loop);
  }
  function keydown(e) {
    if (
      !session ||
      GameRules.isPaused() ||
      /INPUT|TEXTAREA/.test(e.target.tagName)
    )
      return;
    if (e.code === "Space") {
      if (![0, 4].includes(session.stage) && !session.result) return;
      e.preventDefault();
      if (e.repeat) return;
      if (session.result) {
        next();
        return;
      }
      if (session.stage === 4) {
        session.holding = true;
        syncHold();
      } else if (session.stage === 0) submit();
    }
  }
  function keyup(e) {
    if (session && e.code === "Space") {
      session.holding = false;
      syncHold();
    }
  }
  function blur() {
    if (session) {
      session.holding = false;
      syncHold();
    }
  }
  return {
    start,
    get active() {
      return !!session;
    },
    get state() {
      return session;
    },
    stop: () => finish(true),
  };
})();
function startWorkshopCalculation(label, done) {
  const host = $("budgetAppealHost");
  $("buildChoices")?.replaceChildren();
  ProblemSolvers.mount(
    host,
    label.includes("CASE") ? "negotiation" : "thermal",
    (quality) => {
      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn primary";
      next.textContent = "Apply result →";
      let applied = false;
      next.onclick = () => {
        if (applied) return;
        applied = true;
        done(quality >= 0.55);
      };
      host.append(next);
    },
  );
}
function initEngineeringMini(type) {
  miniState.duration = 180;
  miniState.remaining = 180;
  $("miniCanvas").hidden = true;
  $("miniLeft").hidden = true;
  $("miniRight").hidden = true;
  $("miniAction").hidden = true;
  const current = miniState;
  current.solver = ProblemSolvers.mount(
    extraControls,
    type === "signal" ? "signal" : "attitude",
    (quality) => {
      if (miniState !== current || current.finished) return;
      current.hits = 3;
      current.misses = quality < 0.8 ? 1 : 0;
      current.calculationComplete = true;
      const next = document.createElement("button");
      next.className = "btn green";
      next.type = "button";
      next.textContent = "Continue operations →";
      next.onclick = () => {
        if (miniState === current) finishMiniGame(false);
      };
      extraControls.append(next);
      snapshotFlight(
        type === "signal" ? "Radio path repaired" : "Attitude correction",
        "System state verified through hands-on troubleshooting.",
        "operate",
        true,
      );
    },
  );
}
function submitEngineeringMini() {
  if (miniState?.calculationComplete) finishMiniGame(false);
}
function drawEngineeringMini(m) {
  $("miniStatus").textContent = m.calculationComplete
    ? "SYSTEM VERIFIED"
    : m.type === "signal"
      ? "ROUTE THE SIGNAL"
      : "ORIENT AND CORRECT";
}

const EngineeringCalculator = {
  evaluate(expression) {
    const source = String(expression)
      .trim()
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/−/g, "-");
    if (!source || source.length > 180)
      throw new Error("Enter a calculation with at most 180 characters.");
    const tokens = [],
      pattern =
        /\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?|(sqrt|ln|abs|pi)|([()+\-*/^]))/y;
    let at = 0;
    while (at < source.length) {
      pattern.lastIndex = at;
      const m = pattern.exec(source);
      if (!m)
        throw new Error("Use numbers, + − * / ^, sqrt(), ln(), abs(), or pi.");
      tokens.push(
        m[1] !== undefined
          ? { number: Number(m[1] + (m[2] ? "e" + m[2] : "")) }
          : { symbol: m[3] || m[4] },
      );
      at = pattern.lastIndex;
    }
    let i = 0;
    const peek = () => tokens[i]?.symbol,
      eat = (s) => (peek() === s ? (i++, true) : false);
    function atom() {
      const t = tokens[i];
      if (!t) throw new Error("Complete the calculation.");
      if (t.number !== undefined) {
        i++;
        return t.number;
      }
      if (eat("(")) {
        const n = sum();
        if (!eat(")")) throw new Error("Close the parenthesis.");
        return n;
      }
      if (eat("pi")) return Math.PI;
      const name = peek();
      if (["sqrt", "ln", "abs"].includes(name)) {
        i++;
        if (!eat("("))
          throw new Error("Put function arguments in parentheses.");
        const n = sum();
        if (!eat(")")) throw new Error("Close the function parenthesis.");
        return name === "sqrt"
          ? Math.sqrt(n)
          : name === "ln"
            ? Math.log(n)
            : Math.abs(n);
      }
      throw new Error("Check the operators and parentheses.");
    }
    function power() {
      let n = atom();
      if (eat("^")) n = n ** unary();
      return n;
    }
    function unary() {
      if (eat("+")) return unary();
      if (eat("-")) return -unary();
      return power();
    }
    function product() {
      let n = unary();
      while (peek() === "*" || peek() === "/") {
        const op = peek();
        i++;
        const rhs = unary();
        n = op === "*" ? n * rhs : n / rhs;
      }
      return n;
    }
    function sum() {
      let n = product();
      while (peek() === "+" || peek() === "-") {
        const op = peek();
        i++;
        const rhs = product();
        n = op === "+" ? n + rhs : n - rhs;
      }
      return n;
    }
    const result = sum();
    if (i !== tokens.length) throw new Error("Use an operator between values.");
    if (!Number.isFinite(result))
      throw new Error(
        "The result must be finite. Check division and square roots.",
      );
    return result;
  },
};
function attachEngineeringCalculator(prefix) {
  const get = (id) => document.getElementById(prefix + id),
    form = get("calculatorForm");
  if (!form) return;
  let result = null;
  form.onsubmit = (e) => {
    e.preventDefault();
    try {
      result = EngineeringCalculator.evaluate(
        get("calculatorExpression").value,
      );
      get("calculatorResult").textContent =
        "= " + Number(result.toFixed(6)).toLocaleString("en-US");
      get("calculatorUse").hidden = false;
    } catch (error) {
      result = null;
      get("calculatorResult").textContent = error.message;
      get("calculatorUse").hidden = true;
    }
  };
  get("calculatorUse").onclick = () => {
    if (result === null) return;
    get("engineeringAnswer").value = String(Number(result.toFixed(4)));
    get("engineeringAnswer").focus();
  };
}
