export const stage1 = {
  id: 1,
  slug: "white-belt",
  title: "White Belt",
  subtitle: "Beginner's Mind",
  emblem: "teacup",
  koan: "What is the sound of one hand clapping?",
  intro:
    "Everyone in the dojo starts at white belt, whatever they already know. The belt is never awarded or upgraded; it turns black on its own through years of use. The question that opens this stage is simple: why are you here? The book's answer is that everyone comes to make a sound, and the sound is ultimately the same one.",
  sections: [
    {
      type: "table", id: "ideas", heading: "Key ideas",
      columns: ["Idea", "What it means", "Where it comes from"],
      rows: [
        { lesson: "empty-cup", cells: ["Empty cup", "Set aside what you already know so new learning can enter.", "Nan-in overfilling a professor's teacup."] },
        { cells: ["Sensei", "Not \"teacher\" but one who has gone before: a guide, not an authority.", "Japanese usage."] },
        { cells: ["Unsui", "The student: cloud and water, floating and flowing, without fixed form.", "Zen term for a travelling monk."] },
        { cells: ["Dojo", "Any place where body, mind and spirit train together. A bedroom or a street corner qualifies.", "\"Place of the Way.\""] },
        { cells: ["Wisdom vs. information", "Chords and theory are information, available anywhere. The dojo teaches only what must be learned through experience.", "The author's framing."] },
      ],
    },
    {
      type: "steps", id: "steps", heading: "The four steps",
      items: [
        { lesson: "wear-the-belt", title: "Wear the white belt", text: "Approach every session as if it were your first time holding a guitar. Each lesson is a teabag; you supply the hot water by relating it to your own life." },
        { lesson: "pick-up", title: "Pick up your guitar", text: "Find an instrument whose sound is beautiful to you. Quality matters, price does not; a broomstick with one string will do. Then take it in hand with intention, even if the intention is only to noodle." },
        { lesson: "tune", title: "Tune", text: "Three levels: tune the instrument to itself; tune yourself to the instrument; tune body, mind and spirit to each other so there is no internal static. Tuning is the common ground that lets people play together at all." },
        { lesson: "play", title: "Play", text: "Play one note and put everything you have into it. Then repeat. Technique serves expression, never the reverse. Style is inborn like a fingerprint and emerges from the inside out." },
      ],
    },
    {
      type: "terms", id: "terms", heading: "Terms to know",
      items: [
        { term: "Katsu", kanji: "喝", text: "The martial-arts shout that builds spirit. The strike and the shout are one thing." },
        { term: "Ch'iyun", kanji: "氣韻", text: "The sympathetic vibration between player and listener that lets a performance transcend separateness." },
      ],
    },
  ],
  recall: [
    { q: "What are the four steps of Zen Guitar, and what are the three levels of \"tune\"?", a: "Wear the white belt, pick up your guitar, tune, play. Tune the instrument to itself, yourself to the instrument, and body, mind and spirit to each other." },
    { q: "Why does the dojo award only one belt? How does it change colour?", a: "Because the belt is never awarded at all. It turns black through years of use, then wears back to white." },
  ],
  reflection: [
    "Why have you come to this place at this time? What sound are you trying to make?",
    "In what area of your life are you already a black belt? What from that area transfers to the guitar?",
  ],
};
