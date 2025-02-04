// A gray line spiraling clockwise inward in a triangular path. The background is nearly black with rounded corners.
let spiral = SymPath({
  fx: t => 0.43 + 0.5*exp(-0.05*t)*cos(t),
  fy: t => 0.48 + 0.5*exp(-0.05*t)*sin(t),
  tlim: [0, 1000], N: 500, stroke: '#BBB'
});
let frame = Frame(spiral, {
  padding: 0.05, border: 1, margin: 0.05,
  border_rounded: 0.02, border_fill: '#111'
});
return frame;
