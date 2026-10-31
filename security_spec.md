# Viksit Bengal Dashboard — Zero-Trust Firestore Security Specification

## 1. Data Invariants

1. **Default-Deny Catch-All**: All paths under `/databases/{database}/documents/{document=**}` are denied by default (`allow read, write: if false;`).
2. **Verified Identity & Anti-Spoofing**: Every write operation requires `request.auth != null && request.auth.token.email_verified == true`. Bootstrapped admin privileges for `leaplearnindia@gmail.com` explicitly verify `request.auth.token.email_verified == true`.
3. **Self-Assigned Role Prevention**: When a new user creates their `/users/{userId}` document, `userId` must equal `request.auth.uid`, and `role` MUST be `'CITIZEN'` (unless `isAdmin()` is true). Standard users can never self-assign `'ADMIN'` or `'RESEARCHER'`.
4. **PII Isolation**: `/users/{userId}`, `/admins/{adminId}`, and `/access_logs/{logId}` contain user emails (`email`). `get` and `list` operations are restricted strictly to the document owner (`uid == request.auth.uid`) or verified Administrators (`isAdmin()` / `isBootstrappedAdmin()`).
5. **Query Enforcer & Cost Guard**: `allow list` rules never invoke `get()` or `exists()`; they evaluate `resource.data.uid == request.auth.uid || isBootstrappedAdmin()`.
6. **Temporal Integrity**: `createdAt` and `updatedAt` must equal server timestamp `request.time` on `create`, and `createdAt` is immutable while `updatedAt == request.time` on `update`.
7. **Relational Consistency**: Creating an `/admins/{adminId}` record requires `exists(/databases/$(database)/documents/users/$(adminId))`. Creating an `/access_logs/{logId}` record requires `exists(/databases/$(database)/documents/users/$(request.auth.uid))`.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Test Vectors)

1. **Payload 1 — Unauthenticated Profile Creation**: Creating `/users/user_1` with `auth == null`.
2. **Payload 2 — Unverified Email Admin Spoof**: Calling update on `/users/user_2` as `leaplearnindia@gmail.com` with `email_verified: false`.
3. **Payload 3 — Self-Privilege Escalation on Registration**: Creating `/users/user_1` as `user_1` with `role: "ADMIN"`.
4. **Payload 4 — Shadow Field Injection on Create**: Creating `/users/user_1` with an undeclared field `"isSuperAdmin": true`.
5. **Payload 5 — Identity Spoofing (`uid` Mismatch)**: Creating `/users/user_1` while authenticated as `user_2`.
6. **Payload 6 — Role Escalation via Profile Update**: Updating `/users/user_1` as `user_1` modifying `role` from `"CITIZEN"` to `"ADMIN"`.
7. **Payload 7 — Immortal Field Tampering (`createdAt` / `email`)**: Updating `/users/user_1` with a modified `createdAt` or `email`.
8. **Payload 8 — Client Timestamp Forgery**: Creating `/users/user_1` with a past/future client timestamp instead of `request.time`.
9. **Payload 9 — ID Poisoning / Resource Exhaustion**: Creating `/users/{200_char_invalid_id}` or passing a 500-character `displayName`.
10. **Payload 10 — Cross-User PII Read Leak**: Reading (`get` or `list`) `/users/user_2` while authenticated as non-admin `user_1`.
11. **Payload 11 — Orphaned Access Log Write**: Creating `/access_logs/log_1` when `/users/$(request.auth.uid)` does not exist.
12. **Payload 12 — Terminal State Bypass**: Non-admin user `user_1` attempting to update `/users/user_1` after `accessStatus` is set to `'RESTRICTED'`.
