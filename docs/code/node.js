// Two boxes with text in them that have black borders and gray interiors. The box in the upper left says "hello" and the box in the lower right says "world!".
let hello = Node('hello', {fill: '#EEE'});
let world = Node('world!', {fill: '#EEE'});
let scat = Points([
  [hello, [0.33, 0.3]], [world, [0.62, 0.7]]
], {size: [0.25, 0.1]});
return scat;
