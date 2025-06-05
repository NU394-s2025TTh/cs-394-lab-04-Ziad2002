import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  onSnapshot,
  QueryDocumentSnapshot,
  QuerySnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';

import { db } from '../firebase-config';
import { Note, Notes } from '../types/Note';

const NOTES_COLLECTION = 'notes';

/**
 * Creates or updates a note in Firestore
 * @param note Note object to save
 * @returns Promise that resolves when the note is saved
 */
export async function saveNote(note: Note): Promise<void> {
  try {
    const docRef = doc(collection(db, NOTES_COLLECTION), note.id);
    await setDoc(docRef, note);
  } catch (error) {
    console.error('Error saving note:', error);
    throw error;
  }
}

/**
 * Deletes a note from Firestore
 * @param noteId ID of the note to delete
 * @returns Promise that resolves when the note is deleted
 */
export async function deleteNote(noteId: string): Promise<void> {
  try {
    const docRef = doc(collection(db, NOTES_COLLECTION), noteId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * Transforms a Firestore snapshot into a Notes object
 * @param snapshot Firestore query snapshot
 * @returns Notes object with note ID as keys
 */
export function transformSnapshot(snapshot: QuerySnapshot<DocumentData>): Notes {
  const notes: Notes = {};

  if (typeof snapshot.forEach === 'function') {
    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as Omit<Note, 'id'>;
      notes[doc.id] = {
        id: doc.id,
        ...data,
      };
    });
  } else if (Array.isArray(snapshot.docs)) {
    snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const data = doc.data() as Omit<Note, 'id'>;
      notes[doc.id] = {
        id: doc.id,
        ...data,
      };
    });
  }

  return notes;
}

/**
 * Subscribes to changes in the notes collection
 * @param onNotesChange Callback function to be called when notes change
 * @param onError Optional error handler for testing
 * @returns Unsubscribe function to stop listening for changes
 */
export function subscribeToNotes(
  onNotesChange: (notes: Notes) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const notesRef = collection(db, NOTES_COLLECTION);

  const unsubscribe = onSnapshot(
    notesRef,
    (snapshot) => {
      const notesObj = transformSnapshot(snapshot);
      onNotesChange(notesObj);
    },
    (error) => {
      console.error('Error in onSnapshot:', error);
      if (onError) {
        onError(error);
      }
    },
  );

  return unsubscribe;
}
