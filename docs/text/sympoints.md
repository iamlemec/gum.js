# SymPoints

<span class="inherit">Container > [Element](#Element)</span>

Flexible interface to generate sets of points symbolically or in combination with fixed inputs, analgous to [SymPath](#SymPath) but for points rather than lines. The most common usage is to specify the range for x-values with `xlim` and a function to plot with `fy`. But you can specify the transpose with `ylim`/`fx`, or do a fully parametric path using `tlim`/`fx`/`fy`.

You can also specify the radius of the points functionally with `fr` and the shape with `fs`. Both of these functions take `(x, y, t)` values as inputs and return the desired radius and shape for each point.

Positional arguments: None

Keyword arguments:
- `fx`/`fy` — a function mapping from x-values, y-values, or t-values
- `fr` = `size` — a function mapping from `(x, y, t, i)` values to a radius
- `fs` = `shape` — a function mapping from `(x, y, t, i)` values to a shape
- `size` = `0.01` — a size to use if `fr` is not specified
- `shape` = `Dot()` — a shape to use if `fs` is not specified
- `xlim`/`ylim`/`tlim` — a pair of numbers specifying variable limits
- `xvals`/`yvals`/`tvals` — a list of x-values, y-values, or t-values to use
- `N` — number of data points to generate when using limits