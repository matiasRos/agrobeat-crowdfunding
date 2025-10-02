import { verifyResetToken } from '@/app/actions/reset-password';
import { ResetPasswordForm } from './reset-password-form';
import { InvalidTokenMessage } from './invalid-token-message';

interface ResetPasswordContainerProps {
  token: string;
}

export async function ResetPasswordContainer({ token }: ResetPasswordContainerProps) {
  const validation = await verifyResetToken(token);

  if (!validation.valid) {
    return <InvalidTokenMessage error={validation.error} />;
  }

  return <ResetPasswordForm token={token} />;
}

