"use strict";
// A permanent, self-contained learning book. Its native dialog can sit above other game dialogs.
window.Guidebook = (() => {
  const el = (tag, cls, value) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (value !== undefined) n.textContent = value;
    return n;
  };
  const book = el("dialog", "orbit-guidebook");
  book.id = "orbitGuidebook";
  book.setAttribute("aria-labelledby", "guidebookTitle");
  const top = el("header", "guidebook-header"),
    heading = el("div");
  heading.append(
    el("p", "guidebook-kicker", "LITTLE ORBIT / LEARNING LIBRARY"),
  );
  const title = el("h2", "", "Your mission guide");
  title.id = "guidebookTitle";
  heading.append(title);
  const closeButton = el(
    "button",
    "btn small guidebook-close",
    "CLOSE GUIDE ×",
  );
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Close mission guide");
  top.append(heading, closeButton);
  const mode = el("p", "guidebook-mode"),
    layout = el("div", "guidebook-layout"),
    navigation = el("nav", "guidebook-tabs"),
    content = el("article", "guidebook-content");
  navigation.setAttribute("role", "tablist");
  navigation.setAttribute("aria-label", "Guide chapters");
  navigation.setAttribute("aria-orientation", "vertical");
  content.id = "guidebookChapter";
  content.setAttribute("role", "tabpanel");
  content.tabIndex = 0;
  const footer = el(
    "p",
    "guidebook-footer",
    "The book teaches the ideas. Your mission checklist always shows the requirements for your own spacecraft.",
  );
  layout.append(navigation, content);
  book.append(top, mode, layout, footer);
  document.body.append(book);
  let previousFocus = null,
    currentTab = "next";
  const kid = () =>
    Boolean(
      window.GameRules &&
      typeof window.GameRules.isKid === "function" &&
      window.GameRules.isKid(),
    );
  const screen = () => {
    try {
      return typeof currentScreen === "string" ? currentScreen : "create";
    } catch {
      return "create";
    }
  };
  const phaseNow = () => {
    try {
      return typeof phase === "string" ? phase : "";
    } catch {
      return "";
    }
  };
  const chapters = [
    ["next", "➜", "What next?"],
    ["start", "♥", "How to play"],
    ["build", "⚙", "Building essentials"],
    ["budget", "$", "Money & risks"],
    ["team", "✦", "Crew & roles"],
    ["flight", "▲", "Launch & operations"],
    ["tactics", "◈", "Good habits"],
    ["glossary", "?", "Word finder"],
  ];
  function card(icon, name, text, example) {
    return (
      '<section class="guidebook-card"><h4><span aria-hidden="true">' +
      icon +
      "</span> " +
      name +
      "</h4><p>" +
      text +
      "</p>" +
      (example
        ? '<p class="guidebook-example"><b>Try this idea:</b> ' +
          example +
          "</p>"
        : "") +
      "</section>"
    );
  }
  function banner(text) {
    return '<p class="guidebook-callout">' + text + "</p>";
  }
  function chapter(name, intro, body) {
    return (
      "<h3>" + name + '</h3><p class="guidebook-intro">' + intro + "</p>" + body
    );
  }
  function nextChapter() {
    const s = screen(),
      p = phaseNow();
    let name = "Meet your captain",
      text =
        "Choose a name, a look and a specialty. Looks are for fun; the specialty changes one helpful part of the mission.",
      steps = [
        "Pick a captain you like.",
        "Read the specialty cards and choose a useful skill.",
        "Enter mission control when you are ready.",
      ];
    if (s === "map" || s === "assign") {
      name = "Read your new assignment";
      text =
        "The lottery gives you a destination, a mission twist and a budget. There is no perfect assignment: each one asks you to solve a different problem.";
      steps = [
        "Spin the mission wheel and watch the three results.",
        "Read the science goal, mission length and special twist.",
        "Accept a mission you want to try. Rerolls are limited.",
      ];
    }
    if (s === "build") {
      name = "Build one working system at a time";
      text = kid()
        ? "Your mission has three main choices: power, battery and instrument. The other essential systems are fitted for you. Choose parts, look at the colored checks, and change one thing at a time."
        : "Start with the mission contract above the builder. Tap or drag parts from the shelf, then read the live checks. You can replace parts if a trade-off does not work.";
      steps = kid()
        ? [
            "Choose power that works at your destination.",
            "Choose a battery that covers the dark part of the orbit.",
            "Choose an instrument that can meet the science goal.",
          ]
        : [
            "Read the required science, mission life and destination.",
            "Fit the required parts; check power, mass, budget and maneuver reserve.",
            "Use Configure Systems for optional refinements, then run checks and review the final design.",
          ];
    }
    if (s === "flight" || s === "launch") {
      name = "Protect the spacecraft, then do useful work";
      text =
        "Read the current instruction before acting. During launch, the button changes with the job. During operations, power and radio contact decide how much science can come home.";
      steps = [
        "Launch: check the command, then ignite, solve the system problem or hold a burn as instructed.",
        "Operations: scan only over the target, stop when energy is low, and send the data home.",
        "An alert: inspect the evidence, protect essential equipment, then verify the repair.",
      ];
      if (p === "choose")
        text =
          "An emergency is asking for a decision. Read both choices and their resource costs. A safer choice may collect less science, but it can keep the spacecraft alive.";
    }
    if (typeof CrewInterior !== "undefined" && CrewInterior.active) {
      name = "Work with your onboard crew";
      text = kid()
        ? "Easy mode gives you three main objectives. Follow the highlighted stations, verify each result, and check on your crewmates. Optional side missions can wait."
        : "Standard mode gives you five main objectives. Your role changes the work, while optional side missions give you more chances to care for the crew and ship.";
      steps = [
        "Move with WASD, arrows, the D-pad, or tap a floor destination.",
        "Press M to open the mission journal. Select a mission, track an objective, then Start / Go to Task to walk toward its station.",
        "Stand near a station and press E or Interact. Inspect, act and verify; a skipped task does not earn XP.",
        "Choose solo work or crew help. Teamwork saves more personal stamina but uses ship energy.",
        "Quiet Hours is optional: rest alone or share a meal, then return to the main objectives.",
      ];
    }
    if (s === "result" || s === "report") {
      name = "Find one lesson for your next flight";
      text =
        "A partial mission is useful evidence. Your report records what helped and what hurt. Follow the resource chart and replay to find the first point where a margin became too small.";
      steps = [
        "Compare actual science and mission life with the contract.",
        "Tap a replay moment to see its cause and effect.",
        "Change one design choice and try again, or accept a new assignment.",
      ];
    }
    return chapter(
      name,
      text,
      banner(
        "No need to know space science first. Each check explains a job the spacecraft must be able to do.",
      ) +
        '<ol class="guidebook-steps">' +
        steps.map((x) => "<li>" + x + "</li>").join("") +
        '<div class="guidebook-card-grid">' +
        card(
          "⚙",
          "If a check is red",
          "Read its sentence. Change the part or setting related to that check, then look again. You do not need to change everything.",
          "A mass warning usually calls for lighter hardware or a launcher that can lift more.",
        ) +
        card(
          "?",
          "If a task is confusing",
          "Open the matching book chapter. Hints teach what matters; they do not build a perfect spacecraft for you. A paid skip is available where shown, but its fee and risk still count.",
        ) +
        "</div>",
    );
  }
  function startChapter() {
    return chapter(
      "A whole mission in six small jobs",
      kid()
        ? "You are the captain. Build a spacecraft, help it fly, and bring discoveries home. Try a choice, see what changes, and learn as you go."
        : "You lead a mission from the first idea to the final report. Every stage asks a different question, and your earlier choices help or limit what happens later.",
      '<div class="guidebook-card-grid">' +
        card(
          "♥",
          "1. Make a captain",
          "Choose a specialty. It gives a small advantage, such as lighter hardware or gentler budget cuts.",
        ) +
        card(
          "◉",
          "2. Get an assignment",
          "The lottery chooses a destination, a twist and a grant. Read the goal before shopping.",
        ) +
        card(
          "⚙",
          "3. Build and check",
          "Tap a part to install it, or drag it to the matching slot. The dashboard reacts immediately. Replacing a part changes the cost and performance.",
        ) +
        card(
          "▲",
          "4. Launch safely",
          "Follow the current command. Some jobs need timing; others need you to inspect, connect, balance or correct a system.",
        ) +
        card(
          "⌁",
          "5. Operate the mission",
          "Watch energy, scan useful targets, send data home and deal with alerts. A spacecraft can collect data faster than it can transmit it.",
        ) +
        card(
          "✦",
          "6. Learn from the report",
          "Explore your score, replay and resource chart. Good engineering means understanding why a choice worked.",
        ) +
        "</div>" +
        banner(
          kid()
            ? "Easy mode keeps the big ideas and reduces the number of decisions. The book stays available whenever you need it."
            : "Open this book at any stage, including inside launch, operations and crew challenges. Close it to return to the task you were doing.",
        ),
    );
  }
  function buildChapter() {
    return chapter(
      "Give every part a clear job",
      "A spacecraft is a team of small systems. A bigger number is only helpful if the rest of the spacecraft can support it.",
      '<div class="guidebook-card-grid">' +
        card(
          "☀",
          "Power makes electricity",
          "Solar arrays turn sunlight into electricity. Farther from the Sun, the same array makes less power. A radioisotope power source supplies steady power without sunlight, but it is costly and adds mass.",
          "An array that works near Earth may be too weak near Neptune.",
        ) +
        card(
          "▣",
          "A battery saves energy for later",
          "Power is how fast electricity is used. Energy is how much is stored. The battery keeps equipment running in darkness; it does not create new electricity.",
          "A 100 W load uses 50 Wh during half an hour in shadow.",
        ) +
        card(
          "✧",
          "An instrument makes discoveries",
          "Cameras and spectrometers collect different information. Better instruments can add science potential, but often need more power, mass and data capacity.",
          "Buy enough science potential to meet the goal, then check whether you can power it and send its data.",
        ) +
        card(
          "⌁",
          "An antenna sends the discoveries home",
          "Collecting data and returning data are different jobs. A strong dish and useful ground contacts help send more data to Earth.",
          "A full data buffer means pause scanning and downlink, rather than keep collecting.",
        ) +
        card(
          "↑",
          "An engine changes motion",
          "Propellant is the material the engine uses to change speed or direction. More propellant gives more maneuver reserve, but also makes launch heavier.",
          "Extra fuel can forgive a correction mistake. Check that the launcher still lifts the wet mass.",
        ) +
        card(
          "▲",
          "A rocket lifts the whole stack",
          "The launcher must lift the spacecraft and its propellant. A larger rocket costs more. It cannot fix a power shortage or a weak antenna.",
          "Use a bigger launcher when the complete spacecraft is too heavy, not because its name sounds safer.",
        ) +
        "</div>" +
        '<section class="guidebook-card"><h4>⚖ Read the four margins</h4><p><b>Money:</b> spending must fit the grant. <b>Mass:</b> the rocket must lift the stack. <b>Power:</b> supply must cover active equipment. <b>Maneuvers:</b> the fuel and engine must cover the planned changes in speed.</p><p>A small reserve in each area gives you room to recover from surprises. Passing a check is the start of planning, not a promise that nothing can go wrong.</p></section>' +
        banner(
          "The shelf, blueprint and live checklist are linked. Tap a fitted part to inspect or remove it. Use the second instrument or extras only when their benefit is worth their added load.",
        ),
    );
  }
  function priceTable() {
    const rows = [
      ["☀ Solar power", "$225M", "$450M", "$1,220M"],
      ["▣ Battery", "$132M", "$284M", "$407M"],
      ["✧ Science instrument", "$322M", "$522M", "$827M"],
      ["⌁ Antenna", "$140M", "$360M", "$526M"],
      ["↑ Propulsion", "$309M", "$426M", "$557M"],
      ["▲ Launch vehicle", "$389M", "$668M", "$904M"],
    ];
    return (
      '<section class="guidebook-card"><h4>Hardware quote card</h4><p>These are the game’s fixed hardware quotes. <b>M means million U.S. dollars.</b> A $1,220M quote is $1.22 billion. Hardware quotes do not change just because the destination changes. The full mission also pays for its bus, operations and reserve.</p><div class="guidebook-table-wrap"><table class="guidebook-prices"><caption>Fixed game hardware prices</caption><thead><tr><th scope="col">System</th><th scope="col">Low tier</th><th scope="col">Mid tier</th><th scope="col">High tier</th></tr></thead><tbody>' +
      rows
        .map(
          (r) =>
            "<tr>" +
            r
              .map((v, i) =>
                i ? "<td>" + v + "</td>" : '<th scope="row">' + v + "</th>",
              )
              .join("") +
            "</tr>",
        )
        .join("") +
      '</tbody></table></div><p><b>Optional extras:</b> radiation vault $252M\u2003\u2003thermal blanket $95M\u2003\u2003star tracker $15M\u2003\u2003backup computer $169M.</p><p class="guidebook-muted">These are teaching-game prices, not supplier quotations or NASA cost estimates.</p></section>'
    );
  }
  function budgetChapter() {
    return chapter(
      "Spend on the mission, keep a way out",
      "The grant pays for the whole project. The cheapest spacecraft is not always useful, and the most expensive one is not always the best fit.",
      '<div class="guidebook-card-grid">' +
        card(
          "$",
          "Keep some money uncommitted",
          "A reserve is a planned cushion for work you cannot predict. It can help absorb changing funding or a repair.",
          "Before adding a second instrument, ask whether you can still afford the launch and operations.",
        ) +
        card(
          "⚠",
          "Skip means pay and accept risk",
          "A skip can move you past a task, but it uses mission money and may reduce hull, energy or fuel. Read the exact fee and consequence shown before choosing it. Easy mode softens the resource risk.",
          "If paying would break the budget, solve or retry the task instead. A skip is a rescue option, not free progress.",
        ) +
        card(
          "⌛",
          "Surprises have breathing room",
          "Build notices arrive slowly so you have time to think. Standard mode allows at most two notices, with the first after about 2–3 active minutes and at least 90 seconds between notices. Easy mode allows one notice, after about 3–4 active minutes. They are not forced just because you try to launch.",
        ) +
        card(
          "✚",
          "Read both sides of an offer",
          "A partner may add money and a payload. An untested supplier may save money and leave a flight risk. A repair costs money now but can protect the mission later.",
          "“More funding” is not automatically better if its extra mass makes the spacecraft too heavy.",
        ) +
        "</div>" +
        priceTable(),
    );
  }
  function crewLifeGuide() {
    const tasks =
      '<div class="guidebook-card-grid">' +
      card(
        "☀",
        "Garden steward",
        "Inspect the leaf and root clues before choosing water, a grow light or the circulation fan. Match the care to the observed need, then verify the plant’s response. Adding water is not the answer to every symptom.",
        "The leaf clues, instant growth and responses are invented training cues. Actual plant care follows the specific experiment plan.",
      ) +
      card(
        "↻",
        "Habitat air loop",
        "On the fictional training board, inspect the restricted filter, use the alternate loop, fit the replacement training cartridge and verify the improving CO₂ trend. A completed action still needs a result check.",
        "A carbon-dioxide filter does not make oxygen. These are game interactions, not real life-support servicing instructions.",
      ) +
      card(
        "▣",
        "Inventory hand-off",
        "Catch a floating item by tapping it, then choose its matching tether or storage location. You can also drag it into the labeled restraint. Verify that every item is secured and the cabin passage is clear.",
        "The floating icons, storage hardware and instant results are fictional. They are not a real spacecraft stowage procedure.",
      ) +
      card(
        "⌁",
        "Crew relay",
        "Read Mission Control’s visible instruction, arrange the command cards in the same order and transmit the readback. You can remove or rearrange cards before checking the result.",
        "This puzzle practices a clear shared plan, not wire repair or memory under a timer. Its command cards are not a real radio protocol.",
      ) +
      card(
        "◈",
        "Observation window",
        "Read the requested surface feature, pan the camera until it is inside the center reticle, then capture the image. Check the labeled photo strip and frame the next target.",
        "The terrain and aiming limits are invented training features, not live orbital imagery. This is science photography, not a docking procedure.",
      ) +
      card(
        "♥",
        "Quiet Hours: rest or share a meal",
        "This side mission is optional. A solo rest restores 8 personal stamina and uses 2 ship energy; a shared meal restores 12 stamina and uses 5 energy. Choose based on your remaining reserves.",
        "These meter changes are invented game values, not health advice or real crew power-use estimates.",
      ) +
      "</div>";
    return (
      '<section class="guidebook-card"><h4>Read your crew mission journal</h4><p><b>Easy:</b> three main objectives. <b>Standard:</b> five main objectives. Press <b>M</b> to open the journal. MAIN missions show required work; SIDE missions are optional. Select a mission to read its story, objectives, progress and reward. Track chooses the next station; Start / Go to Task walks your captain there. You still interact at the station to do the work.</p><p>Checkboxes show verified outcomes; they are not buttons for claiming completion. Complete every required objective without skipping to earn that mission’s XP and badge. Easy main missions award 180 XP; Standard main missions award 300 XP. Quiet Hours awards 60 XP and the optional stowage or garden mission awards 80 XP when their objectives are verified. A bypassed task stays visibly marked, and a mission containing skipped required work earns no XP or badge.</p></section>' +
      '<section class="guidebook-card"><h4>✦ Work with a crewmate or work solo</h4><p>Solo work spends more of your personal stamina. Crew support shares the workload and can improve verification, but uses some ship energy. Check both meters before deciding. You remain one player directing NPC crewmates; this is not networked multiplayer.</p><p>Quiet Hours gives you a separate, optional rest-or-meal decision. It has no extra normal task fee; its displayed energy cost is the trade-off. Paid delegation, where offered, is a different assistance choice and keeps its stated fee and risk.</p></section>' +
      tasks +
      banner(
        "Real inspiration is linked below. The deck, role buffs, task diagrams, stamina, XP, badges, energy costs and accelerated outcomes are fictional training mechanics. They are not medical advice, real spacecraft servicing instructions or docking procedures.",
      )
    );
  }
  function crewSources() {
    const sources = [
      [
        "NASA — Environmental Control and Life Support Systems (ECLSS)",
        "https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/",
        "ECLSS manages ventilation, atmospheric conditions and water supply. Air revitalization removes carbon dioxide and trace contaminants; oxygen generation is a separate function. Recovered water is processed and checked before use.",
        "The air-loop matching cards, status icons and outcomes are invented. No real thresholds, chemical recipes or valve instructions are taught.",
      ],
      [
        "NASA Science — VEG-03 plant research",
        "https://science.nasa.gov/directorates/smd/astronauts-plant-seed-pillows-in-new-space-agriculture-study/",
        "In the cited VEG-03 experiment, astronauts monitor plants in seed pillows, add water when needed and photograph growth. Some material is eaten and other samples are kept for analysis. Plants can support nutrition and morale.",
        "The garden’s moisture icons, instant changes, sample choices and scoring are fictional. A few minutes of play do not represent actual plant growth times.",
      ],
      [
        "NASA — ISS Daily Summary, January 4, 2024",
        "https://www.nasa.gov/blogs/stationreport/2024/01/04/iss-daily-summary-report-1-04-2024/",
        "This report describes maintenance, filter work and functional testing. When one filter could not be removed, ground specialists planned the next step rather than the crew forcing it.",
        "The inventory and verification puzzles are generic, low-stakes abstractions. They do not provide ISS maintenance, leak-isolation or filter-replacement procedures.",
      ],
      [
        "ESA — An astronaut’s rhythm",
        "https://www.esa.int/articles/an-astronaut-s-rhythm",
        "Light, noise, workload and stress can disturb sleep. ESA describes planned time for work, meals, exercise, privacy, relaxation and sleep, with schedules adjusted around mission needs.",
        "Quiet Hours stamina and ship-energy values are game design choices. This older article is not used to prescribe current universal work-hour or sleep rules.",
      ],
      [
        "ESA — Increment-specific training",
        "https://www.esa.int/articles/about-us/directorates/human-and-robotic-exploration/astronauts/increment-specific-training",
        "Prime and backup crews train together, practice distributed roles and prepare for failure analysis and recovery. Training depends on each astronaut’s tasks and qualifications.",
        "Role buffs, handover puzzles, NPC assistance and XP are invented. In-game specialist labels do not substitute for real qualifications.",
      ],
      [
        "ESA — Training astronauts in space for ATV missions",
        "https://blogs.esa.int/orion/2012/03/26/training-astronauts-in-space-for-atv-missions/",
        "This historical ATV article describes refresher training and two astronauts monitoring an automated approach with visual and system information, coordinated with ground teams.",
        "The pilot’s arrival-interlock task borrows the idea of monitored automation, but uses fictional checks and no real abort limits. The separate observation-window task is a camera-framing game, not docking.",
      ],
    ];
    return (
      '<h4>Real inspiration / game simplification</h4><p class="guidebook-intro">These six NASA and ESA sources explain the ideas behind crew activities. They describe different missions and dates, not one set of procedures for every spacecraft.</p><div class="guidebook-card-grid">' +
      sources
        .map(
          ([name, url, fact, fiction]) =>
            '<section class="guidebook-card"><h4><a href="' +
            url +
            '" target="_blank" rel="noopener noreferrer">' +
            name +
            " ↗</a></h4><p><b>Real inspiration:</b> " +
            fact +
            "</p><p><b>Game simplification:</b> " +
            fiction +
            "</p></section>",
        )
        .join("") +
      "</div>"
    );
  }
  function teamChapter() {
    return chapter(
      "A spacecraft mission needs different kinds of thinking",
      "Your captain’s specialty is a useful boost. Teamwork also means checking each other’s decisions, even when one person plays all the roles.",
      '<div class="guidebook-card-grid">' +
        card(
          "⚙",
          "Engineer",
          "The spacecraft bus is 15 kg lighter. Use that room for a needed part or more maneuver reserve. A mass bonus does not make extra equipment free.",
        ) +
        card(
          "✧",
          "Scientist",
          "Instruments provide 10% more science potential. Make sure the power and downlink can support the observations you plan.",
        ) +
        card(
          "▲",
          "Pilot",
          "Timing windows are 25% wider. You still need to read the command and act at the useful moment.",
        ) +
        card(
          "⌁",
          "Diplomat",
          "Government budget cuts are halved. This protects some funding, but cannot erase the costs of hardware or mistakes.",
        ) +
        '</div><section class="guidebook-card"><h4>♥ Work like a mission team</h4><ol class="guidebook-steps"><li><b>Planner:</b> read the goal out loud and decide which requirement matters most.</li><li><b>Builder:</b> fit the parts, then explain each big cost or mass change.</li><li><b>Checker:</b> look for red checks, missing equipment and small reserves.</li><li><b>Operator:</b> repeat the command, act, then confirm that the system responded.</li></ol><p>When playing together, take turns at the controls and ask the next person to explain the plan. A crew challenge is a chance to coordinate; it is not a reason to rush someone who is learning.</p></section>' +
        crewLifeGuide() +
        crewSources(),
    );
  }

  function flightChapter() {
    return chapter(
      "Read, act, verify",
      "The action button is not always asking for the same thing. Read the task above it, then check the result before continuing.",
      '<div class="guidebook-card-grid">' +
        card(
          "▲",
          "Ignition and launch",
          "Wait for the ignition instruction. Through ascent, protect essential systems and follow the stage task. Staging removes an empty booster; the fairing protects the spacecraft until the air is thin.",
        ) +
        card(
          "◯",
          "Orbit is sideways motion",
          "A spacecraft in orbit keeps falling around the planet. A forward burn near the high point can raise the low point. Hold BURN only while the task calls for it, then release and check the path.",
          "Periapsis is the low point. If it is inside the atmosphere, the orbit still needs help.",
        ) +
        card(
          "↗",
          "Transfers need an appointment",
          "A planet keeps moving while your spacecraft travels. The departure plan aims where the destination will be when you arrive, not where it is now.",
        ) +
        card(
          "↘",
          "Arrival needs braking",
          "Arriving too fast can send you past a destination. A capture burn slows you enough to remain nearby. If the task includes a calculation, use the workpad and calculator, then compare the result with the asked unit.",
        ) +
        card(
          "✧",
          "Scan something useful",
          "Hold SCAN over the marked observation zone. Scanning away from the target still uses energy. Watch the battery and data buffer instead of holding the button all the time.",
        ) +
        card(
          "⌁",
          "Bring the data home",
          "Use Downlink, or D when the controls allow it, to send stored observations. A strong antenna helps; a data buffer still needs contact time to empty.",
        ) +
        '</div><section class="guidebook-card"><h4>⚠ Alerts are small investigations</h4><p><b>Power bus:</b> remove optional loads and protect essentials. <b>Sensor fault:</b> compare readings with physical evidence. <b>Radio repair:</b> trace the connected path rather than rotating tiles at random. <b>Debris shield:</b> protect the exposed spacecraft section as instructed. <b>Attitude:</b> align the thrust arrow before spending a pulse.</p><p>Some tasks are self-paced. Others show a timer. The displayed instruction and countdown tell you which kind you are playing.</p></section>',
    );
  }
  function tacticsChapter() {
    return chapter(
      "Small habits make a more reliable mission",
      "A good tactic is a way to think, not a secret list of perfect parts.",
      '<div class="guidebook-card-grid">' +
        card(
          "1",
          "Start with the contract",
          "Ask what the mission must do. A relay mission and a mapping mission may need different strengths.",
        ) +
        card(
          "2",
          "Change one thing, read the effect",
          "After a change, check money, mass and power together. You will see the trade-off more clearly than after changing five parts at once.",
        ) +
        card(
          "3",
          "Treat reserve as useful equipment",
          "A little spare power, money or propellant can let you solve a surprise. Spending every last unit is a deliberate risk.",
        ) +
        card(
          "4",
          "Follow evidence during repairs",
          "Inspect before isolating, trace before reconnecting, and verify before resuming. A high reading alone does not prove the whole system is hot.",
        ) +
        card(
          "5",
          "Use the hint terminal as a tutor",
          "The terminal has limited consultations and recovery time. Write down the principle you learned. Required pre-flight checks remain available even when the hint terminal is recovering.",
        ) +
        card(
          "6",
          "Review the first bad moment",
          "In the report, find where a resource first dropped sharply. Decide whether a design choice or an operating action would have helped most.",
        ) +
        "</div>" +
        banner(
          "Example: if the battery empties during shadow, first compare stored energy with dark-time demand. A larger camera is unlikely to solve that problem. You might need more storage, less instrument duty, or better power planning.",
        ),
    );
  }
  function glossaryChapter() {
    const words = [
      ["Budget", "The money available for the whole mission."],
      [
        "Bus",
        "The spacecraft’s basic frame, computer and shared systems. It is not the rocket.",
      ],
      [
        "Mass",
        "How much material the spacecraft carries. The launcher has a mass limit.",
      ],
      [
        "Wet mass / dry mass",
        "Wet mass includes propellant. Dry mass is the spacecraft without that propellant.",
      ],
      [
        "Power (W)",
        "The rate at which a system makes or uses electricity. Think of how fast a tank fills or drains.",
      ],
      [
        "Energy (Wh)",
        "Stored electricity. A 100 W device uses 100 Wh in one hour.",
      ],
      [
        "Science potential",
        "What the instrument could achieve if the spacecraft powers it and returns its data.",
      ],
      ["Downlink", "Sending data from the spacecraft back to Earth."],
      ["Data buffer", "Temporary storage for observations waiting to be sent."],
      [
        "Duty cycle",
        "The share of time a system is active. Lower duty can save power and collect less data.",
      ],
      ["Propellant", "Material expelled by an engine to change motion."],
      [
        "Delta-v / Δv",
        "The spacecraft’s ability to change speed or direction, measured in metres per second.",
      ],
      ["Orbit", "A path created by gravity and sideways motion around a body."],
      ["Periapsis", "The closest or lowest point in an orbit."],
      ["Apoapsis", "The farthest or highest point in an orbit."],
      [
        "Eclipse / shadow",
        "The part of a path where the planet blocks sunlight.",
      ],
      [
        "RTG",
        "A device that turns heat from radioactive decay into electricity. It is not a solar panel.",
      ],
      [
        "Attitude",
        "Which way the spacecraft is pointing, not where it is located.",
      ],
      [
        "Redundancy",
        "A backup path or component that can help after a failure.",
      ],
      [
        "Safe mode",
        "A reduced-activity state that protects essential systems, often pausing science.",
      ],
      [
        "Contingency reserve",
        "Money held for uncertain work, changes or repairs.",
      ],
      [
        "M / B",
        "M means million dollars; B means billion dollars. $1,000M equals $1B.",
      ],
    ];
    return chapter(
      "Space words in everyday language",
      "You can learn these one at a time. The job a word describes matters more than memorizing it.",
      '<dl class="guidebook-glossary">' +
        words
          .map(([w, d]) => "<div><dt>" + w + "</dt><dd>" + d + "</dd></div>")
          .join("") +
        "</dl>",
    );
  }
  const renderers = {
    next: nextChapter,
    start: startChapter,
    build: buildChapter,
    budget: budgetChapter,
    team: teamChapter,
    flight: flightChapter,
    tactics: tacticsChapter,
    glossary: glossaryChapter,
  };
  function select(tab, focusTab = false) {
    currentTab = renderers[tab] ? tab : "next";
    for (const b of navigation.querySelectorAll("[data-guidebook-tab]")) {
      const active = b.dataset.guidebookTab === currentTab;
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    }
    content.setAttribute("aria-labelledby", "guidebook-tab-" + currentTab);
    content.innerHTML = renderers[currentTab]();
    content.scrollTop = 0;
    mode.textContent = kid()
      ? "♥ EASY MODE\u2003\u2003Short steps, fewer choices, the same big adventure."
      : "✦ STANDARD MODE\u2003\u2003Learn the reason behind each choice.";
    if (focusTab)
      navigation
        .querySelector('[data-guidebook-tab="' + currentTab + '"]')
        ?.focus();
  }
  for (const [id, icon, label] of chapters) {
    const b = el("button", "", icon + " " + label);
    b.type = "button";
    b.id = "guidebook-tab-" + id;
    b.dataset.guidebookTab = id;
    b.setAttribute("role", "tab");
    b.setAttribute("aria-controls", content.id);
    b.addEventListener("click", () => select(id));
    navigation.append(b);
  }
  function open(tab = "next") {
    if (!book.open) previousFocus = document.activeElement;
    select(tab);
    if (!book.open) {
      book.showModal();
      window.dispatchEvent(new CustomEvent("guidebook:open"));
    }
    closeButton.focus();
  }
  function close() {
    if (book.open) book.close();
  }
  closeButton.addEventListener("click", close);
  book.addEventListener("close", () => {
    window.dispatchEvent(new CustomEvent("guidebook:close"));
    if (previousFocus?.isConnected)
      previousFocus.focus({ preventScroll: true });
    previousFocus = null;
  });
  book.addEventListener("cancel", (e) => {
    e.preventDefault();
    close();
  });
  // Consume game-control keys while reading. Native button/Tab/Escape behavior remains available.
  window.addEventListener(
    "keydown",
    (e) => {
      if (!book.open) return;
      const target = e.target,
        tab = target?.dataset?.guidebookTab;
      if (
        tab &&
        [
          "ArrowDown",
          "ArrowUp",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        const i = chapters.findIndex((c) => c[0] === tab);
        const n =
          e.key === "Home"
            ? 0
            : e.key === "End"
              ? chapters.length - 1
              : (i +
                  (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1) +
                  chapters.length) %
                chapters.length;
        e.preventDefault();
        select(chapters[n][0], true);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      e.stopImmediatePropagation();
    },
    true,
  );
  window.addEventListener(
    "keyup",
    (e) => {
      if (book.open) e.stopImmediatePropagation();
    },
    true,
  );
  const toggle = el("button", "tinybtn guidebook-toggle", "GUIDE");
  toggle.type = "button";
  toggle.id = "guidebookToggle";
  toggle.setAttribute("aria-haspopup", "dialog");
  toggle.setAttribute("aria-controls", book.id);
  toggle.addEventListener("click", () => open());
  const bar =
    document.querySelector(".topactions") ||
    document.querySelector(".topbar") ||
    document.body;
  const sound = document.getElementById("soundToggle");
  bar.insertBefore(toggle, sound?.parentNode === bar ? sound : null);
  function addDialogAccess() {
    document
      .querySelectorAll(
        "dialog[open], .mini-overlay.active .mini-dialog, .overlay.active .overlay-box, .game-help-modal.active .game-help-inner",
      )
      .forEach((host) => {
        if (
          host === book ||
          host.closest("#orbitGuidebook") ||
          host.querySelector("[data-open-guidebook]")
        )
          return;
        const b = el("button", "btn small guidebook-modal-link", "GUIDE");
        b.type = "button";
        b.dataset.openGuidebook = "true";
        b.setAttribute("aria-haspopup", "dialog");
        b.addEventListener("click", () => open());
        host.prepend(b);
      });
  }
  const observer = new MutationObserver(addDialogAccess);
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open", "class"],
  });
  addDialogAccess();
  return {
    open,
    close,
    get active() {
      return book.open;
    },
    get isOpen() {
      return book.open;
    },
    get chapter() {
      return currentTab;
    },
  };
})();
