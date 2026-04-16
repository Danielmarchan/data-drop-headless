import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';
import Button from '@/components/button';
import TextInput from '@/components/text-input';

export default function LoginForm() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    const result = await authClient.signIn.email({ email, password, rememberMe });

    setIsPending(false);

    if (result.error) {
      setError('Invalid email or password.');
      return;
    }

    void navigate('/redirect');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <TextInput
        label="Email Address"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="name@company.com"
      />

      <TextInput
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          name="rememberMe"
          className="size-4 cursor-pointer accent-primary"
        />
        <span className="font-inter font-normal text-sm leading-5 text-on-surface-variant">
          Remember me
        </span>
      </label>

      {error && (
        <p className="font-inter text-sm text-error m-0">{error}</p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        fullWidth
        className="cursor-pointer disabled:cursor-not-allowed"
      >
        {isPending ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
