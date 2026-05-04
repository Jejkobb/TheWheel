# AGENTS.md

## Mission
Build and evolve a StakeEngine-based gambling game called **Outer Wheel** where the player starts at the center ring and can chain wins through outer rings up to a hard cap of **10,000x**.

## Product North Star
- The game must feel simple in the first 5 seconds and high-stakes by the outer rings.
- StakeEngine integration is mandatory for real session play.
- Math, UX, and compliance readiness must advance together.

## Non-Negotiables
- Keep all money values in StakeEngine API format (`1_000_000` multiplier).
- Run session flow in this order for live mode: `Authenticate -> Play -> EndRound` when required.
- Never hardcode operator session data; read `sessionID`, `rgs_url`, and related params from URL.
- Preserve deterministic game math definitions in a dedicated config area before broad refactors.
- Do not merge changes that remove the 10,000x max path check.
- Keep theoretical RTP calibrated at **96.00%** unless explicitly changed by product decision.
- Payout is always the final landed multiplier on the active layer; no chaining across layers.
- Do not introduce fractional low outcomes below `2x` (except `0x`) unless product explicitly asks.

## MVP Scope (Current)
- Static frontend game with concentric ring wheel UI.
- Bottom HUD layout: credits, last win, bet amount, and right-side spin button.
- Center-to-outer progression using exactly one `UP` segment per non-final layer.
- Layer multipliers follow a plinko-style cascading odds model (left-edge path is highest value).
- Keep segment geometry equal-width per layer; tune odds via value placement, not wedge size.
- Keep single-spoke `UP` odds explicit (Core: 1 of 4, Layers 2-5: 1 of 10, final layer: no `UP`).
- Max theoretical path multiplier set to **10,000x**.
- Theoretical RTP for layered simulation set to **96.00%**.
- StakeEngine live-session mode when URL parameters are present.
- Local simulation mode fallback when no live session is available.
- Bet step controls and round status messaging.

## Architecture Guardrails
- Keep wheel rules in a single source of truth (`LAYER_BLUEPRINTS` in `app.js`).
- Keep StakeEngine adapter logic separate from ring math logic.
- UI rendering should stay side-effect-light; round state transitions happen in one flow (`spinActiveLayer` path).
- Any new feature should declare whether it is:
  - `math-only`
  - `frontend-only`
  - `rgs-contract` change

## Near-Term Roadmap
1. Replace client-only ring outcomes with RGS-backed event/state outcomes from published math files.
2. Add cash-out decision points between rings.
3. Add RTP/volatility tooling and simulation exports.
4. Add feature flags tied to `jurisdictionFlags`.
5. Add autoplay/turbo only where jurisdiction allows.

## Quality Bar For Future Changes
- Every gameplay change updates:
  - ring math config
  - user-facing copy or labels
  - at least one test/sanity check path
- Never introduce hidden mode-specific behavior without explicit status text in UI.
- Keep mobile-first layout functional at <= 390px width.

## Handoff Checklist
- Explain what changed in math behavior, UI behavior, and StakeEngine behavior separately.
- Call out whether max-path multiplier changed.
- Call out whether `Play`/`EndRound` behavior changed.
