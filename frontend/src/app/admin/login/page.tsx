'use client';

import { useRouter } from 'next/navigation';
import { $api } from '@/lib/api/admin-query';
import { errorMessage } from '@/lib/admin/api-error';
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = $api.useMutation('post', '/api/auth/login', {
    onSuccess: () => router.replace('/admin'),
  });

  return (
    <main className="grid min-h-dvh place-items-center px-5">
      <LoginForm
        submitting={login.isPending}
        error={errorMessage(login.error)}
        onSubmit={(email, password) => login.mutate({ body: { email, password } })}
      />
    </main>
  );
}
