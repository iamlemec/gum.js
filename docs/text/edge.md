# Edge

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

This creates a Bézier-style path from one point to another with optional arrowheads at either or both ends. It is named `Edge` because of its usage in [Network](#Network) but can be used independently. The emenation directions are automatically inferred from the relative point positions but can be overriden as well.

Positional arguments:
- `beg`/`end` — the beginning and ending points for the path and where the optional arrowheads are placed, or a `[point, direc]` pair where `direc` specifies the emanation direction

Keyword arguments:
- `arrow`/`arrow_beg`/`arrow_end` = `false` — toggles whether the respective arrowheads are included
- `arrow_size` = `[0.02, 0.015]` — the arrowhead size to use for both arrows (can be individually specified at the subunit level)
- `curve` = `0.03` — the amount of curvature to use in the connecting line, with zero denoting a straight line and `0.5` denoting a line that achieves perpendicularity

Subunit names:
- `arrow`/`arrow_beg`/`arrow_end` — the respective arrowheads, with `arrow` being applied to both
- `line` — the connecting line element
