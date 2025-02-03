# Rect

<span class="inherit">[Element](#Element)</span>

This makes a rectangle. Unless otherwise specified, it has a `null` aspect. Without any arguments it will fill its entire allocated space. Specifying a `rounded` argument will round the borders by the same amount for each corner. This can be either a scalar or a pair of scalars corresponding to the x and y radii of the corners. To specify different roundings for each corner, use the `RoundedRect` element.

Positional arguments: none.

Keyword arguments:
- `pos` = `[0.5, 0.5]` — position of the rectangle
- `rad` = `[0.5, 0.5]` — size of the rectangle
- `rounded` = `null` — proportional border rounding, accepts either scalar or pair of scalars
