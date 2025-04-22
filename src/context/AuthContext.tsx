'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getNotesByUser, saveNote } from '../lib/firestore';
import { ScribblyNote } from '../lib/firestore';

const AuthContext = createContext<{ user: User | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const notes = await getNotesByUser(firebaseUser.uid);
        if (notes.length === 0) {
          // 👋 Create welcome note
          await saveNote(
            {
              title: '👋 Welcome to Scribbly!',
              content: `Welcome to **Scribbly**! 🪄

This is your space to:
- ✍️ Jot ideas
- 📝 Draft content
- 💾 Save thoughts

All in a fast, beautiful, and minimal writing environment.

---

## 💡 Tips to Get Started

- Click the **📝 button** in the top right to start a new note.
- Choose emojis to make each note more expressive.
- Write using **Markdown**:
  - **bold**
  - *italic*
  - \`inline code\`
  - [links](https://scribbly.app)
  - edit this note to see the markdown

---

Happy writing! ✨`,
              emoji: '✨',
              tags: ['welcome', 'getting-started'],
              public: true,
              pinned: true,
            },
            firebaseUser.uid
          );
        }
      }

      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
