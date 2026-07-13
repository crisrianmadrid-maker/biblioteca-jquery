// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

function isAuthenticated() {
    return !!localStorage.getItem('token');
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ============================================
// ACTUALIZAR NAVBAR
// ============================================

function updateNavbar() {
    const isAuth = isAuthenticated();
    const user = getCurrentUser();
    const navMenu = $('#navMenu');
    const userSection = $('#userSection');
    const homeButtons = $('#homeButtons');

    if (isAuth && user) {
        navMenu.html(`
            <li class="nav-item"><a class="nav-link" href="dashboard.html"><i class="bi bi-speedometer2 me-1"></i> Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="autores.html"><i class="bi bi-person me-1"></i> Autores</a></li>
            <li class="nav-item"><a class="nav-link" href="libros.html"><i class="bi bi-book me-1"></i> Libros</a></li>
            <li class="nav-item"><a class="nav-link" href="prestamos.html"><i class="bi bi-arrow-left-right me-1"></i> Préstamos</a></li>
        `);
        userSection.html(`
            <span class="text-white"><i class="bi bi-person-circle me-1"></i> ${user.nombre || 'Usuario'}</span>
            <button class="btn btn-outline-light btn-sm" onclick="logout()"><i class="bi bi-box-arrow-right me-1"></i> Salir</button>
        `);
        if (homeButtons.length) {
            homeButtons.html('<a href="dashboard.html" class="btn btn-primary btn-lg">Ir al Dashboard</a>');
        }
    } else {
        navMenu.html('');
        userSection.html(`
            <a href="login.html" class="btn btn-outline-light btn-sm">Iniciar Sesión</a>
            <a href="register.html" class="btn btn-light btn-sm">Registrarse</a>
        `);
        if (homeButtons.length) {
            homeButtons.html(`
                <a href="login.html" class="btn btn-primary btn-lg me-2">Iniciar Sesión</a>
                <a href="register.html" class="btn btn-outline-primary btn-lg">Registrarse</a>
            `);
        }
    }
}

$(document).ready(function() {
    updateNavbar();
});
