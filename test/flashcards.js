// global options
let font = 'Print Clearly';
let aspect = 0.6754245246395115;

// font sizing
function Noder(text, args0) {
  let args = {flex: true, padding: 0, border: 0, text_font_family: font, ...args0};
  return Node(text, args);
}

// make fronts
function make_card_front(char, emoji, word) {
  let pair = [char.toUpperCase(), char.toLowerCase()];
  let uplow = pair.map(c => Noder(c, {
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
function make_card_back(char, emoji, word) {
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
  ['a', '🍎', 'Apple'],
  ['b', '🐻', 'Bear'],
  ['c', '🍪', 'Cookie'],
  ['d', '🚪', 'Door'],
  ['e', '🐘', 'Elephant'],
  ['f', '🔥', 'Fire'],
  ['g', '🍇', 'Grape'],
  ['h', '🐎', 'Horse'],
  ['i', '🧊', 'Ice'],
  ['j', '🫙', 'Jar'],
  ['k', '🐨', 'Koala'],
  ['l', '❤️', 'Love'],
  ['m', '🌔', 'Moon'],
  ['n', '🔢', 'Number'],
  ['o', '🦉', 'Owl'],
  ['p', '🫑', 'Pepper'],
  ['q', '🤫', 'Quiet'],
  ['r', '📏', 'Ruler'],
  ['s', '🐌', 'Snail'],
  ['t', '🔼', 'Triangle'],
  ['u', '🍜', 'Udon'],
  ['v', '🎻', 'Violin'],
  ['w', '🐺', 'Wolf'],
  ['x', '🩻', 'X-ray'],
  ['y', '🥱', 'Yawn'],
  ['z', '🦓', 'Zebra'],
  [null, null, null],
  [null, null, null],
  [null, null, null],
  [null, null, null],
  [null, null, null],
  [null, null, null],
];

// select page
let page = 3;
let front = (page % 2 == 0);
let sheet = (page - (page % 2)) / 2;

// select data
data = split(data.slice(sheet*16, (sheet+1)*16), 4);
data = front ? data : data.map(row => row.reverse());

// get constructor
maker0 = front ? make_card_front : make_card_back;
maker = (c, e, w) => (c == null) ? Spacer({aspect}) : maker0(c, e, w);

// construct grid
let grid = VStack(
  data.map(
    row => HStack(row.map(([c, e, w]) => maker(c, e, w)))
  )
);
return Frame(grid, {margin: 0.01});
