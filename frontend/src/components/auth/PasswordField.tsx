import { useState } from 'react';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { Eye, EyeOff, Lock } from 'lucide-react';

/** Password input with a show/hide toggle (keyboard accessible). */
export default function PasswordField(props: TextFieldProps) {
  const [show, setShow] = useState(false);
  return (
    <TextField
      fullWidth {...props} type={show ? 'text' : 'password'}
      slotProps={{ input: {
        startAdornment: <InputAdornment position="start"><Lock size={18} aria-hidden /></InputAdornment>,
        endAdornment: <InputAdornment position="end">
          <IconButton edge="end" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton>
        </InputAdornment> } }}
    />
  );
}
