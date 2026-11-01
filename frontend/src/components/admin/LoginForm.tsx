'use client';

import { useState, type FormEvent } from 'react';
import { Button, ErrorBanner, Field, TextInput } from './ui';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
  submitting: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, submitting, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(email, password);
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full max-w-sm gap-5 rounded-card border border-border bg-surface p-6">
      <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
      <ErrorBanner message={error} />
      <Field label="Email" htmlFor="email">
        <TextInput
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field label="Password" htmlFor="password">
        <TextInput
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>
      <Button type="submit" variant="primary" disabled={submitting}>
        {submitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
