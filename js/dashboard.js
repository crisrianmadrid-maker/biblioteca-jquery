// ============================================
// DASHBOARD - Panel de Control
// ============================================

$(document).ready(function() {
    // Verificar autenticación
    if (!requireAuth()) return;
    
    // Mostrar mensaje de bienvenida con el nombre del usuario
    const user = getCurrentUser();
    if (user && user.nombre) {
        $('#welcomeMessage').html(`
            <i class="bi bi-person-circle me-1"></i>
            Bienvenido <strong>${user.nombre}</strong> a tu panel de control
        `);
    }
    
    console.log('📊 Dashboard cargado correctamente');
});
