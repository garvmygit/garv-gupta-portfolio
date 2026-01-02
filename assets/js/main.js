// Main JS for portfolio — modular, vanilla ES6
(() => {
  // Utility
  const q = (s, el = document) => el.querySelector(s);
  const qa = (s, el = document) => Array.from((el||document).querySelectorAll(s));

  // Title Rotator
  const titles = [
    'Frontend Developer',
    'Web Developer',
    'Java Programmer',
    'Blockchain & IoT Enthusiast'
  ];
  function startTitleRotator() {
    const el = q('#title-rotator');
    let i = 0;
    function show() {
      el.textContent = '';
      const span = document.createElement('span');
      span.textContent = titles[i];
      span.className = 'title-reveal';
      el.appendChild(span);
      requestAnimationFrame(() => setTimeout(() => span.classList.add('show'), 30));
      i = (i + 1) % titles.length;
      setTimeout(() => {
        span.classList.remove('show');
        setTimeout(show, 220);
      }, 2400);
    }
    show();
  }

  // Cursor follower
  function initCursorFollower() {
    const dot = q('#cursor-follower');
    if (!dot) return;
    let mouseX = 0, mouseY = 0; let x = 0, y = 0;
    const lerp = (a,b,t) => a + (b-a)*t;
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    function frame(){ x = lerp(x, mouseX, 0.18); y = lerp(y, mouseY, 0.18); dot.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`; requestAnimationFrame(frame);} frame();
    // subtle size on mousedown
    window.addEventListener('mousedown', () => { dot.style.transform += ' scale(1.35)'; });
    window.addEventListener('mouseup', () => { /* revert next frame */ setTimeout(()=>{},120); });
  }

  // Scroll-triggered reveals
  function initScrollReveal() {
    const opts = {threshold: 0.08};
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting) e.target.classList.add('show');
      });
    }, opts);
    qa('section').forEach(s => {
      // Add a JS-only hidden state so sections remain visible when JS is disabled
      s.classList.add('title-reveal','js-hidden');
      obs.observe(s);
    });

    // Ensure hero shows quickly (selector targets the section itself)
    setTimeout(()=>{ const hero = q('#hero'); if(hero) hero.classList.add('show'); }, 120);

    // Fallback: if any section remains hidden after 1.2s (observer didn't fire), remove the js-hidden class
    setTimeout(()=>{ qa('section.js-hidden').forEach(s=> s.classList.remove('js-hidden')); }, 1200);
  }

  // Mindmap implementation
  const mindNodes = [
    {id:'frontend', label:'Frontend', subs:['HTML5','CSS3','JavaScript (ES6+)','React (Basics)','Tailwind CSS','UI/UX']},
    {id:'backend', label:'Backend Basics', subs:['Node.js','Express.js','REST APIs','File Handling']},
    {id:'java', label:'Java & DSA', subs:['Java','OOP','Data Structures','Algorithms']},
    {id:'tools', label:'Tools', subs:['Git & GitHub','VS Code','npm','Linux']},
    {id:'projects', label:'Projects', subs:['TokenizeHub','ScreenX','React Clock','Smart Library']},
    {id:'learning', label:'Learning Path', subs:['Blockchain','Web3','IoT (ESP8266)','Cloud Fundamentals']}
  ];

  function initMindmap(){
    const container = q('#mindmap .relative') || q('#mindmap');
    const wrapper = q('#mindmap');
    const area = wrapper.querySelector('.relative');
    const root = q('#mindmap-root');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','absolute inset-0 w-full h-full pointer-events-none');
    svg.setAttribute('aria-hidden','true');
    area.appendChild(svg);

    function clear() { qa('.mindmap-node', area).forEach(n=>n.remove()); while(svg.firstChild) svg.removeChild(svg.firstChild); }

    function render(){
      clear();
      const rect = area.getBoundingClientRect();
      const cx = rect.width/2; const cy = rect.height/2;
      const radius = Math.min(rect.width, rect.height) * 0.34;
      mindNodes.forEach((node, idx) => {
        const angle = (idx / mindNodes.length) * Math.PI*2 - Math.PI/2;
        const nx = cx + Math.cos(angle) * radius;
        const ny = cy + Math.sin(angle) * radius;
        const el = document.createElement('div');
        el.className = 'mindmap-node';
        el.style.left = `${nx - 55}px`;
        el.style.top = `${ny - 55}px`;
        el.setAttribute('data-id', node.id);
        el.innerHTML = `<div class="label">${node.label}</div>`;
        area.appendChild(el);

        // line
        const line = document.createElementNS('http://www.w3.org/2000/svg','line');
        const rootRect = root.getBoundingClientRect();
        const rootCx = rootRect.left - rect.left + rootRect.width/2;
        const rootCy = rootRect.top - rect.top + rootRect.height/2;
        line.setAttribute('x1', rootCx);
        line.setAttribute('y1', rootCy);
        line.setAttribute('x2', nx);
        line.setAttribute('y2', ny);
        line.setAttribute('stroke', 'rgba(124,246,255,0.06)');
        line.setAttribute('stroke-width','1.8');
        svg.appendChild(line);

        // hover glow
        el.addEventListener('mouseenter', ()=> el.classList.add('glow'));
        el.addEventListener('mouseleave', ()=> el.classList.remove('glow'));

        // click expand
        el.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          // remove existing panels
          qa('.subpanel', area).forEach(p=>p.remove());
          const panel = document.createElement('div');
          panel.className = 'subpanel';
          panel.style.left = `${nx + 60}px`;
          panel.style.top = `${ny - 20}px`;
          panel.innerHTML = `<strong>${node.label}</strong><ul style="margin-top:6px">${node.subs.map(s=>`<li style="margin:6px 0;color:#dffafd">${s}</li>`).join('')}</ul>`;
          area.appendChild(panel);
          // close on outside click
          setTimeout(()=>{
            const rm = (e)=>{ if(!panel.contains(e.target)) { panel.remove(); window.removeEventListener('click', rm); } };
            window.addEventListener('click', rm);
          }, 50);
        });
      });
    }

    // render on load and resize
    render();
    let t;
    window.addEventListener('resize', ()=>{ clearTimeout(t); t=setTimeout(render,120); });
  }

  // Contact form (front-end only)
  function initContact(){
    const form = q('#contact-form');
    const notice = q('#contact-notice');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = new FormData(form);
      // Basic validation already by HTML
      notice.textContent = 'Thanks! This contact form is front-end only. Email: garvgupta307@gmail.com';
      form.reset();
    });
  }

  // Init all
  document.addEventListener('DOMContentLoaded', ()=>{
    startTitleRotator();
    initCursorFollower();
    initScrollReveal();
    initMindmap();
    initContact();
    q('#year').textContent = new Date().getFullYear();

    // gentle reveal for hero
    setTimeout(()=>{ qa('#hero .title-reveal, #hero .title-reveal.show').forEach(e=>e.classList.add('show')); }, 120);
  });
})();
