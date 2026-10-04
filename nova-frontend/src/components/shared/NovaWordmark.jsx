export default function NovaWordmark({ variant = 'dark', compact = false, className = '' }) {
  const isDark = variant === 'dark';
  const textClass = isDark ? 'text-[#f3f4f6]' : 'text-white';
  const subTextClass = isDark ? 'text-[#1a1d20]' : 'text-white/90';

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className={`relative ${compact ? 'h-[28px] sm:h-[48px]' : 'h-[52px] sm:h-[94px]'}`}>
        <div
          className={[
            'select-none lowercase leading-none',
            compact ? 'text-[2.1rem] sm:text-[4rem]' : 'text-[3.4rem] sm:text-[7rem]',
            'tracking-[-0.18em] font-black',
            textClass,
          ].join(' ')}
          style={{
            fontFamily: 'Impact, "Arial Black", sans-serif',
            lineHeight: 0.8,
            letterSpacing: '-0.12em',
          }}
        >
          nova
        </div>

        <svg
          viewBox="0 0 180 180"
          className={[
            'absolute drop-shadow-[0_8px_18px_rgba(255,90,31,0.38)]',
            compact ? 'h-[18px] w-[18px] sm:h-[30px] sm:w-[30px]' : 'h-[36px] w-[36px] sm:h-[68px] sm:w-[68px]',
            'left-[44%] top-[4%] -translate-x-1/2 rotate-[12deg]',
          ].join(' ')}
          aria-hidden="true"
        >
          <path d="M95 4L33 94H63L44 174L151 60H111L136 4H95Z" fill="#ff5a1f" />
        </svg>
      </div>

      {!compact && (
        <div
          className={[
            'mt-1 text-center uppercase leading-none tracking-[0.18em]',
            compact ? 'text-[0.34rem]' : 'text-[0.45rem] sm:text-[0.7rem]',
            subTextClass,
          ].join(' ')}
          style={{
            fontFamily: '"Segoe UI", sans-serif',
            fontWeight: 800,
          }}
        >
          Mobile Accessories and Computer Services
        </div>
      )}
    </div>
  );
}
