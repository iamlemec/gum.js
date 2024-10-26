// one large donut in a frame stacked on top of two smaller side-by-side framed donuts
let d = Node('🍩');
let h = HStack([d, d]);
let v = VStack([d, h]);
let f = Frame(v, {margin: 0.1});
return f;
