# Teaching Examples

## Using iterations, SymPath, and SymPoints

Prompt: Plot a series of negative quadratics whose peaks form a sine wave.

```javascript
// Define the plot parameters
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
    margin: 0.15, label_size: 0.06, label_border_radius: 0.03, border: 1
});
```

## Using color palettes and rescale

Prompt: Draw a plot of sine waves at various frequencies that are spaced logarithmically. The lines are colored from blue to red according to their frequency.

```javascript
// Generate logarithmically spaced frequencies
let flim_log = [0, 0.6]; let flim = flim_log.map(exp);
let freqs = linspace(...flim_log, 40).map(exp);
let xlim = [0, 2*pi]; let ylim = [-1, 1];

// Define colors for each wave
let palette = f => interpolateHex(red, blue, rescale(f, flim));

// Create sine waves
let waves = freqs.map(f => {
    return SymPath({
        fy: x => sin(f * x), opacity: 0.6,
        xlim, stroke: palette(f),
    });
});

// Create the plot
let plot = Plot([...waves], {
    aspect: phi, xlim, ylim, yticks: 5, grid: true, grid_stroke_dasharray: 3,
    xticks: [[0, '0'], [pi/2, 'π/2'], [pi, 'π'], [3*pi/2, '3π/2'], [2*pi, '2π']],
});

// Add a frame and return the result
return TitleFrame(plot, 'Sine Waves at Various Frequencies', {
    padding: 0.15, margin: 0.1,
    label_size: 0.05, label_border_radius: 0.03,
    border_opacity: 0.25, border_radius: 0.01
});
```