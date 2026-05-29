# 📸 NextJS Social Post App

A state-of-the-art, full-stack, responsive social media and post-sharing application built on the cutting edge of **Next.js 16 (App Router)**, **React 19**, and **Tailwind CSS v4**. 

This application empowers users with seamless dual-authentication methods (Credentials JWT & Google OAuth), secure cookie-based session management, real-time-like notifications, multi-image post carousels powered by **Swiper.js** and **ImageKit CDN**, global client state via **Redux Toolkit**, social networking engines (likes, comments, following/follower structures), and robust security mechanisms including custom IP-based rate limiting.

---

## 🚀 Core Features

### 🔐 Multi-Protocol Authentication & Security
*   **Dual-Authentication Methods:**
    *   **OAuth 2.0:** Secure single-click login using **Google Sign-In** managed via NextAuth.
    *   **Credentials Auth:** Custom signup and login flow using secure password hashing with `bcrypt` and stateless JSON Web Tokens (`JWT`).
*   **Session Management & Dual Tokens:** Access tokens are delivered via response payloads, while refresh tokens are automatically saved in secure, HTTP-only cookies to allow persistent, rolling sessions.
*   **In-Memory Rate Limiting:** Custom IP-based rolling window rate limiter protecting critical backend endpoints (like login, signup, post creation) from brute-force attacks and abuse.

### 🖼️ Rich Media & Post Carousels
*   **ImageKit CDN Stream Integration:** Streams media files securely to ImageKit, returning highly optimized, high-performance image CDN URLs.
*   **Multi-Image Posts:** Share posts containing multiple images.
*   **Swiper.js Slider UI:** An elegant, responsive, touch-friendly swiping gallery component for viewing multi-image posts.

### 👥 Social Network Engine & Interactivity
*   **Follower/Following Graph:** A complete social graph linking users, allowing users to follow/unfollow each other and view live follower/following lists.
*   **Likes & Views:** Interactive post actions with live counters for post views, likes, and shares.
*   **Nested Post Comments:** Real-time post commentary via a high-fidelity sliding modal.
*   **Global Notifications:** Live dashboard notifications displaying actions like likes, comments, and new followers from other users.

### ⚙️ Global State & Modern Stack
*   **Redux Toolkit Global State:** Synchronized store utilizing custom slices for tracking tokens and user auth state, persisted safely to localStorage.
*   **Tailwind CSS v4:** Maximum performance, utility-first layout with smooth transitions, modern typography, and curated dark/glassmorphic aesthetics.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Core App Router, Server Actions, Serverless API Endpoints |
| **UI Library** | [React 19](https://react.dev/) | Concurrent UI rendering, React Hooks, and Modern Component Architecture |
| **State Manager** | [Redux Toolkit](https://redux-toolkit.js.org/) | Centralized client-side store sync with persistent sessions |
| **Styling Engine** | [Tailwind CSS v4](https://tailwindcss.com/) | Curated visual design system, glassmorphic layouts, HSL palettes |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/) | Document database for records, references, and robust schemas |
| **Security & Auth** | [NextAuth.js](https://next-auth.js.org/) / `jsonwebtoken` / `bcrypt` | Google OAuth provider, custom JWT authentication, and secure password hashing |
| **Media Delivery** | [ImageKit.io SDK](https://imagekit.io/) | Secure media upload pipeline and automated Image CDN optimization |
| **UI Enhancements**| [Swiper.js](https://swiperjs.com/) / [Lucide React](https://lucide.dev/) | Smooth sliding post galleries and high-quality utility icons |

---

## 📂 Project Structure

```text
my-app/
├── app/
│   ├── Model/                         # Mongoose database schemas
│   │   ├── commite.Schema.js          # Comment schema definition
│   │   ├── notificationSchema.js      # User notification schema
│   │   ├── postSchema.js              # Post schema with likes, comments, views, shares
│   │   └── userSchema.js              # User profile, follower/following array schema
│   ├── api/                           # Next.js Serverless API endpoints
│   │   ├── auth/                      # Authentications & Profile relations APIs
│   │   │   ├── [...nextauth]          # NextAuth Google Auth login and session callback handler
│   │   │   ├── editprofile            # Edits username, bio, and profile image
│   │   │   ├── follow                 # Toggles follower / following graph relationships
│   │   │   ├── following              # Fetches active lists of followers & following profiles
│   │   │   ├── google                 # Handles custom JWT creation for authenticated Google users
│   │   │   ├── like                   # Handles adding/removing likes on posts
│   │   │   ├── login                  # Credentials verification & dual-token generation
│   │   │   ├── logout                 # Clears cookies and destroys current active sessions
│   │   │   ├── me                     # Resolves current request tokens to authenticated user profile
│   │   │   ├── refresh                # Refreshes expired Access Tokens using Secure HTTP-only cookies
│   │   │   └── signup                 # Creates new users with secure bcrypt-hashed passwords
│   │   ├── explore                    # Fetches posts from non-followed creators for discovery
│   │   ├── getpost                    # Fetches posts of users you follow (main home feed)
│   │   ├── notifications              # Fetches and updates user action notifications
│   │   ├── post                       # Uploads post images to ImageKit & saves post details
│   │   └── profile                    # Fetches profile information and posts for specific users
│   ├── components/                    # High-fidelity reusable React components
│   │   ├── CommentsModal.js           # Modal popup managing comments additions and rendering
│   │   ├── FollowListModal.js         # Dialog showing list of followers / following users
│   │   ├── FollowingCard.js           # Card template displaying followed user interactions
│   │   ├── Navbar.js                  # Side/top navigation with direct page links & logout action
│   │   ├── PostCard.js                # Core post card displaying images carousel, likes, comments, & views
│   │   ├── Session.js                 # Client-side NextAuth Session Provider wrapper
│   │   └── UserCard.js                # Search / Feed list preview for discoverable users
│   ├── lib/                           # Core utilities and system modules
│   │   ├── Mongodb-config.js          # Mongoose database connection setup
│   │   ├── auth.js                    # JWT extraction & validation middleware
│   │   └── rateLimit.js               # Memory-based IP rate limiter with automatic garbage collection
│   ├── store/                         # Redux Toolkit centralized state setup
│   │   ├── features/                  # Redux slices
│   │   │   ├── authSlice.js           # Slices managing user authentication status
│   │   │   └── tokenSlice.js          # Slices managing active JWT token details
│   │   ├── providers/                 # React Context providers for global store sync
│   │   │   └── ReduxProvider.js       # Wraps layout, handles persistent Redux hydration
│   │   └── store.js                   # Configures and exports main Redux store
│   ├── explore/                       # Discover feed page
│   ├── following/                     # User network activity page
│   ├── home/                          # User feed, post creator, and dashboard page
│   ├── notifications/                 # Notifications inbox page
│   ├── profile/                       # User profile, statistics, and individual posts grid page
│   ├── register/                      # Elegant login/signup forms & landing gateway page
│   ├── globals.css                    # Tailwind CSS v4 styling rules
│   ├── layout.js                      # Root HTML and Body wrapper syncing Redux & NextAuth
│   └── page.js                        # Home router gateway (redirects to /register or dashboard)
├── public/                            # Static asset repository
├── .env.local                         # Active environment variables config
├── eslint.config.mjs                  # Linting code style setup
├── package.json                       # Core dependencies configuration
└── postcss.config.mjs                 # PostCSS setup compiling Tailwind CSS v4
```

---

## 🗄️ Database Schemas

The application defines **4 interconnected Mongoose schemas** in MongoDB to power real-time updates and relational queries:

### 👤 User Schema (`users`)
Tracks profiles, biometric stats, security credentials, and social graphing references.
```javascript
{
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },                            // Optional (omitted for Google Auth users)
  image: { type: String },                               // Profile avatar image URL
  bio: { type: String },                                 // User self-description
  posts: [{ type: Schema.Types.ObjectId, ref: 'posts' }], // Array linking user's posts
  follower: [{ type: Schema.Types.ObjectId, ref: 'users' }], // Array linking followers
  following: [{ type: Schema.Types.ObjectId, ref: 'users' }] // Array linking following profiles
}
```

### 📝 Post Schema (`posts`)
Contains content data, metrics, and associated user/comment keys.
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  title: { type: String, required: true },
  images: [{ type: String }],                            // Array of hosted ImageKit CDN URLs
  like: [{ type: Schema.Types.ObjectId, ref: 'users' }], // Tracks users who liked this post
  comment: [{ type: Schema.Types.ObjectId, ref: 'comment' }], // Links to active post comments
  views: [{ type: Schema.Types.ObjectId, ref: 'users' }], // Tracks views to prevent duplication
  shares: { type: Number, default: 0 }                    // Tracks share metrics count
}
```

### 💬 Comment Schema (`comment`)
Encapsulates individual comments associated with posts.
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
  comments: { type: String, required: true }             // Message text
}
```

### 🔔 Notification Schema (`notifications`)
Facilitates system and peer notifications.
```javascript
{
  sender: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  type: { type: String, enum: ["like", "comment", "follow", "share"], required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'posts', required: false },
  isRead: { type: Boolean, default: false }
}
```

---

## ⚡ API Endpoints

### 🔐 Authentication & Session
| Method | Endpoint | Description | Headers / Payloads |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Creates a new user profile with password hashed using `bcrypt`. | Payload: `{ username, email, password }` |
| `POST` | `/api/auth/login` | Authenticates credentials, issues access/refresh tokens. Sets HTTP-Only cookie. | Payload: `{ email, password }` |
| `POST` | `/api/auth/google` | Registers/logs in Google users. Generates authentication sessions. | Payload: `{ name, email, image }` |
| `GET` | `/api/auth/me` | Fetches details of currently authenticated active profile. | `Authorization: Bearer <access_token>` |
| `POST` | `/api/auth/refresh` | Generates a new short-lived access token using secure refresh cookies. | Expects `refreshToken` in HTTP-Only cookies |
| `POST` | `/api/auth/logout` | Clears all server cookies and invalidates user JWT authorization state. | None |

### 👥 User Interactions & Profiles
| Method | Endpoint | Description | Headers / Payloads |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/editprofile`| Updates username, bio, and profile avatar url. | `Authorization: Bearer <access_token>` <br> Payload: `{ username, bio, image }` |
| `POST` | `/api/auth/follow` | Toggles follow state on targeted userId, triggering follow notifications. | `Authorization: Bearer <access_token>` <br> Payload: `{ followId }` |
| `GET` | `/api/auth/following` | Returns lists of current user's follower and following models. | `Authorization: Bearer <access_token>` |
| `GET` | `/api/profile` | Resolves target user statistics (followers count, bio, posts grid). | Query: `?id=<user_id>` |

### 📝 Post & Action APIs
| Method | Endpoint | Description | Headers / Payloads |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/post` | Handles multi-image multipart upload to ImageKit and records details in DB. | `Authorization: Bearer <access_token>` <br> Payload: `FormData` with `title` & `images` |
| `GET` | `/api/getpost` | Resolves customized Feed view composed of posts from users you follow. | `Authorization: Bearer <access_token>` |
| `GET` | `/api/explore` | Feeds search and discover pages featuring posts by unfollowed creators. | `Authorization: Bearer <access_token>` |
| `POST` | `/api/auth/like` | Toggles post likes and triggers automated notifications for the author. | `Authorization: Bearer <access_token>` <br> Payload: `{ postId }` |

### 🔔 Notification APIs
| Method | Endpoint | Description | Headers / Payloads |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Retrieves notification items list directed at current user. | `Authorization: Bearer <access_token>` |
| `PUT` | `/api/notifications` | Marks a specified notification as read. | `Authorization: Bearer <access_token>` <br> Payload: `{ notificationId }` |

---

## ⚙️ Getting Started

### 1. Prerequisites
Ensure you have the following installed and configured on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [MongoDB Atlas](https://www.mongodb.com/) active database connection cluster
*   [Google Cloud Console](https://console.cloud.google.com/) OAuth 2.0 Credentials (for Google Sign-In options)
*   [ImageKit.io](https://imagekit.io/) Developer keys for media cloud ingestion

### 2. Project Installation
Clone the repository and install all dependencies:
```bash
# Navigate inside the project root folder
cd my-app

# Install all package configurations
npm install
```

### 3. Local Environment Configurations
Create a `.env.local` file in the root `my-app/` directory and configure the environment keys:

```env
# MONGODB CONNECTION STRING
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/next_post_db

# STATELESS JWT ENCRYPTION KEY SECRETS
JWT_ACCESS_SECRET=your_ultra_secure_jwt_access_token_secret_key_32_chars
JWT_REFRESH_SECRET=your_ultra_secure_jwt_refresh_cookie_secret_key_32_chars

# IMAGEKIT CDN STREAMING API KEYS
IMAGEKIT_PUBLIC_KEY=public_your_imagekit_public_key_string
IMAGEKIT_PRIVATE_KEY=private_your_imagekit_private_key_string
URL_ENDPOINT=https://ik.imagekit.io/your_unique_imagekit_endpoint_id/

# NEXTAUTH GOOGLE SIGN-IN CREDENTIALS
GOOGLE_CLIENT_ID=your_google_developers_console_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_google_developers_console_secret_key_string
NEXTAUTH_SECRET=your_nextauth_jwt_signing_secret_key_string
NEXTAUTH_URL=http://localhost:3000
```

### 4. Running the Development Server
Initiate the Next.js compilation engine locally:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** inside your browser to view the application in action!

---

## 🏗️ Production Compilation & Deployment

To compile a highly optimized production build:
```bash
# Formulates ready-to-deploy static assets & serverless routes
npm run build
```

To run the built app locally in production environment mode:
```bash
# Initiates local production server hosting compiled assets
npm run start
```

---

## 🛡️ Under the Hood: Key Engineering Mechanisms

### ⏳ Rolling In-Memory Rate Limiting
To block endpoint abuse, `app/lib/rateLimit.js` implements a rolling window rate-limiter based on IP tracking:
*   Uses a Node/V8 `Map` caching IPs against active request counts.
*   Enforces request count ceilings within sliding intervals (e.g. 60 requests/minute).
*   Integrates an asynchronous periodic Garbage Collector running every **5 minutes** on the global thread to clean up inactive/expired IP entries, preventing memory leaks:
```javascript
if (typeof global !== "undefined" && !global.rateLimitGCScheduled) {
  global.rateLimitGCScheduled = true;
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}
```

### 🔄 Multi-Tiered Refresh/Access Token Rotation
1.  **Access Token:** Short-lived, stateless, returned via body response payloads, and saved inside standard memory. Utilized for standard `Authorization: Bearer` API headers.
2.  **Refresh Token:** Long-lived, stored in a secure `HttpOnly` and `SameSite=Strict` cookie which the browser automatically appends on requests to `/api/auth/refresh`. This process isolates refresh operations from frontend Javascript contexts, mitigating XSS security vulnerabilities.
