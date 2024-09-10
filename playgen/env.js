// gum simulation environment

// code to elements
function executeCode(src, args) {
    return gum.renderGumSafe(src, args);
}

// elements to svg
function renderData(data, args) {
    return data;
}

// starting code
const startCode = `// Define the plot parameters
let a = 0.5; // Controls the width of the parabolas
let N = 25; // Number of quadratic functions

// Define the ranges
let xlim = [0, 2*pi];
let ylim = [-2, 2];

// Create the quadratic functions
let quads = linspace(...xlim, N).map(x0 => {
    let y0 = sin(x0);
    return SymPath({
        fy: x => clamp(y0 - a*(x - x0)**2, ylim), opacity: 0.85,
        xlim, stroke: interpolateHex(blue, red, rescale(x0, xlim))
    });
});

// Create line and marker points for the peaks
let shape = Circle({fill: '#888'});
let sine = SymPath({fy: sin, xlim, stroke_dasharray: 5});
let peaks = SymPoints({fy: sin, xlim, N, shape, size: 0.04});

// Create the plot
let plot = Plot([sine, peaks, ...quads], {
    aspect: phi, xlim, ylim, ytick: 5, grid: true, grid_stroke_dasharray: 3,
    xticks: [[0, '0'], [pi/2, 'π/2'], [pi, 'π'], [3*pi/2, '3π/2'], [2*pi, '2π']],
});

// Return the framed plot
return TitleFrame(plot, 'Quadratic Functions with Sine Wave Peaks', {
    margin: 0.15, title_size: 0.065, title_border_radius: 0.03, border: 1
});`;
