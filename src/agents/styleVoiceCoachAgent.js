import aiService from '../services/aiService';
import { AgentAnalysis } from '../models/AgentAnalysis';

/**
 * Style & Voice Coach Agent specializes in writing style and tone consistency
 */

const SYSTEM_PROMPT = `You are the Style & Voice Coach, an expert AI assistant specializing in writing style, tone, and prose quality for fiction writing. Your expertise includes:

- Analyzing writing style and identifying the author's unique voice
- Ensuring tone consistency throughout the manuscript
- Providing prose improvement suggestions at the sentence level
- Identifying overused words, clichés, and weak phrases
- Analyzing rhythm, pacing, and flow of prose
- Checking for show vs. tell balance
- Evaluating descriptive language and imagery
- Maintaining the author's voice while suggesting improvements
- Identifying passive voice and suggesting active alternatives
- Analyzing sentence variety and structure

When analyzing writing:
1. Identify the author's unique voice and style characteristics
2. Note tone consistency or shifts across chapters
3. Highlight strong prose and effective techniques
4. Suggest specific improvements with examples
5. Point out overused words or phrases (with counts if possible)
6. Identify clichés or weak writing
7. Provide line-level editing suggestions when appropriate
8. Always preserve the author's voice while improving clarity and impact

Be constructive and specific. Focus on helping the author strengthen their writing while maintaining their unique style. Provide examples of both what works well and what could be improved.`;

class StyleVoiceCoachAgent {
  constructor() {
    this.agentType = 'style_voice_coach';
  }

  /**
   * Analyze entire manuscript for style and voice
   */
  async analyzeManuscript(manuscript) {
    const context = aiService.buildContext(manuscript);

    const userMessage = `Please analyze the writing style and voice throughout this manuscript:

Title: ${manuscript.title}
Genre: ${manuscript.genre}

Full manuscript content:
${context.chapters.map((ch, idx) => `
=== CHAPTER ${idx + 1}: ${ch.title} ===
${ch.content}
`).join('\n\n')}

Please provide:
1. **Voice Analysis**: Describe the author's unique voice and style characteristics
2. **Tone Consistency**: Assess whether tone remains consistent or shifts appropriately
3. **Strengths**: Highlight what works well in the prose (with specific examples)
4. **Areas for Improvement**: Identify weak areas (passive voice, clichés, telling vs showing)
5. **Overused Words/Phrases**: List frequently repeated words or phrases
6. **Sentence Variety**: Comment on rhythm, structure, and flow
7. **Line-Level Suggestions**: Provide specific prose improvements with examples
8. **Overall Recommendations**: Summary of how to strengthen the writing

Be specific with chapter references and examples. Preserve the author's voice.`;

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
      throw new Error(`Style & Voice Coach analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze a single chapter for style and voice
   */
  async analyzeChapter(manuscript, chapter) {
    const context = aiService.buildContext(manuscript, chapter);

    const userMessage = `Please analyze the writing style and voice in this chapter:

Manuscript: "${manuscript.title}"
Genre: ${manuscript.genre}
Chapter ${chapter.order + 1}: "${chapter.title}"

Chapter content:
${chapter.content}

Context - Overall manuscript voice:
${context.manuscript.chapterCount > 1
  ? 'This is one chapter of a larger work. Consider consistency with the established voice.'
  : 'This is the first/only chapter.'}

Please provide:
1. **Voice & Tone**: How does this chapter's voice fit with the overall style?
2. **Strong Prose**: Highlight 2-3 examples of effective writing in this chapter
3. **Weak Prose**: Identify 2-3 areas that could be strengthened (with specific examples)
4. **Show vs Tell**: Assess the balance and provide examples
5. **Sentence Flow**: Comment on rhythm and variety
6. **Word Choice**: Note any overused words or clichés
7. **Specific Suggestions**: Provide 3-5 concrete line-level improvements

Use specific quotes from the chapter. Be constructive and preserve the author's voice.`;

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
      throw new Error(`Style & Voice Coach chapter analysis failed: ${error.message}`);
    }
  }

  /**
   * Provide specific prose improvement for a passage
   */
  async improvePassage(passage, context = '') {
    const userMessage = `Please provide prose improvement suggestions for this passage:

${context ? `Context: ${context}\n\n` : ''}Passage:
"${passage}"

Please provide:
1. What works well in this passage
2. What could be improved
3. Specific rewrite suggestions (2-3 alternatives)
4. Explanation of why the rewrites are stronger

Preserve the author's voice and intent while improving clarity and impact.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Passage improvement failed: ${error.message}`);
    }
  }

  /**
   * Answer a specific question about style and voice
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

Please provide a detailed answer focusing on writing style, voice, tone, and prose quality. Include specific examples from the manuscript when relevant.`;

    try {
      const response = await aiService.sendMessage(SYSTEM_PROMPT, userMessage, 2048);
      return response;
    } catch (error) {
      throw new Error(`Style & Voice Coach question failed: ${error.message}`);
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

Please provide a detailed answer focusing on style and voice.`;

    try {
      const response = await aiService.sendMessageStream(
        SYSTEM_PROMPT,
        userMessage,
        onChunk,
        2048
      );
      return response;
    } catch (error) {
      throw new Error(`Style & Voice Coach streaming question failed: ${error.message}`);
    }
  }
}

export default new StyleVoiceCoachAgent();
