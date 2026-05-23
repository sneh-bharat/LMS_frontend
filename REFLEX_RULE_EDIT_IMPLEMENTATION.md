# Reflex Rules Edit Implementation Guide

## Overview
This document describes the implementation of the **Update Reflex Rule** functionality using React Query and custom hooks with proper token authentication.

## 📁 Files Created/Modified

### 1. **API Service** - `app/Apis/lab/ReflexRules.ts`
**Updated** the `updateReflexRule` function to properly handle the PUT endpoint.

#### Key Features:
- **Endpoint**: `PUT /api/v1/reflex-rules/{ruleId}`
- **Authentication**: Token automatically attached via axios interceptor
- **Request Body**: All updatable reflex rule fields
- **Response Type**: `ApiResponse<ReflexRule>`

```typescript
export async function updateReflexRule(
  ruleId: number,
  input: UpdateReflexRuleInput
): Promise<ApiResponse<ReflexRule>>
```

### 2. **Custom Hooks** - `app/Apis/lab/useReflexRules.ts`
**Created** comprehensive React Query hooks for all reflex rule operations.

#### Available Hooks:

| Hook | Purpose | Mutation/Query |
|------|---------|----------------|
| `useReflexRules` | Fetch paginated reflex rules list | Query |
| `useReflexRule` | Fetch single reflex rule by ID | Query |
| `useCreateReflexRule` | Create new reflex rule | Mutation |
| `useUpdateReflexRule` | Update existing reflex rule | Mutation |
| `useDeleteReflexRule` | Delete a reflex rule | Mutation |
| `useToggleReflexRuleStatus` | Activate/deactivate rule | Mutation |

#### Query Keys Structure:
```typescript
reflexRuleKeys = {
  all: ['reflexRules'],
  lists: () => [...'reflexRules', 'list'],
  list: (params) => [...'reflexRules', 'list', params],
  details: () => [...'reflexRules', 'detail'],
  detail: (id) => [...'reflexRules', 'detail', id],
}
```

### 3. **Edit Component** - `app/lab/reflex-rule/edit-reflex-rule.tsx`
**Created** dedicated edit component with full form functionality.

#### Props Interface:
```typescript
interface EditReflexRuleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData: ReflexRule | null;
}
```

#### Features:
- ✅ Pre-fills form with existing rule data
- ✅ Search and select tests
- ✅ Search and select reflex tests
- ✅ Search and select branches
- ✅ Parameter selection (optional)
- ✅ Condition type selection (ABOVE, BELOW, BETWEEN, etc.)
- ✅ Threshold validation for BETWEEN and CRITICAL conditions
- ✅ Auto-order and notify physician toggles
- ✅ Gender and age range filters
- ✅ Clinical rationale and technician notes
- ✅ Active/inactive status toggle
- ✅ Real-time form validation
- ✅ Loading states during submission
- ✅ Toast notifications for success/error

### 4. **Page Integration** - `app/lab/reflex-rule/page.tsx`
**Updated** main page to use separate edit modal and React Query hooks.

#### Changes:
- Separated `isModalOpen` (create) and `isEditModalOpen` (edit)
- Replaced direct API calls with custom hooks
- Simplified mutation handling with onSuccess callbacks
- Removed manual loading states for delete/toggle operations

## 🔐 Authentication

### Token Handling
The authentication token is automatically attached to all API requests via the axios interceptor in `app/Apis/lab/axios.ts`:

```typescript
departmentClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    }
);
```

**No manual token handling required** - it's automatic!

## 📡 API Integration

### Update Endpoint Details

**Endpoint**: `PUT /api/v1/reflex-rules/{ruleId}`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer {token_from_local_storage}
```

**Request Body Example**:
```json
{
  "testId": 123,
  "reflexTestId": 456,
  "conditionType": "BETWEEN",
  "thresholdLow": 50.0,
  "thresholdHigh": 200.0,
  "logicOperator": "AND",
  "priority": 10,
  "autoOrder": true,
  "notifyPhysician": false,
  "gender": null,
  "ageMin": 18,
  "ageMax": 65,
  "parameterId": 789,
  "branchId": 1,
  "clinicalRationale": "Critical values require immediate reflex testing",
  "technicianNotes": "Review results before auto-ordering",
  "isActive": true
}
```

**Response Structure**:
```json
{
  "data": {
    "id": 1,
    "testId": 123,
    "testCode": "TEST001",
    "testName": "Glucose",
    "reflexTestId": 456,
    "reflexTestCode": "REFLEX001",
    "reflexTestName": "HbA1c",
    "conditionType": "BETWEEN",
    "thresholdLow": 50.0,
    "thresholdHigh": 200.0,
    "logicOperator": "AND",
    "priority": 10,
    "autoOrder": true,
    "notifyPhysician": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-15T10:30:00"
  },
  "message": "Reflex rule updated successfully",
  "response": true,
  "status": "SUCCESS",
  "timestamp": "2024-01-15T10:30:00"
}
```

## 🎯 Usage Examples

### In a Component:
```typescript
import { useUpdateReflexRule } from '@/app/Apis/lab/useReflexRules';
import type { UpdateReflexRuleInput } from '@/app/Apis/lab/ReflexRules';

function MyComponent() {
  const updateMutation = useUpdateReflexRule();

  const handleUpdate = () => {
    const updateData: UpdateReflexRuleInput = {
      testId: 123,
      reflexTestId: 456,
      conditionType: 'ABOVE',
      thresholdValue: 100,
      priority: 15,
      isActive: true,
    };

    updateMutation.mutate(
      { ruleId: 1, data: updateData },
      {
        onSuccess: (response) => {
          console.log('Updated successfully', response.data);
        },
        onError: (error) => {
          console.error('Update failed', error);
        }
      }
    );
  };

  return (
    <button 
      onClick={handleUpdate}
      disabled={updateMutation.isPending}
    >
      {updateMutation.isPending ? 'Updating...' : 'Update Rule'}
    </button>
  );
}
```

### With React Query Invalidations:
The hooks automatically invalidate relevant queries after mutations:

```typescript
// After successful update, these are automatically refetched:
// - All reflex rules lists (with different pagination/filters)
// - The specific reflex rule detail
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User clicks Edit                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Page sets editingRule state                    │
│              Opens isEditModalOpen                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         EditReflexRule component mounts                     │
│         Pre-fills form with editData                        │
│         Fetches tests, branches, parameters                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         User modifies form and clicks Submit                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Validates form data                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│   useUpdateReflexRule.mutate() called                       │
│   { ruleId: 1, data: UpdateReflexRuleInput }                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│   API Call: PUT /api/v1/reflex-rules/1                      │
│   Headers: Authorization: Bearer {token}                    │
│   Body: { ...UpdateReflexRuleInput }                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         Success Response                                    │
│         ├─ Toast notification shown                         │
│         ├─ Query cache invalidated                          │
│         ├─ Lists and detail refetched                       │
│         └─ onSuccess callback → close modal                 │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Key Benefits

### 1. **Separation of Concerns**
- Create and Edit are separate components
- Each has a specific responsibility
- Easier to maintain and test

### 2. **React Query Advantages**
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Optimistic updates support
- ✅ Query invalidation
- ✅ Loading/error states
- ✅ Toast notifications built-in

### 3. **Custom Hooks Benefits**
- ✅ Reusable across components
- ✅ Consistent API usage
- ✅ Centralized error handling
- ✅ Type-safe mutations
- ✅ Automatic query management

### 4. **Authentication**
- ✅ Token handled by interceptor
- ✅ No manual token passing
- ✅ Automatic on all requests
- ✅ 401 handling (redirect to login)

## 🧪 Testing

### Manual Testing Steps:
1. Navigate to `/lab/reflex-rule`
2. Click on any rule's "Edit" action
3. Verify form is pre-filled with rule data
4. Modify fields and click "Update Rule"
5. Check:
   - Loading state shows "Saving..."
   - Success toast appears
   - Modal closes
   - Table refreshes with updated data
6. Test validation:
   - Clear required fields
   - Try invalid values
   - Check error messages

### API Testing:
```bash
# Test PUT endpoint directly
curl -X PUT /api/v1/reflex-rules/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": 123,
    "reflexTestId": 456,
    "conditionType": "BETWEEN",
    "thresholdLow": 50,
    "thresholdHigh": 200,
    "priority": 10,
    "isActive": true
  }'
```

## 📊 State Management

### Local State (Component)
- Form data
- Validation errors
- Search terms
- Dropdown options (tests, branches, parameters)

### React Query State (Global)
- Reflex rules list cache
- Individual reflex rule cache
- Mutation states (pending, success, error)

### Why Not React Query for Everything?
Form state is ephemeral and UI-specific. React Query is best for:
- Server state (API data)
- Shared data across components
- Data that needs caching

Form state stays local because:
- It's temporary
- Component-specific
- Needs immediate updates
- Validation is synchronous

## 🐛 Troubleshooting

### Issue: Token not attaching to request
**Solution**: Check localStorage for token:
```javascript
console.log('Token:', localStorage.getItem('token'));
```

### Issue: Query not refetching after update
**Solution**: Ensure query keys match:
```typescript
// In mutation:
queryClient.invalidateQueries({ queryKey: reflexRuleKeys.lists() });
```

### Issue: Form not pre-filling
**Solution**: Verify editData is passed correctly:
```typescript
console.log('Edit Data:', editData);
```

### Issue: Validation errors
**Solution**: Check console for validation logs and ensure all required fields are provided.

## 📝 Next Steps

1. ✅ Update API function - DONE
2. ✅ Create custom hooks - DONE
3. ✅ Implement edit component - DONE
4. ✅ Integrate with page - DONE
5. 🔄 Add unit tests (optional)
6. 🔄 Add loading skeletons (optional)
7. 🔄 Add error boundary (optional)

## 🎓 Learning Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [React Hooks Best Practices](https://react.dev/reference/react)
- [TypeScript with React](https://react.dev/learn/typescript)

---

**Implementation Date**: 2026-05-11  
**Version**: 1.0  
**Status**: ✅ Complete and Working
