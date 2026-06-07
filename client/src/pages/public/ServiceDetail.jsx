import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, ChevronLeft, X, Star, MapPin, Users, Store, Calendar, ShoppingCart, CreditCard, Phone, MessageCircle } from 'lucide-react';
import ServiceCard from '../../components/Home/ServiceCard';
import useAuthStore from '../../store/authStore';
import { getServiceById } from '../../services/services.service';
import { getServiceReviews, postReview, checkReviewEligibility } from '../../services/reviews.service';

// ─────────────────────────────────────────────────────────────
//  ReviewsSection — Reviews summary + write a review form
//  Props:
//    service      object  — must have avg_rating, review_count
//    reviews      array   — from reviewsData (paginated query)
//    breakdown    array   — [{ rating, count, percentage }] from summary
//    totalReviews number  — from summary.total_reviews
//    user         object  — { isLoggedIn, hasBooking, name, avatar }
//    canReview    bool    — from eligibility query
//    hasReviewed  bool    — from eligibility query
//    onSubmit     fn      — (data) => submitReviewMutation.mutate(data)
//    isSubmitting bool
//    submitError  string|null
// ─────────────────────────────────────────────────────────────
function ReviewsSection({
  service,
  reviews,
  breakdown,
  totalReviews,
  user,
  canReview,
  hasReviewed,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const avgRating = parseFloat(service?.avg_rating) || 0;

  const [hoverStar,  setHoverStar]  = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted,  setSubmitted]  = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);

  const canSubmit = userRating > 0 && reviewText.trim().length > 0;

  // Reset form when navigating to a different service
  useEffect(() => {
    setSubmitted(false);
    setUserRating(0);
    setReviewText('');
  }, [service?.service_id]);

  // Detect successful submission: isSubmitting just flipped false and there's no error
  const prevSubmitting = React.useRef(false);
  useEffect(() => {
    if (prevSubmitting.current && !isSubmitting && !submitError) {
      setSubmitted(true);
      setUserRating(0);
      setReviewText('');
    }
    prevSubmitting.current = isSubmitting;
  }, [isSubmitting, submitError]);

  useEffect(() => {
    if (showAllModal) {
      document.body.style.overflow = 'hidden';
      document.querySelector('nav')?.style.setProperty('display','none');
      document.querySelector('header')?.style.setProperty('display','none');
    } else {
      document.body.style.overflow = 'auto';
      document.querySelector('nav')?.style.removeProperty('display');
      document.querySelector('header')?.style.removeProperty('display');
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.querySelector('nav')?.style.removeProperty('display');
      document.querySelector('header')?.style.removeProperty('display');
    };
  }, [showAllModal]);

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;
    onSubmit({ rating: userRating, review_text: reviewText.trim() });
  };

  return (
    <section id="reviews" className="mt-12 pt-10 border-t border-gray-200">

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)] mb-8">
        Reviews
      </h2>

      {/* ── Rating Summary Box ── */}
      <div className="flex flex-wrap items-center gap-8 mb-10 p-6 sm:p-8 rounded-2xl border border-[#E8C97A44] bg-gradient-to-br from-[#FDF6EC] to-[#FFF9F0]">
        
        {/* Big average number */}
        <div className="flex flex-col items-center min-w-[80px]">
          <span className="text-6xl font-black text-[var(--color-dark)] leading-none">
            {avgRating.toFixed(1)}
          </span>
          <div className="flex gap-0.5 my-2">
            {[1,2,3,4,5].map(s => (
              <Star
                key={s} size={16}
                fill={s <= Math.round(avgRating) ? 'var(--color-gold)' : 'none'}
                color={s <= Math.round(avgRating) ? 'var(--color-gold)' : '#d1d5db'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">{totalReviews} reviews</span>
        </div>

        {/* Bar chart breakdown */}
        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
          {breakdown.map(({ rating: stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 w-7">
                {stars}★
              </span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#E8C97A] to-[#C9A24D] transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-9">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Individual Review Cards ── */}
      <div className="flex flex-col gap-4 mb-10">
        {reviews.slice(0, 3).map((review) => (
          <div
            key={review.review_id}
            className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Reviewer header */}
            <div className="flex items-center gap-3 mb-3">
              <img
                src={review.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name || 'User')}&background=E8C97A&color=fff`}
                alt={review.reviewer_name}
                className="w-11 h-11 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-[var(--color-dark)] truncate">
                  {review.reviewer_name || 'Anonymous'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex gap-0.5 shrink-0">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s} size={13}
                    fill={s <= review.rating ? 'var(--color-gold)' : 'none'}
                    color={s <= review.rating ? 'var(--color-gold)' : '#d1d5db'}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
          </div>
        ))}
        {reviews.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="block mx-auto w-max px-10 py-3.5 mt-1 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200 bg-white"
          >
            Show all {reviews.length} reviews →
          </button>
        )}
      </div>

      {/* ── Write a Review ── */}

      {/* Not logged in */}
      {!user.isLoggedIn && (
        <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="text-3xl shrink-0">👤</div>
          <div>
            <p className="font-bold text-[var(--color-dark)] text-sm mb-0.5">
              Sign in to write a review
            </p>
            <p className="text-xs text-gray-500">
              You need to be logged in to share your experience.
            </p>
          </div>
        </div>
      )}

      {/* Logged in, no booking */}
      {user.isLoggedIn && !canReview && !hasReviewed && (
        <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
          <div className="text-3xl shrink-0">🔒</div>
          <div>
            <p className="font-bold text-[var(--color-dark)] text-sm mb-0.5">
              Only verified guests can leave a review
            </p>
            <p className="text-xs text-gray-500">
              Book this service first, then share your experience after your event.
            </p>
          </div>
          <Link
            to="#booking"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="shrink-0 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-white text-sm font-bold hover:bg-[var(--color-gold-dark)] transition-colors"
          >
            Book Now
          </Link>
        </div>
      )}

      {/* Logged in, already reviewed */}
      {user.isLoggedIn && hasReviewed && (
        <div className="flex items-center gap-4 p-5 bg-[#FDF6EC] border border-[#E8C97A66] rounded-2xl">
          <div className="text-3xl shrink-0">✅</div>
          <div>
            <p className="font-bold text-[var(--color-dark)] text-sm mb-0.5">
              You've already reviewed this service
            </p>
            <p className="text-xs text-gray-500">
              Thank you for sharing your experience!
            </p>
          </div>
        </div>
      )}

      {/* Logged in, eligible to review */}
      {user.isLoggedIn && canReview && (
        <>
          {!submitted ? (
            <div className="bg-white border border-[#E8C97A66] rounded-2xl p-6 sm:p-8 shadow-[0_2px_16px_rgba(201,162,77,0.08)]">
              <h3 className="text-lg font-extrabold text-[var(--color-dark)] mb-5">
                Write a Review
              </h3>

              {/* Star selector */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Your Rating
                </p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setUserRating(s)}
                      onMouseEnter={() => setHoverStar(s)}
                      onMouseLeave={() => setHoverStar(0)}
                      className="p-0.5 bg-transparent border-none cursor-pointer transition-transform duration-150"
                      style={{
                        transform: (hoverStar || userRating) >= s
                          ? 'scale(1.25)' : 'scale(1)',
                      }}
                    >
                      <Star
                        size={30}
                        fill={(hoverStar || userRating) >= s ? 'var(--color-gold)' : 'none'}
                        color={(hoverStar || userRating) >= s ? 'var(--color-gold)' : '#d1d5db'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                rows={4}
                placeholder="Share your experience with this service..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full px-4 py-3 text-sm font-[inherit] text-[var(--color-dark)] border-[1.5px] border-gray-200 rounded-xl outline-none resize-y mb-5 transition-colors duration-200 focus:border-[var(--color-gold)]"
              />

              {/* Error message */}
              {submitError && (
                <p className="text-sm text-red-500 font-medium mb-3">{submitError}</p>
              )}

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className={[
                  'px-8 py-3 rounded-xl font-bold text-[15px] border-none transition-all duration-200',
                  canSubmit && !isSubmitting
                    ? 'bg-[var(--color-gold)] text-white cursor-pointer shadow-[0_4px_14px_rgba(201,162,77,0.3)] hover:bg-[var(--color-gold-dark)]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed',
                ].join(' ')}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </div>

          ) : (
            /* Success */
            <div className="p-8 bg-gradient-to-br from-[#FDF6EC] to-[#FFF9F0] border-[1.5px] border-[var(--color-gold)] rounded-2xl text-center">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-extrabold text-lg text-[var(--color-dark)] mb-1">
                Thank you for your review!
              </p>
              <p className="text-sm text-gray-500">
                Your feedback helps others make better decisions.
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal implementation */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="relative bg-white rounded-2xl w-full max-w-[680px] max-h-[85vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h3 className="text-lg font-extrabold text-[var(--color-dark)]">
                All Reviews ({totalReviews})
              </h3>
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable review list */}
            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-4">
              {reviews.map((review) => (
                <div
                  key={review.review_id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={review.reviewer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.reviewer_name || 'User')}&background=E8C97A&color=fff`}
                      alt={review.reviewer_name}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[15px] text-[var(--color-dark)] truncate">
                        {review.reviewer_name || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <Star
                          key={s} size={13}
                          fill={s <= review.rating ? 'var(--color-gold)' : 'none'}
                          color={s <= review.rating ? 'var(--color-gold)' : '#d1d5db'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function LocationSection({ location }) {
  // Encode location for Google Maps
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className="mt-12 pt-10 border-t border-gray-200">
      <div className="mb-5">
        <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
          Where you'll be
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">
          Location
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <MapPin size={16} className="text-[var(--color-gold)]" />
          <span className="text-sm font-medium text-gray-600">{location}</span>
        </div>
      </div>

      {/* Map embed */}
      <div className="w-full h-[320px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <iframe
          title="Service Location"
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Exact location provided after booking confirmation.
      </p>
    </section>
  );
}

function SimilarServicesSection({ category, services }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const amount = 300;
    container.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!services || services.length === 0) return null;

  return (
    <section className="mt-12 pt-10 border-t border-gray-200">

      {/* ── Section Header ── */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-[0.18em] mb-1">
            More to explore
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">
            You Might Also Like
          </h2>
        </div>

        {/* Right side: arrows + view all link */}
        <div className="flex items-center gap-3 mb-1">
          <Link
            to={`/services?categories=${encodeURIComponent(category?.toLowerCase() ?? '')}`}
            className="text-sm font-semibold text-[var(--color-gold)] hover:text-[var(--color-gold-dark)] underline underline-offset-2 transition-colors duration-200"
          >
            View All →
          </Link>
        </div>
      </div>

      {/* ── Horizontal Scroll Row ── */}
      <div className="relative group mt-6">
        {/* Left Arrow */}
        <button onClick={() => scroll('left')} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 hidden sm:flex">
          <ChevronLeft size={24} />
        </button>

        <div ref={scrollRef} className="similar-scroll flex gap-5 overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`.similar-scroll::-webkit-scrollbar { display: none; }`}</style>
          {services.map((s) => (
            <div key={s.service_id} className="w-[260px] sm:w-[280px] shrink-0">
              <ServiceCard service={s} viewMode="grid" />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button onClick={() => scroll('right')} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-all opacity-0 group-hover:opacity-100 hidden sm:flex">
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
//  ServiceDetailSkeleton — shown while service loads
// ─────────────────────────────────────────────────────────────
function ServiceDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left col */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="aspect-[16/9] bg-gray-200 rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="h-8 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-100 rounded" />
            <div className="h-24 bg-gray-100 rounded" />
          </div>
          {/* Right col */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
              <div className="h-8 w-1/2 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ServiceDetail — Step 2.5.2
//  Route: /service/:serviceId
// ─────────────────────────────────────────────────────────────
function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate      = useNavigate();
  const queryClient   = useQueryClient();

  // Auth state
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  // ── State: image gallery ────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // ── State: booking form ─────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  // ── State: review form ──────────────────────────────────────
  // Note: 'submitted' success state is managed inside ReviewsSection itself.
  const [reviewError, setReviewError] = useState('');

  // ── React Query v5: service detail ─────────────────────────
  const {
    data:      serviceData,
    isLoading: serviceLoading,
    isError:   serviceError,
  } = useQuery({
    queryKey: ['service', serviceId],
    queryFn:  () => getServiceById(serviceId),
    enabled:  !!serviceId,
    staleTime: 1000 * 60 * 5,
  });

  const service         = serviceData?.service        ?? null;
  const images          = serviceData?.images         ?? [];
  const initialReviews  = serviceData?.reviews        ?? [];  // first 5 from detail endpoint
  const similarServices = serviceData?.similarServices ?? [];

  // ── React Query v5: full reviews (paginated) ────────────────
  const {
    data: reviewsData,
  } = useQuery({
    queryKey: ['reviews', serviceId],
    queryFn:  () => getServiceReviews(serviceId),
    enabled:  !!serviceId,
    staleTime: 1000 * 60 * 2,
  });

  // Prefer full reviews list; fall back to the 5 from detail endpoint
  const reviews     = reviewsData?.reviews             ?? initialReviews;
  const reviewSummary = reviewsData?.summary;
  const totalReviews  = reviewSummary?.total_reviews   ?? parseInt(service?.review_count) ?? 0;

  // Breakdown — prefer from reviews API, fall back to compute from reviews array
  const breakdown = reviewSummary?.breakdown
    ?? [5,4,3,2,1].map(star => ({
        rating:     star,
        count:      reviews.filter(r => r.rating === star).length,
        percentage: totalReviews > 0
          ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100)
          : 0,
      }));

  // ── React Query v5: review eligibility ─────────────────────
  const { data: eligibilityData } = useQuery({
    queryKey: ['review-eligibility', serviceId],
    queryFn:  () => checkReviewEligibility(serviceId),
    enabled:  isLoggedIn && !!serviceId,
    staleTime: 1000 * 60 * 5,
  });

  const canReview   = eligibilityData?.canReview   ?? false;
  const hasReviewed = eligibilityData?.hasReviewed ?? false;

  // ── React Query v5: submit review mutation ──────────────────
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData) => postReview(serviceId, reviewData),
    onSuccess: () => {
      // Invalidate → auto-refetch reviews + service (avg_rating updated)
      queryClient.invalidateQueries({ queryKey: ['reviews', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['review-eligibility', serviceId] });
      setReviewError(''); // clear any previous error
      // ReviewsSection detects success via isSubmitting flip — no setState here
    },
    onError: (err) => {
      const message = err.response?.data?.error
        ?? 'Failed to submit review. Please try again.';
      setReviewError(message);
    },
  });

  // ── Document title ─────────────────────────────────────────
  useEffect(() => {
    if (service?.title) {
      document.title = `${service.title} | Eventat`;
    }
    return () => { document.title = 'Eventat'; };
  }, [service?.title]);

  // ── Image gallery helpers ───────────────────────────────────
  // Build image URL array from images array (objects with image_url)
  const imageUrls = images.map(img => img.image_url);

  useEffect(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, [activeIndex]);

  const nextImage = () => setActiveIndex((prev) => (prev + 1) % Math.max(1, imageUrls.length));
  const prevImage = () => setActiveIndex((prev) => (prev - 1 + Math.max(1, imageUrls.length)) % Math.max(1, imageUrls.length));

  // Stop body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      document.querySelector('nav')?.style.setProperty('display','none');
      document.querySelector('header')?.style.setProperty('display','none');
    } else {
      document.body.style.overflow = 'auto';
      document.querySelector('nav')?.style.removeProperty('display');
      document.querySelector('header')?.style.removeProperty('display');
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.querySelector('nav')?.style.removeProperty('display');
      document.querySelector('header')?.style.removeProperty('display');
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  // ── Loading / error states ──────────────────────────────────
  if (serviceLoading) {
    return <ServiceDetailSkeleton />;
  }

  if (serviceError || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)]">
        <div className="text-center px-4">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-2xl font-extrabold text-[var(--color-dark)] mb-2">
            Service not found
          </h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            This service may have been removed or is unavailable. Browse our other services below.
          </p>
          <button
            onClick={() => navigate('/services')}
            className="px-6 py-3 bg-[var(--color-gold)] text-white rounded-xl font-bold hover:bg-[var(--color-gold-dark)] transition-colors shadow-[0_4px_14px_rgba(201,162,77,0.3)]"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values from real service ───────────────────────
  const activeImage      = imageUrls[activeIndex] ?? service.primary_image_url ?? '';
  const maxThumbnails    = 4;
  const visibleThumbnails = imageUrls.slice(0, maxThumbnails);
  const remainingImagesCount = imageUrls.length - maxThumbnails;

  const isFixedPrice = service.pricing_unit === 'per_event';
  const totalPrice   = isFixedPrice
    ? parseFloat(service.base_price)
    : parseFloat(service.base_price) * quantity;

  const getUnitLabels = (unit) => {
    switch(unit) {
      case 'per_person': return { inputLabel: 'GUESTS',   mathLabel: 'guests' };
      case 'per_hour':   return { inputLabel: 'HOURS',    mathLabel: 'hours'  };
      case 'per_day':    return { inputLabel: 'DAYS',     mathLabel: 'days'   };
      case 'per_item':   return { inputLabel: 'QUANTITY', mathLabel: 'items'  };
      case 'per_event':  return { inputLabel: 'EVENT',    mathLabel: 'event'  };
      default:           return { inputLabel: 'QUANTITY', mathLabel: 'units'  };
    }
  };
  const { inputLabel, mathLabel } = getUnitLabels(service.pricing_unit);

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6 font-medium">
          <Link to="/" className="hover:text-[var(--color-gold)] transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/services" className="hover:text-[var(--color-gold)] transition-colors">Services</Link>
          <ChevronRight size={14} />
          <Link
            to={`/services?categories=${service.category?.slug ?? ''}`}
            className="hover:text-[var(--color-gold)] transition-colors"
          >
            {service.category?.name ?? ''}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-400 truncate max-w-[200px]">{service.title}</span>
        </nav>

        {/* === MAIN CONTENT GRID === */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column - Content (approx 65%) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Interactive Image Gallery */}
            <div className="flex flex-col gap-3">
              {/* Main Image */}
              <div 
                className="w-full aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group relative shadow-[var(--shadow-card)]"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img 
                  src={activeImage} 
                  alt={service.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Thumbnails */}
              {visibleThumbnails.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {visibleThumbnails.map((img, index) => {
                    const isLast = index === maxThumbnails - 1;
                    const isActive = activeIndex === index;
                    return (
                      <div 
                        key={index} 
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ${isActive ? 'ring-2 ring-[var(--color-gold)] ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                        onClick={() => setActiveIndex(index)}
                      >
                        <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                        
                        {/* "+X more" overlay on the 4th thumbnail if there are more images */}
                        {isLast && remainingImagesCount > 0 && (
                          <div 
                            className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm sm:text-base backdrop-blur-[2px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLightboxOpen(true);
                            }}
                          >
                            +{remainingImagesCount} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Service Info Panel */}
            <div>
              {/* Header Row (Badges) */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {service.category?.name ?? ''}
                </span>
                {service.subcategory && (
                  <span className="bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {service.subcategory.name}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-dark)] mt-4 mb-4">
                {service.title}
              </h1>

              {/* Meta Info Strip */}
              <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm sm:text-base text-gray-600 font-medium mb-8">
                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-400" aria-hidden="true" />
                  <span>{service.city ?? service.service_location ?? ''}</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-[var(--color-gold)]" fill="currentColor" aria-hidden="true" />
                  <span>{parseFloat(service.avg_rating || 0).toFixed(1)}</span>
                  <a href="#reviews" className="text-gray-400 hover:text-[var(--color-dark)] hover:underline transition-colors ml-1">
                    ({service.review_count} reviews)
                  </a>
                </div>

                {/* Capacity */}
                {service.capacity && (
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-400" aria-hidden="true" />
                    <span>Up to {service.capacity} guests</span>
                  </div>
                )}
              </div>

              {/* Vendor Block */}
              <div className="flex flex-wrap items-center justify-between gap-4 my-8 p-4 sm:p-5 border border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <Link to={`/vendors/${service.vendor?.vendor_id}`} className="shrink-0">
                    <div className="w-14 h-14 rounded-full bg-[var(--color-gold)]/10 border border-gray-200 shadow-sm flex items-center justify-center">
                      <Store size={24} className="text-[var(--color-gold)]" />
                    </div>
                  </Link>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-bold text-[var(--color-dark)]">
                      Hosted by <Link to={`/vendors/${service.vendor?.vendor_id}`} className="hover:underline">{service.vendor?.name ?? ''}</Link>
                    </h2>
                    <span className="text-sm text-gray-500">Verified Vendor · {service.vendor?.city ?? ''}</span>
                  </div>
                </div>
                <button className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-[var(--color-dark)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all flex items-center gap-2 shadow-sm">
                  <MessageCircle size={18} /> Message
                </button>
              </div>
              <hr className="border-gray-200 my-6" />

              {/* Description Section */}
              <h2 className="text-xl font-extrabold text-[var(--color-dark)] mb-4">
                About this service
              </h2>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                {(service.description ?? '').split('\n\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column - Booking Sidebar (approx 35%) */}
          <div className="lg:col-span-4">
            <div id="booking" className="sticky top-24 bg-white p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col gap-6">
              {/* Header Row */}
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-2xl font-extrabold text-[var(--color-dark)]">{parseFloat(service.base_price || 0).toLocaleString()} JOD</span>
                  <span className="text-gray-500 font-medium text-sm"> / {mathLabel}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-bold text-[var(--color-dark)] mb-1">
                  <Star size={14} className="text-[var(--color-gold)]" fill="currentColor" />
                  <span>{parseFloat(service.avg_rating || 0).toFixed(1)}</span>
                  <span className="text-gray-500 font-normal underline">({service.review_count})</span>
                </div>
              </div>

              {/* Divider */}
              <hr className="border-gray-100" />

              {/* The Unified Input Box */}
              <div className="border border-gray-300 rounded-xl overflow-hidden mb-1">
                <div className="p-3 border-b border-gray-300">
                  <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">Event Date</label>
                  <input type="date" className="w-full mt-1 text-sm outline-none text-gray-700 bg-transparent" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                </div>
                {!isFixedPrice && (
                  <div className="p-3">
                    <label className="block text-[10px] font-bold text-gray-800 uppercase tracking-wider">{inputLabel}</label>
                    <input type="number" min="1" className="w-full mt-1 text-sm outline-none text-gray-700 bg-transparent" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <textarea 
                rows="2" 
                placeholder="Special requests (optional)" 
                className="w-full p-3 text-sm border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-gold)] focus:border-transparent transition-all resize-none" 
                value={specialRequests} 
                onChange={(e) => setSpecialRequests(e.target.value)} 
              />

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button className="w-full bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_rgba(201,162,77,0.3)] flex items-center justify-center gap-2 transition-all">
                  <ShoppingCart size={18} /> Add to Cart
                </button>
                <button className="w-full bg-[var(--color-dark)] hover:bg-[#1a1a1a] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <CreditCard size={18} /> Book Now
                </button>
                <p className="text-center text-xs text-gray-500 mt-1">You won't be charged yet</p>
              </div>

              {/* Live Price Breakdown */}
              <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>{parseFloat(service.base_price || 0).toLocaleString()} JOD x {quantity} {mathLabel}</span>
                  <span>{(isNaN(totalPrice) ? 0 : totalPrice).toLocaleString()} JOD</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>Included</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-base font-extrabold text-[var(--color-dark)]">
                  <span>Total</span>
                  <span>{(isNaN(totalPrice) ? 0 : totalPrice).toLocaleString()} JOD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <ReviewsSection
              service={service}
              reviews={reviews}
              breakdown={breakdown}
              totalReviews={totalReviews}
              user={{ isLoggedIn, name: user?.full_name ?? '', avatar: user?.avatar_url ?? '' }}
              canReview={canReview}
              hasReviewed={hasReviewed}
              onSubmit={(data) => submitReviewMutation.mutate(data)}
              isSubmitting={submitReviewMutation.isPending}
              submitError={reviewError}
            />

            <LocationSection location={service.city ?? service.service_location ?? ''} />
          </div>
          {/* Empty right column to force left-alignment */}
          <div className="hidden lg:block lg:col-span-4"></div>
        </div>

        {/* Full Width Section */}
        <div className="mt-8 lg:mt-12">
          <SimilarServicesSection
            category={service.category?.name ?? ''}
            services={similarServices}
          />
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && imageUrls.length > 0 && (
        <div 
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center cursor-default"
          onClick={() => { setIsLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }); }}
        >
          
          {/* Count Indicator */}
          <div 
            className="absolute top-6 left-6 text-white/90 text-sm font-medium tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {activeIndex + 1} / {imageUrls.length}
          </div>

          {/* Close Button */}
          <button 
            className="absolute top-[24px] right-[60px] z-[60] w-12 h-12 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/30 text-white flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-white/30"
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); setZoom(1); setPan({ x: 0, y: 0 }); }}
            aria-label="Close lightbox"
          >
            <X size={28} />
          </button>

          {/* Previous Arrow */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all z-10 hidden sm:block"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Previous image"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next Arrow */}
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-md transition-all z-10 hidden sm:block"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Next image"
          >
            <ChevronRight size={28} />
          </button>
          
          {/* Main Image Container */}
          <div 
            className="w-full h-full p-4 sm:p-12 flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setZoom(prev => {
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                const newZoom = Math.min(Math.max(prev + delta, 1), 4);
                if (newZoom === 1) {
                  setPan({ x: 0, y: 0 });
                }
                return newZoom;
              });
            }}
            onMouseDown={(e) => {
              if (zoom <= 1) return;
              e.preventDefault();
              e.stopPropagation();
              setIsPanning(true);
              setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }}
            onMouseMove={(e) => {
              if (!isPanning) return;
              e.stopPropagation();
              setPan({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
              });
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              setIsPanning(false);
            }}
            onMouseLeave={() => setIsPanning(false)}
            style={{ cursor: isPanning ? 'grabbing' : zoom > 1 ? 'grab' : 'default' }}
          >
            <img 
              src={activeImage} 
              alt="Expanded view" 
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isPanning ? 'none' : 'transform 150ms ease',
                cursor: 'inherit'
              }}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
          
          {/* Lightbox Thumbnails */}
          <div className="absolute bottom-6 flex gap-2 max-w-full overflow-x-auto px-4 pb-2 z-10" onClick={(e) => e.stopPropagation()}>
            {imageUrls.map((img, index) => (
              <button
                key={index}
                className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeIndex === index ? 'border-[var(--color-gold)] scale-110 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
              >
                <img src={img} alt={`Lightbox Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ServiceDetail;
