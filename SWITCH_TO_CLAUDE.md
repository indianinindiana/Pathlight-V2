# Switching from Gemini to Claude

## Steps to Switch to Claude:

### 1. Get a Claude API Key

Visit https://console.anthropic.com/ and:
- Sign up or log in
- Go to API Keys section
- Create a new API key
- Copy the key (starts with `sk-ant-`)

### 2. Update backend/.env

Open `/Users/tennisdad/Desktop/snapdev-apps/wise-okapi-flit/backend/.env` and update these lines:

```bash
# Change this line:
LLM_PROVIDER="gemini"

# To this:
LLM_PROVIDER="claude"

# Add your Claude API key:
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

### 3. Restart the Backend

The backend will automatically reload when you save the `.env` file.

### 4. Test Clara

1. Go to http://localhost:5137/onboarding-clara
2. Start a new session (refresh the page)
3. Answer the questions
4. Clara will now use Claude for responses!

## Why Claude?

- ✅ Better at handling financial content
- ✅ No overly restrictive safety filters
- ✅ More nuanced and empathetic responses
- ✅ Better instruction following

## Model Being Used

The default Claude model is: **claude-3-5-haiku-20241022**

This is Claude's fastest model, perfect for quick responses like Clara's reactions.

## Cost Comparison

- **Gemini 1.5 Flash:** Free tier available, then $0.075 per 1M input tokens
- **Claude 3.5 Haiku:** $0.25 per 1M input tokens, $1.25 per 1M output tokens

For Clara's short responses (150 tokens max), costs are minimal:
- ~1000 onboarding sessions = ~$0.50

## Troubleshooting

If you get an error after switching:

1. **Check API key is set correctly** in `.env`
2. **Verify the key is valid** at https://console.anthropic.com/
3. **Check the terminal** for error messages
4. **Restart backend manually** if auto-reload didn't work:
   ```bash
   # Stop the backend (Ctrl+C in Terminal 25)
   # Then restart:
   cd backend && python3.13 -m uvicorn main:app --reload
   ```

## Switching Back to Gemini

If you want to switch back:

```bash
# In backend/.env
LLM_PROVIDER="gemini"
```

The backend will automatically reload.