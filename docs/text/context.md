# Context

This is the class the handles the flow of information down the `Element` chain as rendering happens. Essentially, it contains information about the absolute location (in pixels) of the current `Element` and provides methods for mapping from coordinate positions within that `Element` (such as `[0.3, 0.6]`) to pixel positions (such as `[100, 250]`).

The most commonly used would be `coord_to_pixel` for locations and `size_to_pixel` for sizes. These are used as the core logic in most custom `Element` classes. See [Element](#Element) for more information on their proper usage in that setting.

Positional arguments:
- `rect` — the position of the current `Element` in absolute pixel terms

Keyword arguments:
- `frac` = `[0, 0, 1, 1]` — the coordinate system used for the current `Element`, is used primary for graphing objects
- `prec` = `13` — the floating point precision with which to render properties (often pixel and size values)

Member functions:
- `coord_to_pixel(coords)`: map a list of coordinates into a list of pixel positions
- `coord_to_frac(coords)`: map a list of coordinates into a list of fractional position
- `frac_to_pixel(fracs)`: map a list of fractional positions to pixel positions
- `size_to_pixel(sizes)`: map a size in coordinate units to a size in pixel units
- `rect_to_frac`: map rectangles in coordinate space to fractional rectangles
- `map(frect, aspect, scale)`: return a sub-`Context` for a given fractional rectangle fitting `aspect` and using coordinate system `scale`
