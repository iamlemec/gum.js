// see Element for usage in custom classes
let ctx = Context([50, 50, 150, 150], {frac: [0, 0, 10, 10]});
let [p] = ctx.coord_to_pixel([[3, 5]]);
return `p = [${p}]`;
