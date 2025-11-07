# Frontend Authentication Setup for Vercel

## The Issue
Your backend requires authentication (JWT token) for creating meetings. The frontend needs to login first.

## Quick Fix: Update Your API Utility

Replace your `src/lib/api.ts` with this version that handles authentication:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Store token in memory (or localStorage for persistence)
let authToken: string | null = null;

export const api = {
  /**
   * Login to get JWT token
   */
  login: async (password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    
    if (!response.ok) {
      throw new Error('Invalid password');
    }
    
    const data = await response.json();
    authToken = data.token;
    
    // Store in localStorage for persistence across page reloads
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', data.token);
    }
    
    return data.token;
  },

  /**
   * Initialize - Load token from localStorage
   */
  init: () => {
    if (typeof window !== 'undefined') {
      authToken = localStorage.getItem('authToken');
    }
  },

  /**
   * Check if logged in
   */
  isAuthenticated: () => {
    return !!authToken;
  },

  /**
   * Logout
   */
  logout: () => {
    authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  /**
   * GET request with auth
   */
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      credentials: 'include',
    });
    
    if (response.status === 401) {
      api.logout();
      throw new Error('Unauthorized - please login');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },

  /**
   * POST request with auth
   */
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (response.status === 401) {
      api.logout();
      throw new Error('Unauthorized - please login');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  },
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  api.init();
}
```

## Add Login Component

Create `src/components/login-form.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { api } from '@/lib/api'

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await api.login(password)
      alert('Logged in successfully!')
      onSuccess?.()
    } catch (err) {
      setError('Invalid password. Default is "12345"')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Host Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter host password"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Default password: 12345
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
```

## Protect Your Create Meeting Page

Wrap your create meeting form with authentication check:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { LoginForm } from '@/components/login-form'
import { CreateMeetingForm } from '@/components/create-meeting-form'

export default function CreateMeetingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if already logged in
    setIsAuthenticated(api.isAuthenticated())
    setLoading(false)
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />
  }

  return <CreateMeetingForm />
}
```

## Backend Password

Check your `backend/.env` file for the password:

```env
HOST_PASSWORD=12345
```

**Default password is:** `12345`

## Testing

1. **Update** `src/lib/api.ts` with the new version above
2. **Add** login form component
3. **Go to** your Vercel site
4. **Login** with password `12345`
5. **Try creating** a meeting - it should work now!

## Alternative: Quick Test Without Login UI

For testing, you can manually get a token in the browser console:

```javascript
// Login and get token
fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: '12345' })
})
.then(r => r.json())
.then(data => {
  console.log('Token:', data.token)
  localStorage.setItem('authToken', data.token)
  alert('Logged in! Refresh the page.')
})
```

Then refresh the page and try creating a meeting.

---

## Summary

✅ **CORS is working** - request reached backend  
❌ **Missing authentication** - need JWT token  
🔧 **Solution:** Add login functionality to frontend  

The default password is `12345` - use that to login!
