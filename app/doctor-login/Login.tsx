'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import {
    Button,
    Input,
    Label,
} from '@/components/ui';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../Apis/Auth/doctor_auth';
import useDeviceId from '../utils/custom-hooks/UseDeviceId';
import { useEffect } from 'react';
import SnehBharatEmr_Info from '../login/SnehBharatEmr_Info';

export default function LoginPage() {
    const router = useRouter();
    const deviceId = useDeviceId();

    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (!mounted) return;
        const token = localStorage.getItem('doctor-token');
        if (token) {
            router.replace('/forDoctors/dashboard');
        }
    }, [router, mounted]);

    const loginMutation = useMutation({
        mutationFn: authApi.login,
        onSuccess: (result) => {
            if (result.response) {
                const { token, refreshToken, loginDetails } = result.data;

                localStorage.setItem('doctor-token', token);
                localStorage.setItem('doctor-refreshToken', refreshToken);
                localStorage.setItem('role', loginDetails.role);
                if (loginDetails.id != null) {
                    localStorage.setItem('doctor-id', String(loginDetails.id));
                }
                if (loginDetails.fullName?.trim()) {
                    localStorage.setItem('doctor-name', loginDetails.fullName.trim());
                }

                toast.success(result.message || 'Login successful');
                router.push('/forDoctors/dashboard');
            } else {
                toast.error(result.message || 'Login failed');
            }
        },
        onError: (error: any) => {
            toast.error(error.message || 'An error occurred during login');
        }
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error('Please enter both username and password');
            return;
        }

        if (!deviceId) {
            toast.error('Device ID not initialized');
            return;
        }

        loginMutation.mutate({
            username,
            password,
            deviceTypes: 'BROWSER',
            deviceId,
        });
    };

    const isLoading = loginMutation.isPending;

    return (
        <div className="min-h-screen bg-white xl:grid xl:grid-cols-2">
            {/* ═══ LEFT PANE: BRANDING & INFO ═══════════════════════════ */}
            <SnehBharatEmr_Info />

            {/* ═══ RIGHT PANE: LOGIN FORM ═══════════════════════════════ */}
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-8 xl:p-12 bg-light-teal/20">
                <div className="w-full max-w-[440px] space-y-10">

                    {/* Logo & Header */}
                    <div className="w-full flex items-center justify-center mb-16">
                        <Image
                            src="/images/logo.png"
                            alt="SnehBharat Logo"
                            width={280}
                            height={90}
                            className="object-contain"
                            priority
                        />
                    </div>

                    {!mounted ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-12" aria-busy="true">
                            <Loader2 className="animate-spin text-[#00ac80]" size={36} aria-hidden />
                            <p className="text-sm font-medium text-slate-500">Loading…</p>
                        </div>
                    ) : (
                    <form className="space-y-8" onSubmit={handleLogin}>
                        {/* Username */}
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-sm font-bold text-[#325969] uppercase tracking-wider">Username</Label>
                            <div className="relative group">
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
                                    className="h-12 pl-11 border-slate-200 focus:ring-[#00ac80]/20 focus:border-[#00ac80] rounded-xl font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-bold text-[#325969] uppercase tracking-wider">Password</Label>
                                <a href="#" className="text-xs font-bold text-[#00ac80] hover:text-[#006d77] transition-colors">Forgot Password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#00ac80]">
                                    <Lock size={18} />
                                </div>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    className="h-12 pl-11 pr-11 border-slate-200 focus:ring-[#00ac80]/20 focus:border-[#00ac80] rounded-xl font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-[#00ac80] hover:bg-[#006d77] text-white font-bold text-lg rounded-xl shadow-[0_4px_14px_rgba(0,172,128,0.39)] transition-all flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>
                    )}

                    {/* Footer Branding */}
                    <div className="pt-8 flex flex-col items-center space-y-6">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">
                            <ShieldCheck size={14} className="text-[#00ac80]" />
                            Protected by Enterprise-grade Security
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
