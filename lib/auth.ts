import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function verifyAdminCookie(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return false;

  try {
    const jwtSecret = process.env.ADMIN_JWT_SECRET || 'fallback-secret-change-in-production';
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);
    return payload.role === 'admin';
  } catch {
    return false;
  }
}
