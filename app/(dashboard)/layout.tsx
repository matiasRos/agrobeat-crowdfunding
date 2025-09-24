import { auth } from '@/app/auth';
import { redirect } from 'next/navigation';
import { Header } from '@/app/ui/shared/components/header';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={session.user.email} />
      {children}
    </div>
  );
}
