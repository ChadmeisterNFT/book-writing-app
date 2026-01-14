import aiService from '../services/aiService';
import { AgentAnalysis } from '../models/AgentAnalysis';

/**
 * Story Architect Agent specializes in plot structure and narrative analysis
 */

const SYSTEM_PROMPT = `You are the Story Architect, an expert AI assistant specializing in narrative structure and plot analysis for fiction writing. Your expertise includes:

- Analyzing plot structure using frameworks like the three-act structure, hero's journey, and story beats
- Identifying pacing issues and suggesting improvements
- Detecting plot holes and logical inconsistencies
- Tracking dramatic tension and story arc progression
- Evaluating narrative flow and scene transitions
- Providing structural feedback on manuscripts

When analyzing a manuscript or chapter:
1. Identify the current story structure and major plot points
2. Assess pacing and dramatic tension
3. Note any plot holes or inconsistencies
4. Suggest specific improvements with examples
5. Highlight what's working well

Always be constructive and specific. Provide actionable feedback that helps the author improve their story. Format your analysis clearly with sections for different aspects.`;

class StoryArchitectAgent {
  constructor() {
    this.agentType = 'story_architect';
  }

  /**
   * Analyze entire manuscript structure
   */
  async analyzeManuscript(manuscript) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Please analyze the overall structure and plot of this manuscript:

Title: ${manuscript.title}
Genre: ${manuscript.genre}
Synopsis: ${manuscript.synopsis}

Chapters:
${context.chapters.map(ch => `- Chapter ${ch.order + 1}: "${ch.title}" (${ch.wordCount} words)`).join('\n')}

Full manuscript content:
${context.chapters.map(ch => `\n=== CHAPTER ${ch.order + 1}: ${ch.title} ===\n${ch.content}`).join('\n\n')}

Please provide:
1. Overall plot structure assessment
2. Major story beats and turning points
3. Pacing analysis
4. Plot holes or inconsistencies
5. Suggestions for improvement
6. What's working well`;

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
      throw new Error(`Story Architect analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a single chapter
   */
  async analyzeChapter(manuscript, chapter) {
    const context = aiService.buildContext(manuscript, chapter);

    const userMessage = `Please analyze this chapter in the context of the larger manuscript:

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}

Chapter ${chapter.order + 1}: "${chapter.title}"
Word count: ${chapter.getWordCount ? chapter.getWordCount() : 0}

Chapter content:
${chapter.content}

Context - Other chapters:
${context.manuscript.chapterCount > 1 ?
  manuscript.chapters
    .filter(ch => ch.id !== chapter.id)
    .map(ch => `- Chapter ${ch.order + 1}: "${ch.title}"`)
    .join('\n')
  : 'This is the only chapter so far.'}

Please provide:
1. How this chapter fits in the overall story structure
2. Pacing and dramatic tension within the chapter
3. Scene transitions and flow
4. Any structural issues
5. Specific suggestions for improvement`;

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
      throw new Error(`Story Architect chapter analysis failed: ${error.message}`);
    }
  }

  /**
   * Answer a specific question about plot/structure
   */
  async answerQuestion(manuscript, question, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Synopsis: ${manuscript.synopsis}
Total chapters: ${context.manuscript.chapterCount}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}" (Chapter ${chapter.order + 1})
Content: ${chapter.content}`;
    } else {
      contextText += `\n\nAll chapters:
${context.chapters.map(ch => `\n=== CHAPTER ${ch.order + 1}: ${ch.title} ===\n${ch.content}`).join('\n\n')}`;
    }

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on story structure and plot.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Story Architect question failed: ${error.message}`);
    }
  }

  /**
   * Get streaming response for real-time feedback
   */
  async answerQuestionStream(manuscript, question, onChunk, chapter = null) {
    const context = aiService.buildContext(manuscript, chapter);

    let contextText = `Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Synopsis: ${manuscript.synopsis}`;

    if (chapter) {
      contextText += `\n\nCurrent chapter: "${chapter.title}" (Chapter ${chapter.order + 1})
Content: ${chapter.content}`;
    }

    const userMessage = `${contextText}

Author's question: ${question}

Please provide a detailed answer focusing on story structure and plot.`;

    try {
      const response = await aiService.sendMessageStream(
        SYSTEM_PROMPT,
        userMessage,
        onChunk,
        2048
      );
      return response;
    } catch (error) {
      throw new Error(`Story Architect streaming question failed: ${error.message}`);
    }
  }
}

export default new StoryArchitectAgent();
