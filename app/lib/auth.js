import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_12345';

/**
 * Extracts and decodes the authenticated user from cookies or Authorization headers.
 * @param {Request} req - The incoming Next.js API request.
 * @returns {object|null} The decoded user payload (id, email, etc.) or null if unauthenticated.
 */
export function getAuthUser(req) {
  // 1. Try to read the token from cookies first, then fall back to the Authorization header
  const token = req.cookies.get("accessToken")?.value || req.headers.get("authorization")?.split(" ")[1];
  
  if (!token) return null;
  
  try {
    // 2. Verify and return the decoded JWT payload
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    // 3. If token is invalid or expired, gracefully return null
    return null;
  }
}
