# Text

<span class="inherit">[Element](#Element)</span>

Creates a new `Text` element. Uses built-in browser facilities when available to calculate font size and aspect ratio. Note that you will typically not set the size of the text here, as this will fill the entire `Element` with the provided text. If you wish to place and size the text, wrap this in a container such as `Place` as seen in the example.

Positional arguments:

- `text`: a string to be used as the content

Keyword arguments:

- `font_family` = `'IBMPlexSans'`: the font family (for display and size calculations)
- `font_weight` = `100`: the font weight (for display and size calculations)
- `offset` = `[0.0, -0.13]`: offset of the text relative to its bounding box
- `scale` = `1`: size of the box relative to its bounding box
