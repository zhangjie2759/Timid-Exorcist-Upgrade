# clean3d-v1 runtime theme

This folder contains replaceable test art for `v0.23.0_clean3d_theme_bridge`.

Runtime paths are declared once in `ui-theme.js`:

- `characters/chefs/`: five 512×512 transparent chef PNGs.
- `characters/food-monsters/`: current transparent food-monster PNGs.
- future `kitchen/` and `ui/` folders may be added without changing save data or gameplay rules.

To replace an asset later, either overwrite the same semantic file with a transparent PNG of comparable framing, or change its path in `ui-theme.js`. Missing files fall back to the existing Canvas/legacy character drawings instead of blocking the game.

The current food loop still uses tomato, egg, rice and water. Therefore only tomato, egg and rice use the approved food-monster art; water keeps its Canvas droplet until Jay confirms its gameplay replacement.
