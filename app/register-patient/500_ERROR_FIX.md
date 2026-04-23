# Patient Creation 500 Error - Fix Applied

## Problem
When creating a new patient, the backend returns a **500 Internal Server Error** despite the request appearing correct.

## Root Causes Identified

### 1. **Address Type Format Mismatch** ❌
- **Frontend was sending**: `"PERMANENT"` (uppercase)
- **Postman working example shows**: `"Home"` (Title Case)
- **Backend expects**: `"Home"`, `"Office"`, etc. (Title Case format)

**Fix**: Updated `normalizeAddressType()` to convert to proper Title Case:
```typescript
const normalizeAddressType = (value?: string) => {
  const map: Record<string, string> = {
    'HOME': 'Home',
    'PERMANENT': 'Home',
    'COMMUNICATION': 'Home',
    'OFFICE': 'Office',
    // ... etc
  };
  return map[value] || 'Home';
};
```

### 2. **Duplicate Mobile Numbers** ⚠️
- **Issue**: Form sends `mobilePrimary` and `mobileAlternate` with same value
- **Example**: Both are `"8240677062"`
- **Backend may reject**: Duplicate phone numbers could violate validation rules

**Fix**: Only send `mobileAlternate` if it's different from `mobilePrimary`:
```typescript
mobileAlternate: (formData.mobileAlternate && formData.mobileAlternate !== formData.mobilePrimary) 
  ? formData.mobileAlternate.replace(/\D/g, '') 
  : undefined,
```

### 3. **Empty District Field** ⚠️
- **Issue**: `district` was being sent as empty string `""`
- **Fix**: Already implemented fallback to use `city` value:
```typescript
district: address.district.trim() || address.city.trim(),
```

## Console Output Expected After Fix

```
========== CREATE PATIENT REQUEST ==========
📝 Form Blood Group (raw): A_POSITIVE
📝 Blood Group (normalized): A_POS
📝 Allergies count: 0
📝 Sample allergy severity: undefined
=================================================

📦 Complete Patient DTO to be sent: {
  "firstName": "Arijit",
  "lastName": "saha",
  "dateOfBirth": "1995-10-13",
  "gender": "MALE",
  "mobilePrimary": "8240677062",
  "mobileAlternate": undefined,  // ← NOT sent if same as primary
  "email": "disha.kundu@mactix.com",
  "bloodGroup": "A_POS",
  "patientCategory": "GENERAL",
  "whatsappConsent": "YES",
  "reportLanguage": "ENGLISH",
  "clinicId": 1,
  "isActive": true,
  "addresses": [
    {
      "addressLine1": "123 Main Street",
      "addressLine2": "Rahul",
      "city": "Mumbai",
      "district": "Mumbai",  // ← Now populated with city value
      "state": "Maharashtra",
      "pinCode": "110001",
      "addressType": "Home",  // ← Changed from "PERMANENT" to "Home"
      "isPrimary": true
    }
  ]
}
📦 DTO string length: 542
📦 Photo file present: No photo
=================================================
```

## Files Modified

1. **`app/register-patient/AddPatient.tsx`**
   - Fixed `normalizeAddressType()` - Line 68-81
   - Fixed duplicate mobile number handling - Line 233-236
   - Added detailed console logging - Line 258-260

## Testing Steps

1. Open the Register Patient form
2. Fill in patient details
3. Use same number for both primary and alternate mobile
4. Submit the form
5. Check console - verify:
   - `mobileAlternate` is `undefined` (not sent)
   - `addressType` is `"Home"` (not `"PERMANENT"`)
   - `district` has a value (not empty)

## Remaining Issues

If 500 error persists after these fixes, the problem is likely:
- Backend validation error (check backend logs)
- Backend server issue (restart backend service)
- Missing required fields not obvious from Postman example
- Database constraint violation

## API Endpoint Reference

- **URL**: `POST http://192.168.1.3:9040/api/v1/patients`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `patientRequestDTO` (JSON string)
  - `photoUrl` (optional file)

## Backend DTO Expected Format

Based on working Postman example, the backend expects:
```json
{
  "abhaId": "ABHA123456789",
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "referringDoctorId": 1,
  "insuranceCompany": "Health Insurance Co",
  "insurancePolicyNo": "POL123456",
  "whatsappConsent": "YES",
  "reportLanguage": "HINDI",
  "photoUrl": "https://example.com/photo.jpg",
  "bloodGroup": "O_NEG",
  "mobilePrimary": "9876543210",
  "mobileAlternate": "9876543211",
  "email": "john.doe@example.com",
  "patientCategory": "TPA",
  "clinicId": 1,
  "isActive": true,
  "addresses": [
    {
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Mumbai",
      "district": "Mumbai Suburban",
      "state": "Maharashtra",
      "pinCode": "400001",
      "addressType": "Home",
      "isPrimary": true
    }
  ],
  "allergies": [
    {
      "allergyName": "Penicillin",
      "severity": "Severe",
      "notedBy": 1,
      "remarks": "Avoid all penicillin-based medications"
    }
  ]
}
```

---

**Date**: 2026-04-23  
**Status**: ✅ Fixes Applied  
**Next Step**: Test with real data and check if 500 error is resolved
