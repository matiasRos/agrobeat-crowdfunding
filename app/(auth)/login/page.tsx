import { signIn } from '@/app/auth';
import { LoginForm } from '@/app/ui/login/components/login-form';

export default function Login() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          action={async (formData: FormData) => {
            'use server';
            await signIn('credentials', {
              redirectTo: '/dashboard',
              email: formData.get('email') as string,
              password: formData.get('password') as string,
            });
          }}
        />
      </div>
    </div>
  );
}
