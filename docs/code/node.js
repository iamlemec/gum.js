// simple greeting
let hello = Node('hello', {fill: '#EEE'});
let world = Node('world!', {fill: '#EEE'});
let scat = Points([
  [hello, [0.33, 0.3]], [world, [0.62, 0.7]]
], {size: [0.25, 0.1]});
return scat;
