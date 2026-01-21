# Tenant Invitation Flow - Implementation Summary

## Overview
Implemented a new tenant registration and invitation flow where tenants can self-register, and landlords can invite existing tenants to their property management system.

## Changes Made

### 1. Database Schema Updates
**File:** `prisma/schema.prisma`
- Changed `landlordId` field in `Tenant` model to have a default value of empty string (`@default("")`)
- This allows tenants to register without being assigned to a landlord initially
- Migration created: `20260121015850_allow_empty_landlord_id`

### 2. Registration Page Updates
**File:** `app/register/page.tsx`
- Added role selection UI (already existed)
- Added conditional fields for TENANT role:
  - ID Card (CMND/CCCD) - required for tenants
  - Address - required for tenants
- Updated form state to include `idCard` and `address` fields

### 3. Registration API Updates
**File:** `app/api/auth/register/route.ts`
- Updated to support both LANDLORD and TENANT registration
- For TENANT registration:
  - Creates user with TENANT role
  - Creates tenant record with empty `landlordId`
  - Includes `idCard` and `address` fields
- Validation schema updated to include optional `idCard` and `address` fields

### 4. New Tenant Invitation API
**File:** `app/api/tenants/invite/route.ts` (NEW)
- POST endpoint for landlords to invite existing tenants
- Validates:
  - User exists with the provided email
  - User has TENANT role
  - Tenant is not already assigned to another landlord
- Updates tenant's `landlordId` to link them to the inviting landlord

### 5. Tenant Management Page Updates
**File:** `app/landlord/tenants/page.tsx`
- Replaced "Thêm Người Thuê" (Add Tenant) with "Mời Người Thuê" (Invite Tenant)
- Removed create tenant functionality (deprecated)
- Added invite dialog:
  - Simple email input
  - Searches for existing tenant by email
  - Invites them to landlord's management
- Updated `handleCreate` to show deprecation message
- Added new `handleInvite` function

### 6. Tenant API Updates
**File:** `app/api/tenants/route.ts`
- Updated GET endpoint to filter out tenants with empty `landlordId`
- Only returns tenants that belong to the requesting landlord

### 7. Seed Data Updates
**File:** `prisma/seed.ts`
- Added test tenant without landlord: `tenant2@test.com`
- This tenant can be used to test the invitation flow
- Changed tenant creation to use `upsert` to avoid duplicate errors

## New User Flow

### For Tenants:
1. Visit registration page
2. Select "Người Thuê" (Tenant) role
3. Fill in required information:
   - Full Name
   - Email
   - Phone
   - ID Card (CMND/CCCD)
   - Address
   - Password
4. Submit registration
5. **View profile page to get email address**
6. **Share email with landlord** so they can invite you
7. Wait for landlord to invite them
8. Once invited, can access all tenant features

### For Landlords:
1. Login to landlord dashboard
2. Navigate to "Quản Lý Người Thuê" (Tenant Management)
3. Click "Mời Người Thuê" (Invite Tenant)
4. **Ask tenant for their registered email address**
5. Enter tenant's email address
6. System validates and links tenant to landlord
7. Tenant can now be assigned to rooms

## Tenant Profile Page

Tenants can view their profile information at `/tenant/profile`:
- **Name** (editable)
- **Email** (read-only, with copy button) - Share this with landlord
- **Phone** (editable)
- **ID Card** (read-only, with copy button)
- **Address** (editable)
- **Room Information** (if assigned)

The profile page includes:
- Copy buttons for easy sharing of email and ID card
- Clear instructions to share email with landlord
- Visual indication when not yet assigned to a room

## Test Credentials

### Landlord:
- Email: `landlord@test.com`
- Password: `123456`

### Existing Tenant (with landlord):
- Email: `tenant1@test.com`
- Password: `123456`

### Independent Tenant (without landlord):
- Email: `tenant2@test.com`
- Password: `123456`

## API Endpoints

### POST /api/auth/register
Register new user (LANDLORD or TENANT)
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "LANDLORD" | "TENANT",
  "idCard": "string (optional, required for TENANT)",
  "address": "string (optional, required for TENANT)"
}
```

### POST /api/tenants/invite
Invite existing tenant to landlord's management
```json
{
  "landlordId": "string",
  "email": "string"
}
```

## Benefits

1. **Security**: Tenants control their own account credentials
2. **Privacy**: Landlords cannot create accounts on behalf of tenants
3. **Flexibility**: Tenants can register before finding a landlord
4. **Data Integrity**: One tenant account can only be managed by one landlord at a time
5. **User Experience**: Clear separation between registration and invitation
6. **Notifications**: Tenants receive instant notifications when invited by landlords

## Notification System

When a landlord invites a tenant:
1. System creates a notification for the tenant
2. Notification appears in tenant's notification page with "Lời mời mới" badge
3. Unread notification count shows on sidebar with red badge
4. Dashboard displays prominent invitation alert
5. Tenant can mark notification as read after viewing

### Notification Features:
- **Real-time updates**: Notification count refreshes every 30 seconds
- **Visual indicators**: 
  - Red badge on sidebar bell icon
  - Green border on invitation notifications
  - "🎉 Có lời mới!" badge on dashboard
- **Easy management**: One-click mark as read button

## Future Enhancements

1. Add email notification when landlord invites a tenant
2. Add tenant approval flow (tenant must accept invitation)
3. Allow tenants to leave a landlord's management
4. Add search functionality to find tenants by name or phone
5. Add bulk invitation feature for multiple tenants
