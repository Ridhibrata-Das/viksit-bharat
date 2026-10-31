'use client';

import * as React from 'react';
import {
  HeartHandshake,
  QrCode,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toBengaliNumerals } from '@viksit/shared';

export const SABAI_GOOGLE_FORM_URL = 'https://forms.gle/vrJas5mxUJ1KLgRx8';
export const SABAI_UPI_ID = '81k1byfou2ce@mahb';
export const SABAI_QR_IMAGE_PATH =
  '/assets/aistudio/sabai_foundation_qr_code_2c6d9e01.jpeg';

interface SabaiMembershipModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  locale?: string;
}

export function triggerSabaiMembershipModal() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-sabai-membership'));
  }
}

export function SabaiMembershipModal({
  isOpen: controlledIsOpen,
  onClose,
  locale = 'en',
}: SabaiMembershipModalProps) {
  const isBn = locale === 'bn';
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;

  const [amount, setAmount] = React.useState<number>(500);
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [district, setDistrict] = React.useState('KOL');
  const [utrNumber, setUtrNumber] = React.useState('');
  const [copiedUpi, setCopiedUpi] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const fmt = (val: number | string) =>
    isBn ? toBengaliNumerals(val) : String(val);

  React.useEffect(() => {
    const handleOpenEvent = () => {
      setInternalOpen(true);
      setSubmitted(false);
      setErrorMsg(null);
    };
    window.addEventListener('open-sabai-membership', handleOpenEvent);
    return () =>
      window.removeEventListener('open-sabai-membership', handleOpenEvent);
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalOpen(false);
    }
  };

  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SABAI_UPI_ID);
      }
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const handleSubmitMembership = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (Number(amount) < 500) {
      setErrorMsg(
        isBn
          ? 'সাবাই ফাউন্ডেশনের আজীবন সদস্যপদের জন্য ন্যূনতম ₹৫০০ ফি আবশ্যক।'
          : 'Minimum ₹500 contribution is required for Sabai Foundation Lifetime Membership.'
      );
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg(
        isBn
          ? 'অনুগ্রহ করে আপনার নাম এবং ফোন নম্বর প্রদান করুন।'
          : 'Please enter your full name and phone/WhatsApp number.'
      );
      return;
    }

    setSubmitted(true);
  };

  if (!isOpen) return null;

  const presetAmounts = [
    { value: 500, labelEn: '₹500 · Lifetime Member (Min)', labelBn: '₹৫০০ · আজীবন সদস্য (ন্যূনতম)' },
    { value: 1000, labelEn: '₹1,000 · Patron Member', labelBn: '₹১,০০০ · পৃষ্ঠপোষক সদস্য' },
    { value: 2500, labelEn: '₹2,500 · Research Fellow', labelBn: '₹২,৫০০ · রিসার্চ ফেলো' },
    { value: 5000, labelEn: '₹5,000 · Vision 2047 Pillar', labelBn: '₹৫,০০০ · ভিশন ২০৪৭ স্তম্ভ' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sabai-membership-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/75 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border-2 border-emerald-800/30 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Emerald Banner */}
        <div className="bg-primary text-white px-5 sm:px-7 py-4 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-emerald-950 text-emerald-200 border border-emerald-700 text-[10px] uppercase tracking-wider font-bold">
                <Sparkles className="w-3 h-3 mr-1 inline" />
                {isBn
                  ? 'সাবাই ফাউন্ডেশন · আজীবন সদস্যপদ ও অনুদান'
                  : 'SABAI FOUNDATION · LIFETIME MEMBERSHIP & SUPPORT'}
              </Badge>
              <span className="text-xs font-mono text-emerald-200">
                {isBn ? 'ন্যূনতম আজীবন সদস্যপদ ফি: ₹৫০০' : 'Min. Lifetime Membership Fee: ₹500'}
              </span>
            </div>
            <h2
              id="sabai-membership-title"
              className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2"
            >
              <HeartHandshake className="w-6 h-6 text-emerald-300 shrink-0" />
              <span>
                {isBn
                  ? 'আমাদের এই কাজ চালিয়ে যেতে অনুদান দিন — সাবাই ফাউন্ডেশন'
                  : 'Donate to let us continue with this work — Sabai Foundation'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl">
              {isBn
                ? 'বিকশিত বাংলা ২০৪৭ (২০৩৩ সালের মধ্যে ₹৮৫ লক্ষ কোটি / $1T এবং ২০৪৭ সালের মধ্যে ₹৪২৫ লক্ষ কোটি / $5T জিএসডিপি) গবেষণা ও স্বাধীন নাগরিক পর্যবেক্ষণকে শক্তিশালী করতে সাবাই ফাউন্ডেশনের আজীবন সদস্য হোন।'
                : 'Support independent civic governance tracking and Vision 2047 economic research across all 23 districts of West Bengal with a Lifetime Membership (minimum ₹500).'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={isBn ? 'পপআপ বন্ধ করুন' : 'Close membership modal'}
            className="p-2 rounded-lg bg-emerald-900/70 hover:bg-emerald-950 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Layout (QR Code Scan & Pay + Membership Form & Google Form Link) */}
        <div className="p-5 sm:p-7 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 Cols): Official SABAI FOUNDATION QR Code & UPI Box */}
          <div className="lg:col-span-5 rounded-2xl border-2 border-emerald-600/40 bg-emerald-50/40 p-4 sm:p-5 flex flex-col items-center text-center space-y-4">
            <div className="space-y-1">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                {isBn ? 'স্ক্যান ও পে করুন (UPI / QR)' : 'OFFICIAL SABAI FOUNDATION QR'}
              </div>
              <div className="text-sm sm:text-base font-black text-ink">
                {isBn
                  ? 'আমাদের এই কাজ চালিয়ে যেতে অনুদান দিন'
                  : 'Donate to let us continue with this work'}
              </div>
            </div>

            {/* Uploaded Sabai Foundation QR Code Image */}
            <div className="w-full max-w-[260px] rounded-xl overflow-hidden border-2 border-emerald-600 bg-white shadow-md p-2">
              <img
                src={SABAI_QR_IMAGE_PATH}
                alt="SABAI FOUNDATION Scan & Pay QR Code - UPI ID: 81k1byfou2ce@mahb"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Copyable UPI ID Box */}
            <div className="w-full p-3 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2">
              <div className="text-[11px] font-bold text-stone-500 uppercase">
                {isBn ? 'ইউপিআই আইডি (UPI ID)' : 'Official Bank of Maharashtra UPI ID'}
              </div>
              <div className="flex items-center justify-between gap-2 bg-stone-100 px-3 py-2 rounded-lg border border-stone-200">
                <span className="font-mono text-xs sm:text-sm font-bold text-ink select-all">
                  {SABAI_UPI_ID}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-white text-xs font-bold hover:bg-emerald-900 transition-colors shrink-0"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBn ? 'কপি' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-stone-600 leading-snug">
                {isBn
                  ? 'যেকোনো UPI অ্যাপ (GPay, PhonePe, Paytm, BHIM) দিয়ে QR কোডটি স্ক্যান করে ন্যূনতম ₹৫০০ প্রদান করুন।'
                  : 'Scan with GPay, PhonePe, Paytm, or BHIM to pay your minimum ₹500 Lifetime Membership or donation.'}
              </p>
            </div>

            {/* Direct Google Form Button under QR */}
            <a
              href={SABAI_GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors"
            >
              <span>
                {isBn
                  ? 'অফিশিয়াল গুগল মেম্বারশিপ ফর্ম পূরণ করুন'
                  : 'Fill Official Membership Google Form'}
              </span>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>
          </div>

          {/* Right Column (7 Cols): Lifetime Membership Form & Google Form Registration */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-primary uppercase tracking-wide">
                  {isBn ? 'ধাপ ১ ও ২: পেমেন্ট এবং গুগল ফর্ম নিবন্ধন' : 'Step 1 & 2: Scan QR & Register Membership'}
                </div>
                <div className="text-xs text-stone-600">
                  {isBn
                    ? 'পেমেন্টের পর নিচের ফর্মটি পূরণ করুন অথবা সরাসরি আমাদের অফিশিয়াল গুগল ফর্মে আপনার তথ্য জমা দিন।'
                    : 'Complete your ₹500+ Lifetime Membership below or submit directly via our official Sabai Foundation Google Form.'}
                </div>
              </div>
              <a
                href={SABAI_GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-emerald-900 shrink-0 self-start sm:self-center"
              >
                <span>{isBn ? 'গুগল ফর্ম খুলুন' : 'Open Google Form'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-xs font-semibold text-red-950 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-ink">
                    {isBn
                      ? `ধন্যবাদ, ${fullName}! আপনার আজীবন সদস্যপদ নিবন্ধন গৃহীত হয়েছে`
                      : `Thank You, ${fullName}! Your Lifetime Membership Pledge is Recorded`}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-700 max-w-md mx-auto">
                    {isBn
                      ? `আপনার নির্বাচিত অনুদান: ₹${fmt(amount)}। চূড়ান্ত যাচাইকরণের জন্য অনুগ্রহ করে অফিশিয়াল সাবাই ফাউন্ডেশন গুগল ফর্মটিও সাবমিট করুন।`
                      : `Selected Lifetime Membership Contribution: ₹${amount.toLocaleString('en-IN')}. Please also complete the official Sabai Foundation Google Form to finalize your membership certificate.`}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={SABAI_GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm"
                  >
                    <span>
                      {isBn
                        ? 'অফিশিয়াল গুগল ফর্মে সম্পূর্ণ করুন (forms.gle)'
                        : 'Complete Official Google Form (forms.gle)'}
                    </span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSubmitted(false)}
                  >
                    {isBn ? 'ফর্মে ফিরে যান' : 'Edit Details'}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitMembership} className="space-y-4">
                {/* Preset Lifetime Membership Fee Tiers */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    {isBn
                      ? 'আজীবন সদস্যপদ ও অনুদানের পরিমাণ নির্বাচন করুন (ন্যূনতম ₹৫০০) *'
                      : 'Select Lifetime Membership / Donation Amount (Minimum ₹500) *'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {presetAmounts.map((tier) => (
                      <button
                        key={tier.value}
                        type="button"
                        onClick={() => setAmount(tier.value)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                          amount === tier.value
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-400'
                        }`}
                      >
                        {isBn ? tier.labelBn : tier.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Input (Min ₹500) & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'পরিমাণ (₹ টাকা — ন্যূনতম ₹৫০০) *' : 'Contribution Amount (₹ INR — Min ₹500) *'}
                    </label>
                    <input
                      type="number"
                      min={500}
                      step={100}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value) || 500)}
                      className="w-full min-h-[42px] px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono font-bold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'আপনার জেলা (পশ্চিমবঙ্গ)' : 'Your District (West Bengal)'}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full min-h-[42px] px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="KOL">Kolkata (কলকাতা)</option>
                      <option value="N24">North 24 Parganas (উত্তর ২৪ পরগনা)</option>
                      <option value="S24">South 24 Parganas (দক্ষিণ ২৪ পরগনা)</option>
                      <option value="HOW">Howrah (হাওড়া)</option>
                      <option value="HOG">Hooghly (হুগলি)</option>
                      <option value="DAR">Darjeeling (দার্জিলিং)</option>
                      <option value="EMD">Purba Medinipur (পূর্ব মেদিনীপুর)</option>
                      <option value="PMD">Paschim Medinipur (পশ্চিম মেদিনীপুর)</option>
                      <option value="PBD">Paschim Bardhaman (পশ্চিম বর্ধমান)</option>
                      <option value="EBD">Purba Bardhaman (পূর্ব বর্ধমান)</option>
                      <option value="NAD">Nadia (নদিয়া)</option>
                      <option value="MSD">Murshidabad (মুর্শিদাবাদ)</option>
                      <option value="MLD">Malda (মালদা)</option>
                      <option value="JAL">Jalpaiguri (জলপাইগুড়ি)</option>
                      <option value="COB">Cooch Behar (কোচবিহার)</option>
                      <option value="PUR">Purulia (পুরুলিয়া)</option>
                      <option value="BNK">Bankura (বাঁকুড়া)</option>
                      <option value="BIR">Birbhum (বীরভূম)</option>
                    </select>
                  </div>
                </div>

                {/* Member Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'পূর্ণ নাম *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your full name'}
                      className="w-full min-h-[42px] px-3 py-2 border border-stone-300 rounded-lg text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'ফোন / হোয়াটসঅ্যাপ নম্বর *' : 'Phone / WhatsApp Number *'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full min-h-[42px] px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {/* Email & UPI Transaction ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'ইমেল ঠিকানা' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="member@example.com"
                      className="w-full min-h-[42px] px-3 py-2 border border-stone-300 rounded-lg text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {isBn ? 'ইউপিআই রেফারেন্স / UTR নম্বর (ঐচ্ছিক)' : 'UPI Ref / UTR Number (After Scan)'}
                    </label>
                    <input
                      type="text"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      placeholder="12-digit UPI UTR ID"
                      className="w-full min-h-[42px] px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Submit & Google Form Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    type="submit"
                    className="flex-1 min-h-[46px] bg-primary hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span>
                      {isBn
                        ? `সাবাই ফাউন্ডেশন আজীবন সদস্যপদ নিবন্ধন করুন (₹${fmt(amount)})`
                        : `Register Lifetime Membership (₹${amount.toLocaleString('en-IN')})`}
                    </span>
                  </Button>

                  <a
                    href={SABAI_GOOGLE_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 min-h-[46px] px-4 py-2 rounded-xl border-2 border-primary text-primary hover:bg-emerald-50 font-bold text-xs sm:text-sm transition-colors"
                  >
                    <span>{isBn ? 'গুগল ফর্ম লিংক' : 'Google Form Link'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
