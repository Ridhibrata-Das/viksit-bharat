# Product Guidelines — Communication & Design Standards

## 1. Bilingual Parity (English & বাংলা)
- Every user-facing view, button, badge, modal, and tooltip must support seamless switching between English (`/en`) and Bengali (`/bn`).
- Bengali text must preserve correct unicode ligatures (যুক্তাক্ষর) and terminology:
  - Promises: প্রতিশ্রুতি
  - Evidence: যাচাইকৃত প্রমাণ
  - Delivered: অর্জিত
  - Under Implementation: বাস্তবায়নাধীন
  - Announced: ঘোষিত
  - Outlay: আর্থিক বরাদ্দ
  - District: জেলা
- Bengali numerals (`০-৯`) must be automatically formatted when rendered in Bengali mode.

## 2. Accessibility & Color Contrast (WCAG 2.2 AA)
- Primary Brand Green: `#0A5C36` (State Green)
- Text on Green: Strictly `#FFFFFF` (White) to exceed the 4.5:1 contrast requirement (7.1:1 verified).
- Accent Gold: `#D4AF37` / `#C5961A` — reserved strictly for iconography and borders, never for low-contrast text on green.
- Minimum Touch Target: 44px by 44px for all interactive buttons and mobile elements.
- Screen Reader Support: Semantic landmarks (`<header>`, `<main>`, `<footer>`), `aria-live` for daily tally streams, and `aria-label` for bilingual actions.
