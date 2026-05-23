'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { LoadingCard } from '@/components/shared/LoadingCard';
import { Target, Plus, X } from 'lucide-react';
import { getToday, generateId } from '@/lib/utils';
import { useXP } from '@/hooks/useXP';
import type { Task } from '@/types';

export function FocusCard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { earnXP } = useXP();
  const supabase = createClient();
  const today = getToday();

  useEffect(() => {
    async function loadTasks() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
          .from('daily_entries')
          .select('tasks')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (error) {
          setError(error.message);
        } else if (data?.tasks) {
          setTasks(data.tasks as Task[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      }
      setLoading(false);
    }

    loadTasks();
  }, [supabase, today]);

  const saveTasks = useCallback(
    async (updatedTasks: Task[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase.from('daily_entries').upsert(
        { user_id: user.id, date: today, tasks: updatedTasks },
        { onConflict: 'user_id,date' }
      );

      if (error) {
        setError(error.message);
        return false;
      }
      setError('');
      return true;
    },
    [supabase, today]
  );

  async function addTask() {
    const text = newTaskText.trim();
    if (!text || tasks.length >= 3) return;

    const newTask: Task = { id: generateId(), text, completed: false };
    const updated = [...tasks, newTask];
    setTasks(updated);
    setNewTaskText('');
    const ok = await saveTasks(updated);
    if (!ok) setTasks(tasks);
  }

  async function toggleTask(id: string) {
    const task = tasks.find((t) => t.id === id);
    const becomingCompleted = task && !task.completed;
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    const ok = await saveTasks(updated);
    if (ok) {
      if (becomingCompleted) earnXP('task_completed');
    } else {
      setTasks(tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
    }
  }

  async function removeTask(id: string) {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    const ok = await saveTasks(updated);
    if (!ok) setTasks(tasks);
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  if (loading) return <LoadingCard height="h-48" />;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Today&apos;s Focus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="text-sm text-destructive mb-3 bg-destructive/10 rounded-lg p-2">{error}</p>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-text-secondary">Progress</span>
            <span className="font-medium">{completedCount} of {tasks.length} done</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-2 mb-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 group">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <span className={`flex-1 text-sm transition-all duration-200 ${task.completed ? 'line-through text-text-secondary' : ''}`}>
                {task.text}
              </span>
              <button
                onClick={() => removeTask(task.id)}
                title="Remove task"
                className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-destructive transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {tasks.length < 3 && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
              className="h-9 text-sm"
            />
            <button onClick={addTask} title="Add task" className="p-2 rounded-lg hover:bg-surface transition-colors cursor-pointer">
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
