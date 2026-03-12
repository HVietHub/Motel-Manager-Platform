import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * AuthService - Handles authentication and user registration
 * 
 * This service provides methods for:
 * - Password hashing and verification using bcrypt
 * - Landlord registration with User and Landlord record creation
 * 
 * Requirements: 1.1, 1.5
 */

export interface RegisterLandlordInput {
  email: string;
  password: string;
  name: string;
  phone: string;
  address?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  landlord?: {
    id: string;
    phone: string;
    address: string | null;
  } | null;
}

/**
 * Hash a password using bcrypt with salt rounds = 10
 * 
 * @param password - Plain text password to hash
 * @returns Promise<string> - Hashed password
 * 
 * **Validates: Requirements 1.5**
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a bcrypt hash
 * 
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns Promise<boolean> - True if password matches, false otherwise
 * 
 * **Validates: Requirements 1.5**
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate user code for landlord or tenant
 * Format: LL001, LL002 for landlords, TN001, TN002 for tenants
 */
async function generateUserCode(role: 'LANDLORD' | 'TENANT'): Promise<string> {
  const prefix = role === 'LANDLORD' ? 'LL' : 'TN'
  
  if (role === 'LANDLORD') {
    const count = await prisma.landlord.count()
    return `${prefix}${String(count + 1).padStart(3, '0')}`
  } else {
    const count = await prisma.tenant.count()
    return `${prefix}${String(count + 1).padStart(3, '0')}`
  }
}

/**
 * Register a new landlord with User and Landlord records
 * 
 * Creates both User (with role LANDLORD) and Landlord records in a transaction.
 * Password is hashed before storage.
 * Generates unique user code (LL001, LL002, etc.)
 * 
 * @param data - Registration data including email, password, name, phone, and optional address
 * @returns Promise<User> - Created user with landlord relation
 * @throws Error if email already exists or database operation fails
 * 
 * **Validates: Requirements 1.1, 1.5**
 */
export async function registerLandlord(data: RegisterLandlordInput): Promise<User> {
  const { email, password, name, phone, address } = data;

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate user code
  const userCode = await generateUserCode('LANDLORD')

  // Create User and Landlord in a transaction
  const user = await prisma.$transaction(async (tx) => {
    // Create User with role LANDLORD
    const newUser = await tx.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'LANDLORD',
      },
    });

    // Create Landlord record
    await tx.landlord.create({
      data: {
        userId: newUser.id,
        userCode,
        phone,
        address: address || null,
      },
    });

    // Return user with landlord relation
    return tx.user.findUnique({
      where: { id: newUser.id },
      include: {
        landlord: true,
      },
    });
  });

  if (!user) {
    throw new Error('Failed to create user');
  }

  return user as User;
}

/**
 * AuthService interface for dependency injection and testing
 */
export const AuthService = {
  hashPassword,
  verifyPassword,
  registerLandlord,
  generateUserCode,
};
