# 🔧 Missing Export Fix - searchPatientsByType

## 📋 Error Details

**Error Type:** Build Error  
**Error Message:**  
```
Export searchPatientsByType doesn't exist in target module
```

**Location:** `app/register-patient/AddFamilyLink.tsx:7:1`

**Full Error:**
```
./LMIS(think-lab)/LMS_frontend/app/register-patient/AddFamilyLink.tsx:7:1
Export searchPatientsByType doesn't exist in target module
   5 | import { RightDrawer } from '@/components/ui/right-drawer';
   6 | import { createFamilyLink } from '../Apis/Patients/family-link';
>  7 | import { searchPatientsByType } from '../Apis/Patients/Patient_Service_API';
     | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |
   9 |
  10 |
```

---

## 🔍 Root Cause

The `searchPatientsByType` and `searchPatientsByName` functions were **missing** from the [`Patient_Service_API.ts`](file://d:\mactix-office\LMIS(think-lab)\LMS_frontend\app\Apis\Patients\Patient_Service_API.ts) file. 

These functions were accidentally removed during the previous FormData Blob fix, causing a build error when [`AddFamilyLink.tsx`](file://d:\mactix-office\LMIS(think-lab)\LMS_frontend\app\register-patient\AddFamilyLink.tsx) tried to import them.

---

## 🛠️ What Was Fixed

### File Modified: `app/Apis/Patients/Patient_Service_API.ts`

#### Added Missing Functions (Lines 403-507)

**1. `searchPatientsByName` Function**
```typescript
/**
 * SEARCH PATIENTS BY NAME - Search patients by name with pagination
 * 
 * @param searchKey - Search term for patient name
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @returns List of patients matching the search criteria
 */
export async function searchPatientsByName(
  searchKey: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<Patient[]>> {
  // ... implementation
}
```

**2. `searchPatientsByType` Function**
```typescript
/**
 * SEARCH PATIENTS BY TYPE - Search patients with different search types (NAME, PHONE, EMAIL)
 * 
 * @param searchType - Type of search (NAME, PHONE, EMAIL)
 * @param value - Search value
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated list of patients matching the search criteria
 */
export async function searchPatientsByType(
  searchType: string,
  value: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Patient>>> {
  // ... implementation
}
```

---

## 📊 Function Details

### searchPatientsByName
- **Endpoint:** `GET /api/v1/patients/search/name`
- **Query Parameters:**
  - `searchKey`: Search term
  - `pageNo`: Page number (0-indexed)
  - `pageSize`: Items per page
- **Returns:** `ApiResponse<Patient[]>`

### searchPatientsByType
- **Endpoint:** `GET /api/v1/patients/search/by-type`
- **Query Parameters:**
  - `searchType`: Type of search (NAME, PHONE, EMAIL)
  - `value`: Search value
  - `pageNo`: Page number (0-indexed)
  - `pageSize`: Items per page
- **Returns:** `ApiResponse<PaginatedResponse<Patient>>`

---

## ✅ Verification

### 1. Build Should Now Succeed
Run the development server:
```bash
npm run dev
```

Expected output:
```
✓ Compiled successfully
```

### 2. Check Exports
Verify the functions are exported:
```bash
grep -n "export async function search" app/Apis/Patients/Patient_Service_API.ts
```

Expected output:
```
403:export async function searchPatientsByName
459:export async function searchPatientsByType
```

### 3. Test Family Link Feature
1. Navigate to Register Patient page
2. Click on "Add Family Link" button
3. Search for a patient by name, mobile, or email
4. Select a patient from the dropdown
5. Fill in family member details
6. Submit the form

---

## 🎯 Usage Example

### In AddFamilyLink.tsx
```typescript
import { searchPatientsByType } from '../Apis/Patients/Patient_Service_API';

// Search patients by name
const response = await searchPatientsByType('NAME', 'John', 0, 10);

// Access results
if (response.data && response.data.content) {
  const patients = response.data.content.map(p => ({
    id: p.id!,
    firstName: p.firstName,
    lastName: p.lastName,
    patientCode: p.patientCode,
    mobilePrimary: p.mobilePrimary || ''
  }));
  setPatientSearchResults(patients);
}
```

---

## 📝 Related Files

- [`Patient_Service_API.ts`](file://d:\mactix-office\LMIS(think-lab)\LMS_frontend\app\Apis\Patients\Patient_Service_API.ts) - API functions (MODIFIED)
- [`AddFamilyLink.tsx`](file://d:\mactix-office\LMIS(think-lab)\LMS_frontend\app\register-patient\AddFamilyLink.tsx) - Uses searchPatientsByType
- [`AddPatient.tsx`](file://d:\mactix-office\LMIS(think-lab)\LMS_frontend\app\register-patient\AddPatient.tsx) - Patient registration form

---

## 🔗 Related Documentation

- [FORMDATA_BLOB_FIX.md](./FORMDATA_BLOB_FIX.md) - Previous FormData fix
- [FIX_COMPLETE_SUMMARY.md](./FIX_COMPLETE_SUMMARY.md) - Data normalization fixes
- [BACKEND_500_ERROR_DEBUG.md](./BACKEND_500_ERROR_DEBUG.md) - Backend debugging guide

---

## ⚠️ Important Notes

1. **Function Signatures:** Both search functions return paginated responses with the structure:
   ```typescript
   {
     data: {
       content: Patient[],
       totalElements: number,
       totalPages: number,
       pageNo: number,
       pageSize: number,
       // ... other pagination fields
     },
     message: string,
     response: boolean,
     status: string,
     timestamp: string
   }
   ```

2. **Search Types:** The backend accepts these searchType values:
   - `NAME` - Search by patient name
   - `PHONE` - Search by mobile number
   - `EMAIL` - Search by email address

3. **Error Handling:** Both functions include:
   - Network error handling
   - API error response parsing
   - Detailed logging for debugging

---

**Last Updated:** 2026-04-23  
**Status:** ✅ Fixed  
**Tested:** ✅ Ready for testing
