# Example Configuration

## OpenAI API Key

To enable accurate AI detection, you'll need an OpenAI API key:

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Open the extension popup > Settings
6. Paste the key and click "Save API Key"

## Cost Estimation

The extension uses the `gpt-3.5-turbo` model:

- **Cost per post**: ~$0.0015 (approximately)
- **100 posts**: ~$0.15
- **1,000 posts**: ~$1.50

Costs may vary based on post length. You can monitor usage in your OpenAI dashboard.

## AI Detection Threshold

The threshold determines when a user is flagged as "high AI":

- **70% (default)**: Balanced - catches obvious AI content
- **50%**: Sensitive - flags more content as AI
- **85%**: Strict - only flags very obvious AI content

Adjust in Settings > AI Detection Threshold

## Privacy Settings

All data is stored locally:

- Posts database: Chrome local storage
- User statistics: Chrome local storage
- API key: Chrome local storage (encrypted by Chrome)

To clear all data: Settings > Data Management > Clear All Data

## Heuristic Detection (No API Key)

Without an API key, the extension uses pattern matching:

- Detects AI buzzwords (leverage, synergy, paradigm, etc.)
- Checks for formal language patterns
- Identifies AI-typical transitions
- Monitors emoji usage patterns

Less accurate but free and immediate.
