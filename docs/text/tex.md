# Tex

<span class="inherit">[Element](#Element)</span>

Creates a new `Tex` math element from LaTeX source. Uses `MathJax` when available to render in SVG and calculate aspect ratio. This is also implicitly accessible through `Node` and `Note` elements when passing `latex=true`.

Positional arguments:

- `tex`: a string to be used as the content

Keyword arguments:

- `pos` = `[0, 0]`: the position of the center of the element
- `size` = `1`: the proportional size of the element
