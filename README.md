# Little Orbit — Easy & Standard Crew Edition

The existing pixel fonts, white borders, dark space background, tap-card controls, three-panel workshop and compact cheat sheet are retained. The game remains browser-based HTML/CSS/JavaScript; the uploaded ASTRO SAVE Python/Pygame code was used as a reference for the walkable crew stage, not as a dependency or instructions to install Python.

## Run
Unzip and open `index.html` in a modern browser, or use VS Code Live Server. No installation or build is needed. Fonts are optional network resources with local fallbacks.

## First-step mode selection
- **Easy mode:** choose power, battery and science only, with two visible options per essential category. Antenna, propulsion and launcher are preinstalled and visibly crew-managed. Three short essential-part questions teach their purpose. Optional payloads and advanced configuration are handled by the crew. Mission requirements are gentler, deployment memory is shorter, emergencies allow more time, and there are fewer events and crew tasks. The remaining launch math question becomes a hands-on attitude task.
- **Standard mode:** full three-grade building, optional hardware and advanced settings. One arrival calculation remains, with a tappable popup calculator and optional assisted skip.

## Fixed hardware prices (millions of USD)
| Category | Low | Mid | High |
| --- | ---: | ---: | ---: |
| Solar / power | 225 | 450 | 1,220 |
| Battery | 132 | 284 | 407 |
| Science instrument | 322 | 522 | 827 |
| Communication antenna | 140 | 360 | 526 |
| Propulsion | 309 | 426 | 557 |
| Launch vehicle | 389 | 668 | 904 |

Optional parts: radiation vault $252M; thermal blanket $95M; star tracker $15M; backup computer $169M. Hardware baseline quotes are not randomly multiplied by destination. Bus, operations, testing and engineering still reflect mission scale. Specific build-news choices can change a supplier quote or launch deal. Grant floors are recalculated from valid designs under the current model. These are game prices supplied for this edition, not verified real-world bids.

## Assistance without traps
Games and crew tasks offer a clear assistance/skip option with the exact fee and resource consequences shown before confirmation. Launch assistance typically costs 1% of the initial grant, crew tasks 0.5%, and the full crew stage 2%, with a normal minimum fee of $5M. Easy mode softens resource penalties. Skipping an arcade game retains its stated resource penalties; no second hidden penalty is added. Assembly assistance fits a missing module or reviews an invalid design. If its fee would consume the minimum viable build allowance, the fee is reduced and commissioning risk replaces the unaffordable portion. Assistance fees, risks and delegations appear in the report and JSON export. After launch, paid assistance is refused when the remaining grant cannot cover the fee; the player must finish that task themselves.

## More relaxed build pacing
The funding wire is live: roughly once per active build minute (50–70 s in Standard, up to 10 notices; 70–90 s in Easy, up to 6) a random news event changes the grant. Examples include government budget cuts, supplier inflation, audit costs, state space agency co-funding, school sponsorships and foundation donations, plus one-off decisions such as a university payload, a rideshare offer or a supplier delay. Cuts never push the grant below the cheapest viable design; Diplomats and Easy mode halve cut sizes. The build panel shows a countdown to the next notice. Guidebook reading, open build dialogs, hidden tabs and Practice Pause stop the build clock. Essential-part questions in Easy mode are separate guided learning check-ins.

## Tappable calculator and permanent book
- **Popup calculator:** tap digits, operators, decimal, square root and parentheses; clear/backspace and Use Result are available. Typing is optional. Results copy into the current answer field without submitting it. A dedicated parser rejects arbitrary code and invalid results.
- **BOOK / GUIDANCE:** permanently available in the top bar and inside active game dialogs. Eight chapters explain how to play, building, prices and budgets, roles/teamwork, flight, tactics and terms in plain language. What Next adapts to the current stage. Reading pauses active gameplay timers.

## Fun games instead of a route maze
The old route-finding puzzle is removed. Its launch checkpoint is now a three-wave radar/debris shield drill. Power recovery, sensor investigation, rotating-wire radio repair, attitude control, deployment memory, arcade debris defense, thermal balance, scanning and orbital operations remain. Standard missions have three emergencies; Easy missions have two. The existing pixel layout is preserved.

## Walk inside your spacecraft: crew missions
After successful launch, enter a fictional six-room crew deck inspired by the pasted ASTRO SAVE demo. Easy mode has **three main objectives**; Standard mode has **five main objectives**. Your specialty changes the assignment. Optional SIDE missions can be completed separately and do not block the main mission.

- Walk with WASD/arrows, touch D-pad, or tap a floor destination. Walls and cabinets block movement.
- Press **M** to open the mission journal. Select a MAIN or SIDE card to read its story, objectives, progress and rewards. Track chooses the next station. Start / Go to Task walks the captain toward that station; it does not automatically solve the task.
- Approach a highlighted station, then use E/Space or Interact. Inspect the evidence, perform the visual action and verify the end state. Read-only objective checkboxes reflect verified work.
- Main mission rewards are **180 XP in Easy** and **300 XP in Standard**. Optional Quiet Hours awards **60 XP** and the optional stowage or garden mission awards **80 XP**, plus their listed badges. Every required objective must be completed without skipping to earn that mission’s XP and badge. Skipped work is visibly bypassed and does not earn XP or badges.
- Solo work uses more personal stamina. Crew support shares the workload and may improve verification/hull condition, but uses some ship energy. These are displayed game trade-offs, not physiological measurements.
- **Quiet Hours** is an optional rest-or-meal decision: solo rest gives **+8 stamina / −2 ship energy**; a shared meal gives **+12 stamina / −5 energy**. There is no extra normal task fee. Paid delegation is a separate assistance choice, with its own disclosed fee and risk.
- You can delegate an individual task or the entire interior stage using the displayed assistance offer. Movement pauses while using guidance, the mission journal, task dialogs or the calculator.

Five visual crew activities add variety:

| Activity | Player action | Learning idea |
| --- | --- | --- |
| Garden steward | Read leaf/root clues; choose water, light or airflow, then verify the response | Observe before acting; different symptoms need different care |
| Habitat air loop | Inspect the restricted training filter, use the alternate loop, fit a training cartridge and verify the CO₂ trend | Act on evidence, then verify the result; CO₂ removal does not create oxygen |
| Inventory hand-off | Catch or drag floating items into their matching labeled tethers/storage | Secured tools and checked labels help keep a microgravity workspace usable |
| Crew relay | Arrange command cards to match the visible received instruction and transmit the readback | Shared plans need a clear, verified readback |
| Observation window | Pan a camera to center the requested surface feature, capture it and check the labeled photo strip | Useful science photography needs accurate framing and traceable observations |

Crew completion, teamwork, stamina, verified mission rewards, skipped tasks and assistance fees are recorded in the journal/report. This remains one player working with NPC crewmates, not online multiplayer. Stamina, XP, badges, system indicators, resource effects, the ship layout and accelerated outcomes are fictional training mechanics. Nothing here is a real medical, life-support servicing, maintenance or docking procedure.

## Crew inspiration: six NASA/ESA sources
The permanent book’s **Crew & roles** chapter separates “Real inspiration” from “Game simplification” and links these primary sources:

1. [NASA — Environmental Control and Life Support Systems (ECLSS)](https://www.nasa.gov/reference/environmental-control-and-life-support-systems-eclss/): ventilation, air revitalization and water recovery/quality checks. The game does not teach real thresholds, chemicals or valves, and does not imply CO2 removal creates oxygen.
2. [NASA Science — VEG-03 plant research](https://science.nasa.gov/directorates/smd/astronauts-plant-seed-pillows-in-new-space-agriculture-study/): astronauts monitor seed pillows, add water when needed, photograph growth and retain samples. Game icons and instant growth effects are invented.
3. [NASA — ISS Daily Summary, January 4, 2024](https://www.nasa.gov/blogs/stationreport/2024/01/04/iss-daily-summary-report-1-04-2024/): maintenance, functional tests and asking ground specialists for the next step when a filter could not be removed. This is not a supplied repair or leak-isolation checklist.
4. [ESA — An astronaut’s rhythm](https://www.esa.int/articles/an-astronaut-s-rhythm): planning work, meals, exercise, relaxation and sleep around mission needs. This older article is not used to prescribe universal current hour counts; Quiet Hours rewards are game values.
5. [ESA — Increment-specific training](https://www.esa.int/articles/about-us/directorates/human-and-robotic-exploration/astronauts/increment-specific-training): crews practice distributed responsibilities and failure recovery tailored to qualifications. In-game role buffs are fictional.
6. [ESA — Training astronauts in space for ATV missions](https://blogs.esa.int/orion/2012/03/26/training-astronauts-in-space-for-atv-missions/): a historical account of astronauts monitoring automated approach with visual and system information and ground coordination. The pilot’s arrival-interlock task uses fictional checks inspired by monitored automation, not a real docking checklist or abort procedure. The separate observation-window game is science photography on invented terrain.

## Pass mark
A mission is **complete only when the final report score is 70 or higher**; any lower score is a failed mission. The score is the one shown in the report (science returned, spacecraft health, piloting accuracy, sudden-event response, budget discipline and stretch research, plus up to 6 bonus points from the debrief quiz), so answering the debrief quiz can lift a mission over the pass mark. A critical spacecraft failure is always a lost mission.

## Source
`game-rules.js/css` handles mode selection, exact price tiers, paid assistance and mode-specific rules. `crew-interior.js/css` is the walkable deck; `crew-mission-log.js/css` provides the selectable mission journal. `keypad-calculator.js/css` is the popup keypad. `guidebook.js/css` is the learning book. Existing workshop, launch, problem solver, operations, campaign and report modules remain.

## Verification and scientific scope
Scripted DOM/canvas tests cover mode selection, exact tier/extras prices, viable designs across 64 mode × role × destination combinations, guided essential questions, paid skips and minimum-grant assistance, role task sets, map collision/path movement, team/solo outcomes, mode-dependent crew task counts, popup calculator keys and errors, book access/pause and launch-to-crew integration. Guide-specific checks also cover the six linked crew sources, mode labels and mission-log instructions. Automated flows reach the report; they do not replace human playtesting. Syntax checks and CSS parsing pass. Browser visual testing was unavailable, so rendering and human difficulty tuning remain unverified.

This remains an educational game: budgets, hardware, crew habitat scale, stamina, costs, penalties and timelines are illustrative. Rocket-equation, two-body gravity and Kepler formulas are used in simplified contexts. The crew deck is a narrative training environment, not an engineering drawing of the small spacecraft bus. The arcade defense game is an abstraction; actual spacecraft avoid debris. No NASA endorsement or flight validation is implied.
