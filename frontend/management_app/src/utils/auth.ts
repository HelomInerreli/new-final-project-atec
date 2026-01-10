/**
 * Utilities for JWT token validation and authentication
 */

/**
 * Validates if a JWT token is still valid
 * @param token - JWT token to validate
 * @returns true if token is valid, false otherwise
 */
export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;

  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token has expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error validating token:", error);
    return false;
  }
};

/**
 * Gets token from localStorage
 * @returns token string or null
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem("access_token");
};

/**
 * Checks if user is authenticated with a valid token
 * @returns true if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return isTokenValid(token);
};

/**
 * Clears authentication data and redirects to login
 */
export const logout = (): void => {
  localStorage.removeItem("access_token");
  window.location.href = "/";
};
