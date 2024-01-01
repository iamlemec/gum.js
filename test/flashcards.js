// global options
let font = 'Print Clearly';
let aspect = 0.6754;

// font sizing
function Noder(text, args0) {
  let args = {flex: true, padding: 0, border: 0, text_font_family: font, ...args0};
  return Node(text, args);
}

// make fronts
function make_card_front(chars, emoji, word) {
  let uplow = [...chars].map(c => Noder(c, {
    padding: [0, 0.2], border: 1, border_stroke: '#555',
    border_stroke_dasharray: 4, border_stroke_dashoffset: 17
  }));
  let letters = HStack(uplow, {aspect: 1});
  let example = HStack([
    [Noder(emoji,), 0.35],
    [Noder(word, {padding: [0, 0.2], align: ['right', 'middle']}), 0.65],
  ], {spacing: 0.1});
  let stack = VStack([[letters, 0.6], [Spacer(), 0.1], [example, 0.3]]);
  let frame = Frame(stack, {border: 1, padding: 0.15});
  console.log('front', frame.aspect);
  return frame;
}

// make backs
function make_card_back(chars, emoji, word) {
  let frame = Frame(
    Place(
      Noder(emoji, {flex: false, border: 0}),
      {rad: [null, 0.25], expand: true}
    ), {border: 1, aspect}
  );
  console.log('back', frame.aspect);
  return frame;
}

// data in alphabetical order
let data = [
  ['Aa', '🍎', 'Apple'],
  ['Bb', '🐻', 'Bear'],
  ['Cc', '🍪', 'Cookie'],
  ['Dd', '🚪', 'Door'],
  ['Ee', '🐘', 'Elephant'],
  ['Ff', '🔥', 'Fire'],
  ['Gg', '🍇', 'Grape'],
  ['Hh', '🐎', 'Horse'],
  ['Ii', '🧊', 'Ice'],
  ['Jj', '🫙', 'Jar'],
  ['Kk', '🐨', 'Koala'],
  ['Ll', '❤️', 'Love'],
  ['Mm', '🌔', 'Moon'],
  ['Nn', '🔢', 'Number'],
  ['Oo', '🦉', 'Owl'],
  ['Pp', '🫑', 'Pepper'],
  ['Qq', '🤫', 'Quiet'],
  ['Rr', 'R', 'R'],
  ['Ss', 'S', 'S'],
  ['Tt', 'T', 'T'],
  ['Uu', 'U', 'U'],
  ['Vv', 'V', 'V'],
  ['Ww', 'W', 'W'],
  ['Xx', 'X', 'X'],
  ['Yy', 'Y', 'Y'],
  ['Zz', 'Z', 'Z'],
  ['Zz', 'Z', 'Z'],
  ['Zz', 'Z', 'Z'],
  ['Zz', 'Z', 'Z'],
  ['Zz', 'Z', 'Z'],
  ['Zz', 'Z', 'Z'],
  ['Zz', 'Z', 'Z'],
];

// select page
let page = 3;
let front = (page % 2 != 0);
maker = front ? make_card_front : make_card_back;
data = reshape((page < 3) ? data.slice(0, 16) : data.slice(16), [4, 4]);
data = front ? data : data.map(row => row.reverse());

// construct grid
let grid = VStack(
  data.map(
    row => HStack(row.map(([c, e, w]) => maker(c, e, w)))
  )
);
return Frame(grid, {margin: 0.01});
