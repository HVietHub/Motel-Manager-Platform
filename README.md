# HouseSea

HouseSea is a web-based rental property management platform for landlords, tenants, and administrators. The application centralizes building operations, room occupancy, tenant onboarding, contracts, billing, maintenance requests, community communication, analytics, and subscription payments in a single Next.js application.

## Overview

The platform is designed for rental businesses that need a structured workflow from property setup to monthly operations:

- Landlords manage buildings, rooms, tenants, contracts, invoices, notifications, maintenance requests, and reports.
- Tenants access room information, contracts, invoices, notifications, maintenance requests, and community posts.
- Administrators monitor users and platform-level activity.
- Subscription payments are integrated through PayOS.
- Data is stored in PostgreSQL and accessed through Prisma ORM.

## Core Features

### Landlord workspace

- Dashboard with operational metrics.
- Building and room management.
- Building-level electricity pricing and configurable water billing:
  - fixed monthly water fee;
  - metered water billing by cubic meter.
- Monthly surcharges per building, such as parking, trash, internet, elevator, or shared cleaning fees.
- Tenant management with invitation and room assignment workflows.
- Contract management, including contract file upload.
- Invoice creation and payment tracking.
- Maintenance request tracking and status updates.
- Broadcast notifications to tenants.
- Community posts scoped to a landlord's tenant network.
- Reports, analytics, trends, predictions, and recommendations.
- Subscription plan purchase flow through PayOS.

### Tenant workspace

- Personal dashboard.
- Room and building information.
- Contract access.
- Monthly invoice tracking.
- Notification center.
- Maintenance request submission.
- Community feed participation.
- Profile management.

### Admin workspace

- Admin dashboard.
- User management.
- Platform analytics endpoints.

## Technology Stack

- Framework: Next.js 16 with App Router
- Language: TypeScript
- UI: React 19, Tailwind CSS, Radix UI primitives, Lucide icons
- Forms and validation: React Hook Form, Zod
- Authentication: NextAuth.js
- Database: PostgreSQL
- ORM: Prisma
- Payments: PayOS
- AI integration: Google Generative AI
- Storage integration: Supabase and Supabase S3-compatible storage
- Testing: Jest
- Deployment: Vercel

## Project Structure

```text
.
├── app/
│   ├── admin/                 # Admin pages
│   ├── api/                   # Route handlers for application APIs
│   ├── landlord/              # Landlord dashboard and management pages
│   ├── tenant/                # Tenant dashboard and self-service pages
│   ├── community/             # Community post detail pages
│   ├── login/                 # Authentication entry point
│   └── register/              # Registration flow
├── components/
│   ├── forms/                 # Reusable form components
│   ├── layout/                # Layout components
│   └── ui/                    # Shared UI primitives
├── hooks/                     # Client-side React hooks
├── lib/
│   ├── constants/             # Application constants and plan limits
│   ├── services/              # Domain services and business logic
│   ├── supabase/              # Supabase integration helpers
│   ├── prisma.ts              # Prisma client singleton
│   └── payos.ts               # PayOS client factory
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Optional seed script
├── public/                    # Static assets
├── tests/                     # Test suites
├── vercel.json                # Vercel deployment configuration
└── package.json
```

## Domain Model

The Prisma schema models the main rental-management workflow:

- `User`: shared authentication identity for landlords and tenants.
- `Landlord`: rental business owner profile and subscription plan.
- `Tenant`: tenant profile, invitation state, assigned room, invoices, contracts, and maintenance requests.
- `Building`: property grouping with utility pricing and water billing mode.
- `BuildingSurcharge`: recurring building-level monthly fees.
- `Room`: room-level rental information and occupancy status.
- `Contract`: rental contract metadata and uploaded file information.
- `Invoice`: monthly billing record for rent, electricity, water, services, and other charges.
- `MaintenanceRequest`: repair or support requests from tenants.
- `Notification`: tenant notifications from landlords.
- `Post`, `Like`, `Comment`, `Share`: scoped community feed.
- `SubscriptionPayment`: PayOS subscription payment tracking.
- `AnalyticsCache` and `AnalyticsAuditLog`: analytics caching and audit records.

## Environment Variables

Create a `.env` file from `.env.example` and provide the required values for your environment.

Required groups:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

GEMINI_API_KEY="..."

PAYOS_CLIENT_ID="..."
PAYOS_API_KEY="..."
PAYOS_CHECKSUM_KEY="..."

NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_PUBLISHABLE_KEY="..."
SUPABASE_SECRET_KEY="..."

SUPABASE_S3_ACCESS_KEY_ID="..."
SUPABASE_S3_SECRET_ACCESS_KEY="..."
SUPABASE_S3_ENDPOINT="..."
SUPABASE_S3_REGION="..."
```

Do not commit real environment values to source control.

## Local Development

### Prerequisites

- Node.js compatible with the project dependencies.
- npm.
- PostgreSQL database.
- PayOS credentials if testing subscription payments.
- Supabase credentials if testing storage or related integrations.

### Install dependencies

```bash
npm install
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Sync database schema

For local development or controlled environments:

```bash
npx prisma db push
```

### Run the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev            # Start the Next.js development server
npm run build          # Build the production application
npm run start          # Start the production server
npm run lint           # Run ESLint
npm run test           # Run Jest tests
npm run test:watch     # Run Jest in watch mode
npm run test:coverage  # Generate Jest coverage report
npm run vercel-build   # Generate Prisma Client and build for Vercel
```

Useful Prisma commands:

```bash
npx prisma generate    # Generate Prisma Client
npx prisma db push     # Push schema changes to the configured database
npx prisma studio      # Inspect and edit database records locally
```

## Deployment

The project is configured for Vercel deployment.

`vercel.json` defines:

```json
{
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

Recommended deployment checklist:

1. Configure all required environment variables in Vercel.
2. Ensure the production database schema is up to date with Prisma.
3. Deploy to production.
4. Verify PayOS checkout, webhook, and payment confirmation flows.
5. Verify file upload and Supabase-related flows if enabled.

Example production deployment using Vercel CLI:

```bash
npx vercel deploy --prod
```

## Quality Checks

Before shipping changes, run:

```bash
npx tsc --noEmit
npm run lint
npm run test
```

If ESLint scans generated build output, remove generated folders such as `.next` from the working tree or ensure they are excluded by the ESLint configuration.

## Security Notes

- Keep all credentials in environment variables.
- Never commit `.env` files or production secrets.
- Treat PayOS, Supabase, database, and NextAuth secrets as sensitive values.
- Validate all server-side inputs before database writes.
- Use landlord and tenant ownership checks when accessing scoped resources.

## License

This project is private and proprietary unless a license is added explicitly.
