/*
 * Pantalla de carga animada de Panadería Belén.
 * Arma el logo en SVG pieza por pieza (insignia, arco, texto curvo, trigo, chef, pan y letras)
 * y cada pieza entra con su propia animación (ver la sección "PANTALLA DE CARGA" en style.css).
 * Uso: <script src="splash.js" data-sub="Texto bajo Cargando"></script> justo después de <body>.
 * Expone window.ocultarSplash() y window.mostrarErrorSplash(mensaje).
 */
(function () {
    const script = document.currentScript;
    const subtitulo = (script && script.dataset.sub) || 'Horneando el menú del día';
    const NS = 'http://www.w3.org/2000/svg';
    const CX = 200, CY = 196;

    // La animación completa se ve una vez al día. Las demás veces la pantalla se va
    // apenas el catálogo está listo (los precios guardados en el celular cargan al instante).
    const hoy = new Date().toDateString();
    let yaVistoHoy = false;
    try { yaVistoHoy = localStorage.getItem('splash_belen_dia') === hoy; } catch (e) {}
    try { localStorage.setItem('splash_belen_dia', hoy); } catch (e) {}
    const VELOCIDAD = yaVistoHoy ? 4 : 1;
    const DURACION_MINIMA = yaVistoHoy ? 0 : 3900;
    const DURACION_SALIDA = yaVistoHoy ? 250 : 650;

    function el(tag, attrs, parent) {
        const n = document.createElementNS(NS, tag);
        for (const k in attrs) n.setAttribute(k, attrs[k]);
        if (parent) parent.appendChild(n);
        return n;
    }

    function polar(r, gradosDesdeDerecha) {
        const a = gradosDesdeDerecha * Math.PI / 180;
        return [CX + r * Math.cos(a), CY - r * Math.sin(a)];
    }

    function arco(r, desde, hasta) {
        const [x1, y1] = polar(r, desde);
        const [x2, y2] = polar(r, hasta);
        const grande = Math.abs(desde - hasta) > 180 ? 1 : 0;
        const horario = desde > hasta ? 1 : 0; // ángulo decreciente = sentido horario en pantalla
        return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${grande} ${horario} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    }

    // ---------- Contenedor ----------
    const splash = document.createElement('div');
    splash.id = 'pantalla-carga';
    splash.className = 'splash' + (yaVistoHoy ? ' rapido' : '');
    splash.setAttribute('role', 'status');
    splash.setAttribute('aria-live', 'polite');

    const stage = document.createElement('div');
    stage.className = 'splash-stage';
    stage.setAttribute('aria-hidden', 'true');
    splash.appendChild(stage);

    const svg = el('svg', { viewBox: '-24 -24 448 448', class: 'splash-svg' }, stage);
    const defs = el('defs', {}, svg);

    const gradAnillo = el('linearGradient', { id: 'spGradAnillo', x1: '0', y1: '0', x2: '1', y2: '1' }, defs);
    el('stop', { offset: '0', 'stop-color': '#ffa726' }, gradAnillo);
    el('stop', { offset: '1', 'stop-color': '#d84315' }, gradAnillo);

    const gradDisco = el('radialGradient', { id: 'spGradDisco', cx: '0.5', cy: '0.42', r: '0.6' }, defs);
    el('stop', { offset: '0', 'stop-color': '#f6f7d2' }, gradDisco);
    el('stop', { offset: '1', 'stop-color': '#e4e6a6' }, gradDisco);

    const gradPan = el('linearGradient', { id: 'spGradPan', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0', 'stop-color': '#d9a066' }, gradPan);
    el('stop', { offset: '1', 'stop-color': '#9c6233' }, gradPan);

    const gradBrillo = el('linearGradient', { id: 'spGradBrillo', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
    el('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '0' }, gradBrillo);
    el('stop', { offset: '0.5', 'stop-color': '#fff', 'stop-opacity': '0.75' }, gradBrillo);
    el('stop', { offset: '1', 'stop-color': '#fff', 'stop-opacity': '0' }, gradBrillo);

    // El chef se desvanece abajo para fundirse detrás de las letras
    const gradChef = el('linearGradient', { id: 'spGradChef', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0.8', 'stop-color': '#fff' }, gradChef);
    el('stop', { offset: '1', 'stop-color': '#000' }, gradChef);
    const mascaraChef = el('mask', { id: 'spMascaraChef', maskContentUnits: 'objectBoundingBox' }, defs);
    el('rect', { x: '0', y: '0', width: '1', height: '1', fill: 'url(#spGradChef)' }, mascaraChef);

    const clipInsignia = el('clipPath', { id: 'spClipInsignia' }, defs);
    el('circle', { cx: CX, cy: CY, r: 194 }, clipInsignia);

    el('path', { id: 'spCurvaTexto', d: arco(153, 190, -10) }, defs);

    // ---------- Anillo de carga (afuera) ----------
    el('circle', { class: 'sp-spinner', cx: CX, cy: CY, r: 212 }, svg);

    // ---------- Todo el logo ----------
    const logo = el('g', { class: 'sp-logo' }, svg);

    el('circle', { class: 'sp-insignia', cx: CX, cy: CY, r: 194 }, logo);
    el('circle', { class: 'sp-disco', cx: 199, cy: 174, r: 120, fill: 'url(#spGradDisco)' }, logo);

    // Arco rojo superior
    el('path', { class: 'sp-arco', d: arco(176, 194, -14) }, logo);

    // Texto curvo, letra por letra
    function textoCurvo(texto, inicio, largo, retardo) {
        const t = el('text', { class: 'sp-texto-curvo' }, logo);
        const tp = el('textPath', { href: '#spCurvaTexto', startOffset: inicio, textLength: largo, lengthAdjust: 'spacing' }, t);
        tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#spCurvaTexto');
        [...texto].forEach((ch, i) => {
            const s = el('tspan', { class: 'sp-char' }, tp);
            s.style.animationDelay = (retardo + i * 0.024).toFixed(3) + 's';
            s.textContent = ch;
        });
    }
    textoCurvo('PANADERÍA • PASTELERÍA', 6, 200, 0.6);
    textoCurvo('COMIDA DELIVERY • FRUTERÍA', 318, 212, 0.95);

    // Líneas cafés que abrazan la parte de abajo
    el('path', { class: 'sp-trazo sp-trazo-1', d: arco(170, 196, 282) }, logo);
    el('path', { class: 'sp-trazo sp-trazo-2', d: arco(156, 210, 262) }, logo);

    // Espiga de trigo que crece
    const trigo = el('g', { class: 'sp-trigo' }, logo);
    const tallo = el('path', { class: 'sp-tallo', d: 'M 236 360 Q 318 338 362 252' }, trigo);
    const largoTallo = 190;
    for (let k = 0; k < 7; k++) {
        const u = 0.38 + k * 0.095;
        for (const lado of [-1, 1]) {
            // punto y tangente sobre la curva cuadrática
            const p0 = [236, 360], p1 = [318, 338], p2 = [362, 252];
            const x = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0];
            const y = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1];
            const dx = 2 * (1 - u) * (p1[0] - p0[0]) + 2 * u * (p2[0] - p1[0]);
            const dy = 2 * (1 - u) * (p1[1] - p0[1]) + 2 * u * (p2[1] - p1[1]);
            const ang = Math.atan2(dy, dx) * 180 / Math.PI + lado * 38;
            const off = 9;
            const nx = -dy / Math.hypot(dx, dy), ny = dx / Math.hypot(dx, dy);
            const gx = x + nx * off * lado, gy = y + ny * off * lado;
            const g = el('g', { transform: `translate(${gx.toFixed(1)} ${gy.toFixed(1)}) rotate(${ang.toFixed(1)})` }, trigo);
            const grano = el('ellipse', { class: 'sp-grano', cx: 0, cy: 0, rx: 11, ry: 5.6 }, g);
            grano.style.animationDelay = (1.15 + k * 0.08 + (lado > 0 ? 0.04 : 0)).toFixed(2) + 's';
        }
    }
    const punta = el('g', { transform: 'translate(366 244) rotate(-62)' }, trigo);
    const granoPunta = el('ellipse', { class: 'sp-grano', cx: 0, cy: 0, rx: 12, ry: 6 }, punta);
    granoPunta.style.animationDelay = '1.75s';
    tallo.style.strokeDasharray = largoTallo;
    tallo.style.strokeDashoffset = largoTallo;

    // Chef articulado (recortado del logo original en 4 capas que se mueven por separado)
    const chefG = el('g', { class: 'sp-chef' }, logo);
    const capa = (nombre, parent, extra) => el('image', Object.assign({
        href: `imagen/chef-${nombre}.webp`, x: 104, y: 34, width: 148, height: 170,
        preserveAspectRatio: 'xMidYMid meet'
    }, extra || {}), parent);
    capa('cuerpo', el('g', { class: 'sp-chef-cuerpo' }, chefG), { mask: 'url(#spMascaraChef)' });
    const cabeza = el('g', { class: 'sp-chef-cabeza' }, chefG);
    capa('cabeza', cabeza);
    // parpadeo del ojo abierto
    const parpado = el('g', { class: 'sp-parpadeo' }, cabeza);
    el('ellipse', { cx: 203.8, cy: 87.8, rx: 5.6, ry: 6.6, fill: '#fff' }, parpado);
    el('path', { d: 'M 198.6 88.6 Q 203.8 92.4 209 88.4', fill: 'none', stroke: '#1d1414', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, parpado);
    capa('gorro', el('g', { class: 'sp-chef-gorro' }, cabeza));
    capa('brazo', el('g', { class: 'sp-chef-brazo' }, chefG));

    // Pan (marraqueta/baguette) que entra deslizándose
    const pan = el('g', { class: 'sp-pan' }, logo);
    const panInner = el('g', { transform: 'rotate(-9 210 312)' }, pan);
    el('path', { class: 'sp-pan-cuerpo', d: 'M 140 314 C 150 290, 260 284, 282 304 C 292 314, 270 330, 210 332 C 160 334, 132 328, 140 314 Z' }, panInner);
    [[170, 304], [198, 300], [226, 299], [254, 301]].forEach(([x, y]) => {
        el('path', { class: 'sp-pan-corte', d: `M ${x - 9} ${y + 6} Q ${x} ${y - 4} ${x + 11} ${y + 2}` }, panInner);
    });

    // Letras de "Belén": llegan una por una, se dibuja su contorno y se rellenan
    const palabra = el('g', { class: 'sp-palabra', transform: 'rotate(-8 200 262)' }, logo);
    const LETRAS = [
        { c: 'B', x: 68.0, w: 79.6, r: -40 },
        { c: 'e', x: 147.5, w: 47.6, r: 30 },
        { c: 'l', x: 195.2, w: 33.1, r: -25 },
        { c: 'é', x: 228.2, w: 47.6, r: 35 },
        { c: 'n', x: 275.9, w: 56.3, r: -30 }
    ];
    LETRAS.forEach((L, i) => {
        const g = el('g', { class: 'sp-letra' }, palabra);
        g.style.setProperty('--i', i);
        g.style.setProperty('--r', L.r + 'deg');
        g.style.transformOrigin = `${(L.x + L.w / 2).toFixed(1)}px 292px`;
        const borde = el('text', { class: 'sp-letra-borde', x: L.x, y: 292 }, g);
        borde.textContent = L.c;
        const tinta = el('text', { class: 'sp-letra-tinta', x: L.x, y: 292 }, g);
        tinta.textContent = L.c;
    });

    // Brillo que cruza toda la insignia al final
    const brilloG = el('g', { 'clip-path': 'url(#spClipInsignia)' }, logo);
    el('rect', { class: 'sp-brillo', x: -60, y: -20, width: 70, height: 440, fill: 'url(#spGradBrillo)', transform: 'rotate(18 200 200)' }, brilloG);

    // Destellos alrededor al terminar
    const destellos = el('g', { class: 'sp-destellos' }, svg);
    [[30, 70], [372, 92], [16, 300], [388, 318], [200, -8], [96, 392]].forEach(([x, y], i) => {
        const d = el('path', {
            class: 'sp-destello',
            d: `M ${x} ${y - 11} Q ${x} ${y} ${x + 11} ${y} Q ${x} ${y} ${x} ${y + 11} Q ${x} ${y} ${x - 11} ${y} Q ${x} ${y} ${x} ${y - 11} Z`
        }, destellos);
        d.style.animationDelay = (2.95 + i * 0.07).toFixed(2) + 's';
    });

    // ---------- Textos ----------
    const texto = document.createElement('p');
    texto.className = 'splash-text';
    texto.innerHTML = 'Cargando<span class="splash-dots"><i>.</i><i>.</i><i>.</i></span>';
    splash.appendChild(texto);
    const sub = document.createElement('p');
    sub.className = 'splash-sub';
    sub.textContent = subtitulo;
    splash.appendChild(sub);

    if (script && script.parentNode) {
        script.parentNode.insertBefore(splash, script.nextSibling);
    } else {
        document.body.prepend(splash);
    }

    if (VELOCIDAD !== 1 && splash.getAnimations) {
        requestAnimationFrame(() => {
            splash.getAnimations({ subtree: true }).forEach(a => { a.playbackRate = VELOCIDAD; });
        });
    }

    // ---------- Control ----------
    const inicio = performance.now();
    window.ocultarSplash = function () {
        if (splash.classList.contains('hide')) return;
        const espera = Math.max(0, DURACION_MINIMA - (performance.now() - inicio));
        setTimeout(() => {
            splash.classList.add('hide');
            setTimeout(() => { splash.style.display = 'none'; }, DURACION_SALIDA);
        }, espera);
    };
    window.mostrarErrorSplash = function (mensaje) {
        if (splash.classList.contains('hide')) return;
        splash.classList.add('error');
        texto.textContent = 'Ups...';
        sub.textContent = mensaje;
    };
})();
