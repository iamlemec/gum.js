// Two boxes with text in them that have black borders and gray interiors. The box in the upper left says "hello" and the box in the lower right says "world!".
let node_attr = {fill: '#eee', size: [0.25, 0.1]};
let hello = Node('hello', [0.33, 0.3], node_attr);
let world = Node('world!', [0.62, 0.7], node_attr);
let group = Group([hello, world]);
return group;
