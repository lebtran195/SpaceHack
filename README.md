# Little Orbit: Easy & Standard Crew Edition

**Design a spacecraft, launch a mission, and work with your crew to solve problems in space.**

In Little Orbit, you become a mission designer and spacecraft captain. Choose your equipment, prepare for launch, respond to unexpected problems, and explore a spacecraft with computer-controlled crewmates. Every decision matters: a stronger science instrument might collect better data, but it could also cost more, add mass, and use extra power.

Along the way, you’ll explore ideas from **science, technology, engineering, and mathematics (STEM)** through hands-on challenges. Experiment with different designs, learn from setbacks, and use your final mission report to discover what worked and what you could improve.

Created for the **NASA Space Apps Challenge 2026: Space Mission Design Game**, Little Orbit brings mission planning, resource management, and teamwork into one browser-based adventure.

## Contents

- [1. Open the Game](#1-open-the-game)
- [2. Choose Your Difficulty](#2-choose-your-difficulty)
- [3. Understand Your Mission](#3-understand-your-mission)
- [4. Get Help While Playing](#4-get-help-while-playing)
- [5. Build Your Spacecraft](#5-build-your-spacecraft)
- [6. Complete Launch and Flight Challenges](#6-complete-launch-and-flight-challenges)
- [7. Explore the Crew Deck](#7-explore-the-crew-deck)
- [8. Use Assistance When You Need It](#8-use-assistance-when-you-need-it)
- [9. Finish and Review Your Mission](#9-finish-and-review-your-mission)
- [10. What Comes From Real Space Science?](#10-what-comes-from-real-space-science)
- [11. Project and Developer Information](#11-project-and-developer-information)

## 1. Open the Game

1. Extract the ZIP file into a folder.
2. Open the extracted folder.
3. Open `index.html` in a modern web browser.

Keep all the game files together in the extracted folder.

You do not need to install Python, download extra software, or build the project. If you already use Visual Studio Code, you can also open the game with **Live Server**.

The game can use online fonts, but built-in fonts are available when those cannot load.

## 2. Choose Your Difficulty

### Easy Mode: Start Here if You Are New

Easy mode guides you through the main decisions.

- Choose your **power system, battery, and science instrument**, with two options for each.
- Your crew manages the antenna, propulsion system, and launch vehicle, which are already installed.
- Answer three short questions about what the essential parts do.
- Let the crew handle optional equipment and advanced settings.
- Play with gentler mission requirements, shorter deployment memory challenges, more time for emergencies, and fewer events and crew tasks.
- Complete a hands-on spacecraft-pointing task instead of the remaining launch math question.

### Standard Mode: Take More Control

Standard mode gives you more decisions to make.

- Choose from three equipment levels.
- Select optional hardware and advanced settings.
- Complete one calculation during arrival, using the pop-up calculator if needed.
- Choose assisted skipping when it is offered.
- Handle more emergencies and crew objectives.

## 3. Understand Your Mission

You will build your spacecraft, complete launch and flight challenges, work through crew tasks, and review your results.

Watch how your choices affect your money, equipment, and spacecraft resources. There is more than one way to build a useful mission.

Some helpful terms:

| Term | Meaning |
| --- | --- |
| **Grant** | The money available for your mission. |
| **Science instrument** | Equipment that collects observations or measurements. |
| **Payload** | Equipment carried to do the mission’s work. |
| **Propulsion** | The system that changes the spacecraft’s motion. |
| **Attitude control** | Controlling which direction the spacecraft points. |
| **Spacecraft bus** | The main structure and systems that support the mission equipment. |
| **XP** | Experience points earned by completing crew missions. |
| **NPC crewmates** | Computer-controlled characters who work with you. |

**This is a single-player game with NPC crewmates. It does not have online multiplayer.**

## 4. Get Help While Playing

### BOOK / GUIDANCE

You can open **GUIDE** from the top bar or from inside active game dialogs.

Its eight chapters explain playing the game, building, equipment prices, budgets, roles, teamwork, flight, tactics, and useful terms.

The **What Next** section changes to match your current stage.

**Reading the guide pauses active gameplay timers**, so you can take time to understand the instructions.

### Popup Calculator

The calculator lets you tap numbers and calculation buttons instead of typing.

It includes:

- Basic math operations.
- Decimals, square roots, and parentheses.
- Clear and backspace.
- **Use Result**, which copies the answer into the current answer box without submitting it.

The calculator checks expressions and rejects invalid results or text that tries to run code.

## 5. Build Your Spacecraft

Choose equipment that fits your mission and budget.

### Equipment Prices

All prices below are in **millions of US dollars**. For example, **225 means $225 million**.

These are game prices, not verified prices for real spacecraft equipment.

| Equipment | Low tier | Middle tier | High tier |
| --- | ---: | ---: | ---: |
| Solar / power system | 225 | 450 | 1,220 |
| Battery | 132 | 284 | 407 |
| Science instrument | 322 | 522 | 827 |
| Communication antenna | 140 | 360 | 526 |
| Propulsion system | 309 | 426 | 557 |
| Launch vehicle | 389 | 668 | 904 |

### Optional Equipment

| Equipment | Price |
| --- | ---: |
| Radiation vault | 252 |
| Thermal blanket | 95 |
| Star tracker | 15  |
| Backup computer | 169 |

The starting equipment prices are not randomly multiplied based on your destination. However:

- The spacecraft bus, operations, testing, and engineering costs still depend on the size and needs of the mission.
- Some news-event choices can change a supplier’s price or a launch deal.
- The game recalculates the minimum funding needed using designs that work under its current rules.

### Budget News During Building

While you are actively building, news events can change your grant.

| Mode | Time between notices | Maximum notices |
| --- | --- | ---: |
| Easy | 70-90 seconds | 6 |
| Standard | 50-70 seconds | 10 |

News may include budget cuts, rising supplier prices, audit costs, funding from a state space agency, school sponsorships, or foundation donations.

Some events ask you to make a one-time decision, such as accepting university equipment, sharing a launch, or responding to a supplier delay.

Funding cuts cannot take your grant below the cost of the cheapest workable design. Easy mode and the Diplomat role each halve cut sizes.

The build panel shows a countdown to the next notice. The build clock pauses when:

- You read the guidebook.
- A build dialog is open.
- The game’s browser tab is hidden.
- You use **Practice Pause**.

The three essential-part questions in Easy mode are separate learning check-ins.

## 6. Complete Launch and Flight Challenges

The game includes challenges about:

- Recovering power.
- Investigating sensor readings.
- Repairing a radio by rotating wires.
- Pointing the spacecraft.
- Remembering a deployment sequence.
- Defending against debris in an arcade game.
- Balancing temperature.
- Scanning.
- Operating in orbit.

The launch checkpoint uses a **three-wave radar and debris-shield drill**, replacing the older route-finding maze.

**Easy missions have two emergencies. Standard missions have three.**

## 7. Explore the Crew Deck

After a successful launch, you enter a fictional spacecraft interior with six rooms.

Your specialty changes your assignment.

- **Easy mode:** three main objectives.
- **Standard mode:** five main objectives.
- **SIDE missions:** optional activities that do not block the main mission.

### Move and Interact

| Action | Controls |
| --- | --- |
| Move | WASD, arrow keys, touch D-pad, or tap a floor destination |
| Open mission journal | `M` |
| Use a nearby station | `E`, `Space`, or **Interact** |

Walls and cabinets block your path.

Movement pauses while you use guidance, the mission journal, task dialogs, or the calculator.

### Use the Mission Journal

1. Press `M`.
2. Select a **MAIN** or **SIDE** mission card.
3. Read its story, objectives, progress, and rewards.
4. Choose **Track** to select the next station.
5. Choose **Start / Go to Task** to move your captain toward it.

**Going to a station does not complete the task automatically.**

At a highlighted station, interact with it, examine the clues, perform the activity, and check the result. Objective checkboxes update when the game verifies your work; you cannot tick them yourself.

### Crew Activities

| Activity | What you do | What it teaches |
| --- | --- | --- |
| **Garden steward** | Look at leaf and root clues, choose water, light, or airflow, then check the plant’s response. | Observe before acting. Different symptoms need different care. |
| **Habitat air loop** | Inspect a training filter with restricted airflow, use an alternate air loop, fit a training cartridge, and check how carbon dioxide levels change. | Use evidence and check your results. Removing carbon dioxide does not create oxygen. |
| **Inventory hand-off** | Catch or drag floating objects into matching labeled storage or tethers. | Secure tools and check labels in a low-gravity workspace. |
| **Crew relay** | Arrange command cards to match the received instruction, then send back your understanding of it. | Clear instructions need an accurate confirmation. |
| **Observation window** | Move the camera to center a requested surface feature, take a picture, and check the labeled photo strip. | Useful science photos need careful framing and clear records. |

### Earn XP and Badges

| Mission | XP reward |
| --- | ---: |
| Easy main mission | 180 |
| Standard main mission | 300 |
| Optional Quiet Hours mission | 60 |
| Optional stowage or garden mission | 80 |

Missions also award their listed badges.

To earn a mission’s XP and badge, complete every required objective without skipping. Skipped work is marked as bypassed and earns no XP or badges.

### Balance Stamina and Ship Energy

Working alone uses more of your personal stamina.

Crew support shares the work and may improve how thoroughly a task is checked or improve the condition of the spacecraft’s outer shell, called the **hull**. It also uses some ship energy.

These are game trade-offs, not measurements of real human health.

The optional **Quiet Hours** activity offers two choices:

| Choice | Stamina change | Ship energy change |
| --- | ---: | ---: |
| Rest alone | +8 | -2 |
| Share a meal | +12 | -5 |

There is no extra normal task fee for these choices. Paid delegation is a separate assistance option with its own displayed fee and risk.

Your journal and report record crew progress, teamwork, stamina, earned rewards, skipped tasks, and assistance fees.

## 8. Use Assistance When You Need It

Some games and crew tasks offer help or a skip option. You can also delegate an individual crew task or the entire interior stage.

**The game shows the exact fee and resource effects before you confirm.**

Typical assistance fees are:

| Assistance | Usual fee |
| --- | --- |
| Launch assistance | 1% of your starting grant |
| Individual crew task | 0.5% of your starting grant |
| Entire crew stage | 2% of your starting grant |

The usual minimum fee is **$5 million**. Check the displayed offer for the actual cost.

Additional rules:

- Easy mode reduces resource penalties.
- Skipping an arcade game still applies its listed resource penalties, with no second hidden penalty.
- Assembly assistance can install a missing module or review a design that does not meet the requirements.
- If assembly assistance would use money needed for the cheapest workable build, the game lowers the fee. The unpaid portion becomes extra risk when putting the spacecraft into service.
- Fees, risks, and delegated tasks appear in the final report and the exported JSON data file.
- After launch, you cannot buy assistance if your remaining grant cannot cover it. You must complete that task yourself.

## 9. Finish and Review Your Mission

**You pass when your final report score is 70 or higher.**

A score below 70 means the mission failed. A critical spacecraft failure always means the mission is lost.

Your report score considers:

- Science collected and returned.
- Spacecraft health.
- Piloting accuracy.
- Responses to unexpected events.
- Budget management.
- Extra research beyond the basic goals.

The debrief quiz can add **up to 6 bonus points**. Those points can help you reach the passing score.

## 10. What Comes From Real Space Science?

The mission is a game, but many of your engineering decisions are based on real science. Little Orbit uses NASA, JPL, and ESA references to show how spacecraft teams balance equipment, fuel, power, money, and time.

### Real Science and Mission Ideas

According to the *Little Orbit Technical Data Report*:

- **Planet and moon data** match NASA and JPL reference values after rounding.
- **Rocket and orbital equations** explain how mass affects fuel needs, how spacecraft orbit, and when to launch.
- **Power systems** reflect how sunlight weakens with distance and batteries keep equipment running in shadow.
- **Spacecraft protection and testing** draw on real radiation shielding, sunshades, backup systems, and prelaunch tests.
- **Crew activities** take inspiration from astronaut work, including plant care, air-system maintenance, communication, and rest. Some activity references still need verification.

### Real Budgets, Game Prices

NASA’s *FY 2026 Budget Technical Supplement* shows how proposed funding supports different space programs. It is a **budget request**, not a final approved budget.

Little Orbit teaches the same need to manage limited resources, but its equipment prices and budget events are game values. They should not be compared directly with real NASA mission costs.

### Simplified for Learning

Equipment statistics, travel times, arrival maneuvers, communication rates, and some destination requirements are simplified. The crew rooms, landscapes, XP, badges, stamina, bonuses, and timers are fictional.

The debris-defense activity is also an arcade challenge: **real spacecraft avoid debris by changing their path.**

For more detail, see the *Little Orbit Technical Data Report* and the guidebook’s **Crew & roles** chapter, which lists the NASA and ESA reading sources.

## 11. Project and Developer Information

*You do not need this section to play.*

### Design and Technology

The game uses **HTML, CSS, and JavaScript** in a web browser.

Its existing pixel fonts, white borders, dark space background, tappable card controls, three-panel workshop, compact reference sheet, and pixel layout are retained.

The **ASTRO SAVE Python/Pygame demo** inspired the walkable crew stage and six-room interior. It is reference material only; Python and Pygame are not required to run Little Orbit.

### Main Files

Where `.js` and `.css` appear below, they refer to separate JavaScript and styling files.

| Files | Purpose |
| --- | --- |
| `game-rules.js` / `game-rules.css` | Difficulty selection, equipment price tiers, paid assistance, and mode rules |
| `crew-interior.js` / `crew-interior.css` | Walkable spacecraft interior |
| `crew-mission-log.js` / `crew-mission-log.css` | Selectable mission journal |
| `keypad-calculator.js` / `keypad-calculator.css` | Popup calculator |
| `guidebook.js` / `guidebook.css` | In-game learning guide |

The existing workshop, launch, problem-solving, operations, campaign, and report modules remain part of the project.
