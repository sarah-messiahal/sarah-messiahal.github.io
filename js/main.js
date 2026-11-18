(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  const body = document.body;
  const intro = document.getElementById('intro');

  // Split the about paragraph into words for the scroll reveal.
  const para = document.querySelector('.reveal-words');
  if (para) {
    para.innerHTML = para.textContent.trim().split(/\s+/)
      .map(w => `<span class="w">${w}</span>`).join(' ');
  }

  // Videos: load and play only while on screen.
  const vids = document.querySelectorAll('video[data-src]');
  const vio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; }
        const p = v.play(); if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0.15 });
  vids.forEach(v => vio.observe(v));

  const endIntro = () => {
    body.classList.remove('is-loading');
    if (intro) intro.remove();
  };

  if (!hasGsap || reduce) {
    endIntro();
    document.querySelectorAll('.reveal-words .w').forEach(w => (w.style.opacity = 1));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ── Intro: the hand reaches in, grabs HIRE ME, and pulls the page open ──
  const hand = document.getElementById('hand');
  const pill = document.getElementById('hirePill');
  const stage = document.querySelector('.intro__stage');
  let introDone = false;

  const heroIn = () => {
    gsap.from('.hero__name .line > span', { yPercent: 110, duration: 1.1, ease: 'power4.out' });
    gsap.from('.tag, .hero__sub, .hero__actions', { y: 30, opacity: 0, duration: .9, stagger: .1, delay: .2, ease: 'power3.out' });
    gsap.from('.hero__photo img', { y: 80, opacity: 0, duration: 1.2, delay: .1, ease: 'power3.out' });
    gsap.from('.hero__block', { scaleY: 0, transformOrigin: '50% 100%', duration: 1, delay: .25, ease: 'power3.inOut' });
    gsap.from('.badge', { scale: 0, rotate: -40, duration: .9, delay: .7, ease: 'back.out(1.8)' });
    gsap.from('.hero__ghost', { xPercent: -8, opacity: 0, duration: 1.4, ease: 'power3.out' });
    gsap.from('.nav', { y: -30, opacity: 0, duration: .8, delay: .3 });
  };

  const finishIntro = () => {
    if (introDone) return; introDone = true;
    gsap.to(intro, { yPercent: -100, duration: 1, ease: 'power4.inOut', onComplete: endIntro });
    heroIn();
  };

  if (intro && hand && pill && stage) {
    const sw = stage.getBoundingClientRect().width;
    const pr = pill.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const handW = hand.getBoundingClientRect().width;
    // where the fingertips (≈ 88% across the svg) meet the pill's left edge
    const grabX = (pr.left - sr.left) + handW * 0.12 + 18;
    const tl = gsap.timeline({ delay: .35, onComplete: finishIntro });
    tl.from('.intro__big', { yPercent: 100, opacity: 0, duration: .7, ease: 'power3.out' })
      .from('.intro__serif', { y: 30, opacity: 0, duration: .6, ease: 'power3.out' }, '-=.4')
      .from(pill, { scale: .6, opacity: 0, duration: .5, ease: 'back.out(2)' }, '-=.3')
      .to(hand, { x: grabX, duration: .9, ease: 'power3.out' }, '-=.1')
      .to(pill, { scale: .94, duration: .12, yoyo: true, repeat: 1 })
      .to([hand, pill], { x: `-=${sw * 0.9}`, duration: .9, ease: 'power3.in' }, '+=.15');
    intro.addEventListener('click', () => { tl.kill(); finishIntro(); });
    window.addEventListener('keydown', () => { if (!introDone) { tl.kill(); finishIntro(); } }, { once: true });
  } else {
    finishIntro();
  }

  // ── Hero parallax on scroll ──
  gsap.to('.hero__ghost', { xPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__photo img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__block', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // ── About: words light up as you read ──
  gsap.to('.reveal-words .w', {
    opacity: 1, stagger: .05, ease: 'none',
    scrollTrigger: { trigger: '.reveal-words', start: 'top 80%', end: 'bottom 45%', scrub: true }
  });
  gsap.from('.serif-title', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.subject', start: 'top 75%' } });
  gsap.from('.facts div', { y: 30, opacity: 0, stagger: .1, duration: .7, scrollTrigger: { trigger: '.facts', start: 'top 85%' } });

  // ── Stack rows slide in opposite directions ──
  document.querySelectorAll('.stack__row').forEach(row => {
    const dir = Number(row.dataset.dir) || 1;
    gsap.fromTo(row, { xPercent: dir > 0 ? -25 : 0 }, {
      xPercent: dir > 0 ? 0 : -25, ease: 'none',
      scrollTrigger: { trigger: '.stack', start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  gsap.from('.stack__title', { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.stack', start: 'top 80%' } });

  // ── Work: laptops tilt up like a lid opening, text follows ──
  gsap.utils.toArray('.case').forEach(c => {
    const screen = c.querySelector('.laptop__screen');
    if (screen) {
      gsap.fromTo(screen, { rotateX: 28, scale: .92, opacity: .4 }, {
        rotateX: 0, scale: 1, opacity: 1, ease: 'power2.out',
        scrollTrigger: { trigger: c, start: 'top 90%', end: 'top 35%', scrub: true }
      });
    }
    gsap.from(c.querySelectorAll('.case__info > *'), {
      y: 40, opacity: 0, stagger: .08, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: c, start: 'top 70%' }
    });
  });
  gsap.from('.section-head > *, .phones-head > *', { y: 50, opacity: 0, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.section-head', start: 'top 80%' } });
  gsap.from('.phone', { y: 120, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.phones', start: 'top 85%' } });

  // ── Evidence: count up the stats ──
  document.querySelectorAll('[data-count]').forEach(el => {
    const n = { v: 0 }; const to = Number(el.dataset.count);
    gsap.to(n, { v: to, duration: 1.4, ease: 'power2.out', onUpdate: () => (el.textContent = Math.round(n.v) + (el === document.querySelector('[data-count]') ? '+' : '')),
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.from('.evidence__title', { y: 60, opacity: 0, duration: 1, scrollTrigger: { trigger: '.evidence', start: 'top 75%' } });
  gsap.from('.timeline > li', { y: 40, opacity: 0, stagger: .15, duration: .8, scrollTrigger: { trigger: '.timeline', start: 'top 80%' } });

  // ── One last thing ──
  gsap.from('.last__title', { scale: .7, opacity: 0, duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: '.last', start: 'top 70%' } });
  gsap.from('.last__sub, .last .hire-pill--big', { y: 40, opacity: 0, stagger: .15, duration: .8, scrollTrigger: { trigger: '.last', start: 'top 60%' } });

  // ── Contact ──
  gsap.from('.contact__title', { y: 60, opacity: 0, duration: 1, scrollTrigger: { trigger: '.contact', start: 'top 75%' } });
  gsap.from('.contact__name', { rotate: 8, scale: .6, opacity: 0, duration: .9, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.contact__name', start: 'top 90%' } });
  gsap.from('.contact__links a', { y: 30, opacity: 0, stagger: .08, duration: .7, scrollTrigger: { trigger: '.contact__links', start: 'top 90%' } });

  // ── Cursor + magnetic button (mouse only) ──
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cur = document.getElementById('cursor');
    const xTo = gsap.quickTo(cur, 'x', { duration: .25, ease: 'power3' });
    const yTo = gsap.quickTo(cur, 'y', { duration: .25, ease: 'power3' });
    window.addEventListener('mousemove', e => { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll('a, button, video').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('is-big'));
      el.addEventListener('mouseleave', () => cur.classList.remove('is-big'));
    });
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * .3, y: (e.clientY - r.top - r.height / 2) * .4, duration: .4 });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });
  }
})();
