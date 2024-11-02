// A network with a node on the left saying "hello world" and two nodes on the right saying "hello" and "world". There are arrows going from the left node to each of the right nodes. The nodes have gray backgrounds and rounded corners.
return Network([
  ['A', ['hello', 'world'], [0.25 , 0.5], [0.15, 0.2]],
  ['B', 'hello', [0.8, 0.25]],
  ['C', 'world', [0.7, 0.75]]
], [
  [['A', 'n'], 'B'],
  [['A', 's'], 'C'],
], {
  aspect: phi, directed: true,
  node_fill: '#EEE', node_border_radius: 0.05
});
