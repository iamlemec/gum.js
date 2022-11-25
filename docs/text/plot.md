# Plot

<span class="inherit">Container > Element</span>

This will graph one or more elements over the desired limits and frame them with axes. If not specified by `xlim` and `ylim`, the limits of the plot will be computed from the bounding box of the constituent elements. By default, it's `aspect` will be the ratio of the range of the `xlim` and `ylim`.

Positional arguments:
- `elems`: either a single `Element` or a list of `Element`s to graph 

Keyword arguments:
- `xlim`/`ylim`: the range over which to graph
- `xticks`/`yticks`: either an integer for evenly spaced ticks, a list of tick locations, or list of tick [location, label] pairs (see [Axis](#Axis) for more details)

Subunit names:
- `xaxis`/`yaxis` — the axes, including lines, ticks, and tick labels
- `xgrid`/`ygrid` — the grid lines arrayed under the graph
- `xlabel`/`ylabel`/`title` — the axis label and title elements
