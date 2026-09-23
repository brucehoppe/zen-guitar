export const stage2 = {
  id: 2,
  slug: "white-to-black",
  title: "White to Black",
  subtitle: "Practice",
  emblem: "fist",
  koan: "Seven times down, eight times up.",
  intro:
    "This stage is shugyo, training that never ends. The book sets no regimen: copy records, take lessons or teach yourself, as long as learning happens. Build one good habit at a time. Do one thing the right way once, then commit again in the next moment. Along the way, watch for the potholes: one small deviation left unchecked becomes a wide detour.",
  sections: [
    {
      type: "wheel", id: "points", heading: "The twelve points of focus",
      hub: { term: "shugyo", kanji: "修行", gloss: "training without end" },
      items: [
        { lesson: "spirit", name: "Spirit", core: "Guitar is physical training. Pain, fatigue and self-doubt are where the mind grows strong.", image: "Three samurai adages: Don't ask, practice. Seven times down, eight times up. The only opponent is within." },
        { lesson: "rhythm", name: "Rhythm", core: "Anyone with a heartbeat has rhythm. Feel it in the body, not the mind, and lock your pulse to others'.", image: "Hyoshi, \"child's clap\": an audience slowly clapping in unison." },
        { lesson: "technique", name: "Technique", core: "Learn only what you need to say what you have to say. The aim is to play without thinking about technique.", image: "A crude player can have more to say than a virtuoso." },
        { lesson: "feel", name: "Feel", core: "Reading music deepens understanding, like reading Japanese, but it is not the Way. If it feels right, it is right.", image: "Two actors with the same lines; only one makes the character live." },
        { lesson: "perfection", name: "Perfection", core: "Intend every note to be perfect. Most mistakes come from self-consciousness; practice until skill is \"ordinary mind\".", image: "Learning to drive or type: awkward, then automatic. Perfect practice makes perfect." },
        { lesson: "mistakes", name: "Mistakes", core: "Learn from a mistake at once and fold it into the music. Play the wrong note again as if you meant it.", image: "Turn a wince into a smile. When things fall apart, make art." },
        { lesson: "plateaus", name: "Stages and plateaus", core: "Progress comes in bursts between long flat stretches, and the flats lengthen as you advance. Stay on the step you are on.", image: "A climber sometimes moves sideways or down to go up. A flower blooms when it is ready." },
        { lesson: "discipline", name: "Discipline", core: "Do what must be done, when it must be done, as well as it can be done, every time. Discipline is not self-denial.", image: "Joshu: \"Then wash your bowl.\" The karate master who replaced the bulb after class. The butcher whose every cut is his best." },
        { lesson: "limits", name: "Limits", core: "Test your limits, push them, then know and accept them. A limit often forces a creative alternative.", image: "Trees do not reach the sky, but their roots keep growing. The small-handed pianist who became a composer." },
        { lesson: "follow-through", name: "Follow-through", core: "Goals are points on the path, not ends. Carry your spirit through to the far side of every moment.", image: "In a hundred-mile march, ninety is halfway. Suki, the stopping mind a teacher hears from the next room." },
        { lesson: "taste", name: "Taste", core: "Not everyone will like what you play. Develop taste as you develop hearing, then trust it.", image: "The cook who knows how hot he likes his chili." },
        { lesson: "collaboration", name: "Collaboration", core: "Company, vision, chemistry. Choose committed people, follow the strongest vision, and cherish chemistry when it comes.", image: "Two hydrogen and one oxygen: a band whose whole exceeds its parts." },
      ],
    },
    {
      type: "list", id: "collaboration", heading: "Collaboration decision rules",
      items: [
        { title: "Your partner has the vision and you do not", text: "Follow it." },
        { title: "You have the vision and they do not", text: "Invite them in and help them see it." },
        { title: "No one has a vision", text: "Build one before you start, or at least before you finish." },
        { title: "Two strong visions conflict", text: "Seek consensus, but never dilute the result. Know whether the conflict is artistic or ego." },
      ],
    },
    {
      type: "balance", id: "missteps", heading: "The twelve common missteps",
      caption: "Many missteps come in opposite pairs. The correction is a return to centre, chudan, not a swing to the other extreme.",
      pairs: [
        [
          { lesson: "self-doubt", name: "Self-doubt", trap: "Comparing your song with others' and asking if it is good enough for a big stage.", correction: "Return to naive musicianship: innocent, unself-conscious, egoless. A bird does not ask if its song is pretty. Do something, then learn from it." },
          { lesson: "ego", name: "Ego", trap: "Gunslinger swagger, or its mirror, false modesty. Chasing fame as an end.", correction: "Keep enough ego for a strong sense of self and no more. Weigh a compliment like a critique. If you think you have arrived, you have that much farther to go." },
        ],
        [
          { lesson: "halfheartedness", name: "Halfheartedness", trap: "Showing up without being all there. Dragging your feet.", correction: "If it is not fun, something is wrong. Go to the blackboard: find words you can stand behind and write them 10,000 times, meaning it." },
          { lesson: "overearnestness", name: "Overearnestness", trap: "Too eager to please. Going over the top. Mistaking volume for passion.", correction: "Hold power in reserve. Mastery shows in what you hold back. The Way is through restraint." },
        ],
        [
          { lesson: "obsession", name: "Obsession", trap: "Living guitar 24 hours a day.", correction: "Think, breathe, live, then play. You bring to the guitar the sum of what you are. Study the cherry blossom." },
          { lesson: "focus", name: "Loss of focus", trap: "Chasing two rabbits: too little concentration or too little commitment.", correction: "Count silently from one to ten and start over at any interruption. Polish your own path, not others'; at the end all paths converge." },
        ],
      ],
      others: [
        { lesson: "instant-gratification", name: "Instant gratification", trap: "Believing twice the effort halves the time. \"Learn guitar in 24 hours.\"", correction: "You cannot live a year in six months. Maturity means valuing what is hard-earned." },
        { lesson: "speed", name: "Speed", trap: "Treating fast fingers as the measure of ability.", correction: "Speed is a byproduct. Study tempo, pacing, timing and quickness: thought to action, without haste." },
        { lesson: "competition", name: "Competition", trap: "Using other players to prove yourself rather than test yourself.", correction: "Golfers compete against the course. Turn competition inward: the only opponent is within." },
        { lesson: "criticism", name: "Mishandled criticism", trap: "Being pierced by critics, or criticizing to tear down.", correction: "Give criticism to build and take in only what builds. Bad criticism comes from taste, hindsight or ego. Be your own best critic, and do not advertise your flaws." },
        { lesson: "adjust", name: "Failure to adjust", trap: "Freezing when a string breaks, an amp blows or rain falls.", correction: "Kiki: crisis as danger and opportunity. Fall like a cat. The band whose PA died finished the song as a sing-along." },
        { lesson: "overthinking", name: "Overthinking", trap: "Analyzing everything to death.", correction: "Ready, fire, aim. The answer is in action." },
      ],
    },
  ],
  recall: [
    { q: "Name the three samurai adages under Spirit.", a: "Don't ask, practice. Seven times down, eight times up. The only opponent is within." },
    { q: "What is the four-part definition of discipline, and which Zen story illustrates each part?", a: "Do what has to be done, when it has to be done, as well as it can be done, and that way every time. The images are Joshu's \"Then wash your bowl\", the karate master who replaced the bulb after class, and the butcher whose every cut is his best." },
    { q: "What is the difference between tempo, pacing, timing and quickness?", a: "Tempo is the song's road speed. Pacing is how you move within it. Timing is the exact moment to strike. Quickness is thought to action, without haste." },
  ],
  reflection: [
    "Which of the twelve missteps is your current pothole? Which is its opposite, and are you swinging between them?",
    "Which of the twelve points of focus have you never consciously trained? Pick one habit to build this week.",
    "Whose criticism have you let pierce your armor? Which of the three kinds was it?",
  ],
};
