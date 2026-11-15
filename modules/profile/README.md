# Module profile

SRS: 10.15 Profile
API: GET /api/v1/merchant/profile · PUT /api/v1/merchant/profile · PUT /api/v1/merchant/profile/password
UI: /ar/profile (data is shown as text; editing happens in two popups)

## Files

| File | Purpose |
|---|---|
| pages/ProfilePage.ts | Profile page: email, "تعديل البيانات", "تعديل كلمة المرور" |
| pages/EditProfileModal.ts | Edit popup: name, email, phone, save, close |
| pages/ChangePasswordModal.ts | Change-password popup: current / new / confirm, save |
| clients/ProfileClient.ts | getProfile(), updateProfile(), changePassword() |
| (test data) | All data and credentials are in test-data/test-data.ts (root of the project) |
| ui/profile.spec.ts | View data, read-only fields, valid and invalid phone numbers |
| ui/change-password.spec.ts | Change password: empty, wrong current, weak, mismatch |
| api/profile.api.spec.ts | API tests (skipped until API_URL is set) |

## Safety

- Phone tests save a number on the real account and restore the original phone after every test.
- The real current password is never typed. The wrong-current-password test sends a wrong one on purpose.

## Not automated

- Avatar upload and theme radios: they do not exist on the real page (the SRS describes them; the OpenAPI has no upload endpoint).
- Successful password change (ends all other sessions): manual, needs a second account.
- Name change through the API: removed (it changes real data and the SRS is unclear about it).
