# Points

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

Place copies of a common shape at various points. The radius can be specified by the `radius` keyword and overridden for particular children.

Positional arguments:
- `points` — a list of `[child, position]` pairs, where `position` can be either an `[x,y]` pair or a `[x,y,r]`/`[x,y,rx,ry]` list to override the `radius`

Keyword arguments:
- `size` = `0.05` — the default radius to use for children
- `shape` = `black_dot()` — the default shape to use for children
