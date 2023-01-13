# Network

<span class="inherit">[Container](#Container) > [Element](#Element)</span>

Creates a possibly directed network of nodes and edges. Each node has a `key` string that uniquely identifies it, and edges are specified as `key` pairs. By default nodes are created using the [Node](#Node) class, but a custom `Element` can be used instead on an item by item basis. Edges are constructed using simple Bézier curves, but care is not currently taken to prevent edges from crossing nodes. Directional arrows are off by default but can be added and customized.

Positional arguments:
- `nodes` — a list of node specifications denoted by either strings or `[key, label]` pairs, where `label` is either a string or a list of string that is passed to [Node](#Node) or a custom `Element`
- `edges` — a list of edge specifications denoted by either a `[key1, key2]` pair or a `[key1, key2, attr]` triplet when passing edge specific arguments to [Edge](#Edge)

Keyword arguments:
- `size` = `0.1` — the default node size, which can be overriden by adding a third element to a node specification
- `directed` = `false` — whether to include arrowheads at the terminus of edges

Subunit names:
- `node` — attributes that are used for the default `Node` constructor
- `edge` — attributes that are passed to all `edge` constructors
- `arrow` — attributes that are passed to all `Arrowhead`s (via `Edge`)

Methods:
- `get_anchor(tag, pos)` — return the position of a specific cardinal position of a `Node`, to be used when overlaying additional edges ex post
