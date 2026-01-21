/**
 * Property-Based Tests for Auto-Generated Fields
 * Feature: quan-ly-nha-tro
 * Property 39: Auto-generated ID and Timestamp
 * Validates: Requirements 21.4
 */

import { describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import fc from 'fast-check'
import { PrismaClient } from '@prisma/client'

// Create a separate test database instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
    },
  },
})

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

describe('Property 39: Auto-generated ID and Timestamp', () => {
  /**
   * Property: For any entity created, the entity must have a unique id
   * and createdAt timestamp that are automatically generated.
   */

  it('should auto-generate unique id and createdAt for User entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          role: fc.constantFrom('LANDLORD', 'TENANT'),
        }),
        async (userData) => {
          const beforeCreate = new Date()
          
          const user = await prisma.user.create({
            data: userData,
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(user.id).toBeDefined()
          expect(typeof user.id).toBe('string')
          expect(user.id.length).toBeGreaterThan(0)

          // Property: createdAt must be auto-generated
          expect(user.createdAt).toBeDefined()
          expect(user.createdAt).toBeInstanceOf(Date)
          
          // Property: createdAt should be between before and after creation
          expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())

          // Property: updatedAt must be auto-generated
          expect(user.updatedAt).toBeDefined()
          expect(user.updatedAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 10 }
    )
  })

  it('should auto-generate unique id and createdAt for Building entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          buildingName: fc.string({ minLength: 2, maxLength: 100 }),
          address: fc.string({ minLength: 5, maxLength: 200 }),
        }),
        async (data) => {
          // Create landlord first
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const beforeCreate = new Date()

          const building = await prisma.building.create({
            data: {
              landlordId: landlord.id,
              name: data.buildingName,
              address: data.address,
            },
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(building.id).toBeDefined()
          expect(typeof building.id).toBe('string')
          expect(building.id.length).toBeGreaterThan(0)
          expect(building.id).not.toBe(landlord.id)
          expect(building.id).not.toBe(user.id)

          // Property: createdAt must be auto-generated
          expect(building.createdAt).toBeDefined()
          expect(building.createdAt).toBeInstanceOf(Date)
          expect(building.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(building.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())

          // Property: updatedAt must be auto-generated
          expect(building.updatedAt).toBeDefined()
          expect(building.updatedAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should auto-generate unique id and createdAt for Room entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          buildingName: fc.string({ minLength: 2, maxLength: 100 }),
          address: fc.string({ minLength: 5, maxLength: 200 }),
          roomNumber: fc.string({ minLength: 1, maxLength: 10 }),
          area: fc.float({ min: 10, max: 200 }),
          price: fc.float({ min: 1000000, max: 50000000 }),
        }),
        async (data) => {
          // Create landlord and building first
          const user = await prisma.user.create({
            data: {
              email: data.email,
              password: data.password,
              name: data.name,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: user.id,
              phone: data.phone,
            },
          })

          const building = await prisma.building.create({
            data: {
              landlordId: landlord.id,
              name: data.buildingName,
              address: data.address,
            },
          })

          const beforeCreate = new Date()

          const room = await prisma.room.create({
            data: {
              buildingId: building.id,
              roomNumber: data.roomNumber,
              area: data.area,
              price: data.price,
            },
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(room.id).toBeDefined()
          expect(typeof room.id).toBe('string')
          expect(room.id.length).toBeGreaterThan(0)
          expect(room.id).not.toBe(building.id)
          expect(room.id).not.toBe(landlord.id)
          expect(room.id).not.toBe(user.id)

          // Property: createdAt must be auto-generated
          expect(room.createdAt).toBeDefined()
          expect(room.createdAt).toBeInstanceOf(Date)
          expect(room.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(room.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())

          // Property: updatedAt must be auto-generated
          expect(room.updatedAt).toBeDefined()
          expect(room.updatedAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should auto-generate unique id and createdAt for Contract entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          landlordEmail: fc.emailAddress(),
          tenantEmail: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          landlordName: fc.string({ minLength: 2, maxLength: 100 }),
          tenantName: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          buildingName: fc.string({ minLength: 2, maxLength: 100 }),
          address: fc.string({ minLength: 5, maxLength: 200 }),
          roomNumber: fc.string({ minLength: 1, maxLength: 10 }),
          area: fc.float({ min: 10, max: 200 }),
          price: fc.float({ min: 1000000, max: 50000000 }),
          daysFromNow: fc.integer({ min: 1, max: 365 }),
          contractDays: fc.integer({ min: 30, max: 730 }),
        }),
        async (data) => {
          fc.pre(data.landlordEmail !== data.tenantEmail)

          // Create landlord
          const landlordUser = await prisma.user.create({
            data: {
              email: data.landlordEmail,
              password: data.password,
              name: data.landlordName,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: landlordUser.id,
              phone: data.phone,
            },
          })

          const building = await prisma.building.create({
            data: {
              landlordId: landlord.id,
              name: data.buildingName,
              address: data.address,
            },
          })

          const room = await prisma.room.create({
            data: {
              buildingId: building.id,
              roomNumber: data.roomNumber,
              area: data.area,
              price: data.price,
            },
          })

          // Create tenant
          const tenantUser = await prisma.user.create({
            data: {
              email: data.tenantEmail,
              password: data.password,
              name: data.tenantName,
              role: 'TENANT',
            },
          })

          const tenant = await prisma.tenant.create({
            data: {
              userId: tenantUser.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const beforeCreate = new Date()
          const startDate = new Date(Date.now() + data.daysFromNow * 24 * 60 * 60 * 1000)
          const endDate = new Date(startDate.getTime() + data.contractDays * 24 * 60 * 60 * 1000)

          const contract = await prisma.contract.create({
            data: {
              roomId: room.id,
              tenantId: tenant.id,
              startDate,
              endDate,
              rentAmount: data.price,
            },
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(contract.id).toBeDefined()
          expect(typeof contract.id).toBe('string')
          expect(contract.id.length).toBeGreaterThan(0)
          expect(contract.id).not.toBe(room.id)
          expect(contract.id).not.toBe(tenant.id)

          // Property: createdAt must be auto-generated
          expect(contract.createdAt).toBeDefined()
          expect(contract.createdAt).toBeInstanceOf(Date)
          expect(contract.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(contract.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())

          // Property: updatedAt must be auto-generated
          expect(contract.updatedAt).toBeDefined()
          expect(contract.updatedAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 3 }
    )
  })

  it('should auto-generate unique id and createdAt for Invoice entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          month: fc.integer({ min: 1, max: 12 }),
          year: fc.integer({ min: 2024, max: 2030 }),
          rentAmount: fc.float({ min: 1000000, max: 50000000 }),
          electricityAmount: fc.float({ min: 0, max: 5000000 }),
          waterAmount: fc.float({ min: 0, max: 1000000 }),
          uniqueId: fc.uuid(), // Add unique ID to ensure unique emails
        }),
        async (data) => {
          // Create tenant with unique email
          const tenantEmail = `${data.uniqueId}-${data.email}`
          const landlordEmail = `landlord-${data.uniqueId}-${data.email}`

          const user = await prisma.user.create({
            data: {
              email: tenantEmail,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlordUser = await prisma.user.create({
            data: {
              email: landlordEmail,
              password: data.password,
              name: `Landlord ${data.name}`,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: landlordUser.id,
              phone: data.phone,
            },
          })

          const tenant = await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const beforeCreate = new Date()

          const invoice = await prisma.invoice.create({
            data: {
              tenantId: tenant.id,
              month: data.month,
              year: data.year,
              rentAmount: data.rentAmount,
              electricityAmount: data.electricityAmount,
              waterAmount: data.waterAmount,
              totalAmount: data.rentAmount + data.electricityAmount + data.waterAmount,
            },
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(invoice.id).toBeDefined()
          expect(typeof invoice.id).toBe('string')
          expect(invoice.id.length).toBeGreaterThan(0)
          expect(invoice.id).not.toBe(tenant.id)
          expect(invoice.id).not.toBe(user.id)

          // Property: createdAt must be auto-generated
          expect(invoice.createdAt).toBeDefined()
          expect(invoice.createdAt).toBeInstanceOf(Date)
          expect(invoice.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(invoice.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())

          // Property: updatedAt must be auto-generated
          expect(invoice.updatedAt).toBeDefined()
          expect(invoice.updatedAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should auto-generate unique id and createdAt for Notification entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          title: fc.string({ minLength: 5, maxLength: 100 }),
          message: fc.string({ minLength: 10, maxLength: 500 }),
          uniqueId: fc.uuid(),
        }),
        async (data) => {
          // Create tenant with unique email
          const tenantEmail = `${data.uniqueId}-${data.email}`
          const landlordEmail = `landlord-${data.uniqueId}-${data.email}`

          const user = await prisma.user.create({
            data: {
              email: tenantEmail,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const landlordUser = await prisma.user.create({
            data: {
              email: landlordEmail,
              password: data.password,
              name: `Landlord ${data.name}`,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: landlordUser.id,
              phone: data.phone,
            },
          })

          const tenant = await prisma.tenant.create({
            data: {
              userId: user.id,
              landlordId: landlord.id,
              phone: data.phone,
            },
          })

          const beforeCreate = new Date()

          const notification = await prisma.notification.create({
            data: {
              tenantId: tenant.id,
              title: data.title,
              message: data.message,
            },
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(notification.id).toBeDefined()
          expect(typeof notification.id).toBe('string')
          expect(notification.id.length).toBeGreaterThan(0)
          expect(notification.id).not.toBe(tenant.id)
          expect(notification.id).not.toBe(user.id)

          // Property: createdAt must be auto-generated
          expect(notification.createdAt).toBeDefined()
          expect(notification.createdAt).toBeInstanceOf(Date)
          expect(notification.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(notification.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())
        }
      ),
      { numRuns: 5 }
    )
  })

  it('should auto-generate unique id and createdAt for MaintenanceRequest entities', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          email: fc.emailAddress(),
          password: fc.string({ minLength: 8 }),
          name: fc.string({ minLength: 2, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 11 }),
          buildingName: fc.string({ minLength: 2, maxLength: 100 }),
          address: fc.string({ minLength: 5, maxLength: 200 }),
          roomNumber: fc.string({ minLength: 1, maxLength: 10 }),
          area: fc.float({ min: 10, max: 200 }),
          price: fc.float({ min: 1000000, max: 50000000 }),
          title: fc.string({ minLength: 5, maxLength: 100 }),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          uniqueId: fc.uuid(),
        }),
        async (data) => {
          // Create landlord, building, room, and tenant with unique emails
          const landlordEmail = `landlord-${data.uniqueId}-${data.email}`
          const tenantEmail = `${data.uniqueId}-${data.email}`

          const landlordUser = await prisma.user.create({
            data: {
              email: landlordEmail,
              password: data.password,
              name: `Landlord ${data.name}`,
              role: 'LANDLORD',
            },
          })

          const landlord = await prisma.landlord.create({
            data: {
              userId: landlordUser.id,
              phone: data.phone,
            },
          })

          const building = await prisma.building.create({
            data: {
              landlordId: landlord.id,
              name: data.buildingName,
              address: data.address,
            },
          })

          const room = await prisma.room.create({
            data: {
              buildingId: building.id,
              roomNumber: data.roomNumber,
              area: data.area,
              price: data.price,
            },
          })

          const tenantUser = await prisma.user.create({
            data: {
              email: tenantEmail,
              password: data.password,
              name: data.name,
              role: 'TENANT',
            },
          })

          const tenant = await prisma.tenant.create({
            data: {
              userId: tenantUser.id,
              landlordId: landlord.id,
              phone: data.phone,
              roomId: room.id,
            },
          })

          const beforeCreate = new Date()

          const maintenanceRequest = await prisma.maintenanceRequest.create({
            data: {
              tenantId: tenant.id,
              roomId: room.id,
              title: data.title,
              description: data.description,
            },
          })

          const afterCreate = new Date()

          // Property: id must be auto-generated and unique
          expect(maintenanceRequest.id).toBeDefined()
          expect(typeof maintenanceRequest.id).toBe('string')
          expect(maintenanceRequest.id.length).toBeGreaterThan(0)
          expect(maintenanceRequest.id).not.toBe(tenant.id)
          expect(maintenanceRequest.id).not.toBe(room.id)

          // Property: createdAt must be auto-generated
          expect(maintenanceRequest.createdAt).toBeDefined()
          expect(maintenanceRequest.createdAt).toBeInstanceOf(Date)
          expect(maintenanceRequest.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime())
          expect(maintenanceRequest.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime())

          // Property: updatedAt must be auto-generated
          expect(maintenanceRequest.updatedAt).toBeDefined()
          expect(maintenanceRequest.updatedAt).toBeInstanceOf(Date)
        }
      ),
      { numRuns: 3 }
    )
  })

  it('should generate unique IDs across multiple entities of the same type', async () => {
    // Feature: quan-ly-nha-tro, Property 39: Auto-generated ID and Timestamp
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            email: fc.emailAddress(),
            password: fc.string({ minLength: 8 }),
            name: fc.string({ minLength: 2, maxLength: 100 }),
          }),
          { minLength: 2, maxLength: 10 }
        ),
        async (usersData) => {
          // Ensure unique emails
          const uniqueEmails = new Set(usersData.map(u => u.email))
          fc.pre(uniqueEmails.size === usersData.length)

          const users = await Promise.all(
            usersData.map(userData =>
              prisma.user.create({
                data: {
                  ...userData,
                  role: 'TENANT',
                },
              })
            )
          )

          // Property: All IDs must be unique
          const ids = users.map(u => u.id)
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(ids.length)

          // Property: All createdAt timestamps must be defined
          users.forEach(user => {
            expect(user.createdAt).toBeDefined()
            expect(user.createdAt).toBeInstanceOf(Date)
          })
        }
      ),
      { numRuns: 5 }
    )
  })
})
