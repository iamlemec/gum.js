// fancy frame for text a la Node
let text = Text('hello!');
let frame = Frame(text, {
    padding: 0.1, border: 1, margin: 0.1,
    border_stroke_dasharray: 5, border_radius: 0.05
});
return frame;
