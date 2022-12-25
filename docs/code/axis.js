// goofy axis example
let ticks = zip(linspace(0, 1, 5), ['🗻', '🚀', '🐋', '🍉', '🍩']);
let axis = Axis('h', ticks, {label_size: 0.5, tick_pos: 'both'});
let frame = Frame(axis, {aspect: 5, margin: [0.1, 0.3, 0.1, 0.7]});
return frame;
