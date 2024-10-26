// Three rows of nodes connected by lines. The first row has three nodes for product categories 1, 2, and 3. The second row has three nodes for Wikipedia text 1, 2, and 3. And the third row has five notes for patent abstract 1 through 5. The first two rows are connected by bi-directional filled in arrows. The second and third rows are partially connected by curved lines.

// define cell data
let locs = range(5).map(i => 0.2*i+0.1);
let cells1 = [null, ...range(1, 4).map(i => ['Product', `Category ${i}`]), null];
let cells2 = [null, ...range(1, 4).map(i => ['Wikipedia', `Text ${i}`]), null];
let cells3 = range(1, 6).map(i => ['Patent', `Abstract ${i}`]);

// make cell rows
let noder = s => (s == null) ? Spacer() : Node(s, {
  aspect: 3, padding: 0.2, flex: true, border_radius: 0.05
});
let [row1, row2, row3] = [cells1, cells2, cells3].map(
  c => HStack(c.map(noder), {spacing: 0.02})
);

// make various edges
let bidi = Edge([0.5, 0], [0.5, 1], {
  arrow_beg: true, arrow_end: true, arrow_size: [0.1, 0.075], arrow_fill: '#DDD', arrow_base: true
});
let edges1 = HStack([Spacer(), bidi, bidi, bidi, Spacer()]);
let elocs2 = [[0, 1], [1, 1], [2, 3], [3, 2], [4, 3]].map(
  ([x1, x2]) => [[locs[x1], 1], [locs[x2], 0]]
);
let edges2 = Group(elocs2.map(([p1, p2]) => Edge(p1, p2)));

// stack together and frame
let rows = VStack([row1, edges1, row2, edges2, row3], {aspect: phi});
return Frame(rows, {margin: 0.05});
