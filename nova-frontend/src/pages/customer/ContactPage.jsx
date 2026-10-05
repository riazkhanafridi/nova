import { useState } from 'react';
import { MessageCircleMore, PhoneCall, Mail, MapPin, Clock3, Send, ChevronDown, MessageCircle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import api from '../../lib/api';

const contactCards = [
  {
    icon: MessageCircleMore,
    label: 'WHATSAPP',
    value: '+92 336 0195495',
    note: 'Typically replies within minutes',
    action: 'Message us →',
    accent: 'bg-[#dff5ea]',
    iconColor: 'text-[#1fb76a]',
  },
  {
    icon: PhoneCall,
    label: 'PHONE',
    value: '+92 336 0195495',
    note: 'Sunday - Thursday, 9am - 10pm',
    action: 'Call now →',
    accent: 'bg-[#fceae3]',
    iconColor: 'text-[#f26a1b]',
  },
  {
    icon: Mail,
    label: 'EMAIL',
    value: 'info@novaqatar.com',
    note: 'We respond within 24 hours',
    action: 'Send email →',
    accent: 'bg-[#f2f3f4]',
    iconColor: 'text-[#2b2b2b]',
  },
];

export default function ContactPage() {
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      topic: formData.get('topic'),
      message: formData.get('message'),
    };

    setSending(true);
    try {
      const { data } = await api.post('/contact', payload);
      toast({ title: 'Message sent', description: data?.message || 'We will get back to you soon.' });
      form.reset();
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not send message',
        description: err.response?.data?.message || 'Please try again in a moment.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] bg-[#f3f2f1] px-4 py-8 md:px-6 md:py-12">
      <section className="rounded-[2rem] bg-gradient-to-r from-[#f2d9c3] via-[#f09d56] to-[#f26a1b] p-8 md:p-12 lg:p-14 shadow-sm">
        <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-[0.7rem] font-extrabold tracking-[0.2em] text-[#1f2937] uppercase backdrop-blur-sm">
          Get in Touch
        </div>

        <h1 className="mt-8 text-5xl font-black tracking-[-0.08em] text-[#111827] md:text-[5rem] md:leading-[0.95]">
          Contact NOVA
        </h1>

        <p className="mt-6 max-w-[880px] text-xl leading-relaxed text-[#1f2937]/90 md:text-[1.6rem]">
          Have a question, need a repair, or want expert advice? We&apos;re in Doha and ready to help.
        </p>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {contactCards.map(({ icon: Icon, label, value, note, action, accent, iconColor }) => (
          <div key={label} className="group rounded-[1.5rem] border border-[#e5e7eb] bg-[#f7f5f3] p-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <div className={`mb-8 flex h-14 w-14 items-center justify-center rounded-full ${accent} transition-transform duration-300 group-hover:-translate-y-1`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>

            <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#4b5563]">{label}</div>

            <div className="mt-4 text-[2rem] font-extrabold leading-tight text-[#111827] md:text-[1.9rem]">
              {value}
            </div>

            <p className="mt-3 text-[0.95rem] text-[#4b5563]">{note}</p>

            <button className="mt-8 inline-flex items-center text-[1.05rem] font-semibold text-[#f26a1b] transition hover:text-[#d95a18]">
              {action}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-8 xl:grid-cols-[1.8fr_0.9fr]">
        <div className="group rounded-[1.75rem] border border-[#e7e5e4] bg-[#f3f3f1] p-6 md:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
          <h2 className="text-[2.1rem] font-black tracking-[-0.05em] text-[#111827]">Send Us a Message</h2>
          <p className="mt-4 text-[0.98rem] text-[#4b5563]">Fill out the form and we&apos;ll get back to you within 24 hours.</p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">
                  Full Name <span className="text-[#f26a1b]">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  maxLength={150}
                  placeholder="Ahmed Al-Thani"
                  className="h-14 w-full rounded-[1rem] border border-[#e5e7eb] bg-[#f3f4f6] px-4 text-[0.95rem] text-[#111827] outline-none placeholder:text-[#111827]/70 focus:border-[#f26a1b]"
                />
              </div>

              <div>
                <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  maxLength={40}
                  placeholder="+974 5555 1234"
                  className="h-14 w-full rounded-[1rem] border border-[#e5e7eb] bg-[#f3f4f6] px-4 text-[0.95rem] text-[#111827] outline-none placeholder:text-[#111827]/70 focus:border-[#f26a1b]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">
                Email Address <span className="text-[#f26a1b]">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                maxLength={254}
                placeholder="ahmed@example.com"
                className="h-14 w-full rounded-[1rem] border border-[#e5e7eb] bg-[#f3f4f6] px-4 text-[0.95rem] text-[#111827] outline-none placeholder:text-[#111827]/70 focus:border-[#f26a1b]"
              />
            </div>

            <div className="relative">
              <select
                defaultValue=""
                name="topic"
                className="h-14 w-full appearance-none rounded-[1rem] border border-[#e5e7eb] bg-[#f3f4f6] px-4 pr-12 text-[0.95rem] text-[#111827] outline-none placeholder:text-[#111827]/70 focus:border-[#f26a1b]"
              >
                <option value="" disabled hidden>Select a topic...</option>
                <option>General Inquiry</option>
                <option>Repair Service</option>
                <option>Product Support</option>
                <option>Bulk Order</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#4b5563]" />
            </div>

            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">
                Message <span className="text-[#f26a1b]">*</span>
              </label>
              <textarea
                rows={5}
                name="message"
                required
                maxLength={10000}
                placeholder="Tell us how we can help you..."
                className="w-full resize-none rounded-[1rem] border border-[#e5e7eb] bg-[#f3f4f6] px-4 py-4 text-[0.95rem] text-[#111827] outline-none placeholder:text-[#111827]/70 focus:border-[#f26a1b]"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="flex h-16 w-full items-center justify-center gap-3 rounded-[1rem] bg-gradient-to-r from-[#f26a1b] to-[#f58c35] text-[1.05rem] font-bold text-white shadow-[0_12px_28px_rgba(242,106,27,0.23)] transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-105"
            >
              <Send className={`h-5 w-5 ${sending ? 'animate-pulse' : ''}`} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="group overflow-hidden rounded-[1.5rem] border border-[#e7e5e4] bg-[#5eb7be] shadow-[0_8px_26px_rgba(15,23,42,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
            <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-[#5eb7be] via-[#f3a0a2] to-[#efbe67] transition-transform duration-300 group-hover:-translate-y-1">
              <div className="absolute inset-0 opacity-90">
                <div className="absolute -left-8 top-8 h-44 w-44 rotate-12 rounded-[38%] bg-[#d73d62]/80" />
                <div className="absolute right-[-26px] top-0 h-52 w-52 rotate-[-18deg] rounded-[35%] bg-[#c7d642]/70" />
                <div className="absolute bottom-[-38px] left-1/2 h-36 w-36 -translate-x-1/2 rotate-12 rounded-[38%] bg-[#f2d46b]/80" />
                <div className="absolute left-16 top-12 h-20 w-20 rounded-full bg-[#20395a]/25" />
                <div className="absolute right-10 bottom-10 h-24 w-24 rounded-full bg-[#c04a84]/20" />
              </div>

              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-full bg-white/90 px-5 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f26a1b] text-white">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-xl font-bold text-[#111827]">NOVA Qatar</span>
              </div>
            </div>
          </div>

          <div className="group rounded-[1.5rem] border border-[#e7e5e4] bg-[#f7f5f3] p-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
            <h3 className="text-[2.2rem] font-black tracking-[-0.05em] text-[#111827]">Store Information</h3>

            <div className="mt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#fceae3] text-[#f26a1b]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">Address</div>
                  <div className="mt-2 text-xl font-semibold text-[#111827]">Al Muntaaz Street, Doha, Qatar</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#fceae3] text-[#f26a1b]">
                  <PhoneCall className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">Phone</div>
                  <div className="mt-2 text-xl font-semibold text-[#111827]">+92 336 0195495</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#fceae3] text-[#f26a1b]">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#4b5563]">Email</div>
                  <div className="mt-2 text-xl font-semibold text-[#111827]">info@novaqatar.com</div>
                </div>
              </div>
            </div>
          </div>

          <div className="group rounded-[1.5rem] bg-[#171717] p-6 text-white shadow-[0_8px_20px_rgba(15,23,42,0.22)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(15,23,42,0.28)]">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#f26a1b]">
                <Clock3 className="h-4 w-4" />
              </div>
              <h3 className="text-3xl font-black tracking-[-0.04em]">Store Hours</h3>
            </div>

            <div className="mt-6 space-y-4 text-lg text-[#f3f4f6]">
              <div className="flex items-center justify-between gap-4">
                <span>Sunday - Thursday</span>
                <span className="font-semibold text-white">9:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Friday</span>
                <span className="font-semibold text-white">2:00 PM - 10:00 PM</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Saturday</span>
                <span className="font-semibold text-white">10:00 AM - 10:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 rounded-[2rem] bg-gradient-to-r from-[#171717] via-[#241d1b] to-[#f26a1b] p-7 md:p-10 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-4xl font-black tracking-[-0.05em] text-white">Prefer to chat directly?</h3>
            <p className="mt-3 text-xl text-white/80">Our team is online on WhatsApp - get instant answers.</p>
          </div>

          <button className="flex items-center gap-3 rounded-full border border-white/70 bg-white px-6 py-4 text-xl font-semibold text-[#111827] shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-[#fff7f3]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f26a1b] text-white">
              <MessageCircle className="h-4 w-4" />
            </div>
            Chat on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
