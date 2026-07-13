// ============================================
// GESTIÓN DE AUTORES
// ============================================

let editandoId = null;

function showAlert(type, message) {
    const container = $('#alertContainer');
    container.html(`
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="bi bi-${type === 'danger' ? 'exclamation-triangle' : 'check-circle'}-fill me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);
    setTimeout(() => container.find('.alert').alert('close'), 5000);
}

function resetForm() {
    $('#autorForm')[0].reset();
    $('#editId').val('');
    $('#formTitle').text('Nuevo Autor');
    $('#btnGuardarAutor').html('<i class="bi bi-save me-2"></i> Guardar');
    $('#formContainer').hide();
    editandoId = null;
}

async function cargarAutores() {
    try {
        const result = await apiClient.autores.getAll();
        const autores = result.data || [];
        const container = $('#autoresList');
        
        if (autores.length === 0) {
            container.html('<div class="col-12 text-center py-5"><p class="text-muted">No hay autores registrados</p></div>');
            return;
        }

        let html = '';
        autores.forEach(autor => {
            html += `
                <div class="col-md-6 col-lg-4 mb-3">
                    <div class="card shadow-sm h-100">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <h5 class="card-title mb-0">
                                    <i class="bi bi-person-fill me-2 text-primary"></i>
                                    ${autor.nombre}
                                </h5>
                                <span class="badge bg-secondary">ID: ${autor.id_autor}</span>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent d-flex gap-2">
                            <button class="btn btn-sm btn-outline-primary btn-editar" 
                                    data-id="${autor.id_autor}" 
                                    data-nombre="${autor.nombre}">
                                <i class="bi bi-pencil"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger btn-eliminar" 
                                    data-id="${autor.id_autor}">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        container.html(html);
    } catch (error) {
        showAlert('danger', 'Error al cargar autores: ' + error.message);
    }
}

$(document).ready(function() {
    if (!requireAuth()) return;
    cargarAutores();

    $('#btnNuevoAutor').on('click', function() {
        resetForm();
        $('#formContainer').show();
        $('#nombre').focus();
    });

    $('#btnCancelar').on('click', resetForm);

    $('#autorForm').on('submit', async function(e) {
        e.preventDefault();
        const nombre = $('#nombre').val().trim();
        
        if (nombre.length < 3) {
            showAlert('danger', 'El nombre debe tener al menos 3 caracteres');
            return;
        }

        try {
            if (editandoId) {
                await apiClient.autores.update(editandoId, { nombre });
                showAlert('success', 'Autor actualizado correctamente');
            } else {
                await apiClient.autores.create({ nombre });
                showAlert('success', 'Autor creado correctamente');
            }
            resetForm();
            cargarAutores();
        } catch (error) {
            showAlert('danger', 'Error: ' + error.message);
        }
    });

    $('#autoresList').on('click', '.btn-editar', function() {
        const id = $(this).data('id');
        const nombre = $(this).data('nombre');
        
        editandoId = id;
        $('#editId').val(id);
        $('#nombre').val(nombre);
        $('#formTitle').text('Editar Autor');
        $('#btnGuardarAutor').html('<i class="bi bi-save me-2"></i> Actualizar');
        $('#formContainer').show();
        $('#nombre').focus();
    });

    $('#autoresList').on('click', '.btn-eliminar', function() {
        if (!confirm('¿Estás seguro de eliminar este autor?')) return;
        const id = $(this).data('id');
        apiClient.autores.delete(id)
            .then(() => {
                showAlert('success', 'Autor eliminado correctamente');
                cargarAutores();
            })
            .catch(error => showAlert('danger', 'Error: ' + error.message));
    });
});
