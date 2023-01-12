# BarPlot

<span class="inherit">[Plot](#Plot) > [Container](#Container) > [Element](#Element)</span>

Makes a plot featuring a bar graph. This largely wraps the functionality of `Plot` and `Bars` but takes care of labelling and arranging the `xaxis` information.

Positional arguments:
- `bars` — a list of of `[label, height]` tuples or a list of `[label, bar]` tuples where `bar` is a `Bar` element or equivalent

Keyword arguments:
- `direc` = `v` — the orientation of the bars in the plot
- `shrink` = `0.2` — how much to trim off bars for spacing (bars are touching when this is zero)
- `color` = `lightgray` — the default fill color to be used for bars

Subunit names:
- `bars` — keywords to pass to the underlying `Bars` element
