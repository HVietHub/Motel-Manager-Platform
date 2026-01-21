# Tenant Invitation Flow Diagram

## Old Flow (Deprecated)
```
Landlord → Creates Tenant Account → Assigns Room
           (with auto-generated password)
```

**Problems:**
- Landlord controls tenant credentials
- Security concerns
- Tenant has no control over their account

## New Flow (Implemented)
```
┌─────────────────────────────────────────────────────────────┐
│                    TENANT REGISTRATION                       │
│                                                              │
│  Tenant → Register Page → Select "Người Thuê" Role          │
│         → Fill Information (Name, Email, Phone, ID, Address) │
│         → Create Account                                     │
│         → landlordId = "" (empty)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LANDLORD INVITATION                       │
│                                                              │
│  Landlord → Login → Tenant Management Page                  │
│          → Click "Mời Người Thuê" (Invite Tenant)          │
│          → Enter Tenant Email                               │
│          → System validates:                                │
│             • Email exists                                  │
│             • User is TENANT role                           │
│             • Not already assigned to another landlord      │
│          → Update tenant.landlordId = landlord.id          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    ROOM ASSIGNMENT                           │
│                                                              │
│  Landlord → Tenant Management Page                          │
│          → Select Tenant                                    │
│          → Click "Gán Phòng" (Assign Room)                 │
│          → Select Available Room                            │
│          → Tenant assigned to room                          │
└─────────────────────────────────────────────────────────────┘
```

## Database State Changes

### After Tenant Registration:
```
User {
  email: "tenant@example.com"
  role: "TENANT"
  tenant: {
    landlordId: ""  ← Empty, not yet invited
    phone: "0912345678"
    idCard: "123456789"
    address: "123 Street"
    roomId: null
  }
}
```

### After Landlord Invitation:
```
User {
  email: "tenant@example.com"
  role: "TENANT"
  tenant: {
    landlordId: "landlord_123"  ← Now linked to landlord
    phone: "0912345678"
    idCard: "123456789"
    address: "123 Street"
    roomId: null  ← Still not assigned to room
  }
}
```

### After Room Assignment:
```
User {
  email: "tenant@example.com"
  role: "TENANT"
  tenant: {
    landlordId: "landlord_123"
    phone: "0912345678"
    idCard: "123456789"
    address: "123 Street"
    roomId: "room_456"  ← Now assigned to room
  }
}
```

## API Flow

### 1. Tenant Self-Registration
```
POST /api/auth/register
{
  "fullName": "Nguyễn Văn A",
  "email": "tenant@example.com",
  "phone": "0912345678",
  "password": "securepassword",
  "role": "TENANT",
  "idCard": "123456789",
  "address": "123 Street"
}

Response: 201 Created
{
  "message": "Đăng ký thành công",
  "user": {
    "id": "user_123",
    "email": "tenant@example.com",
    "name": "Nguyễn Văn A",
    "role": "TENANT"
  }
}
```

### 2. Landlord Invites Tenant
```
POST /api/tenants/invite
{
  "landlordId": "landlord_123",
  "email": "tenant@example.com"
}

Response: 200 OK
{
  "message": "Mời người thuê thành công",
  "tenant": {
    "id": "tenant_456",
    "landlordId": "landlord_123",
    "user": {
      "name": "Nguyễn Văn A",
      "email": "tenant@example.com"
    }
  }
}
```

### 3. Landlord Assigns Room
```
POST /api/tenants/{tenantId}/assign-room
{
  "landlordId": "landlord_123",
  "roomId": "room_789"
}

Response: 200 OK
{
  "message": "Gán phòng thành công"
}
```

## Benefits

✅ **Security**: Tenants control their own credentials
✅ **Privacy**: No auto-generated passwords shared
✅ **Flexibility**: Tenants can register anytime
✅ **Control**: Landlords can only invite, not create accounts
✅ **Data Integrity**: One tenant = one landlord at a time
