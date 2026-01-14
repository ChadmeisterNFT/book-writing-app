# AI-Powered Book Writing Application

An intelligent book writing application featuring multiple specialized AI agents that assist authors throughout the entire writing process. Built with React and powered by Claude (Anthropic's AI).

## Features

### Core Features

- **Enhanced Editor**: Distraction-free writing interface with chapter management
  - Auto-save functionality
  - Chapter organization with drag-and-drop
  - Word count tracking
  - Focus mode for distraction-free writing
  - Dark mode support

- **AI Agents**: Specialized AI assistants to help with different aspects of writing
  - **Story Architect Agent**: Analyzes plot structure, identifies pacing issues, detects plot holes
  - **Character Developer Agent**: Maintains character profiles, tracks character arcs, flags inconsistencies

- **Manuscript Management**:
  - Create and manage multiple manuscripts
  - Track progress toward word count goals
  - Character profile management
  - Project dashboard with statistics

- **Export Functionality**: Export your work in multiple formats
  - DOCX (Microsoft Word)
  - Markdown
  - Plain text
  - JSON (for backup/import)
  - Character profiles (JSON)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Anthropic API key (get one at https://console.anthropic.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd book-writing-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and add your Anthropic API key:
     ```
     REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
     ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage Guide

### Creating Your First Manuscript

1. Navigate to the Dashboard
2. Click "New Manuscript"
3. Fill in the manuscript details:
   - Title (required)
   - Author name
   - Genre
   - Synopsis
   - Word count goal
4. Click "Create"

### Writing

1. Navigate to the "Editor" tab
2. Your manuscript will have a default first chapter
3. Click "New" to add more chapters
4. Type directly in the editor - content auto-saves every second
5. Use the focus mode button (◫) for distraction-free writing
6. Toggle the chapter list with the sidebar button (◀/▶)

### Using AI Agents

1. Navigate to the "AI Agents" tab
2. Select an agent:
   - **Story Architect**: For plot and structure feedback
   - **Character Developer**: For character analysis
3. Choose your context (full manuscript, specific chapter, or character)
4. Ask questions or request an analysis:
   - Type questions in the chat box
   - Click "Analyze Manuscript" for a full analysis
   - Click "Analyze Chapter" for chapter-specific feedback
   - Click "Analyze Character" for character consistency checks

### Managing Characters

1. Go to the Dashboard
2. Scroll to the "Characters" section
3. Click "Add Character"
4. Fill in character details:
   - Name (required)
   - Role (protagonist, antagonist, supporting)
   - Description
5. Use the Character Developer agent to get suggestions and track consistency

### Exporting Your Work

1. Go to the Dashboard
2. Scroll to the "Export Manuscript" section
3. Choose your format:
   - **DOCX**: For editing in Microsoft Word or Google Docs
   - **Markdown**: For version control and static site generators
   - **Text**: Plain text format
   - **JSON**: Complete backup with all metadata
   - **Characters**: Export character profiles separately

## Architecture

### Project Structure

```
src/
├── agents/              # AI agent implementations
│   ├── storyArchitectAgent.js
│   └── characterDeveloperAgent.js
├── components/          # React components
│   ├── Editor.js       # Main writing interface
│   ├── AgentChat.js    # AI agent chat interface
│   ├── EnhancedDashboard.js  # Project dashboard
│   └── ...
├── contexts/           # React contexts
│   └── ManuscriptContext.js  # Manuscript state management
├── models/             # Data models
│   ├── Manuscript.js
│   ├── Chapter.js
│   ├── Character.js
│   └── AgentAnalysis.js
├── services/           # Service layer
│   ├── aiService.js    # Claude API integration
│   └── storageService.js  # Local storage management
└── utils/              # Utility functions
    └── exportUtil.js   # Export functionality
```

### Data Storage

- Uses browser's localStorage for data persistence
- All manuscripts, chapters, and characters are stored locally
- No data is sent to external servers except AI agent requests to Anthropic API
- Agent analyses are stored for reference

### AI Agent System

Each agent has:
- Specialized system prompt defining its expertise
- Access to full manuscript context
- Ability to analyze specific chapters or characters
- Structured output format for consistency

## API Usage

The application uses the Anthropic Claude API (Sonnet 4.5 model) for AI features.

**Important**: The API key is currently configured for browser use (`dangerouslyAllowBrowser: true`). For production, you should:
1. Create a backend API proxy
2. Move API calls to the server side
3. Never expose your API key in client-side code

## Development

### Available Scripts

- `npm start`: Run development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

### Adding New AI Agents

To add a new specialized agent:

1. Create a new file in `src/agents/`:
   ```javascript
   // src/agents/yourAgent.js
   import aiService from '../services/aiService';
   import { AgentAnalysis } from '../models/AgentAnalysis';

   const SYSTEM_PROMPT = `Your specialized agent prompt...`;

   class YourAgent {
     constructor() {
       this.agentType = 'your_agent';
     }

     async analyzeManuscript(manuscript) {
       // Implementation
     }
   }

   export default new YourAgent();
   ```

2. Add the agent to `AgentChat.js`:
   ```javascript
   import yourAgent from '../agents/yourAgent';

   const agents = {
     your_agent: {
       name: 'Your Agent Name',
       description: 'Agent description',
       icon: '📖',
       agent: yourAgent,
     },
     // ... other agents
   };
   ```

## Roadmap

Future enhancements planned:

- [ ] Additional AI Agents:
  - Continuity Tracker Agent
  - Style & Voice Coach Agent
  - Dialogue Specialist Agent
- [ ] Timeline visualization
- [ ] Character relationship maps
- [ ] Plot arc visualization
- [ ] Research notes panel
- [ ] Real-time collaboration
- [ ] Cloud sync (optional)
- [ ] Mobile app

## Privacy & Data

- All manuscript data is stored locally in your browser
- AI agent requests are sent to Anthropic's API with your content
- No data is stored on our servers
- Review Anthropic's privacy policy for AI usage: https://www.anthropic.com/privacy

## Troubleshooting

### AI agents not working

1. Check that your API key is set correctly in `.env`
2. Make sure the environment variable starts with `REACT_APP_`
3. Restart the development server after changing `.env`
4. Check browser console for error messages

### Data not persisting

1. Check if localStorage is enabled in your browser
2. Make sure you're not in incognito/private mode
3. Clear browser cache and try again

### Export not working

1. Check browser console for errors
2. Make sure pop-ups are not blocked
3. Try a different browser

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for similar problems
- Provide detailed information about your environment and the issue

## Acknowledgments

- Built with [React](https://reactjs.org/)
- AI powered by [Anthropic's Claude](https://www.anthropic.com/)
- Icons from Unicode emoji
- Export functionality using [docx](https://github.com/dolanmiu/docx) and [file-saver](https://github.com/eligrey/FileSaver.js)

---

**Happy Writing! 📚✨**
