# Branch & B2B List Page with Patient Registration

## Overview

Created a comprehensive Branch/B2B management page that includes:
1. **Branch/B2B List** - Manage branches, B2B centers, and franchises
2. **Patient Registration Form** - Complete patient registration with all required fields

---

## Features

### 1️⃣ **Branch/B2B Management**

#### **List View**
- ✅ Display all branches/B2Bs/franchises in a table
- ✅ Filter by type (All, Branch, B2B, Franchise)
- ✅ Real-time search by branch name, code, or contact person
- ✅ Status indicators (Active/Inactive)

#### **Add Branch Modal**
- ✅ Select branch type (Branch/B2B/Franchise)
- ✅ Auto-generate branch code (BR-XXX, B2B-XXX, FR-XXX)
- ✅ Capture contact information
- ✅ Set active/inactive status

#### **Sample Data**
- Delhi Main Branch (BR-001)
- Mumbai Diagnostic Center (B2B-001)
- Ahmedabad Franchise (FR-001)

---

### 2️⃣ **Patient Registration Form**

Comprehensive patient registration matching the design specification with all fields:

#### **Personal Information**
- ✅ **Title** - Mr./Mrs./Ms./Dr./Prof. dropdown
- ✅ **Patient Name** - Text input
- ✅ **Country Code** - International dialing codes (+91, +1, +44, etc.)
- ✅ **Mobile Number** - With country code selector
- ✅ **Age** - Numeric input with 📅 emoji
- ✅ **Month** - Dropdown (1-12)
- ✅ **Day** - Dropdown (1-31)
- ✅ **Gender** - Male/Female/Other dropdown

#### **Contact & Identity**
- ✅ **Email ID** - Email validation
- ✅ **Nationality** - Country selection dropdown
- ✅ **Document Type** - Aadhar/PAN/Passport/Voter ID/Driving License
- ✅ **Document Number** - Government ID number
- ✅ **Address** - Full address text field

#### **Medical Information**
- ✅ **Pre-existing Diseases** - Multi-select checkboxes:
  - Diabetes
  - Hypertension
  - Anaemia
  - Thyroid
  - Arthritis
  - Asthma

- ✅ **Drug Allergy** - Text area for allergy information

#### **Payment**
- ✅ **Registration Charges Checkbox** - "Patient Registration Charges (Valid for 60 months): – 0"
- ✅ **Payment Mode** - Cash/Credit/Card/UPI dropdown

---

## UI Components Used

### From `@/components/ui`:
- `InlineButton` - Action buttons with variants
- `InlineInput` - Text inputs with type support
- `InlineFormGroup` - Form field wrappers
- `InlineModal` - Modal dialogs
- `InlineTable` - Data tables

### Custom Components:
1. **AddBranchModal** - Add new branch/b2b
2. **PatientRegistrationModal** - Complete patient registration form

---

## File Structure

```
app/branches/
└── page.tsx          (Branch/B2B list + Patient registration)
```

---

## Design Highlights

### Responsive Layout
- Grid layouts for form fields
- Proper spacing and alignment
- Scrollable modal content area

### Visual Consistency
- Matching sidebar navigation
- Color-coded branch types
- Status badges
- SVG icons

### User Experience
- Filter buttons with visual feedback
- Real-time search
- Multi-checkbox disease selection
- Payment mode selector
- Clean modal design

---

## Navigation

### Access from Sidebar
The page is accessible from **"Diagnostic"** section:
```
Diagnostic
├── Invoices
├── Doctors
├── Collectors
├── Members
├── Estimations
├── Branch & B2B  ← THIS PAGE
├── Referrers
└── Investigations
```

### Route
✅ `/branches`

---

## Screenshots Reference

### Patient Registration Form Fields Layout:

**Row 1:** Title | Patient Name  
**Row 2:** Country | Mobile | Age | Month | Day | Gender  
**Row 3:** Email | Nationality  
**Row 4:** Document Type | Document Number  
**Row 5:** Address  
**Row 6:** Pre-existing Diseases (checkboxes)  
**Row 7:** Drug Allergy  
**Row 8:** Registration Charges + Payment Mode  

---

## Data Models

### Branch Interface
```typescript
interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  type: 'Branch' | 'B2B' | 'Franchise';
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
}
```

### Patient Registration Interface
```typescript
interface PatientRegistration {
  title: string;
  patientName: string;
  country: string;
  mobile: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  email: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  address: string;
  preExistingDiseases: string[];
  drugAllergy: string;
  paymentMode: string;
}
```

---

## Constants & Options

### Countries
- IND +91
- USA +1
- UK +44
- AUS +61
- UAE +971

### Nationalities
- IND-India
- USA-United States
- UK-United Kingdom
- UAE-UAE
- AUS-Australia

### Document Types
- Aadhar Card
- PAN Card
- Passport
- Voter ID
- Driving License

### Titles
- Mr., Mrs., Ms., Dr., Prof.

### Genders
- Male, Female, Other

---

## Usage Examples

### Opening Patient Registration
```tsx
// Click "Register New Patient" button
<Button variant="success" onClick={() => setPatientRegOpen(true)}>
  Register New Patient
</Button>
```

### Adding New Branch
```tsx
// Click "Add Branch" button
<Button variant="primary" onClick={() => setAddOpen(true)}>
  Add Branch
</Button>
```

### Filtering by Type
```tsx
// Click filter buttons
{(['All', 'Branch', 'B2B', 'Franchise'] as const).map(type => (
  <button onClick={() => setFilterType(type)}>{type}</button>
))}
```

---

## Future Enhancements

### Branch Management
- Edit branch details
- Delete/deactivate branches
- Export branch list to Excel
- View branch statistics
- Map view for locations

### Patient Registration
- Save patient to database
- Generate unique patient ID
- Link patient to invoices
- View patient history
- Print registration card
- SMS/Email confirmation
- Upload documents/photos

### Integration
- Backend API integration
- Real-time data sync
- Validation rules
- Duplicate detection
- Auto-save drafts

---

## Technical Notes

### Component Architecture
- Single page with multiple modals
- State management with React hooks
- Type-safe interfaces
- Reusable UI components
- Responsive grid layouts

### Performance
- Efficient filtering with useMemo
- Optimized re-renders
- Lazy loading ready
- Scroll optimization

### Accessibility
- Proper form labels
- Keyboard navigation
- Focus management
- ARIA attributes (can be enhanced)

---

## Testing Checklist

- ✅ Branch list displays correctly
- ✅ Filter by type works
- ✅ Search functionality filters results
- ✅ Add branch modal opens/closes
- ✅ Patient registration modal opens/closes
- ✅ All form fields render properly
- ✅ Checkboxes toggle correctly
- ✅ Dropdowns populate with options
- ✅ Submit buttons trigger actions
- ✅ No TypeScript compilation errors

---

**Date Created:** 2026-03-19  
**Status:** ✅ Complete  
**Page Route:** `/branches`  
**Components Enhanced:** InlineInput (already has type support)
