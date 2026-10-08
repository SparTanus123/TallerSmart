import type { UserRole } from '@/types';

export const PERSONAS: Record<UserRole, { name: string; label: string; techId?: string }> = {
  admin: { name: 'Carlos Mendoza', label: 'Administrador' },
  advisor: { name: 'Camila Rojas', label: 'Asesora de recepción' },
  technician: { name: 'Felipe Núñez', label: 'Técnico - Frenos', techId: 't2' },
};
