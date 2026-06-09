# Changelog

## V343 — 2026-06-09 — Eje 50 reforzado: límite extendido (corte de eje máx 3700)

El eje 50R ahora llega más ancho antes de pasar a 70mm, tomando como límite real el **corte de eje (máx 3700mm, que es el largo del tubo)**:
- **Motorizada:** hasta **3735mm** de ancho (el eje descuenta 35 → corta 3700). Arriba, 70mm.
- **Manual:** hasta **3730mm** (el eje descuenta 30 → corta 3700). Arriba, requiere motor.

Antes el corte era a 3700 fijo y >3700 saltaba a 70mm (a una motorizada de 3740 le daba el corte de 70mm = 3675, que estaba mal). Se ajustaron todos los puntos coherentemente: selección de eje en la planilla, costo del eje, mecanismo manual (VTX30) y la alerta de "requiere motorización" (recién arriba de 3730). Verificado: 3735 motor y 3730 manual cortan el eje exactamente en 3700.

## V342 — 2026-06-05 — Barrales: nombre "de aluminio" + selección de color

Ajustes al producto de barrales (V341):
- Renombrado a **"Barral de aluminio"** (y "Terminal/Soporte/Argolla de barral") — se sacó el `1"`. Aplica también a la lista de precios (con migración para quienes ya lo tenían).
- **Ahora se elige el color (Blanco/Negro)** del barral y de cada accesorio. (Antes no aparecía el selector porque se usó `colorOptions` a nivel grupo, que `onAccesorioChange` ocultaba; se pasó a `variantes` por ítem, que es el mecanismo correcto.)

## V341 — 2026-06-05 — Nuevo producto: Barrales 1" (con accesorios agrupados)

Se agregó en **Accesorios en aluminio** un único item **"Barrales 1""** que adentro tiene todo el set (para no llenar el desplegable):
- **Barral 1"** — se cobra **por metro** (la medida se carga en mm), color **Blanco o Negro**. Precio de lista $28.072/m.
- **Terminal de barral 1"** — por unidad, $9.922 c/u.
- **Soporte de barral 1"** — por unidad, $8.470 c/u.
- **Argolla para barral 1"** — por unidad, $1.863 c/u.

Los precios quedan en la **lista de precios** (categoría "Barrales"), así que se pueden editar y entran en el aumento por % como cualquier otro. El precio de venta se calcula con el markup de siempre.

## V340 — 2026-06-05 — Toasts: sin ícono duplicado

El toast nuevo (V333) ya muestra su propio ícono en círculo (✓/✕/i). Pero los mensajes también traían un emoji al principio ("⚠ Ingresá…", "✅ Guardado…"), así que quedaban **dos íconos**. Ahora el toast **quita automáticamente el emoji inicial** del texto, dejándolo prolijo (solo el círculo). Centralizado: no hubo que tocar las 150+ llamadas. Respeta `$`, `¡`, números y texto normal.

## V339 — 2026-06-05 — Popup de bienvenida: vuelta al diseño cálido

Se revirtió el popup al **diseño cálido original** (banda dorada/roja arriba, logo real, "BIENVENIDO/A A ROLLERMOTION" en dorado) por preferencia del usuario. La mecánica se mantiene: aparece con animación al primer ingreso y no vuelve a salir.

## V338 — 2026-06-05 — Popup de bienvenida: nuevo diseño "Hero oscuro"

Rediseño del popup de bienvenida (elegido entre 3 variantes). Ahora tiene una **banda superior negra** con el nombre **Roller·Motion** (·Motion en dorado), un separador dorado, el saludo grande en blanco y "Qué bueno tenerte acá"; debajo, cuerpo blanco con el mensaje personalizado, el consejo de cambiar la contraseña y el botón dorado. Más premium como primera impresión. Mantiene la personalización por nombre y rol, y la lógica de mostrarse una sola vez.

## V337 — 2026-06-05 — Popup de bienvenida para usuarios nuevos

La primera vez que un usuario nuevo (distribuidor o vendedor) inicia sesión, aparece un **popup cálido de bienvenida**: logo, saludo personalizado con su nombre, una frase linda según su rol (a los distribuidores les menciona su cuenta corriente) y un **consejo para cambiar la contraseña** (arriba a la derecha → Mi Perfil).

- Se muestra **una sola vez** por usuario (queda guardado en su navegador). Después no vuelve a aparecer.
- El **admin (dueño) no lo ve**.
- Reutiliza el blur + animación de modal (V335). Se cierra con "¡Empecemos!", la X de fondo, y queda con salida animada.

## V336 — 2026-06-05 — Seguridad: escapado anti-XSS + headers en Netlify

Endurecimiento de seguridad (parte 1).

- **Anti-XSS**: se agregó una función `esc()` que escapa el HTML de los datos del usuario al mostrarlos. Antes, un dato malicioso (ej. un nombre de cliente con código) podía ejecutarse en el navegador de quien lo viera. Ahora se muestra como texto. Cubre las superficies principales: nombre de cliente (en todas las listas, detalle y recibos), observaciones, dirección, obra, vendedor, referencia y color de ítems, y los campos de la ficha de cliente y de recibos (66 puntos). Verificado en navegador: un payload de prueba se muestra como texto y no se ejecuta.
- **Headers de seguridad en Netlify** (`_headers`): `X-Frame-Options: DENY` (anti-clickjacking), `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS.
- Pendiente (parte 2): escapar el teléfono dentro del link de WhatsApp (contexto JS), barrer planillas/PDF internos, y endurecer Auth de Supabase (settings del panel).

## V335 — 2026-06-05 — Modales: blur real en Safari + salida animada (cierra el set de animaciones)

Cierre del pulido de movimiento (emil-design-eng).

- **Fondo esmerilado (blur) ahora funciona en Safari/iPad**: el `.overlay` tenía `backdrop-filter:blur` pero sin el prefijo `-webkit-`, así que en Safari no se veía. Se agregó el prefijo (y se subió a 4px). En iPad/Mac ahora se ve el lindo desenfoque detrás del modal.
- **Salida animada del modal principal** (Mi Perfil, Recibos, Planillas, detalle de pedido/cotización): al cerrarlo, el modal baja un toque y se desvanece, en vez de desaparecer de golpe. Con fallback de seguridad para que nunca quede trabado. Verificado: tras la animación el modal queda oculto y limpio.
- Respeta "reducir movimiento" (cierre instantáneo).

Con esto quedan los 4: toasts apilables (V333), transición de página + filas (V334) y modales (V335).

## V334 — 2026-06-05 — Transición de página + filas que entran escalonadas

Más pulido de movimiento (emil-design-eng), con CSS nativo.

- **Cambio de pestaña/página**: al navegar (Inicio → Cotizaciones → Pedidos…) la página entra con un **fade suave** (.18 s) en vez del corte seco. Se hizo solo con opacidad (sin desplazamiento) a propósito, para no romper la barra inferior fija del formulario.
- **Filas de las listas**: al entrar a Cotizaciones, Pedidos, Fábrica, Clientes o Administración, las primeras filas **aparecen en cascada** (stagger de 30 ms por fila, las primeras 12). 
- Importante: el stagger se dispara **solo al navegar**, no al tipear en el buscador (filtrar re-renderiza al instante, sin animación molesta).
- Respeta "reducir movimiento".

## V333 — 2026-06-05 — Toasts apilables estilo Sonner

Los avisos (toasts) ahora se **apilan**: pueden aparecer varios a la vez (hasta 4) en la esquina inferior derecha, en vez de pisarse uno al otro como antes. Cada uno entra deslizándose con un leve escalado, el stack se reacomoda suave cuando entra o sale uno, y al salir se colapsa el espacio (no salta).

- Ícono según tipo (✓ ok · ✕ error · ℹ info) en un círculo translúcido, color de fondo por tipo.
- **Se pueden cerrar con un clic**. Los errores duran más (5 s) que las confirmaciones (3 s) para dar tiempo a leer.
- Respeta "reducir movimiento" y se adapta a pantallas chicas (iPad/celular).
- Mismo `toast(msg, tipo)` de siempre, así las 150+ llamadas de la app funcionan sin tocar nada.

## V332 — 2026-06-05 — FIX CRÍTICO: editar medidas multiplicaba la cantidad de cortinas

Al vincular una cotización y **editar el ancho/alto** de un pedido, al guardar se generaban muchísimas cortinas iguales (ej: ancho 1200 → 1200 unidades). Causa: los inputs de ancho/alto (agregados en V327) quedaron *antes* del input de cantidad en la fila, y 6 funciones leían la cantidad como "el primer `input[type=number]` de la fila" → tomaban el ancho como cantidad.

Fix: el input de cantidad ahora tiene la clase `.it-cant` y las 6 funciones (total, getItems, instalación, descuentos, bruto) leen específicamente esa clase. Verificado en navegador: una cortina 1200×1200 con cantidad 1 ahora guarda **1 unidad** (antes 1200).

**Importante:** si quedó algún pedido mal generado con cientos de cortinas, hay que eliminarlo a mano.

## V331 — 2026-06-05 — Animaciones con criterio (menú ⋮ + toast) — estilo Sonner/Emil

Pulido visual aplicando el criterio de animación de Emil Kowalski (el autor de Sonner), con CSS nativo (sin librerías).

- **Menú de acciones (⋮)**: ahora **entra con animación** — escala desde la esquina del botón (origin-aware), 150 ms, curva ease-out fuerte. Antes aparecía de golpe. Sombra en capas + esquinas un poco más suaves para un look más sólido. Cada ítem hace una transición suave al pasar el mouse.
- **Toast (avisos)**: movimiento más fino — sube apenas con un leve escalado en vez del salto brusco anterior, anima solo `transform`/`opacity` (más fluido), sombra en capas.
- Respeta el ajuste del sistema **"reducir movimiento"** (accesibilidad).
- El feedback de pulsado en botones (scale .97) ya existía de antes.

## V330 — 2026-06-04 — Distribuidores: instalación NO incluida por defecto

Cuando un **distribuidor** inicia una cotización/pedido, el servicio de **instalación arranca apagado** (ellos instalan). El toggle sigue disponible: si en un caso puntual la necesitan, la activan a mano. Para admin y vendedores no cambia nada (sigue incluida por defecto). Al editar un documento existente se respeta lo que ya tenía guardado.

## V329 — 2026-06-04 — Fix: el botón "Vincular con cotización" no aparecía

En **Nuevo Pedido** el botón no se mostraba. Causa: el contenedor usa solo la clase `.pedido-only` y la regla CSS `.pedido-only{display:none}` ganaba cuando el toggle le ponía `display:''` (los demás campos `pedido-only` se ven porque además tienen `.f{display:flex}`, declarada después). Fix: se fija el `display` explícito del botón (block para pedidos, none para cotizaciones) en `resetForm` y `editDoc`. Verificado en navegador.

## V328 — 2026-06-04 — Cobros manuales en la cuenta corriente del distribuidor

En la cuenta corriente de cada distribuidor, además de **＋ Pago** (crédito) ahora hay **＋ Cobro** (débito manual): un cargo ad-hoc **sin pedido**, para cosas que se piden rápido en mostrador (ej: una cinta de papel) y no tienen presupuesto.

- Mismo formulario (monto · concepto · fecha), dos botones: **Pago** (verde, baja el saldo) y **Cobro** (rojo, sube el saldo). Leyenda aclaratoria debajo.
- El **cobro pide concepto** y confirma antes de cargar (aumenta lo que adeuda).
- Va sin `pedido_id`, así se distingue del débito automático de un pedido. **Se puede eliminar** desde el ledger (los débitos automáticos de pedidos no, esos se revierten cancelando el pedido).
- Los inputs se limpian tras cada carga (evita cargar dos veces lo mismo).
- **Sin SQL nuevo** (la tabla ya admite `tipo='debito'` y la policy de admin ya permite insertarlo).

## V327 — 2026-06-04 — Vincular un pedido a una cotización (medidas editables)

Al crear un **Nuevo Pedido**, debajo del N° aparece **"🔗 Vincular con cotización"**: abre un buscador (por número o cliente), trae todos los datos de la cotización al formulario y **te deja editarlos**. Pensado para cuando el cliente, antes de fabricar, pide unos centímetros más de ancho: se ajusta la medida sin recotizar.

- **Medidas (ancho/alto) editables inline** en los pedidos: cada fila tiene los mm en un input. Al cambiarlos **no cambia el precio** (cm de cortesía) pero **sí se recalculan los cortes** de fabricación (eje, corte de eje, corte de tela y caída).
- El pedido queda **vinculado** a la cotización (badge "🔗 Vinculado a COT-…" en el form) y muestra **"Cotización: COT-…"** en la nota de pedido para trazabilidad.
- El número de pedido se deriva de la cotización (PED-…), igual que la conversión normal.
- Sin SQL nuevo.

## V326 — 2026-06-04 — Alta de distribuidores/vendedores desde el panel (sin SQL)

En Administración → Vendedores y distribuidores, botón **"＋ Nueva cuenta"**: nombre, email, contraseña y rol (distribuidor / vendedor) → crea la cuenta y queda lista para cargarle descuentos. Sin tocar Supabase, sin Edge Function.

- Crea el usuario de Auth con un cliente temporal (`persistSession:false`) para **no cerrar la sesión del admin**, y el perfil lo inserta el admin.
- Muestra usuario + contraseña al final para pasárselos al distribuidor.

### Base de datos (correr una vez)
```sql
drop policy if exists "Admin crea perfiles" on profiles;
create policy "Admin crea perfiles" on profiles for insert to authenticated with check (is_admin());
```
(Sin esto, la creación del perfil falla con error de permisos.)

## V325 — 2026-06-04 — Zócalo distribuidor compacto + leyenda centrada

El footer de la cotización distribuidor queda más compacto (menos alto) y la leyenda "válida solo para distribuidores autorizados" pasa a estar centrada y sutil (fuera del recuadro).

## V324 — 2026-06-04 — Cotización en formato distribuidor (integrada)

Cuando un documento es de un **distribuidor**, la cotización/pedido sale en un formato reducido y elegante:

- **Igual que la de cliente** (logo real, banda dorada, tipografías de siempre, tabla negra) pero **sin** forma de pago, **sin** el bloque de cuotas/Efectivo/Transferencia y **sin** el botón de WhatsApp.
- **Footer nuevo (B1)**: tarjeta crema con el logo, con profundidad (sombra en capas + glow naranja leve), y "Villa Adelina, Buenos Aires" en su propia línea.
- Tag **"Cotización · Distribuidor"** en el encabezado + nota: *"Esta cotización es únicamente válida para distribuidores autorizados, no para clientes finales."*
- Detección: `esDocDistribuidor()` (el distribuidor viendo lo suyo, o el admin viendo un doc de distribuidor — se cargan los distribuidores al entrar como admin).
- El **"› ver"** de la cuenta corriente ahora abre este mismo formato (unificado), con su botón de Imprimir / PDF.

Las cotizaciones de clientes normales quedan **exactamente igual**.

## V323 — 2026-06-04 — Presupuesto distribuidor (vista + PDF) desde la cuenta corriente

Cada **débito** de la cuenta corriente (un pedido aprobado) ahora tiene un link **"› ver"**: abre una ventana **limpia** con el pedido a **precios de distribuidor** — producto, medidas, cantidad, precio unitario y subtotal + total — exportable a **PDF** (botón Imprimir / Guardar PDF). Sin tarjeta, sin WhatsApp, sin cuotas.

- Funciona para el **admin** (en el panel de Administración) y para el **distribuidor** (en su "Mi cuenta").
- Para distribuidores reales el pedido ya está a precio distribuidor. (El modo comisionista de Agustín — recálculo de costo + referencia cliente/costo/comisión — es el paso 2.)

### Base de datos (importante)
El check constraint de `profiles.rol` no permitía `'distribuidor'`. Hay que actualizarlo:
```sql
alter table profiles drop constraint if exists profiles_rol_check;
alter table profiles add constraint profiles_rol_check check (rol in ('admin','fabrica','vendedor','distribuidor'));
```

## V322 — 2026-06-03 — El panel lista todas las cuentas (vendedores y distribuidores)

El desplegable del panel (en Administración) vuelve a listar **todas las cuentas** (vendedores y distribuidores), no solo distribuidores — como el panel de descuentos original. Al elegir cualquiera se ve todo: stats + descuentos + cuenta corriente. Cada opción muestra el rol al lado del nombre.

## V321 — 2026-06-03 — El panel de Distribuidores vuelve a Administración

El panel unificado de distribuidores (desplegable → mini-dashboard + cuenta corriente + descuentos) vuelve a estar **dentro de la pestaña Administración**, como se venía trabajando. Se quitó la pestaña separada "Distribuidores".

- Administración ahora tiene: stats + Exportar Excel + editar etiqueta + el panel de Distribuidores.
- El desplegable lista solo cuentas con rol distribuidor.

## V320 — 2026-06-03 — Panel unificado de Distribuidores (diseño Apple Business)

Se unifica todo lo del distribuidor en una sola pestaña **"👥 Distribuidores"** (admin), con un desplegable para elegir distribuidor y ver todo junto, con un diseño limpio tipo Apple:

- **Mini-dashboard** del distribuidor: saldo actual, total facturado, cantidad de pedidos y cotizaciones.
- **Cuenta corriente**: ledger de débitos/créditos + alta de **pagos** (créditos) con concepto/descripción (ej: "Pago efectivo · cheque N° xxx") y monto.
- **Descuentos + condición de IVA**: editables ahí mismo.
- Se quitó el panel "Descuentos por cuenta" de Administración y la pestaña separada "Cuentas Ctes" — todo vive ahora en "Distribuidores".

El **dashboard general del admin** sigue mostrando **todo** (cotizaciones y pedidos de distribuidores e internos, sin distinción). No requiere SQL nuevo.

## V319 — 2026-06-03 — Cuenta corriente de distribuidores

Sistema de cuenta corriente (débitos + créditos) para distribuidores.

- **Débito automático**: cuando un pedido de un distribuidor pasa a **Aprobado**, se le carga el total (a precio de distribuidor) en su cuenta corriente. Lo hace un **trigger en la base**, así funciona la apruebe quien la apruebe (admin o fábrica). Si el pedido se **Cancela**, se revierte el débito.
- **Pagos (créditos)**: los registran los **admins** desde el panel (oficina/transferencia). Los distribuidores **no pueden** cargar ni editar nada.
- **Admin** → pestaña **"💳 Cuentas Ctes"**: lista de distribuidores con su saldo, ledger de cada uno (débito/crédito/saldo) y alta de pagos.
- **Distribuidor** → pestaña **"💳 Mi cuenta"**: ve su saldo y movimientos en **solo lectura**.
- Idempotente: un solo débito por pedido (índice único).

### Base de datos (correr el SQL de cuenta corriente — tabla + RLS + trigger)

## V318 — 2026-06-03 — Condición de IVA 0% (sin IVA)

Se agrega la opción **0% (sin IVA)** al selector de condición de IVA del distribuidor. Con 0%, el precio queda `lista × (1 − descuento)`, sin sumar IVA ni cuotas.

- Bugfix: al guardar 0% se guardaba como 21% (porque `0` es "falsy"). Ahora 0 se respeta correctamente.
- El orden descuento↔IVA no afecta el resultado (es conmutativo).

## V317 — 2026-06-03 — Distribuidores: sin cuotas + condición de IVA (21% / 10,5%)

Los distribuidores no trabajan con cuotas. Su precio ahora es **lista − descuento del producto + IVA**, donde el IVA es la "condición" de cada distribuidor (21% o 10,5%).

- `getFV()` para distribuidores deja de aplicar el coeficiente de cuotas y usa `1 + IVA_condición`. El resto de las cuentas (admin/vendedor) sigue igual: IVA × coef. cuotas.
- En el panel **Descuentos por cuenta** se agrega el selector **Condición de IVA** (21% / 10,5%) por cuenta.
- Fórmula final del distribuidor: `precio_lista × (1 − %descuento_producto) × (1 + IVA)`.

### Base de datos
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS iva_condicion numeric DEFAULT 21;
```
(Sin esto, los distribuidores quedan con 21% por defecto y el selector de IVA no guarda hasta correrlo.)

## V316 — 2026-06-03 — Etapa B: los descuentos de distribuidor bajan los precios

Cuando un usuario **distribuidor** cotiza, ahora cada producto se cobra con su % de descuento cargado en el panel (Administración → Descuentos por cuenta). El descuento se aplica al precio final del item al agregarlo, así que la cotización, los totales y el PDF salen con el precio rebajado.

- Mapeo producto → clave de descuento (roller blackout/sunscreen, DUO, doble, bandas, paneles, confección, venecianas alum/madera/símil, toldos, motores, rieles, accesorios).
- `descDistribuidorPct(tela, color)` lee `ME.descuentos` del perfil logueado.
- **Para cualquier cuenta que no sea distribuidor, o sin % cargado, los precios no cambian.**
- Nota: por ahora el descuento se ve al **agregar** el item (la vista previa del precio todavía muestra lista; se pule en el próximo paso).

## V315 — 2026-06-02

### Administración: panel de descuentos por cuenta (base de la red de distribuidores) — Etapa A

- Se **quitó la tabla "Todos los Pedidos"** de Administración (ya se ve en Fábrica).
- En su lugar, **panel "Descuentos por cuenta (distribuidores)"**: un desplegable con todas las cuentas y, debajo, la lista de productos con un campo de **% de descuento** por cada uno (Roller Blackout/Sunscreen 5-3-1%, DUO, Doble, Bandas, Paneles, Veneciana Aluminio/Madera/Símil, Toldos, Confección, Motores, Rieles, Accesorios, Instalación).
- Se guardan en `profiles.descuentos` (por cuenta). Nuevo rol **distribuidor** (se comporta como vendedor: ve solo lo suyo, pero con descuentos).
- **Etapa A (esto):** estructura + carga/guardado. Todo sigue funcionando igual — los descuentos todavía NO modifican los precios.
- **Etapa B (próxima):** que esos % efectivamente descuenten los precios cuando un distribuidor cotiza (toca el motor de precios; se hace y prueba aparte).

### Base de datos

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS descuentos jsonb DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "Admin lee todos los perfiles" ON profiles;
CREATE POLICY "Admin lee todos los perfiles" ON profiles
  FOR SELECT TO authenticated USING ( is_admin() );

DROP POLICY IF EXISTS "Admin edita todos los perfiles" ON profiles;
CREATE POLICY "Admin edita todos los perfiles" ON profiles
  FOR UPDATE TO authenticated USING ( is_admin() ) WITH CHECK ( is_admin() );
```

## V314 — 2026-06-02

### DUO: se unifica perfilería y cajón en un solo campo

La perfilería y el cajón siempre van del mismo color, así que se quitó el campo "Color del cajón". Ahora el campo es **"Color de perfilería y cajón"** (uno solo). En la Nota de Recepción la columna pasa a llamarse **"Perfilería / Cajón"**. Se mantienen el lado del mecanismo, el color de tela y la nota de recepción.

## V313 — 2026-06-02

### Las cortinas DUO ahora piden datos al confirmar el pedido

Las DUO se tercerizan, pero igual hay que especificarle al proveedor cómo armarlas. Antes el pedido de DUO se saltaba la pantalla de confirmación; ahora la muestra y pide:

- **Lado del mecanismo** (Derecha / Izquierda)
- **Color de la tela**
- **Color de la perfilería**
- **Color del cajón**

Estos datos salen impresos en la **Nota de Recepción** (nuevas columnas Lado mec. / Perfilería / Cajón), así el operario tiene todo para pedirle la cortina al proveedor.

- Los accesorios sueltos (mecanismo, eje, etc.) siguen sin pedir configuración, como corresponde.
- Se guardan reutilizando columnas existentes (no hace falta correr SQL).

## V312 — 2026-06-02

### Canal de origen del cliente + gráfico de ventas por canal

Para medir de dónde llegan los clientes y cuánto rinde cada canal (pautas):

- **Al confirmar un pedido** aparece un desplegable **"📣 ¿Cómo llegó este cliente?"** (opcional): Redes sociales, Google, Recomendación, Otros. No es obligatorio.
- En el **Dashboard** (admin) hay un gráfico nuevo **"Origen de clientes — ventas por canal"**: muestra cuánto **$** y cuántos pedidos vinieron de cada canal en el período elegido. Respeta el filtro de fechas del dashboard.
- Se guarda en el pedido (campo `origen`) con persistencia tolerante (si falta la columna, el pedido igual se guarda sin romper nada).

### Base de datos

```sql
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS origen text;
```

(Sin este SQL la app funciona igual, pero el canal no se guarda — todos aparecen como "Sin especificar" hasta correrlo.)

## V311 — 2026-06-02

### Se quita el tilde "Producto tercerizado" del formulario (info interna)

El tercerizado es información interna — los vendedores no tienen por qué ver que algunos productos se tercerizan. Se sacó el checkbox manual de cotizaciones y pedidos.

- La detección de tercerizados es ahora **100% automática por producto** (DUO Zebra). Sin marca manual visible.
- Sigue funcionando todo lo demás: la **Nota de Recepción** con código de barras y el **escaneo → Finalizado** al recibir el producto.
- Se quitó también la persistencia del flag manual (columna `documentos.tercerizado` ya no se usa; no hace falta correr ningún SQL).

## V310 — 2026-06-02

### Aumento general de lista de precios + precios por fecha (solo admin)

Dos herramientas nuevas en **Lista de Precios** (la página ya es admin-only), debajo del factor de desperdicio:

**📈 Generar aumento de lista de precios**
- Campo `%` + "Aplicar aumento". Sube ese % a **TODA** la lista: la grilla de cortinas roller (vía un factor de tablas) y todos los insumos (se reescriben los precios).
- Se sincroniza a Supabase (`config`), así que todos los usuarios quedan con la lista nueva.
- Cada aumento guarda una **versión con fecha** en el historial. La primera vez guarda también la "Lista base" para poder volver.
- Pensado para combinar con el panel de **Anuncios**: aplicás el aumento y avisás a los vendedores.

**📅 Llevar precios a una fecha**
- Elegís una fecha y carga la versión de precios vigente en ese momento, para cotizar un trabajo con una lista anterior.
- **Solo afecta tu sesión** (no toca Supabase) — los demás vendedores siguen viendo los precios actuales y no se enteran.
- Aparece un cartel "⚠ Estás viendo precios de DD/MM" con botón **"Volver a precios de hoy"**. También se vuelve a lo actual al recargar.
- Lista de versiones guardadas con botón "Usar estos" en cada una.

Detalle técnico: `tablas_factor` (multiplicador de la grilla roller/venecianas) y `price_history` (versiones) se guardan en `config`. Las telas de confección son costo de proveedor (se importan aparte), así que no entran en este aumento.

## V309 — 2026-06-02

### Mecanismos VTX cotizables sueltos (Accesorios generales)

Los mecanismos VTX ya estaban en el catálogo pero no aparecían en el cotizador. Ahora se pueden cotizar solos desde **Accesorios generales**:

- Mecanismo VTX10 32mm — $15.620
- Mecanismo VTX20 38mm — $19.880
- Mecanismo VTX30 50mm — $39.760

Se agregaron a la lista de "Accesorios generales" y se marcaron como cotizables en el catálogo (`en_cotizador`).

## V308 — 2026-06-02

### Nota de recepción para productos tercerizados (DUO y otros)

Las cortinas **DUO Zebra** (y cualquier producto que se tercerice) no se fabrican en RollerMotion, así que la planilla de fábrica con cortes/armado no aplica. Antes, como la DUO tiene medidas, caía en la sección de cortes de roller (eje, caña, soporte, aluminio) con datos sin sentido — y para un pedido solo de DUO directamente **no aparecía ningún botón de impresión**.

Ahora:

- **Detección**: las DUO Zebra se marcan como tercerizadas **automáticamente**. Además, hay un checkbox **"📦 Producto tercerizado"** en el formulario del pedido para marcar a mano otros productos que se tercericen.
- **Nota de recepción**: los productos tercerizados salen en una **hoja propia** ("Nota de Recepción") con producto, color, medidas, cantidad y **código de barras** — sin cortes ni armado. Incluye espacio para anotar proveedor, fecha de recepción y quién recibió. Ya no ensucian las hojas de corte de roller.
- **Botón 📦** en la fila de pedidos (Fábrica) para imprimir la nota de recepción de pedidos tercerizados.
- **Escaneo al llegar**: cuando el producto llega del proveedor, se escanea el código de barras y el pedido pasa directo a **Finalizado** (recibido). No pasa por "En Fabricación" porque no se fabrica.
- **Código de barras en todas las hojas**: de paso, ahora el código se genera en **todas** las hojas al imprimir (confección y productos personalizados antes no lo mostraban en la ventana de impresión).

### Base de datos

Para que el **check manual** se guarde (las DUO automáticas no lo necesitan), correr:

```sql
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS tercerizado BOOLEAN DEFAULT false;
```

## V307 — 2026-06-02

### Fix — el Soporte (y cadena/color de mecanismo) no llegaba a la planilla de fábrica

Al pasar una cortina a fabricación se elegía el soporte (ej. **Largo**), pero la **nota de fabricación salía con el default (Corto)**. Causa: dos vocabularios de campos. El overlay de confirmación y la planilla usaban nombres largos (`soporte`/`cadena`/`colorMec`), pero la capa de guardado en Supabase solo leía/escribía los nombres cortos (`sop`/`cad`/`mecColor`). El valor se veía bien en la pantalla del que confirmaba (en memoria), pero **nunca se guardaba en la base**, así que cuando fábrica abría el pedido recargado, el campo venía vacío y caía al default.

- `confirmarPedido`: al leer los selects ahora **espeja** el valor a los nombres cortos (`it.sop = it.soporte`, etc.) tanto en cortina simple como en Roller Doble, para que la persistencia lo capture.
- `normalizeItem` (Supabase → app): expone **alias largos** (`soporte`/`cadena`/`colorMec`) además de los cortos, para que la planilla muestre el dato correcto al recargar.
- Mismo arreglo cubre, de paso, el **color de cadena del mecanismo** y el **color de mecanismo**, que tenían el mismo desajuste (menos visible porque casi siempre quedaban en el default).

### Fix (base de datos) — el vendedor no podía eliminar sus cotizaciones

Faltaba la política RLS de borrado para vendedores: al eliminar una cotización desaparecía localmente pero **reaparecía al volver a entrar** (el `DELETE` no afectaba filas en el servidor y no devolvía error). Se agregó la política `"Vendedor elimina sus documentos"` (`DELETE … USING vendedor_id = auth.uid()`).

## V304 — 2026-06-01

### UI polish (3) — entrada suave de modales/overlays

Antes los modales/overlays aparecían de golpe (no había ninguna animación de entrada en todo el archivo). Ahora, al abrirse (clase `.on`), el fondo hace un fade y la tarjeta (`.pbox`) entra con un `scale(.97→1)` + leve subida.

- CSS puro con `@keyframes` — se dispara solo al pasar a visible, **sin tocar el JS** de abrir/cerrar.
- Respeta `prefers-reduced-motion`.
- Cubre el patrón `.overlay`/`.pbox` (documentos, recibos, planillas, telas, etc.).

## V303 — 2026-06-01

### UI polish (2) — hover táctil completo + limpieza de `transition: all`

- `@media (hover: none)`: se sumaron filas de tabla (`.lt`, `.dtbl`), tabs (`.ntab`), items del menú e items del inicio → **ningún `:hover` queda "pegado"** al tocar en iPad. Escritorio e iPad con trackpad conservan los hovers.
- `.ntab` pasó a transiciones explícitas; los 2 botones con estilo inline (`btn-usar-tela`, tags de cliente) dejaron de usar `transition: all`.

## V302 — 2026-06-01

### UI polish — feedback de pulsado, transiciones y soporte táctil

Pulido de interacción en toda la plataforma (skill *emil-design-eng*, basado en la filosofía de Emil Kowalski). La base entró mezclada en V298; esta versión la completa.

- **Feedback de pulsado**: todos los botones (`.btn` y `<button>`) se hunden apenas (`scale(.97)`) al apretar — responde al toque, clave en iPad. Antes solo el login lo tenía.
- **Transiciones explícitas** con curva fuerte `--ease-out` (`cubic-bezier(.23,1,.32,1)`) en vez de `transition: all`, en `.btn`, `.btn-out`, `.btn-t`, `.add-row`, `.stk-stab`, paginación e `.ic-btn`.
- **Sin "hover pegado" en táctil**: `@media (hover: none)` devuelve los `:hover` al estado base en iPad táctil. Escritorio e iPad con trackpad (puntero real) conservan los hovers.
- **Accesibilidad**: `@media (prefers-reduced-motion: reduce)` quita el movimiento para quienes lo configuran.

## V301 — 2026-06-01

### Sincronización inmediata tras guardar (no esperar el ciclo de 25s)

El guardado funciona OK en el servidor; las raras veces que queda "sin sincronizar" es por un parpadeo de sesión/red. Ahora se recupera al instante:

- `saveDoc` y `duplicateDoc`: tras guardar disparan `autoSyncNow()` inmediato + reintentos a los 3s y 9s (antes un solo intento a los 2s).
- `autoSyncNow`: refresca la sesión (`getSession`) antes de reintentar, recuperando de un token vencido; actualiza el indicador al terminar.

Resultado: si un guardado no sube al toque, sube solo en 1–3 segundos, sin intervención.

## V300 — 2026-06-01

### Numeración global de cotizaciones/pedidos (no se pisan entre vendedores)

**Problema**: con RLS cada vendedor solo ve sus docs → `autoNum` (máximo local) calculaba desde su propia vista → distintos vendedores generaban el mismo número (ya había 35 duplicados; `numero` no es único, por eso no rompía el guardado, pero confundía).

**Fix**:
- `nextNumero(type)`: pide al servidor el próximo número mirando TODOS los documentos vía RPC `next_doc_numero` (SECURITY DEFINER, bypassa RLS). Fallback a `autoNum` local si no está.
- `resetForm`: al abrir form nuevo muestra el número provisional local y lo corrige con el global del servidor.
- `duplicateDoc`: usa `nextNumero('quote')` y asigna el duplicado a quien lo crea (`vendedor_id = ME.id`).
- **Requiere SQL** (aparte): función `next_doc_numero` + policy admin insert.

## V299 — 2026-06-01

### Fix crítico — editar/duplicar cotización existente no sincronizaba

**Causa raíz**: al editar una cotización existente (o un duplicado), `saveDoc` armaba el documento sin `vendedor_id` (el form solo tiene el nombre). El upsert escribía `vendedor_id=null` y la política RLS "Vendedor crea documentos" (`WITH CHECK vendedor_id = auth.uid()`) lo rechazaba con 42501. Por eso crear NUEVA andaba pero EDITAR fallaba → quedaba pendiente.

**Fix (app)**: `saveDoc` ahora incluye `vendedor_id`:
- Al editar: preserva el `vendedor_id` original (sigue siendo del vendedor dueño, aunque lo edite un admin).
- Al crear: usa el id del usuario logueado.
- **Requiere SQL** (aparte): policy `"Admin inserta documentos"` con `WITH CHECK (is_admin())`.

## V298 — 2026-06-01

### Auto-sync 100% automático de documentos pendientes

**Problema**: si un guardado fallaba (sesión vencida o parpadeo de red), el doc quedaba "pendiente" en localStorage y solo se reintentaba al recargar manualmente. Un vendedor podía no darse cuenta.

**Solución** (sin botones, todo automático):
- `startAutoSync()` arranca al iniciar sesión (`enterApp`).
- Reintenta `syncPendingDocs` + `syncPendingDeletes` en 4 disparadores: cada 25s (solo si hay pendientes), evento `online`, `visibilitychange`, y `onAuthStateChange` (TOKEN_REFRESHED/SIGNED_IN).
- Guardas: `_autoSyncRunning` evita solapamiento; `_hayPendientes()` evita trabajo innecesario; no spammea toasts.

Resultado: cualquier cotización que quede local se sube sola en segundos.

> **Nota**: en este commit entró también, mezclada, la base del *UI polish* (feedback de pulsado, transiciones `--ease-out`, reduce-motion). Documentado en V302.

## V297 — 2026-05-31

### Mi Dashboard — estadísticas personales del vendedor

Nueva pestaña **📊 Mi Dashboard** para vendedores (cada uno ve SOLO lo suyo, vía RLS + filtro `vendedor_id`). Incluye:

- **6 KPIs** con tendencia vs período anterior: Ventas confirmadas, Pedidos nuevos, Cotizaciones emitidas, Tasa de conversión, Ticket promedio, Pipeline abierto ($ en cotizaciones sin cerrar).
- **Gráfico de ventas** por período (reusa el motor del dashboard admin, parametrizado por canvas).
- **Embudo de conversión**: Cotizadas → Enviadas → Aprobadas, con % de paso entre etapas.
- **Productos más vendidos** (items por tipo, del período).
- **Estado de mis pedidos** (pipeline por estado).
- **🔔 Cotizaciones para seguir**: las abiertas ordenadas por monto, con antigüedad en días (rojo si >14 días) — accionable, clic para abrir.
- **Mis mejores clientes** (top 10 por total vendido).

Selector de período: 7 / 30 / 90 días / año / todo.

## V296 — 2026-05-31

### Mi Perfil + cierre de seguridad (Fase C)

- **Mi Perfil** (⚙ arriba a la derecha): cada usuario edita su nombre, email de notificaciones, teléfono, dirección, CUIT, y **cambia su contraseña**. El rol no es editable por el propio usuario (blindado con trigger en DB).
- **Fase C de seguridad**: eliminadas todas las políticas `anon` abiertas. Ahora **nadie accede a los datos sin iniciar sesión**. RLS activado en `novedades`. Removido el login de respaldo `LOCAL_USERS`. Apaga la alerta de seguridad de Supabase.

## V295 — 2026-05-29

### Auth real de Supabase + multi-usuario por rol (Fase A y B)

Migración del login (antes era un chequeo en JavaScript con usuarios escritos en el código) a **Supabase Auth real** con sesión verdadera y **Row Level Security** por rol:

- **Roles**: `admin` (ve y edita todo), `fabrica` (solo pedidos, fábrica y stock — sin cotizaciones ni precios), `vendedor` (solo sus cotizaciones/pedidos, ve precios de venta, no toca lista de precios ni administración).
- **7 usuarios** creados. Cada cotización/pedido tiene dueño (`vendedor_id`); cada vendedor ve solo lo suyo, los admin ven todo.
- Políticas RLS en todas las tablas (documentos, items, config, proveedores, recibos, stock, profiles, novedades). Recibos también por vendedor (linkeados a su cotización).
- `profiles` extendida con datos de contacto del vendedor.
- Restauración de sesión: al recargar, si ya estabas logueado no vuelve a pedir login.

## V292.1 — 2026-05-15

### Roller Doble en planilla: dos cortinas separadas con tag de pareja

Antes el Roller Doble aparecía como UNA fila en la planilla de fabricación, lo que era incorrecto porque físicamente son **dos cortinas** que se unen mediante un soporte doble. Ahora cada Roller Doble se expande en **dos filas** (una para la Blackout, otra para la Sunscreen), cada una con sus propios datos técnicos provenientes del overlay de confirmación (`it.bk` y `it.sc`).

**Cambios**:

- Cada cortina expandida queda con su propia `tela` (`blackout` o `sunscreen5`), color, sentido, lado mecanismo, color mecanismo, cadena, zócalo y soporte.
- El **soporte default = "Doble"** para las dos (porque se unen con soporte doble).
- Etiqueta visual `🔗 Doble #N` en cada fila para que el operario reconozca al instante que esas dos filas son una pareja.
- Aplica en las dos hojas de la planilla: Hoja 1 (Corte de tela + armado) y Hoja 2 (Cortes de aluminio).
- El item original sigue siendo UNO en la cotización y en el pedido — la expansión es solo en el render de la planilla.

**Ejemplo visual en planilla**:

```
01 · Roller Blackout · color X        🔗 Doble #1
02 · Roller Sunscreen 5% · color Y    🔗 Doble #1
03 · Roller Blackout (simple) · color Z
04 · Roller Doble - blackout          🔗 Doble #2
05 · Roller Doble - sunscreen         🔗 Doble #2
```

## V292 — 2026-05-15

### Cambio de tela en overlay + Roller Doble dual + mínimo 1 m²

**Cambio 1 — Mínimo 1 m² para cualquier cortina**

Antes una cortina de 800×800 (0.64 m²) se cobraba por su área real. Ahora cualquier cortina con área < 1 m² se cotiza **como si fuera 1 m²**, que es el mínimo comercial. Aplica a:

- Roller Blackout / Sunscreen (vía `calcCostoRoller`)
- Roller Doble (porque usa `calcCostoRoller` × 2)
- Cambio de tela (Roller y BV)
- Bandas Verticales y Paneles Orientales
- Venecianas
- DUO Zebra

Implementado como `Math.max(m² real, 1)` en cada cálculo. Cortinas existentes en cotizaciones ya guardadas mantienen su precio original.

**Cambio 2 — Cambio de tela: sección propia en overlay de fabricación**

Antes al pasar a fabricación un Cambio de tela el overlay se salteaba (no había nada para configurar). Ahora aparece una **sección dedicada** con solo los dos campos que aplican:

- **Sentido caída** (Detrás / Delante)
- **Zócalo** (Bolsillo / Visto Blanco / Visto Negro / Reutilizar existente)

No pide mecanismo, eje, cadena ni aluminio porque el cambio de tela reutiliza todo lo existente — solo se confecciona la tela nueva. Una nota celeste lo aclara dentro del overlay.

Aplica tanto a `cambiotela` (Roller) como a `cambiotela_bv` (Bandas Verticales).

**Cambio 3 — Roller Doble: dos sets de campos (Blackout + Sunscreen)**

Antes el Roller Doble se trataba como una cortina y se le pedía UN solo set de detalles técnicos. Como el Roller Doble es físicamente **dos cortinas en el mismo eje** (un Blackout y un Sunscreen), ahora el overlay pide **los detalles de ambas por separado**:

```
[Roller Doble — 1800×2400mm]
   ⬛ Blackout — color XXX
      Sentido · Lado · Color mec. · Cadena · Zócalo · Soporte
   ⬜ Sunscreen — color YYY
      Sentido · Lado · Color mec. · Cadena · Zócalo · Soporte
```

Se persisten como `item.bk = {...}` y `item.sc = {...}` con los 6 campos cada uno. El item sigue manteniendo los campos planos (`it.sent`, `it.ladoMec`, etc.) con los valores del BK para compatibilidad con código existente.

> **Pendiente futuro**: la planilla de fabricación todavía no muestra ambos sets por separado para Roller Doble — los datos se capturan correctamente pero la planilla refleja los del BK. Cuando arranquemos con Roller Doble en producción se ajusta el render de planilla.



## V291 — 2026-05-15

### Centro de Operaciones (Inicio) 🏠

Nueva pestaña **🏠 Inicio** que aparece primero en el menú y es la página por defecto al loguearse. Sustituye el aterrizaje directo en Cotizaciones.

**Contenido**:

1. **Hero**: saludo personalizado según la hora ("Buen día, Gastón"), fecha en español, atajos rápidos "＋ Nueva cotización" y "＋ Nuevo pedido".

2. **4 KPI cards** con el pulso del mes:
   - Cotizaciones del mes (cantidad + total cotizado)
   - Pedidos confirmados (cantidad)
   - Facturado del mes
   - Tasa de conversión (pedidos / cotizaciones × 100)

3. **2 columnas — Últimas cotizaciones / Últimos pedidos**: máximo 5 cada una, con número, cliente, fecha relativa ("hace 2h"), estado con badge de color, cantidad de ítems y total. Click → abre el doc.

4. **Cotizaciones destacadas — seguimiento**: las cotizaciones marcadas con ★. Cada una muestra cuántos días lleva pendiente (badge amarillo > 7 días, rojo > 14 días). Marcar/desmarcar con un click en la ★.

5. **Próximas entregas · 7 días**: pedidos con `fecha_entrega` en los próximos 7 días (o vencidas), ordenados cronológicamente, con badge "Hoy / Mañana / En N días / Vencida".

6. **Novedades**: panel administrable. Tipos: 🆕 Nuevo ingreso · ⚠ Discontinuado · 📈 Aumento de precio · ℹ Información general. Cada novedad tiene título, descripción opcional y fecha de vencimiento opcional (se ocultan automáticamente al vencer). Solo admins ven el botón "＋ Agregar" y los íconos de editar/eliminar.

**Diseño**:

- Tipografía Raleway en títulos, Manrope para números, DM Sans para body.
- Cards con bordes suaves (radius 14px), sombras sutiles, hover con micro-elevación.
- Grid responsive:
  - **Desktop**: 4 KPIs en fila + 2 columnas para listas.
  - **Tablet**: 2 KPIs por fila + 1 columna.
  - **Mobile**: 2 KPIs por fila + todo apilado, botones de hero ocupan ancho completo.
- Paleta consistente con el sistema (naranja `#f09620`, negro `#141414`, fondo cálido `#f5f4f1`).
- Badges de estado con colores semánticos (verde aprobada/listo, azul enviada, amarillo en fabricación, rojo rechazada).

**Filtrado por rol**:

- Admin y Fábrica: ven todas las cotizaciones y pedidos.
- Vendedor: ve solo los suyos (`vendedor === ME.name`).

**SQL necesario en Supabase**:

```sql
-- 1) Tabla de novedades
CREATE TABLE IF NOT EXISTS novedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_vencimiento TIMESTAMPTZ,
  activa BOOLEAN DEFAULT TRUE,
  creado_por TEXT
);

-- 2) Columna destacada en documentos
ALTER TABLE documentos ADD COLUMN IF NOT EXISTS destacada BOOLEAN DEFAULT FALSE;
```

Si el usuario aún no corre el SQL, **el resto del Inicio funciona** (KPIs, listas, próximas entregas). Solo las novedades estarán vacías y al marcar una cotización como destacada aparecerá un toast avisando que falta correr el SQL. La marca queda en memoria hasta que se refresque la página.

**Ideas para próximas iteraciones**:

- Top vendedores del mes (cuando esté multi-user maduro)
- Tela más vendida del mes (útil para stock)
- Notificaciones internas (comentarios en pedidos)
- Quick search global
- Auto-detección de cotizaciones "calientes" (alto valor + sin pedido)

## V290.1 — 2026-05-15

### Toldos: medidas en columnas + chapón como 'Cobertor de toldo' + icono herramienta

**Cambio 1 — Toldo brazos invisibles: medidas en columnas**

Antes la descripción gris debajo del título del producto repetía `Ancho 3850mm · Saliente 2.10m` que ya estaba en las columnas Ancho/Alto de la fila. En una cotización combinada con cortinas, las medidas no aparecían en las columnas y se veía desprolijo.

Ahora el ancho del toldo va en la **columna Ancho** y la saliente va en la **columna Alto** (en mm). La descripción gris queda limpia:

**Antes**:
```
Toldo Brazos Invisibles Punta a Punta
Brazos italianos Helix SP · Ancho 3850mm · Saliente 2.10m · Tela acrílica Dickson ®
[Ancho: 3850]  [Alto: 2100]
```

**Ahora**:
```
Toldo Brazos Invisibles Punta a Punta
Brazos italianos Helix SP · Tela acrílica Dickson ®
[Ancho: 3850]  [Alto: 2100]
```

Mismo cambio aplicado al **Toldo Vertical** por consistencia (la descripción ya no repite `Ancho XXmm · Alto YYmm` — esos datos ya están en las columnas).

**Cambio 2 — Chapón cubre toldos → "Cobertor de toldo"**

Antes el chapón se agregaba como item con sistema `Accesorios de toldos · Chapón cubre toldos`. Ahora se muestra como:

```
Cobertor de toldo · Cada unidad cubre 2m de ancho
```

Aplica tanto cuando se agrega automáticamente desde el toggle del toldo, como cuando se selecciona manualmente desde el grupo `Accesorios de Toldos`. Se agregó `'cobertor_toldo'` a `TELA_LABELS` y override en la rama de accesorios cuando el insumoId es `chapon_cubre_toldos`.

**Cambio 3 — Icono de instalación toldo brazos invisibles**

`🌞 → 🔧` en la fila de instalación del PDF, consistente con cortinas.

## V290 — 2026-05-15

### Paneles Orientales + reorganización de la lista de precios

**Cambio 1 — Nueva cortina "Paneles Orientales"**

Producto nuevo en el grupo Cortinas, con cálculo idéntico a Bandas Verticales (riel × ancho + tela × m²) pero usando insumos propios:

- **Riel**: `riel_panel_oriental` a $80.000/ml (ya existía desde V289).
- **Telas**: 4 insumos nuevos (`panel_oriental_blackout`, `panel_oriental_screen5`, `panel_oriental_screen3`, `panel_oriental_screen1`) con los mismos precios default que las bandas verticales — el usuario los editará después según corresponda.
- **Selector de vías**: 3 / 4 / 5 (todas al mismo precio, afectan solo a la descripción y al cálculo del ancho por panel).
- **Panel informativo**: muestra en vivo `📐 5 vías · ancho riel 3000mm → cada panel ≈ 650mm de ancho` según fórmula `(ancho / vías) + 50mm`.

Reutiliza la misma rama de código que `bandas_verticales` (tipo `'bandas'`) con flag `requiereVias:true` y override de `rielInsumoId` para apuntar al riel correcto.

**Cambio 2 — Reorganización visual de la lista de precios**

Antes los grupos se mostraban en orden de inserción (Telas, Ejes, Zócalos... revueltos). Ahora:

- **Orden explícito** definido en `INSUMOS_CAT_ORDER`: primero Telas (cálculo), después sistemas (Bandas, Paneles, DUO, Venecianas, Confecciones, Toldos), después componentes (Rieles, Motores, Aluminio), y al final servicios (Instalaciones, Servicios y reparaciones).
- **Header más prominente** por categoría: gradient con la paleta de marca, tipografía Raleway, contador de ítems.
- **Sub-secciones** dentro de cada categoría según `subcat`. Por ejemplo en "Toldos" aparecen sub-headers para "Telas · Toldo Vertical · Servicios · Accesorios". En "Bandas Verticales": "Riel · Telas".

**Cambio 3 — Migración de categorías**

Los insumos de instalación y servicios se reasignaron a categorías más limpias:

| Antes | Ahora |
|---|---|
| `instal_normal` cat:`Servicios` | cat:`Instalaciones` subcat:`Cortinas` |
| `instal_motor` cat:`Servicios` | cat:`Instalaciones` subcat:`Cortinas` |
| `instal_toldo_*` cat:`Servicios` subcat:`Toldos` | cat:`Instalaciones` subcat:`Toldos` |
| `srv_*` cat:`Servicios` subcat:`Reparaciones` | cat:`Servicios y reparaciones` subcat:`Ajustes`/`Soldados` |

La migración se aplica automáticamente al cargar para usuarios con `localStorage` existente (no requiere reset).

## V289 — 2026-05-15

### Chapón y motor como items separados + nuevos rieles + Servicios y reparaciones

**Cambio 1 — Chapón cubre toldos: ya no se bundlea al toldo**

Antes el chapón se sumaba al precio del toldo y aparecía como `· + 2 chapones cubre toldos` en la descripción. Ahora cuando marcás el toggle **🛡 Chapón** y agregás el toldo, el chapón se agrega como un **item aparte** en la cotización (categoría "Accesorios de toldos · Chapón cubre toldos", cantidad calculada según el ancho, ref que indica para qué toldo es).

El detalle del toggle ahora dice: *"— se agregará 2 chapones × 2m como item aparte"*.

**Cambio 2 — Motor Vertilux 50/12 auto-agregado para toldos motorizados**

Cuando marcás el toggle **⚡ Toldo motorizado** y agregás el toldo, el sistema:
- Agrega el adicional de $26.700 a la instalación (como antes).
- **Suma automáticamente** un Motor Vertilux 50/12 RF como item aparte ($511.000 lista × coef. cuotas), con ref que indica el toldo asociado.

El detalle del toggle ahora dice: *"— suma Motor Vertilux 50/12 como item + $26.700 instalación"*.

**Cambio 3 — Descripción del Motor 50/12 RF (recomendación)**

```diff
- 'Motor Vertilux 50/12 RF': 'Puede usarse para cortinas hasta 3700 × 3500 mm'
+ 'Motor Vertilux 50/12 RF': 'Motor con bajas revoluciones pero gran fuerza.
+                             Ideal para cortinas de más de 3700 mm de ancho.'
```

**Cambio 4 — Nuevos rieles en el grupo Rieles**

- **Riel de Bandas Verticales** (`riel_bv_solo`) — Solo el riel sin telas. Precio: $72.000/ml (reusa insumo `riel_bv`). Nota: para fabricación se relevan medidas igual que en un pedido de bandas completas.
- **Riel Panel Oriental** (`riel_panel_oriental`) — Con 3 opciones (3 vías, 4 vías, 5 vías) todas al mismo precio de **$80.000/ml**. Nuevo insumo `riel_panel_oriental`.

**Cambio 5 — Nuevo grupo "Servicios y reparaciones"**

Ubicado entre "Accesorios en aluminio" y "Otro" en el dropdown. Una sola entrada `Servicios y reparaciones` (tipo unitario) con 3 servicios:

| Servicio | Precio lista |
|---|---|
| Ajuste de cortina manual en ancho | $36.800 |
| Ajuste de cortina motorizada en ancho | $48.800 |
| Soldado de cortina roller | $23.000 |

Precios son lista, se multiplican por FV para el precio de venta. Cada servicio tiene su insumo (`srv_ajuste_manual`, `srv_ajuste_motor`, `srv_soldado_roller`) editable desde la pantalla de Insumos.

**Pendiente (próxima iteración)**: cuando una cotización con servicios pasa a ser pedido, se debería requerir obligatoriamente: *"Medida final a ajustar en ancho"* + *"Comentarios/aclaraciones del trabajo"*, y eso debería salir en la planilla de fabricación. Por ahora el campo `Ref` de cotización sirve como nota libre. Se marcó el flag `requiereMedidaPedido: true` en la TELA `servicios` para identificarlo a futuro.

## V288.3 — 2026-05-15

### Accesorios de Toldos + toggle Chapón cubre toldos

**Nuevo grupo "Accesorios de Toldos"** en el dropdown del cotizador, entre Toldos y Cambio de tela. Contiene 4 items vendibles independientes:

| Ítem | Unidad | Precio | Insumo |
|---|---|---|---|
| Calotas para eje de 70mm (par) | unidad | $18.200 | `calotas_eje70_par` *(nuevo)* |
| Zócalo Caduta (por metro) | ml | $25.500 | `zocalo_caduta` *(reusa)* |
| Tapas con ojal (par) | unidad | $9.000 | `tapa_zocalo_caduta_par` *(reusa — mismo precio que tapas tensor)* |
| Chapón cubre toldos (cada uno cubre 2m) | unidad | $56.800 | `chapon_cubre_toldos` *(nuevo)* |

Todos editables desde la pantalla de Insumos (categoría `Toldos · Accesorios`).

**Toggle "🛡 Incluir Chapón cubre toldos"** en el form de cotización del toldo (brazos y vertical). Cuando se activa:

- Calcula automáticamente `Math.ceil(anchoM / 2)` chapones según el ancho real del toldo.
- Suma `qty × $56.800` al precio lista del toldo, antes del FV.
- El detalle del toggle muestra en vivo: *"— 2 chapones × 2m (incluido en precio)"*.
- La descripción del item agrega: `· + 2 chapones cubre toldos`.

**Ejemplos**:

| Ancho del toldo | Chapones |
|---|---|
| 1.8 m | 1 |
| 2.0 m | 1 |
| 2.1 m | 2 |
| 4.0 m | 2 |
| 4.5 m | 3 |

**Persistencia**: el costo del chapón queda dentro de `item.precio` y la mención en `item.color`, así que se preserva al guardar/recargar sin necesidad de columna nueva en Supabase. El flag `chaponCubre` y `chaponQty` quedan en `confData` para futura referencia, en memoria.

## V288.2 — 2026-05-15

### Instalación de toldos (brazos + vertical) con adicional de motorización

Antes la cotización tenía 2 precios de instalación globales (cortina manual / cortina motorizada). Los toldos no participaban del cálculo de instalación — pasaba el costo de instalación de cortina aunque fuera un toldo, lo cual estaba mal.

**Nuevos precios de lista**:

| Concepto | Precio |
|---|---|
| Instalación toldo brazos invisibles (Punta a Punta y Barracuadra) | $100.750 |
| Instalación toldo vertical | $75.600 |
| Adicional por motorización (cualquier toldo) | $26.700 |

**Insumos nuevos en `INSUMOS_DEFAULT`** (categoría `Servicios · Toldos`, todos editables):

- `instal_toldo_brazos`
- `instal_toldo_vertical`
- `instal_motor_toldo`

**Cómo marcar un toldo como motorizado**:

En el form de cotización del toldo (brazos o vertical) aparece un toggle naranja **⚡ Toldo motorizado — adiciona $26.700 a la instalación**. Lo marcás antes de agregar el item y se persiste en el item con `motorizado: true`. Si después agregás otro toldo, el toggle se reinicia.

**Filas en el PDF**:

La cotización ahora puede mostrar hasta 5 filas de instalación según corresponda:

1. Servicio de instalación (cortinas manuales)
2. Servicio de instalación motorizada (cortinas motor)
3. **Instalación toldo brazos invisibles** *(nuevo)*
4. **Instalación toldo vertical** *(nuevo)*
5. **Adicional instalación toldo motorizado** *(nuevo)* — una unidad por cada toldo motorizado

Cada fila trae el detalle con cantidad, precio unitario y subtotal.

**Detección automática**:

El conteo es 100% automático. `getInstalAutoCounts` ahora también devuelve `toldoBrazosManual`, `toldoBrazosMotor`, `toldoVerticalManual`, `toldoVerticalMotor` leyendo de los items y su flag `motorizado`. La sección de instalación del panel resume la cantidad detectada.

### ⚠ SQL pendiente en Supabase

Hay que correr una sentencia para agregar la columna `motorizado` a la tabla `items`. Si no se corre, las cotizaciones nuevas guardan bien todo lo demás pero el flag de motorización solo persiste en localStorage:

```sql
ALTER TABLE items ADD COLUMN motorizado BOOLEAN;
```

## V288 — 2026-05-15

### Nuevo producto: Toldo Vertical (sistema Caduta)

Tercer producto del grupo Toldos. Se cotiza **por ancho × alto** (como cortinas), no por tabla anchos/salientes como los toldos de brazos. Comparte el catálogo de telas con los toldos de brazos.

**Fórmula de cotización**:

```
precio_lista =
    Eje 70 (por ml del ancho) +
    Zócalo Caduta (por metro de ancho, redondeado hacia arriba a 1m) +
    2 × Calota Toldo Vertical +
    1 × Máquina polifuncional italiana +
    1 × Tapas para zócalo Caduta (par tensor) +
    Tela (m² × precio_ml del rollo elegido, vía panel azul)

precio_final = precio_lista × FV
```

**Insumos nuevos en INSUMOS_DEFAULT (categoría `Toldos · Toldo Vertical`)**:

| ID | Nombre | Precio | Unidad |
|---|---|---|---|
| `zocalo_caduta` | Zócalo Caduta (por metro de ancho) | $25.500 | ml |
| `calota_toldo_vert` | Calota Toldo Vertical (unidad) | $9.100 | u |
| `maquina_polifuncional` | Máquina polifuncional italiana | $55.800 | u |
| `tapa_zocalo_caduta_par` | Tapas para zócalo Caduta para tensor (par) | $9.000 | par |

Todos editables desde la pantalla de insumos para actualizar a futuro.

**Eje 70**: usa el insumo `eje_70` ya existente ($35.159/ml). Costo = `anchoM × 35159`.

**Zócalo Caduta — escala de 1m**: aunque el ancho se cotiza en mm, el zócalo se factura en saltos de 1 metro. Por ejemplo:

| Ancho real | Caduta facturada |
|---|---|
| 1800 mm | 2 m → $51.000 |
| 2300 mm | 3 m → $76.500 |
| 3000 mm | 3 m → $76.500 |
| 4200 mm | 5 m → $127.500 |

Implementado con `Math.ceil(anchoM) × precio_caduta`.

**Tela del toldo vertical**: usa exactamente el mismo panel azul que el toldo de brazos (`_renderToldoTelaPanel`), con la misma lista de marcas y modos cosido/rotado. La función recibe `A = ancho` y `S = alto` — para verticales el alto juega el rol del saliente.

**Descripción del item**:

```
Toldo Vertical
Ancho 2300mm · Alto 1800mm · Tela acrílica Dickson ® · Eje 70 · Caduta 3m · 2 calotas · máq. polifuncional · tapas tensor
```

La marca de tela queda en negrita verde (mismo formato que los otros toldos vía `formatToldoColor`). No hay marca de brazos porque verticales no usan brazos.

**Selector "Sistema"**: aparece dentro del grupo `Toldos`, después de los dos toldos de brazos.

## V287.4 — 2026-05-15

### Toldos: descripción más limpia + resaltado de Brazos y Tela

**Lo que se sacó**:

- ❌ `(sistema 4m)` — el ancho estándar interno ya no aparece. La línea muestra solo el ancho real (ej. `Ancho 3850mm`).
- ❌ `150cm (2 tramos cosidos)` / `120cm` — los detalles técnicos del rollo (ancho del rollo + modo cosido/rotado) quedan en el panel azul de selección de tela, no en la descripción.
- ❌ `· incl. MO confección` — la mano de obra ya está integrada al precio, no hace falta repetirlo en la descripción.

**Lo que queda**:

```
Toldo Brazos Invisibles Punta a Punta
**Brazos italianos Helix SP** · Ancho 3850mm · Saliente 2.10m · **Tela acrílica Dickson ®**
```

**Resaltado**:

- La marca de los brazos (cualquier valor configurado en `TELAS[x].brazosMarca`, hoy `Brazos italianos Helix SP`) se renderiza en negrita verde oscuro.
- La marca de tela elegida (match contra `TELAS_TOLDO_GRUPOS`) también se renderiza en negrita.
- El resto (Ancho · Saliente · brazos extra · extras Barracuadra) en gris normal.

**Cómo funciona**:

- `item.color` se persiste como **texto plano** (ej. para CSV, planilla, etc., sigue funcionando).
- El bold se aplica solo en el render del items list, vía `formatToldoColor()`, que detecta partes que arrancan con `Brazos` o que coinciden exactamente con una marca de `TELAS_TOLDO_GRUPOS`.
- El preview en el cotizador (antes de agregar) ya muestra el bold via `subD.innerHTML`.

## V287.3 — 2026-05-15

### Reordenamiento: Toldos en el dropdown + marcas de tela del toldo

**Cambio 1 — Orden de grupos en el selector "Sistema"**

Antes el dropdown mostraba Toldos al final. Ahora **Toldos aparece entre Cortinas y Cambio de tela**.

Se agregó un orden explícito `GRUPOS_ORDER` en `qaInit` para que el orden de los optgroups sea predecible y no dependa del orden de inserción en `TELAS`:

```js
const GRUPOS_ORDER = [
  'Cortinas', 'Toldos', 'Cambio de tela',
  'Rieles', 'Motores', 'Motores Rieles',
  'Accesorios generales', 'Accesorios en aluminio', 'Otro'
];
```

Grupos no listados quedan al final preservando su orden original.

**Cambio 2 — Orden de marcas en el panel de tela del toldo**

`_calcToldoOpcionesTela` antes ordenaba alfabéticamente por marca, lo que dejaba las microperforadas arriba. Ahora preserva el orden de `TELAS_TOLDO_GRUPOS`:

1. Tela acrílica Dickson ® *(default)*
2. Tela acrílica Sauleda ®
3. Tela vinílica Plavinil ®
4. Microperforada Sunworker by Dickson ®
5. Microperforada Soltis 96 ®
6. Microperforada SunPro ®

Dentro de cada marca sigue ordenando por costo (rollo más conveniente primero).

Como el selector de marca usa `marcas[0]` cuando no hay selección manual, **Dickson queda como default** al cotizar un toldo nuevo.

## V287.2 — 2026-05-15

### Toldos: descripción del item con marca de brazos

La línea descriptiva de la cotización (debajo del título del producto) ahora arranca con la **marca de los brazos** y sigue con **Ancho · Saliente · Tela**.

**Nueva propiedad en `TELAS`**:

```js
'toldo_brazos_invisibles': {
  ...,
  brazosMarca: 'Brazos italianos Helix SP',
},
'toldo_brazos_invisibles_barracuadra': {
  ...,
  brazosMarca: 'Brazos italianos Helix SP',
},
```

**Formato anterior**:
```
Ancho 2300mm (sistema 3m) · Saliente 1.60m · 2 brazos · Tela acrílica Dickson ® 150cm (2 tramos cosidos)
```

**Formato nuevo**:
```
Brazos italianos Helix SP · Ancho 2300mm (sistema 3m) · Saliente 1.60m · Dickson 150cm (2 tramos cosidos)
```

Reglas adicionales:

- La **cantidad de brazos** solo se menciona si es distinta del default (2). Útil para Barracuadra grandes donde vienen con 3 ó 4 brazos.
- Los **extras del Barracuadra** (compensador, tubo 80, TS2) se anexan al final cuando aplican.
- La **MO confección** queda al final como `· incl. MO confección`.

Se aplica tanto a la vista previa del cotizador (línea gris debajo del precio) como a la descripción persistente del item (la que aparece en el PDF y en la planilla).

## V287.1 — 2026-05-15

### Hotfix toldos: precio no aparecía + label + orden Ancho→Saliente

**Bug 1 — Precio no se calculaba**

`qaCalcPrecio` tenía una guarda al principio: si `!ancho || !alto` y el tipo no era `unitario`/`accesorio`/`riel`, devolvía `'—'` y `return`. Como en toldos el `alto` está oculto (la saliente viene del dropdown), `qa-alto` siempre estaba vacío → la guarda hacía short-circuit y nunca llegaba a la rama de cálculo del toldo.

Fix: agregar `toldo` al whitelist de tipos que no necesitan `alto`. Si falta `ancho`, sí mostrar `'—'` (es lo esperado mientras el usuario no tipea nada).

```js
const isToldo = telaInfoTypeCheck === 'toldo';
if(!ancho || !alto){
  if(... && !isRielType && !isToldo){ return '—'; }
  if(isToldo && !ancho){ return '—'; }
}
```

**Bug 2 — Label "Ancho real (mm)"**

El usuario no necesita "real" — ya está claro que es el ancho que va a confeccionar. Quedó solo `Ancho (mm)`.

**Bug 3 — Orden visual: Ancho debe ir primero**

Antes el form pedía Saliente → Ancho. Ahora con CSS `order` se reordena para mostrar **Ancho → Saliente** (el usuario primero elige cuán ancho quiere el toldo, después la saliente).

**Tela del toldo**

El panel `🪡 Tela del toldo` ya existía (se renderiza en `#qa-toldo-tela` con selector de marca y lista de rollos). Por el bug anterior nunca se mostraba porque la función retornaba temprano. Con el fix, ahora aparece automáticamente apenas se ingresa el ancho, con la opción más conveniente marcada como `MÁS CONVENIENTE` y permitiendo elegir cualquier otra (marca + rollo + modo cosido/rotado).

## V287 — 2026-05-15

### Toldos: UX simplificado (solo Ancho + Saliente) + Mano de Obra editable

**Cambio 1 — UX: ocultar el dropdown "Ancho estándar"**

Antes el form pedía dos campos para el ancho: el input numérico **"Ancho real (mm)"** y el dropdown **"Ancho estándar"**. El estándar se autoseleccionaba al tipear, pero seguía visible y confundía. El usuario solo necesita decidir el ancho que va a confeccionar y la saliente.

Ahora el form pide únicamente:

- **Ancho real (mm)** — input personalizable (ej. `2300`, `4700`, `5500`).
- **Saliente** — dropdown de salientes estándar válidas (filtradas según el ancho).

El **ancho estándar** sigue calculándose internamente (el select se mantiene en el DOM pero oculto con `display:none`) para:

- Determinar qué fila de la tabla de precios usar (ej. `2300` → cobra `3 m`).
- Filtrar las salientes válidas según el ancho.

Al cambiar a otro producto, el wrapper se vuelve a mostrar (queda preparado para los otros tipos que sí lo usan: bandas, roller doble, etc).

**Cambio 2 — Pricing: Mano de Obra confección toldo (\$50.000 editable)**

El precio final del toldo ahora se compone de:

```
precio_lista = sistema (tabla × multiplicador) + tela (m² × precio_ml) + MO confección
precio_final = precio_lista × FV
```

La MO se agregó a la lista de precios como insumo `mo_toldo` ($50.000) para poder actualizarla a futuro desde la pantalla de insumos.

```js
// INSUMOS_DEFAULT (sección Toldos — Servicios)
{ id:'mo_toldo', cat:'Toldos', subcat:'Servicios',
  nombre:'Mano de obra confección toldo (por unidad)',
  precio:50000, unidad:'u', en_cotizador:false }
```

**Impacto en la vista previa**:

- Antes: `"3m × 2.10m · 2 brazos + tela 5.00m"`
- Ahora: `"3m × 2.10m · 2 brazos + tela 5.00m + MO confección"`

**Descripción del item**:

- Antes: `"Ancho 2300mm (sistema 3m) · Saliente 2.10m · 2 brazos · Tela..."`
- Ahora: `"Ancho 2300mm (sistema 3m) · Saliente 2.10m · 2 brazos · Tela... · incl. MO confección"`

**Editable a futuro**: cuando suba la mano de obra, se actualiza el insumo `mo_toldo` desde la lista de precios y todas las cotizaciones nuevas la toman automáticamente.

## V286 — 2026-05-15

### Persistencia completa en Supabase: ya no se pierden datos al sincronizar

Antes, los campos nuevos agregados en chats anteriores (planilla confección, riel Celtic, motor Somfy, tela toldo, flags de tracking mixto) vivían **solo en localStorage**. Esto significaba que al cambiar de dispositivo o si el realtime de Supabase refrescaba el doc, esos datos se perdían y la planilla los recalculaba con valores genéricos.

El usuario ya corrió el SQL que agrega las columnas faltantes. Este commit actualiza el código para usarlas.

**Columnas nuevas en `documentos`**:
- `conf_recibida` (boolean) — V266
- `roller_terminado` (boolean) — V266
- `instal_manual_qty` / `instal_motor_qty` (integer) — V250
- `fecha_inicio_fab` / `fecha_finalizado` (timestamptz)

**Columnas nuevas en `items`**:
- **Planilla confección**: `cabezal`, `metros_tela`, `ancho_rollo`, `frunce_solicitado`, `pedazos`, `nombre_tela`, `con_riel`
- **Riel Celtic**: `celtic_tramos`, `celtic_ancho_m`
- **Motor Somfy**: `motor_id`, `motor_label`
- **Tela Toldo**: `toldo_tela_rollo`, `toldo_tela_marca`, `toldo_tela_ancho_rollo`, `toldo_tela_modo`, `toldo_tela_strips`, `toldo_tela_linear_m`

**Cambios en el código**:

- `saveDocToSupabase`: ahora envía todas las columnas nuevas al insertar/actualizar.
- `normalizeDoc`: lee `conf_recibida`, `roller_terminado`, `fecha_inicio_fab`, `fecha_finalizado` desde Supabase.
- `normalizeItem`: lee todas las columnas de planilla, Celtic, Motor Somfy y Tela Toldo.
- `applyLocalFlagsToDoc`: ahora trata Supabase como fuente de verdad. localStorage solo se aplica como fallback cuando Supabase no tiene el valor (típico de docs creados antes de V286).

**Resultado**:

Todos los datos viajan automáticamente entre dispositivos via Supabase realtime. Lo que cargues en el iPad va a aparecer correctamente en la PC y viceversa, sin perder ningún detalle de la planilla, configuración de Celtic, motor elegido, ni info de tela del toldo.

## V285 — 2026-05-07

### Toldos: multiplicador uniforme + ancho real con redondeo automático al estándar

**Cambio 1: Punta a Punta ahora también `× 1.21 × 2`**

El usuario confirmó: la tabla de Punta a Punta también es **precio neto sin IVA**. Para obtener lista hay que multiplicar por 1.21 (IVA) × 2 (margen) — igual que Barracuadra.

```diff
- multiplicador: 2
+ multiplicador: 1.21 * 2  // = 2.42
```

**Cambio 2: Ingreso del ancho real + redondeo automático**

Cuando un cliente pide un ancho intermedio (ej. 2.30 m, 5.50 m), el sistema cobra el ancho estándar inmediato superior. Antes el cotizador tenía que hacer ese redondeo mental — ahora el sistema lo hace automáticamente.

**Cómo funciona ahora**:

- El form de toldo tiene un input numérico **"Ancho real (mm)"** (en lugar del dropdown solo).
- El cotizador tipea el ancho que pidió el cliente (ej. `2300`).
- El sistema **autoselecciona** el ancho estándar inmediato superior (en este caso `3 m`) en el dropdown "Ancho estándar".
- El **precio del sistema** se cobra con el estándar.
- La **tela** se calcula con el ancho real (más exacto en costo de tela).
- Si el ancho real coincide con un estándar (ej. `3000`), no hay diferencia.

**Ejemplos**:

| Cliente pide | Ancho estándar cobrado | Tela calculada con |
|---|---|---|
| 2300 mm | 3 m | 2300 mm |
| 4200 mm | 5 m | 4200 mm |
| 4700 mm | 5 m | 4700 mm |
| 5500 mm | 6 m (Barracuadra) | 5500 mm |
| 3000 mm | 3 m | 3000 mm |

**Vista previa al cotizar**:

- Sin redondeo: `"3m × 2.10m · 2 brazos + tela 5.00m"`
- Con redondeo: `"2300mm real → cotiza 3m × 2.10m · 2 brazos + tela 4.40m"`

**Item guardado**:

- `ancho` = ancho real (ej. `2300`)
- `alto` = saliente (ej. `2100`)
- `color` incluye descripción del redondeo si aplica: `"Ancho 2300mm (sistema 3m) · Saliente 2.10m · 2 brazos · Tela..."`

### Notas técnicas

- `qaTelaChange` para `tipo:'toldo'` ahora configura `qa-ancho` como input numérico con `oninput` custom que auto-bumpea el dropdown del estándar.
- Al cambiar a otra tela, `qaTelaChange` restaura el `oninput` default y el label de `qa-ancho`.
- `qaCalcPrecio` y `qaAgregar` leen `qa-ancho` (real) y `qa-color` (estándar) por separado.
- La tela usa el ancho real → resulta en menos metros lineales si el ancho real es menor al estándar → costo de tela más bajo y más preciso.

## V284 — 2026-05-07

### Nuevo producto: Toldo Brazos Invisibles con Barracuadra 40×40

Segundo modelo de toldo, especialmente para anchos grandes (hasta 8 m). Comparte la lógica de cálculo de tela con el modelo Punta a Punta (V282-V283) — reutiliza el panel de "🪡 Tela del toldo".

**Diferencias con Punta a Punta**:

- **Anchos disponibles**: 2, 3, 4, 5, 6, 7, 8 m (vs. 2-5 m del Punta a Punta).
- **Multiplicador**: `× 1.21 × 2 = 2.42` (incluye IVA + margen). El Punta a Punta sigue con `× 2` (ver nota abajo).
- **Cantidad de brazos variable** según ancho:
  - 2 a 6 m → 2 brazos
  - 7 m → 3 brazos
  - 8 m → 4 brazos
- **Extras incluidos** según ancho:
  - 6 m → C/Compensador
  - 7 m y 8 m → C/Compensador + Tubo 80 + TS2

**Tabla cargada** (precios base antes de × 1.21 × 2 y FV):

| Ancho \ Saliente | 1.60 | 2.10 | 2.60 | 3.10 |
|---|---|---|---|---|
| 2 m | $421.190 | — | — | — |
| 3 m | $461.980 | $476.005 | $505.720 | — |
| 4 m | $502.775 | $516.795 | $546.525 | $562.775 |
| 5 m | $543.560 | $557.585 | $587.315 | $603.565 |
| 6 m | $696.030 | $710.065 | $736.560 | $756.035 |
| 7 m | $960.075 | $981.130 | $1.025.710 | $1.050.100 |
| 8 m | $1.168.755 | $1.196.815 | $1.256.265 | $1.288.750 |

**Cambios técnicos**:

- Nuevo TELA `toldo_brazos_invisibles_barracuadra` con la tabla y multiplicador correspondientes.
- Nuevos campos opcionales en TELAs de tipo `toldo`:
  - `brazosPorAncho`: mapping ancho → cantidad de brazos
  - `extrasPorAncho`: mapping ancho → texto de componentes extra (Compensador, etc.)
- `qaCalcPrecio` y `qaAgregar` actualizados para leer estos campos.
- El item guardado describe los extras: ej. `"Ancho 7m · Saliente 2.60m · 3 brazos · C/Compensador · Tubo 80 · TS2 · Tela acrílica Sauleda ® 150cm (5 tramos)"`.
- Agregado a `TELA_LABELS`.

### Pendiente: confirmar multiplicador del Punta a Punta

El Barracuadra usa `× 1.21 × 2` (IVA + margen). El Punta a Punta sigue con `× 2` solo, según las instrucciones originales. **Si el Punta a Punta también debe llevar el `× 1.21` del IVA**, cambiar 1 línea en TELAS para uniformar.

## V283 — 2026-05-07

### Telas para toldos: catálogo + selector con cálculo automático

Continúa V282 (toldos brazos invisibles). Ahora el cotizador incluye la **tela** del toldo, eligiendo automáticamente la combinación más conveniente entre las telas disponibles.

#### Catálogo de telas para toldos

Agregadas 9 entradas al catálogo de Insumos (subcategoría "Toldos · Telas"). Precio por metro lineal del ancho de rollo indicado:

| Tela | Ancho rollo | Precio/ml |
|---|---|---|
| Acrílica Dickson ® | 150 cm | $91.350 |
| Acrílica Dickson ® | 120 cm | $63.800 |
| Acrílica Sauleda ® | 150 cm | $66.400 |
| Acrílica Sauleda ® | 120 cm | $53.240 |
| Vinílica Plavinil ® | 110 cm | $43.000 |
| Microperforada Sunworker by Dickson ® | 300 cm | $259.660 |
| Microperforada Soltis 96 ® | 267 cm | $170.000 |
| Microperforada SunPro ® | 320 cm | $65.000 |
| Microperforada SunPro ® | 250 cm | $45.000 |

Editables desde el panel de Insumos.

#### Selector de tela en el cotizador

Al cotizar un toldo (después de elegir ancho y saliente), aparece un panel azul "🪡 Tela del toldo":

- **Dropdown de marca**: Dickson / Sauleda / Plavinil / Sunworker / Soltis / SunPro.
- **Opciones por marca**: si la marca tiene varios anchos de rollo, se muestran todas las combinaciones posibles con su precio.
- La opción más económica está marcada como **"MÁS CONVENIENTE"** (auto-elegida).
- El cotizador puede tocar otra opción para fijarla manualmente (como el panel de paños en confección).

#### Cálculo de tela (Modo A vs Modo B)

Para cada rollo se calculan dos modos posibles:

- **Modo A** (tramos paralelos al saliente, soldaduras perpendiculares al eje):
  - Tramos = ⌈ancho / rollo⌉
  - Metros lineales = tramos × (saliente + 40 cm)
  - Aplica siempre.
- **Modo B** (rotada, sin uniones — solo si el rollo ≥ saliente + 40 cm):
  - Metros lineales = ancho del toldo
  - Mucho más económico cuando el rollo es ancho (ej. Sunworker 300cm).

Ejemplos del enunciado:

| Toldo (mm) | Modo más conveniente |
|---|---|
| 3000 × 2100 (Sauleda 150cm) | Modo A: 2 tramos × 2.5m = 5.0m lineal |
| 3500 × 2600 (Sunworker 300cm) | Modo B: 1 paño rotado de 3.5m lineal |
| 4500 × 2600 (Sunworker 300cm) | Modo B: 1 paño rotado de 4.5m lineal (mejor que Modo A con 2 tramos de 3m) |

(El sistema autoelige Modo B cuando es viable y conviene.)

#### Datos guardados en el item

Para trazabilidad/fabricación, el item del toldo guarda:

- `toldoTelaRollo` (id del insumo, ej. `tela_toldo_dickson_150`)
- `toldoTelaMarca` (ej. "Tela acrílica Dickson ®")
- `toldoTelaAnchoRollo` (mm)
- `toldoTelaModo` (`'A'` o `'B'`)
- `toldoTelaStrips` (cantidad de tramos)
- `toldoTelaLinearM` (metros lineales totales)

El `color` del item se enriquece para incluir la tela: ej. `"Ancho 3m · Saliente 2.60m · 2 brazos · Tela acrílica Dickson ® 150cm (2 tramos)"`.

#### Precio final

```
precio_lista_total = (tabla_sistema × multiplicador) + (rollo_metros × precio/ml)
precio_venta = precio_lista_total × FV × cantidad
```

### Pendiente — V284 (próximo)

- Cuando me pases la tabla, agregar **Toldo Brazos Invisibles con Barracuadra** como segundo modelo. La lógica de tela se reutiliza.
- A futuro: cambiar el default de "más barato" a "más caro" para "cubrir costos".

## V282 — 2026-05-07

### Nuevo producto: Toldo Brazos Invisibles Punta a Punta

Cotización del **sistema** (eje + brazos + zócalo) basada en tabla de precios por ancho y saliente. La parte de tela (m²) la calculamos en una etapa posterior.

**UX al cotizar**:

- Nuevo grupo **"Toldos"** en el dropdown de sistemas.
- Selector **Ancho**: 2 / 3 / 4 / 5 m (valores estándar).
- Selector **Saliente**: 1.60 / 2.10 / 2.60 / 3.10 m (se filtra según el ancho — solo se muestran las combinaciones válidas).
- Cantidad de brazos: 2 (constante por ahora).

**Regla de combinaciones válidas**: el saliente no puede superar al ancho.

| Ancho | Salientes disponibles |
|---|---|
| 2 m | 1.60 |
| 3 m | 1.60 / 2.10 / 2.60 |
| 4 m | 1.60 / 2.10 / 2.60 / 3.10 |
| 5 m | 1.60 / 2.10 / 2.60 / 3.10 |

**Fórmula de precio**:

```
precio_lista  = tabla[ancho][saliente] × multiplicador
precio_venta  = precio_lista × FV × cantidad
```

Con multiplicador = 2 (los precios de la tabla provista son a multiplicar × 2 para obtener lista).

**Tabla de precios cargada** (precios base, antes de × 2 y FV):

| Ancho \ Saliente | 1.60 | 2.10 | 2.60 | 3.10 |
|---|---|---|---|---|
| 2 m | $309.400 | — | — | — |
| 3 m | $337.835 | $351.775 | $381.505 | — |
| 4 m | $366.150 | $380.185 | $409.890 | $426.140 |
| 5 m | $394.520 | $408.560 | $438.290 | $454.520 |

**Cambios técnicos**:

- Nuevo `tipo: 'toldo'` en TELAS.
- `qaTelaChange` ahora maneja el setup del form (dropdowns en lugar de inputs numéricos).
- `qaCalcPrecio` y `qaAgregar` calculan precio desde la tabla con la regla de combinaciones inválidas.
- El item se guarda con `ancho` y `alto` en mm (`2000`, `1600`) para mantener compatibilidad con la tabla de items.
- El `color` del item lleva la descripción humana: `"Ancho 2m · Saliente 1.60m · 2 brazos"`.
- Agregado a `TELA_LABELS` como `'Toldo Brazos Invisibles'`.

**Pendiente**:

- Cálculo de m² de tela para confección del toldo (siguiente etapa).
- Más modelos / variantes de toldo (otros tipos de brazos, motorizado, etc.).

## V281 — 2026-05-07

### Nuevo archivo: `PROJECT_CONTEXT.md`

Manual del proyecto para retomar contexto rápido en futuros chats. Incluye:

- Qué es el proyecto y su stack
- Mapa del `index.html` con secciones aproximadas por líneas
- Conceptos clave (TELAS, INSUMOS, TELAS_CONFECCION, estados, scanner)
- Convenciones (versionado V###, naming, workflow)
- Gotchas (iPad, focus, etc.)
- Pendientes conocidos
- Instrucciones para arrancar un chat nuevo

Diseñado para que un Claude nuevo entrando al proyecto pueda ponerse al día en ~30 segundos leyendo este archivo + el último commit del CHANGELOG.

## V280 — 2026-05-07

### Fix: planilla de cortes de aluminio no aparecía para pedidos solo de confección

Cuando el pedido solo tenía cortinas de confección **con riel**, no aparecía el botón 📋 (Planilla armado/aluminio) en Fábrica — solo se veía 🧵 (Confección). El riel aluminio necesita su hoja de corte, que ya estaba implementada en la planilla roller pero el botón no se mostraba.

**Fix**: extender la condición de visibilidad del botón 📋 para incluir pedidos con **confección + riel**:

```js
const tieneRoller = (d.items||[]).some(it =>
  isRollerTela(it.tela)
  || it.tela==='riel_manual'
  || it.tela==='riel_motorizado'
  || it.tela==='riel_motorizado_celtic'
  || ((it.tela==='conf_liviana' || it.tela==='conf_blackout') && it.conRiel)
);
```

Ahora un pedido solo-conf con riel muestra **los dos botones**: 📋 (cortes aluminio del riel) + 🧵 (corte y confección de tela).

## V279 — 2026-05-07

### Mejoras de UX

**1. "Confección" en lugar de "Fabricación" para pedidos solo-conf**

Cuando un pedido tiene **solo items de cortina tradicional** (sin roller / motores / rieles), el estado "En Fabricación" se muestra como "En Confección" — refleja mejor que la pieza está con el confeccionista tercerizado.

- Badge en la lista: 🧵 Confección (en lugar de ⚙️ Fabricación)
- Dropdown editable en Fábrica/Admin: opción "En Confección" (pero el `value` interno sigue siendo "En Fabricación" para no romper la state machine ni cambiar la lógica del scanner)

Si el pedido es **mixto** (tiene roller + confección), o solo roller, sigue mostrando "Fabricación" como antes.

**2. Paginación en Cotizaciones y Pedidos**

Ambas listas ahora muestran **hasta 15 items por página**. Si hay más, aparecen controles de paginación al pie de la tabla:

- Botones: `« ‹ 1 … 3 4 [5] 6 7 … 20 › »`
- Info: "Mostrando 1–15 de 87"
- Al filtrar (buscar cliente o cambiar estado) la paginación se resetea a página 1.
- Click en cualquier número o flecha scrollea suavemente al top.

Aplica a:
- Cotizaciones (pestaña Cotizaciones)
- Pedidos (pestaña Pedidos)

(La pestaña Administración tiene su propio listado más grande — la dejé sin paginar por ahora.)

### Cambios técnicos

- Nuevo CSS `.paginacion-wrap` + `.paginacion-ctrl` para los controles.
- Helper `_renderPagination(containerId, totalItems, currentPage, onChangeFnName)` reutilizable.
- Estado: `_pageCot`, `_pagePed` (number, 1-indexed).
- Constante `PAGE_SIZE = 15`.
- `statusOpts(type, cur, doc)` ahora acepta el doc para detectar el caso "solo conf" y customizar la opción "En Fabricación".

## V278 — 2026-05-07

### Fixes de descripciones

**1. Riel Celtic aparecía como `riel_motorizado_celtic` en la cotización**

El renombre de label se aplicó en TELAS, pero faltaba en el diccionario `TELA_LABELS` que se usa al mostrar items en la cotización y otros listados. Faltaban también las claves de telas nuevas:

- `riel_motorizado_celtic` → "Riel motorizado Celtic ®"
- `cambiotela_bv` → "Cambio de tela Bandas Verticales"
- `cenefas` → "Cenefa curva"

También actualizado:
- `conf_liviana`: "Cortina Gasa de lino" → "Cortina tradicional liviana"
- `conf_blackout`: "Cortina Blackout Tex" → "Cortina tradicional Blackout Tex"

**2. Planilla de confección mostraba "Gasa de lino" aunque hayas elegido otra tela**

El header de cada cortina en la planilla mostraba siempre "Gasa de lino" o "Blackout Tex" según el tipo de cortina, ignorando si elegiste una tela específica (ej. 2941 Bamboo Prewash) en el modal de búsqueda de código.

**Fix**: usa `it.nombreTela` (la tela específica elegida, ej. "2941 — Gasa Bamboo Prewash") si existe; si no, cae al genérico "Gasa de lino" / "Blackout Tex".

| Caso | Header en la planilla |
|---|---|
| Tela 2941 (Bamboo Prewash) elegida | "2941 — Gasa Bamboo Prewash" |
| Sin tela específica elegida | "Gasa de lino" (cortina liviana) o "Blackout Tex" (cortina blackout) |

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
