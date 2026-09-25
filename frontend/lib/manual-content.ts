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
plan: al desmarcarla, el plan sigue visible pero aparece como **agotado**.

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
más reciente a la más antigua.

![Listado de solicitudes](/manual/solicitudes.png)

Cada fila muestra el **cliente** (y si es un usuario registrado o un invitado), su
**contacto**, el **plan**, la **fecha de viaje**, el número de **personas** y el
**estado**. Si el cliente dejó un mensaje, aparece bajo su nombre.

### Estados

Cambia el estado con el selector de la columna **Estado**:

- **Pendiente**: recién recibida, aún sin gestionar.
- **Contactado**: ya te comunicaste con el cliente.
- **Confirmado**: la reserva se concreta. **Solo las solicitudes confirmadas
  ocupan disponibilidad** (restan cupo o marcan el día como ocupado según el modo
  del plan).
- **Cancelada**: la solicitud se descarta y libera la disponibilidad que hubiera
  ocupado.

> Como una solicitud confirmada consume cupo, revisa la disponibilidad del plan
> antes de confirmar en fechas muy solicitadas.
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
