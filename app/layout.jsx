import './globals.css';
import CallProvider from '../components/calls/CallProvider';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import '@phosphor-icons/web/bold';
export const metadata = { title: 'Heart-Failure Follow-Up – PrioPulse', description: 'Explainable top-25 follow-up ranking and historical comparison' };
export default function RootLayout({ children }) {
  return <html lang="en" suppressHydrationWarning><head><link rel="icon" type="image/png" href="/assets/images/favicon.png" /><link rel="apple-touch-icon" href="/assets/images/apple-touch-icon.png" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" /></head><body className="bg-bg text-heading dark:text-heading font-sans antialiased relative"><CallProvider>{children}</CallProvider></body></html>;
}
