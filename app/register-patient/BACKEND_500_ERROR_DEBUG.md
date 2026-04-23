# Backend 500 Error Debugging Guide

## Problem Summary
The frontend is sending a correctly formatted request to `POST /api/v1/patients`, but the backend returns a **500 Internal Server Error**.

## Frontend Data Being Sent

Based on console logs, the DTO is:
```json
{
  "firstName": "Arijit",
  "lastName": "saha",
  "dateOfBirth": "1995-10-13",
  "gender": "MALE",
  "mobilePrimary": "8240677062",
  "mobileAlternate": "8240677062",  // Same as primary
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
      "district": "",
      "state": "Maharashtra",
      "pinCode": "110001",
      "addressType": "PERMANENT",
      "isPrimary": true
    }
  ]
}
```

## Working Postman Example

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

## Key Differences Identified

### 1. **mobileAlternate is same as mobilePrimary**
- **Failing request**: Both are `"8240677062"`
- **Working Postman**: Different values (`"9876543210"` vs `"9876543211"`)
- **Possible issue**: Backend might reject duplicate mobile numbers

### 2. **district field is empty**
- **Failing request**: `"district": ""`
- **Working Postman**: `"district": "Mumbai Suburban"`
- **Possible issue**: Backend validation might require district

### 3. **Missing optional fields**
- **Failing request**: Missing `abhaId`, `referringDoctorId`, `insuranceCompany`, `insurancePolicyNo`, `middleName`
- **Working Postman**: Includes all these fields
- **Note**: These should be optional, but backend might have a bug

## Backend Debugging Steps

### Step 1: Check Backend Server Logs
The 500 error means there's an **exception on the backend**. Check:
```bash
# If using Spring Boot, look for stack traces like:
java.sql.SQLIntegrityConstraintViolationException
org.hibernate.exception.ConstraintViolationException
javax.validation.ConstraintViolationException
```

### Step 2: Check Database Constraints
The backend might be failing due to:
1. **Unique constraint on mobile number** - duplicate mobilePrimary/mobileAlternate
2. **NOT NULL constraint** on a field we're not sending
3. **Foreign key constraint** - invalid clinicId, referringDoctorId, etc.

### Step 3: Test with cURL
Run this exact command from your terminal to test:
```bash
curl -X POST http://192.168.1.3:9040/api/v1/patients \
  -F 'patientRequestDTO={
    \"firstName\":\"Test\",
    \"lastName\":\"Patient\",
    \"dateOfBirth\":\"1990-01-01\",
    \"gender\":\"MALE\",
    \"mobilePrimary\":\"9999999999\",
    \"mobileAlternate\":\"9999999998\",
    \"email\":\"test@example.com\",
    \"bloodGroup\":\"A_POS\",
    \"patientCategory\":\"GENERAL\",
    \"clinicId\":1,
    \"isActive\":true,
    \"addresses\":[{
      \"addressLine1\":\"123 Test St\",
      \"addressLine2\":\"Apt 1\",
      \"city\":\"Mumbai\",
      \"district\":\"Mumbai\",
      \"state\":\"Maharashtra\",
      \"pinCode\":\"400001\",
      \"addressType\":\"Home\",
      \"isPrimary\":true
    }]
  };type=application/json'
```

### Step 4: Check Backend Validation Code
Look at the `@PostMapping("/patients")` endpoint and check:
- What validation annotations are on the DTO?
- Are there any `@NotNull`, `@NotBlank`, `@Size` constraints?
- Is there a `@Valid` annotation causing validation failures?

## Possible Backend Fixes

### Fix 1: Allow Duplicate Mobile Numbers
If backend has validation like:
```java
if (patient.getMobilePrimary().equals(patient.getMobileAlternate())) {
    throw new ValidationException("Mobile numbers cannot be the same");
}
```
**Remove this validation** or make it a warning instead of an error.

### Fix 2: Make district Optional
If backend requires district:
```java
@NotNull  // ← Remove this
private String district;
```
Change to:
```java
private String district;  // Optional now
```

### Fix 3: Check Clinic ID Exists
Verify that `clinicId: 1` actually exists in the database:
```sql
SELECT * FROM clinics WHERE id = 1;
```
If it doesn't exist, either:
- Create the clinic
- Use a valid clinicId
- Make clinicId optional with a default

## Frontend Workarounds (Temporary)

If backend cannot be fixed immediately, try these:

### Workaround 1: Send Different Mobile Numbers
```typescript
mobilePrimary: "8240677062",
mobileAlternate: "8240677063",  // Different!
```

### Workaround 2: Ensure district is Never Empty
```typescript
district: address.district.trim() || address.city.trim() + " District",
```

### Workaround 3: Send All Optional Fields with Defaults
```typescript
abhaId: formData.abhaId.trim() || "NOT_PROVIDED",
referringDoctorId: formData.referringDoctorId || 1,  // Use default doctor
insuranceCompany: formData.insuranceCompany.trim() || "N/A",
insurancePolicyNo: formData.insurancePolicyNo.trim() || "N/A",
```

## Next Steps

1. **Check backend logs** - This is critical to see the actual error
2. **Test with cURL** - Verify if it's a backend issue or frontend issue
3. **Compare with Postman** - If Postman works, check what's different
4. **Add backend logging** - Log the exact exception being thrown
5. **Database check** - Verify all foreign keys and constraints exist

## Error Timestamp
`2026-04-23T16:11:23.1969434`

Use this timestamp to find the exact error in backend logs.
