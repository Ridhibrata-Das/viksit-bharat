import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viksit Bengal Dashboard',
  description:
    'West Bengal Governance, Policy Commitments, and $1 Trillion Economic Progress Tracker across 23 districts.',
  openGraph: {
    title: 'Viksit Bengal Dashboard',
    description:
      'West Bengal Governance, Policy Commitments, and $1 Trillion Economic Progress Tracker across 23 districts.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
