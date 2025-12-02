# Security Guidelines

## API Key Management

### ⚠️ CRITICAL: Never Commit API Keys to Git

API keys are like passwords. If compromised, others can:
- Use your project's quota
- Incur charges (if billing is enabled)
- Access your private data

### Security Rules

1. **Never commit API keys to source control**
   - Do not check your API key into version control systems like Git
   - The `.env` file is in `.gitignore` - keep it there!

2. **Never expose API keys on the client-side**
   - Do not use your API key directly in web or mobile apps in production
   - Keys in client-side code can be extracted

3. **Use server-side calls with API keys**
   - The most secure way to use your API key is to call the Gemini API from a server-side application
   - Our backend (FastAPI) handles all AI API calls server-side ✅

### Best Practices

1. **Use `.env` files for local development**
   - Copy `backend/.env.example` to `backend/.env`
   - Add your API keys to `backend/.env`
   - Never commit `backend/.env` to git

2. **Add restrictions to your API keys**
   - Limit a key's permissions by adding API key restrictions
   - This minimizes potential damage if the key is ever leaked

3. **Rotate keys regularly**
   - If you suspect a key has been compromised, rotate it immediately
   - Get new keys from: https://makersuite.google.com/app/apikey

### If Your Key is Compromised

1. **Immediately revoke the compromised key** at https://makersuite.google.com/app/apikey
2. **Generate a new API key**
3. **Update your `backend/.env` file** with the new key
4. **Restart your backend server**
5. **Review your git history** to ensure the key is not in any commits

### Current Setup

Our project follows security best practices:

✅ API keys stored in `backend/.env` (not committed to git)  
✅ `.env` is in `.gitignore`  
✅ `.env.example` provides template without real keys  
✅ All AI API calls made server-side (FastAPI backend)  
✅ No API keys exposed to client-side code  

### Environment Variables

Required in `backend/.env`:

```bash
# Database
DATABASE_URL="your_mongodb_connection_string_here"

# LLM Provider
LLM_PROVIDER="gemini"

# API Keys (keep these secret!)
GEMINI_API_KEY="your_gemini_api_key_here"
ANTHROPIC_API_KEY="your_anthropic_api_key_here"  # optional
OPENAI_API_KEY="your_openai_api_key_here"        # optional

# Model Configuration
GEMINI_MODEL="gemini-1.5-flash"
CLAUDE_MODEL="claude-3-5-haiku-20241022"
OPENAI_MODEL="gpt-4o-mini"
```

### For Production Deployment

When deploying to production:

1. Use environment variables provided by your hosting platform
2. Never hardcode API keys in your code
3. Use secrets management services (e.g., AWS Secrets Manager, Azure Key Vault)
4. Enable API key restrictions (IP allowlisting, referrer restrictions)
5. Monitor API usage for unusual activity

## Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly rather than opening a public issue.