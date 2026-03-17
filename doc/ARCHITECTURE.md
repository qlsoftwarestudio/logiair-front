# LogiAir — Documentación Técnica Completa

## 1. Visión General

**LogiAir** es una plataforma SaaS diseñada para digitalizar la gestión operativa y administrativa de guías aéreas (Air Waybill – AWB) en agencias de carga y despachantes de aduana.

Reemplaza el uso de múltiples archivos Excel para seguimiento logístico, centralizando toda la información en una plataforma web multiusuario.

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Estilos | Tailwind CSS + shadcn/ui |
| Animaciones | Framer Motion |
| Gráficos | Recharts |
| Routing | React Router v6 |
| Estado servidor | TanStack React Query |
| Formularios | React Hook Form + Zod |

---

## 3. Módulos del Sistema

### 3.1 Dashboard (`/`)
Panel principal con KPIs operativos en tiempo real:
- Operaciones del día
- Guías en proceso / pendientes / completadas
- Facturación del mes
- Tabla de últimas operaciones con acceso directo
- Panel de alertas IA (preparado para automatización)

### 3.2 Operaciones (`/operaciones`)
Listado completo de guías aéreas con:
- Filtros por tipo (IMPORT/EXPORT) y estado
- Búsqueda por número AWB, cliente o aerolínea
- Badges de estado con código de color
- Navegación al detalle de cada guía

### 3.3 Detalle AWB (`/operaciones/:id`)
Vista completa de una guía aérea individual:
- Datos generales (AWB, cliente, aerolínea, origen/destino)
- **Timeline visual del proceso logístico** (componente clave)
- Historial de cambios de estado con usuario, fecha y observaciones
- Servicios asociados a la guía

### 3.4 Clientes (`/clientes`)
CRUD de clientes con:
- Empresa, CUIT, contacto, email, teléfono
- Contador de operaciones por cliente
- Búsqueda por empresa o CUIT

### 3.5 Facturación (`/facturacion`)
Gestión de facturación mensual:
- Listado de facturas con estado (PENDIENTE / PAGADA / ANULADA)
- Agrupación de servicios por cliente
- Preparado para exportación a PDF

### 3.6 Reportes (`/reportes`)
Reportes operativos con gráficos:
- Volumen de operaciones por mes
- Ingresos mensuales
- Distribución por tipo de operación
- Métricas de productividad

### 3.7 IA Hub (`/ia-hub`)
Módulo preparado para integración de IA:
- Lectura automática de pre alertas por email
- Extracción de datos de PDFs
- Generación automática de reportes
- Sugerencias de facturación

### 3.8 Configuración (`/configuracion`)
Administración del sistema:
- Gestión de usuarios
- Roles y permisos
- Datos y exportación
- Notificaciones

---

## 4. Modelo de Datos

### Users
```
id: string
name: string
email: string
role: "ADMIN" | "OPERADOR" | "ADMINISTRACION"
avatar?: string
```

### Clients
```
id: string
empresa: string
cuit: string
contacto: string
email: string
telefono: string
createdAt: string
```

### AirWaybills (AWB)
```
id: string
awbNumber: string
clientId: string
clientName: string
operationType: "IMPORT" | "EXPORT"
airline: string
origin: string
destination: string
arrivalDate?: string
departureDate?: string
manifestNumber?: string
currentStatus: AWBState
observations?: string
statusHistory: StatusHistoryEntry[]
createdAt: string
```

### StatusHistoryEntry
```
id: string
status: AWBState
date: string
userId: string
userName: string
observations?: string
```

### Services
```
id: string
description: string
price: number
date: string
clientId: string
clientName: string
awbId: string
awbNumber: string
```

### Invoices
```
id: string
invoiceNumber: string
clientId: string
clientName: string
date: string
total: number
status: "PENDIENTE" | "PAGADA" | "ANULADA"
services: Service[]
```

---

## 5. Workflows Operativos

### 5.1 Flujo de Importación

```
PRE ALERTA
    │  Se recibe aviso de carga entrante
    ▼
GUÍA REGISTRADA
    │  Se registra el AWB en el sistema
    ▼
MANIFIESTO DESCONSOLIDADO
    │  Se desconsolida la carga del manifiesto general
    ▼
PRESENTADO EN ADUANA
    │  Se presenta la documentación ante Aduana
    ▼
MANIFIESTO REGISTRADO
    │  Aduana registra el manifiesto
    ▼
OPERACIÓN COMPLETADA
    │  Se entrega la carga al cliente
    ▼
FACTURADO
       Se emite factura al cliente
```

### 5.2 Flujo de Exportación

```
GUÍA REGISTRADA
    │  Se registra el AWB de exportación
    ▼
INGRESO EN BODEGA
    │  La carga ingresa a la bodega del aeropuerto
    ▼
MANIFIESTO GENERADO
    │  Se genera el manifiesto de carga
    ▼
VUELO PROGRAMADO
    │  Se asigna vuelo a la carga
    ▼
VUELO SALIDO
    │  El avión despega con la carga
    ▼
OPERACIÓN COMPLETADA
    │  Se confirma recepción en destino
    ▼
FACTURADO
       Se emite factura al cliente
```

---

## 6. Sistema de Roles y Permisos

### 6.1 Roles Definidos

| Rol | Descripción |
|-----|------------|
| **ADMIN** | Control total del sistema. Gestiona usuarios, configuración y tiene acceso a todos los módulos. |
| **OPERADOR** | Gestiona el día a día operativo: guías aéreas, estados, clientes y servicios. |
| **ADMINISTRACIÓN** | Gestiona la parte financiera: facturación, reportes y exportación de datos. |

### 6.2 Matriz de Permisos por Módulo

| Módulo | ADMIN | OPERADOR | ADMINISTRACIÓN |
|--------|:-----:|:--------:|:--------------:|
| **Dashboard** | ✅ Completo | ✅ Solo KPIs operativos | ✅ Solo KPIs financieros |
| **Operaciones - Ver** | ✅ | ✅ | ✅ Solo lectura |
| **Operaciones - Crear** | ✅ | ✅ | ❌ |
| **Operaciones - Editar** | ✅ | ✅ | ❌ |
| **Operaciones - Eliminar** | ✅ | ❌ | ❌ |
| **Operaciones - Cambiar estado** | ✅ | ✅ | ❌ |
| **Clientes - Ver** | ✅ | ✅ | ✅ |
| **Clientes - Crear/Editar** | ✅ | ✅ | ❌ |
| **Clientes - Eliminar** | ✅ | ❌ | ❌ |
| **Facturación - Ver** | ✅ | ❌ | ✅ |
| **Facturación - Crear factura** | ✅ | ❌ | ✅ |
| **Facturación - Marcar pagada** | ✅ | ❌ | ✅ |
| **Facturación - Anular** | ✅ | ❌ | ❌ |
| **Reportes - Ver** | ✅ | ✅ Solo operativos | ✅ Completo |
| **Reportes - Exportar** | ✅ | ❌ | ✅ |
| **IA Hub** | ✅ | ✅ Solo lectura | ❌ |
| **Configuración - Usuarios** | ✅ | ❌ | ❌ |
| **Configuración - Roles** | ✅ | ❌ | ❌ |
| **Configuración - Datos/Backup** | ✅ | ❌ | ✅ Solo exportar |
| **Configuración - Notificaciones** | ✅ | ✅ Propias | ✅ Propias |

### 6.3 Flujos por Rol

#### ADMIN — Flujo Completo

```
Login
  ├── Dashboard (todos los KPIs)
  ├── Operaciones
  │     ├── Crear nueva guía AWB
  │     ├── Editar cualquier guía
  │     ├── Eliminar guías
  │     ├── Cambiar estado en timeline
  │     └── Ver detalle completo
  ├── Clientes
  │     ├── Crear / Editar / Eliminar clientes
  │     └── Ver historial de operaciones
  ├── Facturación
  │     ├── Generar facturas mensuales
  │     ├── Marcar como pagada
  │     ├── Anular facturas
  │     └── Exportar a PDF
  ├── Reportes
  │     ├── Ver todos los reportes
  │     └── Exportar datos
  ├── IA Hub
  │     └── Configurar y ver todas las automatizaciones
  └── Configuración
        ├── Gestionar usuarios (crear, editar, desactivar)
        ├── Asignar roles
        ├── Configurar backups
        └── Gestionar notificaciones globales
```

#### OPERADOR — Flujo Operativo

```
Login
  ├── Dashboard (KPIs operativos: guías en proceso, pendientes, del día)
  ├── Operaciones
  │     ├── Crear nueva guía AWB
  │     ├── Editar guías asignadas
  │     ├── Actualizar estado en timeline
  │     │     ├── Importación: PRE ALERTA → ... → OPERACIÓN COMPLETADA
  │     │     └── Exportación: GUÍA REGISTRADA → ... → OPERACIÓN COMPLETADA
  │     ├── Agregar observaciones
  │     └── Registrar servicios realizados
  ├── Clientes
  │     ├── Ver listado de clientes
  │     ├── Crear nuevos clientes
  │     └── Editar datos de contacto
  ├── Reportes (solo operativos)
  │     └── Ver operaciones por mes y por cliente
  ├── IA Hub (solo lectura)
  │     └── Ver sugerencias y alertas automáticas
  └── Configuración
        └── Notificaciones propias
```

#### ADMINISTRACIÓN — Flujo Financiero

```
Login
  ├── Dashboard (KPIs financieros: facturación del mes, pendientes de cobro)
  ├── Operaciones (solo lectura)
  │     └── Ver estado de operaciones para verificar facturabilidad
  ├── Clientes (solo lectura)
  │     └── Ver datos de clientes para facturación
  ├── Facturación
  │     ├── Agrupar servicios por cliente
  │     ├── Generar factura mensual
  │     ├── Marcar facturas como pagadas
  │     └── Exportar facturas a PDF
  ├── Reportes (completo)
  │     ├── Facturación mensual
  │     ├── Ingresos por cliente
  │     ├── Productividad por operador
  │     └── Exportar datos
  └── Configuración
        ├── Exportar datos operativos
        └── Notificaciones propias
```

---

## 7. Componentes Clave

### Timeline Visual (`AWBTimeline`)
Componente central que muestra el progreso de cada guía aérea como un workflow visual vertical. Cada nodo muestra:
- Estado actual (con color semántico)
- Fecha y hora del cambio
- Usuario responsable
- Observaciones opcionales

Los estados completados se muestran en verde, el actual en azul/primario, y los pendientes en gris.

### StatusBadge
Badge con código de color para cada estado del workflow:
- **Amarillo**: PRE ALERTA (requiere atención)
- **Azul**: Estados en proceso (GUÍA REGISTRADA, PRESENTADO EN ADUANA, etc.)
- **Verde**: Estados completados (OPERACIÓN COMPLETADA, FACTURADO, VUELO SALIDO)
- **Rojo**: Errores documentales

### OpTypeBadge
Indicador visual del tipo de operación:
- **IMPORT**: Badge con ícono de flecha entrante
- **EXPORT**: Badge con ícono de flecha saliente

### StatCard
Tarjeta de KPI reutilizable con:
- Ícono, título y valor principal
- Indicador de tendencia (porcentaje de cambio)
- Gradiente de color configurable

---

## 8. Preparación para IA (Roadmap)

El módulo IA Hub está preparado para integrar:

| Feature | Descripción | Estado |
|---------|------------|--------|
| Lectura de emails | Parsear pre alertas recibidas por email automáticamente | 🟡 Preparado |
| Extracción de PDFs | Extraer datos de documentos de carga (AWB, manifiestos) | 🟡 Preparado |
| Reportes automáticos | Generar reportes periódicos sin intervención manual | 🟡 Preparado |
| Sugerencias de facturación | Detectar servicios no facturados y sugerir facturas | 🟡 Preparado |

---

## 9. Estructura de Archivos

```
src/
├── components/
│   ├── awb/
│   │   ├── AWBTimeline.tsx      # Timeline visual del proceso
│   │   ├── OpTypeBadge.tsx       # Badge IMPORT/EXPORT
│   │   └── StatusBadge.tsx       # Badge de estado con colores
│   ├── dashboard/
│   │   └── StatCard.tsx          # Tarjeta de KPI
│   ├── layout/
│   │   ├── AppLayout.tsx         # Layout principal con sidebar
│   │   ├── AppSidebar.tsx        # Navegación lateral
│   │   └── AppHeader.tsx         # Header con búsqueda y perfil
│   └── ui/                       # Componentes shadcn/ui
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── mock-data.ts              # Datos de ejemplo
│   ├── types.ts                  # Tipos e interfaces
│   └── utils.ts                  # Utilidades
├── pages/
│   ├── Dashboard.tsx             # Panel principal
│   ├── OperacionesPage.tsx       # Listado de operaciones
│   ├── AWBDetailPage.tsx         # Detalle de guía con timeline
│   ├── ClientesPage.tsx          # Gestión de clientes
│   ├── FacturacionPage.tsx       # Facturación
│   ├── ReportesPage.tsx          # Reportes con gráficos
│   ├── IAHubPage.tsx             # Centro de IA
│   ├── ConfiguracionPage.tsx     # Configuración del sistema
│   └── NotFound.tsx              # Página 404
├── App.tsx                       # Router y providers
├── main.tsx                      # Entry point
└── index.css                     # Design system tokens
```

---

## 10. Próximos Pasos Recomendados

1. **Habilitar Lovable Cloud** para persistencia real (base de datos, auth, storage)
2. **Implementar autenticación** con login y roles funcionales
3. **CRUDs funcionales** con formularios de creación/edición
4. **Exportación a PDF** para facturas
5. **Integración IA** para automatización de pre alertas
