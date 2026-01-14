import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Export utilities for manuscripts
 */

/**
 * Export manuscript to DOCX format
 */
export const exportToDocx = async (manuscript) => {
  try {
    // Create document sections
    const sections = [];

    // Title page
    sections.push(
      new Paragraph({
        text: manuscript.title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      })
    );

    if (manuscript.author) {
      sections.push(
        new Paragraph({
          text: `by ${manuscript.author}`,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 800,
          },
        })
      );
    }

    // Add chapters
    manuscript.chapters.forEach((chapter, index) => {
      // Chapter heading
      sections.push(
        new Paragraph({
          text: chapter.title || `Chapter ${index + 1}`,
          heading: HeadingLevel.HEADING_1,
          spacing: {
            before: 400,
            after: 200,
          },
        })
      );

      // Chapter content - split into paragraphs
      const paragraphs = chapter.content.split('\n\n');
      paragraphs.forEach((para) => {
        if (para.trim()) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          );
        }
      });
    });

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    // Generate blob
    const blob = await Packer.toBlob(doc);

    // Save file
    const fileName = `${manuscript.title || 'manuscript'}.docx`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Export to DOCX failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export manuscript to plain text
 */
export const exportToText = (manuscript) => {
  try {
    let content = '';

    // Title
    content += `${manuscript.title}\n`;
    if (manuscript.author) {
      content += `by ${manuscript.author}\n`;
    }
    content += '\n' + '='.repeat(50) + '\n\n';

    // Chapters
    manuscript.chapters.forEach((chapter, index) => {
      content += `\n\n${chapter.title || `Chapter ${index + 1}`}\n`;
      content += '-'.repeat(30) + '\n\n';
      content += chapter.content + '\n';
    });

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const fileName = `${manuscript.title || 'manuscript'}.txt`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Export to text failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export manuscript to Markdown
 */
export const exportToMarkdown = (manuscript) => {
  try {
    let content = '';

    // Title
    content += `# ${manuscript.title}\n\n`;
    if (manuscript.author) {
      content += `**by ${manuscript.author}**\n\n`;
    }
    if (manuscript.genre) {
      content += `*Genre: ${manuscript.genre}*\n\n`;
    }
    if (manuscript.synopsis) {
      content += `## Synopsis\n\n${manuscript.synopsis}\n\n`;
    }
    content += '---\n\n';

    // Chapters
    manuscript.chapters.forEach((chapter, index) => {
      content += `\n## ${chapter.title || `Chapter ${index + 1}`}\n\n`;
      content += chapter.content + '\n\n';
    });

    // Create blob and download
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const fileName = `${manuscript.title || 'manuscript'}.md`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Export to markdown failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Export characters to JSON
 */
export const exportCharacters = (characters, manuscriptTitle) => {
  try {
    const data = JSON.stringify(characters, null, 2);
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const fileName = `${manuscriptTitle || 'manuscript'}_characters.json`;
    saveAs(blob, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Export characters failed:', error);
    return { success: false, error: error.message };
  }
};
