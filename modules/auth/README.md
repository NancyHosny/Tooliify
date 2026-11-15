# Module auth

SRS: 10.2 Login · 10.3 First-login reset · 10.4 Forgot password · 10.16 Logout
API: login · logout · refresh · first-login/reset · forget-password · verify · reset (+ profile for token checks)

## Files

| File | Purpose |
|---|---|
| pages/LoginPage.ts | Login form |
| pages/ForgotPasswordPage.ts | Recovery email + OTP screen |
| pages/SetPasswordPage.ts | New password + confirmation (first login) – locators not verified |
| pages/AccountMenu.ts | Logout button + confirmation popup |
| clients/AuthClient.ts | One method per Auth API endpoint |
| (test data) | All data and credentials are in test-data/test-data.ts (root of the project) |
| setup/auth.setup.ts | Log in once and save the session to .auth/merchant.json |
| ui/login.spec.ts | Login valid / invalid / boundary + blocked accounts |
| ui/forgot-password.spec.ts | Forgot password |
| ui/session.spec.ts | Logout, cancel logout, access after logout, unauthenticated access |
| ui/first-login.spec.ts | First login (skipped until FIRST_LOGIN_EMAIL is set) |
| api/auth.api.spec.ts | API tests (skipped until API_URL is set) |

## Skipped on purpose

- Tests with an optional account in .env (first login, expired, suspended) are skipped while the account is empty.
- API tests are skipped while API_URL is empty.

## Not automated (long or risky scenarios)

- Lockout after 5 failed logins in 15 minutes (would lock the only test account).
- OTP expiry and OTP request limits, full password reset with a real email, reset session of 30 minutes.
- Two browsers logged in at the same time (removed: too long for regression).

## Safety

- One real-email wrong login per full run (wrong password test) and one OTP request + one wrong OTP (forgot password test). Max 2 full runs per 30 minutes.
- No test changes the real password. The reset test sends a fake token and then checks the real password still works.
