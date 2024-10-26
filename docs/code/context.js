// create a square context of radius 50 centered at 100 and map [0.3, 0.5] to pixel coordinates
let ctx = Context([50, 50, 150, 150]);
let [fx, fy] = [0.3, 0.5];
let [px, py] = ctx.coord_to_pixel([fx, fy]);
return `[${fx}, ${fy}] → [${px}, ${py}]`;
