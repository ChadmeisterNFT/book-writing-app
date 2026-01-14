import { v4 as uuidv4 } from 'uuid';

/**
 * Manuscript model represents the entire book project
 */
export class Manuscript {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.title = data.title || 'Untitled Manuscript';
    this.author = data.author || '';
    this.genre = data.genre || '';
    this.synopsis = data.synopsis || '';
    this.chapters = data.chapters || [];
    this.characters = data.characters || [];
    this.timeline = data.timeline || [];
    this.notes = data.notes || '';
    this.wordCountGoal = data.wordCountGoal || 50000;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Get total word count across all chapters
   */
  getTotalWordCount() {
    return this.chapters.reduce((total, chapter) => {
      const words = chapter.content.trim();
      const count = words ? words.split(/\s+/).length : 0;
      return total + count;
    }, 0);
  }

  /**
   * Add a new chapter
   */
  addChapter(chapter) {
    this.chapters.push(chapter);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Update a chapter by ID
   */
  updateChapter(chapterId, updates) {
    const index = this.chapters.findIndex(ch => ch.id === chapterId);
    if (index !== -1) {
      this.chapters[index] = { ...this.chapters[index], ...updates };
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Delete a chapter by ID
   */
  deleteChapter(chapterId) {
    this.chapters = this.chapters.filter(ch => ch.id !== chapterId);
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Reorder chapters
   */
  reorderChapters(newOrder) {
    this.chapters = newOrder;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      genre: this.genre,
      synopsis: this.synopsis,
      chapters: this.chapters,
      characters: this.characters,
      timeline: this.timeline,
      notes: this.notes,
      wordCountGoal: this.wordCountGoal,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
