import * as Crypto from "expo-crypto";

/** Mật khẩu được lưu dạng "salt:hash" (SHA-256 của salt + mật khẩu), không lưu mật khẩu gốc. */

async function sha256(text: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
}

async function makeSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await makeSalt();
  return `${salt}:${await sha256(salt + password)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return (await sha256(salt + password)) === hash;
}
