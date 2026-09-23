export const stage3 = {
  id: 3,
  slug: "black-belt",
  title: "Black Belt",
  subtitle: "Responsibility",
  emblem: "hand",
  koan: "Then wash your bowl.",
  intro:
    "Dazzling players with poor character stay at white belt here. The belt turns black when body, mind and spirit balance and the player accepts a debt to the world. Ningen, the word for human, is person plus space: we become human only in relation to what surrounds us. Aim to be the best person, not the best player.",
  sections: [
    {
      type: "steps", id: "responsibilities", heading: "The five responsibilities",
      items: [
        { lesson: "responsibilities", title: "To yourself", text: "Develop your talent fully, without excuses." },
        { lesson: "responsibilities", title: "To your talent", text: "Use it in service of something outside yourself, and waste none of it." },
        { lesson: "responsibilities", title: "To your art", text: "Express your song truthfully, even in the face of opposition." },
        { lesson: "responsibilities", title: "To your audience", text: "Respect open ears and foster community." },
        { lesson: "responsibilities", title: "To the Way", text: "Act as sensei to sincere seekers." },
      ],
    },
    {
      type: "tabs", id: "hhh", heading: "Black-belt head, hand and heart",
      tabs: [
        {
          id: "head", label: "Head", intro: "the thinking",
          section: {
            type: "table", id: "head", heading: "Head", columns: ["Lesson", "Core idea"],
            rows: [
              { lesson: "know-one-thing", cells: ["Know one thing", "You need only know where your passion lies. The grandmother with one lasagna recipe and the star chef are both black belts. From one thing, know ten thousand."] },
              { lesson: "statement", cells: ["Make a statement", "Most players noodle. A statement has character (honest, uncompromising), content (kokoro ire, the heart's spirit in each note) and concision (the fewest notes that will do, like a haiku)."] },
              { lesson: "decide", cells: ["Decide", "Above all, players make decisions. Train until the need to decide disappears and your song answers for you, as in the koan of the man hanging by his teeth."] },
              { lesson: "prepare", cells: ["Prepare the mind", "Think beforehand, then do not think. Set-piece players visualize; improvisers prepare strategies, like a fielder before each pitch."] },
              { lesson: "context", cells: ["Establish the context", "You need not show the whole repertoire. Choose what fits, as a martial artist uses a few moves per fight."] },
              { lesson: "changes", cells: ["Play the changes", "Meet change head-on instead of floating over it. The deepest change is the one inside."] },
              { lesson: "frame", cells: ["Draw the frame", "Like a photographer, choose what to include and from what angle: how a solo starts and ends, how an album runs, how you present yourself. Frame one note right and it becomes gigantic."] },
              { lesson: "zoom", cells: ["Zoom in, zoom out", "When small problems loom, widen the lens. When the mind is crowded, narrow it to one note, right now."] },
              { lesson: "trust-the-tale", cells: ["Trust the tale", "Judge the song, not the singer. Even liars can speak truth."] },
              { lesson: "detail", cells: ["Attend to detail", "Nan-in asks Tenno whether his umbrella is left or right of his shoes. Keep the mind in the action, always."] },
              { lesson: "process", cells: ["Process, not product", "There is no bottom line here. Like Santiago in The Old Man and the Sea, be exact so you are ready when luck comes."] },
            ],
          },
        },
        {
          id: "hand", label: "Hand", intro: "the physical",
          section: {
            type: "table", id: "hand", heading: "Hand", columns: ["Lesson", "Core idea"],
            rows: [
              { lesson: "carriage", cells: ["Carriage", "Mastery shows in how you carry the instrument before a note is played."] },
              { lesson: "touch", cells: ["Touch", "Sound has colour. The guitar is a brush and the air is your canvas."] },
              { lesson: "tone", cells: ["Tone", "Hue is to sound as it is to colour. Tone is also inflection: an actor can say \"I love you\" ten thousand ways."] },
              { lesson: "intuition", cells: ["Intuition", "Intellect calculates and is too slow; instinct reacts and can be fooled; intuition senses what has not yet happened. The apprentice Matajuro learned to feel the master's wooden sword coming."] },
              { lesson: "energy", cells: ["Energy", "Ki, the life force, projected through sound like water through a hose. If that sounds mystical, go with the flow."] },
              { lesson: "yin-yang", cells: ["Yin-yang", "Call and response, tension and release, the note and the space between. Not two, one."] },
              { lesson: "two-hands", cells: ["Two hands as one", "Do not think of the fretting hand and the picking hand separately."] },
              { lesson: "balance", cells: ["Balance", "Chudan, the centre from which any move is possible at once. Balance is a hair's breadth: bend a note slightly too far and the impact is gone. Chudan is not the exact middle; you can play behind the beat the chudan way."] },
            ],
          },
        },
        {
          id: "heart", label: "Heart", intro: "the spirit",
          section: {
            type: "table", id: "heart", heading: "Heart", columns: ["Lesson", "Core idea"],
            rows: [
              { lesson: "true-self", cells: ["True self", "Live the same whether or not anyone is watching. A tree falling alone makes the sound of one hand clapping."] },
              { lesson: "conviction", cells: ["Conviction", "Play what you would stake your life on. Be willing to die for your music, but above all live for it."] },
              { lesson: "jamming", cells: ["Jamming", "Listen, lead, follow. Generosity spreads as fast as selfishness. Leaders work with what players can do, not what they cannot. Fit in uniquely, like hot sauce in jambalaya."] },
              { lesson: "recording", cells: ["Recording", "A record bottles your spirit like a genie. Every diary, photo or essay is a record; decide what you want it to say."] },
              { lesson: "first-take", cells: ["First take", "No two passes are the same river. Every note you ever play is the first and only take."] },
              { lesson: "virtuosity", cells: ["Virtuosity", "The root is virtue. The guitar is an axe with a weapon's power; carry a life-giving one."] },
              { lesson: "mastery", cells: ["Mastery", "Those who think themselves masters are not. Mi zai: not yet. Same mountain, farther up."] },
            ],
          },
        },
      ],
    },
  ],
  recall: [
    { q: "List the five responsibilities of a black belt.", a: "To yourself, to your talent, to your art, to your audience, and to the Way." },
    { q: "What are the three qualities of a musical statement, and what Japanese term names the second one?", a: "Character, content and concision. Content is kokoro ire, the heart's spirit put into each note." },
    { q: "Distinguish intellect, instinct and intuition. Which does the book trust most, and why?", a: "Intellect calculates but is too slow; instinct reacts but can be fooled; intuition senses what has not yet happened. The book trusts intuition, which senses what has not yet happened." },
  ],
  reflection: [
    "What is your \"one thing\"? Can you describe your musical statement in a sentence without naming a genre or a technique?",
  ],
};
