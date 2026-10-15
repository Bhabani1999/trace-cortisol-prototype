(function () {
  'use strict';
  const model = window.TraceReportModel;
  const $ = id => document.getElementById(id);
  let data = model.calculate({ name: 'Alex', date: '2026-10-13', w: 20, w2: 40, e: 10, eveningHours: 14 });
  let current = 0;
  const screenNames = ['welcome', 'curve', 'rhythm', 'stress', 'characteristics'];
  const svgNS = 'http://www.w3.org/2000/svg';
  function svgNode(tag, attrs, text) {
    const node = document.createElementNS(svgNS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function navigate(index, focus = true) {
    current = Math.max(0, Math.min(index, screenNames.length - 1));
    $('report').dataset.screen = screenNames[current];
    screenNames.forEach((name, i) => { $(name + '-screen').hidden = i !== current; });
    $('back').hidden = current === 0;
    document.querySelectorAll('.progress span').forEach((node, i) => node.classList.toggle('done', i <= current));
    document.querySelector('.progress').setAttribute('aria-label', `Report screen ${current + 1} of ${screenNames.length}`);
    if (current === 1) drawCurve();
    if (focus) {
      const title = $(screenNames[current] + '-screen').querySelector('h1');
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
  function renderData() {
    $('person-name').textContent = data.name;
    for (const kind of ['rhythm', 'stress']) {
      $(kind + '-value').textContent = String(data[kind + 'Display']);
      $(kind + '-remark').textContent = data.remarks[kind];
      $(kind + '-meter').setAttribute('aria-valuenow', String(data[kind + 'Display']));
      $(kind + '-meter').setAttribute('aria-valuetext', `${data[kind + 'Display']} out of 100`);
      drawScoreMeter(kind, data[kind]);
    }
    if (current === 1) drawCurve();
  }
  function drawScoreMeter(kind, value) {
    const fraction = Math.max(0, Math.min(1, value / 100));
    const fill = $(kind + '-meter-fill');
    const tones = kind === 'rhythm'
      ? ['#1f394a', '#2b4d60', '#408497', '#6ab2b7']
      : ['#3a2740', '#502f51', '#9a598e', '#d6799b'];
    const particles = [];
    const cloud = [];
    let seed = 7349;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    // A stable scattered cloud with mixed particle sizes and no visible rows.
    for (let attempt = 0; cloud.length < 440 && attempt < 20000; attempt++) {
      const position = .007 + random() * .986;
      const theta = Math.PI * (1 - position);
      const radius = 128 + (random() - .5) * 27.5;
      const cx = 180 + radius * Math.cos(theta);
      const cy = 180 - radius * Math.sin(theta);
      const size = 1.05 + Math.pow(random(), 1.5) * 1.55;
      if (cloud.some(p => (p.cx - cx) ** 2 + (p.cy - cy) ** 2 < (p.size + size + .45) ** 2)) continue;
      const tone = tones[Math.floor(random() * tones.length)];
      cloud.push({ cx, cy, size });
      if (position > fraction) continue;
      particles.push(`<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${size.toFixed(2)}" fill="${tone}"/>`);
    }
    fill.innerHTML = particles.join('');
    const angle = Math.PI * (1 - fraction);
    const x = 180 + 128 * Math.cos(angle);
    const y = 180 - 128 * Math.sin(angle);
    $(kind + '-meter-marker').setAttribute('transform', `translate(${x} ${y}) rotate(${-angle * 180 / Math.PI})`);
  }
  function drawCurve() {
    const svg = $('curve-chart');
    const width = Math.round(svg.getBoundingClientRect().width);
    if (width < 100) return;
    const height = 300, left = 14, right = width - 14, top = 50, bottom = 226;
    const values = [data.w, data.w2, data.e], times = [0, 2, data.eveningHours];
    // Reuse the existing Evening level design example, not new clinical thresholds.
    const reference = { lower: [16, 30, 5], upper: [35, 65, 7] };
    const referenceStyle = window.TraceReferenceRanges.tokens;
    const ceiling = Math.max(...values, ...reference.upper) * 1.2;
    const x = t => left + (right - left) * t / data.eveningHours;
    const y = value => bottom - (bottom - top) * value / ceiling;
    const path = model.curvePath(values, times, x, y);
    const referenceUpper = model.curvePath(reference.upper, times, x, y);
    const referenceLower = model.curvePath([...reference.lower].reverse(), [...times].reverse().map(t => -t), t => x(-t), y);
    const referenceBand = referenceUpper + ' ' + referenceLower.replace(/^M/, 'L') + ' Z';
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('aria-label', `Cortisol rhythm: waking ${data.w}, waking plus 2 hours ${data.w2}, evening ${data.e}, all in ng per mg creatinine. Evening is ${data.eveningHours} hours after waking.`);
    svg.append(svgNode('title', {}, 'Your cortisol rhythm'), svgNode('desc', {}, 'Three measured values connected by a shape-preserving illustrative curve. The lightly shaded grid band is the existing illustrative reference range: waking 16 to 35, two hours after waking 30 to 65, evening 5 to 7 ng per mg creatinine. Horizontal spacing follows elapsed sample time.'));
    const defs = svgNode('defs');
    const gradient = svgNode('linearGradient', { id: 'curve-gradient', x1: '0%', x2: '100%', y1: '0%', y2: '0%' });
    gradient.append(svgNode('stop', { offset: '0%', 'stop-color': '#eab75b' }), svgNode('stop', { offset: '35%', 'stop-color': '#e29180' }), svgNode('stop', { offset: '65%', 'stop-color': '#bc7eaa' }), svgNode('stop', { offset: '100%', 'stop-color': '#9994c7' }));
    defs.append(gradient);
    const grid = referenceStyle.grid;
    const pattern = svgNode('pattern', { id: 'curve-reference-grid', width: grid.size, height: grid.size, patternUnits: 'userSpaceOnUse', patternTransform: `rotate(${grid.rotation})` });
    pattern.append(svgNode('rect', { width: grid.size, height: grid.size, fill: grid.fill, 'fill-opacity': grid.fill_opacity }), svgNode('path', { d: `M0 0 V${grid.size}`, fill: 'none', stroke: grid.line, 'stroke-opacity': grid.line_opacity, 'stroke-width': grid.line_width }));
    defs.append(pattern);
    const glow = svgNode('filter', { id: 'curve-glow', x: '-35%', y: '-35%', width: '170%', height: '170%' });
    glow.append(svgNode('feGaussianBlur', { stdDeviation: 7 })); defs.append(glow); svg.append(defs);
    const referenceGroup = svgNode('g', { class: 'curve-reference-band', 'aria-hidden': 'true' });
    referenceGroup.append(svgNode('path', { d: referenceBand, fill: 'url(#curve-reference-grid)' }), svgNode('path', { d: referenceBand, fill: 'none', stroke: referenceStyle.colour, 'stroke-opacity': referenceStyle.outline_opacity, 'stroke-width': referenceStyle.outline_width, 'stroke-dasharray': referenceStyle.dot_dash, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    svg.append(referenceGroup);
    const guides = svgNode('g', { class: 'curve-time-guides', fill: 'none', stroke: '#bcb4c3', 'stroke-opacity': .45, 'stroke-width': .8, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', 'aria-hidden': 'true' });
    values.forEach((value, i) => guides.append(svgNode('path', { d: `M${x(times[i])} ${y(value) + 12} V258` })));
    svg.append(guides);
    svg.append(svgNode('path', { d: path, class: 'curve-soft-glow', fill: 'none', stroke: 'url(#curve-gradient)', 'stroke-width': 18, opacity: .13, filter: 'url(#curve-glow)', 'stroke-linecap': 'round' }));
    svg.append(svgNode('path', { d: path, class: 'curve-reading-line', fill: 'none', stroke: 'url(#curve-gradient)', 'stroke-width': 7.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    const numbers = [];
    values.forEach((value, i) => {
      const px = x(times[i]), py = y(value);
      svg.append(svgNode('circle', { cx: px, cy: py, class: 'curve-sample', r: 4.5, fill: '#ffffff', stroke: '#625268', 'stroke-width': 1.4 }));
      const anchor = i === 0 ? 'start' : i === 2 ? 'end' : 'middle';
      const number = svgNode('text', { x: px, y: Math.max(24, py - 18), 'text-anchor': anchor, class: 'reading' }, String(value));
      const phase = svgNode('text', { x: px, y: 278, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'phase time-icon', 'aria-label': ['Waking', 'Two hours after waking', 'Evening'][i] }, ['wb_twilight', 'light_mode', 'bedtime'][i]);
      phase.append(svgNode('title', {}, ['Waking', 'Two hours after waking', 'Evening'][i]));
      svg.append(number, phase); numbers.push(number);
    });
    // Keep all values exact. Offset labels, rather than rounding them or shrinking the font.
    function overlap(a, b) {
      return a.x < b.x + b.width + 8 && b.x < a.x + a.width + 8 && a.y < b.y + b.height + 6 && b.y < a.y + a.height + 6;
    }
    numbers.forEach((node, i) => {
      const box = node.getBBox();
      if (box.x < 2) node.setAttribute('x', String(Number(node.getAttribute('x')) + 2 - box.x));
      if (box.x + box.width > width - 2) node.setAttribute('x', String(Number(node.getAttribute('x')) - (box.x + box.width - width + 2)));
      const py = y(values[i]);
      for (const candidate of [py - 18, py + 30, py - 48, py + 56, py - 74, py + 82]) {
        node.setAttribute('y', String(Math.max(24, Math.min(candidate, height - 60))));
        if (numbers.slice(0, i).every(other => !overlap(node.getBBox(), other.getBBox()))) break;
      }
    });
    // Time icons share their guide's exact x coordinate and a fixed centreline.
    // Unlike word labels, they must not move after font metrics become available.
  }
  $('open-report').addEventListener('click', () => navigate(1));
  $('show-scores').addEventListener('click', () => navigate(2));
  $('show-stress').addEventListener('click', () => navigate(3));
  $('show-characteristics').addEventListener('click', () => navigate(4));
  $('preview-characteristics').addEventListener('click', () => navigate(4));
  $('start-again').addEventListener('click', () => navigate(0));
  $('back').addEventListener('click', () => navigate(current - 1));
  const dialog = $('data-dialog'), form = $('data-form');
  function loadForm() {
    for (const [key, id] of Object.entries({ name: 'input-name', date: 'input-date', w: 'input-w', w2: 'input-w2', e: 'input-e', eveningHours: 'input-hours' })) $(id).value = data[key];
    $('editor-error').hidden = true;
  }
  $('edit-data').addEventListener('click', () => { loadForm(); dialog.showModal(); });
  $('close-dialog').addEventListener('click', () => dialog.close());
  document.querySelectorAll('[data-preset]').forEach(button => button.addEventListener('click', () => {
    const values = model.presets[button.dataset.preset];
    for (const key of ['w', 'w2', 'e']) $('input-' + key).value = values[key];
    $('input-hours').value = 14;
    $('editor-error').hidden = true;
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const input = Object.fromEntries(new FormData(form));
      data = model.calculate(input); renderData(); dialog.close(); navigate(current, false);
    } catch (error) {
      $('editor-error').textContent = error.message; $('editor-error').hidden = false;
    }
  });
  new ResizeObserver(() => { if (current === 1) drawCurve(); }).observe($('report'));
  document.fonts.ready.then(() => { if (current === 1) drawCurve(); });
  renderData(); navigate(0, false);
})();
