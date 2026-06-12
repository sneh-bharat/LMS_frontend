# UI Components Library

This directory contains reusable UI components for the Lab Management System.

## Component Categories

### 1. **Tailwind-based Components** (for pages using Tailwind CSS)
These components use Tailwind utility classes and are ideal for modern, styled interfaces.

- **Button** - Versatile button component with variants
- **Modal** - Dialog modal component
- **FormGroup** - Form field wrapper with label
- **Input** - Text input field
- **Table** - Data table component
- **Card** - Content container card
- **Badge** - Status/label badge

### 2. **Inline-styled Components** (for pages using inline styles)
These components use inline styles matching the existing design system in legacy pages.

- **InlineButton** - Button with inline styles
- **InlineModal** - Modal with inline styles
- **InlineFormGroup** - FormGroup with inline styles
- **InlineInput** - Input with inline styles
- **InlineTable** - Table with inline styles

### 3. **Domain-specific Components**
Business-specific components that encapsulate complex UI patterns.

- **ReferrerCard** - Card component for displaying referrer information

---

## Usage Examples

### From pages using Tailwind CSS:

```tsx
import { Button, Modal, Input, FormGroup, Table, Card, Badge } from '@/components/ui';

// Button with variants
<Button variant="primary" onClick={handleClick}>Save</Button>
<Button variant="danger" size="sm">Delete</Button>

// Modal
<Modal title="Add Item" onClose={closeModal}>
  <p>Modal content here</p>
</Modal>

// Form with Input
<FormGroup label="Name">
  <Input 
    value={name} 
    onChange={(e) => setName(e.target.value)} 
    placeholder="Enter name"
  />
</FormGroup>

// Table
<Table columns={['Name', 'Email']} data={users} />

// Card
<Card>
  <h2>Card Title</h2>
  <p>Card content</p>
</Card>

// Badge
<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
```

### From pages using inline styles (like referrer page):

```tsx
import { 
  InlineButton as Button, 
  InlineInput as Input, 
  InlineFormGroup as FormGroup,
  InlineModal as Modal,
  InlineTable as Table,
  ReferrerCard
} from '@/components/ui';

// Button with variants
<Button variant="primary" onClick={handleClick}>Save</Button>
<Button variant="ghost" size="sm">Cancel</Button>

// Modal
<Modal isOpen={isOpen} onClose={closeModal} title="Add Referrer">
  <p>Modal content here</p>
</Modal>

// Form with Input
<FormGroup label="Mobile Number">
  <Input 
    value={mobile} 
    onChange={(e) => setMobile(e.target.value)} 
    placeholder="Mobile number"
  />
</FormGroup>

// Table
<Table 
  columns={[{ key: 'name', label: 'Name' }, { key: 'value', label: 'Value' }]} 
  data={items} 
/>

// Domain-specific: ReferrerCard
<ReferrerCard 
  referrer={referrerData}
  onEdit={() => handleEdit(referrerData)}
  onCommission={() => handleCommission(referrerData)}
/>
```

---

## Component API Reference

### Button / InlineButton

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' (default: 'md')
- `onClick`: () => void
- `children`: React.ReactNode
- `style`: React.CSSProperties (InlineButton only)

### Modal / InlineModal

**Props:**
- `isOpen`: boolean (InlineModal only)
- `onClose`: () => void
- `title`: string
- `children`: React.ReactNode

### Input / InlineInput

**Props:**
- `value`: string
- `onChange`: (e: ChangeEvent<HTMLInputElement>) => void
- `placeholder`: string (optional)
- `style`: React.CSSProperties (InlineInput only)

### FormGroup / InlineFormGroup

**Props:**
- `label`: string
- `children`: React.ReactNode
- `style`: React.CSSProperties (InlineFormGroup only)

### Table / InlineTable

**Props:**
- `columns`: Array<{ key: string; label: string }>
- `data`: Array<Record<string, unknown>>
- `emptyMessage`: string (optional, default: 'No records found.')

### Card

**Props:**
- `children`: React.ReactNode
- `className`: string (optional)
- `style`: React.CSSProperties (optional)

### Badge

**Props:**
- `children`: React.ReactNode
- `variant`: 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'secondary' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `className`: string (optional)
- `style`: React.CSSProperties (optional)

### ReferrerCard

**Props:**
- `referrer`: { id: number; name: string; mobile: string; address: string; centre: string; marketingAssociate: string; status: 'Active' | 'Inactive'; showOnPrint: 'Hide All' | 'Show All' }
- `onEdit`: () => void
- `onCommission`: () => void

---

## Migration Guide

### Migrating a page from inline components to commonized components:

1. **Identify inline component definitions** in your page
2. **Replace with imports** from `@/components/ui`
3. **Remove duplicate code** from the page
4. **Test the page** to ensure styling matches

**Before:**
```tsx
// Inline definition
function Button({ children, onClick, variant = 'primary' }) { ... }

export default function MyPage() {
  return <Button onClick={handleClick}>Click me</Button>;
}
```

**After:**
```tsx
import { InlineButton as Button } from '@/components/ui';

export default function MyPage() {
  return <Button onClick={handleClick}>Click me</Button>;
}
```

---

## Best Practices

1. **Use Tailwind components** for new pages and features
2. **Use Inline components** when maintaining consistency with existing inline-styled pages
3. **Create domain-specific components** when you find yourself repeating complex UI patterns
4. **Keep components in sync** - if you fix a bug in one place, update all usages
5. **Document new props** in this README when extending components

---

## Adding New Components

When you identify repeated UI patterns:

1. Create the component in `components/ui/ComponentName.tsx`
2. Export it in `components/ui/index.ts`
3. Update this README.md
4. Replace duplicate code across pages with the new component

---

## File Structure

```
components/ui/
├── index.ts              # Main export file
├── Button.tsx            # Tailwind Button
├── Modal.tsx             # Tailwind Modal
├── Input.tsx             # Tailwind Input
├── FormGroup.tsx         # Tailwind FormGroup
├── Table.tsx             # Tailwind Table
├── Card.tsx              # Tailwind Card
├── Badge.tsx             # Tailwind Badge
├── InlineButton.tsx      # Inline-styled Button
├── InlineModal.tsx       # Inline-styled Modal
├── InlineInput.tsx       # Inline-styled Input
├── InlineFormGroup.tsx   # Inline-styled FormGroup
├── InlineTable.tsx       # Inline-styled Table
└── ReferrerCard.tsx      # Domain-specific card
```
