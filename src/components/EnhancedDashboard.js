import React, { useState } from 'react';
import { useManuscript } from '../contexts/ManuscriptContext';
import { Manuscript } from '../models/Manuscript';
import { Character } from '../models/Character';
import { exportToDocx, exportToText, exportToMarkdown, exportCharacters } from '../utils/exportUtil';
import storageService from '../services/storageService';
import './EnhancedDashboard.css';

/**
 * EnhancedDashboard provides an overview of manuscripts, characters, and progress
 */
const EnhancedDashboard = () => {
  const {
    currentManuscript,
    manuscripts,
    createManuscript,
    switchManuscript,
    deleteManuscript,
    updateManuscript,
    addCharacter,
    updateCharacter,
    deleteCharacter,
  } = useManuscript();

  const [showNewManuscriptForm, setShowNewManuscriptForm] = useState(false);
  const [showNewCharacterForm, setShowNewCharacterForm] = useState(false);
  const [showManuscriptSettings, setShowManuscriptSettings] = useState(false);
  const [newManuscriptData, setNewManuscriptData] = useState({
    title: '',
    author: '',
    genre: '',
    synopsis: '',
    wordCountGoal: 50000,
  });
  const [newCharacterData, setNewCharacterData] = useState({
    name: '',
    role: 'supporting',
    description: '',
  });

  const handleCreateManuscript = () => {
    if (!newManuscriptData.title.trim()) {
      alert('Please enter a manuscript title');
      return;
    }

    createManuscript(newManuscriptData);
    setShowNewManuscriptForm(false);
    setNewManuscriptData({
      title: '',
      author: '',
      genre: '',
      synopsis: '',
      wordCountGoal: 50000,
    });
  };

  const handleAddCharacter = () => {
    if (!newCharacterData.name.trim()) {
      alert('Please enter a character name');
      return;
    }

    addCharacter(newCharacterData);
    setShowNewCharacterForm(false);
    setNewCharacterData({
      name: '',
      role: 'supporting',
      description: '',
    });
  };

  const handleDeleteManuscript = (id) => {
    if (window.confirm('Are you sure you want to delete this manuscript? This cannot be undone.')) {
      deleteManuscript(id);
    }
  };

  const handleSwitchManuscript = (id) => {
    switchManuscript(id);
  };

  const calculateProgress = () => {
    if (!currentManuscript) return 0;
    const current = currentManuscript.getTotalWordCount();
    const goal = currentManuscript.wordCountGoal || 50000;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  const handleExport = async (format) => {
    if (!currentManuscript) return;

    let result;
    switch (format) {
      case 'docx':
        result = await exportToDocx(currentManuscript);
        break;
      case 'text':
        result = exportToText(currentManuscript);
        break;
      case 'markdown':
        result = exportToMarkdown(currentManuscript);
        break;
      case 'json':
        storageService.exportManuscript(currentManuscript);
        result = { success: true, fileName: `${currentManuscript.title}.json` };
        break;
      case 'characters':
        result = exportCharacters(currentManuscript.characters, currentManuscript.title);
        break;
      default:
        return;
    }

    if (result.success) {
      alert(`Successfully exported: ${result.fileName}`);
    } else {
      alert(`Export failed: ${result.error}`);
    }
  };

  return (
    <div className="enhanced-dashboard">
      <div className="dashboard-header">
        <h1>Book Writer Dashboard</h1>
        {!currentManuscript && manuscripts.length === 0 && (
          <p className="welcome-message">
            Welcome! Create your first manuscript to get started.
          </p>
        )}
      </div>

      {/* Manuscript Selector */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Your Manuscripts</h2>
          <button
            onClick={() => setShowNewManuscriptForm(true)}
            className="primary-button"
          >
            + New Manuscript
          </button>
        </div>

        <div className="manuscript-grid">
          {manuscripts.map((manuscript) => {
            const ms = new Manuscript(manuscript);
            const wordCount = ms.getTotalWordCount();
            const progress = Math.min(
              100,
              Math.round((wordCount / (ms.wordCountGoal || 50000)) * 100)
            );

            return (
              <div
                key={ms.id}
                className={`manuscript-card ${
                  currentManuscript?.id === ms.id ? 'active' : ''
                }`}
              >
                <div className="manuscript-card-header">
                  <h3>{ms.title}</h3>
                  {ms.genre && <span className="genre-badge">{ms.genre}</span>}
                </div>
                <div className="manuscript-card-body">
                  {ms.author && <p className="author">by {ms.author}</p>}
                  <div className="manuscript-stats">
                    <div className="stat">
                      <span className="stat-label">Words:</span>
                      <span className="stat-value">
                        {wordCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Chapters:</span>
                      <span className="stat-value">{ms.chapters.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Characters:</span>
                      <span className="stat-value">{ms.characters.length}</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="progress-text">{progress}% to goal</p>
                </div>
                <div className="manuscript-card-actions">
                  {currentManuscript?.id !== ms.id && (
                    <button
                      onClick={() => handleSwitchManuscript(ms.id)}
                      className="action-button"
                    >
                      Open
                    </button>
                  )}
                  {currentManuscript?.id === ms.id && (
                    <span className="active-badge">Active</span>
                  )}
                  <button
                    onClick={() => handleDeleteManuscript(ms.id)}
                    className="action-button danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {manuscripts.length === 0 && (
          <div className="empty-state">
            <p>No manuscripts yet. Create one to get started!</p>
          </div>
        )}
      </div>

      {/* Current Manuscript Overview */}
      {currentManuscript && (
        <>
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Current Project: {currentManuscript.title}</h2>
              <button
                onClick={() => setShowManuscriptSettings(!showManuscriptSettings)}
                className="secondary-button"
              >
                ⚙ Settings
              </button>
            </div>

            {showManuscriptSettings && (
              <div className="settings-panel">
                <div className="form-group">
                  <label>Title:</label>
                  <input
                    type="text"
                    value={currentManuscript.title}
                    onChange={(e) =>
                      updateManuscript({ title: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Author:</label>
                  <input
                    type="text"
                    value={currentManuscript.author}
                    onChange={(e) =>
                      updateManuscript({ author: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Genre:</label>
                  <input
                    type="text"
                    value={currentManuscript.genre}
                    onChange={(e) =>
                      updateManuscript({ genre: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Synopsis:</label>
                  <textarea
                    value={currentManuscript.synopsis}
                    onChange={(e) =>
                      updateManuscript({ synopsis: e.target.value })
                    }
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label>Word Count Goal:</label>
                  <input
                    type="number"
                    value={currentManuscript.wordCountGoal}
                    onChange={(e) =>
                      updateManuscript({
                        wordCountGoal: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
            )}

            <div className="overview-stats">
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-info">
                  <div className="stat-number">
                    {currentManuscript.getTotalWordCount().toLocaleString()}
                  </div>
                  <div className="stat-label">Total Words</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-info">
                  <div className="stat-number">
                    {currentManuscript.chapters.length}
                  </div>
                  <div className="stat-label">Chapters</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-number">
                    {currentManuscript.characters.length}
                  </div>
                  <div className="stat-label">Characters</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <div className="stat-number">{calculateProgress()}%</div>
                  <div className="stat-label">Progress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Export Manuscript</h2>
            </div>
            <div className="export-buttons">
              <button
                onClick={() => handleExport('docx')}
                className="export-button"
              >
                📄 Export to DOCX
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="export-button"
              >
                📝 Export to Markdown
              </button>
              <button
                onClick={() => handleExport('text')}
                className="export-button"
              >
                📋 Export to Text
              </button>
              <button
                onClick={() => handleExport('json')}
                className="export-button"
              >
                💾 Export to JSON
              </button>
              <button
                onClick={() => handleExport('characters')}
                className="export-button"
              >
                👥 Export Characters
              </button>
            </div>
          </div>

          {/* Characters */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Characters</h2>
              <button
                onClick={() => setShowNewCharacterForm(true)}
                className="primary-button"
              >
                + Add Character
              </button>
            </div>

            <div className="character-grid">
              {currentManuscript.characters.map((character) => (
                <div key={character.id} className="character-card">
                  <div className="character-header">
                    <h3>{character.name}</h3>
                    <span className={`role-badge role-${character.role}`}>
                      {character.role}
                    </span>
                  </div>
                  <p className="character-description">
                    {character.description || 'No description'}
                  </p>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete character "${character.name}"?`
                        )
                      ) {
                        deleteCharacter(character.id);
                      }
                    }}
                    className="delete-char-button"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            {currentManuscript.characters.length === 0 && (
              <div className="empty-state">
                <p>No characters yet. Add some to track their development!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* New Manuscript Modal */}
      {showNewManuscriptForm && (
        <div className="modal-overlay" onClick={() => setShowNewManuscriptForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Manuscript</h2>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                value={newManuscriptData.title}
                onChange={(e) =>
                  setNewManuscriptData({
                    ...newManuscriptData,
                    title: e.target.value,
                  })
                }
                placeholder="Enter manuscript title..."
              />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                value={newManuscriptData.author}
                onChange={(e) =>
                  setNewManuscriptData({
                    ...newManuscriptData,
                    author: e.target.value,
                  })
                }
                placeholder="Your name..."
              />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input
                type="text"
                value={newManuscriptData.genre}
                onChange={(e) =>
                  setNewManuscriptData({
                    ...newManuscriptData,
                    genre: e.target.value,
                  })
                }
                placeholder="e.g., Fantasy, Mystery, Romance..."
              />
            </div>
            <div className="form-group">
              <label>Synopsis</label>
              <textarea
                value={newManuscriptData.synopsis}
                onChange={(e) =>
                  setNewManuscriptData({
                    ...newManuscriptData,
                    synopsis: e.target.value,
                  })
                }
                placeholder="Brief description of your story..."
                rows={4}
              />
            </div>
            <div className="form-group">
              <label>Word Count Goal</label>
              <input
                type="number"
                value={newManuscriptData.wordCountGoal}
                onChange={(e) =>
                  setNewManuscriptData({
                    ...newManuscriptData,
                    wordCountGoal: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleCreateManuscript} className="primary-button">
                Create
              </button>
              <button
                onClick={() => setShowNewManuscriptForm(false)}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Character Modal */}
      {showNewCharacterForm && (
        <div className="modal-overlay" onClick={() => setShowNewCharacterForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Character</h2>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={newCharacterData.name}
                onChange={(e) =>
                  setNewCharacterData({
                    ...newCharacterData,
                    name: e.target.value,
                  })
                }
                placeholder="Character name..."
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={newCharacterData.role}
                onChange={(e) =>
                  setNewCharacterData({
                    ...newCharacterData,
                    role: e.target.value,
                  })
                }
              >
                <option value="protagonist">Protagonist</option>
                <option value="antagonist">Antagonist</option>
                <option value="supporting">Supporting</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newCharacterData.description}
                onChange={(e) =>
                  setNewCharacterData({
                    ...newCharacterData,
                    description: e.target.value,
                  })
                }
                placeholder="Brief character description..."
                rows={4}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleAddCharacter} className="primary-button">
                Add Character
              </button>
              <button
                onClick={() => setShowNewCharacterForm(false)}
                className="secondary-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboard;
