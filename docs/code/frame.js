// simple frame for text a la Node
let text = Text('hello!', {
    family: 'IBMPlexSans', weight: 100
});
let frame = Frame(text, {
    padding: 0.1, border: 1, margin: 0.1, border_stroke_dasharray: 5
});
return frame;
