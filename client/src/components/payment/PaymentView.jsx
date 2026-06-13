import React, { useState } from 'react';
import {
  ArrowLeft, CreditCard, Banknote, CheckCircle2, Lock,
  ShieldCheck, Calendar, DollarSign, Loader2, Star, Info,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { payEventPlan } from '../../services/bookings.service';
import { toastError } from '../../utils/toast';
import Badge from '../ui/Badge';

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return iso; }
}

const PLATFORM_FEE_PERCENT = 10;   // 10% platform commission (deducted from vendor side after event)
const DEPOSIT_PERCENT      = 20;   // 20% online deposit for cash+deposit method

// ── Credit Card Preview (STYLE UNCHANGED) ────────────────────────────────────
function CardPreview({ cardNum, name, expiry }) {
  const formatted = cardNum.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() || '•••• •••• •••• ••••';
  return (
    <div className="relative w-full h-40 rounded-2xl overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #1A1D27 0%, #2A2D3A 50%, #1a1d27 100%)' }}>
      {/* shimmer overlay */}
      <div className="absolute inset-0 opacity-20"
        style={{ background: 'radial-gradient(circle at 70% 20%, rgba(232,201,122,0.6), transparent 60%)' }} />
      {/* chip */}
      <div className="absolute top-5 left-5 w-10 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 opacity-90"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)' }}>
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-px p-1">
          {[0,1,2,3].map(i => <div key={i} className="rounded-sm bg-yellow-400/50" />)}
        </div>
      </div>
      {/* NFC icon */}
      <svg className="absolute top-6 right-5 opacity-70" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8C97A" strokeWidth="2">
        <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
      {/* number */}
      <p className="absolute bottom-12 left-5 text-white font-mono text-base tracking-widest opacity-90">
        {formatted}
      </p>
      {/* name and expiry */}
      <div className="absolute bottom-4 left-5 right-5 flex justify-between">
        <p className="text-white/80 text-xs uppercase tracking-wider font-semibold truncate pr-4">
          {name || 'CARDHOLDER NAME'}
        </p>
        <p className="text-white/70 text-xs font-mono shrink-0">{expiry || 'MM/YY'}</p>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PaymentView({ plan, planItems, onBack, onPaymentSuccess }) {
  const [method, setMethod]       = useState('full_online'); // 'full_online' | 'cash_deposit'
  const [cardNum, setCardNum]     = useState('4111 1111 1111 1111');
  const [cardName, setCardName]   = useState('OMAR WADY');
  const [expiry, setExpiry]       = useState('12/26');
  const [cvv, setCvv]             = useState('123');
  const [paid, setPaid]           = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [paidAmount, setPaidAmount] = useState(0);

  // Only accepted items go into the payment
  const acceptedItems  = planItems.filter(i => i.status === 'accepted');
  const subtotal       = acceptedItems.reduce((s, i) => s + parseFloat(i.line_total || 0), 0);

  // Amount actually charged NOW depends on the method
  const amountDue      = method === 'cash_deposit'
    ? parseFloat((subtotal * DEPOSIT_PERCENT / 100).toFixed(2))  // 20% deposit online
    : parseFloat(subtotal.toFixed(2));                            // 100% online

  const cashOnDay      = parseFloat((subtotal - amountDue).toFixed(2)); // 0 for full_online

  const payMutation = useMutation({
    mutationFn: () => payEventPlan(plan.event_id, { payment_method: method }),
    onSuccess: (data) => {
      const ref = data?.data?.payment?.transaction_ref ?? 'EVT-XXXX';
      setPaymentRef(ref);
      setPaidAmount(amountDue);
      setPaid(true);
      if (onPaymentSuccess) onPaymentSuccess();
    },
    onError: (err) => {
      toastError(err.response?.data?.error ?? 'Payment failed. Please try again.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNum.replace(/\D/g, '').length < 16) return toastError('Please enter a valid 16-digit card number.');
    if (!cardName.trim()) return toastError('Please enter the cardholder name.');
    if (!expiry) return toastError('Please enter the expiry date.');
    if (cvv.replace(/\D/g, '').length < 3) return toastError('Please enter a valid CVV.');
    payMutation.mutate();
  };

  // ── Success Screen ─────────────────────────────────────────────────────────
  if (paid) {
    const isCash = method === 'cash_deposit';
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in zoom-in-95">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in">
            <CheckCircle2 size={52} className="text-green-600" />
          </div>
          <div className="absolute -inset-2 rounded-full border-4 border-green-200 animate-ping opacity-40"
            style={{ animationDuration: '1.5s', animationIterationCount: 1 }} />
        </div>
        <h2 className="text-2xl font-extrabold text-[var(--color-dark)] mb-2">
          {isCash ? 'Deposit Confirmed!' : 'Payment Successful!'}
        </h2>
        <p className="text-gray-500 text-sm mb-1">
          Your event plan <strong>{plan.name}</strong> is now {isCash ? 'reserved' : 'confirmed and paid'}.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Transaction ref: <span className="font-mono font-bold text-[var(--color-gold-dark)]">{paymentRef}</span>
        </p>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-6 w-full max-w-sm mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">{isCash ? 'Deposit Paid Online' : 'Amount Paid'}</span>
            <span className="font-extrabold text-green-700">{paidAmount.toFixed(2)} JOD</span>
          </div>
          {isCash && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Cash to Pay on Event Day</span>
              <span className="font-extrabold text-amber-700">{cashOnDay.toFixed(2)} JOD</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Services</span>
            <span className="font-semibold text-gray-700">{acceptedItems.length} confirmed</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Deposit Status</span>
            <span className="font-semibold text-amber-600">Held in Escrow</span>
          </div>
        </div>

        {isCash && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full max-w-sm mb-6 text-sm text-amber-800">
            <p className="font-bold mb-1 flex items-center gap-1.5"><Info size={14} /> Reminder</p>
            <p>Pay the remaining <strong>{cashOnDay.toFixed(2)} JOD</strong> in cash directly to your vendor(s) on the day of the event.</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <ShieldCheck size={14} className="text-green-500" />
          {isCash
            ? 'Your deposit is securely held in escrow as a booking guarantee.'
            : 'Funds are securely held in escrow until services are completed.'}
        </div>
        <button
          onClick={onBack}
          className="px-8 py-3 rounded-xl bg-[var(--color-dark)] text-white font-bold hover:bg-[#1a1a2e] transition-all shadow-md"
        >
          Back to My Events
        </button>
      </div>
    );
  }

  // ── Payment Form ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all shrink-0"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-dark)]">Complete Payment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Secure checkout for <span className="font-semibold">{plan.name}</span></p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400">
          <Lock size={12} className="text-green-500" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── Left: Payment Form ──────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Payment method selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">

                {/* Full Online */}
                <button
                  type="button"
                  onClick={() => setMethod('full_online')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    method === 'full_online'
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5 text-[var(--color-gold-dark)]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {method === 'full_online' && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-[var(--color-gold)] rounded-full flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-white" />
                    </span>
                  )}
                  <CreditCard size={22} />
                  <span>Full Online</span>
                  <span className="text-[10px] font-normal text-gray-400 leading-tight text-center">Pay 100% now</span>
                </button>

                {/* Cash + Deposit */}
                <button
                  type="button"
                  onClick={() => setMethod('cash_deposit')}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    method === 'cash_deposit'
                      ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5 text-[var(--color-gold-dark)]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {method === 'cash_deposit' && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-[var(--color-gold)] rounded-full flex items-center justify-center">
                      <CheckCircle2 size={10} className="text-white" />
                    </span>
                  )}
                  <Banknote size={22} />
                  <span>Cash + Deposit</span>
                  <span className="text-[10px] font-normal text-gray-400 leading-tight text-center">{DEPOSIT_PERCENT}% now + {100 - DEPOSIT_PERCENT}% cash</span>
                </button>
              </div>

              {/* Method explanation banner */}
              <div className={`mt-4 rounded-xl p-3 text-xs flex items-start gap-2 transition-all ${
                method === 'full_online'
                  ? 'bg-blue-50 border border-blue-100 text-blue-800'
                  : 'bg-amber-50 border border-amber-100 text-amber-800'
              }`}>
                <Info size={13} className="shrink-0 mt-0.5" />
                {method === 'full_online'
                  ? 'You pay 100% of the total online. Funds are held in escrow by Eventat and released to the vendor after the event is completed (minus 10% platform commission).'
                  : `You pay a ${DEPOSIT_PERCENT}% booking deposit online now to secure your booking. The remaining ${100 - DEPOSIT_PERCENT}% is paid in cash directly to the vendor on the day of the event.`
                }
              </div>
            </div>

            {/* Credit Card fields — shown for Full Online only */}
            {method === 'full_online' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Card Details</h3>

                {/* Card preview */}
                <CardPreview cardNum={cardNum} name={cardName} expiry={expiry} />

                {/* Card number */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    value={cardNum.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()}
                    onChange={e => setCardNum(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono transition-all"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Omar Wady"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono tracking-wider transition-all"
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
                        setExpiry(v);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Cash + Deposit — show deposit confirmation step with card */}
            {method === 'cash_deposit' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pay Deposit by Card</h3>

                {/* Deposit breakdown highlight */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--color-gold)]/5 border border-[var(--color-gold)]/20 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Pay Now (Online)</p>
                    <p className="text-xl font-extrabold text-[var(--color-gold-dark)]">{amountDue.toFixed(2)} JOD</p>
                    <p className="text-[10px] text-gray-400">{DEPOSIT_PERCENT}% deposit</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Cash on Event Day</p>
                    <p className="text-xl font-extrabold text-gray-700">{cashOnDay.toFixed(2)} JOD</p>
                    <p className="text-[10px] text-gray-400">{100 - DEPOSIT_PERCENT}% in cash</p>
                  </div>
                </div>

                {/* Card preview for deposit */}
                <CardPreview cardNum={cardNum} name={cardName} expiry={expiry} />

                {/* Card number */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    value={cardNum.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()}
                    onChange={e => setCardNum(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono transition-all"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="Omar Wady"
                    value={cardName}
                    onChange={e => setCardName(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono tracking-wider transition-all"
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={e => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
                        setExpiry(v);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cvv}
                      onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-[var(--color-gold)] text-sm font-mono transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pay button */}
            <button
              type="submit"
              disabled={payMutation.isPending}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-dark)] text-white font-extrabold text-base shadow-lg hover:shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {payMutation.isPending ? (
                <><Loader2 size={20} className="animate-spin" /> Processing Payment…</>
              ) : (
                <><Lock size={16} />
                  {method === 'cash_deposit'
                    ? `Pay ${amountDue.toFixed(2)} JOD Deposit Securely`
                    : `Pay ${amountDue.toFixed(2)} JOD Securely`
                  }
                </>
              )}
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-green-500" /> SSL Secured</span>
              <span className="flex items-center gap-1.5"><Lock size={13} className="text-blue-500" /> PCI Compliant</span>
              <span className="flex items-center gap-1.5"><Star size={13} className="text-yellow-500" /> Trusted Platform</span>
            </div>
          </form>
        </div>

        {/* ── Right: Order Summary ────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
            <h3 className="text-base font-extrabold text-[var(--color-dark)]">Order Summary</h3>

            {/* Plan badge */}
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">Confirmed</Badge>
              <span className="text-sm font-semibold text-gray-700 truncate">{plan.name}</span>
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3">
              {acceptedItems.map(item => (
                <div key={item.event_item_id} className="flex items-center gap-3">
                  <img
                    src={item.primary_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.service_title || 'S')}&background=E8C97A&color=fff`}
                    alt={item.service_title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-dark)] truncate">{item.service_title}</p>
                    <p className="text-xs text-gray-400">{item.vendor_name}</p>
                    {item.event_date && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(item.event_date)}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-[var(--color-dark)] shrink-0">
                    {parseFloat(item.line_total).toFixed(2)} JOD
                  </span>
                </div>
              ))}
            </div>

            <hr className="border-gray-100" />

            {/* Breakdown */}
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({acceptedItems.length} services)</span>
                <span className="font-semibold">{subtotal.toFixed(2)} JOD</span>
              </div>

              {method === 'cash_deposit' ? (
                <>
                  <div className="flex justify-between text-[var(--color-gold-dark)] font-semibold">
                    <span>Online Deposit ({DEPOSIT_PERCENT}%)</span>
                    <span>{amountDue.toFixed(2)} JOD</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Cash on Event Day ({100 - DEPOSIT_PERCENT}%)</span>
                    <span>{cashOnDay.toFixed(2)} JOD</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                    <span>Covered by deposit</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-gray-500">
                    <span>Platform Fee ({PLATFORM_FEE_PERCENT}%)</span>
                    <span className="text-green-600 font-semibold">Paid by vendor</span>
                  </div>
                </>
              )}
            </div>

            {/* Total charge box */}
            <div className="bg-[var(--color-dark)] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-white font-extrabold text-base">
                {method === 'cash_deposit' ? 'Deposit Due' : 'Total'}
              </span>
              <span className="text-[var(--color-gold)] font-extrabold text-xl flex items-center gap-1">
                <DollarSign size={16} />{amountDue.toFixed(2)} JOD
              </span>
            </div>

            {method === 'cash_deposit' && (
              <div className="text-xs text-center text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
                + <strong>{cashOnDay.toFixed(2)} JOD</strong> cash to vendor on event day
              </div>
            )}

            <p className="text-xs text-center text-gray-400">
              {method === 'cash_deposit'
                ? 'Your deposit is held in escrow as a booking guarantee. Escrow protects both you and the vendor.'
                : 'By completing this payment you agree to the Eventat Terms of Service. Funds are held in escrow until event completion.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
