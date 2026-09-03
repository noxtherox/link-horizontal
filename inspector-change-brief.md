# WeldCloud Inspect — change brief after UX review with Tiago Pereira

Meeting: 27 Aug 2026, 29 min. Target: `public/inspector.html` on branch `feature/BruxWerk`.

---

## Part A — What Tiago actually said

### 1. The NDT report is not a special case. It is the container for all inspection work. ⚠️ structural

The single biggest correction. We built NDT as a deeper test that only some welds need — a PT report attached to `W-002`. That model is wrong.

> "Every test type will have a non-destructive test report. If you have a weld with an assigned VT, PT, RT, whatever type of test, you do have to make a report."

So `W-001`, `W-003`, `W-004`, `W-005`, `W-006` each need a **VT report**. `W-002` needs **two** reports — one VT, one PT. There is no such thing as an inspection without a report. "NDT" in WeldCloud means *any* non-destructive test, visual included — not "the deep one".

### 2. A report spans multiple welds and multiple inspections. ⚠️ structural

> "Today a report can have multiple welds and inspections… it feels like the way it's working here, I would only be able to do a report for a single weld and a single inspection."

Assembly already supports this: you open a report, expand the weld list, tick three welds, done. The signature is **on the report, once, at the end** — not per weld.

> "The signing is only done when you are done with the report. You don't do it for every weld."

### 3. The concept that resolves 1 and 2: an **active report**

Tiago proposed this himself, twice.

> "Maybe in the top level you have the currently working reports… you see on the top some pills with the report names."

> "At the top bar, maybe you can have an active report that you are working on. And from here maybe you have some pills for each test, like plus VT or plus PT clickable, where you can just click plus VT for every weld, and it will assign the report individually with each click. But since you're working with a VT report, the plus PT pill should be greyed out."

An inspector does one test method at a time — you don't do VT and PT in the same pass down the shop floor. So: one active report, visible at the top, and welds get added to it as you go.

### 4. Coverage % is set upstream and disappears from this UI

Assembly assigns inspections randomly at project level: set PT to 50% and Assembly picks one weld in every two and attaches a PT inspection to it. The chosen weld is then inspected fully.

> "For reference, a reminder, the 100% we are going to remove from here."

Every `100 %` chip in the app goes. The percentage is a project-planning number, not something an inspector sees on a weld.

### 5. Imperfections must be recordable on **accepted** welds

> "Even if it's a good one, there should be a place where you can add these imperfections… because they are not big enough to fall inside the requirements of the standard, they can still be acceptable despite having an imperfection."

Right now imperfection capture only exists inside the reject wizard. It has to live in the report form too, independent of the verdict. This vindicates the verdict-vs-reason split we argued about in the grilling — the imperfection is an observation, the verdict is a judgement, and they are not the same field.

### 6. Multiple weld sessions per weld, compared individually

> "This is one weld session. I need you to make this design so it takes into account potential of multiple weld sessions… these two cards might need to be combined somehow."

And on aggregation — Adrian asked whether to average across sessions:

> "No, individually. Each weld session is associated with a WPS parameter ID, which is the welding passes description. And that will be compared individually."

Plus a specific ask to reuse Assembly's existing pattern: traffic-light red/amber/green per session at a glance, click through for the graphs.

### 7. Unassigned tests should be visible, and claimable

> "If the weld has a further inspection that is not assigned to the guy, he should see that it has this test."

> "If I have PT certification and the weld has PT, even though it's not assigned to me, I can claim it and do it right on the spot."

Certification data comes from WeldCloud Notes.

### 8. Completion is automatic — there is no hand-off

> "This whole concept that I told you, hey, I'm going to go back to the quality manager and say here's what happened — that will be a thing of the past. The quality manager is in his office just seeing what's the most recent reports… it's completely automatic."

Finished work disappears from the inspector's list the next day; new work appears. A rejected weld goes back into a welder's queue — and usually **a different welder's**, not the original one.

### 9. Smaller notes

- **Test conditions** (surface condition, temperature, penetrant/developer batch, dwell) — *"this is definitely a cloth-ism, this is not available today in assembly, so it's unlikely that we will put this in, but that's fine."* Not wrong, just not real yet.
- **Voice input for imperfection dimensions** — explicitly a nice-to-have. *"Hey, it's two pores with 25 millimeters width and 55 length, 45 depth, there's no angle and it's 25 millimetre height — and then it just figures out where it needs to put the numbers. Would be so cool if we can manage to get that."*
- **Real working pattern**: the inspector walks to a staging area where completed parts sit, works weld by weld on physically adjacent joints, one part at a time, then moves to the next part. Speed and sequence matter more than navigation depth.

### 10. What he explicitly liked — do not break these

- The reject wizard: *"I like how it's done here… it's very mobile-friendly… it doesn't require keyboard, you just tap it on the screen."*
- Photo annotation markers: *"I like that. We need to do that for assembly as well."*
- The history overview at the top of the weld screen: *"I like that overview at the beginning of what's happened. That's cool."*

---

## Part B — Where this contradicts what we decided

Worth naming, because two of these were deliberate choices, not oversights.

| We decided | Tiago says | Verdict |
|---|---|---|
| NDT is a deeper test on selected welds; design the single-weld flow only | Every inspection produces a report; reports span welds | **Overturned.** Our model of the domain was wrong, not just the UI. |
| `VT 100 %` / `PT 100 %` chips on every weld | Remove the percentages entirely | **Overturned**, and it simplifies the UI. |
| Verdict (`Acceptable`/`Not acceptable`) separate from imperfection record | Imperfections exist on passing welds too | **Confirmed** — and now load-bearing rather than pedantic. |
| Verdict separate from disposition (`awaiting QA`) | Not raised | Standing. Worth confirming next meeting. |
| Two parts, 3–6 welds each | *"Maybe there's like 5 Adrian parts there. He does them all."* | Needs a third part to demo a report spanning parts — see change 12. |

---

## Part C — The change brief

Paste from here down into Claude Code on `feature/BruxWerk`.

---

You are changing **`public/inspector.html`** — a single self-contained 2,271-line vanilla-JS tablet prototype. No React, no build step, no TypeScript. It uses a screen registry (`const SCREENS`, ~line 1077) where each screen is `{topbar(), render(), footer?, after?}` returning HTML strings, a navigation stack in `state.stack`, and global namespace objects (`App`, `WeldActions`, `RejectFlow`, `NdtFlow`, `Checklist`, `Modal`, `Keypad`) referenced from inline `onclick=` attributes. Follow the existing patterns exactly — do not introduce a framework, a bundler, or modules. Preserve the CSS token system in the `:root` block and the light/dark handling.

The prototype is going in front of welders and inspectors for usability testing, so every change must leave the app in a working, clickable state.

### The core model change (changes 1–5 are one coherent rework — read all five before starting)

**1. Every inspection produces a report.**
Restructure the seed data in `seedData()` (~line 632) so each weld carries an `inspections` array rather than a `tests` string. Each inspection is `{ method: 'VT'|'PT'|'RT'|'UT'|'MT', assignedTo: <inspectorId|null>, reportId: <string|null>, result: null|'Acceptable'|'Failed', indications: [] }`.

Seed: `W-001`, `W-003`, `W-004`, `W-005`, `W-006` each get one `VT` inspection assigned to A. Lindqvist. `W-002` gets **two** inspections — `VT` assigned to A. Lindqvist, and `PT` **unassigned** (this drives change 6). Remove the `ndtRequired` flag and the special-case treatment of `W-002` entirely.

**2. Delete every coverage percentage.**
Remove `100 %` from weld test chips, from the NDT form's coverage field, and from anywhere else it appears. Coverage is decided in Assembly at project level and is not shown to the inspector.

**3. Introduce the active report.**
Add `state.activeReport = null` to the state literal (~line 689) and a `DATA.reports = {}` collection. A report is `{ id, method, created, welds: [weldId], status: 'draft'|'signed', signedBy, signedAt, ...header fields }`.

Render the active report as a **pill in the topbar**, present on every screen in the inspection section: e.g. `VT · NDT-2026-0417 · 3 welds`. Tapping it opens the report. If more than one draft report exists, show one pill per report with the active one visually primary. A "＋ New report" affordance sits alongside.

**4. Accepting or rejecting a weld writes into a report, not into the weld alone.**
Rework `WeldActions.confirmAccept` (~line 1204) and `RejectFlow.submit` (~line 1585):

- If an active report exists **and its method matches** the inspection being recorded → append this weld to that report and record the result. No signature prompt.
- If no matching active report exists → prompt: *"This VT inspection is not yet on a report. Create a new VT report, or add it to an existing draft?"* with the list of matching drafts. Creating one prefills report number, date, method, assembly and inspector, exactly as the current `initNdtDraft()` (~line 1750) does.
- **Remove the per-weld signature.** The confirm modal keeps the inspector name, ISO 9712 level and cert as *context*, but the signing action moves to the report.

**5. Rework the report screens around multiple welds.**
`SCREENS.ndtForm` (~line 1877) currently renders a single-weld PT form. Split it:

- **Report screen** — header fields (report number, date, method, procedure, acceptance criteria, notes, PDF attach) plus a **weld list**: each row is one weld+inspection on this report, with its result badge, imperfection count and photo thumbnails. Rows are tappable to review. A `+ Add welds` action opens a multi-select of eligible welds (matching method, not already on a report) — mirroring Assembly's expand-and-tick pattern.
- **Sign & save** lives here, once, at the bottom, and is disabled until every weld on the report has a result. Signing sets `status:'signed'`, stamps inspector name, method, ISO 9712 level, cert number and timestamp, and clears the active report.
- **Per-weld inspection detail** — result toggle (`Acceptable` / `Failed`), **imperfections** (see change 7), remarks, photos. Reachable both from the report's weld list and directly from the weld screen.

Move the test-conditions block (surface condition, temperature, penetrant/developer batch, dwell) into a **collapsed** `Test conditions` section on the report screen, closed by default. It is not in Assembly today and should not lead the form.

Retire `SCREENS.ndtPrompt` (~line 1768) in its current form — its job is now the report-assignment prompt in change 4.

### 6. Unassigned inspections, and claiming them

On the weld screen, show unassigned inspections distinctly — e.g. `PT · not assigned to you`. If the logged-in inspector holds a matching certification (the seed already has `inspector.ptCert = 'SE-PT2-11487'`), show a **`Claim`** button that assigns the inspection to them in place and makes it actionable. If they hold no matching cert, show the inspection greyed with `Requires PT Level 2` and no action. Seed `W-002`'s PT as unassigned so this path is demonstrable.

### 7. Imperfections on accepted welds

Extract the imperfection capture currently locked inside the reject wizard (`SCREENS.rejectReason` ~1626, `rejectSize` ~1640, `rejectPhoto` ~1662) into a reusable flow, and add an **`+ Add imperfection`** action to the per-weld inspection detail from change 5 — available whatever the result is.

The screens themselves must not change: the searchable ISO 6520-1 row picker, the big keypad-driven dimension fields, and the tap-to-place photo markers are the parts Tiago singled out as working. Reuse them verbatim; only the entry point and where the record lands are new.

Update the copy so the reject wizard reads as *recording imperfections that caused a rejection*, and the accepted-weld path reads as *recording imperfections within acceptance limits*. Same components, different framing.

### 8. Multiple weld sessions, compared individually

On `SCREENS.weld` (~line 1325), **merge** the "Weld session vs WPS" comparison card (`wpsSummaryCard()` ~line 1030 region) into the weld-sessions list (`weldSessionsListCard()` ~line 1301). One card, not two — the current split implies a single session.

Each row is one session: pass label, **WPS parameter ID**, timestamp, operator, and a **traffic light** — green in range, amber point breaches, red average breach. Reuse Assembly's convention. Never average across sessions; each session is judged against its own WPS parameter ID.

Tapping a row still opens `SCREENS.weldSession` (~line 1530) with the spark charts — keep that screen as is.

Seed at least one weld with **three** sessions where the middle one is amber and another with a red, so the traffic-light range is visible without the facilitator hunting for it.

### 9. Next weld, fast

Inspectors work down physically adjacent welds on one part. After recording a result, offer **`Next weld →`** directly, without a trip back to the part list. Add a persistent position indicator (`Weld 3 of 6 · P-01`) on the weld screen.

### 10. Bulk assign from the part weld list

On `SCREENS.part` (~line 1148), add per-row assignment pills as Tiago described: `+ VT`, `+ PT`. One tap adds that weld's inspection of that method to the active report. **Pills whose method does not match the active report are greyed and disabled** — the inspector is working one method at a time. With no active report, the first tap creates one.

### 11. Rejection routing copy

In `SCREENS.rejectConfirm` (~line 1721), correct the notification copy. A rejected weld returns to the welding queue but is *usually picked up by a different welder*. Replace "Sven Wik (SW4) has been notified" with something like "Returned to the welding queue for `P-01` — will be reassigned by the supervisor." Keep `Disposition: awaiting QA`.

Add a line to the confirmation making the automatic hand-off visible: "Result is live in Assembly — no separate submission needed." This is a real product differentiator and currently invisible in the UI.

### 12. Seed data: add a third part

Add **`P-03 — Pump Skid Bracket`**, unblocked, 4 welds `W-011`–`W-014`, all with VT inspections. This makes a report spanning two parts demonstrable, which is the whole point of change 2. `SCREENS.home` (~line 1079) currently hardcodes `findPart('P-01')` and `findPart('P-02')` — change it to iterate `DATA.parts`.

### 13. Bugs to fix while in there

- `App.jumpToStep7` (~line 783) produces `NCR-2026-88` while `RejectFlow.submit` (~line 1585) produces `NCR-2026-0088`. Pad both.
- `state.indicationDraft` is used by `NdtFlow.openAddIndication` (~line 1805) but never declared in the state literal (~line 689). Declare it.
- `SCREENS.ndtForm.topbar()` (~line 1878) calls `initNdtDraft()` as a side effect from a render path. Move that into the navigation call site.
- `SCREENS.machineSessions` (~line 2105) hardcodes `if (m.id !== 'm1')` → empty state. Give at least one more machine sessions so the screen isn't a dead end.
- Badge colour classes (`.badge-success`, `.badge-warning`) use hardcoded rgba/hex outside the token set and have no dark-mode variants. Tokenise them.

### 14. Optional, only if the rest is solid — voice entry for dimensions

On the imperfection dimensions screen, add a microphone button that accepts a spoken phrase like *"two pores, 25 millimetres width, 55 length, 45 depth, no angle, 25 height"* and fills the fields. Simulate it: a canned transcript, a visible parse, fields populating one by one, and a confirm step before commit. Tiago flagged it as a wish, not a requirement — build it last, and skip it if anything above is unfinished.

### Do not break

The reject wizard's keyboard-free chunky flow, the tap-to-place photo markers, and the inspection-history overview at the top of the weld screen were all called out as working. Change their entry points and their copy if needed — do not redesign them.

Keep the facilitator bar (reset, offline toggle, jump-to-step-7) working, and extend it: add a shortcut that seeds a half-filled draft VT report so the multi-weld report state can be shown without ten taps of setup.

---

## Part D — Take these back to Tiago

Four things the transcript leaves genuinely open. Better to ask than to invent.

1. **When does a weld's result become visible to the quality manager** — the moment it is recorded on a draft report, or only when the report is signed? This determines whether "completely automatic" means live or on-signature, and it changes what the weld status badge should say.
2. **Can one report mix methods?** Tiago's active-report model implies no — one report, one method. Worth confirming, since Assembly's own report header has a single `Type of test` field, which suggests the answer is no.
3. **Who closes the NCR?** Currently the app closes it when the re-test is accepted. If the QA authority owns disposition, the inspector's re-test may only *propose* closure.
4. **What happens to a draft report at end of shift** — does it persist to tomorrow, and can a different inspector pick it up?
