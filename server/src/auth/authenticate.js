import User from "../models/User.js";
import { verifyToken } from "../utils/token.js";

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

export function readBearerToken(authorizationHeader = "") {
  const header = String(authorizationHeader || "");
  if (!header.startsWith("Bearer ")) {
    return "";
  }

  return header.slice(7).trim();
}

export async function authenticateUser(token) {
  if (!token) {
    throw new AuthError("토큰이 필요합니다.");
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (_error) {
    throw new AuthError("유효하지 않은 토큰입니다.");
  }

  const user = await User.findById(payload.sub).select("-password");
  if (!user) {
    throw new AuthError("유효하지 않은 토큰입니다.");
  }

  return user;
}

export function assertAdmin(user) {
  if (!user || user.user_type !== "admin") {
    throw new AuthError("어드민만 접근할 수 있습니다.", 403);
  }
}
