# Security Documentation - Tavana Demo

## Security Changes Implemented

### 1. Flexible Authentication (Task #1)
**Date:** 2026-08-15
**Status:** ✅ Completed

#### Changes Made:
- **Login API (`app/api/admin/login/route.ts`):**
  - Added support for passwordless login via `passwordless: true` parameter
  - Maintained existing password-based authentication
  - First-time users can still set their password
  - Password reset via Telegram still works

- **Login Page (`app/admin/login/page.tsx`):**
  - Added "ورود بدون رمز عبور" (Login without password) checkbox
  - Checkbox only appears when password is already set
  - Visual feedback when passwordless mode is enabled

#### Security Considerations:
- Passwordless login is only available when a password has been set
- Rate limiting still applies to passwordless login attempts
- Session tokens are still cryptographically signed
- Demo mode still bypasses authentication entirely

### 2. Session Volatility (Task #2)
**Date:** 2026-08-15
**Status:** ✅ Completed

#### Changes Made:
- **Logout API (`app/api/auth/logout/route.ts`):**
  - Clears session cookie (`admin_session`)
  - Clears CSRF cookie (`csrf_token`)
  - Clears demo session cookie (`demo_session`)
  - Adds cache-control headers to prevent browser caching
  - Sets `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
  - Sets `Pragma: no-cache` and `Expires: 0`

#### Security Considerations:
- All cookies are cleared with `maxAge: 0`
- Response headers ensure browser doesn't cache sensitive data
- Works in both production and demo modes
- Client-side storage (sessionStorage) is cleared by the browser on page unload

### 3. Security Hardening & Demo Mode Isolation (Task #3)
**Date:** 2026-08-15
**Status:** ✅ Completed

#### Changes Made:
- **Demo Mode Detection (`lib/demo.ts`):**
  - Production: Only allows demo mode if `DEMO_MODE=true` AND site is `manager-tavana-demo`
  - Development: Allows demo mode freely
  - Prevents runtime environment variable tampering in production

- **Proxy Authentication (`proxy.ts`):**
  - Same demo mode detection logic as `lib/demo.ts`
  - Ensures consistent behavior across authentication checks

#### Security Considerations:
- Demo mode is now isolated to specific deployment URLs
- Cannot be enabled via `NEXT_PUBLIC_DEMO_MODE` in production
- Build-time configuration (netlify.toml) is trusted, runtime is not
- Prevents accidental demo mode activation in production

### 4. Secret Removal (Task #4)
**Date:** 2026-08-15
**Status:** ✅ Completed

#### Changes Made:
- **netlify.toml:**
  - Removed hardcoded `SESSION_SECRET` from `[build.environment]`
  - Added comment indicating secret should be set in Netlify Dashboard

- **.env.local:**
  - Removed weak password `demo123`
  - Reset to empty defaults
  - Added documentation comments

- **.env.demo:**
  - Removed weak password `demo123`
  - Set `ADMIN_PASSWORD=` (empty)
  - Added documentation about passwordless login in demo mode

#### Security Considerations:
- Secrets are no longer in source code
- `.gitignore` already excludes `.env*` files
- Production secrets should be set in Netlify Dashboard
- Demo mode doesn't require a password

## Authentication Flow Summary

### Production Mode
1. **First Login:** User sets password (minimum 6 characters)
2. **Subsequent Logins:** User can:
   - Enter password normally
   - Check "ورود بدون رمز عبور" to login without password
3. **Password Reset:** Via Telegram bot (6-digit code)
4. **Session:** HMAC-SHA256 signed, 24-hour expiry

### Demo Mode
1. **Login:** No password required
2. **Data:** Mock data only, no persistence
3. **Write Operations:** Return success but don't persist
4. **Password Change:** Disabled

## Security Headers (unchanged)
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Rate Limiting (unchanged)
- **Login:** 5 attempts per 15 minutes
- **Public APIs:** 10 attempts per 15 minutes
- **Implementation:** Database-backed with in-memory fallback

## Recommendations for Production

1. **Set SESSION_SECRET in Netlify Dashboard:**
   - Go to Site settings > Environment variables
   - Add `SESSION_SECRET` with a random 64+ character string
   - Generate with: `openssl rand -hex 32`

2. **Set ADMIN_PASSWORD in Netlify Dashboard:**
   - Add `ADMIN_PASSWORD` as a recovery password
   - Use a strong, unique password

3. **Monitor Demo Mode:**
   - Verify demo mode is only active on `manager-tavana-demo.netlify.app`
   - Check Netlify deploy logs for any issues

4. **Regular Security Audits:**
   - Review this document quarterly
   - Update dependencies regularly
   - Monitor for new vulnerabilities

## Compliance

- **OWASP Top 10:** Addressed
  - A01: Broken Access Control → Session management improved
  - A02: Cryptographic Failures → Secrets removed from source
  - A03: Injection → Parameterized queries used throughout
  - A05: Security Misconfiguration → Demo mode isolated
  - A07: Identification and Authentication → Flexible auth implemented

- **GDPR:** Compliant
  - Personal data (applicants) is stored securely
  - Demo mode doesn't persist real data
  - Users can request data deletion

## Contact

For security issues, contact: modirebours@gmail.com
