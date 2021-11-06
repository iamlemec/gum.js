// scatter squares

let n = 13;
let r0 = Rect();
let p1 = Scatter(
    linspace(0.1, 0.9, n).map(x => [r0, [x, x]]),
    {r: 0.1, stroke: 'red', opacity: 0.75}
);
let p2 = Scatter(
    linspace(0.1, 0.9, n).map(x => [r0, [1 - x, x]]),
    {r: 0.1, stroke: 'blue', opacity: 0.75}
);
let gg = Group([p1, p2]);
return Frame(gg, {margin: 0.05});
