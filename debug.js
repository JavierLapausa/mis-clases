// Debug script para verificar el estado de la aplicación
// Ejecutar en la consola del navegador para diagnosticar problemas

function verificarEstadoApp() {
    console.log('=== VERIFICACIÓN DE ESTADO ===');
    
    // 1. Verificar elementos del DOM
    const elementosRequeridos = [
        'lista-clases', 'calendario', 'lista-pagos', 
        'total-mes', 'clases-hoy', 'pagos-pendientes',
        'titulo-calendario'
    ];
    
    console.log('1. Verificando elementos del DOM:');
    elementosRequeridos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`  ${id}: ${elemento ? '✓ OK' : '✗ FALTANTE'}`);
    });
    
    // 2. Verificar localStorage
    console.log('2. Verificando localStorage:');
    console.log(`  Disponible: ${typeof(Storage) !== "undefined" ? '✓ SÍ' : '✗ NO'}`);
    
    try {
        const datos = localStorage.getItem('misClases');
        console.log(`  Datos guardados: ${datos ? `✓ SÍ (${JSON.parse(datos).length} clases)` : '- No hay datos'}`);
    } catch (e) {
        console.log(`  Error accediendo datos: ✗ ${e.message}`);
    }
    
    // 3. Verificar instancia de la app
    console.log('3. Verificando aplicación:');
    console.log(`  Instancia app: ${typeof window.app !== 'undefined' ? '✓ OK' : '✗ NO CARGADA'}`);
    console.log(`  Clase global app: ${typeof app !== 'undefined' ? '✓ OK' : '✗ NO DISPONIBLE'}`);
    
    // 4. Verificar vista actual
    console.log('4. Verificando vista actual:');
    const vistaActiva = document.querySelector('.view-section.active');
    if (vistaActiva) {
        console.log(`  Vista activa: ✓ ${vistaActiva.id}`);
    } else {
        console.log('  Vista activa: ✗ NINGUNA');
    }
    
    // 5. Verificar navegación
    console.log('5. Verificando navegación:');
    const navActivo = document.querySelector('.nav-btn.active');
    if (navActivo) {
        console.log(`  Tab activo: ✓ ${navActivo.dataset.view}`);
    } else {
        console.log('  Tab activo: ✗ NINGUNO');
    }
    
    console.log('=== FIN VERIFICACIÓN ===');
    
    // Sugerencias
    if (typeof app === 'undefined') {
        console.log('💡 SUGERENCIA: La aplicación no se cargó. Intenta refrescar la página.');
    }
}

// Ejecutar verificación automáticamente después de 3 segundos
setTimeout(() => {
    console.log('🔍 Ejecutando verificación automática...');
    verificarEstadoApp();
}, 3000);

// Hacer función disponible globalmente
window.verificarEstadoApp = verificarEstadoApp;