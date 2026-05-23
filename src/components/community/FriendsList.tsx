'use client';

import { useState, useEffect } from 'react';
import { useFriends } from '@/hooks/useFriends';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus, UserCheck, UserX, Users, Clock, ArrowLeft } from 'lucide-react';

export function FriendsList() {
  const { friends, loading, searchResults, searching, loadFriends, searchUsers, sendRequest, respondToRequest, clearSearch } = useFriends();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  useEffect(() => {
    if (showSearch && searchQuery.length >= 2) {
      const timeout = setTimeout(() => searchUsers(searchQuery), 300);
      return () => clearTimeout(timeout);
    }
    clearSearch();
  }, [searchQuery, showSearch, searchUsers, clearSearch]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Friends
          {!loading && <span className="text-xs font-normal text-text-secondary">({friends.accepted.length})</span>}
        </CardTitle>
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
          >
            <UserPlus className="w-3 h-3" />
            Add Friend
          </button>
        ) : (
          <button
            onClick={() => { setShowSearch(false); setSearchQuery(''); }}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
          </div>
        ) : showSearch ? (
          <div className="space-y-3">
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searching && <Loader2 className="w-4 h-4 animate-spin mx-auto text-text-secondary" />}
            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface/50">
                    <span className="text-sm truncate flex-1">{profile.display_name ?? 'Anonymous'}</span>
                    {profile.city && <span className="text-xs text-text-secondary mr-2">{profile.city}</span>}
                    {profile.friendship_status ? (
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => sendRequest(profile.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        Add
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 && !searching ? (
              <p className="text-xs text-text-secondary text-center">No users found</p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {friends.pending.length > 0 && (
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                  Pending Requests ({friends.pending.length})
                </p>
                {friends.pending.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-primary/5 mb-2">
                    <span className="text-sm truncate flex-1">{p.profile.display_name ?? 'Anonymous'}</span>
                    {p.direction === 'received' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => respondToRequest(p.id, true)}
                          className="flex items-center gap-1 text-xs text-green-500 hover:underline cursor-pointer"
                        >
                          <UserCheck className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => respondToRequest(p.id, false)}
                          className="flex items-center gap-1 text-xs text-destructive hover:underline cursor-pointer"
                        >
                          <UserX className="w-3 h-3" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Awaiting response
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {friends.accepted.length > 0 ? (
              <div>
                <p className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                  All Friends ({friends.accepted.length})
                </p>
                <div className="space-y-1">
                  {friends.accepted.map((profile) => (
                    <div key={profile.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {(profile.display_name ?? 'A')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile.display_name ?? 'Anonymous'}</p>
                        {profile.city && <p className="text-xs text-text-secondary">{profile.city}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                No friends yet. Search for users to add!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
