# Test Packages Module

## Overview
The Test Packages module allows you to create and manage bundled diagnostic test packages. This is based on the backend `TestPackage` entity which has a many-to-many relationship with tests.

## Features

### 1. **Package Management**
- **Create Packages**: Add new test packages with unique codes, names, descriptions, and pricing
- **Edit Packages**: Modify existing package details
- **Activate/Deactivate**: Toggle package availability status
- **View All Packages**: See all packages in a structured table view

### 2. **Test Association**
- **Add Tests**: Include multiple tests in a single package
- **Manage Tests**: View and remove tests from packages
- **Test Categories**: Filter packages by test categories (Hematology, Biochemistry, etc.)

### 3. **Search & Filter**
- **Search**: Find packages by code or name
- **Category Filter**: Filter by test categories
- **Status Filter**: View active/inactive packages

## Data Model

### TestPackage Entity
```typescript
interface TestPackage {
  id: number;
  packageCode: string;        // Unique identifier (e.g., PKG001)
  packageName: string;        // Display name
  description: string;        // Package description
  price: number;              // Package price in INR
  isActive: boolean;          // Active status
  tests: Test[];              // Array of included tests
  createdAt: string;          // Creation timestamp
}
```

### Backend Model Reference
```java
@Entity
@Table(name = "test_packages")
public class TestPackage extends BaseEntity {
    @Column(name = "package_code", unique = true, nullable = false)
    private String packageCode;
    
    @Column(name = "package_name", nullable = false)
    private String packageName;
    
    @Column(name = "description")
    private String description;
    
    private Double price;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @ManyToMany
    @JoinTable(
        name = "package_tests",
        joinColumns = @JoinColumn(name = "package_id"),
        inverseJoinColumns = @JoinColumn(name = "test_id")
    )
    private List<Test> tests;
}
```

## Page Structure

### Main Page: `/investigation/test-packages`
Located at: `app/investigation/test-packages/page.tsx`

#### Components:
1. **Header Section**
   - Page title and description
   - Action buttons (Package View, Create Package)

2. **Control Bar**
   - Search input (searches by code and name)
   - Category filter dropdown
   - Settings button

3. **Packages Table**
   - Package Code
   - Package Details (icon, name, description)
   - Tests count and preview
   - Price
   - Status badge
   - Actions menu

4. **Package Modal**
   - Package Information Form
     - Package Code (auto-generated/disabled on edit)
     - Package Name
     - Description
     - Price
     - Active status checkbox
   - Tests Management Section
     - List of included tests
     - Add/Remove tests functionality

## Usage

### Creating a New Package

1. Click the **"Create Package"** button
2. Fill in the package details:
   - Package Code (e.g., PKG005)
   - Package Name (e.g., "Senior Citizen Health Checkup")
   - Description
   - Price
3. Add tests to the package by clicking **"Add Tests"**
4. Toggle **"Active Package"** if needed
5. Click **"Save"**

### Editing an Existing Package

1. Click the **More Horizontal** icon (⋮) on any package row
2. Select **"Edit Package"**
3. Modify the details
4. Add or remove tests as needed
5. Click **"Save"**

### Managing Package Tests

1. Click the **More Horizontal** icon (⋮) on any package row
2. Select **"Manage Tests"**
3. Add new tests or remove existing ones
4. Save changes

## API Integration Points

### Required API Endpoints

```typescript
// GET /api/test-packages - Fetch all packages
GET /api/test-packages?page=0&size=10

// GET /api/test-packages/:id - Fetch single package
GET /api/test-packages/1

// POST /api/test-packages - Create new package
POST /api/test-packages
{
  "packageCode": "PKG005",
  "packageName": "Senior Citizen Health Checkup",
  "description": "Comprehensive health checkup for seniors",
  "price": 3500,
  "isActive": true,
  "testIds": [1, 2, 3, 4, 5]
}

// PUT /api/test-packages/:id - Update package
PUT /api/test-packages/1
{
  "packageName": "Updated Name",
  "price": 4000,
  "testIds": [1, 2, 3]
}

// DELETE /api/test-packages/:id - Delete package
DELETE /api/test-packages/1

// GET /api/tests - Fetch available tests for selection
GET /api/tests?category=Hematology
```

## Sample Data

The page includes sample data for demonstration:

1. **Basic Health Checkup** (PKG001) - ₹2,500
   - CBC, Lipid Profile, Liver Function

2. **Advanced Cardiac Risk Profile** (PKG002) - ₹4,500
   - Troponin T, NT-proBNP, Homocysteine

3. **Diabetes Screening Package** (PKG003) - ₹1,800
   - HbA1c, Fasting Insulin, Microalbuminuria

4. **Thyroid Profile Complete** (PKG004) - ₹2,200
   - T3, T4, TSH, Anti-TPO

## Navigation

Access the Test Packages page from the sidebar:
- **Diagnostic** → **Test Packages**
- Route: `/investigation/test-packages`

## Future Enhancements

- [ ] Bulk import/export packages via CSV
- [ ] Package analytics and usage statistics
- [ ] B2B pricing configuration per package
- [ ] Package templates for common combinations
- [ ] Version history for package changes
- [ ] Approval workflow for new packages
- [ ] Package dependency validation
- [ ] Cost calculation based on included tests
- [ ] Discount percentage display
- [ ] Package popularity ranking

## Component Files

```
app/investigation/test-packages/
├── page.tsx                 # Main page component
├── components/
│   ├── PackageModal.tsx     # Create/Edit modal
│   ├── PackageActions.tsx   # Actions dropdown
│   └── PackageTable.tsx     # Packages table
└── utils/
    ├── api.ts               # API integration functions
    └── validators.ts        # Form validation
```

## Styling

The page follows the existing design system:
- Consistent color scheme (emerald/slate theme)
- Rounded corners and shadows
- Hover effects and transitions
- Responsive layout
- Custom badges and icons

## Notes

- Package codes should be unique and follow a consistent naming convention
- Tests can be part of multiple packages (many-to-many relationship)
- Deactivating a package doesn't delete it, just makes it unavailable for booking
- Package price can be set lower than the sum of individual test prices to offer discounts
