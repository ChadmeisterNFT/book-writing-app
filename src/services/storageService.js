/**
 * StorageService handles all persistent storage for the application
 * Uses localStorage for now, can be extended to IndexedDB for larger datasets
 */

const STORAGE_KEYS = {
  MANUSCRIPTS: 'book_writer_manuscripts',
  CURRENT_MANUSCRIPT_ID: 'book_writer_current_manuscript',
  AGENT_ANALYSES: 'book_writer_agent_analyses',
  USER_PREFERENCES: 'book_writer_preferences',
};

class StorageService {
  /**
   * Save a manuscript to storage
   */
  saveManuscript(manuscript) {
    try {
      const manuscripts = this.getAllManuscripts();
      const index = manuscripts.findIndex(m => m.id === manuscript.id);

      if (index !== -1) {
        manuscripts[index] = manuscript;
      } else {
        manuscripts.push(manuscript);
      }

      localStorage.setItem(STORAGE_KEYS.MANUSCRIPTS, JSON.stringify(manuscripts));
      return true;
    } catch (error) {
      console.error('Failed to save manuscript:', error);
      return false;
    }
  }

  /**
   * Get all manuscripts
   */
  getAllManuscripts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MANUSCRIPTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load manuscripts:', error);
      return [];
    }
  }

  /**
   * Get a specific manuscript by ID
   */
  getManuscript(id) {
    const manuscripts = this.getAllManuscripts();
    return manuscripts.find(m => m.id === id) || null;
  }

  /**
   * Delete a manuscript
   */
  deleteManuscript(id) {
    try {
      const manuscripts = this.getAllManuscripts();
      const filtered = manuscripts.filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MANUSCRIPTS, JSON.stringify(filtered));

      // If this was the current manuscript, clear that setting
      if (this.getCurrentManuscriptId() === id) {
        this.setCurrentManuscriptId(null);
      }

      return true;
    } catch (error) {
      console.error('Failed to delete manuscript:', error);
      return false;
    }
  }

  /**
   * Set the current active manuscript ID
   */
  setCurrentManuscriptId(id) {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_MANUSCRIPT_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MANUSCRIPT_ID);
      }
      return true;
    } catch (error) {
      console.error('Failed to set current manuscript:', error);
      return false;
    }
  }

  /**
   * Get the current active manuscript ID
   */
  getCurrentManuscriptId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_MANUSCRIPT_ID);
  }

  /**
   * Get the current active manuscript
   */
  getCurrentManuscript() {
    const id = this.getCurrentManuscriptId();
    return id ? this.getManuscript(id) : null;
  }

  /**
   * Save agent analysis
   */
  saveAgentAnalysis(analysis) {
    try {
      const analyses = this.getAllAgentAnalyses();
      analyses.push(analysis);

      // Keep only the last 100 analyses to prevent storage overflow
      const trimmed = analyses.slice(-100);
      localStorage.setItem(STORAGE_KEYS.AGENT_ANALYSES, JSON.stringify(trimmed));
      return true;
    } catch (error) {
      console.error('Failed to save agent analysis:', error);
      return false;
    }
  }

  /**
   * Get all agent analyses
   */
  getAllAgentAnalyses() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AGENT_ANALYSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load agent analyses:', error);
      return [];
    }
  }

  /**
   * Get analyses for a specific target
   */
  getAnalysesForTarget(targetType, targetId) {
    const analyses = this.getAllAgentAnalyses();
    return analyses.filter(
      a => a.targetType === targetType && a.targetId === targetId
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Clear all agent analyses
   */
  clearAgentAnalyses() {
    try {
      localStorage.removeItem(STORAGE_KEYS.AGENT_ANALYSES);
      return true;
    } catch (error) {
      console.error('Failed to clear agent analyses:', error);
      return false;
    }
  }

  /**
   * Save user preferences
   */
  savePreferences(preferences) {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   */
  getPreferences() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {
        theme: 'light',
        fontSize: 16,
        fontFamily: 'serif',
        focusMode: false,
        dailyWordGoal: 500,
      };
    } catch (error) {
      console.error('Failed to load preferences:', error);
      return {};
    }
  }

  /**
   * Export manuscript as JSON
   */
  exportManuscript(manuscript) {
    const data = JSON.stringify(manuscript, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${manuscript.title || 'manuscript'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import manuscript from JSON
   */
  async importManuscript(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const manuscript = JSON.parse(e.target.result);
          this.saveManuscript(manuscript);
          resolve(manuscript);
        } catch (error) {
          reject(new Error('Invalid manuscript file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Clear all data (use with caution)
   */
  clearAll() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export default new StorageService();
