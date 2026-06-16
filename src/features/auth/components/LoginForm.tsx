'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { zodFieldErrors } from '@/lib/zod';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
}

/** Username/password form, validated by `loginSchema` (Zod). Shared by both login pages. */
export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ username, password });
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-bold uppercase tracking-wider text-[#325969]">
          Username
        </Label>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#00ac80]">
            <User size={18} />
          </div>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            disabled={isLoading}
            suppressHydrationWarning
            className="h-12 rounded-xl border-slate-200 pl-11 font-medium focus:border-[#00ac80] focus:ring-[#00ac80]/20"
          />
        </div>
        {errors.username && <p className="text-xs font-semibold text-rose-500">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-[#325969]">
            Password
          </Label>
          <a href="#" className="text-xs font-bold text-[#00ac80] transition-colors hover:text-[#006d77]">
            Forgot Password?
          </a>
        </div>
        <div className="group relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#00ac80]">
            <Lock size={18} />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            suppressHydrationWarning
            className="h-12 rounded-xl border-slate-200 pl-11 pr-11 font-medium focus:border-[#00ac80] focus:ring-[#00ac80]/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={isLoading}
            suppressHydrationWarning
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-xs font-semibold text-rose-500">{errors.password}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00ac80] text-lg font-bold text-white shadow-[0_4px_14px_rgba(0,172,128,0.39)] transition-all hover:bg-[#006d77]"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Signing In...
          </>
        ) : (
          <>
            Sign In
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </>
        )}
      </Button>
    </form>
  );
}

export default LoginForm;
