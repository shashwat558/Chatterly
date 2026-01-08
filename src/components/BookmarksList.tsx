'use client';

import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Bookmark, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { FC, useState } from 'react';
import axios from 'axios';
import { chatHrefConstructor } from '@/lib/utils';

interface BookmarkWithSender {
  messageId: string;
  chatId: string;
  text: string;
  timestamp: number;
  senderId: string;
  bookmarkedAt: number;
  senderName: string;
  senderImage: string;
}

interface BookmarksListProps {
  initialBookmarks: BookmarkWithSender[];
  sessionId: string;
}

const BookmarksList: FC<BookmarksListProps> = ({ initialBookmarks, sessionId }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkWithSender[]>(initialBookmarks);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (isToday(date)) return `Today at ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'HH:mm')}`;
    if (isThisWeek(date)) return format(date, "EEEE 'at' HH:mm");
    return format(date, "MMM d, yyyy 'at' HH:mm");
  };

  const removeBookmark = async (bookmark: BookmarkWithSender) => {
    // Optimistic update
    setBookmarks(prev => prev.filter(b => b.messageId !== bookmark.messageId));

    try {
      await axios.post('/api/message/bookmark', {
        chatId: bookmark.chatId,
        messageId: bookmark.messageId,
        text: bookmark.text,
        timestamp: bookmark.timestamp,
        senderId: bookmark.senderId
      });
    } catch (error) {
      // Revert on error
      setBookmarks(prev => [...prev, bookmark].sort((a, b) => b.bookmarkedAt - a.bookmarkedAt));
      console.error('Failed to remove bookmark', error);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
          <Bookmark className="h-10 w-10 text-amber-300" />
        </div>
        <p className='text-lg text-slate-600 font-medium'>No bookmarks yet</p>
        <p className='text-sm text-slate-400 mt-1'>Save messages by clicking the bookmark icon</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3'>
      {bookmarks.map((bookmark) => {
        const isOwnMessage = bookmark.senderId === sessionId;
        
        return (
          <div
            key={bookmark.messageId}
            className='group flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300'
          >
            {/* Avatar */}
            {bookmark.senderImage && (
              <div className='relative h-10 w-10 shrink-0'>
                <Image
                  src={bookmark.senderImage}
                  alt={bookmark.senderName}
                  fill
                  className='rounded-full ring-2 ring-white shadow-sm'
                  referrerPolicy='no-referrer'
                />
              </div>
            )}

            {/* Content */}
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                <span className='font-semibold text-slate-800 text-sm'>
                  {isOwnMessage ? 'You' : bookmark.senderName}
                </span>
                <span className='text-[11px] text-slate-400'>
                  {formatDate(bookmark.timestamp)}
                </span>
              </div>
              <p className='text-slate-600 text-sm leading-relaxed line-clamp-2'>
                {bookmark.text}
              </p>
              <Link
                href={`/dashboard/chat/${bookmark.chatId}`}
                className='inline-flex items-center gap-1 mt-2 text-xs text-sky-500 hover:text-sky-600 font-medium transition-colors'
              >
                View in chat →
              </Link>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => removeBookmark(bookmark)}
              className='opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all shrink-0'
              aria-label='Remove bookmark'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default BookmarksList;
