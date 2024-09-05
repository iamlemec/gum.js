# Place

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

This is a relatively thin wrapper around [Container](#Container) but accepts only one child element, so it can be useful for cases where `Container` is overkill. If you just want to take an `Element` and put it somewhere in space, this is the easiest way. They keyword arguments below are those used for the advanced placement specification in `Container`.

The child's `aspect` is an important determinant of its placement. When it has a `null` aspect, it will fit exactly in the given `rect`. However, when it does have an aspect, it needs to be adjusted in the case that the given `rect` does not have the same aspect. The `expand` and `align` keyword arguments below govern how this adjustment is made.

Positional arguments:
- `child` — the child `Element` to place

Keyword arguments:
- `pos`/`rad` = `[0.5, 0.5]` — a position and radius specifying rectangle placement
- `rect` = `null` — a fully specified rectangle to place the child in (this will override `pos`/`rad`)
- `expand` = `false` — when `true`, instead of embedding the child within `rect`, it will make the child just large enough to fully contain `rect`
- `align` = `center` — how to align the child when it doesn't fit exactly within `rect`, options are `left`, `right`, `center`, or a fractional position (can set vertical and horizontal separately with a pair)
- `rotate` = `0` — how much to rotate the child by (degrees counterclockwise)
- `pivot` = `center` — the point around which to do the rotation (can set vertical and horizontal separately with a pair)
- `invar` = `true` — whether to ignore rotation when sizing child element
