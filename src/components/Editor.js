import React, { useState, useEffect, useRef } from 'react';
import { useManuscript } from '../contexts/ManuscriptContext';
import './Editor.css';

/**
 * Enhanced Editor component with chapter management
 */
const Editor = () => {
  const {
    currentManuscript,
    addChapter,
    updateChapter,
    deleteChapter,
  } = useManuscript();

  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [content, setContent] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [showChapterList, setShowChapterList] = useState(true);
  const textareaRef = useRef(null);
  const autoSaveTimer = useRef(null);

  // Load first chapter or create one if none exist
  useEffect(() => {
    if (!currentManuscript) return;

    if (currentManuscript.chapters.length === 0) {
      // Create first chapter
      const chapter = addChapter({
        title: 'Chapter 1',
        content: '',
      });
      setSelectedChapterId(chapter.id);
      setContent('');
      setChapterTitle(chapter.title);
    } else if (!selectedChapterId) {
      // Select first chapter
      const firstChapter = currentManuscript.chapters[0];
      setSelectedChapterId(firstChapter.id);
      setContent(firstChapter.content);
      setChapterTitle(firstChapter.title);
    }
  }, [currentManuscript, selectedChapterId, addChapter]);

  // Load selected chapter
  useEffect(() => {
    if (!selectedChapterId || !currentManuscript) return;

    const chapter = currentManuscript.chapters.find(
      ch => ch.id === selectedChapterId
    );
    if (chapter) {
      setContent(chapter.content);
      setChapterTitle(chapter.title);
    }
  }, [selectedChapterId, currentManuscript]);

  // Calculate word count
  useEffect(() => {
    const words = content.trim();
    setWordCount(words ? words.split(/\s+/).length : 0);
  }, [content]);

  // Auto-save content
  useEffect(() => {
    if (!selectedChapterId || !currentManuscript) return;

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer
    autoSaveTimer.current = setTimeout(() => {
      updateChapter(selectedChapterId, { content, title: chapterTitle });
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, chapterTitle, selectedChapterId, updateChapter, currentManuscript]);

  const handleAddChapter = () => {
    const newChapter = addChapter({
      title: `Chapter ${currentManuscript.chapters.length + 1}`,
      content: '',
    });
    setSelectedChapterId(newChapter.id);
  };

  const handleDeleteChapter = (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      deleteChapter(chapterId);

      // Select another chapter
      if (currentManuscript.chapters.length > 1) {
        const remaining = currentManuscript.chapters.filter(
          ch => ch.id !== chapterId
        );
        if (remaining.length > 0) {
          setSelectedChapterId(remaining[0].id);
        }
      }
    }
  };

  const handleSelectChapter = (chapterId) => {
    setSelectedChapterId(chapterId);
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const toggleChapterList = () => {
    setShowChapterList(!showChapterList);
  };

  if (!currentManuscript) {
    return (
      <div className="editor-container">
        <div className="no-manuscript">
          <h2>No manuscript selected</h2>
          <p>Create or select a manuscript to start writing.</p>
        </div>
      </div>
    );
  }

  const currentChapter = currentManuscript.chapters.find(
    ch => ch.id === selectedChapterId
  );

  return (
    <div className={`editor-container ${focusMode ? 'focus-mode' : ''}`}>
      {/* Chapter Sidebar */}
      {showChapterList && !focusMode && (
        <div className="chapter-sidebar">
          <div className="sidebar-header">
            <h3>Chapters</h3>
            <button onClick={handleAddChapter} className="add-chapter-btn">
              + New
            </button>
          </div>
          <div className="chapter-list">
            {currentManuscript.chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`chapter-item ${
                  chapter.id === selectedChapterId ? 'active' : ''
                }`}
                onClick={() => handleSelectChapter(chapter.id)}
              >
                <div className="chapter-item-content">
                  <span className="chapter-number">{index + 1}</span>
                  <span className="chapter-title">{chapter.title}</span>
                </div>
                <div className="chapter-item-meta">
                  <span className="chapter-words">
                    {chapter.getWordCount ? chapter.getWordCount() : 0} words
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Area */}
      <div className="editor-main">
        {/* Editor Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-left">
            {!focusMode && (
              <button
                onClick={toggleChapterList}
                className="toolbar-btn"
                title="Toggle chapter list"
              >
                {showChapterList ? '◀' : '▶'}
              </button>
            )}
            <input
              type="text"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="chapter-title-input"
              placeholder="Chapter title..."
            />
          </div>
          <div className="toolbar-right">
            <span className="word-count">{wordCount} words</span>
            <button
              onClick={toggleFocusMode}
              className="toolbar-btn focus-btn"
              title="Toggle focus mode"
            >
              {focusMode ? '◪' : '◫'}
            </button>
            {currentChapter && currentManuscript.chapters.length > 1 && (
              <button
                onClick={() => handleDeleteChapter(currentChapter.id)}
                className="toolbar-btn delete-btn"
                title="Delete chapter"
              >
                🗑
              </button>
            )}
          </div>
        </div>

        {/* Text Editor */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
          placeholder="Start writing your story..."
          spellCheck="true"
        />
      </div>
    </div>
  );
};

export default Editor;
