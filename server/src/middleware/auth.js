import { assertAdmin, authenticateUser, AuthError, readBearerToken } from "../auth/authenticate.js";

function sendAuthError(res, error) {
  if (error instanceof AuthError) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
}

export async function requireAuth(req, res, next) {
  try {
    const token = readBearerToken(req.headers.authorization);
    req.user = await authenticateUser(token);
    next();
  } catch (error) {
    return sendAuthError(res, error);
  }
}

export function requireAdmin(req, res, next) {
  try {
    assertAdmin(req.user);
    next();
  } catch (error) {
    return sendAuthError(res, error);
  }
}
