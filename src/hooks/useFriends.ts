'use client';

import { useState, useCallback } from 'react';
import type { Profile } from '@/types';

interface FriendSearchResult extends Profile {
  friendship_status: string | null;
}

interface FriendsData {
  accepted: Profile[];
  pending: { id: string; profile: Profile; direction: 'sent' | 'received' }[];
}

export function useFriends() {
  const [friends, setFriends] = useState<FriendsData>({ accepted: [], pending: [] });
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<FriendSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/friends/list');
      const json = await res.json();
      if (json.data) setFriends(json.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setSearchResults(json.data ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const sendRequest = useCallback(async (receiverId: string) => {
    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiver_id: receiverId }),
    });
    const json = await res.json();
    if (json.data) {
      setSearchResults((prev) => prev.map((p) => p.id === receiverId ? { ...p, friendship_status: 'pending' } : p));
    }
    return json;
  }, []);

  const respondToRequest = useCallback(async (friendshipId: string, accept: boolean) => {
    const res = await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendship_id: friendshipId, accept }),
    });
    const json = await res.json();
    if (json.data) await loadFriends();
    return json;
  }, [loadFriends]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
  }, []);

  return {
    friends,
    loading,
    searchResults,
    searching,
    loadFriends,
    searchUsers,
    sendRequest,
    respondToRequest,
    clearSearch,
  };
}
