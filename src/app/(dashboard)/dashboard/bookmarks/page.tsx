import BookmarksList from '@/components/BookmarksList';
import { fetchRedis } from '@/helpers/redis';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import React, { FC } from 'react';


interface Bookmark {
  messageId: string;
  chatId: string;
  text: string;
  timestamp: number;
  senderId: string;
  bookmarkedAt: number;
}

const page: FC = async () => {
  const session = await getServerSession(authOptions);
  if (!session) return notFound();

  const bookmarksRaw = await db.zrange(`user:${session.user.id}:bookmarks`, 0, -1, { rev: true }) as any[];
  
  const bookmarks: Bookmark[] = bookmarksRaw.map((b: any) => 
    typeof b === 'string' ? JSON.parse(b) : b
  );

  // Fetch sender info for each bookmark
  const bookmarksWithSender = await Promise.all(
    bookmarks.map(async (bookmark) => {
      try {
        const senderRaw = await fetchRedis('get', `user:${bookmark.senderId}`) as string;
        const sender = JSON.parse(senderRaw) as User;
        return {
          ...bookmark,
          senderName: sender.name,
          senderImage: sender.image
        };
      } catch {
        return {
          ...bookmark,
          senderName: 'Unknown',
          senderImage: ''
        };
      }
    })
  );

  return (
    <main className='relative min-h-full'>
      <div className='relative z-10 pt-8 pb-12 px-8 max-w-3xl mx-auto'>
        <div className='mb-8'>
          <h1 className='font-bold text-3xl text-slate-800 mb-2'>Bookmarks</h1>
          <p className='text-slate-500'>Messages you&#39;ve saved for later</p>
        </div>

        <div className='glass-panel rounded-3xl p-6 shadow-lg'>
          <BookmarksList initialBookmarks={bookmarksWithSender} sessionId={session.user.id} />
        </div>
      </div>
    </main>
  );
};

export default page;
