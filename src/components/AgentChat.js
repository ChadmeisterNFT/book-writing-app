import React, { useState, useEffect, useRef } from 'react';
import { useManuscript } from '../contexts/ManuscriptContext';
import storyArchitectAgent from '../agents/storyArchitectAgent';
import characterDeveloperAgent from '../agents/characterDeveloperAgent';
import storageService from '../services/storageService';
import './AgentChat.css';

/**
 * AgentChat component provides a chat interface for interacting with AI agents
 */
const AgentChat = () => {
  const { currentManuscript } = useManuscript();
  const [selectedAgent, setSelectedAgent] = useState('story_architect');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContext, setSelectedContext] = useState('manuscript'); // manuscript, chapter, character
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const messagesEndRef = useRef(null);

  const agents = {
    story_architect: {
      name: 'Story Architect',
      description: 'Expert in plot structure and narrative analysis',
      icon: '📚',
      agent: storyArchitectAgent,
    },
    character_developer: {
      name: 'Character Developer',
      description: 'Specialist in character development and consistency',
      icon: '👤',
      agent: characterDeveloperAgent,
    },
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentManuscript) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const agent = agents[selectedAgent].agent;
      let response;

      // Determine context
      let chapter = null;
      let character = null;

      if (selectedContext === 'chapter' && selectedChapter) {
        chapter = currentManuscript.chapters.find(ch => ch.id === selectedChapter);
      } else if (selectedContext === 'character' && selectedCharacter) {
        character = currentManuscript.characters.find(c => c.id === selectedCharacter);
      }

      // Get response from agent
      if (selectedAgent === 'story_architect') {
        response = await agent.answerQuestion(
          currentManuscript,
          inputMessage,
          chapter
        );
      } else if (selectedAgent === 'character_developer') {
        response = await agent.answerQuestion(
          currentManuscript,
          inputMessage,
          character
        );
      }

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        agent: selectedAgent,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Agent error:', error);
      const errorMessage = {
        role: 'error',
        content: `Failed to get response: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAnalyzeRequest = async (type) => {
    if (!currentManuscript) return;

    setIsLoading(true);

    try {
      const agent = agents[selectedAgent].agent;
      let analysis;

      if (type === 'manuscript') {
        if (selectedAgent === 'story_architect') {
          analysis = await agent.analyzeManuscript(currentManuscript);
        } else if (selectedAgent === 'character_developer') {
          analysis = await agent.analyzeAllCharacters(currentManuscript);
        }
      } else if (type === 'chapter' && selectedChapter) {
        const chapter = currentManuscript.chapters.find(
          ch => ch.id === selectedChapter
        );
        if (chapter) {
          analysis = await storyArchitectAgent.analyzeChapter(
            currentManuscript,
            chapter
          );
        }
      } else if (type === 'character' && selectedCharacter) {
        const character = currentManuscript.characters.find(
          c => c.id === selectedCharacter
        );
        if (character) {
          analysis = await characterDeveloperAgent.analyzeCharacter(
            currentManuscript,
            character
          );
        }
      }

      if (analysis) {
        // Save analysis
        storageService.saveAgentAnalysis(analysis);

        // Add to messages
        const assistantMessage = {
          role: 'assistant',
          content: analysis.analysis,
          timestamp: analysis.timestamp,
          agent: selectedAgent,
          type: 'analysis',
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = {
        role: 'error',
        content: `Analysis failed: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  if (!currentManuscript) {
    return (
      <div className="agent-chat-container">
        <div className="no-manuscript">
          <h2>No manuscript selected</h2>
          <p>Create or select a manuscript to use AI agents.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-chat-container">
      {/* Agent Selector */}
      <div className="agent-selector">
        <h3>AI Agents</h3>
        <div className="agent-buttons">
          {Object.entries(agents).map(([key, agent]) => (
            <button
              key={key}
              onClick={() => setSelectedAgent(key)}
              className={`agent-button ${
                selectedAgent === key ? 'active' : ''
              }`}
            >
              <span className="agent-icon">{agent.icon}</span>
              <div className="agent-info">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-description">{agent.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Context Selector */}
      <div className="context-selector">
        <label>Context:</label>
        <select
          value={selectedContext}
          onChange={(e) => setSelectedContext(e.target.value)}
          className="context-select"
        >
          <option value="manuscript">Full Manuscript</option>
          <option value="chapter">Specific Chapter</option>
          {selectedAgent === 'character_developer' && (
            <option value="character">Specific Character</option>
          )}
        </select>

        {selectedContext === 'chapter' && (
          <select
            value={selectedChapter || ''}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="context-select"
          >
            <option value="">Select a chapter...</option>
            {currentManuscript.chapters.map((ch, index) => (
              <option key={ch.id} value={ch.id}>
                Chapter {index + 1}: {ch.title}
              </option>
            ))}
          </select>
        )}

        {selectedContext === 'character' && (
          <select
            value={selectedCharacter || ''}
            onChange={(e) => setSelectedCharacter(e.target.value)}
            className="context-select"
          >
            <option value="">Select a character...</option>
            {currentManuscript.characters.map((char) => (
              <option key={char.id} value={char.id}>
                {char.name} ({char.role})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button
          onClick={() => handleAnalyzeRequest('manuscript')}
          disabled={isLoading}
          className="action-button"
        >
          📊 Analyze Manuscript
        </button>
        {selectedContext === 'chapter' && selectedChapter && (
          <button
            onClick={() => handleAnalyzeRequest('chapter')}
            disabled={isLoading}
            className="action-button"
          >
            📄 Analyze Chapter
          </button>
        )}
        {selectedContext === 'character' && selectedCharacter && (
          <button
            onClick={() => handleAnalyzeRequest('character')}
            disabled={isLoading}
            className="action-button"
          >
            👤 Analyze Character
          </button>
        )}
        <button onClick={clearChat} className="action-button clear-button">
          🗑 Clear Chat
        </button>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-chat">
            <p>
              Ask {agents[selectedAgent].name} a question or request an
              analysis.
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="message-header">
                <span className="message-agent">
                  {agents[msg.agent]?.icon} {agents[msg.agent]?.name}
                </span>
              </div>
            )}
            <div className="message-content">{msg.content}</div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message message-loading">
            <div className="loading-indicator">
              <span>●</span>
              <span>●</span>
              <span>●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="chat-input-container">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Ask ${agents[selectedAgent].name} a question...`}
          className="chat-input"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="send-button"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default AgentChat;
