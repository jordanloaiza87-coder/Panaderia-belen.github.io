/*
 * Escena animada del encabezado: el horno de barro se aviva, echa humo
 * y los panes salen saltando a la canasta. Se repite sin parar.
 * Las animaciones están en style.css (sección "ESCENA DEL ENCABEZADO").
 * Uso: <script src="header-escena.js" defer></script>
 */
(function () {
    const header = document.querySelector('header');
    if (!header || header.querySelector('.header-escena')) return;

    const escena = document.createElement('div');
    escena.className = 'header-escena';
    escena.setAttribute('aria-hidden', 'true');

    escena.innerHTML = `
        <div class="horno-grupo">
            <span class="humo h1"></span><span class="humo h2"></span><span class="humo h3"></span>
            <svg class="horno" viewBox="0 0 120 90">
                <defs>
                    <radialGradient id="hornoFuego" cx="0.5" cy="0.85" r="0.75">
                        <stop offset="0" stop-color="#fff3b0"/>
                        <stop offset="0.35" stop-color="#ffb300"/>
                        <stop offset="0.75" stop-color="#e65100"/>
                        <stop offset="1" stop-color="#5d1a00"/>
                    </radialGradient>
                    <linearGradient id="hornoBarro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#c8774a"/>
                        <stop offset="1" stop-color="#8d4a2b"/>
                    </linearGradient>
                </defs>
                <!-- chimenea -->
                <rect x="78" y="4" width="13" height="24" rx="2" fill="#7b3f25" stroke="#3e1f14" stroke-width="2"/>
                <rect x="75" y="2" width="19" height="6" rx="2" fill="#5d2e1b" stroke="#3e1f14" stroke-width="2"/>
                <!-- cúpula de barro -->
                <path d="M 8 86 C 8 30, 112 30, 112 86 Z" fill="url(#hornoBarro)" stroke="#3e1f14" stroke-width="2.5"/>
                <!-- ladrillos -->
                <g stroke="#6d3620" stroke-width="1.5" fill="none" opacity="0.7">
                    <path d="M 20 58 Q 60 44 100 58"/>
                    <path d="M 14 72 Q 60 60 106 72"/>
                    <path d="M 40 47 L 42 55 M 62 44 L 62 52 M 82 47 L 80 55"/>
                    <path d="M 28 62 L 29 70 M 50 58 L 50 66 M 72 58 L 72 66 M 92 62 L 91 70"/>
                </g>
                <!-- boca con fuego -->
                <path class="horno-boca" d="M 38 86 L 38 68 Q 60 50 82 68 L 82 86 Z" fill="url(#hornoFuego)" stroke="#3e1f14" stroke-width="2.5"/>
                <g class="horno-llamas">
                    <path d="M 48 86 Q 46 76 52 70 Q 52 78 56 80 Q 56 72 61 66 Q 62 76 66 78 Q 68 72 72 71 Q 74 80 72 86 Z" fill="#ffd54f" opacity="0.9"/>
                </g>
                <!-- base -->
                <rect x="4" y="84" width="112" height="6" rx="3" fill="#5d2e1b"/>
            </svg>
            <span class="horno-brillo"></span>

            <span class="pan-volador p1"></span>
            <span class="pan-volador p2"></span>
            <span class="pan-volador p3"></span>

            <svg class="canasta" viewBox="0 0 60 34">
                <path d="M 4 10 L 56 10 L 50 32 L 10 32 Z" fill="#c68a4c" stroke="#5d3418" stroke-width="2.2" stroke-linejoin="round"/>
                <g stroke="#8d5a2b" stroke-width="1.6" fill="none">
                    <path d="M 7 17 L 53 17 M 9 24 L 51 24"/>
                    <path d="M 16 10 L 18 32 M 26 10 L 27 32 M 36 10 L 35 32 M 46 10 L 44 32"/>
                </g>
                <rect x="1" y="7" width="58" height="6" rx="3" fill="#a86a35" stroke="#5d3418" stroke-width="2"/>
            </svg>
        </div>
    `;

    header.prepend(escena);
})();
