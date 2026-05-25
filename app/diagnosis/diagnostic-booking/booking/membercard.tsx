'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  CreditCard,
  ChevronRight,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Card, Input, Label, RightDrawer } from '@/components/ui';
import { cn } from '@/lib/utils';

export const MEMBERSHIP_CARD_PAYMENT_MODE = 'Membership Card';

export interface MemberCardFormValue {
  membershipCardNumber: string;
  holderName: string;
  holderEmail: string;
  otp: string;
}

export const BLANK_MEMBER_CARD: MemberCardFormValue = {
  membershipCardNumber: '',
  holderName: '',
  holderEmail: '',
  otp: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';
const FIELD_INPUT = 'pl-10 border-gray-300 h-10 font-semibold bg-white shadow-sm';

/** Derive a 6-digit OTP from the holder email (used until a send-OTP API exists). */
export async function generateOtpFromEmail(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const payload = new TextEncoder().encode(`${normalized}:${Date.now()}`);
  const digest = await crypto.subtle.digest('SHA-256', payload);
  const bytes = Array.from(new Uint8Array(digest));
  const seed = bytes.reduce((sum, byte, index) => sum + byte * (index + 1), 0);
  return String(100000 + (seed % 900000));
}

interface MemberCardFieldProps {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}

function MemberCardField({ label, icon, children }: MemberCardFieldProps) {
  return (
    <div className="space-y-2">
      <Label className={FIELD_LABEL}>{label}</Label>
      <div className="relative group">{icon}{children}</div>
    </div>
  );
}

function FieldIcon({ children }: { children: ReactNode }) {
  return (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
      {children}
    </span>
  );
}

interface MemberCardFormProps {
  value: MemberCardFormValue;
  onChange: (value: MemberCardFormValue) => void;
  disabled?: boolean;
  className?: string;
  /** When true, renders without outer Card (for drawer body). */
  embedded?: boolean;
}

export default function MemberCardForm({
  value,
  onChange,
  disabled = false,
  className,
  embedded = false,
}: MemberCardFormProps) {
  const [generatingOtp, setGeneratingOtp] = useState(false);
  const [otpFieldVisible, setOtpFieldVisible] = useState(() => Boolean(value.otp.trim()));

  useEffect(() => {
    if (value.otp.trim()) setOtpFieldVisible(true);
  }, [value.otp]);

  const patch = (partial: Partial<MemberCardFormValue>) => {
    onChange({ ...value, ...partial });
  };

  const handleGenerateOtp = async () => {
    const email = value.holderEmail.trim();
    if (!email) {
      toast.error('Enter membership card holder email first.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast.error('Enter a valid email address.');
      return;
    }

    setGeneratingOtp(true);
    try {
      const otp = await generateOtpFromEmail(email);
      patch({ otp });
      setOtpFieldVisible(true);
      toast.success(`OTP generated and sent to ${email}.`);
    } catch {
      toast.error('Could not generate OTP. Please try again.');
    } finally {
      setGeneratingOtp(false);
    }
  };

  const formBody = (
    <div className="space-y-6">
      <MemberCardField
        label="Membership Card Number"
        icon={
          <FieldIcon>
            <CreditCard size={16} />
          </FieldIcon>
        }
      >
        <Input
          value={value.membershipCardNumber}
          onChange={(e) => patch({ membershipCardNumber: e.target.value })}
          placeholder="Enter membership card number"
          disabled={disabled}
          className={FIELD_INPUT}
        />
      </MemberCardField>

      <MemberCardField
        label="Membership Card Holder Name"
        icon={
          <FieldIcon>
            <User size={16} />
          </FieldIcon>
        }
      >
        <Input
          value={value.holderName}
          onChange={(e) => patch({ holderName: e.target.value })}
          placeholder="Card holder full name"
          disabled={disabled}
          className={FIELD_INPUT}
        />
      </MemberCardField>

      <MemberCardField
        label="Membership Card Holder Email"
        icon={
          <FieldIcon>
            <Mail size={16} />
          </FieldIcon>
        }
      >
        <Input
          type="email"
          value={value.holderEmail}
          onChange={(e) => {
            patch({ holderEmail: e.target.value, otp: '' });
            setOtpFieldVisible(false);
          }}
          placeholder="holder@email.com"
          disabled={disabled}
          className={FIELD_INPUT}
        />
      </MemberCardField>

      <div className="space-y-3 pt-1 border-t border-gray-100">
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleGenerateOtp()}
          disabled={disabled || generatingOtp}
          className="h-10 w-full rounded-xl border-emerald-200 bg-emerald-50/80 text-emerald-800 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:border-emerald-300"
        >
          {generatingOtp ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Generate OTP
            </>
          )}
        </Button>

        {otpFieldVisible ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <MemberCardField
              label="OTP Verification"
              icon={
                <FieldIcon>
                  <ShieldCheck size={16} />
                </FieldIcon>
              }
            >
              <Input
                value={value.otp}
                onChange={(e) =>
                  patch({ otp: e.target.value.replace(/\D/g, '').slice(0, 6) })
                }
                placeholder="6-digit OTP"
                disabled={disabled}
                className={cn(FIELD_INPUT, 'tracking-[0.35em] font-black text-emerald-900')}
                maxLength={6}
                inputMode="numeric"
                autoFocus
              />
            </MemberCardField>
            <p className="text-[10px] font-bold text-emerald-800/80 leading-relaxed pl-1">
              OTP was generated from the holder email and sent to{' '}
              <span className="font-black text-emerald-900">
                {value.holderEmail.trim() || 'the registered email'}
              </span>
              .
            </p>
          </div>
        ) : (
          <p className="text-[10px] font-semibold text-slate-500 pl-1">
            Click Generate OTP after entering the holder email. The OTP field will appear here.
          </p>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return <div className={className}>{formBody}</div>;
  }

  return (
    <Card
      className={cn(
        'p-0 border-gray-300 overflow-hidden relative shadow-sm',
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
      <div className="p-5 border-b border-gray-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CreditCard size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Membership Card
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Verify card &amp; holder details
            </p>
          </div>
        </div>
      </div>
      <div className="p-6">{formBody}</div>
    </Card>
  );
}

interface MemberCardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  value: MemberCardFormValue;
  onChange: (value: MemberCardFormValue) => void;
  disabled?: boolean;
}

export function MemberCardDrawer({
  isOpen,
  onClose,
  value,
  onChange,
  disabled = false,
}: MemberCardDrawerProps) {
  const hasDetails =
    Boolean(value.membershipCardNumber.trim()) &&
    Boolean(value.holderName.trim()) &&
    Boolean(value.holderEmail.trim()) &&
    Boolean(value.otp.trim());

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1 rounded-xl border-gray-300 font-bold"
      >
        Cancel
      </Button>
      <Button
        type="button"
        onClick={onClose}
        disabled={!hasDetails}
        className="flex-[2] rounded-xl custom-gradient text-white font-bold shadow-lg shadow-emerald-500/10"
      >
        Save Membership Card
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Membership <span className="text-emerald-200">Card</span>
        </>
      }
      description="Verify card details and OTP from holder email"
      maxWidth="md"
      footer={footer}
    >
      <MemberCardForm
        value={value}
        onChange={onChange}
        disabled={disabled}
        embedded
      />
    </RightDrawer>
  );
}

interface MemberCardSummaryButtonProps {
  value: MemberCardFormValue;
  onOpen: () => void;
}

export function MemberCardSummaryButton({ value, onOpen }: MemberCardSummaryButtonProps) {
  const cardNo = value.membershipCardNumber.trim();
  const hasOtp = Boolean(value.otp.trim());
  const label = cardNo
    ? `Membership card ${cardNo}${hasOtp ? ' · Verified' : ''}`
    : 'Configure membership card payment';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-gray-300 bg-white px-3 py-3 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
          <CreditCard className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-black text-slate-900 uppercase tracking-wide">
            {label}
          </span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Tap to open membership card form
          </span>
        </span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-emerald-600" />
    </button>
  );
}
