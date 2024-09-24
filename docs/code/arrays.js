// array example
let emoji = zip(range(1, 6), ['🗻', '🚀', '🐋', '🍉', '🍩']);
let points = Points(emoji.map(([i, e]) => [Text(e), [i, i]]), {size: 0.4});
let plot = Plot(points, {xlim: [0, 6], ylim: [0, 6]});
let frame = Frame(plot, {margin: 0.15});
return frame;