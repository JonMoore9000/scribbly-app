'use client';

import { useState, useEffect } from 'react';
import NoteForm from './components/noteform';
import NoteCard from './components/notecard';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { X } from 'lucide-react';
import { auth } from "./../lib/firebase";
import { useAuth } from '../context/AuthContext';
import AuthForm from '../app/components/AuthForm';
import { getNotesByUser } from '../lib/firestore';
import { Download, Upload, Pen, Maximize2, NotebookPen, SquarePen, Link2, ChartColumn, Heart, Info, LogOut } from 'lucide-react';
import { updateNote } from '../lib/firestore';
import { deleteNote as deleteNoteFromDB } from '../lib/firestore';
import { saveNote } from '../lib/firestore';
import Swal from 'sweetalert2';
import DarkModeToggle from './components/DarkModeToggle';
import { handleEasterEggs } from '../lib/eastereggs';
import MarkdownToolbar from './components/MarkdownToolbar';
import { getNoteStats } from '@/lib/stats';

// note type
type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  emoji: string;
  tags: string[];
  public: boolean;
  pinned: boolean;
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { user } = useAuth();
  const [editedEmoji, setEditedEmoji] = useState('');
  const [ showToast, setShowToast ] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [showStats, setShowStats] = useState(false);


  const stats = getNoteStats(notes);
  console.log(stats);

  useEffect(() => {
    if (user) {
      getNotesByUser(user.uid).then((fetchedNotes) => {
        setNotes(fetchedNotes);
      });
    }
  }, [user]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true); // Start fading out
      setTimeout(() => setIsLoading(false)); // Wait for fade-out before hiding
    }, 3000);
  
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (note: Note) => {
    setNotes([note, ...notes]);
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteNoteFromDB(id);
      setNotes(notes.filter((note) => note.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong while deleting the note.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const handleTogglePin = async (note: Note) => {
    const updated = { ...note, pinned: !note.pinned };
    await updateNote(updated);
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? updated : n))
    );
  };

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedTags, setEditedTags] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editedPublic, setEditedPublic] = useState(false);
  const [showFormPanel, setShowFormPanel] = useState(false);

  useEffect(() => {
    if (selectedNote) {
      setEditedTitle(selectedNote.title);
      setEditedContent(selectedNote.content);
      setEditedTags(selectedNote.tags?.join(', ') || '');
      setIsEditing(false); // reset when new note is selected
      setEditedEmoji(selectedNote.emoji || '📝');
      setEditedPublic(selectedNote.public || false);
      
    }
  }, [selectedNote]);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);
  

  const handleSaveEdit = async () => {
    if (!selectedNote) return;
  
    const updatedNote = {
      ...selectedNote,
      title: editedTitle.trim(),
      content: editedContent.trim(),
      tags: editedTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      emoji: editedEmoji,
      public: editedPublic,
    };
  
    try {
      await updateNote(updatedNote);
      const updatedNotes = notes.map((note) =>
        note.id === updatedNote.id ? updatedNote : note
      );
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating note:', error);
      Swal.fire({
        icon: 'error',
        title: 'Something went wrong while saving the note.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };
  
  const handleFormat = (syntax: 'bold' | 'italic' | 'code' | 'heading' | 'link') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
  
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = editedContent.slice(start, end);
  
    let wrapped = selected;
  
    switch (syntax) {
      case 'bold':
        wrapped = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        wrapped = `*${selected || 'italic text'}*`;
        break;
      case 'code':
        wrapped = `\`${selected || 'code'}\``;
        break;
      case 'heading':
        wrapped = `# ${selected || 'Heading'}`;
        break;
      case 'link':
        wrapped = `[${selected || 'link text'}](https://example.com)`;
        break;
    }
  
    const newContent =
    editedContent.substring(0, start) + wrapped + editedContent.substring(end);
    setEditedContent(newContent);
  
    // Reposition cursor after inserted text
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + wrapped.length;
      textarea.focus();
    }, 0);
  };
  

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  
    // Apply the class to <html>
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleImportNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedNotes = JSON.parse(event.target?.result as string);
  
        if (Array.isArray(importedNotes)) {
          const validNotes = importedNotes.filter(
            (n) =>
              n.title &&
              n.content &&
              n.tags &&
              typeof n.emoji === 'string' &&
              typeof n.public === 'boolean' &&
              typeof n.pinned === 'boolean'
          );
  
          const savedNotes: Note[] = [];
  
          for (const note of validNotes) {
            const saved = await saveNote(
              {
                title: note.title,
                content: note.content,
                emoji: note.emoji,
                tags: note.tags,
                public: note.public,
                pinned: note.pinned,
              },
              user.uid
            );
            savedNotes.push(saved);
          }
  
          setNotes((prev) => [...savedNotes, ...prev]);
          Swal.fire({
            icon: 'success',
            title: savedNotes.length + ' notes imported and saved to your account.',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Invalid file format',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error reading file',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  const filteredNotes = selectedTag
    ? notes.filter((note) => note.tags.includes(selectedTag))
    : notes;

    if (isLoading) {
      return (
        <div className={`loader-wrapper fixed inset-0 flex items-center justify-center `}>
          <div className="loader"></div>
        </div>
      );
    }

    if (!user) {
      return <AuthForm />;
    }

    if (user && !user.emailVerified) {
      return (
        <div className="text-center mt-10">
          <p className="text-lg font-semibold">Please verify your email to continue.</p>
          <p className="text-sm text-gray-600">Check your inbox and click the verification link.</p>
        </div>
      );
    }

    const sortedNotes = [...filteredNotes].sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });

  return (
    <main className={`min-h-screen p-4 bg-gray-200 dark:bg-gray-800 transition-all duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
      
      <button
        onClick={() => auth.signOut()}
        className="logout-btn basic-btn"
      >
        <LogOut size={20} className="mr-1" />
        Log out
      </button>
      <button
      onClick={() => {
        Swal.fire({
          title: 'Welcome to Scribbly!',
          html: `
            <div style="text-align: left; font-size: 16px;">
              <h3 style="margin-bottom: 0.5rem;font-weight:bold;">🧠 What is Scribbly?</h3>
              <p>A clean, modern note-taking app with Markdown support, emoji icons, tags, and delightful easter eggs.</p>
      
              <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;font-weight:bold;">📥 Import Format</h3>
              <p>To import notes, use a <code>.json</code> file with an array of notes. Each note should include:</p>
              <pre style="background:#f4f4f4;padding:8px;border-radius:6px;overflow-x:auto">
      [
        {
          "title": "Sample Note",
          "content": "Your content here",
          "emoji": "📝",
          "tags": ["tag1", "tag2"],
          "public": true,
          "pinned": false
        }
      ]
              </pre>
      
              <h3 style="margin-top: 1rem; margin-bottom: 0.5rem;font-weight:bold;">🚧 Features in Development</h3>
              <ul style="padding-left: 20px;">
                <li>🛎️ Desktop notifications</li>
                <li>🖥️ Installable desktop app</li>
                <li>🎨 More UI themes</li>
              </ul>
            </div>
            <a class="kofi" href='https://ko-fi.com/Y8Y04MVLP' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi3.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
          `,
          confirmButtonText: 'Got it!',
          width: 600,
          padding: '1.5em',
          customClass: {
            popup: 'info-popup',
          }
        });
      }}
      className="info-btn basic-btn"><Info size={20} className="mr-1" /> Info</button>
      <nav className="flex bg-white dark:bg-gray-800 m-auto rounded-3xl py-2 px-4 items-center w-full md:w-[400px] justify-between items-center relative">
      <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">Scribbly</h1>
      <div className="flex items-center gap-1">
        <DarkModeToggle />
        <div className="relative group inline-block">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(notes, null, 2)], {
                type: 'application/json',
              });
              const today = new Date();
              const formattedDate = today.toISOString().split('T')[0]; // e.g., "2025-04-18"
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `scribbly-notes-${formattedDate}.json`;
              a.click();
              URL.revokeObjectURL(url);
              Swal.fire({
                icon: 'success',
                title: 'Your notes have been successfully exported.',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
              });
            }}
            className="download p-2 rounded-3xl text-sm hover:bg-primary/10 transition"
          >
            <Download size={22} className="w-5 h-5" />
          </button>

          {/* Tooltip */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                          opacity-0 group-hover:opacity-100 transition bg-white text-black text-xs 
                          px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
            Export Notes
          </span>
        </div>
        <div className="relative group inline-block">
          <label
            htmlFor="import-notes"
            className="upload rounded-3xl cursor-pointer inline-flex items-center p-2 hover:bg-primary/10 transition"
          >
            <Upload size={22} className="w-5 h-5" />
          </label>

          {/* Tooltip */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                          opacity-0 group-hover:opacity-100 transition bg-white text-black text-xs 
                          px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
            Import Notes
          </span>

          <input
            type="file"
            accept=".json"
            id="import-notes"
            onChange={handleImportNotes}
            className="hidden"
          />
        </div>
        <div className="relative group inline-block">
          <button 
          onClick={() => setShowStats(!showStats)}
          className="stats-btn rounded-3xl cursor-pointer inline-flex items-center p-2"
          >
            {showStats}
            <ChartColumn size={22} className="w-5 h-5" />
          </button>
          {/* Tooltip */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                          opacity-0 group-hover:opacity-100 transition bg-white text-black text-xs 
                          px-2 py-1 rounded pointer-events-none z-10 whitespace-nowrap">
            Stats
          </span>
        </div>
        
        <button
          onClick={() => setShowFormPanel(true)}
          className="create-note-btn rounded-3xl cursor-pointer inline-flex items-center p-2"
        >
          < NotebookPen size={22} />
        </button>
      </div>
      <AnimatePresence>
  {showStats && (
    <motion.div
    key="stats"
    initial={{ y: -30, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: 60, opacity: 0 }}
    transition={{ duration: 0.25 }}
      className="stats p-2 overflow-hidden"
    >
          <p>Total notes: {notes.length}</p>
          <p>Total words: {stats.totalWords}</p>
          <p>Unique tags: {stats.uniqueTagsCount}</p>
        </motion.div>
      )}</AnimatePresence>
      </nav>
      <AnimatePresence>
      {showFormPanel && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          className="fixed panel-wrapper create-note inset-0 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="panel bg-white rounded-3xl max-w-xl w-full p-6 absolute">
            <button
              onClick={() => setShowFormPanel(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Create a Note</h2>
            <NoteForm
            onClose={() => setShowFormPanel(false)}
            onSave={(note) => {
              setNotes((prev) => [note, ...prev]);
              setShowFormPanel(false);
            }}
          />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
      {selectedTag && (
        <div className="mb-4 text-center">
          <span className="text-sm">
            Filtering by <strong>#{selectedTag}</strong>
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className="ml-2 text-blue-600 underline text-sm"
          >
            Clear filter
          </button>
        </div>
      )}
      {notes.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-12">
          <p className="text-lg">📝 Start your first note!</p>
          <p className="text-sm inline-flex items-center">Click the <NotebookPen className="mx-2" size={20} /> button to begin writing.</p>
        </div>
      )}
      <div className="max-w-7xl mx-auto w-full px-0">
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {sortedNotes.map((note) => (
          <NoteCard key={note.id} note={note} deleteNote={deleteNote} className={note.pinned ? 'border-2 border-yellow-400 shadow-lg' : ''} onTagClick={(tag: string) => setSelectedTag(tag)} onClick={() => setSelectedNote(note)} onTogglePin={handleTogglePin}  />
        ))}
      </div>
      </div>
      <p className="jon">Built with <Heart size={20} className="mx-1 translate-y-0.5" /> by <a className="underline mx-1" href="https://x.com/JontheNerd_" target='_blank'> Jon</a></p>
      <AnimatePresence>
      {selectedNote && (
        <motion.div initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 100, damping: 10 }} className="panel-wrapper fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="panel bg-white rounded-3xl max-w-xl w-full p-6 absolute">
            <div className="relative">
            <button
              onClick={() => setSelectedNote(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            {isEditing ? (
              <>
              <div className="edit-note">
              <select
                value={editedEmoji}
                onChange={(e) => setEditedEmoji(e.target.value)}
                className="edit-emoji w-16 p-1 text-xl text-center rounded border"
              >
                {[
                  '📝', '✏️', '🖊️', '🖋️', '📓', '📔', '📒', '📕', '📖', '📚',
                  '💡', '🧠', '🤔', '🧐', '🔍', '🧪', '🔬', '📈', '📊',
                  '✅', '📌', '📋', '🗒️', '🗂️', '📎', '📅', '📆', '📤',
                  '🔥', '⚡', '🌟', '🏆', '🚀', '💪', '🎯', '🏃', '🥇',
                  '🌿', '🌊', '🧘', '☀️', '🌅', '🫶', '🌸', '💤',
                  '🤖', '💻', '📱', '🛠️', '🧬', '🔧', '⚙️',
                  '🎨', '🎉', '✨', '🦄', '🎈', '🎵', '🎲', '🥳', '😎',
                  '🐱', '🐶', '🐢', '🐙', '🦋', '🐝', '🌵', '🌲', '🌻'
                ].map((em, idx) => (
                  <option key={idx} value={em}>{em}</option>
                ))}
              </select>
                <input
                  className="w-full mb-2 rounded px-3 py-2"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <MarkdownToolbar onFormat={handleFormat} />
                <textarea
                  className="w-full mb-2 rounded px-3 py-2"
                  rows={6}
                  value={editedContent}
                  onChange={(e) => {
                    const transformed = handleEasterEggs(e.target.value);
                    setEditedContent(transformed);
                  }}
                />
                <input
                  className="w-full mb-2 rounded px-3 py-2"
                  value={editedTags}
                  onChange={(e) => setEditedTags(e.target.value)}
                />
                <label className="flex items-center gap-2 mb-2 text-sm">
                <input
                  type="checkbox"
                  checked={editedPublic}
                  onChange={(e) => setEditedPublic(e.target.checked)}
                />
                Make this note public
              </label>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:underline">
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} className="basic-btn">
                    Save
                  </button>
                </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2"><span className="mr-2">{selectedNote.emoji}</span>{selectedNote.title}</h2>
                <div className="edit-preview p-3 rounded-lg prose prose-sm text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedNote.content}</ReactMarkdown>
                </div>

                {selectedNote.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4">
                    {selectedNote.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="tag text-blue-700 text-xs py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-4">
                  {new Date(selectedNote.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className='flex align-center gap-2 mt-4'>
                <button
                  onClick={() => setIsEditing(true)}
                  className="basic-btn mt-2"
                >
                   <SquarePen size={16} className="mr-2" /> Edit Note
                </button>
                {selectedNote.public && (
                  <button
                    onClick={() => {
                      const link = `${window.location.origin}/note/${selectedNote.id}`;
                      navigator.clipboard.writeText(link);
                      Swal.fire({
                        icon: 'success',
                        title: 'Your share link is ready to paste.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true,
                      });
                    }}
                    className="basic-btn mt-2"
                  >
                    <Link2 size={16} className="mr-2" /> Copy Share Link
                  </button>
                )}
                </div>
              </>

            )}      
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </main>
  );
}

