# Stack

<span class="inherit">Container > Element</span>

Stack one or more `Element`s either verticall or horizontally. There are specialized classes `VStack` and `HStack` that don't take the `direc` argument. Members of `children` that are just `Element`s will be distributed space based on what is available.

This behavior depends on the `expand` flag. If `expand` is false, the remaining space is split evenly. If `expand` is true, then space is distributed in inverse proportion to the child's aspect ratio, so that all elements will reach full width (in the `VStack` case) or full height (in the `HStack` case).

Positional arguments:
- `direc` — the direction of stacking: `v` or `h`
- `children` ­— list of `Element`s or `[child, size]` pairs

Keyword arguments:
- `expand` = `true` — whether to stretch child elements to full width/height
- `align` = `'center'` — if child does not reach full width/height, how to position it
- `spacing` = `0` — amount of space to add between child elements
- `aspect` = `'auto'` — to override `auto` aspect, which aggregates child aspects
- `debug` = `false` — outline child allocations to troubleshoot problems
