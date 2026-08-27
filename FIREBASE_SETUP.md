# Firebase Chat Setup

Real-time chat now runs on Firestore instead of Socket.IO, so it works fine
behind Kubernetes (no persistent WebSocket connections through the pods).

## How it fits together

- **Identity**: your existing Postgres `User`/`Role`/JWT system is still the
  source of truth for login. Firebase is only used to authorize chat access.
- **Auth bridge**: an authenticated user calls `GET /api/auth/firebase-token`
  (protected by the existing JWT cookie) to get a Firebase **custom token**.
  The client then calls `signInWithCustomToken()` once with the Firebase
  client SDK; after that the SDK manages its own session/refresh.
- **Chat lifecycle** (start a chat, list chats, close a chat) goes through
  your normal REST API, which uses the Firebase **Admin SDK** to read/write
  the `chats` collection.
- **Messages** are written and read by clients **directly** in Firestore
  (`chats/{chatId}/messages`), authorized by `firestore.rules` — the backend
  is not in the message write path at all.

## Environment variables

Add one of these to your `.env` (never commit the real value):

```
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded service account JSON>
```

or, if you'd rather mount the JSON file itself:

```
FIREBASE_SERVICE_ACCOUNT_PATH=/absolute/path/to/service-account.json
```

### Getting a service account JSON

1. Firebase Console → your project → gear icon → **Project settings**
2. **Service accounts** tab → make sure "Node.js" is selected
3. **Generate new private key** → confirm → a JSON file downloads
4. Base64-encode it (`base64 -w0 service-account.json`) and put the result
   in `FIREBASE_SERVICE_ACCOUNT_BASE64`

Enable **Firestore Database** too (Console → Build → Firestore Database →
Create database) if you haven't already. No manual collection setup is
needed — Firestore creates collections automatically on first write.

## Data model

```
chats/{chatId}
  patient_id: string       // Postgres User id
  patientName: string | null
  patientEmail: string | null
  status: 'open' | 'closed'
  createdAt / updatedAt: Timestamp
  closedAt: Timestamp | null

chats/{chatId}/messages/{messageId}
  sender_id: string        // Firebase uid == Postgres User id
  sender_type: 'patient' | 'admin'
  content: string
  createdAt: Timestamp
```

## Security rules

Deploy `firestore.rules` from this repo via the Firebase Console (Firestore
Database → Rules) or the Firebase CLI (`firebase deploy --only firestore:rules`).
They enforce:

- A patient can only read their own chat and its messages.
- `admin`/`doctor` (via a `role` custom claim on the Firebase token) can read
  any chat/messages.
- Only the backend (Admin SDK, which bypasses rules) can create/close a
  `chats/{chatId}` document — clients never write it directly.
- A client can only `create` a message as themselves (`sender_id` must match
  their Firebase uid), with `sender_type` matching their actual role. Messages
  are immutable once created.

## Backend endpoints

| Method | Path                          | Who     | Purpose                          |
|--------|-------------------------------|---------|-----------------------------------|
| GET    | `/api/auth/firebase-token`    | any auth user | mint a Firebase custom token |
| POST   | `/api/patient/chats`          | patient | start/resume own open chat        |
| GET    | `/api/patient/chats`          | patient | list own chats                    |
| GET    | `/api/admin/chats`            | admin   | list all chats                    |
| GET    | `/api/admin/chats/:id`        | admin   | get one chat + its messages       |
| PATCH  | `/api/admin/chats/:id/close`  | admin   | close a chat                      |

## Client flow (mobile/web)

1. Log in normally (existing JWT flow).
2. Call `GET /api/auth/firebase-token`, then `signInWithCustomToken(auth, firebaseToken)`.
3. Call `POST /api/patient/chats` to start/resume a chat, get back `chat.id`.
4. Listen with `onSnapshot(collection(db, 'chats', chatId, 'messages'), ...)`
   for real-time updates, and `addDoc(...)` to send a message.
