// src/components/NoteEditor.tsx
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { saveNote } from '../services/noteService';
import { Note } from '../types/Note';

interface NoteEditorProps {
  initialNote?: Note;
  onSave?: (note: Note) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ initialNote, onSave }) => {
  const [note, setNote] = useState<Note>(() => {
    return (
      initialNote || {
        id: uuidv4(),
        title: '',
        content: '',
        lastUpdated: Date.now(),
      }
    );
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
    }
  }, [initialNote]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNote({
      ...note,
      [e.target.name]: e.target.value,
      lastUpdated: Date.now(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.title || !note.content) return;

    setIsSaving(true);
    setError(null);
    try {
      await saveNote(note);
      if (onSave) onSave(note);
      if (!initialNote) {
        setNote({
          id: uuidv4(),
          title: '',
          content: '',
          lastUpdated: Date.now(),
        });
      }
    } catch {
      setError('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className="note-editor" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={note.title}
          onChange={handleChange}
          required
          placeholder="Enter note title"
          disabled={isSaving}
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={note.content}
          onChange={handleChange}
          rows={5}
          required
          placeholder="Enter note content"
          disabled={isSaving}
        />
      </div>
      <div className="form-actions">
        <button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : initialNote ? 'Update Note' : 'Save Note'}
        </button>
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </form>
  );
};

export default NoteEditor;
