// mmm, stack it up!
let d = Node('🍩');
let h = HStack([d, d]);
let v = VStack([d, h]);
let f = Frame(v, {margin: 0.1});
return f;
