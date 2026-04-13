import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Footer
// ─────────────────────────────────────────────────────────────

const LINKS = {
  platform: [
    { label: 'Browse Services', to: '/Services' },
    { label: 'How It Works',    to: '/how-it-works' },
    { label: 'Event Types',     to: '/Services' },
    { label: 'Become a Vendor', to: '/signup' },
  ],
  support: [
    { label: 'Help Center',     to: '/help' },
    { label: 'Contact Us',      to: '/contact' },
    { label: 'Privacy Policy',  to: '/privacy' },
    { label: 'Terms of Service',to: '/terms' },
  ],
};

const SOCIALS = [
  { icon: <Instagram size={18} />, label: 'Instagram', href: '#' },
  { icon: <Facebook  size={18} />, label: 'Facebook',  href: '#' },
  { icon: <Twitter   size={18} />, label: 'Twitter',   href: '#' },
  { icon: <Linkedin  size={18} />, label: 'LinkedIn',  href: '#' },
];

function FooterLinkGroup({ title, links }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              className="text-sm text-gray-400 hover:text-[var(--color-gold-light)] transition-colors duration-150"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--color-dark)' }}>
      {/* ── Main footer content ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                EVEN<span style={{ color: 'var(--color-gold)' }}>TAT</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Jordan's premier marketplace for event planning. From weddings to
              corporate gatherings — plan your perfect event with verified vendors.
            </p>

            {/* Contact info */}
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail size={14} style={{ color: 'var(--color-gold)' }} />
                hello@eventat.jo
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone size={14} style={{ color: 'var(--color-gold)' }} />
                +962 6 000 0000
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin size={14} style={{ color: 'var(--color-gold)' }} />
                Amman, Jordan
              </li>
            </ul>
          </div>

          {/* Link groups */}
          <FooterLinkGroup title="Platform" links={LINKS.platform} />
          <FooterLinkGroup title="Support"  links={LINKS.support} />

          {/* Newsletter column */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Stay Updated
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Get the latest vendor deals and event inspiration straight to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/10 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:shadow-md"
                style={{ backgroundColor: 'var(--color-gold)' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gold-dark)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gold)')}
              >
                Subscribe
              </button>
            </form>

            {/* Socials */}
            <div className="flex items-center gap-2 mt-6">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-gray-400 hover:bg-[var(--color-gold)] hover:text-white transition-all duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {year} Eventat. All rights reserved. Built with ❤️ in Jordan.
          </p>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-[var(--color-gold-light)] transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-[var(--color-gold-light)] transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-xs text-gray-500 hover:text-[var(--color-gold-light)] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
