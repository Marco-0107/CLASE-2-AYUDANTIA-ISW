# Rally Backend Ayudantia 2 ISW - Sistema de Gestión de Rally

Este es un backend funcional para hacer pruebas y explicar de mejor manera a los alumnos de la asignatura de ISW 2025-2 los Endpoint y funcionamiento general del Backend dentro de un proyecto real.

## Características

- **CRUD completo** para Pilotos y Vehículos
- **Autenticación JWT**
- **Base de datos PostgreSQL** con TypeORM
- **Validaciones con Joi**
- **Estructura modular y escalable**
- **Manejo de errores centralizado**
- **Middlewares de seguridad**

## Requisitos previos

- Node.js >= 18.0.0
- PostgreSQL >= 12
- npm

## Instalación

1. **Clona el repositorio**
```bash
git clone <url-del-repositorio>
cd rally-backend
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Configura las variables de entorno**

Edita el archivo `.env` con tus credenciales de base de datos.

5. **Ejecuta el servidor**
```bash
npm run dev

## Estructura del proyecto

```
src/
├── config/          # Configuración de DB y variables de entorno
├── controllers/     # Controladores de las rutas
├── entity/          # Entidades de TypeORM
├── middlewares/     # Middlewares personalizados
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── validations/     # Validaciones con Joi
├── handlers/        # Manejadores de respuestas
├── auth/            # Configuración de autenticación
└── index.js         # Punto de entrada
```

## 📊 Modelo de datos

### Piloto (Simplificado para Aprendizaje)
- `id_piloto` (PK) - ID único del piloto
- `nombre` - Nombre del piloto
- `apellido` - Apellido del piloto
- `edad` - Edad del piloto (18-70 años)
- `nacionalidad` - Nacionalidad del piloto
- `rut` - RUT único con validación chilena
- `fecha_registro` - Fecha de registro (automática)

### Vehículo (Simplificado para Aprendizaje)
- `id_vehiculo` (PK) - ID único del vehículo
- `patente` - Patente única del vehículo
- `marca` - Marca del vehículo
- `modelo` - Modelo del vehículo
- `año` - Año de fabricación (1990-actualidad)
- `id_piloto` (FK, opcional) - ID del piloto asignado
- `fecha_registro` - Fecha de registro (automática)

### Relación:
- Un piloto puede tener múltiples vehículos
- Un vehículo puede existir sin piloto (id_piloto = null)
- Perfecta para enseñar conceptos básicos de foreign keys

## Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens se envían en las cookies y tienen una duración configurable.

## Validaciones

Todas las entradas están validadas usando Joi:
- Formato de email
- Longitud de campos
- Tipos de datos
- Campos requeridos


## Contribuciones

Este proyecto está diseñado como material educativo para enseñar CRUD básico a estudiantes de la asignatura de ISW 2025-2.

## 📄 Licencia

MIT License