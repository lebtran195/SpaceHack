"use strict";
let assignmentMarketReady = false,
  scienceSlotTarget = "primary",
  advancedGroup = "trajectory";
const shelfCategories = [
  ["solar", "☀", "Power"],
  ["battery", "▣", "Battery"],
  ["science", "✧", "Science"],
  ["antenna", "⌁", "Antenna"],
  ["thruster", "✧", "Engine"],
  ["extra", "✚", "Extras"],
  ["rocket", "↑", "Rocket"],
];
const settingGroups = {
  trajectory: { name: "Orbit & power", keys: ["orbit", "life", "duty"] },
  protection: {
    name: "Protection",
    keys: ["thermal", "shielding", "redundancy"],
  },
  control: { name: "Guidance", keys: ["attitude", "computer", "tank"] },
  operations: {
    name: "Mission planning",
    keys: ["ground", "assurance", "reserve"],
  },
};
function safeText(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}
function partIcon(category, id) {
  const svg = (body) =>
    `<svg viewBox="0 0 64 56" aria-hidden="true" class="part-icon">${body}</svg>`;
  const stroke = 'stroke="#171320" stroke-width="3" stroke-linejoin="round"';
  if (category === "solar") {
    if (id?.startsWith("rtg"))
      return svg(
        `<rect x="16" y="12" width="32" height="35" rx="5" fill="#99a99c" ${stroke}/><path d="M22 16v27m7-27v27m7-27v27m7-27v27" stroke="#46514a" stroke-width="3"/><circle cx="32" cy="7" r="4" fill="#ffca83"/>`,
      );
    return svg(
      `<path d="M10 16h44v30H10Z" fill="#75acd9" ${stroke}/><path d="M21 16v30m11-30v30m11-30v30M10 26h44m-44 10h44" stroke="#3f648a" stroke-width="2"/><path d="M32 9v7m0 30v6" stroke="#b3b0c7" stroke-width="4"/>`,
    );
  }
  if (category === "battery")
    return svg(
      `<path d="M26 9h12v6H26Z" fill="#d4c5a2" ${stroke}/><rect x="18" y="15" width="28" height="34" rx="5" fill="#99ddc5" ${stroke}/><path d="M25 31h14m-7-7v14" stroke="#354a45" stroke-width="4"/>`,
    );
  if (category === "science")
    return svg(
      `<rect x="11" y="17" width="42" height="29" rx="6" fill="#bda4db" ${stroke}/><rect x="16" y="11" width="15" height="6" fill="#dacde7" ${stroke}/><circle cx="34" cy="31" r="11" fill="#18333d" ${stroke}/><circle cx="34" cy="31" r="7" fill="#9be4d0"/>`,
    );
  if (category === "antenna")
    return svg(
      `<path d="M32 25v24" stroke="#c8c1ce" stroke-width="4"/><ellipse cx="32" cy="22" rx="23" ry="8" fill="#f1d7af" ${stroke}/><path d="M32 22V11" stroke="#e49e98" stroke-width="3"/><circle cx="32" cy="10" r="4" fill="#e49e98" ${stroke}/>`,
    );
  if (category === "thruster")
    return svg(
      `<path d="M23 10h18v13H23Z" fill="#c9b6d6" ${stroke}/><path d="M23 23h18l8 26H15Z" fill="#8b7ba5" ${stroke}/><path d="M27 51l5 5 5-5" fill="#ffc681"/>`,
    );
  if (category === "rocket")
    return svg(
      `<path d="M23 41V23Q23 10 32 4q9 6 9 19v18Z" fill="#f6efd7" ${stroke}/><path d="M23 27l-9 18h9m18-18l9 18h-9" fill="#e499a3" ${stroke}/><circle cx="32" cy="25" r="5" fill="#82bce0" ${stroke}/><path d="M28 44l4 10 4-10" fill="#ffc681"/>`,
    );
  const colors = {
    vault: "#a78eba",
    blanket: "#e1bb8e",
    tracker: "#99c7c5",
    backup: "#bdb0db",
  };
  return svg(
    `<rect x="15" y="12" width="34" height="36" rx="5" fill="${colors[id] || "#a78eba"}" ${stroke}/><rect x="22" y="19" width="20" height="21" fill="#40394f" ${stroke}/><circle cx="32" cy="29" r="4" fill="#99ddc5"/>`,
  );
}
function initializeWorkshop() {
  // Avatar choices are direct tap cards, including all four specialties at once.
  const avatarChoices = {
    hairStyle: [
      ["short", "Short"],
      ["bob", "Wavy bob"],
      ["curls", "Curly"],
      ["spiky", "Spiky"],
      ["buzz", "Buzz cut"],
    ],
    legs: [
      ["boots", "Space boots"],
      ["wide", "Wide pants"],
      ["skirt", "Tunic"],
    ],
    accessory: [
      ["headset", "Headset"],
      ["glasses", "Glasses"],
      ["patch", "Star patch"],
      ["none", "None"],
    ],
    helmet: [
      ["off", "No helmet"],
      ["on", "Helmet"],
    ],
  };
  for (const [key, options] of Object.entries(avatarChoices))
    mountTapChoices(
      $(key),
      options.map(([id, name]) => ({ id, name })),
      captain[key],
    );
  const specialty = document.createElement("section");
  specialty.className = "specialty-box";
  specialty.innerHTML =
    '<p class="field">SPECIALTY\u2003\u2003YOUR IN-GAME SUPERPOWER</p><div id="specialtyChoice" aria-label="Captain specialty"></div><p id="specialtyDescription" class="caption"></p>';
  document.querySelector("#screen-create .custom-grid").after(specialty);
  specialties.pilot.desc =
    "Steady hands: wider flight tolerances and a longer ignition window.";
  mountTapChoices(
    $("specialtyChoice"),
    Object.entries(specialties).map(([id, p]) => ({
      id,
      name: p.icon + " " + p.name,
      description: p.desc,
    })),
    captain.specialty,
    (id) => {
      captain.specialty = id;
      updateCaptain();
      $("specialtyDescription").textContent =
        "Your specialty applies to the next mission.";
    },
  );
  const lottery = document.createElement("div");
  lottery.id = "lotteryResult";
  lottery.innerHTML =
    '<div id="lotteryReels" class="lottery-reels" aria-live="polite"><span><small>DESTINATION</small>?</span><span><small>TWIST</small>?</span><span><small>BUDGET</small>—</span></div><p id="lotteryRule" class="caption"></p>';
  document.querySelector(".roulette-details .box-label").after(lottery);
  renderLotteryInfo();
  // Replace the cramped two-column form with the three-panel assembly workspace.
  const build = $("screen-build");
  build.innerHTML = `<div class="workshop-heading"><div><p class="eyebrow">MISSION DESIGN / ASSEMBLY BAY</p><h1 class="heading" id="buildTitle">Build your <em>spacecraft.</em></h1><p class="lead" id="buildIntro"></p></div><details id="cheatPanel" class="cheat-popover"><summary>✧ Cheat sheet <span id="hintBadge">3</span></summary><div class="cheat-popover-card"><div class="popover-heading"><b>Engineering terminal</b><button type="button" id="closeCheat" aria-label="Close cheat sheet">×</button></div><p id="hintTerminalStatus" class="caption"></p><div id="cheatContent"></div><button type="button" class="btn small primary" id="requestHint">Request hint</button></div></details></div>
 <div id="missionTargets" class="mission-contract"></div><div id="fundingAlert" class="budget-alert" hidden role="status"><div><strong>Mission control transmission</strong><p id="fundingAlertText"></p></div><button class="btn small" id="dismissFunding" type="button">Got it</button></div>
 <div class="build-layout workshop-layout"><aside id="shelfPanel" class="workshop-panel shelf-panel"><div class="panel-title"><h2>Parts shelf</h2><span class="tag">DRAG OR TAP</span></div><div id="shelfTabs" class="shelf-tabs" aria-label="Part categories"></div><div id="shelfTarget"></div><div id="shelfParts" class="shelf-parts"></div><p class="caption shelf-help">Drag a part onto a matching slot, or tap it to fit. Tap an installed part to remove it.</p><div class="shelf-footer"><button class="btn small" id="fitViable" type="button">Load starter kit</button><button class="btn small ghost" id="resetParts" type="button">Clear</button></div><div class="shelf-message" id="costPopup" role="status"></div></aside>
 <section class="workshop-panel assembly-panel"><div class="panel-title"><h2>Assembly bay</h2><span id="destinationBadge" class="tag">MISSION</span></div><div class="ship-window blueprint" id="assemblyBlueprint"><div id="smallPlanet" aria-hidden="true"></div><div id="moduleSlots"></div></div><div class="fuel-panel"><div class="fuel-top"><b>Propellant load</b><strong id="fuelValue">100 kg</strong></div><input type="range" id="propellantLoad" min="0" max="250" step="5" value="100" aria-label="Propellant mass in kilograms"><p id="rocketEquation"></p></div><div class="assembly-tools"><button type="button" class="btn" id="openSettings">⚙ Configure systems</button><button type="button" class="btn ghost" id="testingGrant">⌁ Calibration lab</button></div><div class="qualification-block"><div class="subhead"><b>Qualification tests</b><span class="caption">Tap to fund a test</span></div><div id="campaignTests"></div></div><p class="caption" id="specialtyActive"></p></section>
 <aside class="workshop-panel dashboard-panel"><div class="panel-title"><h2>Mission dashboard</h2><span class="status-dot" title="Live calculations"></span></div><div class="budget-summary"><div><span>AVAILABLE GRANT</span><strong id="grantAmount">—</strong></div><span class="tag" id="twistBadge">STANDARD</span></div><div class="meters"><div class="meter"><div class="meter-head"><span>Budget spent</span><strong id="budgetText"></strong></div><div class="meter-track"><div id="budgetFill" class="meter-fill"></div></div></div><div class="meter"><div class="meter-head"><span>Launch mass</span><strong id="massText"></strong></div><div class="meter-track"><div id="massFill" class="meter-fill"></div></div></div><div class="meter"><div class="meter-head"><span>Power demand</span><strong id="powerText"></strong></div><div class="meter-track"><div id="powerFill" class="meter-fill"></div></div></div><div class="meter"><div class="meter-head"><span>Delta-v <small>(fuel to steer)</small></span><strong id="dvText"></strong></div><div class="meter-track"><div id="dvFill" class="meter-fill"></div></div></div></div><div class="stats"><div class="stat"><small>Science potential</small><strong id="scienceText">0</strong></div><div class="stat"><small>Downlink capacity</small><strong id="dataText">0</strong></div><div class="stat"><small>Energy reserve</small><strong id="batteryText">0</strong><span> Wh</span></div><div class="stat"><small>Budget remaining</small><strong id="creditsText">0</strong></div></div><div id="designMessage" class="validation" aria-live="polite"></div><button type="button" class="btn primary" id="launchBtn">Review spacecraft →</button><div class="dashboard-foot"><button type="button" class="text-button" id="rerollMission">← Assignment</button><button type="button" class="text-button" id="openCost">Cost details ↗</button></div><details class="mission-wire"><summary><span id="fundingClock">Funding wire</span></summary><p class="caption">Government reviews can arrive while you build. Hidden tabs pause time.</p><button type="button" class="btn small" id="pauseFunding">Practice pause</button><ol id="fundingLog"></ol></details><div id="marketInfo" class="sr-only"></div></aside></div>
 <dialog id="advancedPanel" class="systems-dialog" aria-labelledby="systemsHeading"><div class="panel-title"><div><p class="eyebrow">SUBSYSTEM CONFIGURATION</p><h2 id="systemsHeading">One decision at a time.</h2></div><button type="button" class="close-button" id="closeSettings" aria-label="Close system settings">×</button></div><div id="systemTabs" class="system-tabs"></div><div id="advancedSettings"></div><p id="engineeringReadout" class="model-readout"></p><button class="btn primary" id="finishSettings" type="button">Save & return to assembly</button></dialog>
 <dialog id="costDialog" class="systems-dialog" aria-labelledby="costHeading"><div class="panel-title"><h2 id="costHeading">Mission cost breakdown</h2><button class="close-button" type="button" id="closeCost" aria-label="Close cost breakdown">×</button></div><div id="budgetBreakdown" class="budget-breakdown"></div><p class="caption">Modeled mission-class USD costs; not supplier quotations.</p></dialog>`;
  $("launchBtn").onclick = beginFlight;
  $("resetParts").onclick = () => {
    if (campaignModalOpen()) return;
    selections = Object.fromEntries(keys.map((k) => [k, null]));
    campaign.secondInstrument = "";
    campaign.extras = [];
    campaign.extraSlots = ["", ""];
    campaign.reviewedFingerprint = "";
    renderDesign();
  };
  $("rerollMission").onclick = () => showScreen("map");
  $("fitViable").onclick = fitViableDesign;
  $("openSettings").onclick = () => {
    if (GameRules.isKid()) {
      window.Guidebook?.open("build");
      return;
    }
    $("advancedPanel").showModal();
    renderAdvanced();
  };
  for (const id of ["closeSettings", "finishSettings"])
    $(id).onclick = () => $("advancedPanel").close();
  $("openCost").onclick = () => $("costDialog").showModal();
  $("closeCost").onclick = () => $("costDialog").close();
  $("closeCheat").onclick = () => ($("cheatPanel").open = false);
  $("propellantLoad").oninput = (e) => {
    campaign.propellant = +e.target.value;
    campaign.reviewedFingerprint = "";
    renderDesign();
  };
  $("requestHint").onclick = requestBuildHint;
  $("dismissFunding").onclick = () => ($("fundingAlert").hidden = true);
  $("pauseFunding").onclick = () => {
    fundingPaused = !fundingPaused;
    $("pauseFunding").textContent = fundingPaused
      ? "Resume live funding"
      : "Practice pause";
    renderFundingClock();
  };
  $("testingGrant").onclick = () => {
    if ((campaign.calibrationAttempts || 0) >= 2) {
      $("costPopup").textContent =
        "Two calibration attempts per mission. Grant program closed.";
      return;
    }
    campaign.calibrationAttempts = (campaign.calibrationAttempts || 0) + 1;
    buildModal(
      "Sensor calibration lab",
      "One sensor disagrees with the others. Inspect its wiring and independent readings to earn a testing grant.",
      "Calibration compares a sensor reading with a known reference.",
      [
        [
          "Begin calibration",
          "Verify the faulty sensor to earn a 3% testing grant.",
          () =>
            startBuildNeedle("CALIBRATE SENSOR", (success) => {
              const delta = Math.round(grantStart * (success ? 0.03 : -0.01));
              MAX_BUDGET = Math.max(budgetFloor, MAX_BUDGET + delta);
              recordBuildDecision(
                "Calibration grant",
                success ? "Calibrated" : "Review needed",
                cash(Math.abs(delta)) +
                  (success ? " added to" : " removed from") +
                  " the grant.",
                success,
              );
            }),
        ],
        ["Back to assembly", "Attempt still counted.", closeCampaignModal],
      ],
    );
  };
  const bay = $("assemblyBlueprint");
  bay.ondragover = (e) => {
    e.preventDefault();
    bay.classList.add("drop-ready");
  };
  bay.ondragleave = () => bay.classList.remove("drop-ready");
  bay.ondrop = (e) => {
    bay.classList.remove("drop-ready");
    receiveShelfDrop(e);
  };
  window.addEventListener("keydown", (e) => {
    if (
      campaignModal.open &&
      modalDone &&
      e.key === "Enter" &&
      !/INPUT|TEXTAREA/.test(e.target.tagName)
    ) {
      e.preventDefault();
      modalDone();
    }
  });
}
function prepareLotteryReveal() {
  initMarket();
  assignmentMarketReady = true;
  $("missionDifficulty").textContent =
    "GOAL: " +
    selectedMission.requirements.science +
    " science potential\u2003\u2003" +
    selectedMission.requirements.returned +
    " returned\u2003\u2003" +
    selectedMission.requirements.months +
    " months";
  $("lotteryReels").classList.remove("rolling");
  $("lotteryReels").innerHTML =
    `<span><small>DESTINATION</small><b>${safeText(selectedMission.short)}</b></span><span><small>TWIST</small><b>${safeText(pendingTwist.name)}</b></span><span><small>BUDGET</small><b>${cash(MAX_BUDGET)}</b></span>`;
  renderLotteryInfo();
  if (assignmentSpins >= 3) $("spinBtn").disabled = true;
}
function acceptLotteryMission() {
  if (!assignmentMarketReady) initMarket();
  campaign.specialty = captain.specialty;
  const minimum = minimumDesign();
  if (Number.isFinite(minimum.cost)) {
    budgetFloor = Math.ceil(minimum.cost * 1.02);
    MAX_BUDGET = Math.max(MAX_BUDGET, budgetFloor);
  }
  renderDesign();
  showScreen("build");
}
function renderAdvanced() {
  const focusedChoice = document.activeElement?.closest?.(".tap-choices")?.id;
  const tabs = $("systemTabs");
  if (!tabs) return;
  tabs.innerHTML = Object.entries(settingGroups)
    .map(
      ([id, g]) =>
        `<button class="chip ${id === advancedGroup ? "selected" : ""}" type="button" aria-pressed="${id === advancedGroup}" data-system-group="${id}">${g.name}</button>`,
    )
    .join("");
  tabs.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        advancedGroup = b.dataset.systemGroup;
        renderAdvanced();
      }),
  );
  $("advancedSettings").replaceChildren();
  for (const key of settingGroups[advancedGroup].keys) {
    const config = engineeringCatalog[key],
      section = document.createElement("section");
    section.className = "system-choice";
    const title = document.createElement("h3");
    title.textContent = config.label.toLowerCase();
    const choices = document.createElement("div");
    choices.id = "eng-" + key;
    choices.setAttribute("aria-label", config.label);
    section.append(title, choices);
    $("advancedSettings").append(section);
    mountTapChoices(
      choices,
      config.opts.map((o) => ({ id: o[0], name: o[1], description: o[5] })),
      eng[key],
      (id) => {
        eng[key] = id;
        campaign.reviewedFingerprint = "";
        renderDesign();
      },
    );
  }
  if (focusedChoice && $("advancedPanel").open)
    document
      .getElementById(focusedChoice)
      ?.querySelector('[aria-checked="true"]')
      ?.focus();
}
function renderExpansion(d) {
  if (!d.life) return;
  const r = selectedMission.requirements;
  $("missionTargets").innerHTML =
    `<div><b>${safeText(selectedMission.goal)}</b><span>Mission goal</span></div><span><b>${r.science}</b> science</span><span><b>${r.downlink || 85}</b> downlink</span><span><b>${r.months}</b> months</span>`;
  $("engineeringReadout").textContent =
    `${setting("orbit")[1]}\u2003\u2003${d.period ? d.period + " min orbit" : "flyby"}\u2003\u2003Sunlight ×${d.solarFactor}\u2003\u2003Shadow ${d.eclipse} min\u2003\u2003Need ${d.requiredStorage} Wh storage.`;
  renderAdvanced();
  $("marketInfo").textContent =
    "Initial grant " +
    cash(grantStart) +
    ". Current grant " +
    cash(MAX_BUDGET) +
    ".";
  renderFundingClock();
}
function renderCampaign(d) {
  $("budgetBreakdown").insertAdjacentHTML(
    "beforeend",
    `<div class="exp-cost"><span>Propellant, payload & tests (included above)</span><span>${cash(d.campaignCost || 0)}</span></div>`,
  );
  if (campaign.skipCosts)
    $("budgetBreakdown").insertAdjacentHTML(
      "beforeend",
      `<div><span>Crew assistance fees</span><span>${cash(campaign.skipCosts)}</span></div>`,
    );
  renderShelf();
  renderModuleSlots();
  $("fuelValue").textContent = campaign.propellant + " kg";
  $("propellantLoad").value = campaign.propellant;
  $("rocketEquation").innerHTML =
    `<span>Δv = Isp\u2003\u2003g₀\u2003\u2003ln(wet / dry)</span><b>${d.isp} × 9.81 × ln(${d.mass}/${d.dryMass}) = ${d.dv} m/s</b>`;
  $("grantAmount").textContent = cash(MAX_BUDGET);
  $("twistBadge").textContent = campaign.twist.name;
  $("destinationBadge").textContent =
    selectedMission.short + "\u2003\u2003" + eng.orbit.toUpperCase();
  $("dvText").textContent = d.dv + " / " + d.dvNeed + " m/s";
  const fill = $("dvFill");
  fill.style.width = clamp((d.dv / Math.max(1, d.dvNeed)) * 100) + "%";
  fill.className = "meter-fill " + (d.dv < d.dvNeed ? "bad" : "");
  $("campaignTests").innerHTML = Object.entries({
    shake: ["Shake", "+5 hull\u2003\u2003reduced launch damage"],
    thermal: ["Thermal vacuum", "+5 energy\u2003\u2003less shadow drain"],
    radio: ["Radio check", "+8 signal\u2003\u2003easier link recovery"],
  })
    .map(
      ([k, [name, desc]]) =>
        `<button class="test-card ${campaign.tests[k] ? "selected" : ""}" type="button" data-test="${k}" aria-pressed="${campaign.tests[k]}"><b>${campaign.tests[k] ? "✓ " : ""}${name}</b><small>${desc}</small><span>${campaign.twist.freeTests ? "Free" : cash(10 * missionMultiplier())}</span></button>`,
    )
    .join("");
  $("campaignTests")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          campaign.tests[b.dataset.test] = !campaign.tests[b.dataset.test];
          campaign.reviewedFingerprint = "";
          renderDesign();
        }),
    );
  $("openSettings").textContent = GameRules.isKid()
    ? "Crew-managed systems / learn"
    : "⚙ Configure systems";
  $("fitViable").hidden = GameRules.isKid();
  $("resetParts").hidden = GameRules.isKid();
  $("specialtyActive").textContent =
    specialties[campaign.specialty].icon +
    " " +
    specialties[campaign.specialty].name +
    "\u2003\u2003" +
    specialties[campaign.specialty].desc;
  const errors = designErrors(d),
    fitted = keys.filter((k) => selections[k]).length;
  $("designMessage").className =
    "validation compact-validation " + (errors.length ? "bad" : "");
  $("designMessage").innerHTML =
    `<div class="readiness-summary"><b>${errors.length ? "Design in progress" : "Ready for rollout"}</b><span>${fitted}/6 fitted</span></div><div class="check-chips"><span class="${fitted === 6 ? "pass" : ""}">${fitted === 6 ? "✓" : "○"} Parts</span><span class="${d.cost <= MAX_BUDGET ? "pass" : ""}">${d.cost <= MAX_BUDGET ? "✓" : "○"} Budget</span><span class="${d.mass <= d.payload ? "pass" : ""}">${d.mass <= d.payload ? "✓" : "○"} Mass</span><span class="${d.supply >= d.power ? "pass" : ""}">${d.supply >= d.power ? "✓" : "○"} Power</span></div>${errors.length ? `<details><summary>${errors.length} checks to resolve</summary><ul>${errors.map((e) => `<li>${safeText(e)}</li>`).join("")}</ul></details>` : "<p>All mission requirements satisfied.</p>"}`;
  $("launchBtn").textContent = errors.length
    ? "Complete pre-flight checks"
    : "Review spacecraft →";
  $("launchBtn").disabled = !!errors.length;
  updateCheatPolicy();
}
function renderShelf() {
  const target = $("shelfTarget");
  if (!target) return;
  $("shelfTabs").innerHTML = shelfCategories
    .filter(
      (c) =>
        !GameRules.isKid() || ["solar", "battery", "science"].includes(c[0]),
    )
    .map(
      ([id, icon, name]) =>
        `<button class="chip ${selectedShelf === id ? "selected" : ""}" type="button" aria-pressed="${selectedShelf === id}" data-shelf="${id}">${icon} ${name}</button>`,
    )
    .join("");
  $("shelfTabs")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          selectedShelf = b.dataset.shelf;
          renderShelf();
          updateCheatPolicy();
        }),
    );
  target.innerHTML =
    selectedShelf === "science" && !GameRules.isKid()
      ? `<div class="fit-toggle"><button class="${scienceSlotTarget === "primary" ? "selected" : ""}" data-fit="primary" type="button">Primary instrument</button><button class="${scienceSlotTarget === "second" ? "selected" : ""}" data-fit="second" type="button">Second instrument</button></div>`
      : "";
  target.querySelectorAll("button").forEach(
    (b) =>
      (b.onclick = () => {
        scienceSlotTarget = b.dataset.fit;
        renderShelf();
      }),
  );
  const entries =
    selectedShelf === "extra"
      ? Object.entries(extraParts).map(([id, p]) => ({
          id,
          ...p,
          desc: p.note,
        }))
      : catalog[selectedShelf].opts.filter(
          (p, i) =>
            !GameRules.isKid() ||
            (selectedShelf === "solar" &&
            ["mars", "europa", "titan", "neptune"].includes(selectedMission.key)
              ? i >= 1
              : i < 2),
        );
  $("shelfParts").innerHTML = entries
    .map((p) => {
      const selected =
        selectedShelf === "extra"
          ? campaign.extras.includes(p.id)
          : selectedShelf === "science" && scienceSlotTarget === "second"
            ? campaign.secondInstrument === p.id
            : selections[selectedShelf] === p.id;
      const price =
        selectedShelf === "extra"
          ? p.cost
          : marketPrices[selectedShelf]?.[p.id] || 0;
      const local =
        selectedShelf === "solar"
          ? `<small>☀ ${Math.round(p.supply * (p.id.startsWith("rtg") ? 1 : sunlight[selectedMission.key]))} W at ${safeText(selectedMission.short)}</small>`
          : "";
      return `<button type="button" class="shelf-part ${selected ? "fitted" : ""}" draggable="true" data-shelf-part="${p.id}" aria-pressed="${selected}">${partIcon(selectedShelf, p.id)}<span class="part-copy"><strong>${p.name} <small class="part-grade">${p.grade || "Optional extra"}</small><em>${cash(price)}</em></strong><small>${p.desc}</small>${local}</span><span class="fitted-dot">${selected ? "✓" : "+"}</span></button>`;
    })
    .join("");
  $("shelfParts")
    .querySelectorAll("button")
    .forEach((b) => {
      b.onclick = () => installShelfItem(selectedShelf, b.dataset.shelfPart);
      b.ondragstart = (e) => {
        campaignDragging = {
          category: selectedShelf,
          id: b.dataset.shelfPart,
          slot: selectedShelf === "science" ? scienceSlotTarget : null,
        };
        e.dataTransfer.setData("text/plain", JSON.stringify(campaignDragging));
        e.dataTransfer.effectAllowed = "copy";
        document
          .querySelectorAll("[data-accept]")
          .forEach((slot) =>
            slot.classList.toggle(
              "compatible",
              slot.dataset.accept === selectedShelf,
            ),
          );
      };
      b.ondragend = () => {
        campaignDragging = null;
        document
          .querySelectorAll(".compatible,.drop-ready")
          .forEach((s) => s.classList.remove("compatible", "drop-ready"));
      };
    });
}
function installShelfItem(category, id, target) {
  if (campaignModalOpen()) return;
  if (
    GameRules.isKid() &&
    (!["solar", "battery", "science"].includes(category) || target === "second")
  )
    return;
  if (category === "extra") {
    if (!extraParts[id]) return;
    if (campaign.extras.includes(id)) {
      flashBuildMessage("That extra is already fitted.");
      return;
    }
    campaign.extraSlots ||= [
      campaign.extras[0] || "",
      campaign.extras[1] || "",
    ];
    const index =
      target === "extra2"
        ? 1
        : target === "extra1"
          ? 0
          : campaign.extraSlots.findIndex((value) => !value);
    if (index < 0 || index > 1) {
      flashBuildMessage(
        "Two extras maximum. Remove one from the blueprint first.",
      );
      return;
    }
    campaign.extraSlots[index] = id;
    campaign.extras = campaign.extraSlots.filter(Boolean);
    campaign.installs++;
    campaign.reviewedFingerprint = "";
    renderDesign();
    return;
  }
  if (
    category === "science" &&
    (target === "second" || (!target && scienceSlotTarget === "second"))
  ) {
    if (selections.science === id) {
      flashBuildMessage("Use a different instrument for the second payload.");
      return;
    }
    campaign.secondInstrument = id;
    campaign.installs++;
    campaign.reviewedFingerprint = "";
    renderDesign();
    return;
  }
  if (!catalog[category]?.opts.some((p) => p.id === id)) return;
  setShelfPart(category, id);
}
function flashBuildMessage(text) {
  $("costPopup").textContent = text;
}
function renderModuleSlots() {
  const definitions = [
    ["antenna", "antenna", "Antenna", "antenna"],
    ["solar", "solar", "Power", "solar"],
    ["science", "science", "Instrument", "science"],
    ["second", "science", "2nd instrument", "second"],
    ["battery", "battery", "Battery", "battery"],
    ["extra1", "extra", "Extra", "extra1"],
    ["extra2", "extra", "Extra", "extra2"],
    ["thruster", "thruster", "Engine", "thruster"],
    ["rocket", "rocket", "Launch vehicle", "rocket"],
  ];
  const root = $("moduleSlots");
  root.innerHTML =
    '<div class="bus-tile"><b>BUS</b><small>computer<br>+ frame</small></div><div class="mirrored-wing" aria-hidden="true">' +
    partIcon("solar", selections.solar) +
    "</div>" +
    definitions
      .map(([key, category, name, area]) => {
        const id =
          key === "second"
            ? campaign.secondInstrument
            : key === "extra1"
              ? campaign.extraSlots?.[0] || ""
              : key === "extra2"
                ? campaign.extraSlots?.[1] || ""
                : selections[key];
        const p = id
          ? category === "extra"
            ? extraParts[id]
            : catalog[category].opts.find((p) => p.id === id)
          : null;
        return `<button type="button" class="module-slot slot-${key} ${p ? "fitted" : ""}" style="grid-area:${area}" data-module="${key}" data-accept="${category}" aria-label="${name}: ${p ? p.name + ". Tap to remove." : "empty. Tap to choose."}">${p ? '<span class="slot-remove" aria-hidden="true">×</span>' + partIcon(category, id) + "<b>" + p.name + "</b>" : '<span class="empty-icon">' + (category === "extra" ? "+" : category === "science" ? "✧" : shelfCategories.find((c) => c[0] === category)?.[1] || "+") + "</span><b>" + name + "</b><small>" + (key === "second" || category === "extra" ? "optional" : "tap to fit") + "</small>"}</button>`;
      })
      .join("");
  root.querySelectorAll("[data-module]").forEach((b) => {
    const key = b.dataset.module;
    if (GameRules.isKid() && !["solar", "battery", "science"].includes(key)) {
      b.classList.add("cadet-locked");
      b.setAttribute(
        "aria-label",
        (b.getAttribute("aria-label") || "") + " Crew-managed system.",
      );
      b.onclick = () =>
        flashBuildMessage(
          "Your crew handles this system in Cadet mode. Choose the three essentials.",
        );
      return;
    }
    b.onclick = () => {
      if (key === "second" && campaign.secondInstrument) {
        campaign.secondInstrument = "";
        renderDesign();
        return;
      }
      if (key === "extra1" || key === "extra2") {
        const i = key === "extra1" ? 0 : 1;
        if (campaign.extraSlots?.[i]) {
          campaign.extraSlots[i] = "";
          campaign.extras = campaign.extraSlots.filter(Boolean);
          renderDesign();
          return;
        }
      } else if (selections[key]) {
        setShelfPart(key, null);
        return;
      }
      selectedShelf = b.dataset.accept;
      if (selectedShelf === "science")
        scienceSlotTarget = key === "second" ? "second" : "primary";
      renderShelf();
      $("shelfPanel").scrollIntoView({ block: "nearest", behavior: "smooth" });
      $("shelfParts").querySelector("button")?.focus();
    };
    b.ondragover = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (campaignDragging?.category === b.dataset.accept)
        b.classList.add("drop-ready");
    };
    b.ondragleave = () => b.classList.remove("drop-ready");
    b.ondrop = (e) => {
      e.stopPropagation();
      receiveShelfDrop(e, key);
    };
  });
}
function receiveShelfDrop(e, target) {
  e.preventDefault();
  let data;
  try {
    data = JSON.parse(e.dataTransfer.getData("text/plain"));
  } catch {
    return;
  }
  if (
    !data ||
    typeof data.id !== "string" ||
    ![...keys, "extra"].includes(data.category)
  )
    return;
  const expected =
    target === "second"
      ? "science"
      : target?.startsWith("extra")
        ? "extra"
        : target;
  if (expected && expected !== data.category) {
    flashBuildMessage("Choose a matching module slot.");
    return;
  }
  installShelfItem(data.category, data.id, target || data.slot);
  campaignDragging = null;
  document
    .querySelectorAll(".compatible,.drop-ready")
    .forEach((s) => s.classList.remove("compatible", "drop-ready"));
}
function updateCheatPolicy() {
  const host = $("cheatContent");
  if (!host) return;
  const active = campaignHintActive && buildSeconds < campaign.hintUntil;
  campaignHintActive = active;
  $("hintBadge").textContent = campaign.hintCharges;
  host.classList.toggle("terminal-offline", !active);
  if (active) {
    const key = selectedShelf === "extra" ? "solar" : selectedShelf,
      id = recommendation(key),
      p = catalog[key].opts.find((p) => p.id === id),
      hintKey =
        key +
        ":" +
        id +
        ":" +
        selectedMission.key +
        ":" +
        marketPrices[key][id];
    if (host.dataset.hintKey !== hintKey) {
      host.dataset.hintKey = hintKey;
      host.innerHTML = `<p class="hint-context">${safeText(catalog[key].label)} / ${safeText(selectedMission.short)}</p><p>${safeText(advice[key])}</p><div class="compact-suggestion"><b>Consider: ${safeText(p.name)}</b><span>${cash(marketPrices[key][id])}\u2003\u2003${safeText(p.desc)}</span><button type="button" class="text-button" id="fitHint">Fit this part →</button></div>`;
      $("fitHint").onclick = () => installShelfItem(key, id);
    }
  } else {
    host.dataset.hintKey = "";
    host.innerHTML =
      "<p>▒ LINK " +
      (campaign.hintCharges ? "STANDBY" : "RECOVERING") +
      "</p><small>Three short consultations. The flight checks always stay available.</small>";
  }
  $("hintTerminalStatus").textContent = active
    ? "Link stable\u2003\u2003" +
      Math.ceil(campaign.hintUntil - buildSeconds) +
      "s"
    : campaign.hintCharges
      ? campaign.hintCharges + " consultations available"
      : "Terminal cooling\u2003\u2003" +
        Math.max(0, Math.ceil(campaign.hintRecharge - buildSeconds)) +
        "s";
  $("requestHint").disabled = !campaign.hintCharges;
  $("requestHint").textContent = active
    ? "Refresh hint (" + campaign.hintCharges + " left)"
    : "Request hint";
}
function renderFundingClock() {
  if (!$("fundingClock")) return;
  const seconds = Math.floor(buildSeconds);
  $("fundingClock").textContent =
    `Funding wire\u2003\u2003${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}\u2003\u2003${fundingPaused ? "paused" : reviewCount >= fundingNoticeCap() ? "settled" : Number.isFinite(reviewAt) ? "next notice in " + Math.max(0, Math.ceil(reviewAt - buildSeconds)) + "s" : "incoming"}`;
}
initializeWorkshop();
