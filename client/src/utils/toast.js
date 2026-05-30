import toast from 'react-hot-toast';

export const toastSuccess = (msg) => toast.success(msg);
export const toastError   = (msg) => toast.error(msg);

export const toastInfo = (msg) =>
  toast(msg, {
    icon: 'ℹ️',
    style: {
      background: '#1A1D27',
      color: '#FFFFFF',
      border: '1px solid rgba(99,102,241,0.35)',
      fontSize: '0.875rem',
      fontWeight: 600,
      borderRadius: '14px',
      padding: '14px 18px',
    },
  });

export const toastWarning = (msg) =>
  toast(msg, {
    icon: '⚠️',
    style: {
      background: '#1A1D27',
      color: '#FFFFFF',
      border: '1px solid rgba(245,158,11,0.40)',
      fontSize: '0.875rem',
      fontWeight: 600,
      borderRadius: '14px',
      padding: '14px 18px',
    },
  });

export const toastGold = (msg) =>
  toast(msg, {
    icon: '✨',
    style: {
      background: 'linear-gradient(135deg, #1A1208, #2A1F0D)',
      color: '#E8C97A',
      border: '1px solid rgba(201,162,77,0.40)',
      fontSize: '0.875rem',
      fontWeight: 700,
      borderRadius: '14px',
      padding: '14px 18px',
    },
  });
