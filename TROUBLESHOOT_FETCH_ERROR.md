# 🔧 URGENT: Fix "Failed to fetch" Error - Step by Step

## ✅ What I Just Fixed

1. ✅ Updated `.env.local` to use proxy: `NEXT_PUBLIC_API_URL=/api/v1`
2. ✅ Added comprehensive debug logging to `fetchTests()` function
3. ✅ Enhanced error messages with detailed diagnostics

## 🚨 CRITICAL: You MUST Restart the Dev Server

The changes WON'T work until you restart:

```bash
# 1. Stop the current server (Ctrl+C in terminal)
# 2. Start it again
npm run dev
```

## 🔍 After Restart - Check the Console

You'll now see detailed debug output like:

```
=== FETCH TESTS DEBUG ===
API_BASE_URL: /api/v1
Full URL: /api/v1/tests?page=0&size=10
Environment variable: /api/v1
Request params: { page: 0, size: 10, search: undefined, status: undefined }
```

## 📋 Troubleshooting Checklist

### Option 1: Using Next.js Proxy (Recommended)
Current setup should work. After restart, verify:
- `.env.local` has: `NEXT_PUBLIC_API_URL=/api/v1`
- `next.config.ts` has the rewrite rules
- Browser requests go to: `http://localhost:3000/api/v1/tests`

### Option 2: Direct to Production Server
If proxy doesn't work, try direct connection:
```env
NEXT_PUBLIC_API_URL=https://www.snehbharat.com/api/v1
```
⚠️ May have CORS issues

### Option 3: Local Backend (Best for Development)
If you have backend running locally:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## 🧪 Test if Production Server is Accessible

Open your browser and go to:
```
https://www.snehbharat.com/api/v1/tests
```

**If you see test data:** Server is up ✅
**If you get an error:** Server is down or blocking access ❌

## 📊 What to Look For in Console

After restart, check browser console for:

### ✅ Success (Proxy Working):
```
=== FETCH TESTS DEBUG ===
API_BASE_URL: /api/v1
Full URL: /api/v1/tests?page=0&size=10
Response status: 200
✅ Tests loaded successfully
```

### ❌ Network Error (Server Unreachable):
```
=== FETCH TESTS ERROR ===
Error message: Failed to fetch
🔌 NETWORK ERROR DETECTED
- The server might be unreachable
```

### ❌ CORS Error:
```
Access to fetch at 'https://www.snehbharat.com' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

## 🛠️ Quick Fixes

### If Server is Down:
Use local backend or wait for server to be back online

### If CORS Error:
Make sure you're using the proxy (`NEXT_PUBLIC_API_URL=/api/v1`)

### If Still Getting Errors:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Check browser Network tab for actual request URL
4. Share the console output with me

## 📞 Need Help?

Share these details:
1. Full console output after restart
2. What you see in Network tab (request URL and response)
3. Can you access `https://www.snehbharat.com/api/v1/tests` in browser?

---

**REMEMBER: Restart the dev server first!** 🚀
