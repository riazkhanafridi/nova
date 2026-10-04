export default function NovaLogo({ className = '', style = {} }) {
  return (
    <div className={`inline-block select-none ${className}`} style={style}>
      <svg viewBox="0 0 620 190" className="w-full h-auto overflow-visible" aria-label="NOVA Mobile Accessories and Computer Services">
        {/* N */}
        <path d="M 40 115 V 50 C 40 32 55 20 75 20 H 105 C 125 20 140 32 140 50 V 115" fill="none" stroke="#0A0A0A" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* O Box Frame */}
        <path d="M 180 20 H 240 C 260 20 275 35 275 55 V 80 C 275 100 260 115 240 115 H 180 C 160 115 145 100 145 80 V 55 C 145 35 160 20 180 20 Z" fill="none" stroke="#0A0A0A" strokeWidth="15" strokeLinejoin="round"/>
        
        {/* Orange Lightning Bolt crossing O */}
        <polygon points="255,2 178,74 218,74 186,145 268,58 228,58" fill="#FF5500"/>
        
        {/* V */}
        <path d="M 305 20 L 350 108 C 354 116 364 116 368 108 L 413 20" fill="none" stroke="#0A0A0A" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>
        
        {/* A */}
        <path d="M 440 115 L 485 28 C 489 20 499 20 503 28 L 548 115" fill="none" stroke="#0A0A0A" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Subtitle */}
        <g fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="14.5" letterSpacing="3.2">
          <text x="310" y="172" textAnchor="middle">
            <tspan fill="#0A0A0A">MOBILE ACCESSORIES </tspan>
            <tspan fill="#FF5500">AND</tspan>
            <tspan fill="#0A0A0A"> COMPUTER SERVICES</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}
