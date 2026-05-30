import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MapPin, Star, BadgeCheck, Phone, Mail, Globe,
  Calendar, Users, Award,
  ChevronRight, MessageCircle, Share2, Heart,
  Clock, Briefcase,
} from 'lucide-react';
import ServiceCard from '../../components/Home/ServiceCard';

const MOCK_VENDOR = {
  id:          'v1',
  name:        'Royal Hotels & Resorts',
  tagline:     'Crafting unforgettable moments since 2010',
  avatar:      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
  cover:       'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
  city:        'Amman, Jordan',
  category:    'Venue',
  isVerified:  true,
  memberSince: 'March 2020',
  rating:      4.8,
  reviewCount: 124,
  totalEvents: 231,
  responseTime:'Within 2 hours',
  about: `Royal Hotels & Resorts has been one of Jordan's premier event venue providers since 2010. We specialize in grand weddings, prestigious corporate galas, and milestone celebrations.\n\nOur dedicated team of event coordinators works tirelessly to ensure every detail is flawless — from crystal chandelier lighting to bespoke floral arrangements and gourmet catering.\n\nWith over 200 successful events under our belt, we bring passion, precision, and elegance to everything we do.`,
  phone:       '+962 7 8123 4567',
  email:       'events@royalhotels.jo',
  website:     'www.royalhotels.jo',
  socialLinks: {
    instagram: 'royalhotels_jo',
    facebook:  'RoyalHotelsJordan',
  },
};

const MOCK_VENDOR_SERVICES = [
  {
    id: 's1',
    title: 'Grand Royal Ballroom',
    category: 'Venue',
    categorySlug: 'venue',
    vendorName: 'Royal Hotels & Resorts',
    location: 'Amman, 5th Circle',
    rating: 4.9,
    reviewCount: 98,
    basePrice: 1500,
    pricingUnit: 'per_event',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80',
  },
  {
    id: 's2',
    title: 'The Pearl Ballroom',
    category: 'Venue',
    categorySlug: 'venue',
    vendorName: 'Royal Hotels & Resorts',
    location: 'Amman, Abdoun',
    rating: 4.7,
    reviewCount: 61,
    basePrice: 1200,
    pricingUnit: 'per_event',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
  },
  {
    id: 's3',
    title: 'Rooftop Garden Terrace',
    category: 'Venue',
    categorySlug: 'venue',
    vendorName: 'Royal Hotels & Resorts',
    location: 'Amman, Jabal Amman',
    rating: 4.6,
    reviewCount: 44,
    basePrice: 800,
    pricingUnit: 'per_event',
    image: 'https://images.unsplash.com/photo-1525258946800-98ccd7a0ea00?w=600&q=80',
  },
  {
    id: 's4',
    title: 'Executive Conference Hall',
    category: 'Venue',
    categorySlug: 'venue',
    vendorName: 'Royal Hotels & Resorts',
    location: 'Amman, 5th Circle',
    rating: 4.8,
    reviewCount: 37,
    basePrice: 600,
    pricingUnit: 'per_hour',
    image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&q=80',
  },
];

const MOCK_VENDOR_REVIEWS = [
  {
    id: 'r1',
    reviewerName: 'Sarah Al-Ahmad',
    reviewerAvatar: 'https://i.pravatar.cc/150?img=47',
    date: 'March 15, 2025',
    rating: 5,
    service: 'Grand Royal Ballroom',
    text: 'Absolutely stunning venue! The staff was incredibly professional. Our guests are still talking about it.',
  },
  {
    id: 'r2',
    reviewerName: 'Omar Khalil',
    reviewerAvatar: 'https://i.pravatar.cc/150?img=12',
    date: 'February 2, 2025',
    rating: 5,
    service: 'The Pearl Ballroom',
    text: 'Perfect for our corporate gala. The AV setup was world-class and the catering team was flawless.',
  },
  {
    id: 'r3',
    reviewerName: 'Lina Nasser',
    reviewerAvatar: 'https://i.pravatar.cc/150?img=32',
    date: 'January 20, 2025',
    rating: 4,
    service: 'Grand Royal Ballroom',
    text: 'Beautiful space with great service. Minor delay in setup but the team resolved it quickly.',
  },
];

function ReviewsSection({ reviews }) {
  const totalCount = reviews.length;
  const avgRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1);

  return (
    <section id="reviews" className="mt-12 pt-10 border-t border-gray-200">
      {/* Container to constrain width */}
      <div className="max-w-[800px]">
        
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)] mb-8">
          Reviews ({totalCount})
        </h2>

        {/* ── Rating Summary ── */}
        <div className="flex flex-wrap items-center gap-8 mb-10 p-6 sm:p-8 rounded-2xl border border-[#E8C97A44] bg-gradient-to-br from-[#FDF6EC] to-[#FFF9F0]">
          <div className="flex flex-col items-center min-w-[80px]">
            <span className="text-6xl font-black text-[var(--color-dark)] leading-none">{avgRating}</span>
            <div className="flex gap-0.5 my-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={16} fill={s <= Math.round(avgRating) ? 'var(--color-gold)' : 'none'} color={s <= Math.round(avgRating) ? 'var(--color-gold)' : '#d1d5db'} />
              ))}
            </div>
            <span className="text-xs text-gray-500">{totalCount} reviews</span>
          </div>
          
          <div className="flex-1 min-w-[200px] flex flex-col gap-2">
            {[5,4,3,2,1].map(stars => {
              const count = reviews.filter(r => r.rating === stars).length;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-700 w-7">{stars}★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#E8C97A] to-[#C9A24D]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-9">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Individual Review Cards ── */}
        <div className="flex flex-col gap-4">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img src={review.reviewerAvatar} alt={review.reviewerName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[15px] text-[var(--color-dark)]">{review.reviewerName}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={13} fill={s <= review.rating ? 'var(--color-gold)' : 'none'} color={s <= review.rating ? 'var(--color-gold)' : '#d1d5db'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VendorPublicProfile() {
  const { vendorId } = useParams();
  const vendor = MOCK_VENDOR;

  const [activeTab, setActiveTab]   = useState('services');
  const [isSaved,   setIsSaved]     = useState(false);

  const TABS = [
    { id: 'services', label: 'Services', count: MOCK_VENDOR_SERVICES.length },
    { id: 'reviews',  label: 'Reviews',  count: MOCK_VENDOR_REVIEWS.length  },
    { id: 'about',    label: 'About',    count: null                         },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">

      {/* ══ COVER BANNER ══ */}
      <div className="relative w-full h-[220px] sm:h-[280px] overflow-hidden">
        <img
          src={vendor.cover}
          alt="Vendor cover"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t 
          from-black/60 via-black/20 to-transparent" />

        {/* Save + Share buttons — top right */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={() => setIsSaved(s => !s)}
            className={`w-10 h-10 rounded-full backdrop-blur-md flex 
              items-center justify-center transition-all border
              ${isSaved 
                ? 'bg-red-500 border-red-500 text-white' 
                : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}`}
            aria-label="Save vendor"
          >
            <Heart size={18} fill={isSaved ? 'white' : 'none'} />
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white/20 
              backdrop-blur-md border border-white/30 text-white 
              flex items-center justify-center hover:bg-white/30 
              transition-all"
            aria-label="Share"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* ══ PROFILE HEADER ══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        
        {/* Avatar + Info Row */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 relative z-10">
          
          {/* Avatar — Square with rounded corners, white frame, pulled up */}
          <div className="-mt-12 sm:-mt-16 w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 sm:border-[6px] border-white shadow-xl shrink-0 bg-white relative">
            <img
              src={vendor.avatar}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name, Badges & CTA — Pushed down with pt-6 to align below avatar's vertical center */}
          <div className="flex-1 flex flex-col lg:flex-row lg:items-start justify-between gap-5 pt-2 sm:pt-6 pb-2">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-dark)]">
                  {vendor.name}
                </h1>
                {vendor.isVerified && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold-dark)] text-xs font-bold rounded-full border border-[var(--color-gold)]/30 mt-1 sm:mt-0">
                    <BadgeCheck size={14} /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm sm:text-base font-medium mb-3 sm:mb-4">
                {vendor.tagline}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[var(--color-gold)]" />
                  {vendor.city}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} className="text-[var(--color-gold)]" />
                  Since {vendor.memberSince}
                </span>
                <span className="flex items-center gap-1.5 hidden sm:flex">
                  <Clock size={16} className="text-[var(--color-gold)]" />
                  Replies {vendor.responseTime}
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
              <a
                href={`tel:${vendor.phone}`}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--color-gold)] hover:bg-[var(--color-gold-dark)] text-white font-extrabold rounded-xl shadow-[0_4px_14px_rgba(201,162,77,0.3)] transition-all text-sm w-full"
              >
                <MessageCircle size={18} /> Contact Vendor
              </a>
            </div>
          </div>
        </div>

        {/* ══ STATS STRIP ══ */}
        <div className="grid grid-cols-3 gap-4 mt-10 mb-8 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
          
          <div className="flex flex-col items-center text-center 
            border-r border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Star size={18} fill="var(--color-gold)" 
                color="var(--color-gold)" />
              <span className="text-2xl font-black text-[var(--color-dark)]">
                {vendor.rating}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {vendor.reviewCount} Reviews
            </span>
          </div>

          <div className="flex flex-col items-center text-center 
            border-r border-gray-100">
            <div className="flex items-center gap-1.5 mb-1">
              <Award size={18} className="text-indigo-500" />
              <span className="text-2xl font-black text-[var(--color-dark)]">
                {vendor.totalEvents}+
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Events Hosted
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-1">
              <Briefcase size={18} className="text-emerald-500" />
              <span className="text-2xl font-black text-[var(--color-dark)]">
                {MOCK_VENDOR_SERVICES.length}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Active Services
            </span>
          </div>
        </div>

        {/* ══ TABS ══ */}
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm 
                font-bold transition-all border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-xs
                  ${activeTab === tab.id
                    ? 'bg-[var(--color-gold)]/15 text-[var(--color-gold-dark)]'
                    : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB CONTENT ══ */}
        <div className="pb-16">

          {/* ── SERVICES TAB ── */}
          {activeTab === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-extrabold text-[var(--color-dark)]">
                  All Services by {vendor.name}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 
                lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {MOCK_VENDOR_SERVICES.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    viewMode="grid"
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEWS TAB ── */}
          {activeTab === 'reviews' && (
            <ReviewsSection reviews={MOCK_VENDOR_REVIEWS} />
          )}

          {/* ── ABOUT TAB ── */}
          {activeTab === 'about' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left: About text */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-extrabold 
                  text-[var(--color-dark)] mb-4">
                  About {vendor.name}
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 
                  shadow-sm p-6">
                  {vendor.about.split('\n\n').map((para, i) => (
                    <p key={i} className="text-gray-600 leading-relaxed mb-4 
                      last:mb-0 text-sm">
                      {para}
                    </p>
                  ))}
                </div>
              </div>

              {/* Right: Contact card */}
              <div className="lg:col-span-1">
                <h2 className="text-lg font-extrabold 
                  text-[var(--color-dark)] mb-4">
                  Contact Info
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 
                  shadow-sm p-6 flex flex-col gap-4">

                  {/* Phone */}
                  <a href={`tel:${vendor.phone}`}
                    className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl 
                      bg-emerald-50 text-emerald-600 flex items-center 
                      justify-center shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 
                        uppercase tracking-wide">Phone</p>
                      <p className="text-sm font-bold text-[var(--color-dark)] 
                        group-hover:text-[var(--color-gold)] transition-colors">
                        {vendor.phone}
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <a href={`mailto:${vendor.email}`}
                    className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl 
                      bg-blue-50 text-blue-600 flex items-center 
                      justify-center shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 
                        uppercase tracking-wide">Email</p>
                      <p className="text-sm font-bold text-[var(--color-dark)] 
                        group-hover:text-[var(--color-gold)] transition-colors">
                        {vendor.email}
                      </p>
                    </div>
                  </a>

                  {/* Website */}
                  <a href={`https://${vendor.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl 
                      bg-purple-50 text-purple-600 flex items-center 
                      justify-center shrink-0">
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 
                        uppercase tracking-wide">Website</p>
                      <p className="text-sm font-bold text-[var(--color-dark)] 
                        group-hover:text-[var(--color-gold)] transition-colors">
                        {vendor.website}
                      </p>
                    </div>
                  </a>

                  <div className="border-t border-gray-100 pt-4 mt-1">
                    <p className="text-[11px] font-bold text-gray-400 
                      uppercase tracking-wide mb-3">Social</p>
                    <div className="flex gap-3">
                      <a href={`https://instagram.com/${vendor.socialLinks.instagram}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 
                          bg-pink-50 text-pink-600 rounded-xl text-xs 
                          font-bold hover:bg-pink-100 transition-colors">
                        <Globe size={14} />
                        Instagram
                      </a>
                      <a href={`https://facebook.com/${vendor.socialLinks.facebook}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 
                          bg-blue-50 text-blue-600 rounded-xl text-xs 
                          font-bold hover:bg-blue-100 transition-colors">
                        <Globe size={14} />
                        Facebook
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default VendorPublicProfile;
