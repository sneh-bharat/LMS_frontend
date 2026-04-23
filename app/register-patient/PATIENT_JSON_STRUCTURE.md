# 📋 Patient Creation - Complete JSON Payload Structure

## ✅ Expected Backend Payload

When creating a patient via `POST /api/v1/patients`, the backend expects the following JSON structure in the `patientRequestDTO` FormData field:

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

## 🔧 FormData Structure

The actual HTTP request uses `multipart/form-data` with the following structure:

```
------WebKitFormBoundary...
Content-Disposition: form-data; name="patientRequestDTO"
Content-Type: application/json

{JSON_PAYLOAD_ABOVE}
------WebKitFormBoundary...
Content-Disposition: form-data; name="photoUrl"; filename="patient-photo.jpg"
Content-Type: image/jpeg

(binary image data)
------WebKitFormBoundary...--
```

**Important:** The `patientRequestDTO` must be sent as a **Blob with `application/json` content type**, not as a plain string.

---

## 📊 Field Specifications

### Required Fields

| Field | Type | Format | Example | Notes |
|-------|------|--------|---------|-------|
| `firstName` | string | Text (1-100 chars) | `"John"` | Patient's first name |
| `lastName` | string | Text (1-100 chars) | `"Doe"` | Patient's last name |
| `dateOfBirth` | string | YYYY-MM-DD | `"1990-05-15"` | Must be in the past |
| `gender` | string | Enum | `"MALE"` | MALE, FEMALE, OTHER, TRANSGENDER |
| `bloodGroup` | string | Enum (short) | `"O_NEG"` | See normalization below |
| `mobilePrimary` | string | 10 digits | `"9876543210"` | Indian format, starts with 6-9 |
| `clinicId` | number | Integer | `1` | Must exist in database |
| `isActive` | boolean | true/false | `true` | Patient status |
| `patientCategory` | string | Enum | `"GENERAL"` | See categories below |

### Optional Fields

| Field | Type | Format | Example | Notes |
|-------|------|--------|---------|-------|
| `middleName` | string | Text | `"Michael"` | Can be omitted |
| `abhaId` | string | Alphanumeric | `"ABHA123456789"` | Ayushman Bharat ID |
| `mobileAlternate` | string | 10 digits | `"9876543211"` | Must differ from primary |
| `email` | string | Email format | `"john@example.com"` | Lowercase recommended |
| `referringDoctorId` | number | Integer | `1` | Doctor reference |
| `insuranceCompany` | string | Text | `"Health Insurance Co"` | Insurance provider |
| `insurancePolicyNo` | string | Text | `"POL123456"` | Policy number |
| `whatsappConsent` | string | Enum | `"YES"` | YES or NO |
| `reportLanguage` | string | Enum | `"ENGLISH"` | Report language |
| `photoUrl` | string | URL or File | `"https://..."` | For file upload, use FormData |
| `addresses` | array | Address[] | `[{...}]` | See address structure |
| `allergies` | array | Allergy[] | `[{...}]` | See allergy structure |

---

## 🔄 Data Normalization

### Blood Group Normalization

The UI displays blood groups in long format, but the backend expects short format:

| UI Display | Form Value | Backend Format |
|------------|-----------|----------------|
| A+ | `A_POSITIVE` | `A_POS` ✅ |
| A- | `A_NEGATIVE` | `A_NEG` ✅ |
| B+ | `B_POSITIVE` | `B_POS` ✅ |
| B- | `B_NEGATIVE` | `B_NEG` ✅ |
| AB+ | `AB_POSITIVE` | `AB_POS` ✅ |
| AB- | `AB_NEGATIVE` | `AB_NEG` ✅ |
| O+ | `O_POSITIVE` | `O_POS` ✅ |
| O- | `O_NEGATIVE` | `O_NEG` ✅ |

**Code:**
```typescript
export function normalizeBloodGroup(value?: string): string {
  const map: Record<string, string> = {
    'A_POSITIVE': 'A_POS',
    'A_NEGATIVE': 'A_NEG',
    'B_POSITIVE': 'B_POS',
    'B_NEGATIVE': 'B_NEG',
    'AB_POSITIVE': 'AB_POS',
    'AB_NEGATIVE': 'AB_NEG',
    'O_POSITIVE': 'O_POS',
    'O_NEGATIVE': 'O_NEG',
  };
  return map[value] || value;
}
```

### Allergy Severity Normalization

| UI Display | Form Value | Backend Format |
|------------|-----------|----------------|
| Low | `LOW` | `Mild` ✅ |
| Medium | `MEDIUM` | `Moderate` ✅ |
| High | `HIGH` | `Severe` ✅ |

**Code:**
```typescript
export function normalizeSeverity(value?: string): 'Mild' | 'Moderate' | 'Severe' {
  const map: Record<string, 'Mild' | 'Moderate' | 'Severe'> = {
    'LOW': 'Mild',
    'MEDIUM': 'Moderate',
    'HIGH': 'Severe',
  };
  return map[value] || 'Mild';
}
```

### Address Type Normalization

| UI Display | Form Value | Backend Format |
|------------|-----------|----------------|
| Home | `HOME` | `Home` ✅ |
| Office | `OFFICE` | `Office` ✅ |
| Permanent | `PERMANENT` | `Home` ✅ |
| Communication | `COMMUNICATION` | `Home` ✅ |

**Code:**
```typescript
export function normalizeAddressType(value?: string): string {
  const map: Record<string, string> = {
    'HOME': 'Home',
    'PERMANENT': 'Home',
    'COMMUNICATION': 'Home',
    'OFFICE': 'Office',
  };
  return map[value] || 'Home';
}
```

---

## 📝 Address Structure

```json
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
```

### Address Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `addressLine1` | string | ✅ Yes | Primary address line |
| `addressLine2` | string | ❌ No | Apartment, floor, etc. |
| `city` | string | ✅ Yes | City name |
| `district` | string | ✅ Yes | District (auto-filled from city if empty) |
| `state` | string | ✅ Yes | State name |
| `pinCode` | string | ✅ Yes | 6-digit postal code |
| `addressType` | string | ✅ Yes | Home, Office, etc. |
| `isPrimary` | boolean | ✅ Yes | Only one address can be primary |

---

## ⚠️ Allergy Structure

```json
{
  "allergyName": "Penicillin",
  "severity": "Severe",
  "notedBy": 1,
  "remarks": "Avoid all penicillin-based medications"
}
```

### Allergy Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `allergyName` | string | ✅ Yes | Name of the allergy |
| `severity` | string | ✅ Yes | Mild, Moderate, Severe |
| `notedBy` | number | ✅ Yes | User/Doctor ID (default: 1) |
| `remarks` | string | ❌ No | Additional notes |

**Important:** 
- The `notedBy` field must be a **valid user/doctor ID** (integer)
- Default value is `1` (clinic admin) if not specified
- Invalid or missing `notedBy` will cause the allergy to be **skipped**

---

## 🎯 Enum Values

### Gender
- `MALE`
- `FEMALE`
- `OTHER`
- `TRANSGENDER`

### Patient Category
- `GENERAL`
- `REGULAR`
- `VIP`
- `CORPORATE`
- `TPA`
- `CGHS`
- `ECHS`
- `ESI`
- `BPL`
- `STAFF`

### Blood Group (Backend Format)
- `A_POS`
- `A_NEG`
- `B_POS`
- `B_NEG`
- `AB_POS`
- `AB_NEG`
- `O_POS`
- `O_NEG`

### WhatsApp Consent
- `YES`
- `NO`

### Allergy Severity (Backend Format)
- `Mild`
- `Moderate`
- `Severe`

---

## 🔍 Validation Rules

### Frontend Validation

```typescript
// First Name
- Required
- Max 100 characters

// Last Name
- Required
- Max 100 characters

// Date of Birth
- Required
- Must be in the past

// Gender
- Required

// Blood Group
- Required

// Mobile Primary
- Required
- Must be 10 digits
- Must start with 6-9 (Indian format)

// Mobile Alternate
- Optional
- If provided, must be 10 digits
- If same as primary, will be omitted

// Email
- Optional
- If provided, must be valid format
- Converted to lowercase

// Clinic ID
- Required
- Must be a valid integer

// isActive
- Required
- Must be boolean

// Patient Category
- Required
```

### Backend Validation (Expected)

The backend may have additional validations:
- Unique mobile number per patient
- Valid clinicId (must exist in database)
- Valid referringDoctorId (if provided)
- Address completeness validation
- Allergy validation (notedBy must be valid user ID)

---

## 📤 Frontend Implementation

### AddPatient.tsx - handleSubmit

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    // Build patient DTO with normalized values
    const patientDTO: CreatePatientInput = {
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim() || undefined,
      lastName: formData.lastName.trim(),
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER',
      bloodGroup: normalizeBloodGroup(formData.bloodGroup) as CreatePatientInput['bloodGroup'],
      mobilePrimary: formData.mobilePrimary.replace(/\D/g, ''),
      mobileAlternate: (formData.mobileAlternate && formData.mobileAlternate !== formData.mobilePrimary) 
        ? formData.mobileAlternate.replace(/\D/g, '') 
        : undefined,
      email: formData.email.toLowerCase().trim() || undefined,
      patientCategory: formData.patientCategory as CreatePatientInput['patientCategory'],
      insuranceCompany: formData.insuranceCompany.trim() || undefined,
      insurancePolicyNo: formData.insurancePolicyNo.trim() || undefined,
      whatsappConsent: formData.whatsappConsent,
      reportLanguage: formData.reportLanguage,
      clinicId: formData.clinicId,
      isActive: formData.isActive,
      referringDoctorId: formData.referringDoctorId,
      abhaId: formData.abhaId.trim() || undefined,
      addresses: formData.addresses.length > 0 ? formData.addresses.map(address => ({
        ...address,
        addressLine1: address.addressLine1.trim(),
        addressLine2: address.addressLine2.trim(),
        city: address.city.trim(),
        district: address.district.trim() || address.city.trim(),
        state: address.state.trim(),
        pinCode: address.pinCode.trim(),
        addressType: normalizeAddressType(address.addressType),
      })) : undefined,
      allergies: formData.allergies.length > 0
        ? formData.allergies.reduce<NonNullable<CreatePatientInput['allergies']>>((acc, allergy) => {
            const notedByValue = allergy.notedBy?.toString().trim();
            const notedByNumber = notedByValue ? Number(notedByValue) : NaN;

            if (!Number.isFinite(notedByNumber)) {
              return acc; // Skip invalid allergies
            }

            acc.push({
              id: allergy.id,
              allergyName: allergy.allergyName.trim(),
              severity: normalizeSeverity(allergy.severity) as PatientAllergy['severity'],
              notedBy: notedByNumber,
              remarks: allergy.remarks.trim(),
            });
            return acc;
          }, [])
        : undefined,
    };

    // Send to API with optional photo file
    const response = await createPatient({
      ...patientDTO,
      photoFile: formData.photoFile,
    } as any);

    if (response && (response.code === 200 || response.code === 201 || response.response === true)) {
      onSuccess?.(response.message || 'Patient registered successfully!');
      onClose();
    } else {
      throw new Error(response?.message || 'Operation failed');
    }
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    setErrors({ submit: errorMessage });
    console.error('Submission error:', err);
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🚀 API Call Implementation

### Patient_Service_API.ts - createPatient

```typescript
export async function createPatient(
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  try {
    const validationErrors = validatePatientData(input as CreatePatientInput);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const url = `${API_BASE_URL}/patients`;

    // Separate photo file from patient data
    const { photoFile, ...patientDTO } = input;

    // Create FormData for multipart request
    const formData = new FormData();

    // ✅ CRITICAL: Send patient DTO as JSON blob
    const jsonBlob = new Blob([JSON.stringify(patientDTO)], {
      type: 'application/json',
    });
    formData.append('patientRequestDTO', jsonBlob);

    // Add photo file if provided
    if (photoFile) {
      formData.append('photoUrl', photoFile, photoFile.name);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type header - browser will set it with boundary
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      throw new Error(`Network Error: Unable to connect to API`);
    }
    throw error;
  }
}
```

---

## ✅ Success Response

```json
{
  "data": {
    "id": 123,
    "patientCode": "P001",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "gender": "MALE",
    "bloodGroup": "O_NEG",
    "mobilePrimary": "9876543210",
    "email": "john.doe@example.com",
    "patientCategory": "TPA",
    "clinicId": 1,
    "isActive": true,
    "createdAt": "2026-04-23T16:30:00.000+00:00",
    "updatedAt": "2026-04-23T16:30:00.000+00:00"
  },
  "message": "Patient created successfully",
  "response": true,
  "status": "200 OK",
  "timestamp": "2026-04-23T16:30:00.000+00:00"
}
```

---

## ❌ Error Responses

### Validation Error (400 Bad Request)
```json
{
  "data": {
    "path": "/api/v1/patients",
    "errorCode": "VALIDATION_ERROR"
  },
  "message": "Validation failed: firstName is required, mobilePrimary is invalid",
  "response": false,
  "status": "400 BAD_REQUEST",
  "timestamp": "2026-04-23T16:30:00.000+00:00"
}
```

### Internal Server Error (500)
```json
{
  "data": {
    "path": "/api/v1/patients",
    "errorCode": "INTERNAL_SERVER_ERROR"
  },
  "message": "An unexpected error occurred. Please try again later.",
  "response": false,
  "status": "500 INTERNAL_SERVER_ERROR",
  "timestamp": "2026-04-23T16:30:00.000+00:00"
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: 500 Internal Server Error
**Cause:** `patientRequestDTO` sent as plain JSON string instead of Blob  
**Solution:** Use `new Blob([JSON.stringify(patientDTO)], { type: 'application/json' })`

### Issue 2: Allergy Not Saved
**Cause:** `notedBy` field is missing or not a valid number  
**Solution:** Default `notedBy` to `1` or a valid user/doctor ID

### Issue 3: Blood Group Rejected
**Cause:** Sending `A_POSITIVE` instead of `A_POS`  
**Solution:** Use `normalizeBloodGroup()` function

### Issue 4: Allergy Severity Rejected
**Cause:** Sending `LOW` instead of `Mild`  
**Solution:** Use `normalizeSeverity()` function

### Issue 5: Address Type Rejected
**Cause:** Sending `HOME` instead of `Home`  
**Solution:** Use `normalizeAddressType()` function

---

## 📚 Related Documentation

- [FORMDATA_BLOB_FIX.md](./FORMDATA_BLOB_FIX.md) - FormData Blob implementation
- [FIX_COMPLETE_SUMMARY.md](./FIX_COMPLETE_SUMMARY.md) - Data normalization fixes
- [BACKEND_500_ERROR_DEBUG.md](./BACKEND_500_ERROR_DEBUG.md) - Backend debugging guide
- [MISSING_EXPORT_FIX.md](./MISSING_EXPORT_FIX.md) - Search functions restoration

---

**Last Updated:** 2026-04-23  
**Status:** ✅ Complete  
**Backend Compatible:** ✅ Yes
