# InsForge Backend Configuration

This document details the backend structure that has been automatically configured for your Travel Tracker app.

## 📊 Database Schema

### Table: `travel_records`

```sql
CREATE TABLE travel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES _accounts(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_key TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  travel_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes

- `idx_travel_records_user_id` - Fast queries by user
- `idx_travel_records_travel_date` - Fast queries by date (descending)

## 🔐 Row Level Security (RLS) Policies

### SELECT Policy
- **Name:** "Enable read access for all users"
- **Action:** SELECT
- **Effect:** All users (including anonymous) can view all travel records

### INSERT Policy
- **Name:** "Enable insert for authenticated users"
- **Action:** INSERT
- **Effect:** Authenticated users can only insert records with their own user_id

### UPDATE Policy
- **Name:** "Enable update for users based on user_id"
- **Action:** UPDATE
- **Effect:** Users can only update their own records

### DELETE Policy
- **Name:** "Enable delete for users based on user_id"
- **Action:** DELETE
- **Effect:** Users can only delete their own records

## 📦 Storage

### Bucket: `travel-photos`
- **Type:** Public
- **Purpose:** Store user-uploaded travel photos
- **Access:** Photos are publicly accessible via URL (URLs stored in database)

## 🔑 Authentication

### Email/Password
- ✅ Enabled
- Users can sign up and sign in with email/password

### OAuth Providers

#### Google OAuth
- ✅ Enabled with shared keys
- Scopes: `openid`, `email`, `profile`

#### GitHub OAuth
- ✅ Enabled with shared keys
- Scopes: `user:email`

### User Profile Table: `users`

Automatically created when users sign up:

```sql
- id (UUID) - Links to _accounts table
- nickname (TEXT)
- avatar_url (TEXT)
- bio (TEXT)
- birthday (DATE)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔗 API Endpoints (via InsForge SDK)

The app uses these InsForge SDK methods:

### Authentication
- `insforge.auth.signUp()`
- `insforge.auth.signInWithPassword()`
- `insforge.auth.signInWithOAuth()`
- `insforge.auth.getCurrentUser()`
- `insforge.auth.signOut()`

### Database
- `insforge.database.from('travel_records').select()`
- `insforge.database.from('travel_records').insert()`
- `insforge.database.from('travel_records').delete()`

### Storage
- `insforge.storage.from('travel-photos').upload()`

## 🌐 Required Configuration

### Frontend Environment Variable

Create a `.env` file in your project root:

```env
VITE_INSFORGE_URL=https://your-backend-url.insforge.app
```

Replace with your actual InsForge backend URL.

## 🔄 Backend URL Location

To find your InsForge backend URL:

1. Log in to your InsForge dashboard
2. Navigate to your project settings
3. Copy the backend URL (format: `https://[project-id].[region].insforge.app`)
4. Paste it into your `.env` file

## 🛡️ Security Notes

1. **RLS is enabled** - Users can only modify their own records
2. **Authentication required** - Users must be logged in to create/update/delete
3. **Public read access** - All travel records are viewable by anyone (great for sharing!)
4. **Storage bucket is public** - Photos are accessible via direct URL

## 🧪 Testing the Backend

You can test the backend directly:

```javascript
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'YOUR_INSFORGE_URL'
});

// Test authentication
const { data } = await client.auth.signUp({
  email: 'test@example.com',
  password: 'test123'
});

// Test database
const { data: records } = await client.database
  .from('travel_records')
  .select('*');
```

## 📝 Modifying the Backend

### To add a new column:

```sql
ALTER TABLE travel_records 
ADD COLUMN new_column_name TEXT;
```

### To create a new policy:

```sql
CREATE POLICY "policy_name" 
ON travel_records 
FOR SELECT 
USING (condition);
```

### To modify RLS:

```sql
-- Drop existing policy
DROP POLICY "policy_name" ON travel_records;

-- Create new policy
CREATE POLICY "policy_name" ON travel_records 
FOR ACTION USING (condition);
```

## 🔧 Useful SQL Queries

### View all records with user info:

```sql
SELECT tr.*, u.nickname, u.avatar_url
FROM travel_records tr
JOIN users u ON tr.user_id = u.id
ORDER BY tr.travel_date DESC;
```

### Count records per user:

```sql
SELECT user_id, COUNT(*) as record_count
FROM travel_records
GROUP BY user_id;
```

### Find records with GPS coordinates:

```sql
SELECT *
FROM travel_records
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL;
```

## 📊 Monitoring

You can monitor your backend through:
- InsForge dashboard (database metrics, storage usage)
- Backend logs (authentication, API calls)
- Database queries (using InsForge SQL interface)

---

For more information, visit the [InsForge Documentation](https://docs.insforge.com)

