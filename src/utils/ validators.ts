export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidCUIT(cuit: string): boolean {
  const clean = cuit.replace(/\D/g, "");
  return clean.length === 11;
}

export function isValidPhone(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 8;
}

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidAWBNumber(awb: string): boolean {
  return /^AWB-\d{3}-\d{4}$/.test(awb);
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequired(fields: Record<string, string>): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const [field, value] of Object.entries(fields)) {
    if (!isRequired(value)) {
      errors.push({ field, message: `${field} es requerido` });
    }
  }
  return errors;
}
