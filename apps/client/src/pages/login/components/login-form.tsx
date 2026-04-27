import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth';
import Button from '@/components/button';
import TextInput from '@/components/text-input';
import { useAlertStore } from '@/components/alert/stores/ui-alert-store';

const LOGIN_REDIRECT_DELAY_MS = 900;

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function getLoginErrorMessage(error: {
  message?: string;
  status: number;
  statusText: string;
}) {
  if (error.status >= 500) {
    return error.message ?? error.statusText ?? 'Unable to sign in right now.';
  }

  return error.message ?? 'Invalid email or password.';
}

export default function LoginForm() {
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<number | null>(null);
  const showAlert = useAlertStore((state) => state.showAlert);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  useEffect(
    () => () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    },
    [],
  );

  async function onSubmit({ email, password, rememberMe }: LoginFormValues) {
    dismissAlert();

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        showAlert({
          variant: 'error',
          title:
            result.error.status >= 500 ? 'Sign-in failed' : 'Unable to sign in',
          message: getLoginErrorMessage(result.error),
          persistOnNavigation: true,
        });
        return;
      }

      showAlert({
        variant: 'success',
        title: 'Signed in successfully',
        message: 'Redirecting to your workspace.',
        persistOnNavigation: true,
      });

      redirectTimeoutRef.current = window.setTimeout(() => {
        void navigate('/redirect');
      }, LOGIN_REDIRECT_DELAY_MS);
    } catch (error) {
      showAlert({
        variant: 'error',
        title: 'Sign-in failed',
        message:
          error instanceof Error
            ? error.message
            : 'Unable to sign in right now.',
        persistOnNavigation: true,
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-6"
    >
      <TextInput
        {...register('email')}
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="name@company.com"
        error={errors.email?.message}
      />

      <TextInput
        {...register('password')}
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
      />

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          {...register('rememberMe')}
          className="accent-primary size-4 cursor-pointer"
        />
        <span className="font-inter text-on-surface-variant text-sm leading-5 font-normal">
          Remember me
        </span>
      </label>

      <Button
        type="submit"
        disabled={isSubmitting}
        size="lg"
        fullWidth
        className="cursor-pointer disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  );
}
