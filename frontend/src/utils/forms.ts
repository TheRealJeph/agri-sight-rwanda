import type { UseFormRegisterReturn } from 'react-hook-form';

/** Adapt react-hook-form's register() result to MUI TextField (the ref must go to the input, not the wrapper). */
export function field(reg: UseFormRegisterReturn) {
  const { ref, ...rest } = reg;
  return { ...rest, inputRef: ref };
}
