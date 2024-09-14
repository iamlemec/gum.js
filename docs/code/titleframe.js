// mmm... pineapple pizza
let emojis = ['🍇', '🥦', '🍔', '🍉', '🍍', '🌽', '🍩', '🥝', '🍟'];
let nodes = emojis.map(e => Node(e, {border_radius: 0.075, fill: '#e9e9e9'}));
let grid = Grid(split(nodes, 3), {spacing: 0.05});

// Frame the entire composition
return TitleFrame(grid, 'Fruits & Veggies', {
  margin: 0.15, padding: 0.075, border_radius: 0.02,
  title_size: 0.075, title_offset: -0.5, title_border_radius: 0.05
});
