# Text

<span class="inherit">[Element](#Element)</span>

Creates a new `Text` element. Uses built-in browser facilities when available to calculate font size and aspect ratio.

Positional arguments:

- `text`: a string to be used as the content

Keyword arguments:

- `size` = `12`: the font size (preferred over direct `font_size` property)
- `actual` = `false`: whether to use actual size calculations
- `hshift` = `0.0`: horizontal shift of the text
- `vshift` = `-0.13`: vertical shift of the text
- `calc_family`: the font family to use for size calculations
- `calc_weight`: the font weight to use for size calculations
- `calc_size`: the font size to use for size calculations
