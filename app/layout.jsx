import './globals.css';
import '@phosphor-icons/web/regular';
import '@phosphor-icons/web/fill';
import '@phosphor-icons/web/bold';
export const metadata = { title: 'Patients – PrioPulse Medical', description: 'PrioPulse patients management dashboard' };
export default function RootLayout({ children }) {
  return <html lang="en" suppressHydrationWarning><head><link rel="icon" href="/assets/images/favicon.ico" /><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" /></head><body className="bg-bg text-heading dark:text-heading font-sans antialiased relative">{children}</body></html>;
}
