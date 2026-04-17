# UI Principles for Agents

These principles should guide the UI development across the application, especially for interactions involving agents and asynchronous tasks.

## 1. Immediate Feedback (Responsiveness)
**Principle:** Every user action should produce a visible response.
- Click button -> something happens right away
- Loading spinner
- Button animation
- Progress bar
- Even if the real work takes time, the UI should acknowledge instantly
**Why it matters:** Without feedback, users think the system is broken or they double-click.

## 2. Clear Cause-Effect Mapping
**Principle:** Users should understand what their action will do.
- Button label: "Submit", not "Go"
- Hover/pressed states show interactivity
- After click -> result clearly tied to the action
**Good UI feels like:** "I clicked X, so Y happened."

## 3. Visibility of System Status
**Principle:** Always show what the system is doing.
- Loading -> show skeleton UI / spinner
- Processing -> "Uploading file..."
- Done -> success confirmation
This idea comes from classic usability heuristics (like Jakob Nielsen).
**Users should never ask:** "Is it working?"

## 4. Predictability & Consistency
**Principle:** Same actions behave the same way everywhere.
- All buttons look like buttons
- Same color = same meaning (e.g., red = delete)
- Navigation patterns don't change randomly
**This reduces cognitive load:** Users don't need to relearn your app.

## 5. Affordance (Obvious Interactions)
**Principle:** UI elements should suggest how they are used.
- Buttons look clickable
- Sliders look draggable
- Links look like links
**If users have to guess, the design failed.**

## 6. Error Prevention & Recovery
**Principle:** Help users avoid mistakes—and recover easily.
- Disable button if input invalid
- Confirm destructive actions ("Delete?")
- Undo option when possible
**Great UI assumes:** Users will make mistakes.

## 7. Minimize User Effort
**Principle:** Reduce steps, typing, and thinking.
- Autofill
- Defaults
- Smart suggestions
**The best UI often feels like:** "It did half the work for me."

## 8. Progressive Disclosure
**Principle:** Show only what's needed, reveal more when necessary.
- Simple UI first
- Advanced options hidden behind "More"
**Keeps UI clean without limiting power users.**

## 9. Latency Masking (Perceived Performance)
**Principle:** Make slow systems feel fast.
- Skeleton screens instead of blank pages
- Optimistic UI (show result before backend confirms)
**This is huge in modern apps (e.g., chat, feeds).**

## 10. Feedback Loop (Human-like Interaction)
**Principle:** UI behaves like a conversation.
- Action -> response -> next possible action
- Clear next steps
**Especially important in AI / agent interfaces:** User intent -> system reasoning -> visible output -> refine

## Simple Mental Model
You can compress all of this into one loop:
**User Intent -> Action -> Immediate Feedback -> System Processing -> Clear Result -> Next Action**
If any part breaks, UX feels bad.

## Example (Good vs Bad)
**Bad:** Click button -> nothing happens for 3 seconds -> suddenly page changes
**Good:** Click button -> button animates instantly -> Spinner appears ("Processing...") -> Result appears with confirmation

## Tie to Agent Systems
For agent-based systems:
- "Click" becomes intent
- "Response" becomes multi-step reasoning
UI must expose:
- What the agent is doing
- Which tools it's using
- Partial progress
Otherwise it feels like a black box.