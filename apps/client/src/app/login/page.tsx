import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="flex justify-center pt-12 pb-10">
        <span className="font-manrope font-extrabold text-2xl leading-8 tracking-[-0.6px] text-primary">
          DataDrop
        </span>
      </div>

      <div className="flex flex-1 justify-center">
        <div className="h-fit w-full max-w-100 rounded-lg bg-surface-lowest shadow-card">
          <div className="px-8 py-8">
            <h1 className="mb-8 text-center font-manrope font-bold text-2xl leading-8 text-on-surface">
              Sign In
            </h1>

            <LoginForm />
          </div>
        </div>
      </div>

      <footer className="mt-12 h-25 shrink-0 bg-surface">
        <p className="h-full flex items-center justify-center font-inter text-sm text-on-surface-variant m-0">
          &copy; {new Date().getFullYear()} DataDrop. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
