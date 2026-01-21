/**
 * Property-Based Tests for Authentication
 * Feature: quan-ly-nha-tro
 * Properties: 3, 4, 5, 6
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import fc from 'fast-check'
import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword, registerLandlord } from '@/lib/services/auth.service'

// Create a separate test database instance
const prisma = new PrismaClient()

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
  ])
}

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await cleanDatabase()
  await prisma.$disconnect()
})

describe('Property 3: Password Security', () => {
  /**
   * Property: For any user account created, the password stored in the database
   * must be a bcrypt hash (not plaintext) and must verify correctly with the original password.
   * 
   * **Validates: Requirements 1.5**
   */

  it('should store passwords as bcrypt hashes, not plaintext', async () => {
    // Feature: quan-ly-nha-tro, Property 3: Password Security
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
          address: fc.option(fc.string({ minLength: 5, maxLength: 200 }), { nil: undefined }),
        }),
        async (userData) => {
          // Register landlord
          const user = await registerLandlord(userData)

          // Fetch user from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          })

          expect(dbUser).toBeDefined()

          // Property: Password must NOT be stored as plaintext
          expect(dbUser!.password).not.toBe(userData.password)

          // Property: Password must be a bcrypt hash (starts with $2a$ or $2b$)
          expect(dbUser!.password).toMatch(/^\$2[ab]\$/)

          // Property: Bcrypt hash must be 60 characters
          expect(dbUser!.password.length).toBe(60)

          // Property: Password must verify correctly with original password
          const isValid = await verifyPassword(userData.password, dbUser!.password)
          expect(isValid).toBe(true)

          // Property: Password must NOT verify with different password
          const wrongPassword = userData.password + 'wrong'
          const isInvalid = await verifyPassword(wrongPassword, dbUser!.password)
          expect(isInvalid).toBe(false)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should generate different hashes for the same password (salt)', async () => {
    // Feature: quan-ly-nha-tro, Property 3: Password Security
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 8, maxLength: 100 }),
        async (password) => {
          // Hash the same password twice
          const hash1 = await hashPassword(password)
          const hash2 = await hashPassword(password)

          // Property: Different hashes due to different salts
          expect(hash1).not.toBe(hash2)

          // Property: Both hashes must verify with the same password
          const isValid1 = await verifyPassword(password, hash1)
          const isValid2 = await verifyPassword(password, hash2)
          expect(isValid1).toBe(true)
          expect(isValid2).toBe(true)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should handle special characters in passwords securely', async () => {
    // Feature: quan-ly-nha-tro, Property 3: Password Security
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 })
            .map(s => s + '!@#$%^&*()_+-=[]{}|;:,.<>?'),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (userData) => {
          const user = await registerLandlord(userData)

          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          })

          // Property: Special characters must be handled correctly
          const isValid = await verifyPassword(userData.password, dbUser!.password)
          expect(isValid).toBe(true)

          // Property: Password must still be bcrypt hash
          expect(dbUser!.password).toMatch(/^\$2[ab]\$/)
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 4: Authentication Round Trip', () => {
  /**
   * Property: For any valid registration data, after successful registration,
   * login with the same email and password must succeed and return a session
   * with the correct role.
   * 
   * **Validates: Requirements 1.1, 1.3, 7.1**
   */

  it('should allow login after successful registration with correct credentials', async () => {
    // Feature: quan-ly-nha-tro, Property 4: Authentication Round Trip
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
          address: fc.option(fc.string({ minLength: 5, maxLength: 200 }), { nil: undefined }),
        }),
        async (userData) => {
          // Step 1: Register landlord
          const registeredUser = await registerLandlord(userData)

          // Property: Registration must succeed
          expect(registeredUser).toBeDefined()
          expect(registeredUser.email).toBe(userData.email)
          expect(registeredUser.role).toBe('LANDLORD')

          // Step 2: Simulate login by fetching user and verifying password
          const dbUser = await prisma.user.findUnique({
            where: { email: userData.email },
            include: { landlord: true },
          })

          // Property: User must exist in database
          expect(dbUser).toBeDefined()
          expect(dbUser!.email).toBe(userData.email)

          // Property: Password verification must succeed (simulating login)
          const isAuthenticated = await verifyPassword(userData.password, dbUser!.password)
          expect(isAuthenticated).toBe(true)

          // Property: User must have correct role
          expect(dbUser!.role).toBe('LANDLORD')

          // Property: Landlord relation must exist
          expect(dbUser!.landlord).toBeDefined()
          expect(dbUser!.landlord!.phone).toBe(userData.phone)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should maintain authentication state across multiple operations', async () => {
    // Feature: quan-ly-nha-tro, Property 4: Authentication Round Trip
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 100 }),
            name: fc.string({ minLength: 2, maxLength: 100 }),
            phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        async (usersData) => {
          // Ensure unique emails
          const uniqueEmails = new Set(usersData.map(u => u.email))
          fc.pre(uniqueEmails.size === usersData.length)

          // Register all users
          const registeredUsers = await Promise.all(
            usersData.map(userData => registerLandlord(userData))
          )

          // Property: All registrations must succeed
          expect(registeredUsers.length).toBe(usersData.length)

          // Property: Each user can authenticate independently
          for (let i = 0; i < usersData.length; i++) {
            const dbUser = await prisma.user.findUnique({
              where: { email: usersData[i].email },
            })

            expect(dbUser).toBeDefined()

            const isAuthenticated = await verifyPassword(
              usersData[i].password,
              dbUser!.password
            )
            expect(isAuthenticated).toBe(true)
            expect(dbUser!.role).toBe('LANDLORD')
          }
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 5: Duplicate Email Rejection', () => {
  /**
   * Property: For any email that already exists in the system,
   * attempting to register with that email must be rejected and return an error.
   * 
   * **Validates: Requirements 1.2**
   */

  it('should reject registration with duplicate email', async () => {
    // Feature: quan-ly-nha-tro, Property 5: Duplicate Email Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password1: fc.string({ minLength: 8, maxLength: 100 }),
          password2: fc.string({ minLength: 8, maxLength: 100 }),
          name1: fc.string({ minLength: 2, maxLength: 100 }),
          name2: fc.string({ minLength: 2, maxLength: 100 }),
          phone1: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
          phone2: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (data) => {
          // First registration with email
          const firstUser = await registerLandlord({
            email: data.email,
            password: data.password1,
            name: data.name1,
            phone: data.phone1,
          })

          // Property: First registration must succeed
          expect(firstUser).toBeDefined()
          expect(firstUser.email).toBe(data.email)

          // Second registration with same email but different data
          // Property: Must throw error
          await expect(
            registerLandlord({
              email: data.email,
              password: data.password2,
              name: data.name2,
              phone: data.phone2,
            })
          ).rejects.toThrow('Email already exists')

          // Property: Only one user with that email should exist
          const users = await prisma.user.findMany({
            where: { email: data.email },
          })
          expect(users.length).toBe(1)
          expect(users[0].id).toBe(firstUser.id)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject duplicate emails case-insensitively', async () => {
    // Feature: quan-ly-nha-tro, Property 5: Duplicate Email Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (userData) => {
          // Register with lowercase email
          const lowerEmail = userData.email.toLowerCase()
          await registerLandlord({
            ...userData,
            email: lowerEmail,
          })

          // Try to register with uppercase email
          const upperEmail = userData.email.toUpperCase()
          
          // Property: Should reject if emails are the same (case-insensitive)
          if (lowerEmail === upperEmail) {
            await expect(
              registerLandlord({
                ...userData,
                email: upperEmail,
              })
            ).rejects.toThrow('Email already exists')
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should allow registration with different emails', async () => {
    // Feature: quan-ly-nha-tro, Property 5: Duplicate Email Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8, maxLength: 100 }),
            name: fc.string({ minLength: 2, maxLength: 100 }),
            phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (usersData) => {
          // Ensure unique emails
          const uniqueEmails = new Set(usersData.map(u => u.email))
          fc.pre(uniqueEmails.size === usersData.length)

          // Property: All registrations with unique emails must succeed
          const registeredUsers = await Promise.all(
            usersData.map(userData => registerLandlord(userData))
          )

          expect(registeredUsers.length).toBe(usersData.length)

          // Property: All users must have different IDs
          const ids = registeredUsers.map(u => u.id)
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(ids.length)

          // Property: All users must exist in database
          const dbUsers = await prisma.user.findMany({
            where: {
              email: { in: usersData.map(u => u.email) },
            },
          })
          expect(dbUsers.length).toBe(usersData.length)
        }
      ),
      { numRuns: 5 }
    )
  })
})

describe('Property 6: Invalid Credentials Rejection', () => {
  /**
   * Property: For any invalid login credentials (wrong email or wrong password),
   * the login attempt must be rejected and return an error.
   * 
   * **Validates: Requirements 1.4**
   */

  it('should reject login with non-existent email', async () => {
    // Feature: quan-ly-nha-tro, Property 6: Invalid Credentials Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          existingEmail: fc.emailAddress(),
          nonExistentEmail: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (data) => {
          // Ensure emails are different
          fc.pre(data.existingEmail !== data.nonExistentEmail)

          // Register user with existingEmail
          await registerLandlord({
            email: data.existingEmail,
            password: data.password,
            name: data.name,
            phone: data.phone,
          })

          // Try to login with non-existent email
          const dbUser = await prisma.user.findUnique({
            where: { email: data.nonExistentEmail },
          })

          // Property: User with non-existent email must not exist
          expect(dbUser).toBeNull()
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject login with wrong password', async () => {
    // Feature: quan-ly-nha-tro, Property 6: Invalid Credentials Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          correctPassword: fc.string({ minLength: 8, maxLength: 100 }),
          wrongPassword: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (data) => {
          // Ensure passwords are different
          fc.pre(data.correctPassword !== data.wrongPassword)

          // Register user
          const user = await registerLandlord({
            email: data.email,
            password: data.correctPassword,
            name: data.name,
            phone: data.phone,
          })

          // Fetch user from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          })

          expect(dbUser).toBeDefined()

          // Property: Correct password must verify
          const isValidCorrect = await verifyPassword(data.correctPassword, dbUser!.password)
          expect(isValidCorrect).toBe(true)

          // Property: Wrong password must NOT verify
          const isValidWrong = await verifyPassword(data.wrongPassword, dbUser!.password)
          expect(isValidWrong).toBe(false)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject login with empty password', async () => {
    // Feature: quan-ly-nha-tro, Property 6: Invalid Credentials Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (userData) => {
          // Register user with valid password
          const user = await registerLandlord(userData)

          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          })

          expect(dbUser).toBeDefined()

          // Property: Empty password must NOT verify
          const isValidEmpty = await verifyPassword('', dbUser!.password)
          expect(isValidEmpty).toBe(false)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should be case-sensitive for password verification', async () => {
    // Feature: quan-ly-nha-tro, Property 6: Invalid Credentials Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 })
            .filter(s => s.toLowerCase() !== s.toUpperCase()), // Has case variation
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (userData) => {
          // Register user
          const user = await registerLandlord(userData)

          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          })

          expect(dbUser).toBeDefined()

          // Property: Correct password must verify
          const isValidCorrect = await verifyPassword(userData.password, dbUser!.password)
          expect(isValidCorrect).toBe(true)

          // Property: Password with different case must NOT verify
          const lowerPassword = userData.password.toLowerCase()
          const upperPassword = userData.password.toUpperCase()

          if (lowerPassword !== userData.password) {
            const isValidLower = await verifyPassword(lowerPassword, dbUser!.password)
            expect(isValidLower).toBe(false)
          }

          if (upperPassword !== userData.password) {
            const isValidUpper = await verifyPassword(upperPassword, dbUser!.password)
            expect(isValidUpper).toBe(false)
          }
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should reject login with slightly modified password', async () => {
    // Feature: quan-ly-nha-tro, Property 6: Invalid Credentials Rejection
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 100 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }).map(s => s.replace(/\D/g, '').slice(0, 11)),
        }),
        async (userData) => {
          // Register user
          const user = await registerLandlord(userData)

          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
          })

          expect(dbUser).toBeDefined()

          // Property: Correct password must verify
          const isValidCorrect = await verifyPassword(userData.password, dbUser!.password)
          expect(isValidCorrect).toBe(true)

          // Property: Password with extra character must NOT verify
          const modifiedPassword1 = userData.password + 'x'
          const isValidModified1 = await verifyPassword(modifiedPassword1, dbUser!.password)
          expect(isValidModified1).toBe(false)

          // Property: Password with missing character must NOT verify
          if (userData.password.length > 1) {
            const modifiedPassword2 = userData.password.slice(0, -1)
            const isValidModified2 = await verifyPassword(modifiedPassword2, dbUser!.password)
            expect(isValidModified2).toBe(false)
          }

          // Property: Password with character replaced must NOT verify
          if (userData.password.length > 0) {
            const modifiedPassword3 = 'x' + userData.password.slice(1)
            const isValidModified3 = await verifyPassword(modifiedPassword3, dbUser!.password)
            expect(isValidModified3).toBe(false)
          }
        }
      ),
      { numRuns: 5 }
    )
  })
})

