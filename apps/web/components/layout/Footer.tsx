'use client';

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { HeartHandshake, ExternalLink } from "lucide-react";
import { openSabaiFoundationModal } from "@/components/citizen/SabaiFoundationModal";

export default function Footer() {
  const t = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <footer
      role="contentinfo"
      className="bg-stone-900 text-stone-100 border-t border-stone-800 mt-auto py-10 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Platform Overview & Two-Part Vision (2033 & 2047) */}
          <div className="md:col-span-2 space-y-3">
            <div className="font-extrabold text-lg text-white">
              {t("brand")} — {locale === "bn" ? "ভিশন ২০৩৩ ও ২০৪৭" : "Vision 2033 & 2047"}
            </div>
            <p className="text-sm text-stone-300 max-w-md leading-relaxed">
              {locale === "bn"
                ? "পশ্চিমবঙ্গের দ্বি-পর্যায় অর্থনৈতিক লক্ষ্যমাত্রা: ২০৩৩ সালের মধ্যে ₹৮৫ লক্ষ কোটি ($১ ট্রিলিয়ন) এবং ২০৪৭ সালের মধ্যে ₹৪২৫ লক্ষ কোটি ($৫ ট্রিলিয়ন) জিএসডিপি অর্জনের উন্মুক্ত ও স্বচ্ছ ডেটা পর্যবেক্ষণ প্ল্যাটফর্ম।"
                : "Transparent tracking platform for West Bengal's two-part economic vision: ₹85 Lakh Crore ($1 Trillion USD) GSDP by 2033 and ₹425 Lakh Crore ($5 Trillion USD) GSDP by 2047."}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openSabaiFoundationModal}
                className="px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs inline-flex items-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {locale === "bn"
                    ? "সাবাই ফাউন্ডেশন আজীবন সদস্যপদ (₹৫০০+) · অনুদান দিন"
                    : "Sabai Foundation Lifetime Membership (Min ₹500) · Donate"}
                </span>
              </button>
              <a
                href="https://forms.gle/vrJas5mxUJ1KLgRx8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-amber-300 hover:underline inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1"
              >
                <span>
                  {locale === "bn" ? "অফিসিয়াল গুগল ফর্ম" : "Official Membership Google Form"}
                </span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {locale === "bn" ? "দ্রুত লিংক" : "Navigation"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {locale === "bn" ? "ল্যান্ডিং পেজ" : "Landing Overview"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {locale === "bn" ? "মূল ড্যাশবোর্ড" : "Live Dashboard"}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/promises`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("promises")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/districts`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("districts")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/indicators`}
                  className="text-stone-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded py-1 inline-block"
                >
                  {t("indicators")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Compliance & Sabai Foundation Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {locale === "bn" ? "সাবাই ফাউন্ডেশন ও মান" : "Sabai Foundation & Standards"}
            </h4>
            <ul className="space-y-2 text-sm text-stone-300">
              <li>UPI ID: 81k1byfou2ce@mahb</li>
              <li>WCAG 2.2 AA Compliant</li>
              <li>Bilingual (English / বাংলা)</li>
              <li>Live RSS &amp; Gemini Verified</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            &copy; {new Date().getFullYear()} Viksit Bengal 2047 &amp; Sabai Foundation. Open Data Initiative.
          </p>
          <p>
            {locale === "bn"
              ? "সর্বজনীন ব্যবহারের জন্য উন্মুক্ত তথ্য পোর্টাল — ২০৩৩ ও ২০৪৭ ভিশন"
              : "Public economic research and transparency portal — Vision 2033 & 2047"}
          </p>
        </div>
      </div>
    </footer>
  );
}