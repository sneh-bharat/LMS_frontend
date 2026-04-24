# Complete Test Creation Implementation

## Overview
The test creation process has been updated to call multiple API endpoints sequentially, ensuring that all test-related data (basic details, versions, sample requirements, and parameters) are properly created through their respective dedicated endpoints.

## API Endpoints Used

### 1. Create Basic Test Details
**Endpoint:** `POST /api/v1/tests`

**Request Body:**
```json
{
  "testCode": "LFT001",
  "testName": "Liver Function Test",
  "departmentId": 2,
  "categoryId": 1,
  "loincCode": "24325-3",
  "tatHours": 12,
  "isActive": true
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "testCode": "LFT001",
    "testName": "Liver Function Test",
    "departmentId": 2,
    "categoryId": 1,
    "loincCode": "24325-3",
    "tatHours": 12,
    "isActive": true,
    "isCalculated": false,
    "createdAt": "2026-04-24T10:00:00.000Z",
    "updatedAt": "2026-04-24T10:00:00.000Z"
  },
  "message": "Test created successfully",
  "status": "success"
}
```

---

### 2. Create Test Version
**Endpoint:** `POST /api/v1/tests/{testId}/versions`

**Request Body:**
```json
{
  "versionNo": 1,
  "method": "Spectrophotometry",
  "unit": "IU/L",
  "price": 500.00,
  "cghsPrice": 400.00,
  "effectiveFrom": "2026-04-01",
  "effectiveTo": "2027-04-01"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "versionNo": 1,
    "method": "Spectrophotometry",
    "unit": "IU/L",
    "price": 500.00,
    "cghsPrice": 400.00,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": "2027-04-01"
  },
  "message": "Test version created successfully",
  "status": "success"
}
```

---

### 3. Create Sample Requirements
**Endpoint:** `POST /api/v1/tests/{testId}/sample-requirements`

**Request Body:**
```json
{
  "sampleType": "Blood_Serum",
  "volumeMl": 3.0,
  "containerColor": "Red",
  "storageCondition": "2-8°C"
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "sampleType": "Blood_Serum",
    "volumeMl": 3.0,
    "containerColor": "Red",
    "storageCondition": "2-8°C",
    "testId": 1,
    "createdAt": "2026-04-24T10:00:00.000Z",
    "updatedAt": "2026-04-24T10:00:00.000Z"
  },
  "message": "Sample requirement created successfully",
  "status": "success"
}
```

**Note:** This endpoint is called multiple times if there are multiple sample requirements.

---

### 4. Create Test Parameters
**Endpoint:** `POST /api/v1/tests/{testId}/parameters`

**Request Body:**
```json
{
  "parameterName": "ALT (SGPT)",
  "unit": "IU/L",
  "criticalLow": 5.0,
  "criticalHigh": 500.0,
  "resultType": "Numeric",
  "isCalculated": false,
  "referenceRanges": [
    {
      "gender": "Male",
      "ageMin": 18,
      "ageMax": 60,
      "minValue": 10.0,
      "maxValue": 40.0,
      "unit": "IU/L"
    },
    {
      "gender": "Female",
      "ageMin": 18,
      "ageMax": 60,
      "minValue": 7.0,
      "maxValue": 35.0,
      "unit": "IU/L"
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "id": 1,
    "parameterName": "ALT (SGPT)",
    "unit": "IU/L",
    "criticalLow": 5.0,
    "criticalHigh": 500.0,
    "resultType": "Numeric",
    "isCalculated": false,
    "referenceRanges": [
      {
        "id": 1,
        "gender": "Male",
        "ageMin": 18,
        "ageMax": 60,
        "minValue": 10.0,
        "maxValue": 40.0,
        "unit": "IU/L"
      },
      {
        "id": 2,
        "gender": "Female",
        "ageMin": 18,
        "ageMax": 60,
        "minValue": 7.0,
        "maxValue": 35.0,
        "unit": "IU/L"
      }
    ],
    "testId": 1,
    "createdAt": "2026-04-24T10:00:00.000Z",
    "updatedAt": "2026-04-24T10:00:00.000Z"
  },
  "message": "Test parameter created successfully",
  "status": "success"
}
```

**Note:** This endpoint is called multiple times if there are multiple parameters.

---

## Implementation Flow

### Sequential API Calls

The test creation follows a strict sequential order:

1. **Create Basic Test** → Returns `testId`
2. **Create Test Version** → Uses `testId` from step 1
3. **Create Sample Requirements** → Uses `testId` from step 1 (loop if multiple)
4. **Create Test Parameters** → Uses `testId` from step 1 (loop if multiple)

### Code Implementation

Located in: `app/lab/tests/NewTest.tsx`

```typescript
// Step 1: Create basic test details
const testData: CreateTestInput = {
  testCode: formData.testCode,
  testName: formData.testName,
  description: '',
  departmentId: Number(formData.departmentId),
  categoryId: Number(formData.categoryId),
  loincCode: formData.loincCode || undefined,
  tatHours: Number(formData.tatHours),
  isActive: formData.isActive,
};

const testResponse = await createTest(testData);
const testId = testResponse.data.id;

// Step 2: Create test version
const versionData = {
  versionNo: Number(formData.version.versionNo),
  method: formData.version.method,
  unit: formData.version.unit,
  price: Number(formData.version.price),
  cghsPrice: formData.version.cghsPrice ? Number(formData.version.cghsPrice) : undefined,
  effectiveFrom: formData.version.effectiveFrom,
  effectiveTo: formData.version.effectiveTo || undefined,
};

const versionResponse = await createTestVersion(testId, versionData);

// Step 3: Create sample requirements (loop if multiple)
if (formData.sampleRequirements.length > 0) {
  for (const req of formData.sampleRequirements) {
    const sampleData = {
      sampleType: req.sampleType,
      volumeMl: Number(req.volumeMl),
      containerColor: req.containerColor,
      storageCondition: req.storageCondition,
    };
    await createSampleRequirement(testId, sampleData);
  }
}

// Step 4: Create parameters (loop if multiple)
if (formData.parameters.length > 0) {
  for (const param of formData.parameters) {
    const parameterData = {
      parameterName: param.parameterName,
      unit: param.unit,
      criticalLow: param.criticalLow || 0,
      criticalHigh: param.criticalHigh || 0,
      resultType: param.resultType,
      isCalculated: param.isCalculated,
      referenceRanges: param.referenceRanges?.map(range => ({
        gender: range.gender,
        ageMin: Number(range.ageMin),
        ageMax: Number(range.ageMax),
        minValue: Number(range.minValue),
        maxValue: Number(range.maxValue),
        unit: range.unit,
      })) || [],
    };
    await createTestParameter(testId, parameterData);
  }
}
```

---

## New API Functions Added

Located in: `app/Apis/lab/TestApis.ts`

### 1. createTestVersion
```typescript
export async function createTestVersion(
  testId: number,
  input: {
    versionNo: number;
    method: string;
    unit: string;
    price: number;
    cghsPrice?: number;
    effectiveFrom: string;
    effectiveTo?: string;
  }
): Promise<ApiResponse<TestVersion>>
```

### 2. createTestParameter
```typescript
export async function createTestParameter(
  testId: number,
  input: CreateParameterInput
): Promise<ApiResponse<ParameterResponse>>
```

### 3. CreateParameterInput Interface
```typescript
export interface CreateParameterInput {
  parameterName: string;
  unit: string;
  criticalLow: number;
  criticalHigh: number;
  resultType: string;
  isCalculated: boolean;
  calculationFormula?: string;
  sortOrder?: number;
  referenceRanges?: Array<{
    gender: string;
    ageMin: number;
    ageMax: number;
    minValue: number;
    maxValue: number;
    unit: string;
  }>;
}
```

---

## Complete Example

### Input (Form Data)
```json
{
  "testCode": "LFT001",
  "testName": "Liver Function Test",
  "departmentId": 2,
  "categoryId": 1,
  "loincCode": "24325-3",
  "tatHours": 12,
  "isActive": true,
  "version": {
    "versionNo": 1,
    "method": "Spectrophotometry",
    "unit": "IU/L",
    "price": 500.00,
    "cghsPrice": 400.00,
    "effectiveFrom": "2026-04-01",
    "effectiveTo": "2027-04-01"
  },
  "parameters": [
    {
      "parameterName": "ALT (SGPT)",
      "unit": "IU/L",
      "criticalLow": 5.0,
      "criticalHigh": 500.0,
      "resultType": "Numeric",
      "isCalculated": false,
      "referenceRanges": [
        {
          "gender": "Male",
          "ageMin": 18,
          "ageMax": 60,
          "minValue": 10.0,
          "maxValue": 40.0,
          "unit": "IU/L"
        },
        {
          "gender": "Female",
          "ageMin": 18,
          "ageMax": 60,
          "minValue": 7.0,
          "maxValue": 35.0,
          "unit": "IU/L"
        }
      ]
    },
    {
      "parameterName": "AST (SGOT)",
      "unit": "IU/L",
      "criticalLow": 5.0,
      "criticalHigh": 500.0,
      "resultType": "Numeric",
      "isCalculated": false,
      "referenceRanges": [
        {
          "gender": "Male",
          "ageMin": 18,
          "ageMax": 60,
          "minValue": 10.0,
          "maxValue": 40.0,
          "unit": "IU/L"
        }
      ]
    }
  ],
  "sampleRequirements": [
    {
      "sampleType": "Blood_Serum",
      "volumeMl": 3.0,
      "containerColor": "Red",
      "storageCondition": "2-8°C"
    }
  ]
}
```

### API Call Sequence
1. `POST /api/v1/tests` → Creates test, returns `testId: 1`
2. `POST /api/v1/tests/1/versions` → Creates version
3. `POST /api/v1/tests/1/sample-requirements` → Creates sample requirement
4. `POST /api/v1/tests/1/parameters` → Creates ALT parameter
5. `POST /api/v1/tests/1/parameters` → Creates AST parameter

---

## Benefits

1. **Modular API Design**: Each resource has its own dedicated endpoint
2. **Better Error Handling**: Can identify exactly which step failed
3. **Flexible Updates**: Can update versions, parameters, or samples independently
4. **Data Integrity**: Sequential creation ensures proper relationships
5. **Clear Audit Trail**: Each creation is logged separately

---

## Error Handling

If any step fails, the error is caught and displayed to the user:

```typescript
try {
  // Step 1: Create test
  const testResponse = await createTest(testData);
  
  // Step 2: Create version
  await createTestVersion(testId, versionData);
  
  // Step 3: Create samples
  for (const req of formData.sampleRequirements) {
    await createSampleRequirement(testId, sampleData);
  }
  
  // Step 4: Create parameters
  for (const param of formData.parameters) {
    await createTestParameter(testId, parameterData);
  }
} catch (error) {
  console.error('❌ Failed to create test:', error);
  setErrors({
    submit: error instanceof Error ? error.message : 'Failed to create test'
  });
}
```

---

## Testing

To test the complete flow:

1. Navigate to **Lab → Tests**
2. Click **"Create New Test"**
3. Fill in all sections:
   - **General Information**: Test code, name, department, category
   - **Test Configuration**: Method, unit, price, effective dates
   - **Sample Requirements**: Add at least one sample type
   - **Parameters**: Add at least one parameter with reference ranges
4. Click **"Create Test"**
5. Check browser console for detailed API call logs
6. Verify test appears in the list with all data

---

## Console Logging

Extensive logging is added for debugging:

```
=== CREATING NEW TEST WITH ALL ENDPOINTS ===
Step 1: Creating basic test details...
Basic test data: {...}
✅ Test created successfully: {...}
🆔 New Test ID: 1

Step 2: Creating test version...
Version data: {...}
✅ Test version created: {...}

Step 3: Creating sample requirements...
Creating sample requirement: {...}
✅ Sample requirement created: {...}

Step 4: Creating test parameters...
Creating parameter: {...}
✅ Parameter created: {...}

🎉 Full test creation completed successfully!
```

---

## Future Enhancements

1. **Transaction Support**: Wrap all calls in a transaction for rollback on failure
2. **Batch API**: Create a batch endpoint to reduce network calls
3. **Progress Indicator**: Show user which step is in progress
4. **Retry Logic**: Auto-retry failed requests
5. **Optimistic UI**: Update UI before all calls complete
6. **Validation**: Server-side validation at each step

---

## Related Files

- **API Service**: `app/Apis/lab/TestApis.ts`
- **Form Component**: `app/lab/tests/NewTest.tsx`
- **Test List Page**: `app/lab/tests/page.tsx`
- **Test Details View**: `app/lab/tests/TestDetailsView.tsx`

---

**Created**: 2026-04-24  
**Last Updated**: 2026-04-24  
**Version**: 1.0
