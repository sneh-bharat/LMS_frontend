# Patient API Troubleshooting Guide

## "Failed to fetch" Error - Common Causes & Solutions

### 🔍 Error Details
```
TypeError: Failed to fetch
at fetchPatients (app/Apis/Patients/Patient_Service_API.ts)
```

---

### ✅ Solution 1: Verify Backend Server is Running

**Check if your backend Spring Boot server is running:**

1. Open your terminal/command prompt
2. Navigate to your backend project directory
3. Check if the server is running on port **8080**

**Expected output when server starts:**
```
Started Application in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

**If the server is NOT running:**
```bash
# Navigate to backend directory
cd path/to/your/backend/project

# Run the backend server
mvn spring-boot:run
# or
java -jar target/your-backend-app.jar
```

---

### ✅ Solution 2: Check API URL Configuration

**The frontend needs to know where to find the backend API.**

#### Option A: Use `.env.local` file (Recommended)

Create or edit `.env.local` in your project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

#### Option B: Direct code modification

Edit `app/Apis/Patients/Patient_Service_API.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

**Common API URLs:**
- Local development: `http://localhost:8080/api/v1`
- Network access: `http://192.168.1.X:8080/api/v1` (replace X with your IP)
- Docker: `http://host.docker.internal:8080/api/v1`

---

### ✅ Solution 3: Fix CORS Issues

**If you see CORS errors in the browser console**, your backend needs to allow requests from your frontend.

**Add this CORS configuration to your Spring Boot backend:**

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/v1/**", configuration);
        return source;
    }
}
```

**Or add this to your controller:**

```java
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {
    // ... your endpoints
}
```

---

### ✅ Solution 4: Restart Frontend Server

**After changing `.env.local`, you MUST restart your Next.js server:**

```bash
# Stop the current server (Ctrl+C)

# Restart
npm run dev
```

**Important:** Environment variables are only loaded at startup. Hot reload won't pick them up.

---

### ✅ Solution 5: Test API Endpoint Manually

**Test if the backend is accessible:**

#### Using Browser:
Open in your browser:
```
http://localhost:8080/api/v1/patients?pageNo=0&pageSize=10
```

#### Using curl:
```bash
curl -X GET "http://localhost:8080/api/v1/patients?pageNo=0&pageSize=10"
```

#### Using Postman:
1. Method: GET
2. URL: `http://localhost:8080/api/v1/patients`
3. Params:
   - `pageNo`: 0
   - `pageSize`: 10
4. Send request

**Expected response:**
```json
{
  "success": true,
  "data": {
    "content": [],
    "pageNo": 0,
    "pageSize": 10,
    "totalPages": 0,
    "totalElements": 0
  }
}
```

---

### ✅ Solution 6: Check Firewall/Antivirus

**If you're on a network, firewall might block connections:**

1. Windows Firewall → Allow port 8080
2. Antivirus → Add exception for your backend server
3. Network policy → Contact IT admin

---

### 🐛 Debugging Steps

**1. Check browser console for detailed errors:**
- Open Developer Tools (F12)
- Go to Console tab
- Look for error messages with 🔴 or ❌

**2. Check Network tab:**
- Open Developer Tools (F12)
- Go to Network tab
- Refresh the page
- Look for failed requests (red)
- Click on the failed request to see details

**3. Check the API URL being used:**
Look for this log in the console:
```
📡 Fetching patients from: http://localhost:8080/api/v1/patients?...
```

**4. Test with different URLs:**
Try these in your browser:
- `http://localhost:8080/api/v1/patients`
- `http://127.0.0.1:8080/api/v1/patients`
- `http://YOUR_IP:8080/api/v1/patients`

---

### 📋 Quick Checklist

- [ ] Backend server is running on port 8080
- [ ] `.env.local` file exists with correct `NEXT_PUBLIC_API_URL`
- [ ] Frontend server was restarted after creating `.env.local`
- [ ] Backend has CORS configuration allowing `http://localhost:3000`
- [ ] Can access API directly in browser
- [ ] No firewall blocking port 8080
- [ ] Backend is using the correct port (8080)

---

### 💡 Common Mistakes

1. ❌ Using wrong port number
2. ❌ Forgetting to restart frontend after `.env` changes
3. ❌ Backend server not running
4. ❌ CORS not configured in backend
5. ❌ Using `https://` instead of `http://` for local development
6. ❌ Missing `/api/v1` prefix in URL

---

### 🆘 Still Having Issues?

**1. Check what URL is being used:**
Look for the console log:
```
📡 Fetching patients from: [THIS IS THE URL]
```

**2. Test that exact URL in your browser**

**3. Verify backend logs:**
Check your Spring Boot console for incoming requests

**4. Try with curl:**
```bash
curl -v http://localhost:8080/api/v1/patients
```

**5. Check if port 8080 is already in use:**
```bash
# Windows
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :8080
```

---

### 📞 Need Help?

Provide these details when asking for help:
1. Browser console errors (full error message)
2. Network tab screenshot (failed request details)
3. Backend server logs (startup message)
4. `.env.local` content (hide sensitive info)
5. What URL you're trying to access
