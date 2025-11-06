# 🚀 Guía Rápida - Mis Clases PWA

## ⚡ Inicio Rápido (5 minutos)

### 1. Subir a GitHub Pages
```bash
# 1. Crear repositorio en GitHub llamado 'mis-clases'
# 2. Subir todos los archivos
# 3. GitHub → Settings → Pages → Branch: main
# 4. Tu app estará en: https://TU-USUARIO.github.io/mis-clases
```

### 2. Instalar en dispositivos
- **iPhone**: Safari → Compartir → "Agregar a pantalla de inicio"
- **Android**: Chrome → Menú (⋮) → "Instalar aplicación"  
- **Escritorio**: Chrome → Ícono de instalación en barra de direcciones

### 3. Primera clase
1. Toca **"+ Nueva Clase"**
2. Rellena: Estudiante, Fecha, Hora, Precio
3. Toca **"Guardar"**
4. ¡Listo! Ya tienes tu primera clase registrada

## 📱 Navegación Básica

| Icono | Vista | Función |
|-------|-------|---------|
| 📋 Lista | Ver todas las clases, buscar, editar |
| 📅 Calendario | Vista mensual con clases |  
| 📊 Stats | Ingresos, estadísticas, top estudiantes |

## ⚙️ Personalización Rápida

### Cambiar moneda (de € a $)
En `app.js` busca `€` y reemplaza por `$`

### Cambiar colores
En `styles.css` modifica:
```css
--primary-color: #2563eb; /* Azul → Tu color */
```

### Cambiar hora por defecto
En `app.js` busca:
```javascript
if (horaInput) horaInput.value = '09:00'; // Cambiar aquí
```

## 🔧 Crear Iconos

### Opción fácil:
1. Ve a [PWA Builder](https://www.pwabuilder.com/imageGenerator)
2. Sube una imagen cuadrada (512x512px mínimo)
3. Descarga pack de iconos
4. Reemplaza archivos `icon-*.png`

### Iconos necesarios:
- icon-72.png, icon-96.png, icon-128.png
- icon-144.png, icon-152.png, icon-192.png  
- icon-384.png, icon-512.png

## 💾 Backup de Datos

### Exportar manualmente:
```javascript
// En consola del navegador (F12):
console.log(localStorage.getItem('misClases'));
// Copiar resultado y guardar
```

### Restaurar:
```javascript
// En consola del navegador:
localStorage.setItem('misClases', '[TUS_DATOS_AQUI]');
location.reload();
```

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| No se instala en iPhone | Usar Safari (no Chrome) |
| Datos se pierden | Hacer backup regular |
| App no carga | Forzar recarga: Ctrl+F5 |
| No funciona offline | Verificar Service Worker en DevTools |

## 📞 Contacto Rápido

**¿Algo no funciona?**
1. Abre DevTools (F12) → Console
2. Busca errores en rojo
3. Verifica que todos los archivos se carguen

## 🎯 Próximos Pasos

1. ✅ **Instalar y usar básico**
2. ⚙️ **Personalizar colores/moneda**  
3. 🎨 **Crear iconos personalizados**
4. 📊 **Explorar estadísticas**
5. 🔄 **Configurar backup automático**

---

**¡En 5 minutos tendrás tu app de clases funcionando!** 🎓

### Enlaces útiles:
- 📖 [README completo](README.md)
- 🌐 [GitHub Pages](https://pages.github.com/)
- 🛠️ [PWA Builder](https://www.pwabuilder.com/)
