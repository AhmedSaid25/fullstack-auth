import { get, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';

// Connects a react-hook-form field to an MUI TextField.
// MUI puts `ref` on its wrapper <div>; react-hook-form needs the real <input> (to focus it),
// so the ref goes to `inputRef`. The field's error becomes MUI's error + helperText.
export function muiField<T extends FieldValues>(form: UseFormReturn<T>, name: Path<T>) {
  const { ref, ...rest } = form.register(name);
  const error = get(form.formState.errors, name) as { message?: string } | undefined;

  return {
    ...rest,
    inputRef: ref,
    error: Boolean(error),
    helperText: error?.message,
  };
}
