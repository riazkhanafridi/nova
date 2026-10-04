import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Users, Zap, Award, Sparkles, Eye, Heart, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { value: '2018', label: 'FOUNDED IN DOHA' },
    { value: '500+', label: 'PRODUCTS IN STOCK' },
    { value: '50+', label: 'PREMIUM BRANDS' },
    { value: '10K+', label: 'HAPPY CUSTOMERS' }
  ];

  const journeyTimeline = [
    {
      year: '2018',
      text: 'NOVA opens its first store in Doha, Qatar with a focus on premium mobile accessories.'
    },
    {
      year: '2019',
      text: 'Expanded to computer peripherals and launched our first repair service center.'
    },
    {
      year: '2021',
      text: 'Reached 5,000 satisfied customers and added networking products to our catalog.'
    },
    {
      year: '2023',
      text: 'Partnered with Apple, Logitech, and Baseus as an authorized reseller in Qatar.'
    },
    {
      year: '2025',
      text: 'Serving 10,000+ customers with 500+ products and 6 expert service categories.'
    }
  ];

  const coreValues = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'We source only from trusted brands and inspect every product before it reaches our shelves.'
    },
    {
      icon: Eye,
      title: 'Full Transparency',
      description: 'No hidden fees, honest diagnostics, and clear pricing — always. What we quote is what you pay.'
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: 'Every decision we make starts with one question: is this the best outcome for our customer?'
    },
    {
      icon: Zap,
      title: 'Stay Ahead',
      description: 'We track global tech trends to ensure Qatar always has access to the latest innovations.'
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 max-w-7xl">
      {/* Hero Banner Combined Card */}
      <div className="rounded-[2.5rem] overflow-hidden border border-neutral-200/70 shadow-xs bg-white">
        {/* Top Gradient Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#FFF0E6] via-[#FFD4B8] to-[#FF6B2B] p-8 sm:p-12 lg:p-14">
          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-orange-200/80 text-orange-600 font-bold text-xs tracking-wider uppercase backdrop-blur-sm shadow-xs mb-6">
              OUR STORY
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-tight mb-4">
              About NOVA
            </h1>
            <p className="text-neutral-700 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              We started with a simple belief: Qatar deserves access to the world's best tech accessories, paired with service that actually cares.
            </p>
          </div>
        </div>

        {/* Bottom Modern Office Interior Banner */}
        <div className="relative h-64 sm:h-80 lg:h-[420px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
            alt="NOVA Modern Office Interior"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1600&q=80';
            }}
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-[2rem] p-6 sm:p-8 text-center border border-neutral-200/70 shadow-xs hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-2 group-hover:text-orange-600 transition-colors duration-200">
              {stat.value}
            </div>
            <div className="text-xs font-bold text-neutral-400 tracking-wider uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Our Mission & Our Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Mission Card (Dark) */}
        <div className="group rounded-[2.25rem] bg-[#18181B] p-8 sm:p-10 lg:p-12 text-white border border-neutral-800 shadow-xl hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider text-orange-500 uppercase mb-3 block">
              OUR MISSION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4 group-hover:text-orange-400 transition-colors">
              Make premium technology accessible to everyone in Qatar.
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-normal">
              We curate the finest tech accessories from around the world and deliver them with expert knowledge and honest service — so every customer can work better and live better.
            </p>
          </div>
        </div>

        {/* Vision Card (Vibrant Solid Orange) */}
        <div className="group rounded-[2.25rem] bg-gradient-to-br from-[#FF5500] to-[#FF6B2B] p-8 sm:p-10 lg:p-12 text-white shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold tracking-wider text-white/90 uppercase mb-3 block">
              OUR VISION
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-4">
              Become Qatar's most trusted name in technology retail and service.
            </h2>
            <p className="text-white/95 text-sm sm:text-base leading-relaxed font-normal">
              We envision a future where NOVA is the first name that comes to mind whenever someone in Qatar needs tech accessories, repairs, or expert advice.
            </p>
          </div>
        </div>
      </div>

      {/* 2 Column: Our Journey (Timeline) & Core Values (What We Stand For) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: How We Got Here */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-orange-600 uppercase mb-1">
              OUR JOURNEY
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-8">
              How We Got Here
            </h2>

            <div className="space-y-6 relative">
              {journeyTimeline.map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group">
                  {/* Year */}
                  <span className="w-12 text-sm font-extrabold text-neutral-400 text-right shrink-0 pt-0.5 group-hover:text-orange-600 transition-colors">
                    {item.year}
                  </span>

                  {/* Bullet Ring & Line */}
                  <div className="relative flex items-center justify-center pt-1.5 shrink-0">
                    <span className="h-3 w-3 rounded-full border-2 border-neutral-300 bg-white group-hover:border-orange-500 group-hover:bg-orange-500 transition-colors duration-200 z-10" />
                    {idx !== journeyTimeline.length - 1 && (
                      <span className="absolute top-4 bottom-0 w-px bg-neutral-200 -mb-6" />
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-medium pl-1 group-hover:text-neutral-900 transition-colors">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: What We Stand For */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold tracking-wider text-orange-600 uppercase mb-1">
              CORE VALUES
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-8">
              What We Stand For
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {coreValues.map((val, idx) => {
                const IconComp = val.icon;
                return (
                  <div
                    key={idx}
                    className="group bg-[#FAFAFA] p-6 rounded-2xl border border-neutral-200/60 shadow-xs hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="h-9 w-9 rounded-full bg-orange-100/80 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <IconComp className="h-4 w-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-neutral-900 group-hover:text-orange-600 transition-colors mb-2">
                        {val.title}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-[2.5rem] bg-[#18181B] p-8 sm:p-10 lg:p-12 text-white relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border border-neutral-800 group hover:border-orange-500/50 transition-all duration-500">
        <div className="max-w-xl relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Come Visit Us in Doha
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium">
            Meet our team, see the products, and experience NOVA firsthand.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 bg-[#FF5500] hover:bg-[#E64D00] text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 text-sm hover:scale-105 active:scale-95 group/btn"
          >
            Get Directions{' '}
            <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300" />
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-transparent border border-neutral-700 hover:border-neutral-500 text-white font-bold px-7 py-3.5 rounded-full transition-all duration-300 text-sm hover:bg-white/5 active:scale-95"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}



