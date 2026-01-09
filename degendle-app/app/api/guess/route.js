// ============================================================================
// POST /api/guess - Validates a guess server-side
// Compatible with Next.js 16.1+
// ============================================================================

// Same puzzle database - keep in sync with /api/puzzle/route.js
// In production, move this to a shared module or database
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

// Rate limiting map (in production, use Redis or Vercel KV)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

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

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { timestamp: now, count: 1 });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

export async function POST(request) {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429 }
    );
  }
  
  try {
    const body = await request.json();
    const { guess, guessNumber } = body;
    
    // Validate input
    if (!guess || typeof guess !== 'string') {
      return Response.json(
        { error: 'Invalid guess' },
        { status: 400 }
      );
    }
    
    if (typeof guessNumber !== 'number' || guessNumber < 1 || guessNumber > 5) {
      return Response.json(
        { error: 'Invalid guess number' },
        { status: 400 }
      );
    }
    
    const puzzle = getTodaysPuzzle();
    const guessLower = guess.toLowerCase().trim();
    
    // Check if answer matches (supports single string or array of valid answers)
    let isCorrect = false;
    let displayAnswer = puzzle.answer;
    
    if (Array.isArray(puzzle.answer)) {
      isCorrect = puzzle.answer.some(ans => guessLower === ans.toLowerCase().trim());
      displayAnswer = puzzle.answer[0]; // Show first answer as the "official" one
    } else {
      isCorrect = guessLower === puzzle.answer.toLowerCase().trim();
    }
    
    const isLastGuess = guessNumber >= 5;
    const gameOver = isCorrect || isLastGuess;
    
    // Build response
    const response = {
      correct: isCorrect,
      guessNumber,
      gameOver,
    };
    
    // Only reveal answer if game is over
    if (gameOver) {
      response.answer = displayAnswer;
    }
    
    return Response.json(response);
    
  } catch (error) {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
