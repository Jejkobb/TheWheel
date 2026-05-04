# Outer Wheel MVP

Outer Wheel now runs on a **single-launch, segment-durability mechanic**:
- click **launch** to fire a ball from the center
- the ball can hit `UP` or multiplier slices on the current active ring
- every segment has **2 hit durability**
- when an `UP` segment reaches 2 hits, the entire layer breaks away
- when a multiplier segment reaches 2 hits, that multiplier is the win
- hard max win remains `1,000x`
- payout is always the final landed multiplier only
- flight is zero-gravity style with constant-speed ricochets (breakout-like motion)
- rings use seeded random start angles each round (no continuous spin during flight)
- UP impacts instantly break/remove the active ring with a short particle burst
- UP slices use an arrow icon and a crack-texture overlay for visual clarity

## RTP + Math

- Theoretical RTP is calibrated to **96.00%** for this mechanic.
- UP density remains explicit and unchanged:
  - Core: `1/4`
  - Layer 2: `3/12`
  - Layer 3: `2/11`
  - Layer 4: `1/10`
  - Layer 5: `1/10`
  - Outer Crown: `0`
- All ring wedges stay equal-width; value tuning is done by multiplier placement.
- Outer Crown prizes are distributed around the ring instead of clustered in one zone.
- No fractional outcomes between `0x` and `2x` are used.

## Provably Fair

A clickable **Provably Fair** section is included:
- server seed hash is displayed
- client seed is editable
- `Rotate Seed` regenerates your client seed and resets nonce
- nonce increments after each resolved round
- last round hash is shown
- RNG stream format: `SHA-256(serverSeed:clientSeed:nonce:cursor)`

The round is fully resolved from seeds before animation, then rendered as physics-style motion.

## Run

```bash
python -m http.server 8080
```

Open:

`http://localhost:8080`

## Modes

- **Simulation mode** (default): full local 2-hit segment-break math and payout.
- **StakeEngine live mode**: auto-activates when URL includes `sessionID` and `rgs_url`.

Example live URL:

`https://<host>/index.html?sessionID=<id>&rgs_url=<host>&lang=en&device=desktop`

## Notes

- Amounts remain in StakeEngine API multiplier format (`1_000_000`).
- Live flow remains: `Authenticate -> Play -> EndRound`.
- Deterministic round resolution uses seeds and nonce; animation is visual only.
