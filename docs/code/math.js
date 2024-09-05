// example of using math in a plot
func = x => exp(sin(x));
path = SymPath({fy: func, xlim: [0, 2*pi]});
plot = Plot(path, {aspect: phi, ylim: [0, 3]});
return Frame(plot, {margin: 0.15});