# Changelog

## V253 — 2026-05-07

### Mejoras

**Scanner robusto en iPad / iOS**

El scanner no funcionaba en iPad porque el evento `keypress` (que se usaba para capturar las teclas) está deprecado y se comporta de forma inconsistente en iOS, especialmente con teclados Bluetooth (que es como el iPad "ve" al scanner). Además, algunos scanners no envían Enter al final, así que el buffer nunca se procesaba.

**Cambios**:

- **`keypress` → `keydown`**: evento moderno y fiable en iOS.
- **Auto-procesamiento sin Enter**: si pasan 150ms sin teclas y el buffer matchea el patrón, se dispara automáticamente. Soluciona scanners que no envían Enter.
- **Detección scanner vs humano por ritmo**: el scanner tipea muy rápido (<80ms entre teclas en promedio); un humano no. Solo procesa como scan si el ritmo lo confirma + el patrón matchea.
- **Patrón estricto**: `LETRAS + (separador opcional) + DIGITOS` (ej: `PED-0158`, `PED'0158`, `PED0158`, `COT-0124`).
- **Funciona en cualquier pestaña**: cotizaciones, pedidos, fábrica, clientes, etc. La única restricción es que no haya un overlay abierto (excepto el propio confirm de scan).
- **`e.preventDefault()` en Enter**: solo si parece scanner, así no rompe el Enter normal en formularios.
- **Mejor logging**: cada scan loguea en consola buffer + tiempos + razón de descarte (útil para debugging desde el inspector del iPad).

**Apóstrofe**: la normalización ya manejaba bien `PED'0158` → `PED0158` (regex que strippea todo lo no alfanumérico). El problema real era que las teclas no llegaban al buffer en iOS.

## V252 — 2026-05-07

### Fixes

**Descuento desincronizado del display**

El monto del descuento se calculaba sobre la base correcta (suma total: items + adicionales + instalación) pero el **display visual no se refrescaba** cuando se cambiaba la instalación, los adicionales u otros valores después de activar el descuento. Resultado: el monto mostrado dependía del orden en que el usuario tocaba las cosas, aunque al guardar siempre se calculaba bien.

**Fix**:

- Nueva función `updateDescuentoDisplay()` — actualiza solo la UI del descuento sin tocar el total.
- `recalcTotalConInstal()` ahora siempre llama a `updateDescuentoDisplay()` al final, así cualquier cambio en items / instalación / adicionales sincroniza el display del descuento.
- Lo mismo para el precio Corporativo: si está activo, se refresca cuando cambia la base.
- `calcDescuento()` simplificado — un solo punto de verdad evita doble cálculo.

Resultado: el monto que ves siempre coincide con el monto que se guarda, sin depender del orden.

## V251 — 2026-05-07

### Mejoras

**Pedido directo unificado con cotización**

Antes había dos formularios distintos para crear cotización y pedido directo, con campos técnicos diferentes y nombres de campos que no coincidían con los que la planilla de fabricación lee. Resultado: pedidos directos llegaban a fábrica con datos faltantes o mal nombrados.

Ahora ambos flujos comparten un solo formulario. Los detalles técnicos se piden en un overlay al final, con campos consistentes y nombres correctos.

- **Form de "Nuevo Pedido"** ahora idéntico al de "Nueva Cotización":
  - Se quitó la sección "Detalles técnicos de fabricación" del formulario.
  - Se quitaron las columnas técnicas inline (zócalo, sentido, soporte, cadena, etc.) en la tabla de items.
  - Se mantienen visibles los campos de contacto (CUIT, teléfonos) en pedido.
- **Click en "Guardar"** estando en pedido nuevo abre el overlay de detalles técnicos (el mismo que ya se usaba al convertir cotización → pedido). Tras confirmar, se crea el pedido.
- **Edge case**: si el pedido solo tiene accesorios/insumos sin configuración técnica, se salta el overlay y se guarda directo.

### Mejoras al overlay de detalles técnicos

- **Cobertura ampliada**: ahora incluye también Sunscreen 3% y 1% (antes solo Blackout y Sunscreen 5%).
- **Confección tradicional** — opciones de accionamiento más claras:
  - Apertura central
  - Un paño · recoge izquierda
  - Un paño · recoge derecha
- **Sección NUEVA: Rieles** (Manual + Motorizado Somfy):
  - **Apertura**: Central / Un paño
  - **Lado**:
    - En Riel Manual: "Abre hacia" (Izquierda / Derecha)
    - En Riel Motorizado: "Lado del motor" (Izquierda / Derecha)

### Notas técnicas

- Refactor: `_pedidoSrcId` (id) → `_pedidoSrc` (objeto doc completo), permite manejar tanto cotizaciones guardadas como drafts en memoria.
- `convertToOrder(idOrDoc)` ahora acepta un id (cotización guardada) o un objeto doc (pedido directo).
- `confirmarPedido()` distingue entre "viene de cotización" (actualiza estado origen a 'Aprobada') y "pedido directo" (no hay origen).
- Nuevo helper `isRollerTela(t)` y constante `TIPOS_ROLLER` para unificar la detección de cortinas roller.
- Nuevos campos guardados en items de rieles: `apertura` (Central/Un paño), `lado` (Izquierda/Derecha).
- Bloque viejo de "Detalles técnicos de fabricación" en el form marcado como deprecado (`data-deprecated-tech-block`, oculto con `display:none`). Mantenemos el HTML por si hay que revertir, eliminamos en V252+.

### Compatibilidad

- **Pedidos viejos guardados con nombres antiguos** (`cadColor`, `mecColor`) siguen abriéndose; pero al editarlos NO se ven los detalles técnicos en el form. Para ver/editar esos detalles hay que volver a pasar por el flujo overlay (commit futuro).
- **Convertir cotización → pedido**: sigue funcionando exactamente igual desde el botón 📦.

## V250 — 2026-05-07

### Fixes

**Rieles que no se agregaban a la cotización**

- La validación al agregar items requería `ancho` Y `alto`. Los rieles (Riel Manual Aluminio y Riel Motorizado Somfy) solo necesitan ancho — quedaban bloqueados por la validación antes de ejecutar el cálculo.
- Ahora la validación reconoce el `tipo:'riel'` como caso especial y solo exige `ancho`.

### Mejoras

**Servicio de instalación: manual + motorizada**

Reescritura del cálculo y la UI de la card de Instalación.

- **Lógica nueva** — cada motor "convierte" 1 instalación manual en motorizada:
  - Ejemplo: 4 cortinas + 1 motor → 3 manual + 1 motorizada (4 totales).
  - Ejemplo: 4 cortinas + 5 motores → 0 manual + 4 motorizada (los 5 motores caben en 4 cortinas, el extra no se cuenta).
  - Riel Motorizado Somfy cuenta como motorizada directamente (no necesita motor extra).
- **Precio** instalación motorizada actualizado: $45.000 → **$53.000** (lista de precios `instal_motor`).
- **UI editable**: la card ahora muestra dos filas independientes (Manual / Motorizada) con contador `[− N +]` editable. Si tocás los valores se "fija" tu edición. Botón **↻ Auto** para volver al cálculo automático.
- **Display compacto**: la fila Motorizada solo aparece cuando hay items motorizados o el usuario la activa manualmente.
- **PDF / preview**: ahora se muestran como 2 líneas separadas si la cotización tiene ambos tipos:
  - 🔧 Servicio de instalación (manual)
  - ⚡ Servicio de instalación motorizada
- **Backward compat**: cotizaciones viejas sin breakdown se siguen mostrando como una sola línea, como antes.

### Notas técnicas

- Nueva tela `'motores'` agregada a `TIPOS_CON_INSTALACION` (antes los motores no contaban como instalación).
- Nuevas funciones: `getInstalAutoCounts()`, `getInstalManualQty()`, `getInstalMotorQty()`, `adjustInstal()`, `onInstalQtyInput()`, `resetInstalAuto()`, `esItemMotorizado()`.
- Nuevos campos guardados en docs: `instal_manual_qty`, `instal_motor_qty`. Los campos `instalacion` y `instalacion_units` siguen guardándose para compatibilidad.

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
