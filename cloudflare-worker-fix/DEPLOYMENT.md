# Deploy Cloudflare Worker

## Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Open Cloudflare Dashboard**:
   - Go to https://dash.cloudflare.com/
   - Navigate to **Workers & Pages** in the left sidebar

2. **Find Your Worker**:
   - Look for the worker named `spring-wind-6989`
   - Click on it to open the editor

3. **Update the Code**:
   - Click **Edit Code** or **Quick Edit**
   - Select all existing code and replace it with the fixed code from `worker.js`
   - The fixed code file is located at: `C:\Users\oshada\.gemini\antigravity\scratch\cloudflare-worker-fix\worker.js`

4. **Deploy**:
   - Click **Save and Deploy**
   - Wait for the deployment to complete
   - You should see a success message

5. **Verify Deployment**:
   - Visit https://spring-wind-6989.samename253.workers.dev/
   - You should still see "Bot is running!"
   - Test the bot via Telegram to verify translation is working

## Option 2: Deploy via Wrangler CLI

If you have Wrangler installed and configured:

```powershell
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the worker
cd C:\Users\oshada\.gemini\antigravity\scratch\cloudflare-worker-fix
wrangler deploy --name spring-wind-6989
```

## What Was Fixed

✅ **Added Gemini API Safety Settings** - Prevents content from being blocked for violence/adult themes
✅ **Improved Error Handling** - Returns detailed error information instead of failing silently  
✅ **User Feedback** - Bot now tells you if translation succeeded or failed
✅ **Graceful Fallback** - If translation fails, English description is used instead of nothing
✅ **Better Logging** - Console errors for debugging translation issues

## Testing After Deployment

### Test via Telegram Bot

1. Send `/start` to your bot
2. Select **🎬 Add Movie**
3. Enter a movie name (e.g., "Inception" or "The Dark Knight")
4. Select a movie from the results
5. **Look for the translation status message**:
   - ✅ "Description translated to Sinhala" = Translation succeeded
   - ⚠️ "Translation failed, using English description" = Translation failed but English is saved
6. Complete the flow by entering CDN URL and Facebook ID
7. Check your Supabase `movies` table - the `description` field should now contain Sinhala text (සිංහල)

### Verify in Supabase

After adding content via the bot, check your Supabase tables:
- **movies** table → `description` column should have Sinhala text
- **tv_shows** table → `description` column should have Sinhala text  
- **episodes** table → `description` column should have Sinhala text

If you see Sinhala characters (සිංහල අකුරු) instead of English, the fix is working! 🎉
