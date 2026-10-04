import React from 'react';
import {
  Sparkles, Clock, ShieldCheck, Zap, Monitor, Smartphone, HardDrive, Globe,
  Wifi, Wrench, CheckCircle2, MessageSquare, PhoneCall
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';

const iconMap = {
  Monitor,
  Smartphone,
  HardDrive,
  Globe,
  Wifi,
  Wrench,
  Sparkles,
  Clock,
  ShieldCheck,
  Zap,
};

const getServiceIcon = (iconName) => {
  if (!iconName) return Wrench;
  const resolved = iconMap[iconName] || iconMap[iconName.charAt(0).toUpperCase() + iconName.slice(1)];
  return resolved || Wrench;
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch('/services');
  const apiServices = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
      ? data
      : Array.isArray(data?.data?.data)
        ? data.data.data
        : [];

  const servicesOffers = apiServices.length
    ? apiServices.map((service) => ({
        ...service,
        icon: getServiceIcon(service.icon),
        bullets: [
          service.turnaround || 'Fast turnaround',
          service.duration || 'Flexible scheduling',
          'Quality support',
        ],
        price: `From QAR ${Number(service.price || 0).toLocaleString()}`,
        turnaround: service.turnaround || 'Flexible timing',
      }))
    : [
        {
          icon: Monitor,
          title: 'Computer Repair',
          description: 'Full diagnostic and repair for PCs and Macs. Motherboard, GPU, RAM, storage, and power issues resolved by certified technicians.',
          bullets: ['Free diagnostic', 'Genuine parts', '90-day warranty'],
          price: 'From QAR 150',
          turnaround: 'Same day – 3 days',
        },
        {
          icon: Smartphone,
          title: 'Laptop Repair',
          description: 'Screen replacements, battery swaps, keyboard fixes, hinge repairs, and water damage recovery for all laptop brands.',
          bullets: ['All brands supported', 'OEM parts available', 'Data protected'],
          price: 'From QAR 120',
          turnaround: 'Same day – 2 days',
        },
        {
          icon: HardDrive,
          title: 'Data Recovery',
          description: 'Recover lost, deleted, or corrupted files from hard drives, SSDs, USB drives, and memory cards — even after physical damage.',
          bullets: ['No fix no fee', 'Encrypted drives', 'RAID recovery'],
          price: 'From QAR 200',
          turnaround: '1 – 5 days',
        },
        {
          icon: Globe,
          title: 'Software Setup',
          description: 'Clean OS installation (Windows & macOS), driver configuration, antivirus setup, software licensing, and full system optimization.',
          bullets: ['Windows & macOS', 'Driver installation', 'Performance tuning'],
          price: 'From QAR 80',
          turnaround: '2 – 4 hours',
        },
        {
          icon: Wifi,
          title: 'Networking',
          description: 'Home and office Wi-Fi design and installation. Structured cabling, switch setup, firewall configuration, and VPN deployment.',
          bullets: ['Site survey included', 'Enterprise & SMB', 'Ongoing support'],
          price: 'From QAR 250',
          turnaround: 'Same day',
        },
        {
          icon: Wrench,
          title: 'Office Setup',
          description: 'End-to-end workstation and conference room setup. Monitors, docking stations, printers, NAS, and full cable management.',
          bullets: ['On-site service', 'Cable management', 'Staff training'],
          price: 'From QAR 300',
          turnaround: '1 – 2 days',
        },
      ];

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen pb-20">
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Unable to load services right now. Please try again shortly.
          </div>
        </div>
      )}
      {/* 1. Services Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-[#FFF0E6] via-[#FFD4B8] to-[#FF6B2B] p-8 sm:p-12 lg:p-14 overflow-hidden shadow-xs border border-orange-100/60">
          <div className="max-w-2xl text-left space-y-4 z-10 relative">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-orange-200/80 text-orange-600 font-bold text-xs tracking-wider uppercase backdrop-blur-sm shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>EXPERT CARE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 leading-tight">
              Expert Services
            </h1>

            {/* Subtitle */}
            <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
              From quick repairs to complete office infrastructure — certified technicians solving every tech challenge in Qatar.
            </p>

            {/* Feature Pills Row */}
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-neutral-200/60 text-neutral-800 text-xs sm:text-sm font-semibold backdrop-blur-sm shadow-xs">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>Same-day service</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-neutral-200/60 text-neutral-800 text-xs sm:text-sm font-semibold backdrop-blur-sm shadow-xs">
                <CheckCircle2 className="h-4 w-4 text-orange-600" />
                <span>90-day warranty</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-neutral-200/60 text-neutral-800 text-xs sm:text-sm font-semibold backdrop-blur-sm shadow-xs">
                <Zap className="h-4 w-4 text-orange-600" />
                <span>Free diagnostic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Process Section: How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/70 shadow-xs space-y-6">
          {/* Section Header */}
          <div className="text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 block mb-1">
              THE PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
              How It Works
            </h2>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
            {[
              {
                step: '01',
                title: 'Book a Visit',
                desc: 'Walk in or contact us via WhatsApp to schedule a pickup.'
              },
              {
                step: '02',
                title: 'Free Diagnostic',
                desc: 'Our technicians assess your device at no charge and give a clear quote.'
              },
              {
                step: '03',
                title: 'Expert Repair',
                desc: 'We fix your device using quality parts with full transparency.'
              },
              {
                step: '04',
                title: 'Collect & Go',
                desc: 'Pick up your device or have it delivered. 90-day warranty included.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-50/80 rounded-3xl p-6 sm:p-7 relative overflow-hidden border border-neutral-100 flex flex-col justify-between min-h-[190px]"
              >
                {/* Watermark Faint Number in top-right */}
                <span className="text-5xl font-black text-neutral-200/60 select-none absolute top-4 right-5 font-mono">
                  {item.step}
                </span>

                {/* Orange Circle Step Badge */}
                <div className="h-8 w-8 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {item.step}
                </div>

                {/* Step Content */}
                <div className="mt-4 text-left z-10 relative">
                  <h3 className="font-extrabold text-neutral-900 text-base sm:text-lg mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Outer White Section Container: Every Service Under One Roof */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-neutral-200/70 shadow-xs space-y-8">
          {/* Section Header */}
          <div className="text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-orange-600 block mb-1">
              WHAT WE OFFER
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight">
              Every Service Under One Roof
            </h2>
          </div>

          {/* 6 Service Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((key) => (
                <div key={key} className="animate-pulse rounded-3xl border border-neutral-100 bg-neutral-50 p-6">
                  <div className="mb-5 h-12 w-12 rounded-full bg-neutral-200" />
                  <div className="mb-3 h-6 w-2/3 rounded bg-neutral-200" />
                  <div className="mb-2 h-4 w-full rounded bg-neutral-200" />
                  <div className="mb-2 h-4 w-5/6 rounded bg-neutral-200" />
                  <div className="mb-6 h-4 w-4/5 rounded bg-neutral-200" />
                  <div className="h-16 rounded-2xl bg-neutral-200" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
              Unable to load services right now. Please try again later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesOffers.map((item, idx) => {
                const Icon = item.icon || Wrench;
                return (
                  <div
                    key={item.serviceId || idx}
                    className="bg-neutral-50/80 rounded-3xl p-6 sm:p-7 border border-neutral-100 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 text-left"
                  >
                    <div>
                      <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-neutral-700 shadow-xs mb-5">
                        <Icon className="h-5 w-5 stroke-[1.75]" />
                      </div>

                      <h3 className="font-bold text-neutral-900 text-lg sm:text-xl mb-2.5">
                        {item.name || item.title}
                      </h3>

                      <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed mb-5 font-normal">
                        {(item.description || item.shortDescription || item.detail || item.summary || 'Professional service support designed for your needs.')}
                      </p>

                      <ul className="space-y-1.5 mb-8">
                        {(item.bullets || [item.duration || 'Flexible scheduling', item.turnaround || 'Fast turnaround', 'Quality support']).map((b, bIdx) => (
                          <li key={bIdx} className="text-xs sm:text-sm text-neutral-600 font-medium flex items-center">
                            <span className="text-orange-600 font-bold text-base mr-2 leading-none">•</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-neutral-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block mb-0.5">
                          STARTING FROM
                        </span>
                        <span className="font-extrabold text-neutral-900 text-sm sm:text-base">
                          {item.price || 'Custom Quote'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-neutral-400 tracking-wider uppercase block mb-0.5">
                          TURNAROUND
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-neutral-600">
                          {item.turnaround || item.duration || 'Flexible timing'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. Bottom CTA Banner: Ready to Get Started? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-[#181310] via-[#5C2304] to-[#F95700] p-8 sm:p-10 lg:p-12 overflow-hidden shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-orange-950/30">
          
          {/* Left Text */}
          <div className="space-y-1.5 max-w-xl z-10 text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-sm sm:text-base font-normal">
              Walk in to our store or reach us on WhatsApp — we'll take it from there.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 z-10 w-full md:w-auto">
            {/* WhatsApp Us Button */}
            <a
              href="https://wa.me/97412345678"
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-white hover:bg-white/95 text-[#F95700] font-extrabold text-sm sm:text-base shadow-lg transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2 border-0"
            >
              <MessageSquare className="h-4 w-4 stroke-[2.5]" />
              <span>WhatsApp Us</span>
            </a>

            {/* Call Now Button */}
            <a
              href="tel:+97412345678"
              className="h-12 sm:h-14 px-6 sm:px-8 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-sm sm:text-base backdrop-blur-sm shadow-xs transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
            >
              <PhoneCall className="h-4 w-4 stroke-[2]" />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
