import { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { type CreateUserInput, type UpdateUserInput } from '@data-drop/api-schema';
import { useDatasets } from '@/pages/admin/api/use-datasets';
import Button from '@/components/button';
import FormSection from '@/components/form-section';
import SearchInput from '@/components/search-input';
import TextInput from '@/components/text-input';
import Spinner from '@/components/spinner';

type UserFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  assignedDatasetIds: string[];
};

type UserFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: UserFormValues;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  isPending: boolean;
  error: string;
  onCancel: () => void;
};

const DEFAULT_VALUES: UserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'viewer',
  assignedDatasetIds: [],
};

const ROLE_OPTIONS = [
  {
    value: 'viewer',
    label: 'Viewer',
    description: 'Can sign in and access the charts viewer for assigned datasets.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Can manage users, datasets, and the rest of the admin workspace.',
  },
] as const;

export default function UserForm({
  mode,
  defaultValues,
  onSubmit,
  isPending,
  error,
  onCancel,
}: UserFormProps) {
  const formId = useId();
  const initialValues = defaultValues ?? DEFAULT_VALUES;
  const [role, setRole] = useState(initialValues.role);
  const [datasetsSearch, setDatasetsSearch] = useState('');
  const [selectedDatasetIds, setSelectedDatasetIds] = useState(initialValues.assignedDatasetIds);
  const [isDirty, setIsDirty] = useState(false);
  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets(datasetsSearch);

  useEffect(() => {
    setRole(defaultValues?.role ?? DEFAULT_VALUES.role);
    setSelectedDatasetIds(defaultValues?.assignedDatasetIds ?? DEFAULT_VALUES.assignedDatasetIds);
    setIsDirty(false);
  }, [defaultValues?.role, defaultValues?.assignedDatasetIds?.join('|')]);

  const datasets = datasetsData?.pages.flatMap((page) => page.nodes) ?? [];
  const filteredDatasetIds = useMemo(() => datasets.map((dataset) => dataset.id), [datasets]);

  function toggleDataset(datasetId: string) {
    setSelectedDatasetIds((current) =>
      current.includes(datasetId)
        ? current.filter((id) => id !== datasetId)
        : [...current, datasetId],
    );
  }

  function handleAddAll() {
    setSelectedDatasetIds((current) => Array.from(new Set([...current, ...filteredDatasetIds])));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const firstName = String(formData.get('firstName') ?? '').trim();
    const lastName = String(formData.get('lastName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();

    if (mode === 'create') {
      const password = String(formData.get('password') ?? '');
      onSubmit({
        firstName,
        lastName,
        email,
        password,
        role,
        assignedDatasetIds: selectedDatasetIds,
      });
      return;
    }

    onSubmit({
      firstName,
      lastName,
      email,
      role,
      assignedDatasetIds: selectedDatasetIds,
    });
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      onChange={() => setIsDirty(true)}
      className="flex min-h-screen flex-col bg-surface pb-28"
    >
      <div className="container mx-auto px-6 pt-6">
        <nav className="flex items-center gap-2 text-sm font-inter text-on-surface-variant">
          <Link to="/admin/users" className="hover:text-on-surface transition-colors">
            Users
          </Link>
          <span>/</span>
          <span className="text-on-surface">{mode === 'create' ? 'New User' : 'Edit User'}</span>
        </nav>
      </div>

      <main className="container mx-auto flex-1 px-6 py-8">
        <h1 className="font-manrope text-3xl font-extrabold tracking-tight text-on-surface">
          {mode === 'create' ? 'New User' : 'Edit User'}
        </h1>

        <div className="mt-10 flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="flex-1 space-y-8">
            <FormSection title="Basic Information">
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <TextInput
                  label="First Name"
                  name="firstName"
                  type="text"
                  defaultValue={initialValues.firstName}
                  required
                />
                <TextInput
                  label="Last Name"
                  name="lastName"
                  type="text"
                  defaultValue={initialValues.lastName}
                />
                <TextInput
                  label="Email"
                  name="email"
                  type="email"
                  defaultValue={initialValues.email}
                  required
                  wrapperClassName="md:col-span-2"
                />
                {mode === 'create' ? (
                  <TextInput
                    label="Password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    wrapperClassName="md:col-span-2"
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
                        name="role"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setRole(option.value)}
                        className="mt-0.5 h-4 w-4 accent-primary"
                      />
                      <div>
                        <div className="font-inter text-base font-semibold text-on-surface">
                          {option.label}
                        </div>
                        <p className="mt-1 font-inter text-sm leading-6 text-on-surface-variant">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </FormSection>
          </div>

          <aside className="w-full shrink-0 xl:w-[420px]">
            <FormSection
              title="Datasets"
              action={
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="font-inter text-sm font-semibold text-primary transition-opacity hover:opacity-80 cursor-pointer"
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
                className="mt-6 bg-surface-low"
              />

              <div className="mt-5 max-h-[480px] overflow-y-auto rounded-lg border border-outline-variant/10">
                {datasetsLoading ? (
                  <div className="px-4 py-6 font-inter text-sm text-on-surface-variant">
                    <Spinner pxSize={20} />
                  </div>
                ) : datasets.length === 0 ? (
                  <div className="px-4 py-6 font-inter text-sm text-on-surface-variant">
                    No datasets found.
                  </div>
                ) : (
                  datasets.map((dataset) => {
                    const checked = selectedDatasetIds.includes(dataset.id);
                    return (
                      <label
                        key={dataset.id}
                        className="flex cursor-pointer items-center justify-between border-b border-outline-variant/10 px-4 py-3.5 last:border-b-0"
                      >
                        <div className="min-w-0 pr-4">
                          <div className="truncate font-inter text-sm font-semibold text-on-surface">
                            {dataset.title}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleDataset(dataset.id)}
                          className="h-5 w-5 cursor-pointer rounded-md accent-primary"
                        />
                      </label>
                    );
                  })
                )}
              </div>
            </FormSection>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-surface-high bg-surface-lowest shadow-sm z-1 backdrop-blur">
        <div className="container mx-auto flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {isDirty ? (
              <div className="flex items-center gap-2 font-inter text-sm text-on-surface-variant">
                <span className="h-2.5 w-2.5 rounded-full bg-error" />
                Unsaved changes will be lost
              </div>
            ) : null}
            {error ? <p className="mt-2 font-inter text-sm text-error">{error}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onCancel} className="px-6">
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={isPending} className="px-5">
              {isPending ? 'Saving...' : 'Save User'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
