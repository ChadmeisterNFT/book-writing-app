import { v4 as uuidv4 } from 'uuid';

/**
 * Chapter model represents a single chapter in the manuscript
 */
export class Chapter {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.title = data.title || 'Untitled Chapter';
    this.content = data.content || '';
    this.order = data.order || 0;
    this.notes = data.notes || '';
    this.scenes = data.scenes || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Get word count for this chapter
   */
  getWordCount() {
    const words = this.content.trim();
    return words ? words.split(/\s+/).length : 0;
  }

  /**
   * Update content
   */
  updateContent(newContent) {
    this.content = newContent;
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      order: this.order,
      notes: this.notes,
      scenes: this.scenes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
