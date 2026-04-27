import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  type CreateUserInput,
  type UpdateUserInput,
} from '@data-drop/api-schema';
import { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDatasets } from '@/pages/admin/api/use-datasets';
import Breadcrumbs from '@/components/breadcrumbs';
import Button from '@/components/button';
import FormSection from '@/components/form-section';
import SearchInput from '@/components/search-input';
import TextInput from '@/components/text-input';
import Spinner from '@/components/spinner';
import { useAlertStore } from '@/components/alert/stores/ui-alert-store';

const USER_REDIRECT_DELAY_MS = 900;

const baseUserSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim(),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  role: z.enum(['viewer', 'admin']),
  assignedDatasetIds: z.array(z.string()),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const editUserSchema = baseUserSchema.extend({
  password: z.string().optional(),
});

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: 'viewer' | 'admin';
  assignedDatasetIds: string[];
};

type UserFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: Omit<UserFormValues, 'password'>;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<unknown>;
  onSuccess?: () => void;
  isPending: boolean;
  onCancel: () => void;
};

const DEFAULT_VALUES: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'viewer',
  assignedDatasetIds: [],
};

const ROLE_OPTIONS = [
  {
    value: 'viewer',
    label: 'Viewer',
    description:
      'Can sign in and access the charts viewer for assigned datasets.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description:
      'Can manage users, datasets, and the rest of the admin workspace.',
  },
] as const;

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to save user.';
}

export default function UserForm({
  mode,
  defaultValues,
  onSubmit,
  onSuccess,
  isPending,
  onCancel,
}: UserFormProps) {
  const formId = useId();
  const redirectTimeoutRef = useRef<number | null>(null);
  const defaultFirstName = defaultValues?.firstName ?? DEFAULT_VALUES.firstName;
  const defaultLastName = defaultValues?.lastName ?? DEFAULT_VALUES.lastName;
  const defaultEmail = defaultValues?.email ?? DEFAULT_VALUES.email;
  const defaultRole = defaultValues?.role ?? DEFAULT_VALUES.role;
  const defaultAssignedDatasetIdsJson = JSON.stringify(
    defaultValues?.assignedDatasetIds ?? DEFAULT_VALUES.assignedDatasetIds,
  );
  const defaultAssignedDatasetIds = useMemo(
    () => JSON.parse(defaultAssignedDatasetIdsJson) as string[],
    [defaultAssignedDatasetIdsJson],
  );
  const initialValues = useMemo(
    () => ({
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: defaultEmail,
      password: '',
      role: defaultRole,
      assignedDatasetIds: defaultAssignedDatasetIds,
    }),
    [
      defaultAssignedDatasetIds,
      defaultEmail,
      defaultFirstName,
      defaultLastName,
      defaultRole,
    ],
  );
  const [datasetsSearch, setDatasetsSearch] = useState('');
  const showAlert = useAlertStore((state) => state.showAlert);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);
  const { data: datasetsData, isLoading: datasetsLoading } =
    useDatasets(datasetsSearch);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      mode === 'create' ? createUserSchema : editUserSchema,
    ),
    defaultValues: initialValues,
  });

  const role = watch('role');
  const selectedDatasetIds = watch('assignedDatasetIds');

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(
    () => () => {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    },
    [],
  );

  const datasets = useMemo(
    () => datasetsData?.pages.flatMap((page) => page.nodes) ?? [],
    [datasetsData],
  );
  const filteredDatasetIds = useMemo(
    () => datasets.map((dataset) => dataset.id),
    [datasets],
  );

  function toggleDataset(datasetId: string) {
    const nextIds = selectedDatasetIds.includes(datasetId)
      ? selectedDatasetIds.filter((id) => id !== datasetId)
      : [...selectedDatasetIds, datasetId];

    setValue('assignedDatasetIds', nextIds, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  function handleAddAll() {
    setValue(
      'assignedDatasetIds',
      Array.from(new Set([...selectedDatasetIds, ...filteredDatasetIds])),
      {
        shouldDirty: true,
        shouldTouch: true,
      },
    );
  }

  async function handleFormSubmit(data: UserFormValues) {
    dismissAlert();

    const payload = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim(),
      role: data.role,
      assignedDatasetIds: data.assignedDatasetIds,
    };

    try {
      if (mode === 'create') {
        await onSubmit({
          ...payload,
          password: data.password!,
        });
      } else {
        await onSubmit(payload);
      }

      showAlert({
        variant: 'success',
        title:
          mode === 'create'
            ? 'User created successfully'
            : 'User updated successfully',
        message:
          mode === 'create'
            ? 'Redirecting back to the users list.'
            : 'Your changes have been saved. Redirecting back to the users list.',
        persistOnNavigation: true,
      });

      redirectTimeoutRef.current = window.setTimeout(() => {
        onSuccess?.();
      }, USER_REDIRECT_DELAY_MS);
    } catch (error) {
      showAlert({
        variant: 'error',
        title: 'Unable to save user',
        message: getErrorMessage(error),
        persistOnNavigation: true,
      });
    }
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(handleFormSubmit)}
      noValidate
      className="bg-surface flex min-h-screen flex-col pb-28"
    >
      <div className="container mx-auto px-4 pt-4 sm:px-6 sm:pt-6">
        <Breadcrumbs
          items={[
            { label: 'Users', to: '/admin/users' },
            { label: mode === 'create' ? 'New User' : 'Edit User' },
          ]}
        />
      </div>

      <main className="container mx-auto flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <h1 className="font-manrope text-on-surface text-2xl font-extrabold tracking-tight sm:text-3xl">
          {mode === 'create' ? 'New User' : 'Edit User'}
        </h1>

        <div className="mt-10 flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="flex-1 space-y-8">
            <FormSection title="Basic Information">
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <TextInput
                  {...register('firstName')}
                  label="First Name"
                  type="text"
                  error={errors.firstName?.message}
                />
                <TextInput
                  {...register('lastName')}
                  label="Last Name"
                  type="text"
                  error={errors.lastName?.message}
                />
                <TextInput
                  {...register('email')}
                  label="Email"
                  type="email"
                  wrapperClassName="md:col-span-2"
                  error={errors.email?.message}
                />
                {mode === 'create' ? (
                  <TextInput
                    {...register('password')}
                    label="Password"
                    type="password"
                    wrapperClassName="md:col-span-2"
                    error={errors.password?.message}
                  />
                ) : null}
              </div>
            </FormSection>

            <FormSection title="System Role">
              <div className="mt-6 grid gap-4">
                {ROLE_OPTIONS.map((option) => {
                  const isSelected = role === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-4 rounded-lg border p-5 transition-colors ${
                        isSelected
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-outline-variant/20 bg-surface-low'
                      }`}
                    >
                      <input
                        type="radio"
                        {...register('role')}
                        value={option.value}
                        checked={isSelected}
                        className="accent-primary mt-0.5 h-4 w-4"
                      />
                      <div>
                        <div className="font-inter text-on-surface text-base font-semibold">
                          {option.label}
                        </div>
                        <p className="font-inter text-on-surface-variant mt-1 text-sm leading-6">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {errors.role ? (
                <p className="font-inter text-error mt-4 text-sm">
                  {errors.role.message}
                </p>
              ) : null}
            </FormSection>
          </div>

          <aside className="w-full shrink-0 xl:w-[420px]">
            <FormSection
              title="Datasets"
              action={
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="font-inter text-primary cursor-pointer text-sm font-semibold transition-opacity hover:opacity-80"
                  disabled={filteredDatasetIds.length === 0}
                >
                  Add all
                </button>
              }
            >
              <SearchInput
                value={datasetsSearch}
                onChange={(e) => setDatasetsSearch(e.target.value)}
                placeholder="Search datasets..."
                className="bg-surface-low mt-6"
              />

              <div className="border-outline-variant/10 mt-5 max-h-[480px] overflow-y-auto rounded-lg border">
                {datasetsLoading ? (
                  <div className="font-inter text-on-surface-variant px-4 py-6 text-sm">
                    <Spinner pxSize={20} />
                  </div>
                ) : datasets.length === 0 ? (
                  <div className="font-inter text-on-surface-variant px-4 py-6 text-sm">
                    No datasets found.
                  </div>
                ) : (
                  datasets.map((dataset) => {
                    const checked = selectedDatasetIds.includes(dataset.id);
                    return (
                      <label
                        key={dataset.id}
                        className="border-outline-variant/10 flex cursor-pointer items-center justify-between border-b px-4 py-3.5 last:border-b-0"
                      >
                        <div className="min-w-0 pr-4">
                          <div className="font-inter text-on-surface truncate text-sm font-semibold">
                            {dataset.title}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDataset(dataset.id)}
                          className="accent-primary h-5 w-5 cursor-pointer rounded-md"
                        />
                      </label>
                    );
                  })
                )}
              </div>
              {errors.assignedDatasetIds ? (
                <p className="font-inter text-error mt-4 text-sm">
                  {errors.assignedDatasetIds.message}
                </p>
              ) : null}
            </FormSection>
          </aside>
        </div>
      </main>

      <div className="border-surface-high bg-surface-lowest fixed inset-x-0 bottom-0 z-1 border-t shadow-sm backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1">
            {isDirty ? (
              <div className="font-inter text-on-surface-variant flex items-center gap-2 text-sm">
                <span className="bg-error h-2.5 w-2.5 rounded-full" />
                Unsaved changes will be lost
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              type="button"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={isPending}
              className="px-5"
            >
              {isPending ? 'Saving...' : 'Save User'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
