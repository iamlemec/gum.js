# Container

<span class="inherit">Element</span>

This is the `Element` class by which components are grouped together. It accepts a list of `Element`s and their positions and attempts to place them accordingly, taking `Context` information an input and passing re-scoped `Context` information to sub-`Element`s. The position of an element is specified by a rectangle, which is is a length 4 list of the form `[x1, y1, x2, y2]`.

Positional arguments:
- `children` — a list of `[child, rectangle]` pairs or `Element`s (or a single one). If the rectangle is unspecified it defaults to the full space `[0, 0, 1, 1]`

Keyword arguments:
- `tag` = `'g'` — the SVG tag to use for this element
- `clip` = `true` — whether to infer the `aspect` of this element from the aspect ratio of the minimal bounding box of its children