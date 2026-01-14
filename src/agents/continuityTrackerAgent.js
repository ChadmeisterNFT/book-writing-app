import aiService from '../services/aiService';
import { AgentAnalysis } from '../models/AgentAnalysis';

/**
 * Continuity Tracker Agent specializes in timeline consistency and detail tracking
 */

const SYSTEM_PROMPT = `You are the Continuity Tracker, an expert AI assistant specializing in continuity, consistency, and detail tracking for fiction writing. Your expertise includes:

- Monitoring timeline consistency across the manuscript
- Tracking all details mentioned (names, dates, descriptions, locations, objects)
- Identifying contradictions and inconsistencies in facts
- Maintaining a knowledge base of manuscript details
- Flagging when details change or conflict between chapters
- Tracking physical descriptions, locations, and world-building details
- Ensuring internal logic and rules remain consistent

When analyzing a manuscript:
1. Create a comprehensive list of all key details and facts
2. Note any timeline inconsistencies or impossible sequences
3. Flag contradictions in descriptions, names, or details
4. Track recurring elements (locations, objects, rules)
5. Identify continuity errors between chapters
6. Provide specific examples with chapter references
7. Suggest corrections for any inconsistencies found

Be extremely detail-oriented and thorough. Your job is to catch even small inconsistencies that readers might notice. Always provide chapter numbers and specific quotes when identifying issues.`;

class ContinuityTrackerAgent {
  constructor() {
    this.agentType = 'continuity_tracker';
  }

  /**
   * Analyze entire manuscript for continuity issues
   */
  async analyzeManuscript(manuscript) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Please perform a comprehensive continuity analysis of this manuscript:

Title: ${manuscript.title}
Genre: ${manuscript.genre}

Full manuscript content:
${context.chapters.map((ch, idx) => `
=== CHAPTER ${idx + 1}: ${ch.title} ===
${ch.content}
`).join('\n\n')}

Please provide:
1. **Timeline Analysis**: Check the sequence of events, dates, and time references for consistency
2. **Character Details**: Track physical descriptions, ages, backgrounds - flag any contradictions
3. **Location Details**: Note all locations mentioned and check for consistency in descriptions
4. **Object & Detail Tracking**: List important objects, facts, or rules mentioned - check consistency
5. **Continuity Errors Found**: List specific contradictions with chapter references and quotes
6. **Detail Database**: Create a reference list of key facts for the author to keep
7. **Recommendations**: Suggest specific corrections

Be thorough and catch even minor inconsistencies.`;

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
      throw new Error(`Continuity Tracker analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a single chapter for continuity issues
   */
  async analyzeChapter(manuscript, chapter) {
    const context = aiService.buildContext(manuscript, chapter);

    const userMessage = `Please analyze this chapter for continuity issues within the larger manuscript:

Manuscript: "${manuscript.title}"
Chapter ${chapter.order + 1}: "${chapter.title}"

This chapter:
${chapter.content}

Previous chapters summary:
${manuscript.chapters
  .filter(ch => ch.order < chapter.order)
  .map(ch => `Chapter ${ch.order + 1}: ${ch.title}`)
  .join('\n')}

Characters established so far:
${context.manuscript.characterCount > 0
  ? manuscript.characters.map(c => `- ${c.name}: ${c.description}`).join('\n')
  : 'None defined yet'}

Please check:
1. Timeline consistency with previous chapters
2. Character detail consistency (descriptions, names, behaviors)
3. Location and setting consistency
4. Previously established facts and rules
5. Any new details that might contradict earlier information
6. Objects or elements that were described differently before

Flag any continuity issues with specific references.`;

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
      throw new Error(`Continuity Tracker chapter analysis failed: ${error.message}`);
    }
  }

  /**
   * Create a continuity reference guide
   */
  async createReferenceGuide(manuscript) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Create a comprehensive continuity reference guide for this manuscript:

Title: ${manuscript.title}

Full manuscript:
${context.chapters.map((ch, idx) => `
=== CHAPTER ${idx + 1}: ${ch.title} ===
${ch.content}
`).join('\n\n')}

Please create a detailed reference guide with:
1. **Timeline**: Chronological order of all events with chapter references
2. **Character Details**: Complete physical descriptions, ages, backgrounds for all characters
3. **Locations**: Descriptions of all places mentioned
4. **Important Objects**: List of significant items with descriptions
5. **World Rules**: Any rules, laws, or logic established in the story world
6. **Key Facts**: Important details the author must remember for consistency

Format this as a reference guide the author can keep and consult while writing.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 4096);
      return response;
    } catch (error) {
      throw new Error(`Reference guide creation failed: ${error.message}`);
    }
  }

  /**
   * Answer a specific question about continuity
   */
  async answerQuestion(manuscript, question, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}`;

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

Please provide a detailed answer focusing on continuity, consistency, and detail tracking. Check the manuscript for relevant facts and flag any inconsistencies.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Continuity Tracker question failed: ${error.message}`);
    }
  }

  /**
   * Get streaming response for real-time feedback
   */
  async answerQuestionStream(manuscript, question, onChunk, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}"
Content: ${chapter.content}`;
    }

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on continuity and consistency.`;

    try {
      const response = await aiService.sendMessageStream(
        SYSTEM_PROMPT,
        userMessage,
        onChunk,
        2048
      );
      return response;
    } catch (error) {
      throw new Error(`Continuity Tracker streaming question failed: ${error.message}`);
    }
  }
}

export default new ContinuityTrackerAgent();
