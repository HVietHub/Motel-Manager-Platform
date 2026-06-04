/**
 * Password Validation Utilities
 * 
 * Provides comprehensive password validation with Vietnamese error messages
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

/**
 * Validates password against security requirements
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ cái viết hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ cái viết thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một chữ số');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất một ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates password strength score
 * 
 * @returns Score from 0 (very weak) to 4 (very strong)
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Rất yếu', color: 'bg-red-500' };
  }

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  const strengthMap: Record<number, { label: string; color: string }> = {
    0: { label: 'Rất yếu', color: 'bg-red-500' },
    1: { label: 'Yếu', color: 'bg-orange-500' },
    2: { label: 'Trung bình', color: 'bg-yellow-500' },
    3: { label: 'Mạnh', color: 'bg-blue-500' },
    4: { label: 'Rất mạnh', color: 'bg-green-500' },
  };

  return { score, ...strengthMap[score] };
}
