# LinkedIn Post Analyzer 🤖

A Chrome extension that analyzes LinkedIn feed posts, detects AI-generated content, and allows you to filter users based on their AI usage patterns.

## Features

- 🔍 **Automatic Post Detection** - Scans your LinkedIn feed and extracts posts in real-time
- 🤖 **AI Content Analysis** - Uses OpenAI API or heuristic analysis to detect AI-generated content
- 📊 **User Database** - Maintains a database of LinkedIn users with AI usage statistics
- 🚫 **Smart Filtering** - Filter out posts from users who frequently use AI-generated content
- 📈 **Analytics Dashboard** - View statistics on posts analyzed, AI scores, and filtered users
- ⚙️ **Customizable Threshold** - Set your own AI detection sensitivity
- 💾 **Data Persistence** - All data stored locally in your browser

## Installation

### Option 1: Load Unpacked Extension (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `linkedin-post-analyzer` directory
6. The extension is now installed!

### Option 2: Build and Install

```bash
# Clone the repository
git clone https://github.com/roehst/linkedin-post-analyzer.git
cd linkedin-post-analyzer

# The extension is ready to use - no build step required
# Load it in Chrome as described in Option 1
```

## Usage

### Getting Started

1. **Install the Extension** - Follow the installation steps above
2. **Configure OpenAI API (Optional)** - Click the extension icon and go to Settings to add your OpenAI API key
   - Without an API key, the extension uses heuristic analysis (works but less accurate)
   - With an API key, you get accurate AI detection using GPT-3.5-turbo
3. **Visit LinkedIn** - Navigate to https://www.linkedin.com/feed/
4. **Watch it Work** - The extension automatically analyzes posts as you scroll

### Features Explained

#### Stats Dashboard
- View total posts analyzed and users tracked
- See breakdown of posts by AI score (High/Medium/Low)
- Track how many users you've filtered

#### Users Management
- Browse all tracked users sorted by average AI score
- See post count and AI percentage for each user
- Filter/unfilter users with one click
- Search for specific users

#### Settings
- **OpenAI API Key**: Add your API key for accurate detection
- **AI Threshold**: Adjust sensitivity (default: 70%)
- **Data Management**: Clear all stored data

### Visual Indicators

Posts are tagged with AI scores directly in your LinkedIn feed:

- 🤖 **High AI (70-100%)** - Red indicator, likely AI-generated
- ⚠️ **Medium AI (40-70%)** - Yellow indicator, possibly AI-assisted
- ✅ **Low AI (0-40%)** - Green indicator, likely human-written

Filtered posts are blurred with an option to show them anyway.

## How It Works

1. **DOM Analysis**: The content script monitors the LinkedIn feed and extracts post data (content, author, timestamp)
2. **AI Detection**: Posts are sent to the background worker which:
   - Uses OpenAI API to analyze content (if API key configured)
   - Falls back to heuristic analysis (checking for AI-typical patterns and phrases)
3. **Scoring**: Each post receives an AI score from 0 (human) to 1 (AI)
4. **Database**: Posts and user statistics are stored in Chrome's local storage
5. **Filtering**: Users exceeding the AI threshold can be filtered from your feed

## Configuration

### OpenAI API Key

To get accurate AI detection:

1. Sign up at https://platform.openai.com/
2. Generate an API key
3. Open the extension popup > Settings
4. Paste your API key and click "Save"

**Cost**: Uses GPT-3.5-turbo model, typically costs ~$0.0015 per post analyzed

### Heuristic Detection (No API Key)

Without an API key, the extension uses pattern matching to detect:
- Common AI buzzwords (leverage, synergy, paradigm, delve, etc.)
- Formal language patterns
- Excessive emoji usage
- AI-typical transitional phrases

Less accurate but free and works immediately.

## Privacy & Security

- ✅ All data stored locally in your browser
- ✅ No data sent to external servers (except OpenAI when configured)
- ✅ API key stored securely in Chrome's storage
- ✅ Open source - audit the code yourself
- ✅ Only runs on linkedin.com domains

## Development

### Project Structure

```
linkedin-post-analyzer/
├── manifest.json       # Chrome extension manifest (v3)
├── background.js       # Service worker for AI analysis & storage
├── content.js          # Content script for DOM manipulation
├── content.css         # Styles for LinkedIn feed indicators
├── popup.html          # Extension popup interface
├── popup.js            # Popup logic and UI controller
├── popup.css           # Popup styles
└── icons/              # Extension icons (16, 48, 128)
```

### Key Components

- **Content Script** (`content.js`): Runs on LinkedIn pages, extracts posts, adds visual indicators
- **Background Worker** (`background.js`): Handles API calls, manages databases, coordinates analysis
- **Popup** (`popup.html/js/css`): User interface for stats, user management, and settings

### Testing

1. Load the extension in Chrome
2. Visit LinkedIn and observe the console for any errors
3. Check that posts are being analyzed (look for indicators)
4. Test filtering by clicking the filter button on a user
5. Verify stats update in the popup

## Troubleshooting

### Posts not being analyzed
- Refresh the LinkedIn page
- Check the browser console for errors
- Ensure the extension is enabled

### API calls failing
- Verify your OpenAI API key is correct
- Check you have API credits available
- The extension falls back to heuristic analysis on errors

### Extension not loading
- Make sure you're in Developer mode
- Try reloading the extension at chrome://extensions/
- Check for any manifest.json errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use and modify as needed

## Disclaimer

This extension is for educational and personal use. It analyzes publicly visible LinkedIn content. AI detection is not 100% accurate and should be used as a guide, not absolute truth.

## Support

For issues or questions, please open an issue on GitHub.
