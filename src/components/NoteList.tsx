import React, { useEffect, useState } from 'react';

import { subscribeToNotes } from '../services/noteService';
import { Note } from '../types/Note';
import NoteItem from './NoteItem';

interface NoteListProps {
  onEditNote?: (note: Note) => void;
}

const NoteList: React.FC<NoteListProps> = ({ onEditNote }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = subscribeToNotes(
        (fetchedNotes: unknown) => {
          if (Array.isArray(fetchedNotes)) {
            setNotes(fetchedNotes as Note[]);
          } else if (fetchedNotes && typeof fetchedNotes === 'object') {
            setNotes(Object.values(fetchedNotes as Record<string, Note>));
          } else {
            console.error('subscribeToNotes returned invalid value:', fetchedNotes);
            setNotes([]);
          }
          setLoading(false);
        },
        (err: Error) => {
          console.error('Error subscribing to notes:', err);
          setError('Failed to load notes');
          setLoading(false);
        },
      );
      return () => unsubscribe?.();
    } catch (err) {
      console.error('subscribeToNotes threw:', err);
      setError('Failed to load notes');
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading notes...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!Array.isArray(notes) || notes.length === 0)
    return <p>No notes yet. Create your first note!</p>;

  return (
    <div className="note-list">
      <h2>Notes</h2>
      <div className="notes-container">
        {notes
          .filter((note) => note && note.id)
          .sort((a, b) => b.lastUpdated - a.lastUpdated)
          .map((note) => (
            <NoteItem key={note.id} note={note} onEdit={onEditNote} />
          ))}
      </div>
    </div>
  );
};

export default NoteList;
