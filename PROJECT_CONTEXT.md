# PROJECT_CONTEXT — RollerMotion

> **Este archivo es el "manual rápido" para retomar el proyecto.**
> Si sos un Claude nuevo entrando al chat: **leé esto y `CHANGELOG.md` antes de tocar nada**. Los cambios están todos commiteados con commits descriptivos en español.

---

## 🎯 ¿Qué es este proyecto?

**RollerMotion** es el sistema de gestión comercial para una fábrica de cortinas (rollers, bandas verticales, venecianas, cortinas tradicionales de tela).

Cubre: cotización, conversión a pedido, fabricación, scanner para tracking de estado, planillas de fabricación (roller + confección), catálogo de insumos editable, etiquetas, CRM básico de clientes, recibos, stock.

---

## 📁 Estructura del repo

```
~/Desktop/rollermotion/
├── index.html           ← TODA la app (HTML + CSS + JS en un archivo, ~10k líneas)
├── CHANGELOG.md         ← Historial detallado de cada versión (V247 a la actual)
├── PROJECT_CONTEXT.md   ← Este archivo
├── README.md            ← Descripción mínima
└── .gitignore
```

- **Repo Git**: `github.com/gastonpezzic-star/rollermotion`
- **Branch principal**: `main`
- **Autenticación**: macOS keychain (`osxkeychain` credential helper). Si `git push` falla, hay que reconfigurar credenciales.

---

## 🏗️ Stack y arquitectura

- **Frontend**: Vanilla JS + HTML + CSS en un solo archivo (`index.html`). Sin frameworks.
- **Backend**: Supabase (`_sb` variable global, definida arriba en el script).
- **Persistencia**:
  - **localStorage**: cache de documentos, configuración local (`rm_docs_local`, `rm_doc_flags`, `rm_insumos`, etc.)
  - **Supabase**: tablas `documentos` e `items`. Realtime sub que pushea cambios → recarga local.
- **Despliegue**: hosteado/probado en iPad (el dueño usa Safari iPad como dispositivo principal).

### Tablas Supabase

**`documentos`** — un row por cotización/pedido:
```
id, tipo (quote|order), numero, fecha, entrega, estado, vendedor_nombre,
cliente, cuit, direccion, obra, contacto, tel1, tel2, observaciones,
pago, tiempo_entrega, total, instalacion, instalacion_units,
corporativo, descuento (JSON), cotizacion_origen, created_at
```

**`items`** — items de cada doc:
```
id, documento_id, orden, tela, color, ancho, alto, cantidad, referencia,
sentido, zocalo, soporte, cadena, color_cadena, color_mecanismo,
lado_mecanismo, adicionales, colocacion, precio_unitario, eje,
corte_eje, corte_tela_a, corte_tela_h, frunce, dobladillo, arrastre,
accionamiento, insumo_id
```

> ⚠️ **Algunos campos nuevos no tienen columna en Supabase** y solo viven en localStorage:
> - Doc-level: `conf_recibida`, `roller_terminado` (flags de trazabilidad mixto). Guardados en `rm_doc_flags`.
> - Item-level: `metrosTela`, `anchoRollo`, `pedazos`, `nombreTela`, `celticTramos`, `motorId`, `cabezal`. Se pueden recalcular vía helpers, pero si se necesita persistencia cross-device hay que agregar columnas.

---

## 🗺️ Mapa del `index.html`

Las líneas son aproximadas — el archivo cambia con cada commit.

| Sección | Líneas | Qué hay |
|---|---|---|
| `<style>` CSS | 30 – 700 | Variables CSS, botones, tablas, badges, overlays, planilla styles |
| Login + topbar | 760 – 800 | UI top |
| Página Cotizaciones | 800 – 820 | Tabla cot + filtros + paginación |
| Página Pedidos | 825 – 850 | Tabla ped + filtros + paginación |
| Form cotización/pedido | 880 – 1200 | Selectores, items, instalación, descuentos |
| Página Fábrica | 1200 – 1300 | Tabla de pedidos en fabricación |
| Página Admin | 1290 – 1320 | Listado de docs admin |
| Página Clientes / Insumos / Stock | 1300 – 1700 | CRM, catálogo, stock |
| Overlay scan | 1760 – 1800 | Confirm de scan |
| **`TELAS` (catálogo de sistemas)** | **1860 – 2060** | Diccionario clave→config de cada producto que se puede cotizar |
| **`TELA_LABELS`** | **6940 – 6970** | Mapeo clave técnica → nombre humano |
| **`INSUMOS_DEFAULT` (catálogo precios)** | **2070 – 2230** | Precios lista de cada insumo (editables en panel) |
| **`TELAS_CONFECCION`** (Sirota) | **~1856** | Catálogo de telas tradicionales con cod, nombre, ancho rollo, precio |
| Auth + Supabase init | 2300 – 2400 | `_sb`, login, sesión |
| Data layer (getDocs, setDocs, save, load, normalize) | 2400 – 2700 | Persistencia |
| Form helpers (qaInit, qaTelaChange) | 2990 – 3300 | Setup del form según producto |
| **`qaCalcPrecio`** | **3400 – 3700** | Cálculo de precio en vivo |
| **`qaAgregar`** | **3900 – 4200** | Lógica final de agregar item al cotizar |
| `addRow` (renderiza item agregado) | 4200 – 4320 | Item en la tabla |
| `getItems` | 4330 – 4360 | Lee items del DOM |
| Instalación logic | 4400 – 4630 | Toggle, manual/motorizada, auto-calc |
| TIPOS_CON_INSTALACION, TIPOS_ROLLER, helpers | 4500 – 4550 | Constantes de clasificación de items |
| `saveDoc`, `buildDocFromForm` | 5170 – 5260 | Guardar doc |
| `editDoc`, `duplicateDoc`, `deleteDoc` | 5300 – 5400 | Operaciones sobre docs |
| `convertToOrder` (cotización → pedido + overlay detalles técnicos) | 5500 – 5650 | El overlay grande |
| `confirmarPedido` (state machine roller / conf / mixto) | 5760 – 5900 | Lógica de avance + flags |
| `renderRow` (filas de cot/ped/admin) | 5950 – 6030 | UI de fila |
| `renderCot`, `renderPed`, `renderAdmin`, `renderFab` | 6240 – 6400 | Renderers de listas + paginación |
| PDF de cotización (template inline) | 6970 – 7100 | El doc que ve el cliente |
| `openPlanilla` (Roller — corte tela + aluminio) | 7560 – 7900 | Planilla 📋 |
| `openPlanillaConfeccion` (con SVG) | 8190 – 8400 | Planilla 🧵 (PDF separado) |
| `_svgCortinaConf` | 8100 – 8190 | Dibujo SVG de la cortina (apertura, cotas, dobladillo) |
| `openEtiquetas` | 8420 – 8550 | Etiquetas por cortina/accesorio |
| **Scanner** | **8580 – 8800** | `initScanner`, ghost input, processScan, abrirScanConfirm, confirmarScanAvance |
| Recibos, descuento, corporativo | 8800 – 9000 | UI adicional |

---

## 🧠 Conceptos clave

### Catálogo de productos (`TELAS`)

Diccionario donde la **clave** es el id técnico (`'blackout'`, `'riel_motorizado_celtic'`, etc.) y el **valor** es la config:

```js
'blackout': {
  label: 'Roller Blackout',      // nombre humano
  grupo: 'Cortinas',              // optgroup en el dropdown
  tipo:  'cortina',               // determina el branch del cálculo
  colorLabel: 'Color',
  colors: [...]
}
```

**Tipos** (`tipo:`) que afectan el cálculo en `qaCalcPrecio` / `qaAgregar`:
- `cortina` — roller normal
- `confeccion` — cortinas tradicionales (gasa, blackout tex)
- `bandas` — bandas verticales
- `veneciana` — venecianas
- `rollerdoble` — doble
- `duozebra` — DUO Zebra
- `cambiotela` — cambio de tela (Roller o BV con `incluyeZoc:true/false`)
- `riel` — rieles (con `insumoId` para precio por ml, o `tieredPricing:true + tiers:[]` para precio por tramo como Celtic, o `motorOptions:[]` para Somfy)
- `accesorio` — items con `items:[]` (lista de cosas como cenefas, cadenas, etc.)
- `unitario` — items con precio fijo (motores)
- `libre` — producto personalizado

### Catálogo de precios (`INSUMOS_DEFAULT`)

Lista de insumos con `id`, `cat`, `subcat`, `nombre`, `precio`, `unidad`. Se cargan a `localStorage['rm_insumos']` la primera vez. Editables desde el panel de admin.

Funciones clave:
- `getPrecio(id)` — devuelve el precio actual del insumo (lee localStorage)
- `getFV()` — coeficiente de venta (IVA + tarjeta), editable
- `getCoefCuotas()` — coeficiente especial para algunos items unitarios

### `TELAS_CONFECCION` (catálogo Sirota)

Array de telas tradicionales con `cod` (ej: `"2941"`), `nombre`, `ancho` (en metros, ej: `2.2`), `precio` (m²). Usado al cotizar cortinas tradicionales — el cotizador busca por código en un modal y la selección se guarda en `window._telaSelData`.

### Estados de documentos

**Cotizaciones**: `Cotización → Enviada → Aprobada → Rechazada`

**Pedidos**: `Pendiente → Aprobado → En Fabricación → (Parcialmente terminado) → Finalizado` + `Necesita Revisión`, `Cancelado`

**Para pedidos mixtos** (roller + confección):
- `conf_recibida` (flag local): true cuando se escanea el código `-C` o se recibe del confeccionista
- `roller_terminado` (flag local): true cuando la parte roller pasa a Finalizado o Parcialmente terminado
- Estado **"Parcialmente terminado"** = al menos una parte hecha, la otra pendiente. Con tooltip que aclara cuál.

### Scanner

Captura barcodes de pedidos vía teclado HW (Bluetooth scanner en iPad). Usa un **ghost input invisible siempre focused** (canónico para iPad/iOS).

- Patrón aceptado: `PED-0184`, `PED'0184` (smart quote iOS), `PED0184`, `PED-0184-C`, `PED0184C`
- Sufijo `-C` = código de confección (marca conf_recibida)
- Auto-confirm tras 1s
- Sonido jingle al Finalizado

### Cotización de confección con cortinas altas

Cuando `alto > 2600mm`, la tela debe cortarse en **paños** (cantidad entera de pedazos del rollo). El sistema:
1. Calcula auto-paños (mínimo que cubra el frunce solicitado)
2. Muestra panel `qa-pano-options` con alternativas (1, 2, 3, 4… paños) para que el cotizador elija
3. `window._panoOverride` guarda la elección
4. Tolerancia 0.05 en el redondeo para no sumar paños extras por error decimal

---

## 🛠️ Convenciones

### Versionado
- Formato: `V###` (V247, V280, …)
- Cada cambio = 1 commit + entrada en CHANGELOG.md
- Mensaje commit en español, descriptivo (qué + por qué)

### Commits
```
V###: título corto

Bullets explicando qué y por qué.
Multi-línea si hace falta.

Co-Authored-By: ...  ← NO se agrega salvo que el usuario lo pida
```

### IDs en HTML
- `qa-XXX` → form de cotización (qa = quote add)
- `f-XXX` → form de doc en general (f-cli, f-fecha, etc.)
- `ped-XXX` → overlay de confirmación de pedido
- `scan-XXX` → overlay de scan
- `instal-XXX` → card de instalación

### Naming JS
- Variables/funciones: camelCase (`getInstalTotal`, `_panoOverride`)
- Constantes globales: UPPER_SNAKE (`TIPOS_ROLLER`, `PAGE_SIZE`)
- DB columns: snake_case (`fecha_inicio_fab`, `documento_id`)
- `normalizeDoc` / `normalizeItem` mapean entre los dos

### Acción del usuario que sea destructiva
- Confirmar con `confirm()` antes (ej. eliminar)
- Toast feedback visual al completar

---

## 🔁 Workflow para retomar / agregar features

1. **Leer el último commit + CHANGELOG.md** para entender el estado.
2. Si el usuario describe un problema/feature:
   - Hacer 2-3 búsquedas en el código (`grep`) para entender el área relevante
   - Presentar un plan corto con cambios concretos
   - Pedir OK
3. Implementar con `Edit` (preservando indentación exacta)
4. **Actualizar `CHANGELOG.md`** con la nueva versión (V###+1) explicando qué + por qué
5. `git add`, `git commit -m "V###: …"`, `git push origin main`
6. Avisar al usuario qué probar

---

## ⚠️ Cosas a recordar (gotchas)

- **El usuario opera en iPad**, así que cuidado con:
  - Focus management (scanner ghost input depende de esto)
  - Tap targets chicos
  - El teclado en pantalla aparece al focusear inputs no-readonly
- **El usuario no es dev**, explicar siempre en términos de negocio antes de detalles técnicos.
- **No saltarse el plan**: el usuario quiere ver qué se va a cambiar antes de tocar nada.
- **Cada cambio = un commit + push** (el usuario lo prueba en iPad después).
- **El CHANGELOG.md es para el usuario** — escribirlo en español, claro, con ejemplos.

---

## 📋 Pendientes conocidos (a la fecha de V280)

- **Columnas Supabase faltantes**: `metros_tela`, `pedazos`, `anchoRollo`, `conf_recibida`, `roller_terminado`, etc. Si se quieren persistir cross-device, hay que agregar al schema. SQL no escrito todavía.
- **Edit pedido existente (post-V251)**: el form ya no muestra los detalles técnicos (zócalo, sentido, etc.) inline. Para cambiar esos detalles en un pedido viejo hay que re-pasar por el overlay (no implementado, pendiente).
- **Pedidos viejos pre-V251** con `cadColor`/`mecColor` (vs nuevo `cadena`/`colorMec`): no se migran automáticamente. Recotizar es la solución actual.
- **Confecciones sin tela específica seleccionada**: el header de la planilla muestra "Gasa de lino" o "Blackout Tex" genérico. Es comportamiento esperado pero podría mejorarse.
- **Scanner en iPad**: funciona "casi siempre" automático tras V277, pero ocasionalmente puede perder foco. Si pasa: tocar la pantalla en zona neutra.

---

## 👤 Contacto

- Usuario: **Gaston Pezzic** (gastonpezzic@gmail.com)
- Comunicación: en español, tono cercano y práctico.
- Prefiere capturas + descripción para reportar bugs.
- Suele probar en iPad con scanner Bluetooth.

---

## 🚀 Cómo arrancar un chat nuevo

Pegale al Claude nuevo algo así:

> Estoy trabajando en RollerMotion (sistema gestión cortinas). Código en `~/Desktop/rollermotion/`, repo `github.com/gastonpezzic-star/rollermotion`. Estamos en versión V### (revisar último commit). Antes de hacer nada, leé `PROJECT_CONTEXT.md` y `CHANGELOG.md`. Después te cuento qué necesito.

Y listo, el Claude nuevo se pone al día en 30 segundos.
