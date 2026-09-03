/** Original paddle / multiverse one-liners. Not licensed quotes. */
export const QUOTES: { id: string; text: string }[] = [
  { id: "q-00", text: "In this universe, the paddle chooses you." },
  { id: "q-01", text: "Two boards. One destiny. Zero chill." },
  { id: "q-02", text: "Across every Earth, the rubber still grips." },
  { id: "q-03", text: "Spin hard enough and the multiverse blinks." },
  { id: "q-04", text: "A bye today. A legend tomorrow." },
  { id: "q-05", text: "Call the table. Split the timeline." },
  { id: "q-06", text: "Red rubber. Cyan afterimage. Make contact." },
  { id: "q-07", text: "Your counterpart already missed. Don't you." },
  { id: "q-08", text: "Bracket A believes in fate. Bracket B writes it." },
  { id: "q-09", text: "Serve like the walls are optional." },
  { id: "q-10", text: "The ball is round. The night is not." },
  { id: "q-11", text: "Halftone dots. Full-tone winners." },
  { id: "q-12", text: "If you can dodge a rally, you can dodge a seed." },
  { id: "q-13", text: "No villains. Just backhands with opinions." },
  { id: "q-14", text: "The Quest is third. The thirst is first." },
  { id: "q-15", text: "Paddle up. Reality is a side-out away." },
  { id: "q-16", text: "Seed one got a bye. Seed you got a story." },
  { id: "q-17", text: "Slam the caption. Then slam the winner." },
  { id: "q-18", text: "Every point is a portal. Pick one." },
  { id: "q-19", text: "We don't miss. We visit other brackets." },
  { id: "q-20", text: "Table's hot. Timeline's hotter." },
  { id: "q-21", text: "Advanced players: three and three. Chaos: all of us." },
  { id: "q-22", text: "The ink is wet. The match is wetter." },
  { id: "q-23", text: "From R64 to the RTX. Earn the glow." },
  { id: "q-24", text: "Loser of the board final still hunts the Quest." },
  { id: "q-25", text: "Mark the slot. Trust the poll. Undo if the universe glitched." },
  { id: "q-26", text: "A 1-second refresh is faster than a paper card." },
  { id: "q-27", text: "PIN shared. Glory not." },
  { id: "q-28", text: "Late arrival? There's a bye with your name on it." },
  { id: "q-29", text: "Beginner band, infinite heart." },
  { id: "q-30", text: "Intermediate? That's code for dangerous." },
  { id: "q-31", text: "The snake deal split the stars. Now split the ball." },
  { id: "q-32", text: "Grand Final is just two survivors arguing with physics." },
  { id: "q-33", text: "Cyan left. Magenta right. Winner dead center." },
  { id: "q-34", text: "Don't tap until the gold confirm glows." },
  { id: "q-35", text: "Physical board, digital twin. Same slot numbers." },
  { id: "q-36", text: "Freeze at 6:30. Thaw only for late heroes." },
  { id: "q-37", text: "This caption is original. This rally shouldn't be." },
  { id: "q-38", text: "Switch 2 is second. Switching hands is allowed." },
  { id: "q-39", text: "When the slam hits 1.8 seconds, the room already knows." },
];

export function quoteById(id: string) {
  return QUOTES.find((q) => q.id === id) ?? QUOTES[0];
}

export function quoteIdFor(matchId: string): string {
  let h = 2166136261;
  for (let i = 0; i < matchId.length; i++) {
    h ^= matchId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Math.abs(h) % QUOTES.length;
  return QUOTES[idx].id;
}
