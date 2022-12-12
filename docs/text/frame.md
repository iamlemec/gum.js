# Frame

<span class="inherit">Container > Element</span>

This is a simple container class allowing you to add padding, margins, and a border to a single `Element`. Mirroring the standard CSS definitions, padding is space inside the border and margin is space outside the border.

There are multiple ways to specify margins and borders. If given as a scalar, they are scaled by the aspect ratio and are common across top/bottom and left/right. If two values are given, they correspond to common left/right and top/bottom values. If four values are given, they correspond to [left, top, right, bottom].

Positional arguments:
- `child` — the element to be encapsulated

Keyword arguments:
- `padding` — the padding to be added (inside border)
- `margin` — the margin to be added (outside border)
- `border` — the border width to use

Subunit names:
- `border` — keywords to pass to border, such as `stroke` or `stroke_dasharray`
