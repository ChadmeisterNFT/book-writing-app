import React, { createContext, useContext, useState, useEffect } from 'react';
import { Manuscript } from '../models/Manuscript';
import { Chapter } from '../models/Chapter';
import { Character } from '../models/Character';
import storageService from '../services/storageService';

const ManuscriptContext = createContext();

export const useManuscript = () => {
  const context = useContext(ManuscriptContext);
  if (!context) {
    throw new Error('useManuscript must be used within a ManuscriptProvider');
  }
  return context;
};

export const ManuscriptProvider = ({ children }) => {
  const [currentManuscript, setCurrentManuscript] = useState(null);
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load manuscripts on mount
  useEffect(() => {
    loadManuscripts();
  }, []);

  const loadManuscripts = () => {
    const allManuscripts = storageService.getAllManuscripts();
    setManuscripts(allManuscripts);

    // Load current manuscript
    const currentId = storageService.getCurrentManuscriptId();
    if (currentId) {
      const current = storageService.getManuscript(currentId);
      if (current) {
        setCurrentManuscript(new Manuscript(current));
      }
    }

    setLoading(false);
  };

  const createManuscript = (manuscriptData = {}) => {
    const manuscript = new Manuscript(manuscriptData);
    storageService.saveManuscript(manuscript);
    storageService.setCurrentManuscriptId(manuscript.id);
    setCurrentManuscript(manuscript);
    loadManuscripts();
    return manuscript;
  };

  const updateManuscript = (updates) => {
    if (!currentManuscript) return;

    const updated = new Manuscript({
      ...currentManuscript,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
  };

  const switchManuscript = (manuscriptId) => {
    const manuscript = storageService.getManuscript(manuscriptId);
    if (manuscript) {
      storageService.setCurrentManuscriptId(manuscriptId);
      setCurrentManuscript(new Manuscript(manuscript));
    }
  };

  const deleteManuscript = (manuscriptId) => {
    storageService.deleteManuscript(manuscriptId);
    if (currentManuscript?.id === manuscriptId) {
      setCurrentManuscript(null);
    }
    loadManuscripts();
  };

  // Chapter operations
  const addChapter = (chapterData = {}) => {
    if (!currentManuscript) return;

    const chapter = new Chapter({
      ...chapterData,
      order: currentManuscript.chapters.length,
    });

    const updated = new Manuscript({
      ...currentManuscript,
      chapters: [...currentManuscript.chapters, chapter],
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
    return chapter;
  };

  const updateChapter = (chapterId, updates) => {
    if (!currentManuscript) return;

    const chapters = currentManuscript.chapters.map(ch =>
      ch.id === chapterId
        ? { ...ch, ...updates, updatedAt: new Date().toISOString() }
        : ch
    );

    const updated = new Manuscript({
      ...currentManuscript,
      chapters,
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
  };

  const deleteChapter = (chapterId) => {
    if (!currentManuscript) return;

    const chapters = currentManuscript.chapters.filter(ch => ch.id !== chapterId);

    const updated = new Manuscript({
      ...currentManuscript,
      chapters,
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
  };

  const reorderChapters = (newOrder) => {
    if (!currentManuscript) return;

    const chapters = newOrder.map((ch, index) => ({
      ...ch,
      order: index,
    }));

    const updated = new Manuscript({
      ...currentManuscript,
      chapters,
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
  };

  // Character operations
  const addCharacter = (characterData = {}) => {
    if (!currentManuscript) return;

    const character = new Character(characterData);

    const updated = new Manuscript({
      ...currentManuscript,
      characters: [...currentManuscript.characters, character],
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
    return character;
  };

  const updateCharacter = (characterId, updates) => {
    if (!currentManuscript) return;

    const characters = currentManuscript.characters.map(char =>
      char.id === characterId
        ? { ...char, ...updates, updatedAt: new Date().toISOString() }
        : char
    );

    const updated = new Manuscript({
      ...currentManuscript,
      characters,
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
  };

  const deleteCharacter = (characterId) => {
    if (!currentManuscript) return;

    const characters = currentManuscript.characters.filter(
      char => char.id !== characterId
    );

    const updated = new Manuscript({
      ...currentManuscript,
      characters,
      updatedAt: new Date().toISOString(),
    });

    storageService.saveManuscript(updated);
    setCurrentManuscript(updated);
    loadManuscripts();
  };

  const value = {
    currentManuscript,
    manuscripts,
    loading,
    createManuscript,
    updateManuscript,
    switchManuscript,
    deleteManuscript,
    addChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  };

  return (
    <ManuscriptContext.Provider value={value}>
      {children}
    </ManuscriptContext.Provider>
  );
};
