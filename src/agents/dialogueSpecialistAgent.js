import aiService from '../services/aiService';
import { AgentAnalysis } from '../models/AgentAnalysis';

/**
 * Dialogue Specialist Agent specializes in dialogue quality and authenticity
 */

const SYSTEM_PROMPT = `You are the Dialogue Specialist, an expert AI assistant specializing in dialogue writing, conversation flow, and character-specific speech patterns for fiction. Your expertise includes:

- Analyzing dialogue for authenticity and naturalness
- Ensuring each character has a distinct voice and speech pattern
- Evaluating conversation flow and pacing
- Identifying dialogue that advances plot or reveals character
- Checking for realistic subtext and implications
- Analyzing dialogue tags and action beats
- Ensuring appropriate use of dialect, slang, or formal speech
- Identifying exposition dumps disguised as dialogue
- Checking for "on-the-nose" dialogue that's too direct
- Ensuring dialogue matches character personality, background, and emotional state

When analyzing dialogue:
1. Assess overall authenticity and naturalness
2. Check if each character has a distinct voice
3. Evaluate whether dialogue serves a purpose (plot or character development)
4. Identify conversations that feel forced or unnatural
5. Check dialogue tag usage (said vs. alternatives, action beats)
6. Note any exposition dumps or "as you know, Bob" moments
7. Highlight strong dialogue examples
8. Provide specific rewrite suggestions for weak dialogue
9. Ensure dialogue matches character backgrounds and education levels
10. Check for appropriate rhythm and pacing in exchanges

Be specific and provide examples. Focus on making dialogue feel authentic while serving the story.`;

class DialogueSpecialistAgent {
  constructor() {
    this.agentType = 'dialogue_specialist';
  }

  /**
   * Analyze entire manuscript for dialogue quality
   */
  async analyzeManuscript(manuscript) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Please analyze all dialogue throughout this manuscript:

Title: ${manuscript.title}
Genre: ${manuscript.genre}

Characters:
${context.characters.length > 0
  ? context.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')
  : 'No character profiles defined yet.'}

Full manuscript content:
${context.chapters.map((ch, idx) => `
=== CHAPTER ${idx + 1}: ${ch.title} ===
${ch.content}
`).join('\n\n')}

Please provide:
1. **Overall Dialogue Quality**: Assess naturalness and authenticity
2. **Character Voice Distinction**: Does each character sound unique? Provide examples
3. **Dialogue Purpose**: Does dialogue advance plot or reveal character? Note strong examples
4. **Problem Areas**: Identify unnatural, forced, or "on-the-nose" dialogue with examples
5. **Dialogue Tags**: Assess tag usage (overuse of "said" alternatives, action beats)
6. **Exposition Issues**: Flag any information dumps disguised as dialogue
7. **Speech Patterns**: Note if characters' speech matches their backgrounds
8. **Subtext**: Identify dialogue with good subtext vs. dialogue that's too direct
9. **Specific Improvements**: Provide 5-7 concrete rewrite suggestions with examples
10. **Strengths**: Highlight 2-3 examples of excellent dialogue

Be specific with chapter references and character names.`;

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
      throw new Error(`Dialogue Specialist analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a single chapter for dialogue quality
   */
  async analyzeChapter(manuscript, chapter) {
    const context = aiService.buildContext(manuscript, chapter);

    const userMessage = `Please analyze the dialogue in this chapter:

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Chapter ${chapter.order + 1}: "${chapter.title}"

Characters in the story:
${context.manuscript.characterCount > 0
  ? manuscript.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')
  : 'No character profiles defined yet.'}

Chapter content:
${chapter.content}

Please provide:
1. **Dialogue Overview**: How much dialogue is in this chapter? Is the balance right?
2. **Character Voices**: Do characters sound distinct? Note any voice consistency issues
3. **Natural Flow**: Does the conversation feel authentic? Flag awkward exchanges
4. **Dialogue Purpose**: Does the dialogue move the story forward?
5. **Technical Issues**: Problems with tags, formatting, or attribution
6. **Strong Examples**: 1-2 examples of effective dialogue in this chapter
7. **Weak Examples**: 1-2 examples that need improvement
8. **Specific Rewrites**: Provide improved versions of weak dialogue

Use specific quotes. Be constructive and actionable.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 4096);

      const analysis = new AgentAnalysis({
        agentType: this.agentType,
        targetType: 'chapter',
        targetId: chapter.id,
        analysis: response,
      });

      return analysis;
    } catch (error) {
      throw new Error(`Dialogue Specialist chapter analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze dialogue for a specific character
   */
  async analyzeCharacterDialogue(manuscript, character) {
    const relevantChapters = manuscript.chapters.filter(ch => {
      const content = ch.content.toLowerCase();
      const charName = character.name.toLowerCase();
      return content.includes(charName);
    });

    const userMessage = `Please analyze all dialogue for this specific character:

Character Profile:
Name: ${character.name}
Role: ${character.role}
Description: ${character.description}
Background: ${character.background}
Personality: ${character.personality}

Character's appearances:
${relevantChapters.length > 0
  ? relevantChapters.map((ch, idx) => `
=== CHAPTER ${ch.order + 1}: ${ch.title} ===
${ch.content}
`).join('\n')
  : 'Character has not appeared yet.'}

Please provide:
1. **Voice Consistency**: Does this character have a consistent, distinct way of speaking?
2. **Voice Match**: Does their dialogue match their background, education, and personality?
3. **Speech Patterns**: Identify unique patterns, phrases, or mannerisms in their speech
4. **Emotional Range**: Does their dialogue change appropriately with emotional state?
5. **Strong Examples**: 2-3 examples of excellent dialogue for this character
6. **Weak Examples**: 2-3 examples that feel out of character or weak
7. **Voice Guidelines**: Create a mini-guide for how this character should speak
8. **Improvement Suggestions**: Specific rewrites for weak examples

Be specific with chapter references and quotes.`;

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
      throw new Error(`Character dialogue analysis failed: ${error.message}`);
    }
  }

  /**
   * Improve a specific dialogue exchange
   */
  async improveDialogue(dialogueExchange, characterInfo = '', context = '') {
    const userMessage = `Please improve this dialogue exchange:

${context ? `Context: ${context}\n\n` : ''}${characterInfo ? `Characters: ${characterInfo}\n\n` : ''}Dialogue:
${dialogueExchange}

Please provide:
1. What works in this dialogue
2. What feels unnatural or problematic
3. 2-3 improved versions with explanations
4. Tips for making it more authentic

Focus on natural flow, character voice, and purpose.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Dialogue improvement failed: ${error.message}`);
    }
  }

  /**
   * Answer a specific question about dialogue
   */
  async answerQuestion(manuscript, question, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters:
${context.characters.map(c => `- ${c.name} (${c.role}): ${c.description}`).join('\n')}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}" (Chapter ${chapter.order + 1})
Content: ${chapter.content}`;
    } else {
      contextText += `\n\nAll chapters:
${context.chapters.map((ch, idx) => `
=== CHAPTER ${idx + 1}: ${ch.title} ===
${ch.content}
`).join('\n\n')}`;
    }

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on dialogue quality, character voice, and conversation flow. Include specific examples from the manuscript when relevant.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Dialogue Specialist question failed: ${error.message}`);
    }
  }

  /**
   * Get streaming response for real-time feedback
   */
  async answerQuestionStream(manuscript, question, onChunk, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Characters:
${context.characters.map(c => `- ${c.name} (${c.role})`).join('\n')}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}"
Content: ${chapter.content}`;
    }

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on dialogue and character voice.`;

    try {
      const response = await aiService.sendMessageStream(
        SYSTEM_PROMPT,
        userMessage,
        onChunk,
        2048
      );
      return response;
    } catch (error) {
      throw new Error(`Dialogue Specialist streaming question failed: ${error.message}`);
    }
  }
}

export default new DialogueSpecialistAgent();
