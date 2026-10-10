// Contenido del manual de usuario del panel admin.
// Texto en Markdown + rutas de imágenes en /public/manual.
// La UI que lo renderiza vive en components/admin/ManualContent.tsx.

export interface ManualSection {
  id: string;
  title: string;
  markdown: string;
}

export const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: "planes",
    title: "Planes",
    markdown: `
Los **planes** son los viajes que se muestran en el sitio. Desde **Planes** en el
menú lateral puedes ver todos los planes, crear nuevos y editar o eliminar los
existentes.

![Listado de planes en el panel](/manual/planes-listado.png)

Cada fila muestra la foto, el título, el tipo, el precio y el estado
(**Publicado** o **Borrador**). A la derecha tienes las acciones **Editar**,
**Disponibilidad** y **Eliminar**.

### Crear o editar un plan

Pulsa **Nuevo plan** (arriba a la derecha) o **Editar** en un plan existente. Se
abre el formulario:

![Formulario de edición de un plan](/manual/planes-form.png)

- **Título**: nombre del plan. Al crearlo, el **Slug (URL)** se genera solo a
  partir del título; puedes ajustarlo, pero debe ser único (solo minúsculas,
  números y guiones).
- **Precio (COP)** y **Ubicación (texto)**: se muestran en la ficha del plan.
- **Tipo** y **Ubicación (categoría)**: sirven para filtrar los planes en el
  sitio. Se administran en las secciones **Tipos** y **Ubicaciones**.
- **Etiquetas**: palabras separadas por coma (p. ej. \`3 días, Todo incluido\`).
- **Imagen principal**: obligatoria; es la foto de portada. Puedes subir un
  archivo o pegar una URL.
- **Galería**: fotos adicionales de la ficha. Añade las que necesites.
- **Descripción, Itinerario, Incluye y Recomendaciones**: admiten **Markdown**
  para dar formato (listas, negritas, etc.).

### Publicar

Activa la casilla **Publicado** para que el plan sea visible en el sitio.
Desactívala para dejarlo como **borrador** (no aparece al público) sin perder el
trabajo. Al terminar, pulsa **Guardar cambios**.

> La configuración de fechas y cupos **no** está en este formulario: se gestiona
> aparte, con el botón **Configurar disponibilidad** (ver la siguiente sección).
`.trim(),
  },
  {
    id: "disponibilidad",
    title: "Disponibilidad",
    markdown: `
La **disponibilidad** controla cuándo y para cuántas personas se puede reservar un
plan. Se configura por plan, en su propia pantalla: entra desde
**Disponibilidad** en el listado de planes, o con **Configurar disponibilidad**
dentro de la edición del plan.

![Pantalla de disponibilidad de un plan](/manual/disponibilidad.png)

### Modo de ocupación

- **Exclusivo (un grupo por día)**: cada día solo admite una reserva. Al
  confirmarse una, ese día queda ocupado.
- **Aforo (cupo de personas por día)**: varios grupos comparten el día hasta
  llenar el **cupo** que indiques. Al elegir este modo aparece el campo **Cupo
  por día (personas)**.

### Reserva por

- **Día único**: el cliente reserva una sola fecha.
- **Rango de fechas**: el cliente elige fecha de inicio y fin.

### Reservas abiertas

La casilla **Reservas abiertas** deja pausar las reservas sin despublicar el
plan: al desmarcarla, el plan sigue visible pero aparece como **Reservas
cerradas** y no acepta solicitudes nuevas. Las solicitudes que ya habías
recibido se pueden seguir confirmando.

### Qué ocupa disponibilidad

- Las solicitudes **Confirmadas** ocupan el cupo en firme.
- Las solicitudes **Pendientes** y **Contactadas** **apartan** el cupo durante
  **72 horas**. Si no se confirman a tiempo, vencen solas y el cupo se libera.

### Qué ve el cliente

En la ficha del plan el cliente ve el modo (cupo por día o salida privada), si
el plan es de un día o de varios, si las reservas están abiertas y la **próxima
fecha disponible**. En el calendario, bajo cada día aparecen los **cupos que
quedan** (en rojo cuando son los últimos). Los días apartados por otra solicitud
aparecen marcados como "puede liberarse". En el listado de planes, cada tarjeta
indica "Cupo N/día", "Salida privada" o "Reservas cerradas".

### Fechas bloqueadas

Bloquea días concretos por mantenimiento, clima o cupo. Indica la fecha de
**Inicio** y, opcionalmente, la de **Fin** (es **exclusiva**: para bloquear un
solo día, deja el fin vacío). Puedes añadir un **motivo** y eliminar bloqueos
cuando ya no apliquen.

Recuerda pulsar **Guardar disponibilidad** tras cambiar el modo, el cupo o las
reservas abiertas. Los bloqueos se guardan al añadirlos.
`.trim(),
  },
  {
    id: "solicitudes",
    title: "Solicitudes",
    markdown: `
En **Solicitudes** ves las reservas que envían los clientes desde el sitio, de la
más reciente a la más antigua. Las pestañas filtran por estado y muestran
cuántas hay en cada uno. También puedes buscar por nombre, correo o teléfono, y
filtrar por plan o por rango de fechas de viaje.

![Listado de solicitudes](/manual/solicitudes.png)

Haz clic en el número o en el nombre del cliente para abrir el **detalle**:
datos de contacto (con acceso directo a correo, teléfono y WhatsApp), valor
estimado, **disponibilidad de esas fechas** ("hay cupo para confirmarla" o el
motivo por el que no) y el **historial** de cambios.

### Estados

| Estado | Significado | ¿Ocupa cupo? |
|---|---|---|
| **Pendiente** | Recién recibida | Lo aparta 72 h |
| **Contactado** | Ya te comunicaste con el cliente | Lo aparta 72 h más desde que la marcas |
| **Confirmado** | Reserva en firme | Sí |
| **Completado** | El viaje se realizó | — |
| **Rechazado** | La agencia no puede atenderla | No |
| **Cancelado** | El cliente la canceló, o la agencia anuló una reserva confirmada | No |
| **Vencido** | Pasaron las 72 h sin confirmarse | No |

### Cambiar el estado

Usa los botones de **Acciones**. Solo aparecen los cambios permitidos desde el
estado actual:

- **Pendiente** → Marcar contactado, Confirmar o Rechazar.
- **Contactado** → Confirmar o Rechazar.
- **Confirmado** → Marcar completado (desde el día del viaje) o **Anular reserva**
  (por ejemplo, si el viaje no puede realizarse).
- **Vencido** → Confirmar (si todavía hay cupo) o Rechazar.
- **Completado, Rechazado y Cancelado** son estados finales.

Las solicitudes que aún no están confirmadas se cierran con **Rechazar**;
**Cancelar** es una acción del cliente (desde **Mi cuenta**), y la agencia solo
puede **anular** reservas ya confirmadas.

Al elegir una acción puedes escribir un **mensaje para el cliente**. Para
**Rechazar** o **Anular reserva** el mensaje es obligatorio. **Confirmar** vuelve a
revisar la disponibilidad: si ya no hay cupo, el cambio no se aplica y se
muestra el motivo.

### Correos automáticos

- Cuando llega una solicitud, el cliente recibe un acuse con el resumen y la
  agencia recibe un aviso.
- Cada cambio de estado (incluido el vencimiento) envía un correo al cliente
  con tu mensaje.
- Si el cliente cancela desde **Mi cuenta**, la agencia recibe un aviso.

En el historial de cada solicitud se indica si el correo se envió.

> El cliente con cuenta puede cancelar su solicitud mientras esté Pendiente o
> Contactada, y ve el historial con tus mensajes en **Mi cuenta**.
`.trim(),
  },
  {
    id: "reportes",
    title: "Reportes",
    markdown: `
En **Reportes** ves cómo van las solicitudes en un periodo. Elige **30, 90 o 365
días** o un rango propio, y si se cuenta por **fecha de solicitud** o por
**fecha de viaje**. También puedes limitarlo a un plan. Todo se calcula solo a
partir de los estados de las solicitudes.

### Métricas principales

- **Solicitudes**: cuántas llegaron en el periodo.
- **Clientes contactados**: clientes distintos (por correo) cuyas solicitudes
  pasaron por *Contactado* o *Confirmado*.
- **Solicitudes efectivas**: confirmadas más completadas.
- **Efectividad**: efectivas sobre el total de solicitudes (y sobre las
  contactadas).
- **Plan más vendido**: el plan con más solicitudes efectivas.

### Pipeline

Debajo está el **pipeline**: una columna por etapa (**Sin contactar**,
**Contactados**, **Confirmados**, **Completados** y **Perdidas**, que agrupa
rechazadas, canceladas y vencidas). Cada tarjeta es una solicitud.

- **Arrastra** una tarjeta a otra columna para cambiar su estado. Al empezar a
  arrastrar solo se resaltan las columnas permitidas.
- Al soltar se abre la misma confirmación que en el detalle, con el mensaje para
  el cliente. Soltar en **Perdidas** rechaza (o anula, si estaba confirmada) y
  pide el motivo.
- Haz clic en el nombre para abrir el detalle.
- El tablero se actualiza solo cada pocos segundos.

### Detalle

- **Planes vendidos**: ranking de planes por ventas, junto a sus solicitudes.
- Personas confirmadas, **ingreso estimado** (precio por persona × personas) y
  tiempo promedio hasta la primera acción de la agencia.
- **Solicitudes por semana o mes**, **por estado** (con tasas de rechazo,
  cancelación y vencimiento), **ocupación confirmada de los próximos 30 días** y
  una tabla por plan.

**Exportar CSV** descarga las solicitudes del periodo filtrado. El archivo se
abre directamente en Excel.
`.trim(),
  },
  {
    id: "notificaciones",
    title: "Notificaciones",
    markdown: `
El panel te avisa al momento cuando:

- llega una **nueva solicitud**;
- un cliente **cancela** su solicitud;
- a una solicitud le quedan **menos de 24 horas** de cupo apartado;
- una solicitud **vence** porque nadie la confirmó a tiempo.

Cada aviso aparece como una **notificación emergente** en la pantalla (también
mientras navegas el sitio con tu cuenta de administrador). Haz clic en ella para
abrir la solicitud; queda marcada como leída.

En **Notificaciones** (menú lateral, con el número de no leídas) ves el
historial completo:

- Filtra entre **Todas** y **No leídas**.
- Haz clic en una notificación para abrir su solicitud.
- Usa los iconos de cada fila para **marcarla como leída o no leída** o
  **eliminarla**.
- Selecciona varias con las casillas para marcarlas o eliminarlas juntas, o usa
  **Marcar todas como leídas** y **Eliminar todas**.

Cada administrador tiene sus propias notificaciones: marcar o borrar las tuyas no
afecta a las de los demás.
`.trim(),
  },
  {
    id: "cuenta",
    title: "Usuarios y cuenta",
    markdown: `
### Usuarios

En **Usuarios** ves a todas las personas registradas, cuántas solicitudes tiene
cada una y su fecha de registro.

![Listado de usuarios](/manual/usuarios.png)

El selector de la columna **Rol** define los permisos:

- **Cliente**: puede navegar el sitio y enviar solicitudes.
- **Admin**: además accede a este panel de administración.

Cambia el rol con cuidado: dar **Admin** concede acceso completo al panel.

### Tu cuenta

Tu propio perfil se edita fuera del panel, en **Mi cuenta → Editar perfil**
(\`/cuenta/perfil\`).

![Pantalla de edición del perfil](/manual/perfil.png)

Ahí puedes actualizar tu **nombre**, **correo** y **teléfono**, y **cambiar la
contraseña**. Pulsa **Guardar cambios** para aplicar.
`.trim(),
  },
];
