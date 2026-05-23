import { create } from 'zustand';
import type { Profile, DailyEntry, Habit, HabitCompletion, WeatherData, CalendarEvent, Article, AIInsight } from '@/types';

interface AppState {
  profile: Profile | null;
  dailyEntry: DailyEntry | null;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  weather: WeatherData | null;
  calendarEvents: CalendarEvent[];
  news: Article[];
  aiInsight: AIInsight | null;
  isLoading: Record<string, boolean>;
  error: Record<string, string | null>;

  setProfile: (profile: Profile | null) => void;
  setDailyEntry: (entry: DailyEntry | null) => void;
  setHabits: (habits: Habit[]) => void;
  setHabitCompletions: (completions: HabitCompletion[]) => void;
  setWeather: (weather: WeatherData | null) => void;
  setCalendarEvents: (events: CalendarEvent[]) => void;
  setNews: (news: Article[]) => void;
  setAIInsight: (insight: AIInsight | null) => void;
  setLoading: (key: string, value: boolean) => void;
  setError: (key: string, value: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  profile: null,
  dailyEntry: null,
  habits: [],
  habitCompletions: [],
  weather: null,
  calendarEvents: [],
  news: [],
  aiInsight: null,
  isLoading: {},
  error: {},

  setProfile: (profile) => set({ profile }),
  setDailyEntry: (entry) => set({ dailyEntry: entry }),
  setHabits: (habits) => set({ habits }),
  setHabitCompletions: (completions) => set({ habitCompletions: completions }),
  setWeather: (weather) => set({ weather }),
  setCalendarEvents: (events) => set({ calendarEvents: events }),
  setNews: (news) => set({ news }),
  setAIInsight: (insight) => set({ aiInsight: insight }),
  setLoading: (key, value) =>
    set((state) => ({ isLoading: { ...state.isLoading, [key]: value } })),
  setError: (key, value) =>
    set((state) => ({ error: { ...state.error, [key]: value } })),
}));
