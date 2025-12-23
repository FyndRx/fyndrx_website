export const validationRules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return !value || pattern.test(value) || 'Please enter a valid email address';
  },
  phone: (value: string) => {
    const pattern = /^\+?[1-9]\d{1,14}$/;
    return !value || pattern.test(value) || 'Please enter a valid phone number';
  },
  minLength: (length: number) => (value: string) => 
    !value || value.length >= length || `Must be at least ${length} characters`,
  maxLength: (length: number) => (value: string) => 
    !value || value.length <= length || `Must be at most ${length} characters`,
  fileSize: (maxSize: number) => (file: File) => 
    !file || file.size <= maxSize || `File size must be less than ${maxSize / (1024 * 1024)}MB`,
  fileType: (types: string[]) => (file: File) => 
    !file || types.includes(file.type) || `File must be one of: ${types.join(', ')}`,
};


export interface ValidationError {
  field: string;
  message: string;
}

export const validateForm = (data: Record<string, any>, rules: Record<string, ((value: any) => boolean | string)[]>) => {
  const errors: ValidationError[] = [];

  Object.entries(rules).forEach(([field, fieldRules]) => {
    fieldRules.forEach(rule => {
      const result = rule(data[field]);
      if (typeof result === 'string') {
        errors.push({ field, message: result });
      }
    });
  });

  return errors;
}; 