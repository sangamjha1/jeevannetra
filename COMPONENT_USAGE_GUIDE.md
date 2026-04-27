# Performance & UX Component Usage Guide

Quick reference for using the new components in your forms.

## Components Overview

### 1. FormError
**Purpose**: Show form-level errors with auto-scroll and dismiss button

**Location**: `client/src/components/ui/form-error.tsx`

**Usage**:
```tsx
import { FormError } from "@/components/ui/form-error";

<form onSubmit={handleSubmit}>
  {error && (
    <FormError
      error={error}
      onDismiss={() => setError("")}
      autoScroll={true}
      autoFocus={true}
    />
  )}
  {/* form fields */}
</form>
```

**Props**:
- `error: string` - Error message to display (required)
- `onDismiss?: () => void` - Callback when close button clicked
- `autoScroll?: boolean` - Auto-scroll to error (default: true)
- `autoFocus?: boolean` - Auto-focus first input (default: true)

---

### 2. FieldError
**Purpose**: Show field-specific validation errors below inputs

**Location**: `client/src/components/ui/field-error.tsx`

**Usage**:
```tsx
import { FieldError } from "@/components/ui/field-error";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    className={fieldErrors.email ? "border-red-500" : ""}
  />
  {fieldErrors.email && <FieldError error={fieldErrors.email} />}
</div>
```

**Props**:
- `error?: string` - Error message (if undefined, nothing renders)
- `className?: string` - Additional CSS classes

---

### 3. PasswordValidator
**Purpose**: Show real-time password requirement validation

**Location**: `client/src/components/ui/password-validator.tsx`

**Usage**:
```tsx
import { PasswordValidator } from "@/components/ui/password-validator";

<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <PasswordValidator
    password={password}
    confirmPassword={confirmPassword}
    showValidation={true}
  />
</div>
```

**Props**:
- `password: string` - Password to validate (required)
- `confirmPassword?: string` - Confirm password for match checking
- `showValidation?: boolean` - Show/hide validator (default: true)

**Shows**:
- ✓ At least 8 characters
- ✓ One uppercase letter
- ✓ One lowercase letter
- ✓ One number
- ✓ Passwords match (if confirmPassword provided)

---

## Real-Time Validation Pattern

### Implementation Steps:

**1. Add state for field errors:**
```tsx
const [fieldErrors, setFieldErrors] = useState({
  email: "",
  password: "",
  confirmPassword: "",
});
```

**2. Add useEffect for email validation:**
```tsx
useEffect(() => {
  if (!email) {
    setFieldErrors((prev) => ({ ...prev, email: "" }));
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    setFieldErrors((prev) => ({ ...prev, email: "Invalid email format" }));
  } else {
    setFieldErrors((prev) => ({ ...prev, email: "" }));
  }
}, [email]);
```

**3. Add useEffect for password validation:**
```tsx
useEffect(() => {
  if (!password) {
    setFieldErrors((prev) => ({ ...prev, password: "" }));
    return;
  }

  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");

  setFieldErrors((prev) => ({
    ...prev,
    password: errors.length > 0 ? `Missing: ${errors.join(", ")}` : "",
  }));
}, [password]);
```

**4. Add useEffect for password match:**
```tsx
useEffect(() => {
  if (!confirmPassword) {
    setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
    return;
  }

  if (password !== confirmPassword) {
    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword: "Passwords do not match",
    }));
  } else {
    setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
  }
}, [password, confirmPassword]);
```

**5. Update JSX with error styling:**
```tsx
<Input
  className={fieldErrors.email ? "border-red-500" : ""}
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
{fieldErrors.email && <FieldError error={fieldErrors.email} />}
```

**6. Disable submit button until valid:**
```tsx
<Button
  type="submit"
  disabled={
    loading ||
    Object.values(fieldErrors).some((e) => e) ||
    !email ||
    !password
  }
>
  Submit
</Button>
```

---

## Performance Utilities

### useDebounce Hook
**Purpose**: Debounce API calls during typing

**Location**: `client/src/lib/request-utils.ts`

**Usage**:
```tsx
import { useDebounce } from "@/lib/request-utils";

// In component:
const debouncedEmail = useDebounce(email, 500);

useEffect(() => {
  // This runs after email stops changing for 500ms
  if (debouncedEmail) {
    checkEmailAvailability(debouncedEmail);
  }
}, [debouncedEmail]);
```

---

### cachedRequest Utility
**Purpose**: Cache API responses for session duration

**Location**: `client/src/lib/request-utils.ts`

**Usage**:
```tsx
import { cachedRequest } from "@/lib/request-utils";

const data = await cachedRequest(
  "profile-key",
  () => api.get("/patients/profile"),
  { cacheDuration: 2 * 60 * 1000 } // 2 minutes
);
```

**Options**:
- `cacheDuration?: number` - Cache TTL in milliseconds (default: 2 min)
- `skipCache?: boolean` - Skip cache for this request

---

## Best Practices

### ✅ DO:
- Use `FieldError` next to inputs for immediate feedback
- Use `FormError` for cross-field or server errors
- Use `PasswordValidator` whenever collecting passwords
- Debounce expensive API calls (email availability checks)
- Cache profile/static data with `cachedRequest`
- Disable submit buttons during loading and validation errors
- Clear errors when form is dismissed/reset

### ❌ DON'T:
- Show all errors at once without user interacting
- Make API calls on every keystroke (use debounce)
- Cache sensitive data
- Leave submit buttons enabled with validation errors
- Show generic "Error occurred" messages
- Make validation effects dependent on state other than the field

---

## Form Optimization Checklist

- [ ] Add FormError with auto-scroll for form-level errors
- [ ] Add FieldError for each input field
- [ ] Add real-time validation useEffect for each field
- [ ] Update Input className to show border-red-500 on error
- [ ] Add PasswordValidator for password fields
- [ ] Disable submit button on loading or validation errors
- [ ] Test error messages on mobile screens
- [ ] Test auto-scroll behavior in scrollable forms
- [ ] Verify error dismissal with close button
- [ ] Check field focus after error auto-scroll

---

## Example: Complete Form Implementation

```tsx
"use client";

import { useState, useEffect } from "react";
import { FormError } from "@/components/ui/form-error";
import { FieldError } from "@/components/ui/field-error";
import { PasswordValidator } from "@/components/ui/password-validator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MyForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Email validation
  useEffect(() => {
    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setFieldErrors((prev) => ({
      ...prev,
      email: emailRegex.test(email) ? "" : "Invalid email format",
    }));
  }, [email]);

  // Password validation
  useEffect(() => {
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
      return;
    }

    const errors: string[] = [];
    if (password.length < 8) errors.push("At least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase");
    if (!/[0-9]/.test(password)) errors.push("One number");

    setFieldErrors((prev) => ({
      ...prev,
      password: errors.length > 0 ? `Missing: ${errors.join(", ")}` : "",
    }));
  }, [password]);

  // Confirm password validation
  useEffect(() => {
    if (!confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
      return;
    }

    setFieldErrors((prev) => ({
      ...prev,
      confirmPassword:
        password === confirmPassword ? "" : "Passwords don't match",
    }));
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    try {
      // API call
      console.log("Submitting...");
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <FormError
          error={formError}
          onDismiss={() => setFormError("")}
          autoScroll
        />
      )}

      <div className="space-y-2">
        <label>Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldErrors.email ? "border-red-500" : ""}
        />
        {fieldErrors.email && <FieldError error={fieldErrors.email} />}
      </div>

      <div className="space-y-2">
        <label>Password</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={fieldErrors.password ? "border-red-500" : ""}
        />
        <PasswordValidator
          password={password}
          confirmPassword={confirmPassword}
          showValidation={true}
        />
      </div>

      <div className="space-y-2">
        <label>Confirm Password</label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={fieldErrors.confirmPassword ? "border-red-500" : ""}
        />
        {fieldErrors.confirmPassword && (
          <FieldError error={fieldErrors.confirmPassword} />
        )}
      </div>

      <Button
        type="submit"
        disabled={
          loading ||
          Object.values(fieldErrors).some((e) => e) ||
          !email ||
          !password
        }
        className="w-full"
      >
        {loading ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
```

---

## Troubleshooting

### Error doesn't auto-scroll
- Check if `autoScroll={true}` is set on FormError
- Verify error parent has `overflow-y-auto` class
- Check browser console for scroll errors

### Password validator not showing
- Verify `showValidation={true}` prop
- Check if `password` prop is being updated
- Ensure component is being rendered

### Button stays disabled after fixing errors
- Check that all useEffect validations run correctly
- Verify field error state is being cleared
- Check button `disabled` prop condition logic

### Real-time validation too slow
- Add debounce to expensive validations
- Use `useCallback` to memoize validation functions
- Check for re-render issues in parent component
