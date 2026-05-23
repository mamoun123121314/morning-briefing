export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  news_interests: string[];
  goals: string | null;
  theme: 'dark' | 'light';
  xp: number;
  xp_level: number;
  created_at: string;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  date: string;
  journal_text: string | null;
  journal_prompt: string | null;
  ai_insight: string | null;
  tasks: Task[];
  created_at: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  hourly: {
    time: string;
    temperature: number;
    condition: string;
  }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

export interface Article {
  source: string;
  title: string;
  url: string;
  publishedAt: string;
  urlToImage: string | null;
}

export interface AIInsight {
  insight: string;
  date: string;
}

export interface JournalPrompt {
  prompt: string;
  date: string;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

// Gamification Types
export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  friend?: Profile;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_key: string;
  unlocked_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  goal: number;
  xp_reward: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
  progress?: number;
  completed?: boolean;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
}

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  xp_earned: number;
  created_at: string;
  profile?: Profile;
}

export interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  xp_level: number;
  city: string | null;
}

export interface XPNotification {
  id: string;
  amount: number;
  reason: string;
}
