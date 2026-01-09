// ============================================================================
// GET /api/puzzle - Returns today's puzzle hint (no answer!)
// Compatible with Next.js 16.1+
// ============================================================================

// Puzzle database - in production, move this to a database like Vercel KV or Supabase
const puzzles = [
  { hint: "HOT AIR RISES", answer: "fartcoin", category: "Memecoin" },
  { hint: "WAGBO", answer: "okay bears", category: "NFT Project" },
  { hint: "GAKE", answer: "candle", category: "Crypto Slang" },
  { hint: "NOOT NOOT", answer: "pesky penguins", category: "NFT Project" },
  { hint: "4", answer: "cz", category: "Crypto Personality" },
  { hint: "33,3", answer: "degods", category: "NFT Project" },
  { hint: "REJECT HUMANITY", answer: ["smb", "solana monkey business"], category: "NFT Project" },
  { hint: "313", answer: "cets", category: "NFT Project" },
  { hint: "ARF ARF", answer: "sappy seals", category: "NFT Project" },
];

// Get puzzle index based on date (same puzzle for everyone on the same day)
function getDayNumber() {
  const today = new Date();
  const startDate = new Date('2024-01-01');
  return Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
}

function getTodaysPuzzle() {
  const dayNumber = getDayNumber();
  const puzzleIndex = (dayNumber - 1) % puzzles.length;
  return { ...puzzles[puzzleIndex], dayNumber };
}

export async function GET() {
  const puzzle = getTodaysPuzzle();
  
  // Only return hint and day number - NEVER the answer!
  return Response.json({
    hint: puzzle.hint,
    category: puzzle.category,
    dayNumber: puzzle.dayNumber,
  });
}
