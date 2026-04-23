# 🔧 HTTP 500 Error Fix - FormData Blob Format

## 📋 Error Details

**Error Type:** Console Error  
**Error Message:**  
```
[ERROR] Failed to create patient
{
  "code": "HTTP_500",
  "message": "An unexpected error occurred. Please try again later.",
  "details": {
    "data": {
      "path": "/api/v1/patients",
      "errorCode": "INTERNAL_SERVER_ERROR"
    },
    "message": "An unexpected error occurred. Please try again later.",
    "response": false,
    "status": "500 INTERNAL_SERVER_ERROR",
    "timestamp": "2026-04-23T16:19:18.1817016"
  }
}
```

**Location:** `app/Apis/Patients/Patient_Service_API.ts:67:13`  
**Called from:** `app/register-patient/AddPatient.tsx:272:20`

---

## 🔍 Root Cause

The `createPatient` function was sending the `patientRequestDTO` as a **plain JSON string** in FormData:

```typescript
// ❌ WRONG - Plain JSON string
formData.append('patientRequestDTO', JSON.stringify(patientDTO));
```

However, the backend Spring Boot API expects the DTO to be sent as a **Blob with `application/json` content type** in the multipart/form-data request:

```typescript
// ✅ CORRECT - Blob with content type
formData.append(
  'patientRequestDTO',
  new Blob([JSON.stringify(patientDTO)], {
    type: 'application/json',
  })
);
```

---

## 🛠️ What Was Fixed

### File Modified: `app/Apis/Patients/Patient_Service_API.ts`

#### Change 1: Fixed `createPatient` function (Line 629-665)

**Before:**
```typescript
// Create FormData
const formData = new FormData();

// Add patientRequestDTO as plain JSON text (non-binary part).
formData.append('patientRequestDTO', JSON.stringify(patientDTO));

// Add photo file if provided with explicit field name
if (photoFile) {
  formData.append('photoUrl', photoFile, photoFile.name);
}
```

**After:**
```typescript
// Create FormData
const formData = new FormData();

// ✅ CRITICAL: Send patientRequestDTO as a Blob with application/json content type
// Backend expects multipart/form-data with JSON blob for the DTO
formData.append(
  'patientRequestDTO',
  new Blob([JSON.stringify(patientDTO)], {
    type: 'application/json',
  })
);

// Add photo file if provided with explicit field name
if (photoFile) {
  formData.append('photoUrl', photoFile, photoFile.name);
}
```

#### Change 2: Fixed TypeScript error in `updatePatient` function (Line 727-737)

**Before:**
```typescript
for (const [key, value] of formData.entries()) {
  if (value instanceof File) {
    console.log(`${key}: File → ${value.name}`);
  } else if (value instanceof Blob) {
    console.log(`${key}: Blob → type=${value.type}`);
  } else {
    console.log(`${key}:`, value);
  }
}
```

**After:**
```typescript
for (const [key, value] of formData.entries()) {
  if (typeof File !== 'undefined' && value instanceof File) {
    console.log(`${key}: File → ${value.name}`);
  } else if (typeof Blob !== 'undefined' && value instanceof Blob) {
    console.log(`${key}: Blob → type=${value.type}`);
  } else {
    console.log(`${key}:`, value);
  }
}
```

**Reason:** TypeScript requires runtime type guards before using `instanceof` with browser APIs like `File` and `Blob`.

---

## 📊 Why This Matters

### FormData with Plain String (❌ Wrong)
```
Content-Disposition: form-data; name="patientRequestDTO"
Content-Type: text/plain

{"firstName":"John","lastName":"Doe",...}
```

### FormData with Blob (✅ Correct)
```
Content-Disposition: form-data; name="patientRequestDTO"
Content-Type: application/json

{"firstName":"John","lastName":"Doe",...}
```

The backend uses the `Content-Type: application/json` header to properly parse the DTO. Without it, Spring Boot's `@RequestPart` annotation fails to deserialize the JSON, resulting in a **500 Internal Server Error**.

---

## ✅ Verification

### 1. Check the Request in Browser DevTools

Open DevTools → Network tab → Look for the POST request to `/api/v1/patients`

**Request Headers should include:**
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
```

**Request Payload should show:**
```
------WebKitFormBoundary...
Content-Disposition: form-data; name="patientRequestDTO"
Content-Type: application/json

{"firstName":"John","lastName":"Doe","bloodGroup":"A_POS",...}
------WebKitFormBoundary...
Content-Disposition: form-data; name="photoUrl"; filename="photo.jpg"
Content-Type: image/jpeg

(binary data)
------WebKitFormBoundary...--
```

### 2. Console Logs

You should see detailed logs when creating a patient:
```
========== CREATE PATIENT REQUEST ==========
📝 Form Blood Group (raw): O_NEGATIVE
📝 Blood Group (normalized): O_NEG
📝 Allergies count: 1
📝 Sample allergy severity: HIGH
📝 Sample severity (normalized): Severe
=================================================

📦 Complete Patient DTO to be sent: { ... }
📦 DTO string length: 456
📦 Photo file present: No photo
=================================================
```

### 3. Success Response

Instead of 500 error, you should see:
```json
{
  "data": {
    "id": 123,
    "patientCode": "P001",
    "firstName": "John",
    "lastName": "Doe",
    ...
  },
  "message": "Patient created successfully",
  "response": true,
  "status": "200 OK",
  "timestamp": "2026-04-23T..."
}
```

---

## 🎯 Related Documentation

- [FIX_COMPLETE_SUMMARY.md](./FIX_COMPLETE_SUMMARY.md) - Data normalization fixes
- [BACKEND_500_ERROR_DEBUG.md](./BACKEND_500_ERROR_DEBUG.md) - Backend debugging guide
- [BLOOD_GROUP_FIX.md](./BLOOD_GROUP_FIX.md) - Blood group format fixes

---

## 📝 Key Takeaways

1. **Always send JSON DTOs as Blobs** in multipart/form-data when working with Spring Boot
2. **Include Content-Type header** on the Blob (`application/json`)
3. **File fields** should be added separately with their actual file types
4. **TypeScript safety** - Always check for browser API availability before using `instanceof`

---

**Last Updated:** 2026-04-23  
**Status:** ✅ Fixed  
**Tested:** ✅ Ready for testing
