"use strict";
// Optional report archive: appended to the existing report, without replacing its layout.
function renderMissionArchive(end) {
  const host = $("expandedReport");
  if (!host || !flight || !design || !selectedMission) return;
  const old = $("missionArchive");
  if (old) old.remove();
  const section = document.createElement("section");
  section.id = "missionArchive";
  section.className = "mission-archive";
  host.append(section);
  section.innerHTML = `<div class="report-extra"><p class="box-label">✦ YOUR MISSION PATCH</p><div class="archive-patch-row"><div class="archive-patch"><div class="archive-patch-stars" aria-hidden="true"></div><div class="archive-patch-avatar" aria-hidden="true"></div><b class="archive-patch-name"></b><span class="archive-patch-destination"></span></div><div class="archive-sticker-group"><p class="caption">Every sticker points to a decision you made. Dashed stickers are goals for your next mission.</p><div id="archiveStickers" class="archive-stickers"></div></div></div></div><div class="report-extra"><p class="box-label">◈ SCORE BREAKDOWN</p><p class="caption">Weights add to 100. Mission completion still depends on its science and lifetime contract. Lost spacecraft scores are capped at 49.</p><div id="archiveScores" class="archive-scores"></div><p id="archiveScoreNote" class="archive-note" role="status"></p></div><div class="report-extra"><p class="box-label">⌁ FLIGHT RECORDER / TAP A MOMENT</p><p class="caption" id="archiveChartDescription">Five lines show integrity, energy, signal, fuel and science after live telemetry begins. Build moments have no telemetry and appear as gaps. Select a replay button or move the moment slider to inspect exact values.</p><div class="archive-chart-wrap"><canvas id="archiveChart" width="720" height="270" aria-label="Recorded mission resource chart" aria-describedby="archiveChartDescription"></canvas></div><div class="archive-legend" aria-hidden="true"><span>♥ Integrity</span><span>⚡ Energy</span><span>⌁ Signal</span><span>▲ Fuel</span><span>✦ Science</span></div><label for="archiveMoment" class="caption">RECORDED MOMENT</label><input id="archiveMoment" type="range" min="0" max="0" value="0" step="1"><div id="archiveMomentReadout" class="archive-moment" role="status"></div><div class="archive-replay" id="archiveReplay" aria-label="Mission replay moments"></div></div><div class="report-extra"><p class="box-label">? COMMANDER’S THREE-QUESTION DEBRIEF</p><p class="caption">Two points per correct first answer. Explanations remain available after answering.</p><div id="archiveQuiz" class="archive-quiz"></div><p id="archiveQuizTotal" class="archive-note" role="status"></p></div>`;
  section.querySelector(".archive-patch-avatar").innerHTML = avatarSVG();
  section.querySelector(".archive-patch-name").textContent =
    "CAPTAIN " + String(captain.name || "NOVA").toUpperCase();
  section.querySelector(".archive-patch-destination").textContent = String(
    selectedMission.name || selectedMission.short || "EXPLORER",
  ).toUpperCase();
  const raw = Array.isArray(campaign.flightRecords)
    ? campaign.flightRecords
    : [];
  const finalMeters = {
    hull: flight.hull,
    energy: flight.energy,
    signal: flight.signal,
    fuel: flight.fuel,
    science: flight.science,
  };
  const records = raw.length
    ? raw.map((r, i) => ({
        title: String(r.title || "Recorded event " + (i + 1)),
        note: String(r.note || ""),
        phase: String(r.phase || "mission"),
        good: r.good !== false,
        time: Number.isFinite(r.time) ? r.time : i,
        meters: r.meters
          ? Object.fromEntries(
              Object.keys(finalMeters).map((k) => [
                k,
                clamp(Number(r.meters[k]) || 0),
              ]),
            )
          : null,
      }))
    : [
        {
          title: "Final telemetry",
          note: "No earlier telemetry was recorded for this attempt.",
          phase: "report",
          good: !end.failed,
          time: 0,
          meters: finalMeters,
        },
      ];
  const accuracy = (campaign.launchAccuracy || []).map((x) =>
    typeof x === "number"
      ? clamp(x > 0 && x < 1 ? x * 100 : x)
      : clamp(Number(x.accuracy ?? x.quality ?? x.score) || 0),
  );
  const piloting = accuracy.length
    ? accuracy.reduce((n, x) => n + x, 0) / accuracy.length
    : 0;
  const scienceTarget = Math.max(
    1,
    Number(selectedMission.requirements?.returned) || 35,
  );
  const health =
    (flight.hull + flight.energy + flight.signal + flight.fuel) / 4;
  const reserve = Math.max(
    0,
    (MAX_BUDGET - design.cost) / Math.max(1, MAX_BUDGET),
  );
  const reflex = campaign.suddenTotal
    ? campaign.suddenHandled / campaign.suddenTotal
    : 0;
  const stretch = !!(
    campaign.stretch &&
    Number(design.science) >=
      Number(campaign.stretch.science || campaign.stretch.target || Infinity)
  );
  const categories = [
    [
      "Science returned",
      32,
      clamp((end.scienceReturned / scienceTarget) * 100) / 100,
    ],
    ["Spacecraft health", 23, clamp(health) / 100],
    ["Piloting accuracy", 17, piloting / 100],
    ["Sudden-event response", 8, clamp(reflex * 100) / 100],
    [
      "Budget discipline",
      10,
      design.cost <= MAX_BUDGET ? 0.5 + 0.5 * Math.min(1, reserve / 0.08) : 0,
    ],
    ["Stretch research", 4, stretch ? 1 : 0],
  ];
  const base = categories.reduce((n, c) => n + c[1] * c[2], 0);
  if (!campaign.archiveQuiz) campaign.archiveQuiz = { answers: {}, correct: 0 };
  const quizState = campaign.archiveQuiz;
  const quizQuestions = archiveQuizQuestions();
  const scores = $("archiveScores");
  for (const [label, max, fraction] of categories) {
    const row = document.createElement("div");
    row.className = "archive-score-row";
    const text = document.createElement("span");
    text.textContent = label;
    const points = document.createElement("b");
    points.textContent = `${Math.round(max * fraction * 10) / 10} / ${max}`;
    row.append(text, points);
    scores.append(row);
  }
  const quizScore = document.createElement("div");
  quizScore.className = "archive-score-row";
  quizScore.innerHTML =
    '<span>Debrief knowledge</span><b id="archiveQuizScore"></b>';
  scores.append(quizScore);
  const quizHolder = $("archiveQuiz");
  quizQuestions.forEach((q, i) => {
    const item = document.createElement("div");
    item.className = "archive-quiz-question";
    const title = document.createElement("p");
    title.textContent = `${i + 1}. ${q.question}`;
    item.append(title);
    const options = document.createElement("div");
    options.className = "archive-quiz-options";
    const feedback = document.createElement("p");
    feedback.className = "archive-answer-note";
    feedback.setAttribute("role", "status");
    q.options.forEach((option, j) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn small";
      b.textContent = option;
      b.addEventListener("click", () => {
        if (quizState.answers[i] !== undefined) return;
        quizState.answers[i] = j;
        quizState.correct = quizQuestions.reduce(
          (n, entry, index) =>
            n + (quizState.answers[index] === entry.correct ? 1 : 0),
          0,
        );
        paintQuestion();
        updateRewards();
      });
      options.append(b);
    });
    item.append(options, feedback);
    quizHolder.append(item);
    function paintQuestion() {
      const answer = quizState.answers[i];
      Array.from(options.children).forEach((button, index) => {
        button.disabled = answer !== undefined;
        button.classList.toggle(
          "correct",
          answer !== undefined && index === q.correct,
        );
        button.classList.toggle(
          "incorrect",
          answer === index && answer !== q.correct,
        );
      });
      feedback.textContent =
        answer === undefined
          ? ""
          : `${answer === q.correct ? "✓ Correct." : "△ Engineering note."} ${q.explanation}`;
    }
    paintQuestion();
  });
  function updateRewards() {
    const bonus = quizState.correct * 2;
    const score = Math.min(end.failed ? 49 : 100, Math.round(base + bonus));
    end.score = score;
    end.archiveScore = score;
    campaign.archiveScore = score;
    end.quizBonus = bonus;
    end.scoring = categories.map(([name, max, fraction]) => ({
      name,
      points: Math.round(max * fraction * 10) / 10,
      max,
    }));
    if ($("resultScore")) $("resultScore").textContent = score;
    if (typeof applyPassMark === "function") applyPassMark(end);
    $("archiveQuizScore").textContent = `${bonus} / 6`;
    $("archiveQuizTotal").textContent =
      `${Object.keys(quizState.answers).length} / 3 answered\u2003\u2003${bonus} / 6 bonus points`;
    $("archiveScoreNote").textContent =
      `MISSION SCORE ${score} / 100 (${PASS_SCORE} needed to complete)${end.failed ? "\u2003\u2003critical failure cap applied" : ""}. ${archiveWeakestTip(categories)}`;
    const earned = [
      ["Perfect ignition", accuracy[0] >= 90, "First launch timing ≥90%"],
      ["Smooth Max-Q", accuracy[1] >= 85, "Max-Q timing ≥85%"],
      ["Round orbit", accuracy[4] >= 85, "Insertion burn accuracy ≥85%"],
      ["Threaded window", accuracy[5] >= 85, "Transfer timing ≥85%"],
      ["Negotiator", !!campaign.negotiator, "Win a budget appeal"],
      ["Thrifty", reserve >= 0.08, "Keep at least 8% of the grant"],
      [
        "Cool under pressure",
        campaign.suddenTotal > 0 &&
          campaign.suddenHandled === campaign.suddenTotal,
        "Respond to every sudden event",
      ],
      ["Iron hull", flight.hull >= 80, "Finish with at least 80% integrity"],
      [
        "Science hero",
        end.scienceReturned >= scienceTarget * 0.9,
        "Return at least 90% of the science target",
      ],
      [
        "Quiz whiz",
        quizState.correct === 3,
        "Answer every debrief question correctly",
      ],
    ];
    const stickerHolder = $("archiveStickers");
    stickerHolder.replaceChildren();
    earned.forEach(([name, yes, tip]) => {
      const badge = document.createElement("span");
      badge.className = "archive-sticker" + (yes ? " earned" : "");
      badge.textContent = (yes ? "★ " : "☆ ") + name;
      badge.title = tip;
      badge.setAttribute(
        "aria-label",
        `${name}: ${yes ? "earned" : "not earned"}. ${tip}`,
      );
      stickerHolder.append(badge);
    });
    section.querySelector(".archive-patch-stars").textContent =
      "★".repeat(Math.min(8, earned.filter((x) => x[1]).length)) || "✦";
  }
  updateRewards();
  let selected = Math.max(
    0,
    records.findIndex((r) => r.good === false),
  );
  const moment = $("archiveMoment");
  moment.max = records.length - 1;
  const replay = $("archiveReplay");
  records.forEach((record, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className =
      "btn small archive-replay-item" + (record.good ? " good" : " bad");
    const phase = document.createElement("small");
    phase.textContent = record.phase.toUpperCase();
    const title = document.createElement("span");
    title.textContent = record.title;
    b.append(phase, title);
    b.addEventListener("click", () => selectMoment(i));
    replay.append(b);
  });
  const chart = $("archiveChart");
  const colors = {
    hull: "#ff7395",
    energy: "#ffcd65",
    signal: "#5ceaff",
    fuel: "#b49bea",
    science: "#77ffb1",
  };
  function drawChart() {
    const ctx = chart.getContext("2d");
    if (!ctx) return;
    const width = chart.width,
      height = chart.height,
      pad = { l: 39, r: 14, t: 17, b: 28 };
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#070d22";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "12px monospace";
    ctx.textAlign = "right";
    [0, 25, 50, 75, 100].forEach((v) => {
      const y = pad.t + ((100 - v) / 100) * (height - pad.t - pad.b);
      ctx.strokeStyle = "#343b65";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(width - pad.r, y);
      ctx.stroke();
      ctx.fillStyle = "#a9b6d9";
      ctx.fillText(String(v), pad.l - 7, y + 4);
    });
    const xAt = (i) =>
      pad.l +
      (records.length < 2 ? 0.5 : i / (records.length - 1)) *
        (width - pad.l - pad.r);
    for (const k of Object.keys(colors)) {
      ctx.beginPath();
      ctx.strokeStyle = colors[k];
      ctx.lineWidth = 2;
      let connected = false;
      records.forEach((r, i) => {
        if (!r.meters) {
          connected = false;
          return;
        }
        const x = xAt(i),
          y = pad.t + ((100 - r.meters[k]) / 100) * (height - pad.t - pad.b);
        if (!connected) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        connected = true;
      });
      ctx.stroke();
      if (records.length === 1 && records[0].meters) {
        ctx.fillStyle = colors[k];
        ctx.fillRect(
          xAt(0) - 3,
          pad.t +
            ((100 - records[0].meters[k]) / 100) * (height - pad.t - pad.b) -
            3,
          6,
          6,
        );
      }
    }
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xAt(selected), pad.t);
    ctx.lineTo(xAt(selected), height - pad.b);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = "left";
    ctx.fillStyle = "#a9b6d9";
    ctx.fillText("MISSION START", pad.l, height - 7);
    ctx.textAlign = "right";
    ctx.fillText("FINAL TELEMETRY", width - pad.r, height - 7);
    ctx.textAlign = "left";
  }
  function selectMoment(index) {
    selected = Math.max(0, Math.min(records.length - 1, index));
    moment.value = selected;
    const r = records[selected],
      box = $("archiveMomentReadout");
    box.replaceChildren();
    const heading = document.createElement("b");
    heading.textContent = `${r.phase.toUpperCase()}\u2003\u2003${r.title}`;
    const note = document.createElement("p");
    note.textContent = r.note;
    const values = document.createElement("div");
    values.className = "archive-exact-values";
    if (!r.meters) {
      const waiting = document.createElement("span");
      waiting.textContent = "Pre-launch: no live telemetry yet.";
      values.append(waiting);
    } else
      for (const [k, label] of [
        ["hull", "Integrity"],
        ["energy", "Energy"],
        ["signal", "Signal"],
        ["fuel", "Fuel"],
        ["science", "Science"],
      ]) {
        const value = document.createElement("span");
        value.textContent = `${label} ${Math.round(r.meters[k] * 10) / 10}%`;
        value.style.color = colors[k];
        values.append(value);
      }
    box.append(heading, note, values);
    Array.from(replay.children).forEach((b, i) => {
      b.classList.toggle("selected", i === selected);
      b.setAttribute("aria-pressed", String(i === selected));
    });
    drawChart();
  }
  moment.addEventListener("input", () => selectMoment(+moment.value));
  chart.addEventListener("click", (e) => {
    const bounds = chart.getBoundingClientRect();
    if (!bounds.width) return;
    const x = ((e.clientX - bounds.left) / bounds.width) * chart.width;
    selectMoment(
      Math.round(((x - 39) / (chart.width - 53)) * (records.length - 1)),
    );
  });
  selectMoment(selected);
  campaign.archiveScore = end.score;
}
function archiveWeakestTip(categories) {
  const names = {
    "Science returned":
      "Improve instrument pointing and downlink quality, or fit more science potential.",
    "Spacecraft health":
      "Keep power and fuel margins, then protect the spacecraft during alerts.",
    "Piloting accuracy":
      "Practice launch timing and save propellant for a precise capture burn.",
    "Sudden-event response":
      "Watch for priority alerts and respond before their countdown expires.",
    "Budget discipline":
      "Try a lower-cost part while preserving every required mission constraint.",
  };
  const eligible = categories.filter((x) => names[x[0]]);
  const weakest = eligible.reduce((a, b) => (a[2] <= b[2] ? a : b));
  return names[weakest[0]];
}
function archiveQuizQuestions() {
  const key = selectedMission.key;
  const destinationQuestion = ["europa", "titan", "neptune"].includes(key)
    ? {
        question: "Why can radioisotope power help this distant mission?",
        options: [
          "It generates power without depending on sunlight",
          "It removes all spacecraft mass",
          "It makes radio signals instantaneous",
        ],
        correct: 0,
        explanation:
          "Radioisotope generators produce heat from radioactive decay and convert some of it to electricity. Solar intensity falls with the square of distance.",
      }
    : ["mercury", "venus"].includes(key)
      ? {
          question: "Why does this mission need strong thermal control?",
          options: [
            "To stop gravity from acting",
            "To reject heat and protect electronics",
            "To eliminate the need for communications",
          ],
          correct: 1,
          explanation:
            "Sunshields, insulation and radiators control absorbed and emitted heat. Electronics must stay within their operating temperature range.",
        }
      : {
          question:
            "What keeps instruments operating while the spacecraft is in shadow?",
          options: [
            "The empty fuel tank",
            "The launch fairing",
            "Energy stored in its battery",
          ],
          correct: 2,
          explanation:
            "During eclipse, the solar array cannot generate power. Battery energy must cover the electrical load for the entire shadow pass.",
        };
  return [
    destinationQuestion,
    {
      question:
        "Why can a heavier spacecraft get less delta-v from the same propellant?",
      options: [
        "Extra dry mass lowers the mass ratio in the rocket equation",
        "Gravity stops outside the atmosphere",
        "Antenna data replaces fuel",
      ],
      correct: 0,
      explanation:
        "Delta-v = Isp × g₀ × ln(wet mass / dry mass). Adding hardware increases dry mass and reduces the useful mass ratio for a fixed propellant load.",
    },
    {
      question: "Why brake near closest approach during orbital capture?",
      options: [
        "The spacecraft is motionless there",
        "A burn at high speed can change orbital energy efficiently",
        "Solar panels stop needing power there",
      ],
      correct: 1,
      explanation:
        "The Oberth effect makes a given prograde or retrograde velocity change more effective at changing orbital energy when the spacecraft is moving faster.",
    },
  ];
}
