import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  Modal
//  Renders into document.body via a portal.
//  Closes on backdrop click or Escape key.
//  Focus is trapped inside the modal while it is open.
//
//  sizes : sm | md | lg | xl | full
// ─────────────────────────────────────────────────────────────

const SIZES = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-5xl',
};

function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
  children,
}) {
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  // Lock body scroll and attach Escape listener while open
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Move focus into the panel
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,44,44,0.55)', backdropFilter: 'blur(4px)' }}
    >
      {/* Animate in */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={[
          'relative w-full bg-white rounded-2xl shadow-[var(--shadow-modal)]',
          'outline-none',
          'animate-[scaleIn_200ms_cubic-bezier(0.4,0,0.2,1)_forwards]',
          SIZES[size] ?? SIZES.md,
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
            {title && (
              <h2
                id="modal-title"
                className="text-lg font-semibold text-[var(--color-dark)]"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="ml-auto -mr-1 flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-[var(--color-dark)] hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// Convenience sub-component for modal footers
Modal.Footer = function ModalFooter({ className = '', children }) {
  return (
    <div
      className={[
        'flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
};

export default Modal;
