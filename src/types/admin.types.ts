export type AdminRole = 'superadmin' | 'admin';

export interface AdminJwtPayloadSuper {
  role: 'superadmin';
  adminId: string;
  email: string;
}

export interface AdminJwtPayloadTelegram {
  role: 'admin';
  telegramUserId: number;
}

export type AdminJwtPayload = AdminJwtPayloadSuper | AdminJwtPayloadTelegram;

export interface AdminMeResponse {
  role: AdminRole;
  email?: string;
  telegramUserId?: number;
}
