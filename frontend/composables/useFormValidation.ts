/**
 * Form validation composable
 * Provides reusable validation logic for forms
 */

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: any) => string | null;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

interface ValidationErrors {
  [key: string]: string[];
}

export const useFormValidation = () => {
  const errors = ref<ValidationErrors>({});

  /**
   * Validate a single field
   */
  const validateField = (
    name: string,
    value: any,
    rules: ValidationRule
  ): string[] => {
    const fieldErrors: string[] = [];

    if (
      rules.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      fieldErrors.push(`${name} is required`);
    }

    if (value && typeof value === "string") {
      if (rules.minLength && value.length < rules.minLength) {
        fieldErrors.push(
          `${name} must be at least ${rules.minLength} characters`
        );
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        fieldErrors.push(
          `${name} must not exceed ${rules.maxLength} characters`
        );
      }

      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        fieldErrors.push(`${name} must be a valid email address`);
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        fieldErrors.push(`${name} format is invalid`);
      }
    }

    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        fieldErrors.push(customError);
      }
    }

    return fieldErrors;
  };

  /**
   * Validate all fields
   */
  const validate = (
    data: Record<string, any>,
    rules: ValidationRules
  ): boolean => {
    const newErrors: ValidationErrors = {};

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const fieldErrors = validateField(fieldName, data[fieldName], fieldRules);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
      }
    }

    errors.value = newErrors;
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Clear validation errors
   */
  const clearErrors = (fieldName?: string) => {
    if (fieldName) {
      delete errors.value[fieldName];
    } else {
      errors.value = {};
    }
  };

  /**
   * Set server validation errors
   */
  const setServerErrors = (serverErrors: Record<string, string[]>) => {
    errors.value = { ...errors.value, ...serverErrors };
  };

  return {
    errors: readonly(errors),
    validate,
    validateField,
    clearErrors,
    setServerErrors,
  };
};
