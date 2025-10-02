import { ResetPasswordContainer } from '@/app/ui/reset-password/components/reset-password-container';

export default function ResetPasswordPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  return <ResetPasswordContainer token={params.token} />;
}
