# Outer Wheel MVP

MVP prototype for a StakeEngine-aligned layered wheel game:
- start in the **center layer**
- each spin can land either on a **multiplier** (round ends) or **UP** (move to next layer)
- outer layers offer better multipliers
- hard max win target is `10,000x`
- theoretical RTP is calibrated to `96.00%` (simulation math model)
- payout is the **final landed multiplier only** (no layer-to-layer multiplier chaining)
- `UP` density is progression-weighted: Core has `1`, Layer 2 has `3`, Layer 3 has `2`, Layers 4-5 have `1`, and the final layer has `0`
- all layer segments are equal-size spokes (uniform geometry)
- multiplier bins use a plinko-style cascading value ladder with dead slices concentrated early
- no `0.2x` outcomes; progression starts from `0x` then `2x`, `4x`, `8x`, ...
- first layer is only `UP` or `0x` with a 1-in-4 `UP` chance
- current geometry uses 4 spokes on Core (`3` x `0x` + `1` x `UP`), 12 spokes on Layer 2 (`9` multipliers + `3` UP), 11 spokes on Layer 3 (`9` multipliers + `2` UP), 10 spokes on Layers 4-5 (`9` multipliers + `1` UP), and 10 multipliers on the final layer

## Run

Because this is a static build, you can run it with a simple local server:

```bash
python -m http.server 8080
```

Then open:

`http://localhost:8080`

## Layout

- Main stage contains the concentric wheel.
- A paytable panel shows all layer values and UP chances from the start.
- Bottom HUD contains:
  - credits
  - last win
  - bet amount
  - spin button (right side)

## Modes

- **Simulation mode** (default): local balance/config, full layered UP mechanic.
- **StakeEngine live mode**: auto-activates when URL has `sessionID` and `rgs_url`.

Example URL shape for live mode:

`https://<host>/index.html?sessionID=<id>&rgs_url=<host>&lang=en&device=desktop`

## Notes

- Amounts follow StakeEngine's API multiplier (`1_000_000`).
- Live mode authenticates with StakeEngine and opens/closes rounds with `Play` / `EndRound`.
- Current layer outcomes are frontend MVP logic; production should source outcomes from published RGS math/event data.
- Wins above `10x` trigger a count-up animation on the HUD win field.
- The landed segment is highlighted first, then win value is revealed in the HUD.
- Pointer tip starts at the inner border of the current layer and moves outward when `UP` advances.
