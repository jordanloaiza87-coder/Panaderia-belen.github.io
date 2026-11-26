/*
 * Utilidades compartidas del catálogo (index.html y tortas.html):
 * precios, búsqueda tolerante a errores, fechas y el aviso de "precios al día".
 * Expone window.Belen.
 */
(function () {
    // ---------- Precios ----------
    function parsePrecio(precio) {
        const digitos = String(precio == null ? '' : precio).replace(/[^0-9]/g, '');
        return digitos ? Number(digitos) : null;
    }

    function formatoPesos(numero) {
        return '$' + Number(numero).toLocaleString('es-CL');
    }

    // Muestra todos los precios igual: $1.300, $650, etc.
    function formatearPrecio(precio) {
        if (!precio) return '';
        const str = String(precio).trim();
        const sinSigno = str.replace(/^\$\s*/, '');
        if (/^[\d.\s]+$/.test(sinSigno)) {
            const n = parsePrecio(sinSigno);
            if (n !== null) return formatoPesos(n);
        }
        return str.startsWith('$') ? str : '$' + str;
    }

    // ---------- Fechas ----------
    const DIA = 24 * 60 * 60 * 1000;

    function esPrecioNuevo(ts, dias) {
        const t = Number(ts);
        return !!t && Date.now() - t < (dias || 7) * DIA;
    }

    function fechaCorta(ts) {
        const d = new Date(Number(ts));
        return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
    }

    function tiempoRelativo(ts) {
        const seg = Math.max(0, Math.round((Date.now() - Number(ts)) / 1000));
        if (seg < 60) return 'hace un momento';
        const min = Math.round(seg / 60);
        if (min < 60) return `hace ${min} min`;
        const h = Math.round(min / 60);
        if (h < 24) return `hace ${h} h`;
        const d = Math.round(h / 24);
        return d === 1 ? 'hace 1 día' : `hace ${d} días`;
    }

    // ---------- Búsqueda tolerante ----------
    function normalizar(texto) {
        return (texto || '')
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9ñ]+/g, ' ')
            .replace(/([a-zñ])\1+/g, '$1') // "nuggets" y "nugets" quedan iguales
            .trim();
    }

    function distancia(a, b) {
        if (a === b) return 0;
        const m = a.length, n = b.length;
        if (!m) return n;
        if (!n) return m;
        let prev = Array.from({ length: n + 1 }, (_, j) => j);
        for (let i = 1; i <= m; i++) {
            const cur = [i];
            for (let j = 1; j <= n; j++) {
                const costo = a[i - 1] === b[j - 1] ? 0 : 1;
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + costo);
            }
            prev = cur;
        }
        return prev[n];
    }

    function palabraParecida(palabra, token) {
        if (palabra.startsWith(token)) return true;
        const permitidos = token.length >= 7 ? 2 : token.length >= 4 ? 1 : 0;
        if (!permitidos) return false;
        return distancia(token, palabra) <= permitidos ||
            distancia(token, palabra.slice(0, token.length)) <= permitidos;
    }

    /**
     * ¿El texto del producto coincide con lo que escribió el empleado?
     * Acepta errores de tipeo ("nugets", "chuelta"), palabras en cualquier orden
     * ("king pollo") y partes de códigos de barra.
     */
    function coincide(texto, consulta) {
        const q = normalizar(consulta);
        if (!q) return true;
        const t = normalizar(texto);
        if (t.includes(q)) return true;
        const palabras = t.split(' ');
        return q.split(' ').every(tok => t.includes(tok) || palabras.some(p => palabraParecida(p, tok)));
    }

    // ---------- Aviso "precios al día" ----------
    const CLAVE_SYNC = 'belen_precios_sincronizados';

    function leerSync() {
        try { return Number(localStorage.getItem(CLAVE_SYNC)) || 0; } catch (e) { return 0; }
    }

    function crearEstadoPrecios(elemento) {
        let estado = 'cargando';
        function pintar() {
            if (!elemento) return;
            const ultimo = leerSync();
            const sinRed = estado === 'sin-conexion' || !navigator.onLine;
            elemento.classList.toggle('ok', !sinRed && estado === 'ok');
            elemento.classList.toggle('offline', sinRed);
            if (sinRed) {
                elemento.textContent = ultimo
                    ? `Sin conexión · usando precios guardados ${tiempoRelativo(ultimo)}`
                    : 'Sin conexión · usando precios guardados';
            } else if (estado === 'ok') {
                elemento.textContent = `Precios al día · actualizado ${tiempoRelativo(ultimo)}`;
            } else {
                elemento.textContent = 'Revisando precios...';
            }
        }
        window.addEventListener('online', pintar);
        window.addEventListener('offline', pintar);
        setInterval(pintar, 30000);
        pintar();
        return {
            actualizado() {
                try { localStorage.setItem(CLAVE_SYNC, String(Date.now())); } catch (e) {}
                estado = 'ok'; pintar();
            },
            sinConexion() { estado = 'sin-conexion'; pintar(); }
        };
    }

    // ---------- Vista tarjetas / lista ----------
    function iniciarSelectorVista(boton, contenedor) {
        if (!boton || !contenedor) return;
        let vista = 'tarjetas';
        try { vista = localStorage.getItem('belen_vista') || 'tarjetas'; } catch (e) {}
        function aplicar() {
            const lista = vista === 'lista';
            contenedor.classList.toggle('vista-lista', lista);
            boton.classList.toggle('activo', lista);
            boton.setAttribute('aria-pressed', lista ? 'true' : 'false');
            boton.title = lista ? 'Ver con fotos' : 'Ver como lista';
            boton.querySelector('.vista-label').textContent = lista ? 'Fotos' : 'Lista';
        }
        boton.addEventListener('click', () => {
            vista = vista === 'lista' ? 'tarjetas' : 'lista';
            try { localStorage.setItem('belen_vista', vista); } catch (e) {}
            aplicar();
        });
        aplicar();
    }

    // Ordena alfabéticamente las tarjetas de cada carrusel
    function ordenarTarjetas(grilla) {
        const tarjetas = [...grilla.querySelectorAll('.product-card')];
        tarjetas.sort((a, b) => (a.dataset.nombre || '').localeCompare(b.dataset.nombre || '', 'es', { sensitivity: 'base' }));
        tarjetas.forEach(t => grilla.appendChild(t));
    }

    window.Belen = {
        parsePrecio, formatoPesos, formatearPrecio,
        esPrecioNuevo, fechaCorta, tiempoRelativo,
        normalizar, coincide,
        crearEstadoPrecios, iniciarSelectorVista, ordenarTarjetas
    };
})();
