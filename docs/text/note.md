# Note

<span class="inherit">[Place](#Place) > [Container](#Container) > [Element](#Element)</span>

Place a text note at a particular location with a given size. Simple wrapper around [Place](#Place). Additionally supports LaTeX rendering.

Positional arguments:
- `text` — text to display

Keyword arguments (plus any [Place](#Place) arguments):
- `pos`/`rad` = `[0.5, 0.5]` — a position and radius specifying rectangle placement
- `latex` — whether to run through LaTeX renderer
