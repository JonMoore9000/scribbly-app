'use client';
import { Pencil, Trash2 } from 'lucide-react'
import { Calendar, Maximize2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pin, PinOff } from 'lucide-react';

export default function NoteCard({ note, deleteNote, onTagClick, onClick, onTogglePin, className = '', }: { note: any; deleteNote: (id: string) => void; onTagClick: (tag: string) => void; onClick?: () => void; onTogglePin: (note: any) => void; className?: string; }) {
  return (
    <div className={`notecard bg-white dark:bg-gray-800 p-4 rounded-3xl ${
      note.pinned ? 'border-2 border-yellow-400 shadow-lg' : ''
    } ${className}`}>
      <h2 className="text-xl font-semibold mb-0"><span className="mr-1">{note.emoji}</span>{note.title}</h2>
      <time className="text-xs text-white flex items-center my-1 px-2 py-1 rounded-lg w-fit">
        < Calendar size={14} className="mr-1"/>
        {(() => {
            try {
                return new Date(note.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                });
            } catch {
                return 'Who knows';
            }
        })()}
      </time>
      <div className="prose prose-sm text-gray-700">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="tag flex flex-wrap gap-2 mb-0">
          {note.tags.map((tag: string, index: number) => (
            <span
              key={index}
              onClick={() => onTagClick?.(tag)}
              className=" py-0 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )
      }
      <button
        onClick={() => deleteNote(note.id)}
        className="note-action delete p-1 rounded-3xl text-sm"
      >
        <Trash2 size={14} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation(); // just in case
          onClick?.(); // trigger panel
        }}
        className="note-action edit p-1 rounded-3xl text-sm"
      >
        <Maximize2 size={14} />
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation(); // prevent opening note
          onTogglePin(note);
        }}
        className="pinned note-action p-1 rounded-3xl text-sm"
        title={note.pinned ? 'Unpin' : 'Pin'}
      >
        {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
      </button>
    </div>
  );
}
