// see Element for usage in custom classes
let ctx = Context([50, 50, 150, 150]);
let [fx, fy] = [0.3, 0.5];
let [px, py] = ctx.coord_to_pixel([fx, fy]);
return `[${fx}, ${fy}] → [${px}, ${py}]`;
