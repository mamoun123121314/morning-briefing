-- ================================================
-- GAMIFICATION MIGRATION
-- Run this in your Supabase SQL Editor
-- Dashboard > SQL Editor > Paste > Run
-- ================================================

-- 1. Add XP columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_level INTEGER DEFAULT 1;

-- 2. Friendships
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own friendships" ON friendships;
CREATE POLICY "Users can read own friendships" ON friendships FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
CREATE POLICY "Users can send friend requests" ON friendships FOR INSERT WITH CHECK (auth.uid() = sender_id);
DROP POLICY IF EXISTS "Users can update received requests" ON friendships;
CREATE POLICY "Users can update received requests" ON friendships FOR UPDATE USING (auth.uid() = receiver_id);

-- 3. XP Transactions
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own XP" ON xp_transactions;
CREATE POLICY "Users can read own XP" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert XP" ON xp_transactions;
CREATE POLICY "System can insert XP" ON xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own achievements" ON achievements;
CREATE POLICY "Users can read own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own achievements" ON achievements;
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  goal INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Everyone can read challenges" ON challenges;
CREATE POLICY "Everyone can read challenges" ON challenges FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own challenges" ON user_challenges;
CREATE POLICY "Users can read own challenges" ON user_challenges FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;
CREATE POLICY "Users can update own challenges" ON user_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON user_challenges FOR UPDATE USING (auth.uid() = user_id);

-- 6. Activity Feed
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read friends activity" ON activity_feed;
CREATE POLICY "Users can read friends activity" ON activity_feed FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM friendships f
    WHERE (f.sender_id = auth.uid() AND f.receiver_id = activity_feed.user_id AND f.status = 'accepted')
       OR (f.receiver_id = auth.uid() AND f.sender_id = activity_feed.user_id AND f.status = 'accepted')
  )
);
DROP POLICY IF EXISTS "Users can insert own activity" ON activity_feed;
CREATE POLICY "Users can insert own activity" ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Functions
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(POWER(xp::FLOAT / 100, 0.6))::INTEGER + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. Seed weekly challenges
INSERT INTO challenges (title, description, challenge_type, goal, xp_reward, starts_at, ends_at)
VALUES
  ('Task Master', 'Complete 5 tasks today', 'tasks', 5, 30, CURRENT_DATE, CURRENT_DATE + 7),
  ('Journal Pro', 'Write 3 journal entries this week', 'journal', 3, 50, CURRENT_DATE, CURRENT_DATE + 7),
  ('Habit Hero', 'Complete all your habits 3 days this week', 'habits', 3, 40, CURRENT_DATE, CURRENT_DATE + 7),
  ('Perfect Week', 'Complete every daily task for 5 days', 'streak', 5, 100, CURRENT_DATE, CURRENT_DATE + 7),
  ('Early Bird', 'Write a journal entry before 10 AM for 3 days', 'journal', 3, 60, CURRENT_DATE, CURRENT_DATE + 7)
ON CONFLICT DO NOTHING;

-- 9. Set initial XP for existing users
UPDATE profiles SET xp = 0, xp_level = 1 WHERE xp IS NULL;
