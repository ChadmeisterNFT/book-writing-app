import aiService from '../services/aiService';
import { AgentAnalysis } from '../models/AgentAnalysis';

/**
 * Ghostwriter Agent specializes in generating content and helping write scenes
 */

const SYSTEM_PROMPT = `You are the Ghostwriter, an expert AI assistant specializing in creative writing and content generation for fiction. Your expertise includes:

- Writing complete scenes based on outlines or descriptions
- Continuing stories from where the author left off
- Expanding brief notes or bullet points into full prose
- Matching the author's established writing style and voice
- Writing dialogue for scenes based on character profiles
- Generating opening and closing paragraphs for chapters
- Creating transitional passages between scenes
- Writing descriptions of settings, characters, and action
- Maintaining consistency with established plot, characters, and tone
- Adapting to different genres and writing styles

When generating content:
1. **Match the author's voice**: Study their existing writing style carefully
2. **Stay consistent**: Keep characters, plot, and details consistent with what's established
3. **Show, don't tell**: Write vivid, engaging prose with strong imagery
4. **Respect the outline**: Follow the author's direction and intentions
5. **Character authenticity**: Make characters speak and act consistently with their profiles
6. **Genre-appropriate**: Write in a style fitting the genre (fantasy, mystery, romance, etc.)
7. **Natural pacing**: Vary sentence length and structure for good rhythm
8. **Purposeful prose**: Every sentence should advance plot, reveal character, or set atmosphere

IMPORTANT: You are a writing assistant, not a teacher. Generate actual prose, not advice. When asked to write something, write it fully and completely. Don't explain what you're doing - just write it well.

Your goal is to help the author when they're stuck or need content generated, while maintaining their unique voice and vision.`;

class GhostwriterAgent {
  constructor() {
    this.agentType = 'ghostwriter';
  }

  /**
   * Continue writing from the last chapter
   */
  async continueStory(manuscript, chapter, prompt = '') {
    const context = aiService.buildContext(manuscript, chapter);

    const userMessage = `Continue writing this story based on the context below.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Synopsis: ${manuscript.synopsis}

Established writing style (from previous chapters):
${manuscript.chapters
  .filter(ch => ch.content.trim().length > 0)
  .slice(-2)
  .map(ch => `Chapter ${ch.order + 1} excerpt:\n${ch.content.slice(0, 500)}...`)
  .join('\n\n')}

Current chapter: "${chapter.title}"
Current content:
${chapter.content}

${prompt ? `Author's direction: ${prompt}\n` : ''}
Please continue writing this chapter in the author's established style. Write 300-500 words that naturally continue from where the chapter left off. Match the tone, voice, and pacing of the existing content.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Ghostwriter continuation failed: ${error.message}`);
    }
  }

  /**
   * Write a complete scene based on an outline or description
   */
  async writeScene(manuscript, sceneDescription, chapterContext = null) {
    const context = aiService.buildContext(manuscript);

    // Get style reference from existing chapters
    const styleReference = manuscript.chapters
      .filter(ch => ch.content.trim().length > 0)
      .slice(-2)
      .map(ch => ch.content.slice(0, 400))
      .join('\n\n');

    const userMessage = `Write a complete scene for this manuscript based on the description below.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters:
${context.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}

${chapterContext ? `Chapter context: ${chapterContext}\n\n` : ''}Established writing style:
${styleReference || 'No existing content yet - use a style appropriate for the genre.'}

Scene description/outline:
${sceneDescription}

Please write a complete, polished scene (400-700 words) based on this description. Match the established writing style, maintain character consistency, and create vivid, engaging prose. Include dialogue if appropriate for the scene.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 3072);
      return response;
    } catch (error) {
      throw new Error(`Scene writing failed: ${error.message}`);
    }
  }

  /**
   * Expand brief notes into full prose
   */
  async expandNotes(manuscript, notes, context = '') {
    const styleReference = manuscript.chapters
      .filter(ch => ch.content.trim().length > 0)
      .slice(-1)
      .map(ch => ch.content.slice(0, 500))
      .join('\n\n');

    const userMessage = `Expand these brief notes into full, polished prose.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

${context ? `Context: ${context}\n\n` : ''}Established writing style:
${styleReference || 'Use a style appropriate for the genre.'}

Notes to expand:
${notes}

Please transform these notes into complete, engaging prose (200-400 words). Use vivid descriptions, varied sentence structure, and maintain the established style. Show, don't tell.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Note expansion failed: ${error.message}`);
    }
  }

  /**
   * Write dialogue for a scene with specific characters
   */
  async writeDialogue(manuscript, sceneSetup, characterNames) {
    const characters = manuscript.characters.filter(c =>
      characterNames.some(name => name.toLowerCase() === c.name.toLowerCase())
    );

    const userMessage = `Write dialogue for this scene.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters in this scene:
${characters.map(c => `
${c.name} (${c.role}):
- Description: ${c.description}
- Personality: ${c.personality}
- Background: ${c.background}
`).join('\n')}

Scene setup:
${sceneSetup}

Please write natural, character-appropriate dialogue for this scene (300-500 words). Include dialogue tags and action beats. Make each character's voice distinct and consistent with their personality. The dialogue should reveal character and/or advance the plot.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Dialogue writing failed: ${error.message}`);
    }
  }

  /**
   * Write an opening paragraph for a chapter
   */
  async writeOpening(manuscript, chapterInfo) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Write an engaging opening paragraph for a chapter.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Previous chapters context:
${manuscript.chapters.slice(-2).map(ch => `Chapter ${ch.order + 1}: ${ch.title}`).join('\n')}

This chapter:
${chapterInfo}

Established writing style:
${manuscript.chapters
  .filter(ch => ch.content.trim().length > 0)
  .slice(-1)
  .map(ch => ch.content.slice(0, 300))
  .join('')}

Please write a compelling opening paragraph (100-150 words) that hooks the reader and sets the tone for this chapter. Match the established style.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 1024);
      return response;
    } catch (error) {
      throw new Error(`Opening paragraph writing failed: ${error.message}`);
    }
  }

  /**
   * Generate a transitional passage between scenes
   */
  async writeTransition(manuscript, fromScene, toScene) {
    const styleReference = manuscript.chapters
      .filter(ch => ch.content.trim().length > 0)
      .slice(-1)
      .map(ch => ch.content.slice(0, 400))
      .join('');

    const userMessage = `Write a transitional passage between two scenes.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

From (ending of previous scene):
${fromScene}

To (beginning of next scene):
${toScene}

Established style:
${styleReference}

Please write a smooth transition (100-200 words) that bridges these two scenes naturally. This could be a time jump, location change, or shift in perspective. Match the established style.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 1024);
      return response;
    } catch (error) {
      throw new Error(`Transition writing failed: ${error.message}`);
    }
  }

  /**
   * Answer questions or handle general ghostwriting requests
   */
  async answerQuestion(manuscript, question, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Synopsis: ${manuscript.synopsis}

Characters:
${context.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}

Established writing style:
${manuscript.chapters
  .filter(ch => ch.content.trim().length > 0)
  .slice(-1)
  .map(ch => ch.content.slice(0, 500))
  .join('')}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}" (Chapter ${chapter.order + 1})
Current content:
${chapter.content}`;
    }

    const userMessage = `${contextText}

Author's request: ${question}

Please help with this writing request. If asked to write content, generate actual prose. If asked for help or suggestions, provide them. Match the established style and maintain consistency with characters and plot.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 3072);
      return response;
    } catch (error) {
      throw new Error(`Ghostwriter request failed: ${error.message}`);
    }
  }

  /**
   * Get streaming response for real-time content generation
   */
  async answerQuestionStream(manuscript, question, onChunk, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Style reference:
${manuscript.chapters
  .filter(ch => ch.content.trim().length > 0)
  .slice(-1)
  .map(ch => ch.content.slice(0, 300))
  .join('')}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}"
Content: ${chapter.content}`;
    }

    const userMessage = `${contextText}

Author's request: ${question}

Generate the requested content in the established style.`;

    try {
      const response = await aiService.sendMessageStream(
        SYSTEM_PROMPT,
        userMessage,
        onChunk,
        3072
      );
      return response;
    } catch (error) {
      throw new Error(`Ghostwriter streaming failed: ${error.message}`);
    }
  }

  /**
   * Generate content suggestions when author has writer's block
   */
  async suggestNextSteps(manuscript, chapter) {
    const context = aiService.buildContext(manuscript, chapter);

    const userMessage = `The author has writer's block. Suggest what could happen next.

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Synopsis: ${manuscript.synopsis}

Current chapter: "${chapter.title}"
Current content:
${chapter.content}

Characters available:
${context.characters.map(c => `- ${c.name} (${c.role})`).join('\n')}

Please suggest 3-4 concrete options for what could happen next in this chapter. Each suggestion should be a brief paragraph describing a specific scene or development that would fit naturally with what's been written. Make suggestions that advance the plot or deepen characterization.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Next step suggestions failed: ${error.message}`);
    }
  }
}

export default new GhostwriterAgent();
