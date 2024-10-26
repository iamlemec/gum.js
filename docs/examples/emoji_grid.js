// Four by three grid of boxes, each with a different emoji in it. The emojis are a random selection of fruits and candies.
let data = [
  '🍩🍦🍨🍫🍌',
  '🍕🍉🍒🍇🍐',
  '🥝🍎🍓🍬🍪',
]
let rows = data.map(s => [...s].map(c => Node(c, {aspect: 1})));
let grid = Grid(rows);
return Frame(grid, {margin: 0.1});
