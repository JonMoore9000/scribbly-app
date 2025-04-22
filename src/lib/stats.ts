import { ScribblyNote } from './firestore';

export function getNoteStats(notes: ScribblyNote[]) {
    const totalNotes = notes.length;
  
    const totalWords = notes.reduce((acc, note) => {
      const wordCount = note.content.split(/\s+/).filter(Boolean).length;
      return acc + wordCount;
    }, 0);
  
    const allTags = notes.flatMap((note) => note.tags || []);
    const uniqueTags = new Set(allTags.filter(Boolean));
  
    return {
      totalNotes,
      totalWords,
      uniqueTagsCount: uniqueTags.size,
    };
  }