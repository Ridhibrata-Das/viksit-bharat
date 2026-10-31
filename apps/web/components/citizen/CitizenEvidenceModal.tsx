'use client';

import React, { useState } from 'react';
import { submitCitizenEvidence } from '../../lib/api';
import { Button } from '../ui/button';
import { X, CheckCircle2, AlertCircle, FileText, Send } from 'lucide-react';

interface CitizenEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPromiseCode?: string;
  locale: string;
}

export function CitizenEvidenceModal({
  isOpen,
  onClose,
  defaultPromiseCode = '',
  locale,
}: CitizenEvidenceModalProps) {
  const [promiseCode, setPromiseCode] = useState(defaultPromiseCode);
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !promiseCode.trim()) {
      setError(locale === 'bn' ? 'প্রতিশ্রুতি কোড এবং শিরোনাম বাধ্যতামূলক।' : 'Promise code and title are required.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await submitCitizenEvidence({
        promiseCode: promiseCode.trim().toUpperCase(),
        title: title.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        excerpt: excerpt.trim() || undefined,
        submitterEmail: submitterEmail.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setTitle('');
        setSourceUrl('');
        setExcerpt('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isBn = locale === 'bn';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="citizen-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="relative w-full max-w-lg p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          aria-label={isBn ? 'বন্ধ করুন' : 'Close modal'}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 id="citizen-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">
              {isBn ? 'মাঠ পর্যায়ের তথ্য বা প্রমাণ জমা দিন' : 'Submit Ground Reality Evidence'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn
                ? 'নাগরিক ও গবেষকদের দ্বারা প্রদত্ত তথ্য যাচাই করে ড্যাশবোর্ডে যুক্ত করা হয়।'
                : 'Help verify public commitments with local newspaper reports, photos, or RTI orders.'}
            </p>
          </div>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              {isBn ? 'সফলভাবে জমা হয়েছে!' : 'Evidence Submitted Successfully!'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isBn
                ? 'আমাদের গবেষক দল এই তথ্য যাচাই করে প্রতিশ্রুতি ট্র্যাকিং হালনাগাদ করবেন।'
                : 'Our policy research desk will review this citation before updating the official tracker.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'প্রতিশ্রুতি কোড / বিষয় *' : 'Target Promise Code *'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'যেমন: TEA-01, ECON-03, HEALTH-02' : 'e.g., TEA-01, ECON-03, HEALTH-02'}
                value={promiseCode}
                onChange={(e) => setPromiseCode(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'শিরোনাম / বিজ্ঞপ্তির নাম *' : 'Evidence Title / Headline *'}
              </label>
              <input
                type="text"
                placeholder={isBn ? 'যেমন: উত্তরবঙ্গে নতুন কোল্ড স্টোরেজ প্রকল্পের কাজ শুরু' : 'e.g., Foundation stone laid for Siliguri Cold Storage'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'অনলাইন লিঙ্ক বা গেজেট ইউআরএল' : 'Source Document URL / Gazette Link'}
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'মূল সারসংক্ষেপ বা উদ্ধৃতি' : 'Key Details or Excerpt'}
              </label>
              <textarea
                rows={3}
                placeholder={isBn ? 'গুরুত্বপূর্ণ তারিখ, বরাদ্দের পরিমাণ বা কাজের বিবরণ...' : 'Relevant dates, sanctioned budget amounts, or field observations...'}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {isBn ? 'আপনার ইমেল (ঐচ্ছিক - গবেষক ক্রেডিটের জন্য)' : 'Your Email (Optional, for attribution & updates)'}
              </label>
              <input
                type="email"
                placeholder="citizen@bengal.org"
                value={submitterEmail}
                onChange={(e) => setSubmitterEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={submitting} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="w-4 h-4" />
                <span>{submitting ? (isBn ? 'জমা হচ্ছে...' : 'Submitting...') : (isBn ? 'জমা দিন' : 'Submit Evidence')}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
