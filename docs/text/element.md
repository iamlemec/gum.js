# Element

The base class for all `gum.js` objects. You will usually not be working with this object directly unless you are implementing your own custom elements. An `Element` has a few methods that can be overriden, each of which takes a [Context](#Context) object as an argument.

The constructor takes three positional arguments: `tag`, `unary`, and `args`. The first two are described below, while `args` is a dictionary of optional keyword arguments, listed separately below. This pattern for keyword arguments is followed for all subclasses of `Element`.

Positional arguments:
- `tag` — the SVG tag associated with this element
- `unary` — whether there is inner text for this element

Keyword arguments:
- `aspect` = `null` — the width to height ratio for this element
- `...` — additional arguments that are included in `props`

Methods:
- `props(ctx)` — returns a dictionary of attributes for the SVG element. The default implementation returns the non-null `args` passed to the constructor
- `inner(ctx)` — returns the inner text of the SVG element (for non-unary). Defaults to returing empty string
- `svg(ctx)` — returns the rendered SVG of the element as a `String`. Default implementation constructs SVG from `tag`, `unary`, `props`, and `inner`
