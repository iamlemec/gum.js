// framed inward spiral
let spiral = SymPath({
    fx: t => 0.5 + 0.5*exp(-0.05*t)*cos(t),
    fy: t => 0.5 + 0.5*exp(-0.05*t)*sin(t),
    tlim: [0, 100], N: 1000
});
let frame = Frame(spiral, {
    padding: 0.05, border: 1, margin: 0.05});
return frame;
