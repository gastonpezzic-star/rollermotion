# Changelog

## V249 — 2026-05-06

### Fixes

**PDF / Vista previa de cotización**

- Reducido el padding interno del template PDF de 32px a 22px (en 6 lugares: header, datos cliente, tabla de artículos, total bar, observaciones y footer).
  - Arregla el margen derecho asimétrico (estaba mucho más pegado al borde que el izquierdo).
  - Arregla la vista previa cortada a la derecha en el modal de la app.
- Agregado `overflow-x:auto` en `#doc-content` como red de seguridad para pantallas chicas o contenidos largos a futuro.

### Renombre de cenefas

- "Cenefa curva chica 32/38mm" → **"Cenefa curva SLIM"**
- "Cenefa Maxi" → **"Cenefa curva MAXI"**
- Aplicado en catálogo de insumos, cotizador y preview de etiquetas (5 lugares en total).

### Mejoras de UX

**Leyenda contextual al cotizar cenefas**

- Al agregar una cenefa SLIM o MAXI a una cotización aparece una pequeña leyenda en cursiva debajo del nombre del item:
  - 💡 SLIM: *Para cortinas de 800 a 2200 de ancho*
  - 💡 MAXI: *Para cortinas de 2200 a 3700 de ancho*
- La leyenda **solo se muestra en el editor de cotización** — no aparece en la vista previa ni en el PDF que se le entrega al cliente.

## V248 — 2026-05-06

### Mejoras de UX

**Menú de acciones agrupadas (⋮)**

- Botón ⋮ (tres puntos verticales) reemplaza los íconos individuales de Editar / Duplicar / Eliminar en las filas de tablas.
- Al tocar el ⋮ se abre un dropdown con:
  - ✏️ Editar
  - 📋 Duplicar (solo en cotizaciones)
  - 🗑 Eliminar (en rojo, separado por línea divisoria)
- Se cierra al hacer click afuera o al elegir una opción.
- Se mantienen separados como botones siempre visibles:
  - 👁 Ver (acción más usada)
  - 📦 Convertir a pedido (solo en cotizaciones)
- Aplicado en pestañas: **Cotizaciones**, **Pedidos** y **Administración**.

**Resultado:** la fila pasa de 5 botones (👁 ✏️ 📋 📦 🗑) a 3 (👁 📦 ⋮) → más limpio y menos ruido visual.

## V247 — 2026-05-05

- Versión inicial subida al repositorio.
