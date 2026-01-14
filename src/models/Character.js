import { v4 as uuidv4 } from 'uuid';

/**
 * Character model represents a character in the story
 */
export class Character {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.name = data.name || '';
    this.role = data.role || 'supporting'; // protagonist, antagonist, supporting
    this.age = data.age || '';
    this.description = data.description || '';
    this.background = data.background || '';
    this.personality = data.personality || '';
    this.motivations = data.motivations || '';
    this.relationships = data.relationships || []; // { characterId, relationship }
    this.arc = data.arc || ''; // character arc description
    this.notes = data.notes || '';
    this.appearances = data.appearances || []; // chapter IDs where character appears
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Add relationship with another character
   */
  addRelationship(characterId, relationshipDescription) {
    this.relationships.push({
      characterId,
      description: relationshipDescription,
    });
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Track appearance in a chapter
   */
  addAppearance(chapterId) {
    if (!this.appearances.includes(chapterId)) {
      this.appearances.push(chapterId);
      this.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      age: this.age,
      description: this.description,
      background: this.background,
      personality: this.personality,
      motivations: this.motivations,
      relationships: this.relationships,
      arc: this.arc,
      notes: this.notes,
      appearances: this.appearances,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
