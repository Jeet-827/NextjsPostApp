# 📸 Next.js Post Application

A modern, full-stack social sharing web application built with **Next.js 16 (App Router)**, **React 19**, and **Mongoose/MongoDB**. The application provides secure authentication (both email/password credentials and Google OAuth via NextAuth) and allows users to create posts featuring titles and multiple image uploads powered by **ImageKit**.

---

## 🚀 Key Features

*   **Dual-Authentication Methods:**
    *   **OAuth 2.0:** Secure single-click login using **Google Sign-In** managed via NextAuth.
    *   **Credentials Auth:** Custom signup and login flow using secure password hashing with **bcrypt** and stateless JSON Web Tokens (**JWT**).
*   **Secure Session Management:** Access tokens are delivered via response payloads, while refresh tokens are automatically saved in secure, HTTP-only cookies to allow persistent sessions.
*   **Media Management:** Upload multiple images seamlessly with **ImageKit** integration, storing optimal, high-performance image CDN URLs.
*   **Dynamic Data Relationships:** Integrated with **MongoDB** via **Mongoose**, establishing database references linking users to their generated posts.
*   **Cutting-Edge Styling:** Fully stylized layouts leveraging the speed and performance of **Tailwind CSS v4**.

---

## 🛠️ Tech Stack

*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
*   **Library:** [React 19](https://react.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Database & ODM:** [MongoDB Atlas](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/) / [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) / [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
*   **Image Hosting & CDN:** [ImageKit.io SDK](https://imagekit.io/)
*   **HTTP Client:** [Axios](https://axios-http.com/)

---

## 📂 Project Structure

```text
my-app/
├── app/
│   ├── Model/                    # Mongoose database schemas
│   │   ├── postSchema.js         # Post schema definition
│   │   └── userSchema.js         # User schema definition
│   ├── api/                      # Next.js Serverless API endpoints
│   │   ├── auth/
│   │   │   ├── [...nextauth]     # NextAuth Google Auth logic & callbacks
│   │   │   ├── google            # Handles JWT generation for Google-signed users
│   │   │   ├── login             # Custom credentials verification & token generation
│   │   │   └── signup            # Handles user creation & password hashing
│   │   └── post                  # Uploads images to ImageKit & saves post to DB
│   ├── components/
│   │   └── Session.js            # Client-side NextAuth Session Provider wrapper
│   ├── home/
│   │   └── page.js               # Main Dashboard page (create posts & upload images)
│   ├── register/
│   │   └── page.js               # Signup/Login landing page (Credentials & Google buttons)
│   ├── globals.css               # Global stylesheets with Tailwind CSS v4 directives
│   ├── layout.js                 # HTML wrapper layout incorporating NextAuth Session
│   └── page.js                   # Main application entry point (redirects to /register)
├── lib/
│   └── Mongodb-config.js         # Mongoose connection utility
├── public/                       # Static public assets
├── .env.local                    # Local environment variables configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

---

## 🗄️ Database Schemas

### User Schema (`users`)
Stores registered users with dynamic arrays tracking their posts:
```javascript
{
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google authenticated users
  image: { type: String },     // Profile image URL
  posts: [{ type: Schema.Types.ObjectId, ref: 'posts' }] // Reference array
}
```

### Post Schema (`posts`)
Tracks post titles and the array of hosted CDN image URLs:
```javascript
{
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  title: { type: String, required: true },
  images: [{ type: String }] // Array of hosted ImageKit URLs
}
```

---

## ⚡ API Endpoints

### **Authentication**
*   `POST /api/auth/signup`
    *   Creates a new user profile with password hashed using `bcrypt`.
*   `POST /api/auth/login`
    *   Authenticates credentials, generates JWT access and refresh tokens, and attaches the refresh token as an HTTP-only cookie.
*   `POST /api/auth/google`
    *   Registers or logs in a Google user, returning access tokens and establishing an HTTP-only cookie session.

### **Posts**
*   `POST /api/post`
    *   *Headers:* `Authorization: Bearer <access_token>`
    *   *Payload:* Multipart `FormData` containing `title` (string) and `images` (multiple file inputs).
    *   *Process:* Connects to MongoDB, validates JWT, streams media files to ImageKit CDN, creates the post document, and updates the User's post array reference.

---

## ⚙️ Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18.x or later) and a [MongoDB Atlas](https://www.mongodb.com/) cluster instance ready. You also need free developer accounts on [Google Cloud Console](https://console.cloud.google.com/) (for Google Sign-In credentials) and [ImageKit.io](https://imagekit.io/) (for media uploading).

### 2. Installation
Clone the repository and install the project dependencies:
```bash
# Navigate to the project folder
cd my-app

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root `my-app` directory and fill in the configuration values:

```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# JWT Secret Keys
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# ImageKit Credentials
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/

# NextAuth Google Provider Credentials
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
NEXTAUTH_SECRET=your_nextauth_jwt_signing_secret
```

### 4. Running Locally
Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your browser to view the application in action.

---

## 🛠️ Build & Deployment

To compile a highly optimized production build:
```bash
npm run build
```

To run the built app in production mode:
```bash
npm run start
```
