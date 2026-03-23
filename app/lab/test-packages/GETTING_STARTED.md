# 🚀 Getting Started with Test Packages Module

## Quick Start Guide

### 1. Access the Page

Navigate to the Test Packages page from your application sidebar:
- Click on **Diagnostic** → **Test Packages**
- Or directly visit: `/investigation/test-packages`

### 2. Current Implementation Status

✅ **Frontend UI**: Complete and fully functional  
✅ **Sample Data**: Pre-loaded for demonstration  
✅ **Navigation**: Integrated into sidebar  
⏳ **Backend Integration**: Ready for API connection  

---

## 📋 What's Been Created

### Files Structure

```
app/investigation/test-packages/
├── page.tsx                    # Main page component (484 lines)
├── api.ts                      # API service layer (392 lines)
├── types.ts                    # TypeScript type definitions (35 lines)
├── README.md                   # Comprehensive documentation
└── IMPLEMENTATION_SUMMARY.md   # Implementation details
```

### Modified Files

```
app/components/layouts/Sidebar.jsx  (+1 line for navigation)
```

---

## 🎯 Features Overview

### Table Features
- ✅ View all test packages in a beautiful table
- ✅ Search by package code or name
- ✅ Filter by test categories
- ✅ Package status badges (Active/Inactive)
- ✅ Visual test count indicators
- ✅ Actions dropdown menu for each package

### Modal Features
- ✅ Create new packages
- ✅ Edit existing packages
- ✅ Add/remove tests from packages
- ✅ Toggle active/inactive status
- ✅ Price management
- ✅ Description editor

### Sample Packages Included

| Code | Name | Price | Tests | Status |
|------|------|-------|-------|--------|
| PKG001 | Basic Health Checkup | ₹2,500 | 3 | Active |
| PKG002 | Advanced Cardiac Risk Profile | ₹4,500 | 3 | Active |
| PKG003 | Diabetes Screening Package | ₹1,800 | 3 | Active |
| PKG004 | Thyroid Profile Complete | ₹2,200 | 4 | Inactive |

---

## 🔌 Backend Integration Guide

### Required Backend Endpoints

Your backend should expose these REST endpoints:

#### 1. List All Packages
```http
GET /api/test-packages?page=0&size=10&search=&category=
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "packageCode": "PKG001",
      "packageName": "Basic Health Checkup",
      "description": "Comprehensive basic health screening",
      "price": 2500,
      "isActive": true,
      "tests": [...],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "totalElements": 10,
  "totalPages": 1,
  "size": 10,
  "number": 0
}
```

#### 2. Get Single Package
```http
GET /api/test-packages/{id}
```

#### 3. Create Package
```http
POST /api/test-packages
Content-Type: application/json

{
  "packageCode": "PKG005",
  "packageName": "Senior Citizen Health Checkup",
  "description": "Comprehensive checkup for seniors",
  "price": 3500,
  "isActive": true,
  "testIds": [1, 2, 3, 4, 5]
}
```

#### 4. Update Package
```http
PUT /api/test-packages/{id}
Content-Type: application/json

{
  "packageName": "Updated Name",
  "price": 4000,
  "testIds": [1, 2, 3]
}
```

#### 5. Delete Package
```http
DELETE /api/test-packages/{id}
```

#### 6. Toggle Status
```http
PATCH /api/test-packages/{id}/status
Content-Type: application/json

{
  "isActive": false
}
```

#### 7. Add Tests to Package
```http
POST /api/test-packages/{id}/tests
Content-Type: application/json

{
  "testIds": [6, 7, 8]
}
```

#### 8. Remove Tests from Package
```http
DELETE /api/test-packages/{id}/tests
Content-Type: application/json

{
  "testIds": [6, 7]
}
```

#### 9. Get Available Tests
```http
GET /api/tests?category=Hematology
```

---

## ⚙️ Configuration Steps

### Step 1: Set API URL

Create or update your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Or for production:

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Step 2: Update API Service

Open `app/investigation/test-packages/api.ts`

The file already contains all necessary functions. Just ensure your backend endpoints match.

### Step 3: Connect to Real Data

In `page.tsx`, replace the sample data usage with API calls:

```typescript
// Current (sample data):
const [packages] = useState<TestPackage[]>(SAMPLE_PACKAGES);

// Replace with:
const [packages, setPackages] = useState<TestPackage[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadPackages();
}, []);

async function loadPackages() {
  try {
    setLoading(true);
    const response = await fetchPackages(0, 10, search, catFilter);
    setPackages(response.content);
  } catch (error) {
    console.error('Error loading packages:', error);
  } finally {
    setLoading(false);
  }
}
```

### Step 4: Handle Save Operations

Update the `handleSave` function in `page.tsx`:

```typescript
const handleSave = async (data: Partial<TestPackage>) => {
  try {
    if (editingPackage) {
      // Update existing package
      const result = await updatePackage(editingPackage.id, data);
      if (result.success) {
        alert('Package updated successfully!');
        loadPackages(); // Refresh list
      } else {
        alert('Error: ' + result.error);
      }
    } else {
      // Create new package
      const result = await createPackage(data as CreatePackageInput);
      if (result.success) {
        alert('Package created successfully!');
        loadPackages(); // Refresh list
      } else {
        alert('Error: ' + result.error);
      }
    }
    setIsModalOpen(false);
    setEditingPackage(null);
  } catch (error) {
    console.error('Error saving package:', error);
    alert('An error occurred');
  }
};
```

---

## 🧪 Testing Checklist

Before deploying, test these scenarios:

### Basic Operations
- [ ] View all packages in the table
- [ ] Search for packages by name
- [ ] Search for packages by code
- [ ] Filter packages by category
- [ ] Click on package actions menu

### Create Package
- [ ] Open create package modal
- [ ] Enter valid package code
- [ ] Enter package name and description
- [ ] Set price
- [ ] Add tests to package
- [ ] Toggle active status
- [ ] Save package successfully
- [ ] Verify package appears in list

### Edit Package
- [ ] Open edit modal from existing package
- [ ] Modify package details
- [ ] Add more tests
- [ ] Remove tests
- [ ] Save changes
- [ ] Verify updates reflect in table

### Status Management
- [ ] Deactivate an active package
- [ ] Activate an inactive package
- [ ] Verify status badge updates

### Validation
- [ ] Try saving without package code
- [ ] Try saving without package name
- [ ] Try saving with zero price
- [ ] Try saving without any tests
- [ ] Verify error messages appear

---

## 🎨 Customization Options

### Change Color Theme

Edit the color classes in `page.tsx`:

```typescript
// Current: Emerald theme
className="text-emerald-600"
className="bg-emerald-50"

// Change to Blue theme
className="text-blue-600"
className="bg-blue-50"
```

### Modify Table Columns

Add or remove columns in the table section:

```typescript
// Add a "Created Date" column
<th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
  Created Date
</th>

// In tbody:
<td className="px-6 py-4">
  {new Date(pkg.createdAt).toLocaleDateString()}
</td>
```

### Adjust Form Fields

Modify the modal form in `PackageModal` component to add custom fields.

---

## 📊 Backend Model Alignment

The frontend perfectly matches your Java backend model:

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

**Field Mapping:**

| Frontend | Backend | Type | Notes |
|----------|---------|------|-------|
| `packageCode` | `packageCode` | String | Unique identifier |
| `packageName` | `packageName` | String | Display name |
| `description` | `description` | String | Optional |
| `price` | `price` | Double | In INR |
| `isActive` | `isActive` | Boolean | Default: true |
| `tests` | `tests` | List<Test> | Many-to-many |

---

## 🐛 Troubleshooting

### Issue: "Cannot find module './types'"

**Solution:** The types.ts file exists but TypeScript can't resolve it. Try:
1. Restart TypeScript server in your IDE
2. Clear `.next` folder and rebuild
3. Run `npm install` again

### Issue: API calls failing

**Solution:**
1. Check if `NEXT_PUBLIC_API_URL` is set correctly
2. Verify backend is running
3. Check CORS configuration on backend
4. Inspect browser console for errors

### Issue: Modal not opening

**Solution:**
1. Check browser console for JavaScript errors
2. Verify state management is working
3. Ensure no TypeScript compilation errors

### Issue: Navigation link not appearing

**Solution:**
1. Refresh the page
2. Clear browser cache
3. Check Sidebar.jsx was properly updated

---

## 📝 Next Steps

### Immediate Tasks
1. ✅ Review the created files
2. ✅ Test with sample data
3. ⏳ Connect to your backend API
4. ⏳ Test with real data
5. ⏳ Deploy to staging environment

### Future Enhancements
- [ ] Bulk import/export via CSV
- [ ] Package analytics dashboard
- [ ] B2B pricing tiers
- [ ] Package templates
- [ ] Approval workflow
- [ ] Version history
- [ ] Cost calculator based on included tests
- [ ] Discount percentage display

---

## 💡 Tips & Best Practices

### Performance
- Implement pagination for large datasets
- Use React Query or SWR for data fetching
- Cache frequently accessed data
- Lazy load modal components

### User Experience
- Add loading skeletons during data fetch
- Show toast notifications for actions
- Implement undo for delete operations
- Add keyboard shortcuts

### Security
- Validate all inputs on both frontend and backend
- Implement proper authentication
- Add role-based access control
- Sanitize user inputs

---

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Review the TypeScript compilation output
3. Verify backend API is accessible
4. Check network requests in DevTools

---

## ✅ Completion Checklist

- [x] Created main page component
- [x] Added navigation link
- [x] Created API service layer
- [x] Defined TypeScript types
- [x] Added sample data
- [x] Wrote comprehensive documentation
- [x] Created implementation summary
- [ ] Connect to backend API
- [ ] Test with real data
- [ ] Deploy to production

---

**Status**: ✅ Ready for Backend Integration  
**Last Updated**: 2026-03-23  
**Estimated Integration Time**: 2-4 hours
