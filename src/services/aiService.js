import Anthropic from '@anthropic-ai/sdk';

/**
 * AIService handles all communication with the Claude API
 * and manages the different AI agents
 */
class AIService {
  constructor() {
    this.client = null;
    this.apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  }

  /**
   * Initialize the Anthropic client
   */
  initialize() {
    if (!this.apiKey) {
      console.warn('Anthropic API key not found. AI features will be disabled.');
      return false;
    }

    try {
      this.client = new Anthropic({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true, // Note: In production, use a backend proxy
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return false;
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Send a message to Claude API
   */
  async sendMessage(systemPrompt, userMessage, maxTokens = 4096) {
    if (!this.isAvailable()) {
      if (!this.initialize()) {
        throw new Error('AI service is not available. Please check your API key.');
      }
    }

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      return response.content[0].text;
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI request failed: ${error.message}`);
    }
  }

  /**
   * Send a streaming message to Claude API
   */
  async sendMessageStream(systemPrompt, userMessage, onChunk, maxTokens = 4096) {
    if (!this.isAvailable()) {
      if (!this.initialize()) {
        throw new Error('AI service is not available. Please check your API key.');
      }
    }

    try {
      const stream = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
        stream: true,
      });

      let fullResponse = '';

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const chunk = event.delta.text;
          fullResponse += chunk;
          if (onChunk) {
            onChunk(chunk, fullResponse);
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error(`AI streaming request failed: ${error.message}`);
    }
  }

  /**
   * Build context object for agents
   */
  buildContext(manuscript, chapter = null) {
    const context = {
      manuscript: {
        title: manuscript.title,
        author: manuscript.author,
        genre: manuscript.genre,
        synopsis: manuscript.synopsis,
        totalWordCount: manuscript.getTotalWordCount(),
        chapterCount: manuscript.chapters.length,
        characterCount: manuscript.characters.length,
      },
      characters: manuscript.characters.map(char => ({
        name: char.name,
        role: char.role,
        description: char.description,
        motivations: char.motivations,
        arc: char.arc,
      })),
    };

    if (chapter) {
      context.currentChapter = {
        title: chapter.title,
        order: chapter.order,
        wordCount: chapter.getWordCount(),
        content: chapter.content,
      };
    } else {
      // Include all chapters for full manuscript analysis
      context.chapters = manuscript.chapters.map(ch => ({
        title: ch.title,
        order: ch.order,
        wordCount: ch.getWordCount ? ch.getWordCount() : 0,
        content: ch.content,
      }));
    }

    return context;
  }
}

export default new AIService();
