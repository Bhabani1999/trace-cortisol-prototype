(function (root) {
  'use strict';
  // Design-study scale and reference band. Actual report calibration is deferred.
  const reference = [.17, .24], maximum = 1, track = { x: 30, y: 310, width: 300, height: 12 };
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  function meterGeometry(value) {
    const numeric = Number(value), fraction = Number.isFinite(numeric) ? clamp(numeric / maximum, 0, 1) : 0;
    return {
      fill: track.width * fraction,
      marker: track.x + track.width * fraction,
      referenceX: track.x + track.width * reference[0] / maximum,
      referenceWidth: track.width * (reference[1] - reference[0]) / maximum
    };
  }
  function render(state, value) {
    const id = 'evening-fraction-meter', g = meterGeometry(value);
    const light = clamp(Number(value) / .5, 0, 1);
    const half = 58 + light*61, poolY = 218 + light*18, poolDepth = 14 + light*13;
    const strength = .48 + light*.3, left = 180-half, right = 180+half;
    const beam = `M143 128 L217 128 C${228+light*10} 168 ${right-20} 192 ${right} ${poolY} Q180 ${poolY+poolDepth} ${left} ${poolY} C${left+20} 192 ${132-light*10} 168 143 128Z`;
    const labelX = g.referenceX + g.referenceWidth/2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" style="aspect-ratio:360/360" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">Daylight lingering into evening</title>
      <desc id="${id}-desc">A centred window casts warm daylight onto a faint floor surface. The horizontal meter below fills to the evening fraction of ${value}. Its highlighted comparison band is 0.17 to 0.24 on an illustrative zero-to-one scale. Calibration is pending.</desc>
      <defs>
        <radialGradient id="${id}-air"><stop stop-color="#eee9f1" stop-opacity=".55"/><stop offset="1" stop-color="#eee9f1" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}-frame" x1="132" y1="48" x2="227" y2="132" gradientUnits="userSpaceOnUse"><stop stop-color="#a59bad"/><stop offset=".45" stop-color="#8d8399"/><stop offset="1" stop-color="#6c637b"/></linearGradient>
        <linearGradient id="${id}-glass" x1="144" y1="57" x2="211" y2="128" gradientUnits="userSpaceOnUse"><stop stop-color="#fff8da"/><stop offset=".55" stop-color="#ffeeb5"/><stop offset="1" stop-color="#efd08d"/></linearGradient>
        <linearGradient id="${id}-beam" x1="180" y1="121" x2="180" y2="261" gradientUnits="userSpaceOnUse"><stop stop-color="#ffe9a4" stop-opacity=".65"/><stop offset=".42" stop-color="#f9d68f" stop-opacity=".35"/><stop offset="1" stop-color="#f3ce8f" stop-opacity=".08"/></linearGradient>
        <radialGradient id="${id}-pool"><stop stop-color="#fff3c4" stop-opacity=".9"/><stop offset=".48" stop-color="#f9dea1" stop-opacity=".72"/><stop offset=".73" stop-color="#eab787" stop-opacity=".4"/><stop offset="1" stop-color="#eab787" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}-fill" x1="30" y1="0" x2="330" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#f1ce80"/><stop offset=".48" stop-color="#e5ac82"/><stop offset="1" stop-color="#b38abd"/></linearGradient>
        <filter id="${id}-wide" x="-40%" y="-80%" width="180%" height="260%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="${id}-soft" x="-25%" y="-40%" width="150%" height="180%"><feGaussianBlur stdDeviation="2.5"/></filter>
        <clipPath id="${id}-track"><rect x="30" y="310" width="300" height="12" rx="6"/></clipPath>
      </defs>
      <rect width="360" height="360" fill="#fff"/>
      <ellipse cx="180" cy="157" rx="127" ry="130" fill="url(#${id}-air)"/>
      <ellipse cx="180" cy="246" rx="137" ry="22" fill="#e6e0e9" opacity=".43" filter="url(#${id}-wide)"/>
      <ellipse cx="180" cy="${poolY}" rx="${half+12}" ry="${poolDepth+8}" fill="url(#${id}-pool)" opacity="${strength}" filter="url(#${id}-wide)"/>
      <path d="${beam}" fill="url(#${id}-beam)" opacity="${strength}" filter="url(#${id}-soft)"/>
      <ellipse cx="180" cy="${poolY}" rx="${half}" ry="${poolDepth}" fill="url(#${id}-pool)" opacity="${strength}"/>
      <rect x="130" y="48" width="104" height="99" rx="5" fill="#7b6e86" opacity=".15" filter="url(#${id}-wide)"/>
      <path d="M131 44 H225 L230 49 V139 L225 134 V44Z" fill="#776b82"/>
      <rect x="131" y="44" width="94" height="90" rx="3" fill="url(#${id}-frame)"/>
      <rect x="137" y="50" width="82" height="78" rx="1" fill="#756974"/>
      <rect x="140" y="53" width="76" height="72" fill="url(#${id}-glass)"/>
      <path d="M178 53 V125 M140 89 H216" fill="none" stroke="#a69785" stroke-width="3"/>
      <path d="M132 45 H224 M132 45 V133" fill="none" stroke="#d9cfdf" stroke-width="1" opacity=".7"/>
      <path d="M127 134 H230 L236 140 H132Z" fill="#c1b5c4"/>
      <path d="M132 140 H236 V143 H132Z" fill="#8c7d92"/>
      <g class="fraction-meter" role="meter" aria-label="Evening fraction" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${clamp(Number(value)||0,0,1)}" aria-valuetext="${value}, comparison range 0.17 to 0.24" data-fill-width="${g.fill}">
        <rect x="${g.referenceX}" y="302" width="${g.referenceWidth}" height="28" rx="4" fill="#e1e6d8" opacity=".85"/>
        <rect x="30" y="310" width="300" height="12" rx="6" fill="#f0ebef"/>
        <rect x="${g.referenceX}" y="310" width="${g.referenceWidth}" height="12" fill="#ced7bd"/>
        <g clip-path="url(#${id}-track)"><rect x="30" y="310" width="${g.fill}" height="12" fill="url(#${id}-fill)"/></g>
        <path d="M${g.referenceX} 308 V324 M${g.referenceX+g.referenceWidth} 308 V324" fill="none" stroke="#9ca986" stroke-width=".8" opacity=".8"/>
        <circle cx="${g.marker}" cy="316" r="4" fill="#fffaf1" stroke="#a07b82" stroke-width="1.3"/>
        <path d="M${labelX} 292 V299" fill="none" stroke="#a7af9d" stroke-width=".7"/>
        <text x="${labelX}" y="287" text-anchor="middle" style="font-family:Plex Sans,sans-serif;font-size:9px;fill:#869176">Reference</text>
        <text x="30" y="341" style="font-family:Plex Sans,sans-serif;font-size:9px;fill:#a297a5">0</text>
        <text x="330" y="341" text-anchor="end" style="font-family:Plex Sans,sans-serif;font-size:9px;fill:#a297a5">1.0</text>
      </g>
    </svg>`;
  }
  root.TraceEveningFractionIllustration = render;
  if (typeof module !== 'undefined' && module.exports) module.exports = { render, meterGeometry };
})(typeof globalThis !== 'undefined' ? globalThis : this);
