import { v4 as uuidv4 } from 'uuid';

/**
 * AgentAnalysis model stores AI agent feedback and analysis
 */
export class AgentAnalysis {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.agentType = data.agentType || ''; // story_architect, character_developer, etc.
    this.targetType = data.targetType || ''; // manuscript, chapter, character
    this.targetId = data.targetId || ''; // ID of the target entity
    this.analysis = data.analysis || '';
    this.suggestions = data.suggestions || [];
    this.issues = data.issues || []; // { severity, description, location }
    this.timestamp = data.timestamp || new Date().toISOString();
  }

  /**
   * Add a suggestion
   */
  addSuggestion(suggestion) {
    this.suggestions.push(suggestion);
  }

  /**
   * Add an issue
   */
  addIssue(severity, description, location = null) {
    this.issues.push({
      severity, // 'critical', 'warning', 'info'
      description,
      location,
    });
  }

  /**
   * Convert to plain object for storage
   */
  toJSON() {
    return {
      id: this.id,
      agentType: this.agentType,
      targetType: this.targetType,
      targetId: this.targetId,
      analysis: this.analysis,
      suggestions: this.suggestions,
      issues: this.issues,
      timestamp: this.timestamp,
    };
  }
}
