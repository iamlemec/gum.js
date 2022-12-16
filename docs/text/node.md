# Node

<span class="inherit">[Frame](#Frame) > [Container](#Container) > [Element](#Element)</span>

This is a simple container class descending from [Frame](#Frame) that is designed to enclose text in a border. It is called `Node` as it performs that function in the [Network](#Network) class, but can also be used independently. The standard usage is to pass a string that will automatically be converted into a `Text` object. One can also pass a list of strings, which will be used to create a `VStack` of `Text` objects. Finally, one can simply pass a generic `Element`.

Positional arguments:
- `text` — a string, a list of strings, or an `Element` to be used as the content

Keyword arguments:
- `padding` = `0.1` — the padding to be added (inside border)
- `border` = `1` — the border width to use
- `spacing` = `0.02` — the space to add between lines in multiline mode
- `align` = `center` — the alignment to use in mutliline mode

Subunit names:
- `text` — keywords to pass to an auto-generated `Text` object or objects
