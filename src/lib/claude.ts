const INSIGHTS = [
  "Small daily improvements compound into remarkable results. Looking at your week, the days you stuck to your habits were noticeably more productive. What is one tiny adjustment you could make today that would make tomorrow easier?",
  "Notice how your journal entries become more optimistic after you've completed your morning routine. The order of your actions shapes the tone of your day. What would change if you did your most important habit first thing tomorrow?",
  "Consistency matters more than intensity. Your habit streaks show that showing up — even imperfectly — keeps the momentum alive. Where in your life could you lower the bar just enough to stay in motion?",
  "Your entries this week suggest you're hardest on yourself when you're tired. Rest is not a reward for productivity — it's the foundation of it. What would it look like to prioritize sleep as your most important task today?",
  "The goals you've set and the habits you're tracking tell a story of someone who cares about growth. Be careful not to let the pursuit of improvement steal your appreciation for how far you've come. What progress have you made that you haven't stopped to acknowledge?",
  "Patterns emerge when you look at the week as a whole. Some days feel like breakthroughs, others like maintenance — both are essential. Which area of your life needs maintenance today rather than breakthrough?",
  "Your journal reveals that you often know what you need to do — the gap is between knowing and starting. What if you removed the expectation of finishing and just focused on beginning?",
  "The habits you track most consistently are the ones tied to a deeper purpose. When a habit feels stale, reconnect with why you started. What was the original reason you chose to track this habit?",
];

const PROMPTS = [
  "What is one thing you've been avoiding, and what would happen if you faced it today?",
  "What made you smile yesterday that you almost didn't notice?",
  "If today had a theme, what would you want it to be?",
  "What is one belief about yourself that might be holding you back?",
  "Who appreciated you recently, and how did that make you feel?",
  "What would your best self do differently today?",
  "What is something you're looking forward to? If nothing, what could you create to look forward to?",
  "What conversation have you been putting off, and what is the smallest step toward having it?",
  "When did you last feel truly present? What made that moment different?",
  "What is one thing you could remove from your day to create more space?",
  "What did you learn recently that changed your perspective?",
  "If you could send a message to your future self, what would it say?",
  "What is a small act of kindness you could do for yourself today?",
  "What does success look like for this month? What is one step toward it?",
  "What are you pretending not to know?",
  "What would you do today if you weren't afraid?",
  "What is something beautiful you noticed recently?",
  "How are you really feeling right now? Not the polite answer — the real one.",
  "What could you let go of to feel lighter?",
  "What is one thing you have that someone else might envy?",
];

function getSeed(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export async function generateInsight(): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const seed = getSeed(new Date().toISOString().split('T')[0]);
    return pick(INSIGHTS, seed);
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Generate a single, thoughtful paragraph (3-5 sentences) for a daily personal briefing. It should offer a gentle insight about habits, growth, or mindfulness, and end with a reflective question. Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}. Return only the paragraph.`,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
  } catch {}

  return pick(INSIGHTS, getSeed(new Date().toISOString().split('T')[0]));
}

export async function generateJournalPrompt(): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    const seed = getSeed(new Date().toISOString().split('T')[0]);
    return pick(PROMPTS, seed + 1);
  }

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Generate a single, thoughtful reflection question for someone to start their morning journaling. The question should be introspective and actionable. Return ONLY the question, no preamble or explanation.`,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
  } catch {}

  return pick(PROMPTS, getSeed(new Date().toISOString().split('T')[0]) + 1);
}
