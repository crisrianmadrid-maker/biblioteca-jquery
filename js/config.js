// ============================================
// CONFIGURACIÓN DE APIS
// ============================================

const CONFIG = {
    API_AUTH_URL: 'http://localhost:3010',
    API_AUTORES_URL: 'http://localhost:3011',
    API_LIBROS_URL: 'http://localhost:3012',
    API_PRESTAMOS_URL: 'http://localhost:3013',
};

// ============================================
// CLIENTE API UNIFICADO
// ============================================

const apiClient = {
    // Método principal para hacer peticiones
    async request(method, url, data = null, baseUrl = CONFIG.API_AUTH_URL) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }

        const options = {
            method: method,
            headers: headers,
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        console.log('📡 API Request:', method, baseUrl + url);

        try {
            const response = await fetch(baseUrl + url, options);
            const result = await response.json();
            
            console.log('📡 Response:', result);
            
            if (result.error) {
                throw new Error(result.mensaje || 'Error en la petición');
            }
            return result;
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    },

    // ============================================
    // AUTH
    // ============================================
    auth: {
        register: (data) => apiClient.request('POST', '/auth/register', data, CONFIG.API_AUTH_URL),
        login: (data) => apiClient.request('POST', '/auth/login', data, CONFIG.API_AUTH_URL),
        perfil: () => apiClient.request('GET', '/auth/perfil', null, CONFIG.API_AUTH_URL),
    },

    // ============================================
    // AUTORES
    // ============================================
    autores: {
        getAll: () => apiClient.request('GET', '/api/autores', null, CONFIG.API_AUTORES_URL),
        getById: (id) => apiClient.request('GET', `/api/autores/${id}`, null, CONFIG.API_AUTORES_URL),
        create: (data) => apiClient.request('POST', '/api/autores', data, CONFIG.API_AUTORES_URL),
        update: (id, data) => apiClient.request('PUT', `/api/autores/${id}`, data, CONFIG.API_AUTORES_URL),
        delete: (id) => apiClient.request('DELETE', `/api/autores/${id}`, null, CONFIG.API_AUTORES_URL),
        search: (termino) => apiClient.request('GET', `/api/autores/buscar?q=${termino}`, null, CONFIG.API_AUTORES_URL),
    },

    // ============================================
    // LIBROS
    // ============================================
    libros: {
        getAll: () => apiClient.request('GET', '/api/libros', null, CONFIG.API_LIBROS_URL),
        getDisponibles: () => apiClient.request('GET', '/api/libros/disponibles', null, CONFIG.API_LIBROS_URL),
        getById: (id) => apiClient.request('GET', `/api/libros/${id}`, null, CONFIG.API_LIBROS_URL),
        create: (data) => apiClient.request('POST', '/api/libros', data, CONFIG.API_LIBROS_URL),
        update: (id, data) => apiClient.request('PUT', `/api/libros/${id}`, data, CONFIG.API_LIBROS_URL),
        delete: (id) => apiClient.request('DELETE', `/api/libros/${id}`, null, CONFIG.API_LIBROS_URL),
        search: (termino) => apiClient.request('GET', `/api/libros/buscar?q=${termino}`, null, CONFIG.API_LIBROS_URL),
    },

    // ============================================
    // PRÉSTAMOS
    // ============================================
    prestamos: {
        getAll: () => apiClient.request('GET', '/api/prestamos', null, CONFIG.API_PRESTAMOS_URL),
        getMisPrestamos: () => apiClient.request('GET', '/api/prestamos/mis-prestamos', null, CONFIG.API_PRESTAMOS_URL),
        getActivos: () => apiClient.request('GET', '/api/prestamos/activos', null, CONFIG.API_PRESTAMOS_URL),
        create: (data) => apiClient.request('POST', '/api/prestamos', data, CONFIG.API_PRESTAMOS_URL),
        devolver: (id) => apiClient.request('PUT', `/api/prestamos/${id}/devolver`, null, CONFIG.API_PRESTAMOS_URL),
    }
};

// ============================================
// FUNCIÓN PARA COMPATIBILIDAD CON VIEJO CÓDIGO
// ============================================
function apiRequest(method, url, data = null, baseUrl = CONFIG.API_AUTH_URL) {
    return apiClient.request(method, url, data, baseUrl);
}

console.log('✅ API Client cargado correctamente');
