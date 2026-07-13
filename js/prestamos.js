async function cargarLibrosDisponibles() {
    try {
        const result = await apiRequest('GET', '/api/libros/disponibles', null, CONFIG.API_LIBROS_URL);
        const libros = result.data || [];
        const select = $('#libroSelect');
        select.html('<option value="">-- Selecciona un libro --</option>');
        libros.forEach(libro => select.append('<option value="' + libro.id_libro + '">' + libro.titulo + ' - ' + libro.autor + ' (Disponibles: ' + libro.disponibles + ')</option>'));
        if (libros.length === 0) select.append('<option value="" disabled>No hay libros disponibles</option>');
    } catch (error) { showPrestamoAlert('danger', 'Error al cargar libros: ' + error.message); }
}
function showPrestamoAlert(type, message) {
    const container = $('#prestamoAlert');
    container.html('<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert"><i class="bi bi-' + (type === 'danger' ? 'exclamation-triangle' : 'check-circle') + '-fill me-2"></i> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
    setTimeout(() => container.find('.alert').alert('close'), 5000);
}
function showAlert(type, message) {
    const container = $('#alertContainer');
    if (container.length) { container.html('<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert"><i class="bi bi-' + (type === 'danger' ? 'exclamation-triangle' : 'check-circle') + '-fill me-2"></i> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>'); setTimeout(() => container.find('.alert').alert('close'), 5000); }
}
async function cargarMisPrestamos() {
    try {
        const result = await apiRequest('GET', '/api/prestamos/mis-prestamos', null, CONFIG.API_PRESTAMOS_URL);
        const prestamos = result.data || [];
        const container = $('#prestamosList');
        $('#totalPrestamos').text('Total: ' + prestamos.length);
        if (prestamos.length === 0) { container.html('<div class="text-center py-5"><p class="text-muted">No tienes préstamos registrados</p></div>'); return; }
        let html = '<div class="table-responsive"><table class="table table-hover shadow-sm"><thead class="table-light"><tr><th>ID</th><th>Libro</th><th>Fecha Préstamo</th><th>Fecha Devolución</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>';
        prestamos.forEach(prestamo => {
            const estadoColor = prestamo.estado === 'prestado' ? 'warning' : 'success';
            const estadoTexto = prestamo.estado === 'prestado' ? 'Prestado' : 'Devuelto';
            html += '<tr><td>#' + prestamo.id_prestamo + '</td><td><strong>' + prestamo.libro_titulo + '</strong><br /><small class="text-muted">' + prestamo.isbn + '</small></td><td>' + new Date(prestamo.fecha_prestamo).toLocaleDateString() + '</td><td>' + new Date(prestamo.fecha_devolucion_esperada).toLocaleDateString() + '</td><td><span class="badge bg-' + estadoColor + '">' + estadoTexto + '</span></td><td>' + (prestamo.estado === 'prestado' ? '<button class="btn btn-sm btn-success btn-devolver" data-id="' + prestamo.id_prestamo + '"><i class="bi bi-arrow-return-left"></i> Devolver</button>' : '<span class="text-muted">-</span>') + '</td></tr>';
        });
        html += '</tbody></table></div>';
        container.html(html);
    } catch (error) { showAlert('danger', 'Error al cargar préstamos: ' + error.message); }
}
$(document).ready(function() {
    if (!requireAuth()) return;
    cargarLibrosDisponibles();
    cargarMisPrestamos();
    $('#prestamoForm').on('submit', async function(e) {
        e.preventDefault();
        const id_libro = $('#libroSelect').val();
        const fecha_devolucion = $('#fechaDevolucion').val();
        if (!id_libro) { showPrestamoAlert('danger', 'Debes seleccionar un libro'); return; }
        const data = { id_libro: parseInt(id_libro) };
        if (fecha_devolucion) data.fecha_devolucion = fecha_devolucion;
        try {
            await apiRequest('POST', '/api/prestamos', data, CONFIG.API_PRESTAMOS_URL);
            showPrestamoAlert('success', 'Préstamo registrado correctamente');
            $('#prestamoForm')[0].reset();
            cargarLibrosDisponibles();
            cargarMisPrestamos();
        } catch (error) { showPrestamoAlert('danger', 'Error: ' + error.message); }
    });
    $('#prestamosList').on('click', '.btn-devolver', function() {
        if (!confirm('¿Confirmas la devolución de este libro?')) return;
        const id = $(this).data('id');
        apiRequest('PUT', '/api/prestamos/' + id + '/devolver', null, CONFIG.API_PRESTAMOS_URL).then(() => { showAlert('success', 'Libro devuelto correctamente'); cargarMisPrestamos(); cargarLibrosDisponibles(); }).catch(error => showAlert('danger', 'Error: ' + error.message));
    });
});
