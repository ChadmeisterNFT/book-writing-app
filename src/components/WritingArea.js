import React, { useState, useEffect } from 'react';
import { storage } from '../services/firebase';

/**
 * WritingArea provides a large text area for users to draft their book.
 * It calculates and displays a live word count and offers a button to
 * synchronise the current text with Firebase storage. For the MVP the
 * synchronisation is optional and requires valid Firebase credentials.
 */
const WritingArea = () => {
  const [text, setText] = useState('');
  const [wordCount, setWordCount] = useState(0);

  // Update the word count whenever the text changes.
  useEffect(() => {
    const words = text.trim();
    setWordCount(words ? words.split(/\s+/).length : 0);
  }, [text]);

  /**
   * Upload the current text to Firebase storage. If Firebase has not been
   * configured correctly, this will fail silently or throw an error.
   */
  const handleUpload = async () => {
    try {
      const fileRef = storage.ref().child('writing/myBook.txt');
      await fileRef.putString(text);
      alert('Your work has been uploaded to the cloud.');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload. Please check your Firebase configuration.');
    }
  };

  return (
    <div className="writing-area">
      <h2>Writing Area</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start writing your book here..."
        rows={20}
        className="text-input"
      />
      <div className="writing-info">
        <span>Word Count: {wordCount}</span>
        <button onClick={handleUpload} className="sync-button">Sync to Cloud</button>
      </div>
    </div>
  );
};

export default WritingArea;