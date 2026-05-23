'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Copy, Check, Share2, X, Mail } from 'lucide-react';

export function InviteFriends() {
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://daily-briefing-lime.vercel.app';

  const shareText = `Start each day with clarity! 🌅 Morning Briefing is a free daily dashboard with weather, news, habits, journaling, achievements, and community leaderboards. Try it: ${inviteLink}`;

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: 'Morning Briefing', text: shareText, url: inviteLink }).catch(() => {});
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Invite Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">
          Share Morning Briefing with friends. When they join, challenge each other on leaderboards!
        </p>

        <div className="flex gap-2">
          <Input value={inviteLink} readOnly className="text-xs" />
          <Button variant="outline" size="icon" onClick={copyLink} title="Copy invite link">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={share}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareText)}`, '_blank')}
          >
            <X className="w-4 h-4 mr-2" />
            X
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(`mailto:?subject=Morning Briefing&body=${encodeURIComponent(shareText)}`, '_blank')}
          >
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
