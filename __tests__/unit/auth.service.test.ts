/**
 * Unit Tests for AuthService
 * Feature: quan-ly-nha-tro
 * Tests: hashPassword, verifyPassword, registerLandlord
 * Validates: Requirements 1.1, 1.5
 */

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, registerLandlord } from '@/lib/services/auth.service';

// Create a separate test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
});

// Helper to clean up database before each test
async function cleanDatabase() {
  await prisma.$transaction([
    prisma.invoice.deleteMany(),
    prisma.contract.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.maintenanceRequest.deleteMany(),
    prisma.tenant.deleteMany(),
    prisma.room.deleteMany(),
    prisma.building.deleteMany(),
    prisma.landlord.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

describe('AuthService - hashPassword', () => {
  it('should hash a password using bcrypt', async () => {
    const password = 'mySecurePassword123';
    const hash = await hashPassword(password);

    // Hash should be different from original password
    expect(hash).not.toBe(password);
    
    // Hash should be a bcrypt hash (starts with $2a$ or $2b$)
    expect(hash).toMatch(/^\$2[ab]\$/);
    
    // Hash should have reasonable length (bcrypt hashes are 60 chars)
    expect(hash.length).toBe(60);
  });

  it('should generate different hashes for the same password', async () => {
    const password = 'samePassword123';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    // Different hashes due to different salts
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty password', async () => {
    const password = '';
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).toMatch(/^\$2[ab]\$/);
  });

  it('should handle long passwords', async () => {
    const password = 'a'.repeat(100);
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).toMatch(/^\$2[ab]\$/);
  });
});

describe('AuthService - verifyPassword', () => {
  it('should verify correct password against hash', async () => {
    const password = 'correctPassword123';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject incorrect password', async () => {
    const password = 'correctPassword123';
    const wrongPassword = 'wrongPassword456';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it('should reject empty password when hash is for non-empty password', async () => {
    const password = 'correctPassword123';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword('', hash);
    expect(isValid).toBe(false);
  });

  it('should verify empty password if hash is for empty password', async () => {
    const password = '';
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should be case-sensitive', async () => {
    const password = 'Password123';
    const hash = await hashPassword(password);

    const isValidLower = await verifyPassword('password123', hash);
    const isValidUpper = await verifyPassword('PASSWORD123', hash);

    expect(isValidLower).toBe(false);
    expect(isValidUpper).toBe(false);
  });
});

describe('AuthService - registerLandlord', () => {
  it('should create a new landlord with User and Landlord records', async () => {
    const data = {
      email: 'landlord@example.com',
      password: 'securePassword123',
      name: 'John Doe',
      phone: '0123456789',
      address: '123 Main St',
    };

    const user = await registerLandlord(data);

    // Verify User record
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(data.email);
    expect(user.name).toBe(data.name);
    expect(user.role).toBe('LANDLORD');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);

    // Verify Landlord record
    expect(user.landlord).toBeDefined();
    expect(user.landlord?.id).toBeDefined();
    expect(user.landlord?.phone).toBe(data.phone);
    expect(user.landlord?.address).toBe(data.address);

    // Verify password is hashed in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(dbUser?.password).not.toBe(data.password);
    expect(dbUser?.password).toMatch(/^\$2[ab]\$/);

    // Verify password can be verified
    const isValid = await verifyPassword(data.password, dbUser!.password);
    expect(isValid).toBe(true);
  });

  it('should create landlord without address (optional field)', async () => {
    const data = {
      email: 'landlord2@example.com',
      password: 'securePassword123',
      name: 'Jane Smith',
      phone: '0987654321',
    };

    const user = await registerLandlord(data);

    expect(user).toBeDefined();
    expect(user.landlord).toBeDefined();
    expect(user.landlord?.address).toBeNull();
  });

  it('should reject duplicate email', async () => {
    const data = {
      email: 'duplicate@example.com',
      password: 'securePassword123',
      name: 'First User',
      phone: '0123456789',
    };

    // Create first user
    await registerLandlord(data);

    // Try to create second user with same email
    await expect(
      registerLandlord({
        ...data,
        name: 'Second User',
        phone: '0987654321',
      })
    ).rejects.toThrow('Email already exists');
  });

  it('should create multiple landlords with different emails', async () => {
    const landlord1 = await registerLandlord({
      email: 'landlord1@example.com',
      password: 'password123',
      name: 'Landlord One',
      phone: '0111111111',
    });

    const landlord2 = await registerLandlord({
      email: 'landlord2@example.com',
      password: 'password456',
      name: 'Landlord Two',
      phone: '0222222222',
    });

    expect(landlord1.id).not.toBe(landlord2.id);
    expect(landlord1.email).not.toBe(landlord2.email);
    expect(landlord1.landlord?.id).not.toBe(landlord2.landlord?.id);
  });

  it('should handle special characters in password', async () => {
    const data = {
      email: 'special@example.com',
      password: 'P@ssw0rd!#$%^&*()',
      name: 'Special User',
      phone: '0123456789',
    };

    const user = await registerLandlord(data);
    expect(user).toBeDefined();

    // Verify password with special characters
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    const isValid = await verifyPassword(data.password, dbUser!.password);
    expect(isValid).toBe(true);
  });

  it('should handle Vietnamese characters in name', async () => {
    const data = {
      email: 'vietnamese@example.com',
      password: 'password123',
      name: 'Nguyễn Văn Anh',
      phone: '0123456789',
    };

    const user = await registerLandlord(data);
    expect(user).toBeDefined();
    expect(user.name).toBe('Nguyễn Văn Anh');
  });

  it('should create User and Landlord in a transaction', async () => {
    const data = {
      email: 'transaction@example.com',
      password: 'password123',
      name: 'Transaction Test',
      phone: '0123456789',
    };

    const user = await registerLandlord(data);

    // Verify both records exist
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { landlord: true },
    });

    expect(dbUser).toBeDefined();
    expect(dbUser?.landlord).toBeDefined();
    expect(dbUser?.landlord?.userId).toBe(user.id);
  });
});

describe('AuthService - Integration Tests', () => {
  it('should complete full registration and login flow', async () => {
    // Register
    const registrationData = {
      email: 'fullflow@example.com',
      password: 'myPassword123',
      name: 'Full Flow User',
      phone: '0123456789',
      address: '456 Test St',
    };

    const user = await registerLandlord(registrationData);
    expect(user).toBeDefined();
    expect(user.role).toBe('LANDLORD');

    // Simulate login by verifying password
    const dbUser = await prisma.user.findUnique({
      where: { email: registrationData.email },
    });

    expect(dbUser).toBeDefined();
    
    const isValidPassword = await verifyPassword(
      registrationData.password,
      dbUser!.password
    );
    expect(isValidPassword).toBe(true);

    // Verify wrong password fails
    const isInvalidPassword = await verifyPassword(
      'wrongPassword',
      dbUser!.password
    );
    expect(isInvalidPassword).toBe(false);
  });

  it('should maintain data integrity across multiple operations', async () => {
    const users = [];

    // Create multiple landlords
    for (let i = 0; i < 5; i++) {
      const user = await registerLandlord({
        email: `landlord${i}@example.com`,
        password: `password${i}`,
        name: `Landlord ${i}`,
        phone: `012345678${i}`,
      });
      users.push(user);
    }

    // Verify all users exist and have correct data
    for (let i = 0; i < 5; i++) {
      const dbUser = await prisma.user.findUnique({
        where: { email: `landlord${i}@example.com` },
        include: { landlord: true },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser?.role).toBe('LANDLORD');
      expect(dbUser?.landlord).toBeDefined();
      
      // Verify password
      const isValid = await verifyPassword(
        `password${i}`,
        dbUser!.password
      );
      expect(isValid).toBe(true);
    }
  });
});
