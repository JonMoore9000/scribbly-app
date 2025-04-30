// src/lib/firestore.ts
import { db } from './firebase';
import { Folder } from '../types/Folder';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
  DocumentData,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
} from 'firebase/firestore';

// For saving a note
export type NewNote = {
    title: string;
    content: string;
    tags: string[];
    emoji: string;
    createdAt?: string;
    public: boolean;
    pinned: boolean;
    folderId?: string;
  };

// For displaying a note (after saved)
export type ScribblyNote = NewNote & {
    id: string;
    emoji: string;
    pinned: boolean;
    createdAt: string; // ✅ now required
  };

  export const saveNote = async (note: NewNote, userId: string): Promise<ScribblyNote> => {
    const docRef = await addDoc(collection(db, 'notes'), {
      ...note,
      userId,
      createdAt: Timestamp.now(),
      public: note.public,
      folderId: note.folderId || null,
    });
  
    return {
      id: docRef.id,
      ...note,
      createdAt: new Date().toISOString(), // string format for display
    };
  };
  
  
  export const getNotesByUser = async (userId: string): Promise<ScribblyNote[]> => {
    const q = query(collection(db, 'notes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
  
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        emoji: data.emoji,
        tags: data.tags || [],
        public: data.public,
        pinned: data.pinned,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        folderId: data.folderId || undefined,
      };
    });
  };

  export const deleteNote = async (noteId: string) => {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);
  };
  
  export const updateNote = async (note: ScribblyNote) => {
    const noteRef = doc(db, 'notes', note.id);
    await updateDoc(noteRef, {
      title: note.title,
      content: note.content,
      emoji: note.emoji,
      tags: note.tags,
      pinned: note.pinned,
      public: note.public,
      folderId: note.folderId || null,
    });
  };

  export const getNoteById = async (id: string) => {
    const docRef = doc(db, 'notes', id);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as any;
    } else {
      return null;
    }
  };

  export const createWelcomeNote = async (userId: string) => {
    const welcomeNote = {
      title: "👋 Welcome to Scribbly!",
      content: `# 👋 Welcome to Scribbly!
  
  We're so glad you're here. Scribbly is your space to **jot ideas**, **draft content**, and **save thoughts** in a fast, beautiful, and minimal writing environment.
  
  ## 💡 Tips to Get Started
  
  - Click the **📝 button** in the top right to start a new note.
  - You can **choose an emoji** to make each note more fun and expressive.
  - Write using **Markdown**! Try:
    - \`**bold text**\`
    - \`# Headings\`
    - \`[Links](https://scribbly.app)\`
  - Click the **📌 pin** icon to keep important notes at the top.
  - Make a note **public** and copy a **shareable link** to send it anywhere!
  
  ## 🌙 Dark Mode?
  Toggle it anytime with the 🌙/☀️ switch.
  
  Thanks again for joining us—Scribbly is better with you here 💜  
  Have fun, and let your thoughts fly!
  
  — The Scribbly Team`,
      emoji: "✨",
      tags: ["welcome", "getting started", "tips"],
      public: false,
      pinned: true,
    };
  
    return await saveNote(welcomeNote, userId);
  };
  
  // Create a folder
export const createFolder = async (name: string, userId: string) => {
  const docRef = await addDoc(collection(db, 'folders'), {
    name,
    createdAt: new Date().toISOString(),
    userId,
  });
  return { id: docRef.id, name, createdAt: new Date().toISOString(), userId };
};

// Get folders for a user
export const getFoldersByUser = async (userId: string) => {
  const q = query(collection(db, 'folders'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const folders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Folder[];

  // Sort alphabetically
  return folders.sort((a, b) => a.name.localeCompare(b.name));
};

// Delete a folder
export const deleteFolder = async (folderId: string) => {
  await deleteDoc(doc(db, 'folders', folderId));
};

// Delete folder and move its notes back to Uncategorized
export const deleteFolderAndMoveNotes = async (folderId: string, userId: string) => {
  const notesRef = collection(db, 'notes');
  const q = query(notesRef, where('userId', '==', userId), where('folderId', '==', folderId));
  const snapshot = await getDocs(q);

  const updates = snapshot.docs.map((docSnap) => {
    const noteRef = doc(db, 'notes', docSnap.id);
    return updateDoc(noteRef, { folderId: null });
  });

  await Promise.all(updates); // Wait for all notes to be updated
  await deleteDoc(doc(db, 'folders', folderId)); // Then delete the folder
};