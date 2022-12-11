# Plot

<span class="inherit">Container > Element</span>

This will graph one or more elements over the desired limits and frame them with axes. If not specified by `xlim` and `ylim`, the limits of the plot will be computed from the bounding box of the constituent elements. By default, it's `aspect` will be the ratio of the range of the `xlim` and `ylim`.

Positional arguments:
- `elems`: either a single `Element` or a list of `Element`s to graph 

Keyword arguments:
- `xlim`/`ylim` = `[0, 1]` — the range over which to graph
- `xanchor`/`yanchor` — the value at which to place the respective axis. Note that the `xanchor` is a y-value and vice versa
- `xticks`/`yticks` = `5` — either an integer for evenly spaced ticks, a list of tick locations, or list of tick [location, label] pairs (see [Axis](#Axis) for more details)
- `xgrid`/`ygrid` = `false` — whether to show a grid in the background. If `true`, the grid lines match the specified ticks. Alternatively, you can pass a list of positions to override this
- `xlabel`/`ylabel` — a string or `Element` to use as the respective label
- `title` — a string or `Element` to use as the title

Subunit names:
- `xaxis`/`yaxis`/`axis` — the axes, including lines, ticks, and tick labels (see [Axis](#Axis) for more details)
- `xgrid`/`ygrid`/`grid` — the grid lines arrayed under the graph
- `xlabel`/`ylabel`/`label` — the axis label elements
- `title` — the title element
