(function (root) {
  'use strict';
  const settings = {
    below: { reach: .27, strength: .68 },
    close: { reach: .65, strength: .82 },
    above: { reach: 1, strength: .9 }
  };
  const floor = (u, v) => [180 - 135*u + 135*v, 176 + 55*u + 55*v];
  const leftWall = (u, height) => [180 - 135*u, 176 + 55*u - height];
  const point = p => p.map(n => n.toFixed(2)).join(' ');
  const polygon = points => `M ${points.map(point).join(' L ')} Z`;
  function footprint(reach) {
    return [floor(.84,.05), floor(.43,.05),
      floor(.43-.55*reach,.05+.88*reach),
      floor(.84-.55*reach,.05+.88*reach)];
  }
  function render(state, value) {
    const selected = Object.hasOwn(settings, state) ? state : 'close';
    const {reach, strength} = settings[selected], id = 'evening-fraction-daylight';
    const poolPoints = footprint(reach), pool = polygon(poolPoints);
    const reference = polygon(footprint(settings.close.reach));
    const left = polygon([[45,89],[180,34],[180,176],[45,231]]);
    const right = polygon([[180,34],[315,89],[315,231],[180,176]]);
    const ground = polygon([floor(0,0),floor(1,0),floor(1,1),floor(0,1)]);
    const panePoints = [leftWall(.78,110),leftWall(.35,110),leftWall(.35,60),leftWall(.78,60)];
    const pane = polygon(panePoints);
    const shaft = polygon([panePoints[3],panePoints[2],poolPoints[2],poolPoints[3]]);
    const wallBaseA = floor(0,.62), wallBaseB = floor(0,.97);
    const spill = polygon([wallBaseA,[wallBaseA[0],wallBaseA[1]-13],
      [wallBaseB[0],wallBaseB[1]-37],wallBaseB]);
    const description = selected === 'below'
      ? 'The small golden pool stays near the window, inside the faint reference footprint.'
      : selected === 'above'
        ? 'The golden pool extends beyond the reference footprint across the floor, with a gentle warm spill onto the far wall.'
        : 'The golden pool reaches the faint reference footprint on the floor.';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 340" style="aspect-ratio:360/340" role="img" aria-labelledby="${id}-title ${id}-desc">
      <title id="${id}-title">The day lingering into evening</title>
      <desc id="${id}-desc">Evening fraction example: ${value}. A fixed, quiet three-dimensional room has one window. ${description} These are illustrative visual states.</desc>
      <defs>
        <linearGradient id="${id}-left" x1="45" y1="90" x2="190" y2="225" gradientUnits="userSpaceOnUse"><stop stop-color="#766f7f"/><stop offset=".48" stop-color="#5d5668"/><stop offset="1" stop-color="#454050"/></linearGradient>
        <linearGradient id="${id}-right" x1="181" y1="62" x2="315" y2="232" gradientUnits="userSpaceOnUse"><stop stop-color="#595260"/><stop offset=".65" stop-color="#403b4c"/><stop offset="1" stop-color="#322e3d"/></linearGradient>
        <linearGradient id="${id}-floor" x1="180" y1="168" x2="180" y2="286" gradientUnits="userSpaceOnUse"><stop stop-color="#595061"/><stop offset=".55" stop-color="#494151"/><stop offset="1" stop-color="#393341"/></linearGradient>
        <linearGradient id="${id}-cut-edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#7d7387"/><stop offset="1" stop-color="#514958"/></linearGradient>
        <linearGradient id="${id}-pane" x1="80" y1="100" x2="140" y2="147" gradientUnits="userSpaceOnUse"><stop stop-color="#fff6ce"/><stop offset=".5" stop-color="#f7e4a2"/><stop offset="1" stop-color="#e8c97e"/></linearGradient>
        <linearGradient id="${id}-beam" x1="112" y1="134" x2="270" y2="228" gradientUnits="userSpaceOnUse"><stop stop-color="#f8e8ad" stop-opacity=".22"/><stop offset=".7" stop-color="#f5dfa2" stop-opacity=".11"/><stop offset="1" stop-color="#f6dfa0" stop-opacity=".03"/></linearGradient>
        <linearGradient id="${id}-pool" x1="105" y1="213" x2="290" y2="245" gradientUnits="userSpaceOnUse"><stop stop-color="#f8e7ac"/><stop offset=".42" stop-color="#ffefb9"/><stop offset=".78" stop-color="#f5d18a"/><stop offset="1" stop-color="#dfa26c"/></linearGradient>
        <linearGradient id="${id}-spill" x1="280" y1="176" x2="280" y2="233" gradientUnits="userSpaceOnUse"><stop stop-color="#f9dea4" stop-opacity="0"/><stop offset=".6" stop-color="#f3d69b" stop-opacity=".2"/><stop offset="1" stop-color="#ffe7ae" stop-opacity=".35"/></linearGradient>
        <filter id="${id}-wide-blur" filterUnits="userSpaceOnUse" x="10" y="20" width="340" height="290"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="${id}-burn-blur" filterUnits="userSpaceOnUse" x="10" y="20" width="340" height="290"><feGaussianBlur stdDeviation="3.8"/></filter>
        <filter id="${id}-soft-edge" filterUnits="userSpaceOnUse" x="10" y="20" width="340" height="290"><feGaussianBlur stdDeviation="1.25"/></filter>
        <filter id="${id}-shadow" x="-40%" y="-100%" width="180%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
        <clipPath id="${id}-floor-clip"><path d="${ground}"/></clipPath>
        <clipPath id="${id}-right-clip"><path d="${right}"/></clipPath>
        <clipPath id="${id}-left-clip"><path d="${left}"/></clipPath>
      </defs>
      <rect width="360" height="340" fill="#fff"/>
      <ellipse cx="183" cy="294" rx="129" ry="13" fill="#3b3049" opacity=".12" filter="url(#${id}-shadow)"/>
      <path d="M40 86 L180 29 L320 86 L315 89 L180 34 L45 89Z" fill="#918798"/>
      <path d="M40 86 L45 89 L45 231 L40 235Z" fill="url(#${id}-cut-edge)"/>
      <path d="M315 89 L320 86 L320 235 L315 231Z" fill="#57505f"/>
      <path d="${left}" fill="url(#${id}-left)"/>
      <path d="${right}" fill="url(#${id}-right)"/>
      <path d="${ground}" fill="url(#${id}-floor)"/>
      <path d="M45 231 L180 286 L315 231 L315 238 L180 293 L45 238Z" fill="#4a4052"/>
      <path d="M45 231 L180 286 L315 231" fill="none" stroke="#9b8ca2" stroke-width="1" opacity=".42"/>
      <path d="M180 34 V176 M45 231 L180 176 L315 231" fill="none" stroke="#242130" stroke-width="1.6" opacity=".58"/>
      <path d="M181 36 V174" fill="none" stroke="#b1a5b5" stroke-width=".5" opacity=".18"/>
      <g clip-path="url(#${id}-left-clip)">
        <path d="${pane}" fill="#ead29d" opacity=".28" filter="url(#${id}-wide-blur)"/>
        <path d="${pane}" fill="#e6c57d" stroke="#d7ba84" stroke-width="7" opacity=".18" filter="url(#${id}-burn-blur)"/>
      </g>
      <g clip-path="url(#${id}-floor-clip)">
        <path d="M51 227 L185 172" fill="none" stroke="#1e1a27" stroke-width="5" opacity=".16" filter="url(#${id}-burn-blur)"/>
        <path d="${reference}" fill="#f6e6b1" opacity=".1" filter="url(#${id}-soft-edge)"/>
        <path d="${pool}" fill="#e4a974" opacity="${strength*.48}" filter="url(#${id}-wide-blur)"/>
        <path d="${pool}" fill="#f0c47d" opacity="${strength*.65}" filter="url(#${id}-burn-blur)"/>
        <path d="${pool}" fill="url(#${id}-pool)" opacity="${strength*.65}" filter="url(#${id}-soft-edge)"/>
      </g>
      <path d="${shaft}" fill="url(#${id}-beam)" opacity="${strength}"/>
      ${selected === 'above' ? `<g clip-path="url(#${id}-right-clip)"><path d="${spill}" fill="url(#${id}-spill)" filter="url(#${id}-burn-blur)"/></g>` : ''}
      <g clip-path="url(#${id}-floor-clip)">
        <path d="${reference}" fill="none" stroke="#f0e3c4" stroke-width=".85" opacity=".28"/>
      </g>
      <path d="${pane}" fill="#2f2b37" stroke="#39323f" stroke-width="7" stroke-linejoin="round"/>
      <path d="${pane}" fill="url(#${id}-pane)" stroke="#c8b48e" stroke-width="1.4"/>
      <path d="${polygon([panePoints[3],panePoints[2],[panePoints[2][0]+5,panePoints[2][1]+4],[panePoints[3][0]+5,panePoints[3][1]+4]])}" fill="#a8977e"/>
      <path d="${polygon([[panePoints[3][0]+5,panePoints[3][1]+4],[panePoints[2][0]+5,panePoints[2][1]+4],[panePoints[2][0]+5,panePoints[2][1]+6],[panePoints[3][0]+5,panePoints[3][1]+6]])}" fill="#766a64"/>
      <path d="M${point(leftWall(.565,110))} L${point(leftWall(.565,60))} M${point(leftWall(.78,85))} L${point(leftWall(.35,85))}" fill="none" stroke="#776c60" stroke-width="2.4"/>
      <path d="M${point(panePoints[0])} L${point(panePoints[1])}" fill="none" stroke="#fff5cf" stroke-width="1.3" opacity=".8"/>
      <path d="M45 89 L180 34 L315 89" fill="none" stroke="#d3c6d6" stroke-width=".7" opacity=".36"/>
    </svg>`;
  }
  root.TraceEveningFractionIllustration = render;
  if (typeof module !== 'undefined' && module.exports) module.exports = { render, footprint };
})(typeof globalThis !== 'undefined' ? globalThis : this);
