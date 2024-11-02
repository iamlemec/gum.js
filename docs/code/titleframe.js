// Various food emojis are arrnaged in a spaced out grid and framed with the title "Fruits & Veggies". Each emoji is framed by a rounded square with a gray background.
let emojis = ['🍇', '🥦', '🍔', '🍉', '🍍', '🌽', '🍩', '🥝', '🍟'];
let nodes = emojis.map(e => TextFrame(e, {border_radius: 0.075, fill: '#e6e6e6'}));
let grid = Grid(split(nodes, 3), {spacing: 0.05});
return TitleFrame(grid, 'Fruits & Veggies', {
  margin: 0.1, padding: 0.05, border_radius: 0.02, title_size: 0.065, adjust: true
});
