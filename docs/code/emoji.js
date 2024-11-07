// draw a row of emojis with various faces
let tags = ['grinning', 'neutral_face', 'confused', 'scream', 'joy', 'heart_eyes'];
let row = HStack(tags.map(Emoji), {spacing: 0.1});
return Frame(row, {padding: 0.1});
