import jwt from "jsonwebtoken";

// KHÔNG CÓ fallback - throw Error nếu thiếu
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
	throw new Error("FATAL: JWT_SECRET is not set in environment variables.");
}
if (!JWT_REFRESH_SECRET) {
	throw new Error(
		"FATAL: JWT_REFRESH_SECRET is not set in environment variables.",
	);
}

export interface TokenPayload {
	id: string;
	username: string;
	role: string;
	village_id: string | null;
}

export function generateAccessToken(payload: TokenPayload): string {
	return jwt.sign(payload, JWT_SECRET!, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: TokenPayload): string {
	return jwt.sign(payload, JWT_REFRESH_SECRET!, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): TokenPayload {
	return jwt.verify(token, JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
	return jwt.verify(token, JWT_REFRESH_SECRET!) as TokenPayload;
}
