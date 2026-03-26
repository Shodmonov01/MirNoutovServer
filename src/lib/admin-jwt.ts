import type { AdminJwtPayload, AdminJwtPayloadSuper, AdminRole } from '../types/admin.types';

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

/** Разбор payload после jwtVerify: поддержка текущего формата и старых токенов без поля role. */
export const normalizeAdminJwtPayload = (decoded: unknown): AdminJwtPayload | null => {
  if (!decoded || typeof decoded !== 'object') {
    return null;
  }
  const t = decoded as Record<string, unknown>;

  if (t.telegramUserId !== undefined && t.telegramUserId !== null) {
    const telegramUserId =
      typeof t.telegramUserId === 'number' ? t.telegramUserId : Number(t.telegramUserId);
    if (!Number.isSafeInteger(telegramUserId) || telegramUserId <= 0) {
      return null;
    }
    if (t.role !== 'admin') {
      return null;
    }
    return { role: 'admin', telegramUserId };
  }

  if (!isNonEmptyString(t.adminId) || !isNonEmptyString(t.email)) {
    return null;
  }
  if (t.role !== undefined && t.role !== 'superadmin') {
    return null;
  }
  return {
    role: 'superadmin',
    adminId: t.adminId,
    email: t.email,
  };
};

export const isSuperAdminPayload = (p: AdminJwtPayload): p is AdminJwtPayloadSuper =>
  p.role === 'superadmin';

export const adminRoleForResponse = (p: AdminJwtPayload): AdminRole => p.role;
