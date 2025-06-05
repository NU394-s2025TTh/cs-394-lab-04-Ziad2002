import React, { useState } from 'react';

import { deleteNote } from '../services/noteService';
import { Note } from '../types/Note';
import { formatDate } from '../utils/formatDate';
import { getTimeAgo } from '../utils/timeAgo';

interface NoteItemProps {
  note: Note;
  onEdit?: (note: Note) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteNote(note.id);
    } catch {
      setError('Failed to delete note.');
      setDeleting(false);
    }
  };

  return (
    <div className="note-item">
      <h3>{note?.title}</h3>
      <p>{note?.content}</p>
      <small title={formatDate(note?.lastUpdated)}>
        Last updated: {formatDate(note?.lastUpdated)} ({getTimeAgo(note?.lastUpdated)})
      </small>

      {onEdit && (
        <button className="edit-button" onClick={() => onEdit(note)} disabled={deleting}>
          Edit
        </button>
      )}

      <button className="delete-button" onClick={handleDelete} disabled={deleting}>
        {deleting ? 'Deleting...' : 'Delete'}
      </button>

      {error && <p role="alert">{error}</p>}
    </div>
  );
};

export default NoteItem;
