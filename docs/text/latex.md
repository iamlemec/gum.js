# Math

<span class="inherit">[Element](#Element)</span>

Creates a new `Math` math element from LaTeX source. Uses `MathJax` when available to render in SVG and calculate aspect ratio. This is also implicitly accessible through `TextFrame` and `Note` elements when passing `latex: true`.

Positional arguments:

- `tex`: a string to be used as the content

Keyword arguments:

- `offset` = `[0, 0]`: the position of the center of the element
- `scale` = `1`: the proportional size of the element
