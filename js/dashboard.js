// ============================================
// DASHBOARD
// ============================================

async function cargarEstadisticas() {
    try {
        // Cargar autores
        const autores = await apiClient.autores.getAll();
        $('#totalAutores').text(autores.data?.length || 0);
        
        // Cargar libros
        const libros = await apiClient.libros.getAll();
        $('#totalLibros').text(libros.data?.length || 0);
        
        // Cargar préstamos activos
        const prestamos = await apiClient.prestamos.getActivos();
        $('#prestamosActivos').text(prestamos.data?.length || 0);
        
        // Usuarios (solo el actual)
        const user = getCurrentUser();
        $('#totalUsuarios').text(user ? '1' : '0');
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        $('#totalAutores').text('Error');
        $('#totalLibros').text('Error');
        $('#prestamosActivos').text('Error');
    }
}

$(document).ready(function() {
    if (!requireAuth()) return;
    cargarEstadisticas();
});
