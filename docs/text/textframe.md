# TextFrame

<span class="inherit">[Frame](#Frame) > [Element](#Element)</span>

Creates a new `TextFrame` element. This is a specialized version of `Text` that wraps the text in a `Frame`. It also dispatches handling to the other `Text` variants such as `MultiText`, `Emoji`, and `Latex`. This makes it a good general-purpose text element.

Arguments:

- `text`: the text to display, either a string or an array of strings

Keyword arguments:

- `latex`: whether to render LaTeX
- `emoji`: whether to render emoji
- `border` = `1`: the border width
- `padding` = `0.1`: the padding
- `spacing` = `0.02`: the spacing between lines (for multi-line text)
