/**
 * Password Validation Tests
 * 
 * Tests password validation and strength calculation
 */

import { validatePassword, getPasswordStrength } from '@/lib/password-validation';

describe('Password Validation', () => {
  describe('validatePassword', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất 8 ký tự');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('password123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất một chữ cái viết hoa');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất một chữ cái viết thường');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('Password!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất một chữ số');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('Password123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mật khẩu phải có ít nhất một ký tự đặc biệt');
    });

    it('should accept valid passwords', () => {
      const result = validatePassword('Password123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept passwords with various special characters', () => {
      const passwords = [
        'Password123@',
        'Password123#',
        'Password123$',
        'Password123%',
        'Password123^',
        'Password123&',
        'Password123*',
      ];

      passwords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
      });
    });

    it('should return multiple errors for weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('getPasswordStrength', () => {
    it('should return very weak for empty password', () => {
      const strength = getPasswordStrength('');
      expect(strength.score).toBe(0);
      expect(strength.label).toBe('Rất yếu');
      expect(strength.color).toBe('bg-red-500');
    });

    it('should return weak for short passwords', () => {
      const strength = getPasswordStrength('Pass1!');
      expect(strength.score).toBeLessThanOrEqual(3);
    });

    it('should return strong for passwords meeting all requirements', () => {
      const strength = getPasswordStrength('Password123!');
      expect(strength.score).toBeGreaterThanOrEqual(3);
    });

    it('should return very strong for long complex passwords', () => {
      const strength = getPasswordStrength('MyVerySecurePassword123!@#');
      expect(strength.score).toBe(4);
      expect(strength.label).toBe('Rất mạnh');
      expect(strength.color).toBe('bg-green-500');
    });

    it('should increase score with password length', () => {
      const short = getPasswordStrength('Pass1!');
      const medium = getPasswordStrength('Password1!');
      const long = getPasswordStrength('MyLongPassword1!');
      
      expect(long.score).toBeGreaterThanOrEqual(medium.score);
      expect(medium.score).toBeGreaterThanOrEqual(short.score);
    });

    it('should cap score at 4', () => {
      const strength = getPasswordStrength('MyVeryVeryVeryLongAndComplexPassword123!@#$%^&*()');
      expect(strength.score).toBe(4);
    });
  });
});
