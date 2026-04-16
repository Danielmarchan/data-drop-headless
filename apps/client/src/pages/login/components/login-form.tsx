import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';

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
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="font-inter font-semibold text-xs leading-4 tracking-[0.3px] text-on-surface-variant"
        >
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="name@company.com"
          className="h-12 w-full rounded-lg bg-surface-low px-4 font-inter font-normal text-base text-on-surface outline-none border border-outline-variant/20 focus:border-primary/50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="font-inter font-semibold text-xs leading-4 tracking-[0.3px] text-on-surface-variant"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="h-12 w-full rounded-lg bg-surface-low px-4 font-inter font-normal text-base text-on-surface outline-none border border-outline-variant/20 focus:border-primary/50"
        />
      </div>

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

      <button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-lg border-0 cursor-pointer disabled:cursor-not-allowed disabled:bg-primary-disabled font-manrope font-bold text-base leading-6 text-white bg-linear-to-br from-primary to-primary-accent"
      >
        {isPending ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
