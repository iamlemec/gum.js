// A network with a node on the left saying "hello world" and two nodes on the right saying "hello" and "world". There are arrows going from the left node to each of the right nodes. The nodes have gray backgrounds and rounded corners.
let node_args = {fill: '#eee', border_radius: 0.05};
let node1 = Node(['hello', 'world'], [0.25, 0.5], {size: 0.15, ...node_args});
let node2 = Node('hello', [0.7, 0.25], node_args);
let node3 = Node('world', [0.8, 0.75], node_args);
let edge1 = Edge([node1, 'n'], node2);
let edge2 = Edge([node1, 's'], node3);
let group = Group([node1, node2, node3, edge1, edge2], {aspect: phi});
return Frame(group, {padding: 0.05, border: 1, margin: 0.1});
