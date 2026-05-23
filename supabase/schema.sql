CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  city TEXT,
  latitude FLOAT,
  longitude FLOAT,
  news_interests TEXT[] DEFAULT '{}',
  goals TEXT,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  journal_text TEXT,
  journal_prompt TEXT,
  ai_insight TEXT,
  tasks JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can insert own entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can update own entries" ON daily_entries;

CREATE POLICY "Users can read own entries" ON daily_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON daily_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON daily_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '✅',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own habits" ON habits;
DROP POLICY IF EXISTS "Users can insert own habits" ON habits;
DROP POLICY IF EXISTS "Users can update own habits" ON habits;
DROP POLICY IF EXISTS "Users can delete own habits" ON habits;

CREATE POLICY "Users can read own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(habit_id, date)
);

ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own habit completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can insert own habit completions" ON habit_completions;
DROP POLICY IF EXISTS "Users can update own habit completions" ON habit_completions;

CREATE POLICY "Users can read own habit completions" ON habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit completions" ON habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit completions" ON habit_completions FOR UPDATE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS calendar_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own calendar tokens" ON calendar_tokens;
DROP POLICY IF EXISTS "Users can insert own calendar tokens" ON calendar_tokens;
DROP POLICY IF EXISTS "Users can update own calendar tokens" ON calendar_tokens;

CREATE POLICY "Users can read own calendar tokens" ON calendar_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendar tokens" ON calendar_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendar tokens" ON calendar_tokens FOR UPDATE USING (auth.uid() = user_id);

-- ============================
-- GAMIFICATION: Friends System
-- ============================
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

CREATE POLICY "Users can read own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received requests"
  ON friendships FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ============================
-- GAMIFICATION: XP & Levels
-- ============================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp_level INTEGER DEFAULT 1;

CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own XP"
  ON xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert XP"
  ON xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================
-- GAMIFICATION: Achievements
-- ============================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================
-- GAMIFICATION: Weekly Challenges
-- ============================
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

CREATE POLICY "Everyone can read challenges"
  ON challenges FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge progress"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================
-- GAMIFICATION: Activity Feed
-- ============================
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read friends activity"
  ON activity_feed FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM friendships f
      WHERE (f.sender_id = auth.uid() AND f.receiver_id = activity_feed.user_id AND f.status = 'accepted')
         OR (f.receiver_id = auth.uid() AND f.sender_id = activity_feed.user_id AND f.status = 'accepted')
    )
  );

CREATE POLICY "Users can insert own activity"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================
-- FUNCTION: Level calculator
-- ============================
CREATE OR REPLACE FUNCTION public.calculate_level(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN GREATEST(1, FLOOR(POWER(xp::FLOAT / 100, 0.6))::INTEGER + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================
-- FUNCTION: Award XP + check level up
-- ============================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT
) RETURNS INTEGER AS $$
DECLARE
  old_level INTEGER;
  new_level INTEGER;
BEGIN
  SELECT xp_level INTO old_level FROM profiles WHERE id = p_user_id;

  UPDATE profiles
  SET xp = COALESCE(xp, 0) + p_amount,
      xp_level = calculate_level(COALESCE(xp, 0) + p_amount)
  WHERE id = p_user_id
  RETURNING xp_level INTO new_level;

  INSERT INTO xp_transactions (user_id, amount, reason)
  VALUES (p_user_id, p_amount, p_reason);

  INSERT INTO activity_feed (user_id, activity_type, description, xp_earned)
  VALUES (p_user_id, p_reason,
    CASE
      WHEN p_reason = 'task_completed' THEN 'Completed a task'
      WHEN p_reason = 'journal_written' THEN 'Wrote a journal entry'
      WHEN p_reason = 'habit_completed' THEN 'Completed a habit'
      WHEN p_reason = 'daily_login' THEN 'Logged in for the day'
      ELSE p_reason
    END,
    p_amount
  );

  RETURN new_level - old_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- SEED: Weekly challenges
-- ============================
INSERT INTO challenges (title, description, challenge_type, goal, xp_reward, starts_at, ends_at)
VALUES
  ('Task Master', 'Complete 5 tasks today', 'tasks', 5, 30, CURRENT_DATE, CURRENT_DATE + 7),
  ('Journal Pro', 'Write 3 journal entries this week', 'journal', 3, 50, CURRENT_DATE, CURRENT_DATE + 7),
  ('Habit Hero', 'Complete all your habits 3 days this week', 'habits', 3, 40, CURRENT_DATE, CURRENT_DATE + 7),
  ('Perfect Week', 'Complete every daily task for 5 days', 'streak', 5, 100, CURRENT_DATE, CURRENT_DATE + 7),
  ('Early Bird', 'Write a journal entry before 10 AM for 3 days', 'journal', 3, 60, CURRENT_DATE, CURRENT_DATE + 7)
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
