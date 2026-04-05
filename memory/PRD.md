# Veracruz Contigo - PRD (Product Requirements Document)

## Visión General
**Plataforma oficial de turismo del Estado de Veracruz, México**

Sistema multi-rol con 4 niveles de usuarios para gestionar información turística de los 232 municipios de Veracruz.

---

## Arquitectura del Sistema

### Backend (FastAPI + MongoDB)
- **Puerto:** 8001
- **Base de datos:** MongoDB (MONGO_URL en .env)
- **Autenticación:** JWT para admin/encargados/prestadores, Google OAuth para turistas

### Frontend (React + Tailwind CSS)
- **Puerto:** 3000
- **Componentes UI:** Shadcn/UI
- **Rutas principales:** React Router

---

## User Personas y Roles

### 1. Super Administrador
- Acceso total al sistema
- Crea credenciales para encargados municipales
- Verifica prestadores de servicios
- Publica alertas de seguridad/meteorológicas
- Ve dashboard con estadísticas globales

### 2. Encargado Municipal (232 posibles)
- Gestiona su municipio asignado
- Sube fotos, videos, eventos
- Propone prestadores para verificación
- Ve estadísticas de su municipio
- Recibe notificaciones de pico de interés

### 3. Prestador de Servicios
- Perfil verificado por Super Admin
- Gestiona su información de negocio
- Badge "Prestador Verificado"

### 4. Turista
- Login con Google OAuth
- Modo lectura sin cuenta
- Con cuenta: favoritos, reseñas, botón de pánico GPS

---

## Core Requirements

### Funcionalidades Implementadas
1. **Sistema de Autenticación**
   - JWT para admin/encargados/prestadores
   - Google OAuth 2.0 (Emergent Auth) para turistas
   - Roles y permisos en frontend y backend

2. **Gestión de Municipios**
   - 199 municipios únicos precargados
   - 9 Pueblos Mágicos marcados
   - Estados: publicado/borrador/sin_configurar

3. **Prestadores de Servicios**
   - CRUD completo
   - Sistema de verificación
   - Calificaciones y reseñas

4. **Eventos**
   - 5 eventos de ejemplo precargados + 2 de Orizaba
   - Filtros por tipo y municipio

5. **Sistema de Alertas**
   - Creación por Super Admin
   - Tipos: meteorológica/seguridad/vial/salud

6. **Botón de Pánico**
   - Geolocalización GPS
   - Llamada automática al 911
   - Compartir por WhatsApp

7. **Buscador Global**
   - Búsqueda en municipios, eventos, prestadores
   - Resultados en tiempo real (debounce 300ms)

8. **Panel de Administración**
   - Dashboard con métricas
   - Gestión de usuarios
   - Cola de aprobación de prestadores

9. **Sistema de Analíticas**
   - Tracking de vistas, contactos, búsquedas
   - Dashboard global (Super Admin)
   - Dashboard por municipio (Encargados)

10. **Fotos Reales y Datos de Orizaba**
    - 9 municipios principales con fotos de portada reales
    - Orizaba con datos completos (descripcion, historia, que_hacer, clima, etc.)
    - 4 prestadores verificados para Orizaba
    - 2 eventos para Orizaba
    - Cuenta de encargado preconfigurada

11. **Notificaciones de Pico de Interés**
    - Backend: detección de picos (>50% aumento en vistas)
    - API: GET /notifications, PUT /notifications/{id}/read
    - UI: Campana con badge en panel de encargado
    - Panel desplegable con lista de notificaciones

---

## Historial de Implementación

### 05/04/2026 - MVP v1.0
- Backend completo con FastAPI
- Frontend React con todas las páginas públicas
- Sistema de autenticación dual (JWT + Google OAuth)
- Seed de 199 municipios únicos
- 9 Pueblos Mágicos configurados
- 5 eventos de ejemplo
- 4 prestadores de ejemplo verificados
- Panel Super Admin completo
- Panel Encargado Municipal
- Panel Prestador
- Página de emergencias con botón de pánico
- Buscador global funcional
- Object Storage de Emergent integrado

### 05/04/2026 - Sistema de Analíticas v1.1
- Tracking de vistas de municipios
- Tracking de contactos a prestadores
- Tracking de búsquedas
- Dashboard de analíticas globales y por municipio
- Top municipios/prestadores/búsquedas

### 05/04/2026 - Fotos Reales + Orizaba + Notificaciones v1.2
- 9 municipios con fotos reales de portada
- Orizaba completamente configurado (como si el encargado ya lo hubiera hecho)
- Encargado Orizaba: encargado.orizaba@veracruzcontigo.gob.mx
- 4 prestadores y 2 eventos para Orizaba
- Sistema de notificaciones de pico de interés (backend + UI)

### 05/04/2026 - Logos de Gobierno + Rutas de Viaje v1.3
- Escudo del Gobierno de Veracruz en Header y Footer
- Franja institucional en Footer con "Gobierno del Estado de Veracruz - Secretaría de Turismo y Cultura"
- Página de Rutas de Viaje con 4 itinerarios:
  - Escapada Express (3 días): Xalapa, Coatepec, Xico
  - Ruta de Pueblos Mágicos (5 días): Orizaba, Coatepec, Xico, Papantla, Tlacotalpan
  - Aventura Veracruzana Completa (7 días): recorrido completo del estado
  - Ruta Cultural y Arqueológica (4 días): Veracruz, Papantla, Xalapa, Orizaba
- Cada ruta con itinerario día a día, actividades, tips y enlaces a municipios
- Enlace "Rutas" en navegación principal y homepage

### 05/04/2026 - i18n (3 idiomas) + Onboarding + Clima v1.4
- Sistema de internacionalización completo: Español, Inglés, Francés
- Selector de idioma (globe icon) en Header con dropdown
- Preferencia guardada en localStorage
- Traducciones: Hero, navegación, botones, secciones, clima, footer, rutas tips
- Tarjetas de clima: Xalapa (18°C), Veracruz (29°C), Orizaba (20°C), Coatepec (17°C)
- Onboarding por rol al primer login:
  - Turista: Explora, favoritos, botón de pánico, rutas
  - Encargado: Completa perfil, sube fotos, crea eventos, estadísticas
  - Prestador: Completa perfil, verificación, reseñas, actualizar info
- Modal stepper con 4 pasos, indicadores, Siguiente/Omitir/Entendido
- Fix: removeChild error en Header (fragment → div)

### Integraciones
- **Google OAuth:** Via Emergent Auth
- **Object Storage:** Emergent Object Storage
- **Emails:** MOCKED (logs en consola)
- **Google Maps:** Pendiente (placeholders)

---

## Backlog Priorizado

### P1 - Alto
- [ ] PWA: manifest.json y Service Worker para instalación offline
- [ ] Google Maps API real con clustering y filtros
- [ ] Object Storage: upload funcional de imágenes desde paneles
- [ ] Sistema completo de Rating & Reviews para prestadores

### P2 - Medio
- [ ] Exportar reportes PDF/Excel de analíticas
- [ ] Mapa interactivo con pins personalizados
- [ ] Notificaciones en tiempo real (WebSocket)
- [ ] Historial de emergencias para turistas
- [ ] Configurar SMTP para emails reales

### P3 - Bajo
- [ ] SEO dinámico por municipio
- [ ] Open Graph images
- [ ] Sitemap.xml
- [ ] PWA offline mode
- [ ] Drag & drop para ordenar fotos

---

## Credenciales de Prueba

```
Super Admin:
Email: superadmin@veracruzcontigo.gob.mx
Password: VeracruzAdmin2024!

Encargado Orizaba:
Email: encargado.orizaba@veracruzcontigo.gob.mx
Password: Orizaba2024!

Turista:
Login con Google (Emergent OAuth)
```

---

## URLs de la API

```
Base: ${REACT_APP_BACKEND_URL}/api

GET  /health              - Health check
GET  /municipios          - Lista municipios
GET  /municipios/:slug    - Detalle municipio
GET  /prestadores         - Lista prestadores
GET  /eventos             - Lista eventos
GET  /alertas             - Alertas activas
GET  /search?q=           - Búsqueda global
POST /auth/login          - Login JWT
POST /auth/session        - OAuth callback
GET  /admin/stats         - Stats (admin)
GET  /notifications       - Notificaciones del usuario
PUT  /notifications/:id/read - Marcar como leída
POST /admin/check-spikes  - Disparar detección de picos
```

---

## Arquitectura de Archivos

```
/app/
├── backend/
│   ├── server.py         # API FastAPI completa (~2400 líneas)
│   ├── tests/            # Tests pytest
│   └── .env              # Variables de entorno
├── frontend/
│   ├── src/
│   │   ├── App.js        # Router y Auth Context
│   │   ├── pages/        # Páginas públicas y admin
│   │   ├── components/   # Componentes reutilizables
│   │   └── hooks/        # useAnalytics.js
│   └── .env              # REACT_APP_BACKEND_URL
├── memory/
│   ├── PRD.md            # Este documento
│   └── test_credentials.md
└── test_reports/         # Reportes de testing
```
