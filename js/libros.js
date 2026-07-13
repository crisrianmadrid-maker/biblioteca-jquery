let editandoId = null;
function showAlert(type, message) {
    const container = $('#alertContainer');
    container.html('<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert"><i class="bi bi-' + (type === 'danger' ? 'exclamation-triangle' : 'check-circle') + '-fill me-2"></i> ' + message + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>');
    setTimeout(() => container.find('.alert').alert('close'), 5000);
}
function resetForm() { $('#libroForm')[0].reset(); $('#editId').val(''); $('#formTitle').text('Nuevo Libro'); $('#btnGuardarLibro').html('<i class="bi bi-save me-2"></i> Guardar'); $('#formContainer').hide(); editandoId = null; }
async function cargarAutoresSelect() {
    try {
        const result = await apiRequest('GET', '/api/autores', null, CONFIG.API_AUTORES_URL);
        const autores = result.data || [];
        const select = $('#id_autor');
        select.html('<option value="">Selecciona un autor</option>');
        autores.forEach(autor => select.append('<option value="' + autor.id_autor + '">' + autor.nombre + '</option>'));
    } catch (error) { console.error('Error cargando autores:', error); }
}
async function cargarLibros(termino = '') {
    try {
        const url = termino.trim() ? '/api/libros/buscar?q=' + encodeURIComponent(termino) : '/api/libros';
        const result = await apiRequest('GET', url, null, CONFIG.API_LIBROS_URL);
        const libros = result.data || [];
        const container = $('#librosList');
        if (libros.length === 0) { container.html('<div class="col-12 text-center py-5"><p class="text-muted">No hay libros registrados</p></div>'); return; }
        let html = '';
        libros.forEach(libro => {
            const color = libro.disponibles === 0 ? 'danger' : libro.disponibles < 3 ? 'warning' : 'success';
            const texto = libro.disponibles === 0 ? 'Sin stock' : libro.disponibles < 3 ? 'Pocas unidades' : 'Disponible';
            html += '<div class="col-md-6 col-lg-4 mb-3"><div class="card shadow-sm h-100"><div class="card-body"><div class="d-flex justify-content-between align-items-start"><h5 class="card-title mb-0 text-truncate" style="max-width:70%">' + libro.titulo + '</h5><span class="badge bg-' + color + '">' + texto + ' (' + libro.disponibles + ')</span></div><div class="mt-2"><p class="card-text mb-1"><i class="bi bi-person me-2"></i><strong>Autor:</strong> ' + (libro.autor || 'Sin autor') + '</p><p class="card-text mb-1"><i class="bi bi-upc-scan me-2"></i><strong>ISBN:</strong> ' + libro.isbn + '</p></div></div><div class="card-footer bg-transparent d-flex gap-2"><button class="btn btn-sm btn-outline-primary btn-editar" data-id="' + libro.id_libro + '" data-titulo="' + libro.titulo + '" data-isbn="' + libro.isbn + '" data-autor="' + libro.id_autor + '" data-disponibles="' + libro.disponibles + '"><i class="bi bi-pencil"></i> Editar</button><button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="' + libro.id_libro + '"><i class="bi bi-trash"></i> Eliminar</button></div></div></div>';
        });
        container.html(html);
    } catch (error) { showAlert('danger', 'Error al cargar libros: ' + error.message); }
}
$(document).ready(function() {
    if (!requireAuth()) return;
    cargarAutoresSelect();
    cargarLibros();
    $('#btnNuevoLibro').on('click', function() { resetForm(); $('#formContainer').show(); $('#titulo').focus(); });
    $('#btnCancelar').on('click', resetForm);
    $('#libroForm').on('submit', async function(e) {
        e.preventDefault();
        const titulo = $('#titulo').val().trim();
        const isbn = $('#isbn').val().trim();
        const id_autor = $('#id_autor').val();
        const disponibles = parseInt($('#disponibles').val()) || 1;
        if (!titulo || !isbn || !id_autor) { showAlert('danger', 'Título, ISBN y autor son requeridos'); return; }
        try {
            const url = editandoId ? '/api/libros/' + editandoId : '/api/libros';
            const method = editandoId ? 'PUT' : 'POST';
            await apiRequest(method, url, { titulo, isbn, id_autor, disponibles }, CONFIG.API_LIBROS_URL);
            showAlert('success', editandoId ? 'Libro actualizado' : 'Libro creado');
            resetForm(); cargarLibros();
        } catch (error) { showAlert('danger', 'Error: ' + error.message); }
    });
    $('#btnBuscar').on('click', function() { cargarLibros($('#searchInput').val()); });
    $('#searchInput').on('keypress', function(e) { if (e.which === 13) $('#btnBuscar').click(); });
    $('#btnLimpiarBusqueda').on('click', function() { $('#searchInput').val(''); cargarLibros(); });
    $('#librosList').on('click', '.btn-editar', function() {
        const data = $(this).data();
        editandoId = data.id;
        $('#editId').val(data.id);
        $('#titulo').val(data.titulo);
        $('#isbn').val(data.isbn);
        $('#id_autor').val(data.autor);
        $('#disponibles').val(data.disponibles);
        $('#formTitle').text('Editar Libro');
        $('#btnGuardarLibro').html('<i class="bi bi-save me-2"></i> Actualizar');
        $('#formContainer').show();
        $('#titulo').focus();
    });
    $('#librosList').on('click', '.btn-eliminar', function() {
        if (!confirm('¿Estás seguro de eliminar este libro?')) return;
        const id = $(this).data('id');
        apiRequest('DELETE', '/api/libros/' + id, null, CONFIG.API_LIBROS_URL).then(() => { showAlert('success', 'Libro eliminado'); cargarLibros(); }).catch(error => showAlert('danger', 'Error: ' + error.message));
    });
});
