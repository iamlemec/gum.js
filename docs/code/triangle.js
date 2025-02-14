// make a diamond shape with two triangles, the triangle on top is red and the triangle on the bottom is blue
let tri2 = VStack([
    Triangle({fill: red, stroke: 'none'}),
    Rotate(Triangle({fill: blue, stroke: 'none'}), 180),
]);
return Place(tri2, {rad: [0.2, 0.3]});
