import aiService from '../services/aiService';
import { AgentAnalysis } from '../models/AgentAnalysis';

/**
 * Character Developer Agent specializes in character development and consistency
 */

const SYSTEM_PROMPT = `You are the Character Developer, an expert AI assistant specializing in character development and consistency for fiction writing. Your expertise includes:

- Creating detailed character profiles with depth and authenticity
- Tracking character arcs and development throughout the story
- Identifying inconsistencies in character behavior, voice, or description
- Analyzing character motivations and relationships
- Ensuring characters have distinct voices and personalities
- Suggesting character development opportunities

When analyzing characters:
1. Evaluate character depth and authenticity
2. Track consistency in behavior, voice, and physical descriptions
3. Analyze character arcs and growth
4. Examine relationships between characters
5. Suggest specific ways to deepen characterization
6. Flag any contradictions or inconsistencies

Always be constructive and help authors create memorable, believable characters. Provide specific examples and actionable suggestions.`;

class CharacterDeveloperAgent {
  constructor() {
    this.agentType = 'character_developer';
  }

  /**
   * Analyze all characters in the manuscript
   */
  async analyzeAllCharacters(manuscript) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Please analyze all the characters in this manuscript:

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters:
${context.characters.length > 0 ?
  context.characters.map(char => `
Name: ${char.name}
Role: ${char.role}
Description: ${char.description}
Motivations: ${char.motivations}
Arc: ${char.arc}
`).join('\n---\n')
  : 'No characters defined yet.'}

Full manuscript content to analyze character portrayals:
${context.chapters.map(ch => `\n=== CHAPTER ${ch.order + 1}: ${ch.title} ===\n${ch.content}`).join('\n\n')}

Please provide:
1. Overview of each character's depth and authenticity
2. Character consistency analysis across the manuscript
3. Character arc evaluation
4. Relationship dynamics between characters
5. Suggestions for deepening characterization
6. Any inconsistencies or issues found`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 4096);

      const analysis = new AgentAnalysis({
        agentType: this.agentType,
        targetType: 'manuscript',
        targetId: manuscript.id,
        analysis: response,
      });

      return analysis;
    } catch (error) {
      throw new Error(`Character Developer analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a specific character
   */
  async analyzeCharacter(manuscript, character) {
    const context = aiService.buildContext(manuscript);

    // Find all chapters where this character appears
    const relevantChapters = manuscript.chapters.filter(ch => {
      const content = ch.content.toLowerCase();
      const charName = character.name.toLowerCase();
      return content.includes(charName);
    });

    const userMessage = `Please analyze this specific character:

Character Profile:
Name: ${character.name}
Role: ${character.role}
Age: ${character.age}
Description: ${character.description}
Background: ${character.background}
Personality: ${character.personality}
Motivations: ${character.motivations}
Arc: ${character.arc}
Notes: ${character.notes}

Appearances in manuscript:
${relevantChapters.length > 0 ?
  relevantChapters.map(ch => `
=== CHAPTER ${ch.order + 1}: ${ch.title} ===
${ch.content}
`).join('\n')
  : 'Character has not appeared in any chapters yet.'}

Other characters in the story:
${context.characters
  .filter(c => c.name !== character.name)
  .map(c => `- ${c.name} (${c.role})`)
  .join('\n')}

Please provide:
1. Character depth and authenticity assessment
2. Consistency check across all appearances
3. Character arc progress evaluation
4. Voice and personality consistency
5. Relationships with other characters
6. Suggestions for character development
7. Any inconsistencies or issues`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 4096);

      const analysis = new AgentAnalysis({
        agentType: this.agentType,
        targetType: 'character',
        targetId: character.id,
        analysis: response,
      });

      return analysis;
    } catch (error) {
      throw new Error(`Character analysis failed: ${error.message}`);
    }
  }

  /**
   * Help create or expand a character profile
   */
  async helpCreateCharacter(manuscript, partialCharacter) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `I'm creating a new character for my manuscript. Here's what I have so far:

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Character information provided:
${Object.entries(partialCharacter)
  .filter(([_, value]) => value)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}

Existing characters:
${context.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}

Please help me develop this character by:
1. Suggesting details for any missing fields
2. Ensuring the character fits well in this story and genre
3. Making sure the character is distinct from existing characters
4. Providing ideas for character motivations and arc
5. Suggesting potential relationships with existing characters

Please provide specific, creative suggestions that fit the story.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Character creation assistance failed: ${error.message}`);
    }
  }

  /**
   * Answer a specific question about characters
   */
  async answerQuestion(manuscript, question, character = null) {
    const context = aiService.buildContext(manuscript);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters:
${context.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}`;

    if (character) {
      contextText += `\n\nFocus character: ${character.name}
Full profile:
${Object.entries(character)
  .filter(([key, _]) => !['id', 'createdAt', 'updatedAt'].includes(key))
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}`;
    }

    contextText += `\n\nManuscript content:
${context.chapters.map(ch => `\n=== CHAPTER ${ch.order + 1}: ${ch.title} ===\n${ch.content}`).join('\n\n')}`;

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on character development and consistency.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Character Developer question failed: ${error.message}`);
    }
  }

  /**
   * Get streaming response for real-time feedback
   */
  async answerQuestionStream(manuscript, question, onChunk, character = null) {
    const context = aiService.buildContext(manuscript);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters:
${context.characters.map(c => `- ${c.name} (${c.role})`).join('\n')}`;

    if (character) {
      contextText += `\n\nFocus character: ${character.name}`;
    }

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on character development.`;

    try {
      const response = await aiService.sendMessageStream(
        SYSTEM_PROMPT,
        userMessage,
        onChunk,
        2048
      );
      return response;
    } catch (error) {
      throw new Error(`Character Developer streaming question failed: ${error.message}`);
    }
  }
}

export default new CharacterDeveloperAgent();
