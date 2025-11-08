# Custom Checkbox Component - Documentation

## 📦 Component Overview

A beautiful, animated custom checkbox component with multiple variants, sizes, and colors. Fully integrated throughout the FyndRX application.

**Location:** `/src/components/CustomCheckbox.vue`

---

## ✨ Features

### **3 Variants:**
1. **Default** - Animated checkbox with checkmark
2. **Switch** - Toggle switch style
3. **Card** - Full card selection with badge

### **3 Sizes:**
- Small
- Medium (default)
- Large

### **4 Colors:**
- Primary (Blue - `#246BFD`)
- Success (Green)
- Warning (Yellow)
- Danger (Red)

### **Capabilities:**
- ✅ Single checkbox (boolean)
- ✅ Multiple checkboxes (array values)
- ✅ Disabled state
- ✅ Error messages
- ✅ Labels and descriptions
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Hover effects
- ✅ Focus states
- ✅ Accessibility friendly

---

## 🎨 Usage Examples

### **1. Default Variant (Basic Checkbox)**

```vue
<CustomCheckbox
  v-model="isChecked"
  label="Accept terms and conditions"
  size="medium"
/>
```

**With Description:**
```vue
<CustomCheckbox
  v-model="isChecked"
  label="Enable notifications"
  description="Receive email updates about your orders"
  size="medium"
/>
```

**With Error:**
```vue
<CustomCheckbox
  v-model="isChecked"
  label="Required field"
  :error="validationError"
  size="medium"
/>
```

---

### **2. Switch Variant (Toggle)**

```vue
<CustomCheckbox
  v-model="isEnabled"
  label="Open Now"
  variant="switch"
  size="medium"
  color="success"
/>
```

**Perfect for:**
- Feature toggles
- Enable/disable options
- Binary settings
- Filter toggles

---

### **3. Card Variant (Full Card Selection)**

```vue
<CustomCheckbox
  v-model="selectedPlan"
  value="premium"
  label="Premium Plan"
  description="Unlimited access with all features"
  variant="card"
  size="large"
/>
```

**Perfect for:**
- Plan selection
- Feature packages
- Multi-step forms
- Service selection

---

### **4. Multiple Selection (Array)**

```vue
<CustomCheckbox
  v-model="selectedServices"
  value="delivery"
  label="Home Delivery"
  size="small"
/>

<CustomCheckbox
  v-model="selectedServices"
  value="24-7"
  label="24/7 Service"
  size="small"
/>
```

**In your script:**
```typescript
const selectedServices = ref<string[]>([]);
```

---

## 🎯 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean \| (string \| number)[]` | Required | Checkbox state or array for multiple |
| `value` | `string \| number` | - | Value for array-based checkboxes |
| `label` | `string` | - | Label text |
| `description` | `string` | - | Helper description |
| `disabled` | `boolean` | `false` | Disabled state |
| `error` | `string` | - | Error message |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Checkbox size |
| `variant` | `'default' \| 'switch' \| 'card'` | `'default'` | Visual style |
| `color` | `'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Color theme |

---

## 🔔 Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean \| (string \| number)[]` | Emitted when checkbox state changes |

---

## 📍 Implementation Locations

### **Replaced All Checkboxes:**

1. ✅ **PharmaciesView.vue**
   - "Open Now" toggle (Switch variant, green)
   - Services filters (Default variant, small)

2. ✅ **LoginView.vue**
   - "Remember me" (Default variant, small)

3. ✅ **RegisterView.vue**
   - "Accept Terms" (Default variant, small)

4. ✅ **CartView.vue**
   - "Select All Pharmacies" (Switch variant, medium)
   - Individual pharmacy selection (Default variant, medium)

5. ✅ **Dropdown.vue**
   - Multiple selection checkboxes (Default variant, small)

---

## 🎨 Visual Features

### **Animations:**
- ✅ Checkmark slide-in animation
- ✅ Scale effect on check/uncheck
- ✅ Switch toggle animation
- ✅ Hover lift effect
- ✅ Shadow transitions
- ✅ Color transitions

### **States:**
- ✅ Unchecked
- ✅ Checked
- ✅ Hover
- ✅ Focus
- ✅ Disabled
- ✅ Error

### **Dark Mode:**
- ✅ Fully supported
- ✅ Proper contrast
- ✅ Border colors adjust
- ✅ Text colors adjust

---

## 🎯 Size Reference

### **Small:**
- Checkbox: 16px (w-4 h-4)
- Text: 14px (text-sm)
- Perfect for: Forms, lists, dense layouts

### **Medium:**
- Checkbox: 20px (w-5 h-5)
- Text: 16px (text-base)
- Perfect for: Standard forms, filters

### **Large:**
- Checkbox: 24px (w-6 h-6)
- Text: 18px (text-lg)
- Perfect for: Important selections, card variant

---

## 🎨 Color Reference

### **Primary (Default):**
- Color: `#246BFD` (Blue)
- Use: General checkboxes, default selections

### **Success:**
- Color: Green
- Use: Confirmations, enabled states, "Open Now"

### **Warning:**
- Color: Yellow
- Use: Cautions, important notices

### **Danger:**
- Color: Red
- Use: Deletions, critical actions

---

## 💡 Best Practices

### **When to Use Each Variant:**

**Default:**
- Standard forms
- Lists of options
- Multiple selections
- Terms acceptance

**Switch:**
- Feature toggles
- Enable/disable
- Binary filters (Open Now, In Stock)
- Settings

**Card:**
- Plan selection
- Package choices
- Service tiers
- Important selections that need emphasis

---

## 🔧 Advanced Usage

### **Conditional Styling:**

```vue
<CustomCheckbox
  v-model="agreeToTerms"
  label="I agree"
  :color="hasError ? 'danger' : 'primary'"
  :error="hasError ? 'You must accept terms' : ''"
/>
```

### **Dynamic Disabled State:**

```vue
<CustomCheckbox
  v-model="option"
  label="Premium Feature"
  :disabled="!isPremiumUser"
  description="Upgrade to access"
/>
```

### **With Custom Label Slot:**

The component supports custom label content through the default slot for complex labels like links.

---

## 📊 Before & After

### **Before (Native Checkbox):**
```html
<input
  type="checkbox"
  class="rounded border-gray-300 text-[#246BFD]"
/>
```
- ❌ Plain browser default
- ❌ Limited styling
- ❌ No animations
- ❌ Inconsistent across browsers

### **After (CustomCheckbox):**
```vue
<CustomCheckbox v-model="value" label="Option" />
```
- ✅ Beautiful custom design
- ✅ Smooth animations
- ✅ Multiple variants
- ✅ Consistent everywhere
- ✅ Dark mode support
- ✅ Better UX

---

## 🚀 Performance

- Lightweight component (~200 lines)
- No external dependencies
- CSS animations (GPU accelerated)
- Efficient re-rendering
- Small bundle size

---

## ♿ Accessibility

- ✅ Keyboard navigable (Tab, Space, Enter)
- ✅ Screen reader compatible
- ✅ Proper ARIA labels
- ✅ Focus indicators
- ✅ Error announcements
- ✅ Disabled state support

---

## 🎯 Real-World Examples

### **Pharmacy Filters:**
```vue
<!-- "Open Now" Switch -->
<CustomCheckbox
  v-model="isOpenNow"
  label="Open Now"
  variant="switch"
  size="medium"
  color="success"
/>

<!-- Service Checkboxes -->
<CustomCheckbox
  v-for="service in services"
  :key="service"
  v-model="selectedServices"
  :value="service"
  :label="service"
  size="small"
/>
```

### **Login Form:**
```vue
<CustomCheckbox
  v-model="rememberMe"
  label="Remember me"
  size="small"
/>
```

### **Cart Selection:**
```vue
<!-- Select All Toggle -->
<CustomCheckbox
  :model-value="allSelected"
  label="Select All Pharmacies"
  variant="switch"
  size="medium"
  @update:model-value="toggleAll"
/>

<!-- Individual Selection -->
<CustomCheckbox
  :model-value="isSelected(id)"
  size="medium"
  @update:model-value="toggle(id)"
/>
```

---

## 🎨 Customization

The component uses Tailwind CSS and can be easily customized by:
1. Modifying color classes
2. Adjusting size mappings
3. Changing animation durations
4. Adding new variants

---

## 📝 Notes

- Component is fully typed with TypeScript
- Supports both v-model and explicit prop binding
- All animations use CSS transitions (no JavaScript)
- Compatible with form validation libraries
- Works with array and boolean values seamlessly

---

## 🐛 Edge Cases Handled

✅ Disabled state prevents clicks  
✅ Array checkboxes properly sync  
✅ Focus states work correctly  
✅ Dark mode transitions smoothly  
✅ Error states display properly  
✅ Label clicks toggle checkbox  

---

**Created:** November 8, 2025  
**Status:** ✅ Production Ready  
**Implementations:** 5 files  
**Lines of Code:** ~200  

