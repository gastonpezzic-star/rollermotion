# Changelog

## V277 — 2026-05-07

### Fix: el auto-cálculo de paños subía de más con frunces "redondeados"

V276 arregló el recálculo en la planilla, pero faltaba el mismo fix en `qaCalcPrecio` y `qaAgregar`.

**Problema**: cuando el cotizador tipea un frunce que ya es un valor "limpio" (ej. 1.86 que es el frunce de 2 paños redondeado de 1.857), el sistema usaba `Math.ceil` así:

```
exactP = (2370 × 1.86) / 2200 = 2.0037
ceil(2.0037) = 3 paños  ❌
```

Y devolvía 3 paños = 10.47m, cuando lo correcto es 2 paños = 6.98m.

**Fix**: agregada **tolerancia de 0.05** al redondeo. Si el valor es "casi un entero" se usa ese entero como paños.

```
exactP = 2.0037
roundedP = round(2.0037) = 2
|2.0037 - 2| = 0.0037 < 0.05 → usar 2 paños ✓
```

También agregamos tolerancia de 0.01 al check `autoFR < frunce` para evitar disparar +1 paño por errores de redondeo simétricos.

**Casos cubiertos**:

| Frunce ingresado | Cálculo viejo (`ceil`) | Cálculo nuevo (con tolerancia) |
|---|---|---|
| 1.86 (= 2 paños) | 3 paños ❌ | 2 paños ✓ |
| 2.00 (necesita 3 paños) | 3 paños ✓ | 3 paños ✓ |
| 2.78 (= 3 paños) | 3 paños ✓ | 3 paños ✓ |
| 2.50 (necesita 3 paños) | 3 paños ✓ | 3 paños ✓ |

El comportamiento solo cambia cuando el frunce está "casi en un entero".

## V276 — 2026-05-07

### Fix: la planilla mostraba paños/metros equivocados cuando el cotizador elegía una opción no-auto

**Reportado**: en una cortina 2370 × 3190 mm (tela 2941, rollo 2.2m), el cotizador elegía la opción de "2 paños / frunce 1.86" en el panel V274, pero la planilla de confección luego mostraba **10.47 m** de tela (que corresponde a 3 paños, no a 2).

**Causa raíz**:

1. **Persistencia a Supabase incompleta**: los campos nuevos `metrosTela`, `pedazos`, `frunceReal` solo viven en localStorage. Cuando el realtime de Supabase pushea el doc de vuelta, esos campos se pierden (no hay columnas correspondientes).

2. **Fallback con `Math.ceil`**: al perder esos campos, la planilla recalcula los metros desde el `frunce` parseado del nombre. Pero usaba `ceil` para derivar paños, lo que da el siguiente entero cuando el frunce decimal redondeado deja resto. Ejemplo: `frunce=1.86 → ceil(2370 × 1.86 / 2200) = ceil(2.004) = 3 paños ❌` (correcto: 2 paños).

**Fixes aplicados**:

1. **`saveDocToSupabase`** ahora guarda `it.frunceReal` en la columna `frunce` de la tabla `items`. Antes el campo no se guardaba (porque addRow no lo seteaba como `frunce`, sino como `frunceReal`). Ahora la elección del cotizador se persiste.

2. **`normalizeItem`** mapea la columna `frunce` de Supabase también a `frunceReal` para que la planilla la encuentre tras el reload.

3. **Recálculo de fallback**: cambiado `Math.ceil` por `Math.round` para derivar `pedazos` del `frunceReal` saved. Esto da el resultado correcto incluso con el frunce redondeado a 2 decimales:
   - Antes: `ceil(2.004) = 3` ❌
   - Ahora: `round(2.004) = 2` ✓

**Pendiente (V277+)**: agregar columnas `metros_tela` y `pedazos` a la tabla `items` de Supabase para evitar cualquier recálculo (avísenme y armo el SQL).

## V275 — 2026-05-07

### Fix: el panel de opciones de paños quedaba visible tras agregar el item

V274 mostraba el panel "🪡 Opciones de corte de tela" para confección con alto > 2600mm, pero al agregar el item el panel seguía en pantalla con la elección del item anterior.

**Fix**: al agregar un item en `qaAgregar` se oculta `qa-pano-options` y se resetea `window._panoOverride`. Si el siguiente item necesita el panel, vuelve a aparecer recalculado.

## V274 — 2026-05-07

### Selector de paños en confección (cortinas altas)

**Problema**: cuando se cotiza una cortina de confección con `alto > 2600 mm`, la tela tiene que dividirse en **paños** (pedazos del rollo) que se cosen entre sí. El número entero de paños determina el frunce real, que casi nunca coincide exactamente con el solicitado.

Ejemplo: cortina 2370 × 3190 mm, frunce solicitado 2.0, rollo 2.9m:

| Paños | Cubre | Frunce real | Tela usada | Precio relativo |
|---|---|---|---|---|
| 1 | 2.9m | 1.22 | 3.49m | menor |
| 2 (auto) | 5.8m | 2.45 | 6.98m | medio |
| 3 | 8.7m | 3.67 | 10.47m | mayor |

Antes el sistema elegía automáticamente la mínima cantidad de paños que cubría el frunce solicitado (típicamente da un frunce **más alto** que el pedido). Ahora el cotizador puede **elegir entre las alternativas**.

### Cómo funciona

- Al cotizar confección con `alto > 2600 mm`, aparece debajo de los campos un panel amarillo "🪡 Opciones de corte de tela".
- Muestra una lista de opciones (botones tipo radio):
  - **AUTO** marca la opción que el sistema sugiere (mínima que cubre el frunce solicitado).
  - Cada opción muestra: cantidad de paños, frunce real, metros de tela, precio total.
- Click en cualquier opción → se aplica al instante y el precio se actualiza.
- Si bajás un paño, el frunce baja pero el precio también — útil cuando el cliente quiere ahorrar.
- Si subís un paño, el frunce queda más rico — útil si el cliente lo prefiere.

### Lógica

- Nuevo estado global `window._panoOverride` que guarda la elección manual.
- Se resetea al cambiar de TELA (volvés al sistema auto).
- Se mantiene mientras editás ancho/alto/frunce (el cotizador respeta tu elección).
- En `qaCalcPrecio` y `qaAgregar`: si hay override, se usa ese número de paños; si no, se aplica la lógica auto.
- El item guardado lleva `pedazos` y `frunceReal` exactos según la elección.

### Detalles UI

- Cada opción muestra: ícono radio + "N paños" + badge AUTO si aplica + frunce + metros + precio total.
- Filtra automáticamente combinaciones con frunce < 1.15 (descartadas por poco visuales).
- Texto al pie: "Cada paño cubre X.Xm de ancho de rollo. Más paños = más frunce + más tela + más costo."

## V273 — 2026-05-07

### Refinamiento de cotización: rieles y motores

**1. Cambio de tela Bandas Verticales: sin recargo**

Antes usaba el recargo 1.30 heredado de cambiotela Roller. Ahora `recargo:1.0` — mismo precio que cotizar una BV nueva, restando solo el riel. Fórmula: `m² × precio_tela × FV` (sin riel, sin zócalo).

**2. Motores Somfy WT y MV35 movidos a su propio grupo**

Antes estaban mezclados con los rieles en el grupo "Rieles". Ahora tienen su propio optgroup **"Motores Rieles"**.

Resultado: el grupo Rieles ahora solo tiene los 3 rieles:
- Riel Manual Aluminio
- Riel Motorizado Somfy
- Riel motorizado Celtic ®

Y los motores aparecen agrupados aparte:
- Motores (grupo) → Motores Tubulares
- Motores Rieles (grupo) → Motor Somfy WT, Motor Somfy Movelite 35 RTS

**3. Selector de motor en Riel Motorizado Somfy**

Al cotizar el Riel Motorizado Somfy, el formulario ahora pide elegir cuál motor usar. El costo del motor se **suma automáticamente** al precio del riel (un solo item con todo bundleado).

Opciones disponibles con descripción inline:

| Motor | Descripción |
|---|---|
| Motor Somfy WT | Mecánico a tecla · Adaptable a domótica externa |
| Motor Somfy Movelite 35 RTS | Control remoto |

- El cálculo: `(ancho × precio_riel/ml + precio_motor) × FV × cantidad`
- El motor seleccionado queda guardado en el item como `motorId` y `motorLabel` para trazabilidad.
- En la cotización el item aparece como "Blanco · Motor Somfy Movelite 35 RTS" (color + motor).

Nuevo campo `motorOptions` en TELAS para extensibilidad: cualquier TELA con `tipo:'riel'` puede declarar motores opcionales.

## V272 — 2026-05-07

### Reorganización de la lista de sistemas a cotizar

Antes los sistemas estaban dispersos en muchos grupos chicos. Ahora más limpio y agrupado por familia funcional.

**Grupos**:

| Grupo | Sistemas |
|---|---|
| **Cortinas** | Roller Blackout, Sunscreen 5/3/1%, Doble, DUO Zebra, Tradicional Liviana, Tradicional Blackout Tex, Bandas Verticales, Venecianas |
| **Cambio de tela** | Cambio de tela Roller, **Cambio de tela Bandas Verticales** (nuevo) |
| **Motores** | Motores Tubulares (antes en "Motores Tubulares" solo, ahora más corto) |
| **Rieles** | Riel Manual, Riel Motorizado Somfy, **Riel motorizado Celtic ®** (renombre marketinero), Motor Somfy WT, Motor Somfy MV35 |
| **Accesorios en aluminio** (nuevo) | Tubos, Ángulos, Ejes, Cenefas curvas (MAXI + SLIM) |
| **Accesorios generales** (renombrado) | Guías laterales, Cadenas, Contrapesos, Soportes, Controles, Cargadores |
| **Otro** | Producto libre |

### Cambios técnicos

- **Riel Celtic**: label cambió de "Riel Motorizado Celtic + Motor" a **"Riel motorizado Celtic ®"** (más marketinero). Aplica también en el overlay de detalles técnicos.
- **Cenefas separadas**: las cenefas (MAXI y SLIM) ya no están dentro del TELA `accesorios`; tienen su propia TELA `cenefas` con grupo "Accesorios en aluminio".
- **Cambio de tela Bandas Verticales nuevo**: TELA `cambiotela_bv` con el mismo `tipo:'cambiotela'` que el de Roller, pero usa items de bandas verticales (`bv_blackout`, `bv_screen5/3/1`) y **no incluye zócalo** (las BV no llevan zócalo). El campo nuevo `incluyeZoc` controla esto.
- **Tubos / Ángulos / Ejes** pasaron al grupo "Accesorios en aluminio".
- **Accesorios** (cadenas, soportes, controles, etc.) renombrado a "Accesorios generales".

## V271 — 2026-05-07

### Fix: UX del Riel Celtic idéntica al Somfy

El cotizado del Riel Celtic ya era automático (sin selector de tramos), pero estaba guardando "Combinación: 6m + 2m" pegado al color del item, dando la falsa impresión de que había configuración manual.

**Cambios**:

- **Color del item limpio**, igual que Somfy: solo "Blanco" o "Negro".
- **La combinación de tramos** se guarda en campos internos `celticTramos` y `celticAnchoM` del item — para fábrica y trazabilidad, no para mostrar al cliente.
- **Live preview** más conciso: `7.00m → 6m + 2m` (en vez del antiguo "Combinación: 6m + 2m").

La forma de cotizar es **idéntica al Somfy**: el usuario solo ingresa el ancho, el sistema calcula automáticamente. Para anchos > 6m, internamente combina tramos (6m + lo que falte), pero el cliente ve solo el precio final.

## V270 — 2026-05-07

### Nuevo sistema: Riel Motorizado Celtic + Motor

Alternativa al Somfy. Diferencia clave: precio por **tramo** (no por metro lineal).

**Precios de lista** (editables desde el panel de Insumos):

| Tramo | Precio lista |
|---|---|
| Hasta 2m | $815.000 |
| Hasta 3m | $840.000 |
| Hasta 4m | $921.600 |
| Hasta 6m | $1.140.000 |

Se le aplica el coeficiente FV (IVA + tarjeta) como al resto.

**Lógica de combinación para anchos > 6m**:

- 7m → 6m + 2m
- 8m → 6m + 2m
- 9m → 6m + 3m
- 12m → 6m + 6m
- 13m → 6m + 6m + 2m

El algoritmo siempre usa tramos de 6m al máximo y cubre el resto con el tramo más chico que entre.

**Ejemplos de cotización**:

| Ancho | Tramo(s) usados | Suma |
|---|---|---|
| 2.3m | 1 × 3m | $840.000 |
| 3.7m | 1 × 4m | $921.600 |
| 7m | 6m + 2m | $1.955.000 |

(El precio final es la suma × FV × cantidad.)

**Cambios técnicos**:

- 4 nuevos insumos en el catálogo: `riel_celtic_2m`, `_3m`, `_4m`, `_6m` (subcategoría "Motorizado Celtic"). `en_cotizador:false` porque no se pueden agregar como item suelto — siempre vienen como combinación según el ancho.
- Nueva TELA `riel_motorizado_celtic` con `tipo:'riel'` y `tieredPricing:true`, lista de `tiers`.
- Helper `_calcCelticPieces(anchoM, tiers)` que devuelve la combinación óptima.
- `qaAgregar` y `qaCalcPrecio` actualizados para detectar `tieredPricing` y aplicar lógica de tramos.
- El item guardado lleva en `color` la combinación usada (ej. "Blanco · Combinación: 6m + 2m") para que se vea en el PDF/cotización.
- **Cuenta como instalación motorizada** (agregado a `TIPOS_MOTORIZADOS`).
- Aparece en el overlay de detalles técnicos de fabricación junto con los otros rieles (preguntas: Apertura + Lado del motor).

## V269 — 2026-05-07

### Fix urgente: scanner no detectaba el código de confección

El patrón regex que decide si un buffer de teclas parece un scanner (`SCAN_PATTERN`) era:

```
/^[A-Z]+[\W_]?\d{3,}$/i
```

Esto matcheaba `PED-0184` pero **NO** `PED-0184-C` (el sufijo extra `-C` rompía el match al final). Resultado: el scanner descartaba el buffer antes de llegar a `processScan`, así que la nota de confección no se procesaba.

**Fix**: actualizado el patrón para aceptar el sufijo opcional de confección.

```
/^[A-Z]+[\W_]?\d{3,}(?:[\W_]?C)?$/i
```

Acepta todas estas formas (incluyendo cuando iOS convierte `-` en `'` por smart quotes):

- `PED-0184` ✓
- `PED'0184` ✓
- `PED0184` ✓
- `PED-0184-C` ✓ (nuevo)
- `PED'0184'C` ✓ (nuevo)
- `PED0184C` ✓ (nuevo)

La normalización dentro de `processScan` ya manejaba bien la detección del sufijo C — el problema era el filtro previo en `tryProcess` que ni siquiera dejaba llegar el código.

## V268 — 2026-05-07

### Ajustes a la planilla de confección

**Quitada la zona de arrastre del dibujo SVG**

El usuario reportó que se veía confusa la franja verde debajo del piso (era la zona de arrastre). El arrastre ya se incorpora a la "medida final de la cortina" (que ahora es `ancho × (alto + arrastre)`), así que mostrarla otra vez como banda visual era redundante.

- SVG queda más limpio: solo paño + dobladillo (banda naranja a la izquierda del paño).
- El dato del arrastre sigue saliendo en el tile correspondiente del grid de datos.
- Reducido el alto del SVG (380 → 300) y el padding inferior (70 → 40) ahora que no necesitamos espacio para la zona de arrastre.

**Ancho del rollo: lookup automático en catálogo Sirota**

Hasta ahora, items cotizados antes de V258 mostraban "—" en Ancho rollo porque ese dato no se persistía. V268 agrega un fallback que busca el código de tela en el catálogo `TELAS_CONFECCION` (la lista de Sirota con `cod`, `nombre`, `ancho`, `precio`).

- Nuevo helper `_anchoRolloMmFor(it)`:
  1. Si el item tiene `it.anchoRollo` guardado → lo usa.
  2. Si no, parsea el código (ej. `2746`) del inicio de `it.nombreTela` o `it.color`.
  3. Busca en `TELAS_CONFECCION` por código y devuelve `ancho × 1000` en mm.
- Resultado: ahora se muestra el ancho del rollo en metros (ej. `1.4 m` para Jaquard Tupungato, `2.9 m` para Gasa de Lino) aunque la cotización sea vieja.

**Layout más compacto para que entren varias cortinas por hoja**

- Card de cortina: padding 14→10, margin-bottom 14→10.
- SVG: 420×380 → 380×300.
- Grid del bloque: 440px → 390px de columna del SVG.
- Medida final: padding 14→10, font 32→26, line-height más ajustado.
- Datos grid: gap 8→6, padding tiles 9px→7px, fonts -2px.
- Tela: padding 9→7, fonts -1px.

Resultado: cada cortina ahora ocupa ~40% del alto de A4 (antes ~55%). Ya entran 2 cortinas cómodamente por hoja, y a veces 3 si son simples.

## V267 — 2026-05-07

### Mejora UX

**Tooltip al pasar el mouse sobre "Parcialmente terminado"**

El badge azul 🔄 Parcial ahora muestra el detalle específico al hacer hover, según los flags del doc:

- Si `conf_recibida=true` y roller sigue en proceso → **"Confección finalizada · Roller en fabricación"**
- Si `roller_terminado=true` y conf todavía no recibida → **"Roller finalizado · Confección en fabricación"**
- Otras combinaciones tienen sus mensajes específicos

Nuevo helper `getStatusHTMLForDoc(d)`:
- Para todos los estados que no son "Parcialmente terminado": devuelve el badge estático como antes.
- Para "Parcialmente terminado": construye un badge con `title="..."` (tooltip nativo del browser) + `cursor:help` para indicar que es hoverable.

Aplicado en:
- `renderRow` (Cotizaciones / Pedidos)
- Tablas en la ficha de cliente (cotizaciones e historial)
- `renderAdmin` mantiene el dropdown editable (no cambia)

En iPad/touch, mantenés el badge tapeable mostrando el tooltip al hacer tap-and-hold breve. En desktop con mouse, simplemente hover.

## V266 — 2026-05-07

### Planilla de confección

**Fixes**:

- **Medida final = ancho × (alto + arrastre)**. Antes solo ancho × alto. Si la cortina lleva 3 cm de arrastre, ahora la medida es `2250 × 2150 mm` (no `2250 × 2120 mm`). Esa es la medida real a confeccionar.
- **Label de "Dobladillo / Arrastre" se cortaba** en el SVG (las cotas laterales se salían del viewBox). Ampliado el `padX` de 50 → 90 y `viewBox` de 360 → 420 para que las etiquetas entren completas. Grid del bloque ahora 440px en lugar de 380px.

### Trazabilidad por tipo: roller vs confección (mixto)

**Nueva feature**: doble código de barras y sub-estados para pedidos que tienen tanto roller como confección tradicional.

**Cómo funciona**:

- Cada pedido tiene **dos códigos**:
  - `PED-XXXX` → en la planilla roller. Tracking del armado interno.
  - `PED-XXXX-C` → en la planilla confección. Tracking de la devolución del confeccionista tercerizado.
- El scanner detecta automáticamente el sufijo `-C` y aplica la lógica correspondiente.
- Nuevo estado: **"Parcialmente terminado"** (badge azul 🔄 Parcial).

**Lógica de estados al escanear**:

| Pedido | Scan | Estado resultante |
|---|---|---|
| Solo roller | `PED-XXXX` | Pendiente → En Fabricación → Finalizado |
| Solo confección | `PED-XXXX-C` (o principal) | Pendiente → **Finalizado** (1 scan, llegó del confeccionista) |
| Mixto, primero roller | `PED-XXXX` (segundo scan) | En Fabricación → **Parcialmente terminado** (espera conf) |
| Mixto, después confección llega | `PED-XXXX-C` | Parcialmente terminado → **Finalizado** |
| Mixto, primero confección llega | `PED-XXXX-C` | Pendiente → **Parcialmente terminado** (espera roller) |
| Mixto, luego roller termina | `PED-XXXX` | Parcialmente terminado → **Finalizado** |

**Flags nuevos por doc**:
- `conf_recibida` (boolean): set true al escanear el código `-C`
- `roller_terminado` (boolean): set true cuando la parte roller pasa a "Parcialmente terminado" o "Finalizado"

Estos flags se guardan en **localStorage independiente** (`rm_doc_flags`) porque la tabla `documentos` de Supabase no tiene esas columnas. Si querés sync entre dispositivos para esos campos, hay que agregar las columnas `conf_recibida` y `roller_terminado` a la tabla (avisame y armo el SQL).

**UI del overlay de scan**:
- Si es un código `-C`, muestra un badge "🧵 CÓDIGO CONFECCIÓN".
- Mensajes específicos por situación:
  - "Confección recibida (falta roller)"
  - "Pedido finalizado"
  - Errores: "Pedido ya está Finalizado", "Falta recibir la confección (escaneá el código -C)", etc.
- Auto-confirm en 1s como antes.

**Status options actualizados**:
- "Parcialmente terminado" agregado al dropdown de cambio de estado en Fábrica/Admin.

## V265 — 2026-05-07

### Mejoras a la planilla de confección

Después del segundo feedback:

**Cambio de jerarquía**: lo más importante para el confeccionista es la **medida final de la cortina**, no los metros de tela.

- **Tile destacado arriba** ahora muestra "MEDIDA FINAL DE LA CORTINA" → ancho × alto en mm (ej. `2250 × 2120 mm`).
- **Antiguo tile "Pedazos"** reemplazado por **"Metros de tela"** (color amarillo) con subtítulo "a pedir / usar" — el dato que el confeccionista necesita saber para pedir/usar la tela.
- La fórmula del cálculo de metros sigue debajo del grid como texto chico en cursiva.

**Ancho del rollo en metros**

- Antes mostraba en mm (`2900 mm`). Ahora en metros con 1 decimal (`2.9 m`) — coincide con el formato del catálogo Sirota.

**Recálculo on-the-fly para items viejos**

Cotizaciones/pedidos hechos antes de V258 no tenían guardados `metrosTela`, `anchoRollo`, `frunceReal`. Antes mostraban "—". Ahora:

- **Frunce**: se parsea del string `it.color` que tiene "Frunce: 2.00".
- **Metros de tela**: si no estaba guardado, se recalcula:
  - Si `alto ≤ 2600 mm`: `(ancho/1000) × frunce`
  - Si `alto > 2600 mm`: `pedazos × (alto+30cm de desarrollo)` (asumiendo rollo 2.9m si no hay dato)
- **Ancho rollo**: si no estaba guardado, muestra "—" (no asumimos default — el confeccionista lo verá faltante y consultará).

**Limpieza**: quitada la línea "Medidas terminadas: …" al pie (ahora redundante con el tile destacado arriba).

## V264 — 2026-05-07

### Fixes y mejoras

**Bug 1: drag-and-drop de items no funcionaba**

V261 agregó `preventFocusShift` con `mousedown.preventDefault()` para mantener el foco del scanner. Eso bloqueaba sin querer el inicio del drag (los handlers de drag necesitan que el mousedown procese su default).

**Fix**: `preventFocusShift` ahora respeta elementos con `draggable="true"` (o descendientes) y no prevee el default cuando se interactúa con uno.

**Feature 2: campo Soporte en el overlay de fabricación**

Para cortinas Roller (Blackout y Sunscreen 1/3/5%) y Roller Doble ahora se pregunta el tipo de soporte al pasar a fabricación.

- Opciones: **Corto / Largo / Doble / Intermedio**
- Default inteligente:
  - Roller Doble → "Doble" preseleccionado
  - Demás rollers → "Largo" como default neutro
- Se guarda en `it.soporte` (compatible con lo que ya leía la planilla).
- Layout del overlay: pasó de 5 columnas a 2 filas × 3 columnas para acomodar el campo nuevo sin que queden muy angostas.

**Feature 3: click en cualquier parte de la fila abre el doc**

En las listas de Cotizaciones, Pedidos y Administración, ahora se puede tocar **cualquier parte de la fila** (no solo el ícono 👁) para abrir el documento.

- Helper `rowOpenDoc(ev, id)` que detecta si el click fue sobre un control (botón, select, input, link, dropdown) y en ese caso deja pasar el evento normal.
- Si fue sobre una zona "neutra" de la fila (número, fecha, cliente, vendedor, etc.) → abre el doc.
- Cursor cambia a `pointer` en la fila para que se vea que es clickeable.
- Aplicado en `renderRow` (cotizaciones/pedidos) y `renderAdmin` (panel de admin).

**Roller Doble incluido en `TIPOS_ROLLER`**

Antes los items de "Roller Doble" (`rollerdoble`/`doble`) no aparecían en el overlay de detalles técnicos. Ahora sí, junto con los demás rollers. Nueva función `isRollerDoble(tela)` para detectar el caso especial.

## V263 — 2026-05-07

### UX

**Indicador visual del scanner removido**

Con V262 el scanner funciona automático y sin abrir el teclado en pantalla del iPad. El indicador "🔍 Scanner / Tocá para activar" en la topbar dejó de tener sentido — era clutter visual.

- Removido el botón indicador de la topbar.
- Removidas las funciones `setIndState`, `syncIndicator`, `isScannerReady`, `_scannerFlashSuccess` (la lógica de estado visual).
- **Toda la lógica de captura del scanner se mantiene intacta**: ghost input readonly, body focusable, doble red, refocus agresivo cada 700ms, listeners en window, etc.
- Las llamadas a `_scannerFlashSuccess()` que quedaban en `confirmarScanAvance` etc. tienen check `typeof === 'function'` y simplemente son no-ops ahora.

**Beep + toast** se mantienen como feedback de un scan exitoso (sonido jingle al finalizar, toast verde, etc.).

Si en algún momento querés volver a ver el indicador (debug, problemas), avisame y lo agregamos como dot chico de diagnóstico.

## V262 — 2026-05-07

### Scanner iPad — readonly suprime el teclado en pantalla

En V261 saqué `inputmode="none"` porque podía estar bloqueando el teclado HW. Resultado: el ghost input recibía foco pero iOS **abría el teclado en pantalla**, molesto al operario.

V262 aplica el patrón canónico que usan apps POS en iOS: **input con `readonly`**.

**Cómo funciona**:

- `readonly` significa "no se puede editar" → iOS NO abre el teclado en pantalla.
- PERO el elemento sigue siendo **focusable**, y los teclados de hardware (Bluetooth scanners) siguen disparando eventos `keydown` cuando está enfocado.
- Solo se bloquea la edición por software, no la captura de eventos.

**Cambios**:

- Ghost input: `readonly = true` + `inputmode="none"` (doble seguridad para suprimir teclado en pantalla).
- Quité el listener del evento `input` (con readonly nunca se dispara — el valor no cambia). Toda la captura ocurre vía `keydown`.
- Mantiene la doble red de V261: ghost input + body como respaldos para capturar keydowns.

### Resultado esperado

- ❌ Sin teclado en pantalla nunca.
- ✅ Scanner captura sin necesidad de tocar el indicador.
- ✅ Tap manual en el indicador sigue siendo backup por si iOS rechaza el focus.

## V261 — 2026-05-07

### Scanner: intento de "siempre activo" sin tocar nada

El indicador "tocá para activar" hacía que el operario tuviera que tocar antes de cada escaneo, lo cual rompe el flujo en taller. En desktop el scanner funciona sin tocar nada porque los `keydown` se disparan a nivel `document` aún sin un elemento con foco — en iPad esto no pasa, los eventos solo se disparan en el elemento focused.

V261 implementa **doble red de captura** para que el scanner ande automático en iPad sin requerir interacción:

**1. Body como respaldo del ghost input**

- `<body tabindex="-1">` lo hace focusable. Ahora si iOS rechaza el focus al ghost, hacemos focus al body — body también dispara `keydown`.
- Cuando el body tiene foco, los keydowns de scanner se capturan vía nuestro listener global de document.
- El indicador se muestra "🔍 Scanner" cuando ghost O body están con foco (no solo ghost).

**2. Cambios en el ghost input para mejor compatibilidad iOS**

- **Sin `inputmode="none"`**: podía estar bloqueando el input desde teclado HW de iPad.
- **Sin `pointer-events:none`**: iOS lo trataba como "no-interactivo" y le rechazaba el foco.
- Tamaño levemente mayor (2px en vez de 1px) — iOS respeta más los elementos con dimensión positiva.

**3. Refocus más agresivo**

- Periódico cada **700ms** (antes 2 segundos).
- Tras `scroll` (iOS a veces blurea durante scroll) — debounce 150ms.
- Tras `visibilitychange` (cambio de pestaña / lock screen).
- Listener de keydown adicional en `window` (algunos browsers iOS lo disparan ahí).

**4. Indicador más realista**

- Estado se calcula con `focusin`/`focusout` a nivel document (no solo eventos del ghost).
- Verde si ghost o body tienen foco. Amarillo solo si es algo no-textual que se quedó con foco.

### Si aún no anda 100%

iOS Safari es restrictivo con focus en elementos invisibles. Si después de V261 sigue requiriendo tap ocasional:

- **Recomendación**: instalar la app como PWA (Safari → Compartir → "Añadir a pantalla de inicio"). En modo PWA iOS es más permisivo con el focus.
- Como respaldo, el indicador 🔍 sigue siendo tappable para reactivar manualmente.

## V260 — 2026-05-07

### UX

**Indicador del scanner movido a la topbar**

El indicador "🔍 Scanner / Tocá para activar" estaba en la esquina inferior derecha como un botón flotante (`position:fixed`). Eso lo hacía solaparse con el botón "💾 Guardar" y "👁 Vista previa" del formulario de cotización/pedido.

Ahora se ubica **dentro de la topbar**, al lado del indicador de sincronización (`#sync-indicator`). Más visible (siempre presente arriba), no tapa nada y agrupado lógicamente con el otro indicador de estado.

- Estilos adaptados al tamaño de la topbar (26px de alto, font 10.5px).
- Texto más corto: "🔍 Scanner" cuando activo (en vez de "🔍 Scanner activo").
- `MutationObserver` espera a que `.topbar-right` exista en el DOM antes de insertar (por si el script corre antes que el HTML).

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
