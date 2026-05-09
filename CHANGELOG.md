# Changelog

## V259 — 2026-05-07

### Mejoras a la planilla de confección

Después del feedback inicial:

**Bug visual: dobladillo y arrastre superpuestos en el SVG**

Cuando el `dob` o el `arr` eran chicos, las bandas de color se hacían muy delgadas y los labels se solapaban con la línea de piso. Fix:

- **Bandas con altura fija** (16px dobladillo, 22px arrastre) independientes del valor — siempre legibles.
- **Labels movidos a anotaciones laterales** a la izquierda del paño, con líneas de cota tipo plano técnico. Ya no se solapan con nada.
- **Línea de piso más visible** (gris medio, ancho 1.2px) para separar claramente las dos bandas.
- **Canvas SVG más ancho** (360 vs 320) para acomodar las anotaciones laterales.

**Datos importantes destacados**

- **"Total tela" → "Cantidad de metros a usar"** con número grande (38px) y debajo la fórmula del cálculo en cursiva: ej. `2.20 m (ancho) × 2 (frunce) = 4.40 m` o `1 pedazo × 2.50 m (alto+30 cm) = 4.40 m`.
- Reorganización del panel de datos: **grid 2×3 con 6 datos importantes**:
  - Frunce (número grande)
  - Cabezal
  - Ancho rollo
  - **Dobladillo** (con color naranja, ahora prominente)
  - **Arrastre** (con color verde, ahora prominente)
  - Pedazos
- **Tela** con su propio bloque oscuro abajo (span completo).
- Medidas terminadas se mantienen abajo como nota chica.
- Etiqueta de accionamiento bajo el SVG ahora con borde y fondo (más legible).

**Cómo funciona el cálculo de metros**

Si `alto ≤ 2600 mm` (entra en el ancho del rollo): `metros = ancho × frunce`. Ejemplo: 2200 × 2 = 4.4 m.
Si `alto > 2600 mm` (necesita pedazos): `metros = pedazos × (alto + 30 cm de desarrollo)`.

## V258 — 2026-05-07

### Mejoras

**Planilla de Confección — PDF separado para el confeccionista**

Hasta ahora la planilla de fabricación cubría solo cortinas Roller (corte de tela + corte de aluminio). Las cortinas de confección tradicional (Gasa de lino liviana, Blackout Tex) viajaban junto pero sin instrucciones específicas para el confeccionista — que en el taller suele ser una persona distinta de la que arma rollers.

V258 agrega una **planilla independiente de confección** que se imprime/exporta en su propio PDF.

#### Datos capturados al cotizar

Al cotizar una cortina de confección ahora se persisten en el item:

- `metrosTela` — metros lineales necesarios
- `anchoRollo` — ancho del rollo elegido (mm)
- `frunceReal` — factor de frunce calculado
- `frunceSolicitado` — factor de frunce ingresado
- `pedazos` — cantidad de pedazos a cortar
- `nombreTela` — código + nombre de la tela

#### Campo nuevo en el overlay de detalles técnicos

- **Cabezal**: Americano / Tablas encontradas / Bolsillo / Ojal (default Americano)
- Aparece solo en items de confección (`conf_liviana` / `conf_blackout`)
- Se guarda en `it.cabezal`
- No aparece en la cotización ni en el PDF de cotización

#### La planilla en sí

- **Header**: logo, número de pedido, cliente, fecha entrega, código de barras
- **Por cada cortina**:
  - **Dibujo SVG** de la cortina:
    - Apertura central: 2 paños con flechas apuntando hacia los lados
    - Un paño: 1 paño con flecha apuntando al lado de recogida
    - Cotas (ancho arriba, alto a la derecha)
    - Banda dobladillo (zona naranja con etiqueta)
    - Banda arrastre (zona debajo del piso, verde semi-transparente)
  - **TOTAL TELA destacado** (cuadro grande verde con los metros)
  - **Datos principales** (cuadrícula 2×2): Tela / Cabezal / Ancho rollo / Frunce
  - **Desglose secundario** (chico, abajo): medidas, pedazos, dobladillo, arrastre

#### Botones por pedido en la pestaña Fábrica

| Botón | Cuándo aparece |
|---|---|
| 📋 Planilla armado (Roller) | si el pedido tiene roller / motores / rieles |
| 🧵 Planilla confección (verde) | si el pedido tiene `conf_liviana` o `conf_blackout` |
| 🏷 Etiquetas | siempre |
| ✏️ Editar | siempre |
| ! Revisión | siempre |

Si el pedido tiene ambos tipos (roller + confección), aparecen los dos botones de planilla. Cada uno se puede imprimir como PDF independiente — útil porque cada planilla va a un confeccionista distinto.

### Notas técnicas

- Nuevo flag `_isPlanillaConf` (paralelo a `_isPlanilla`) para que el botón de imprimir maneje ambos.
- Nueva función `_svgCortinaConf(it)` que genera el SVG de la cortina con apertura, cotas, dobladillo y arrastre.
- `closeOverlay()` resetea ambos flags.
- `abrirDocFab` acepta nuevo `accion='planilla-conf'`.

## V257 — 2026-05-07

### Scanner: indicador visible y persistente

V256 dejó el ghost input dentro del viewport, pero seguía perdiendo el foco constantemente — el operario tenía que tocar el dot 🔍 antes de cada escaneo. Imposible de operar.

**Cambios para que NO haga falta tocar nada**:

- **`mousedown.preventDefault()`** en elementos no-interactivos: bloquea el cambio de foco que iOS aplica al tocar un botón/div, pero deja que el evento `click` siga disparándose. **Esta es la técnica clave**: el ghost ya no pierde foco al tocar tabs/botones.
- **Refocus inmediato en `blur`** del ghost: si algo logra robarle el foco, lo reclamamos en el próximo frame.
- **Indicador visible más prominente**: en vez de un dot chico, ahora es una pildorita en la esquina inferior derecha que muestra el estado:
  - 🟢 **Scanner activo** (verde) — el ghost tiene foco, todo OK
  - 🟡 **Tocá para activar** (amarillo) — el foco se perdió, tocá una vez para reactivar
  - ✓ **Procesado** (verde fuerte, 1.2s) — feedback visual de un scan exitoso
- Tocar el indicador hace `focus()` sincrónico durante el gesto.

### Sonido más triunfal al finalizar

El beep anterior era casi inaudible. Ahora hay 3 sonidos distintos según el evento:

- **Avance normal** (Pendiente → Fabricación): 2 tonos cortos ascendentes (E5 → B5).
- **Finalizado** 🎉: jingle triunfal de 4 tonos. Arpegio de Do mayor ascendente (C5-E5-G5-C6) con armónica en C7. Volumen incrementado y duración más larga para que se escuche claramente en un taller con ruido de fábrica.
- **Error**: beep grave (sin cambios).

Toast de finalizado también cambia el ícono de ✅ a 🎉.

## V256 — 2026-05-07

### Más fixes del scanner para iPad

V255 mejoró el scanner pero seguía sin funcionar sin tener un input focused. Investigando: iOS Safari rechaza `focus()` en elementos posicionados fuera del viewport (`left:-9999px`) y pierde el "user-activation context" cuando se hace focus en `setTimeout`.

**Cambios**:

- **Ghost input dentro del viewport**: posicionado en `top:0; left:0; width:1px; height:1px; opacity:0; pointer-events:none`. Sigue invisible pero iOS sí lo acepta para focus.
- **Focus sincrónico durante gestos**: los handlers de `pointerdown`/`touchstart`/`click` llaman `focus()` directamente, sin `setTimeout`. iOS solo permite el focus mientras todavía estamos en el contexto del gesto del usuario.
- **`tabIndex = 0`** en lugar de `-1`: algunos navegadores rechazan `focus()` en elementos con `tabindex=-1`.
- **Más eventos**: agregamos `touchend` y `visibilitychange` (refocus al volver de background).
- **Indicador clickeable**: el 🔍 chico en la esquina ahora es un botón. Si el scanner deja de funcionar, tocarlo "lo despierta" (`focus()` durante el tap).
- **Logging**: el ghost input loguea `[Scan] ghost FOCUSED` y `[Scan] ghost BLURRED` con info del elemento que tomó el foco. Útil para debuggear desde el inspector del iPad.

## V255 — 2026-05-07

### Fixes y mejoras del scanner

**Bug 1: no se podían cambiar estados manualmente en Fábrica**

Después de V254, el ghost input refocuseaba al hacer click en cualquier elemento que no fuera un campo de texto. Eso incluía los `<select>` que controlan el estado de los pedidos en la pestaña Fábrica → al tocarlos en iPad, el ghost les robaba el foco antes de que el picker nativo se abriera.

**Fix**: extender la lista de elementos que NO pierden foco para incluir `select`, `option`, y todos los inputs con picker nativo (`date`, `time`, `color`, etc.). El ghost respeta el foco mientras hay un picker abierto y vuelve a tomarlo después.

**Bug 2: el segundo escaneo no avanzaba a Finalizado**

Después de confirmar un scan, el ghost input no se refocusea automáticamente. Cualquier scan posterior se perdía si el foco estaba en un elemento sin captura de teclado.

**Fix**: refocusear el ghost input explícitamente después de cerrar el overlay de scan-confirm.

**Mejora: auto-confirmación tras 1 segundo**

El popup de confirmación ahora se confirma automáticamente después de 1 segundo. No hace falta tocar la pantalla. Si hay un error, el usuario lo corrige manualmente desde la lista (cambio de estado por el select).

- Si el doc ya está en estado terminal (Finalizado/Cancelado): el popup se auto-cierra tras 1.5s.
- Si llega un nuevo scan mientras hay un timer pendiente, el timer se reinicia con el nuevo doc.
- El botón "Avanzar" sigue visible y funcional por si el usuario quiere acelerar el confirm.

**Cleanup interno**:
- Nueva función `cerrarOverlayScan()` centraliza el cierre + reset + refocus del ghost (antes había código duplicado en el botón de cerrar y en confirmarScanAvance).
- En `confirmarScanAvance` se limpian referencias antes del `await` para evitar doble disparo si el usuario cliquea + auto-confirm casi simultáneamente.

## V254 — 2026-05-07

### Fix definitivo del scanner en iPad

V253 cambió `keypress` por `keydown`, pero el scanner seguía sin funcionar en iPad **excepto cuando había un campo de texto focused**. Eso es porque iPad/iOS solo dispara eventos de teclado en el elemento que tiene foco — no a nivel `document` como en desktop.

**Solución**: input fantasma siempre focused (canónico para iPad/iOS).

- **Input invisible** (1px, fuera de pantalla, opacidad 0) inyectado dinámicamente al body.
- **Auto-focus al cargar** y refocus automático en cualquier interacción del usuario que no sea sobre un campo de texto real.
- **Refocus inteligente**: solo cede el foco a campos de TEXTO reales (`text`, `textarea`, `search`, `email`, etc.). Botones, selects, checkboxes, divs → vuelven a poner foco en el ghost para que el scanner siga capturando.
- **Listeners triple**: `pointerdown` + `touchstart` + `click` (todos en captura) — máxima cobertura en iPad.
- **`inputmode="none"`**: suprime el teclado en pantalla del iPad.
- **Refocus periódico** cada 2 segundos como red de seguridad.
- **Indicador visual** chico (🔍) en la esquina inferior derecha. Click para forzar refocus si algo se desincroniza.

**Doble estrategia**:
1. **Input fantasma** (canónica iOS) — captura `input` + `keydown` del scanner.
2. **Listener global de keydown** (respaldo desktop) — sigue funcionando como antes.

Mantiene toda la lógica V253 (detección scanner vs humano por ritmo y patrón, auto-procesamiento sin Enter, etc.).

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
