// draw a plus symbol in a frame and place it in the bottom left corner
let plus = Group([VLine(0.5), HLine(0.5)]);
let frame = Frame(plus, {
    padding: 0.2, border: 1, border_radius: 0.05, fill: '#EEE'
});
return Place(frame, {pos: [0.3, 0.7], rad: 0.1});
