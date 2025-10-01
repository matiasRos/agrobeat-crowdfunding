import { requireRole } from '@/app/lib/auth/permissions';
import { AdminLayout } from '@/app/ui/admin/components';

export default async function AdminPage() {
  // Solo los admins pueden acceder a esta página
  await requireRole('admin');

  return <AdminLayout />;
}
