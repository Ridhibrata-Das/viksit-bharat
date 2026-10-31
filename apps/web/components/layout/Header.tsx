'use client';

import * as React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  HeartHandshake,
  LogIn,
  LogOut,
  ShieldCheck,
  Lock,
  Menu,
  X,
  LayoutDashboard,
  FileText,
  MapPin,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { openSabaiFoundationModal } from "@/components/citizen/SabaiFoundationModal";
import { useAuth } from "@/components/auth/AuthContext";

export default function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const { userProfile, authLoading, openSignInModal, signOutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentUser = mounted ? userProfile : null;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header
      role="banner"
      className="bg-primary text-white border-b border-emerald-900 shadow-md sticky top-0 z-40 transition-colors"
    >
      {/* Indian National Flag (Tricolour: Saffron, White, India Green) Ribbon */}
      <div className="w-full h-1.5 flex" aria-hidden="true">
        <div className="flex-1 bg-[#FF671F]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#0A5C36]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={
              mobileMenuOpen
                ? locale === "bn"
                  ? "মেনু বন্ধ করুন"
                  : "Close Navigation Menu"
                : locale === "bn"
                  ? "মেনু খুলুন"
                  : "Open Navigation Menu"
            }
            className="md:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          {/* Zone 1: Single-element Brand Wordmark */}
          <Link
            href={`/${locale}`}
            onClick={closeMobileMenu}
            className="font-extrabold text-base sm:text-lg tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 ring-offset-primary rounded px-1 py-1"
            aria-label="Viksit Bengal Dashboard - Home"
          >
            {t("brand")}
          </Link>

          {/* Zone 2: Primary Navigation Landmark (Desktop) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-5"
          >
            <Link
              href={`/${locale}`}
              className="min-h-[44px] py-2 text-sm font-medium text-white hover:underline underline-offset-4 transition-colors flex items-center whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {locale === "bn" ? "সারসংক্ষেপ" : "Overview"}
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              className="min-h-[44px] py-2 text-sm font-medium text-white hover:underline underline-offset-4 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {!currentUser && <Lock className="w-3 h-3 text-amber-300" aria-hidden="true" />}
              <span>{locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
            </Link>
            <Link
              href={`/${locale}/promises`}
              className="min-h-[44px] py-2 text-sm font-medium text-white hover:underline underline-offset-4 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {!currentUser && <Lock className="w-3 h-3 text-amber-300" aria-hidden="true" />}
              <span>{t("promises")}</span>
            </Link>
            <Link
              href={`/${locale}/districts`}
              className="min-h-[44px] py-2 text-sm font-medium text-white hover:underline underline-offset-4 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {!currentUser && <Lock className="w-3 h-3 text-amber-300" aria-hidden="true" />}
              <span>{t("districts")}</span>
            </Link>
            <Link
              href={`/${locale}/indicators`}
              className="min-h-[44px] py-2 text-sm font-medium text-white hover:underline underline-offset-4 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {!currentUser && <Lock className="w-3 h-3 text-amber-300" aria-hidden="true" />}
              <span>{t("indicators")}</span>
            </Link>
            <Link
              href={`/${locale}/admin`}
              className="min-h-[44px] py-2 text-sm font-medium text-emerald-100 hover:text-white hover:underline underline-offset-4 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {(!currentUser || currentUser.role === "CITIZEN") && (
                <Lock className="w-3 h-3 text-amber-300" aria-hidden="true" />
              )}
              <span>{t("admin")}</span>
            </Link>
          </nav>

          {/* Zone 3: Google Auth Status, Sabai Foundation Trigger & Language Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-400/30 rounded-lg px-2.5 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-bold text-white max-w-[110px] truncate hidden sm:inline">
                  {currentUser.displayName || currentUser.email}
                </span>
                <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">
                  {currentUser.role}
                </span>
                <button
                  type="button"
                  onClick={() => void signOutUser()}
                  title={locale === "bn" ? "সাইন আউট" : "Sign Out"}
                  className="p-1 rounded hover:bg-emerald-900 text-emerald-100 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openSignInModal}
                disabled={authLoading}
                className="min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-950 font-extrabold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {locale === "bn" ? "গুগল সাইন-ইন" : "Sign in with Google"}
                </span>
                <span className="sm:hidden">
                  {locale === "bn" ? "লগইন" : "Login"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={openSabaiFoundationModal}
              className="min-h-[40px] px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs hidden lg:inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
            >
              <HeartHandshake className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>
                {locale === "bn" ? "অনুদান ও সদস্যপদ" : "Donate · Membership"}
              </span>
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-900/70 bg-emerald-950/98 backdrop-blur-md px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            <Link
              href={`/${locale}`}
              onClick={closeMobileMenu}
              className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-emerald-900/80 flex items-center gap-2.5 transition-colors"
            >
              <span>{locale === "bn" ? "সারসংক্ষেপ" : "Overview"}</span>
            </Link>
            <Link
              href={`/${locale}/dashboard`}
              onClick={closeMobileMenu}
              className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-emerald-900/80 flex items-center gap-2.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              <span>{locale === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</span>
            </Link>
            <Link
              href={`/${locale}/promises`}
              onClick={closeMobileMenu}
              className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-emerald-900/80 flex items-center gap-2.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>{t("promises")}</span>
            </Link>
            <Link
              href={`/${locale}/districts`}
              onClick={closeMobileMenu}
              className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-emerald-900/80 flex items-center gap-2.5 transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-300" aria-hidden="true" />
              <span>{t("districts")}</span>
            </Link>
            <Link
              href={`/${locale}/indicators`}
              onClick={closeMobileMenu}
              className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-white hover:bg-emerald-900/80 flex items-center gap-2.5 transition-colors"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>{t("indicators")}</span>
            </Link>
            <Link
              href={`/${locale}/admin`}
              onClick={closeMobileMenu}
              className="min-h-[44px] px-3 py-2.5 rounded-lg text-sm font-semibold text-amber-300 hover:bg-emerald-900/80 flex items-center gap-2.5 transition-colors"
            >
              <UserCheck className="w-4 h-4 text-amber-300" aria-hidden="true" />
              <span>{t("admin")}</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-emerald-900/60 flex flex-col gap-2.5">
            {currentUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-900/60 border border-emerald-400/30">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white truncate max-w-[170px]">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu();
                    void signOutUser();
                  }}
                  className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-xs font-bold text-emerald-100 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{locale === "bn" ? "লগআউট" : "Logout"}</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  openSignInModal();
                }}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-white hover:bg-stone-100 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  {locale === "bn" ? "গুগল সাইন-ইন / লগইন" : "Sign in with Google"}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openSabaiFoundationModal();
              }}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 shrink-0 text-stone-950" aria-hidden="true" />
              <span>
                {locale === "bn"
                  ? "Donate to SABAI Foundation. · অনুদান দিন"
                  : "Donate to SABAI Foundation."}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}