// ─── Galería de fotos ─────────────────────────────────────────────────────────

async function cargarFotos() {
    try {
        const res = await fetch('/api/fotos');
        const fotos = await res.json();
        const grid = document.getElementById('galeria-dinamica');
        grid.innerHTML = '';

        if (!fotos.length) {
            grid.innerHTML = '<p class="sin-fotos">Aún no hay fotos. ¡Sube la primera! 🐕</p>';
            return;
        }

        fotos.forEach(foto => {
            const fecha = new Date(foto.fecha_subida).toLocaleDateString('es-ES');
            const div = document.createElement('div');
            div.className = 'item-galeria';
            div.innerHTML = `
                <img src="/img/${foto.archivo}" alt="${foto.titulo}">
                <div class="overlay">
                    <div class="overlay-titulo">${foto.titulo}</div>
                    <div class="overlay-desc">${foto.descripcion || ''}</div>
                    <div class="overlay-fecha">📅 ${fecha}</div>
                </div>
                <button class="btn-eliminar" onclick="eliminarFoto(${foto.id})" title="Eliminar foto">✕</button>
            `;
            grid.appendChild(div);
        });
    } catch (err) {
        console.error('Error cargando fotos:', err);
    }
}

async function eliminarFoto(id) {
    if (!confirm('¿Seguro que quieres eliminar esta foto?')) return;
    try {
        const res = await fetch(`/api/fotos/${id}`, { method: 'DELETE' });
        if (res.ok) {
            cargarFotos();
        } else {
            const data = await res.json();
            alert('Error al eliminar: ' + (data.error || 'desconocido'));
        }
    } catch (err) {
        console.error('Error eliminando foto:', err);
        alert('Error de conexión');
    }
}

async function subirFoto(e) {
    e.preventDefault();
    const form = document.getElementById('form-subir-foto');
    const formData = new FormData(form);

    const btnSubmit = form.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.textContent = 'Subiendo…';

    try {
        const res = await fetch('/api/fotos', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
            form.reset();
            cargarFotos();
        } else {
            alert('Error: ' + (data.error || 'No se pudo subir la foto'));
        }
    } catch (err) {
        console.error('Error subiendo foto:', err);
        alert('Error de conexión');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = 'Subir foto';
    }
}

// ─── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    cargarFotos();

    document.getElementById('form-subir-foto')
        .addEventListener('submit', subirFoto);
});
