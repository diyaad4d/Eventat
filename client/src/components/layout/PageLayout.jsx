import Navbar from './Navbar';
import Footer from './Footer';

// ─────────────────────────────────────────────────────────────
//  PageLayout
//  Standard public page wrapper:
//    <Navbar /> → <main>{children}</main> → <Footer />
//
//  props:
//    noFooter  : bool  — hide footer (e.g. full-screen auth pages)
//    noNavbar  : bool  — hide navbar
//    fullWidth : bool  — skip max-w container on children
//    className : extra classes on <main>
// ─────────────────────────────────────────────────────────────

function PageLayout({
  children,
  noFooter  = false,
  noNavbar  = false,
  fullWidth = false,
  className = '',
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      {!noNavbar && <Navbar />}

      <main
        className={[
          'flex-1',
          !fullWidth && 'w-full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>

      {!noFooter && <Footer />}
    </div>
  );
}

export default PageLayout;
