'use client';

import * as React from 'react';
import {
  X,
  HeartHandshake,
  QrCode,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  IndianRupee,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toBengaliNumerals } from '@viksit/shared';
import { useAuth } from '@/components/auth/AuthContext';

interface SabaiFoundationModalProps {
  locale?: string;
  isOpen?: boolean;
  onClose?: () => void;
  enableGlobalTrigger?: boolean;
}

const GOOGLE_FORM_URL = 'https://forms.gle/vrJas5mxUJ1KLgRx8';
const SABAI_UPI_ID = '81k1byfou2ce@mahb';
const QR_IMAGE_PATH = '/assets/aistudio/sabai_foundation_qr_code_2c6d9e01.jpeg';

export function openSabaiFoundationModal(source?: string | React.MouseEvent<HTMLElement>) {
  if (typeof window !== 'undefined') {
    const resolvedSource = typeof source === 'string' ? source : 'button';
    window.dispatchEvent(new CustomEvent('open-sabai-modal', { detail: { source: resolvedSource } }));
  }
}

export function SabaiFoundationModal({
  locale = 'en',
  isOpen: controlledOpen,
  onClose,
  enableGlobalTrigger = false,
}: SabaiFoundationModalProps) {
  const isBn = locale === 'bn';
  const { isAuthModalOpen, authLoading } = useAuth();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isOpen = mounted && (controlledOpen !== undefined ? controlledOpen : internalOpen);

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [districtCode, setDistrictCode] = React.useState('KOL');
  const [amountInr, setAmountInr] = React.useState<number>(500);
  const [utrNumber, setUtrNumber] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submittedRecord, setSubmittedRecord] = React.useState<any | null>(null);
  const [copiedUpi, setCopiedUpi] = React.useState(false);
  const [qrLoadError, setQrLoadError] = React.useState(false);

  React.useEffect(() => {
    // If sign in is active or auth modal is open, forcibly close donate modal!
    if (isAuthModalOpen || authLoading) {
      setInternalOpen(false);
    }
  }, [isAuthModalOpen, authLoading]);

  const num = (val: number | string) => (isBn ? toBengaliNumerals(val) : String(val));

  const lastClosedAtRef = React.useRef<number>(0);

  const isAuthBusy = React.useCallback(() => {
    if (isAuthModalOpen || authLoading) return true;
    if (typeof window !== 'undefined') {
      if ((window as any).__SUPPRESS_DONATE_POPUP__) return true;
      if (document.querySelector('[role="dialog"][aria-labelledby="auth-barrier-title"]')) return true;
      if (document.querySelector('#auth-barrier-title')) return true;
    }
    return false;
  }, [isAuthModalOpen, authLoading]);

  const triggerModal = React.useCallback(() => {
    // Cooldown check: don't trigger if user just clicked close within the last 1.5 seconds
    if (Date.now() - lastClosedAtRef.current < 1500) return;

    // Never show donate popup when user is signing in or the auth dialog is active
    if (isAuthBusy()) {
      setInternalOpen(false);
      return;
    }

    setInternalOpen(true);
  }, [isAuthBusy]);

  const handleClose = React.useCallback(() => {
    lastClosedAtRef.current = Date.now();
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  }, [onClose]);

  React.useEffect(() => {
    if (!enableGlobalTrigger) return;

    // 1. Mouse leaves the viewport (e.g. moving cursor to address bar, tabs, taskbar, or outside browser)
    const handleMouseLeave = (e: MouseEvent) => {
      if (isAuthBusy()) return;
      if (
        !e.relatedTarget ||
        e.clientY <= 0 ||
        e.clientY >= (window.innerHeight - 5) ||
        e.clientX <= 0 ||
        e.clientX >= (window.innerWidth - 5)
      ) {
        triggerModal();
      }
    };

    // 2. Window loses focus (e.g. clicking taskbar, checking time, clicking URL bar, switching apps)
    const handleWindowBlur = () => {
      // If user clicked Google Sign-In or a popup window opened, do NOT show donate modal
      if (isAuthBusy()) return;
      triggerModal();
    };

    // 3. Tab visibility changes (e.g. user checks another window/tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isAuthBusy()) return;
        triggerModal();
      }
    };

    // 4. Custom event for manual button clicks
    const handleCustomOpen = () => {
      setInternalOpen(true);
    };

    window.addEventListener('open-sabai-modal', handleCustomOpen);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('open-sabai-modal', handleCustomOpen);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enableGlobalTrigger, triggerModal, isAuthBusy]);

  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SABAI_UPI_ID);
      }
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2200);
    } catch {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amountInr < 500) {
      setError(
        isBn
          ? 'সাবাই ফাউন্ডেশনের আজীবন সদস্যপদের ন্যূনতম ফি ₹৫০০ হতে হবে।'
          : 'Minimum Sabai Foundation Lifetime Membership fee is ₹500.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          districtCode,
          amountInr,
          utrNumber,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Submission failed');
      }
      setSubmittedRecord(data.record);
    } catch (err: any) {
      setError(err.message || 'Could not submit membership details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Quick-Open Pill when Global Trigger is enabled and modal is closed */}
      {enableGlobalTrigger && !isOpen && (
        <div className="fixed bottom-6 left-4 sm:left-6 z-40">
          <button
            type="button"
            onClick={() => setInternalOpen(true)}
            aria-label={
              isBn
                ? 'সাবাই ফাউন্ডেশন সদস্যপদ ও অনুদান পপ-আপ খুলুন'
                : 'Open Sabai Foundation Membership & Donate Pop-up'
            }
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-xl border-2 border-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-stone-950 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">
              {isBn
                ? 'Donate to SABAI Foundation. · অনুদান দিন'
                : 'Donate to SABAI Foundation.'}
            </span>
          </button>
        </div>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sabai-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs overflow-y-auto"
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleClose();
          }}
        >
          <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Top Emerald & Saffron Institutional Header */}
            <div className="bg-primary text-white px-5 sm:px-7 py-5 border-b border-emerald-900 flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>
                    {isBn
                      ? 'সাবাই ফাউন্ডেশন · আজীবন সদস্যপদ ও নাগরিক অনুদান'
                      : 'SABAI FOUNDATION · LIFETIME MEMBERSHIP & CITIZEN SUPPORT'}
                  </span>
                </div>
                <h2
                  id="sabai-modal-title"
                  className="text-xl sm:text-2xl font-black tracking-tight text-white"
                >
                  {isBn
                    ? 'Donate to SABAI Foundation. — সাবাই ফাউন্ডেশনে অনুদান দিন'
                    : 'Donate to SABAI Foundation.'}
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
                  {isBn
                    ? 'বিকশিত বাংলা ২০৪৭ উন্মুক্ত তথ্য ও গবেষণা কার্যক্রম সচল রাখতে ন্যূনতম ₹৫০০ আজীবন সদস্যপদ ফি প্রদান করে সাবাই ফাউন্ডেশনে যুক্ত হোন।'
                    : 'Become a Lifetime Member of Sabai Foundation with a minimum ₹500 lifetime membership fee to sustain independent governance tracking for Vision 2033 & 2047.'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label={isBn ? 'পপ-আপ বন্ধ করুন' : 'Close pop-up'}
                className="min-h-[40px] min-w-[40px] rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2-Column Split (Left: QR Code & Google Form CTA, Right: Lifetime Membership Form) */}
            <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 Cols): Official SABAI Foundation QR Code + UPI + Google Form Link */}
              <div className="lg:col-span-5 rounded-2xl bg-stone-50 border border-stone-200 p-4 sm:p-5 space-y-4">
                <div className="text-center space-y-1">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-primary">
                    {isBn ? 'সাবাই ফাউন্ডেশন অফিসিয়াল কিউআর কোড' : 'SABAI FOUNDATION — SCAN & PAY'}
                  </div>
                  <p className="text-xs font-semibold text-stone-700">
                    {isBn
                      ? 'Donate to SABAI Foundation. — সাবাই ফাউন্ডেশনে অনুদান দিন'
                      : 'Donate to SABAI Foundation.'}
                  </p>
                </div>

                {/* QR Code Image Frame */}
                <div className="bg-white rounded-xl border-2 border-emerald-600/40 p-3 shadow-xs flex flex-col items-center justify-center">
                  {!qrLoadError ? (
                    <img
                      src={QR_IMAGE_PATH}
                      alt="SABAI FOUNDATION Scan and Pay UPI QR Code - UPI ID 81k1byfou2ce@mahb"
                      referrerPolicy="no-referrer"
                      onError={() => setQrLoadError(true)}
                      className="w-full max-w-[250px] h-auto rounded-lg object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-full max-w-[240px] py-8 px-4 text-center space-y-2 bg-emerald-50 rounded-lg border border-emerald-200">
                      <QrCode className="w-12 h-12 text-primary mx-auto" />
                      <div className="font-bold text-sm text-stone-900">SABAI FOUNDATION</div>
                      <div className="text-xs font-mono text-primary font-bold">{SABAI_UPI_ID}</div>
                    </div>
                  )}
                </div>

                {/* Copyable UPI ID Box */}
                <div className="p-3 rounded-xl bg-white border border-stone-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      {isBn ? 'ইউপিআই আইডি (UPI ID)' : 'Official Bank of Maharashtra UPI ID'}
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-black text-stone-950 truncate">
                      {SABAI_UPI_ID}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isBn ? 'কপি' : 'Copy UPI'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Google Form Button */}
                <div className="pt-2 border-t border-stone-200 space-y-2">
                  <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>
                      {isBn
                        ? 'অফিসিয়াল গুগল ফর্মের মাধ্যমেও সদস্যপদ নিবন্ধন করুন:'
                        : 'Official Google Form for Sabai Foundation Membership:'}
                    </span>
                  </div>
                  <a
                    href={GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span>
                      {isBn
                        ? 'গুগল ফর্ম খুলুন (forms.gle/vrJas5mxUJ1KLgRx8)'
                        : 'Fill Official Google Form (forms.gle)'}
                    </span>
                    <ExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* Right Column (7 Cols): Interactive Lifetime Membership Form (Min ₹500) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-stone-200 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-extrabold text-stone-950">
                      {isBn
                        ? 'সাবাই ফাউন্ডেশন আজীবন সদস্যপদ ফর্ম'
                        : 'Sabai Foundation Lifetime Membership Form'}
                    </h3>
                    <span className="text-xs font-mono font-bold text-primary bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      {isBn ? 'ন্যূনতম ফি: ₹৫০০' : 'Min. Fee: ₹500 Lifetime'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    {isBn
                      ? 'বাম পাশের QR কোড স্ক্যান করে ন্যূনতম ₹৫০০ বা তার বেশি অনুদান প্রদান করুন এবং নিচের ফর্মটি পূরণ করুন অথবা সরাসরি গুগল ফর্ম ব্যবহার করুন।'
                      : 'Scan the Sabai Foundation QR code to pay your lifetime membership fee (minimum ₹500), then record your details below or via the Google Form.'}
                  </p>
                </div>

                {submittedRecord ? (
                  <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-7 h-7 text-primary shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-base font-black text-emerald-950">
                          {isBn
                            ? 'সাবাই ফাউন্ডেশনে আপনার আজীবন সদস্যপদ আবেদন গৃহীত হয়েছে!'
                            : 'Thank You! Your Sabai Foundation Lifetime Membership is Recorded'}
                        </h4>
                        <p className="text-xs text-emerald-900 leading-relaxed">
                          {isBn
                            ? `সদস্য আইডি: ${submittedRecord.id} · প্রদত্ত অনুদান: ₹${num(submittedRecord.amountInr)}। চূড়ান্ত যাচাইকরণের জন্য অনুগ্রহ করে অফিসিয়াল গুগল ফর্মটিও পূরণ করুন।`
                            : `Membership Reference: ${submittedRecord.id} · Contribution: ₹${submittedRecord.amountInr.toLocaleString('en-IN')}. Please also complete our official Google Form below to finalize your membership certificate.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <a
                        href={GOOGLE_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[44px] px-5 py-2.5 rounded-xl bg-primary hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm"
                      >
                        <span>
                          {isBn
                            ? 'অফিসিয়াল গুগল ফর্ম সম্পূর্ণ করুন'
                            : 'Complete Official Google Form Now'}
                        </span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSubmittedRecord(null);
                          setFullName('');
                          setEmail('');
                          setPhone('');
                          setUtrNumber('');
                        }}
                      >
                        {isBn ? 'নতুন ফর্ম' : 'Register Another Member'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Preset Contribution / Membership Tiers (Min ₹500) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-2">
                        {isBn
                          ? 'আজীবন সদস্যপদ ও অনুদানের পরিমাণ নির্বাচন করুন (ন্যূনতম ₹৫০০) *'
                          : 'Select Lifetime Membership & Contribution Amount (Min. ₹500) *'}
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2.5">
                        {[
                          { amt: 500, labelEn: '₹500 · Lifetime Min.', labelBn: '₹৫০০ · আজীবন ফি' },
                          { amt: 1000, labelEn: '₹1,000 · Patron', labelBn: '₹১,০০০ · পৃষ্ঠপোষক' },
                          { amt: 2500, labelEn: '₹2,500 · Fellow', labelBn: '₹২,৫০০ · ফেলো' },
                          { amt: 5000, labelEn: '₹5,000 · Pillar', labelBn: '₹৫,০০০ · স্তম্ভ' },
                        ].map((tier) => (
                          <button
                            key={tier.amt}
                            type="button"
                            onClick={() => setAmountInr(tier.amt)}
                            className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              amountInr === tier.amt
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {isBn ? tier.labelBn : tier.labelEn}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-stone-600 text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min={500}
                          step={50}
                          value={amountInr}
                          onChange={(e) => setAmountInr(Number(e.target.value))}
                          className="w-full min-h-[44px] pl-8 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold text-stone-950 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                          aria-label="Lifetime membership contribution amount in INR (minimum 500)"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        {isBn
                          ? 'ন্যূনতম ₹৫০০ আজীবন সদস্যপদ ফি প্রযোজ্য। আপনি চাইলে আমাদের কাজ এগিয়ে নিতে আরও বেশি অনুদান দিতে পারেন।'
                          : 'Minimum ₹500 required for Sabai Foundation Lifetime Membership. Higher contributions directly fund district-level policy research.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {isBn ? 'পূর্ণ নাম (Full Name) *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your full name'}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {isBn ? 'ইমেল ঠিকানা (Email) *' : 'Email Address *'}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {isBn ? 'ফোন / হোয়াটসঅ্যাপ নম্বর *' : 'Phone / WhatsApp Number *'}
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98XXXXXXXX"
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {isBn ? 'ইউপিআই ট্রানজ্যাকশন / UTR নম্বর' : 'UPI Transaction / UTR Ref (After Scan)'}
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder={isBn ? '১২-সংখ্যার UTR বা রেফারেন্স' : '12-digit UPI Ref / UTR ID'}
                          className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-stone-300 font-mono text-xs sm:text-sm text-stone-950 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {error && (
                      <div
                        role="alert"
                        className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-900"
                      >
                        {error}
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-primary hover:bg-emerald-900 text-white font-bold min-h-[46px] px-6 cursor-pointer"
                      >
                        <HeartHandshake className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span>
                          {submitting
                            ? isBn
                              ? 'জমা হচ্ছে...'
                              : 'Registering Membership...'
                            : isBn
                              ? `আজীবন সদস্যপদ নিবন্ধন করুন (₹${num(amountInr)})`
                              : `Submit Lifetime Membership (₹${amountInr.toLocaleString('en-IN')})`}
                        </span>
                      </Button>

                      <a
                        href={GOOGLE_FORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[46px] px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>
                          {isBn ? 'গুগল ফর্মে পূরণ করুন' : 'Open Google Form Instead'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
