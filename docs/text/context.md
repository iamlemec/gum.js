# Context

This is the class the handles the flow of information down the `Element` chain as rendering happens. Essentially, it contains information about the absolute location (in pixels) of the current `Element` and provides methods for mapping from coordinate positions within that `Element` (such as `[0.3, 0.6]`) to pixel positions (such as `[100, 250]`).

The most commonly used would be `coord_to_pixel` for locations and `size_to_pixel` for sizes. These are used as the core logic in most custom `Element` classes. See [Element](#Element) for more information on their proper usage in that setting.

The `map` function is used generate a subcontext for child elements. The input `rect` specifies where to place the child in the coordinate system of the parent, while the `coord` argument specifies a new coordinate system for the child to use. The canonical usage of the `coord` argument is in [Graph](#Graph), where we want to place the graph in a particular spot but specify child positions in an arbitrary coordinate system.

For children with `null` aspects, this is the end of the story. However, when the child aspect is specified, we may not be able to fit it into `rect` snugly. In this case we either shrink it down so that if fits both vertically or horizontally (`expand = false`) or blow it up until it (weakly) exceeds its bounds in both directions (`expand = true`). Related complications are introduced when `rotate` is non-null.

Positional arguments:
- `prect` — the position of the current `Element` in absolute pixel terms

Keyword arguments:
- `coord` = `[0, 0, 1, 1]` — the coordinate system used for the current `Element`
- `prec` = `13` — the floating point precision to render properties with (pixel and size values)

Member functions:
- `coord_to_pixel(coords)`: map a list of coordinates into a list of pixel positions
- `coord_to_frac(coords)`: map a list of coordinates into a list of fractional position
- `frac_to_pixel(fracs)`: map a list of fractional positions to pixel positions
- `size_to_pixel(sizes)`: map a size in coordinate units to a size in pixel units
- `rect_to_frac(rects)`: map rectangles in coordinate space to fractional rectangles
- `map({rect, coord, aspect, expand})`: return a sub-`Context` for a given coordinate rectangle
