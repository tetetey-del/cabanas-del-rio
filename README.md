# Cabañas del Río — Sistema de estadías

Reservas públicas y panel `/admin` para un complejo familiar de cabañas sobre el río.
En temporada alta se alquila por semana completa (sábado a sábado) y, si una semana se
llena, las familias se anotan en una lista de espera ordenada por llegada.

**Sin backend:** todo se guarda en el `localStorage` del navegador. No hay cuentas, cobros
ni envíos automáticos. Pensado primero para celular (probado a 360 px de ancho).

## Cómo arrancarlo

Requisitos: Node 18 o superior.

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # versión para publicar en dist/
npm test           # pruebas de las reglas (temporadas, cupo, lista de espera)
```

Para publicar en Vercel: importar el repositorio, framework **Vite**, sin variables
obligatorias. `vercel.json` ya redirige todas las rutas a `index.html` (necesario para `/admin`).

## Panel de anfitriones

- Dirección: `/admin` (también hay un enlace al pie de la página de inicio).
- **Clave de ejemplo: `rio2027`**

### Cómo cambiar la clave del panel

1. **Con variable de entorno (recomendado):** definir `VITE_CLAVE_PANEL` en un archivo
   `.env` (ver `.env.example`) o en las variables del hosting (en Vercel:
   *Settings → Environment Variables*) y volver a publicar.
2. **En el código:** cambiar el valor por defecto en `src/config.ts` (`CLAVE_PANEL`).

La sesión del panel se guarda en `sessionStorage`: se cierra sola al cerrar la pestaña.
Es una clave de demostración: al no haber backend no protege datos reales.

## Qué está simulado

| Qué | Cómo se comporta |
| --- | --- |
| Base de datos | `localStorage`, clave `cabanas-del-rio:datos:v1`. Cada navegador ve sus propios datos. |
| Pagos | No hay cobros. La reserva muestra el total y queda confirmada. |
| WhatsApp | «Avisar por WhatsApp» arma el texto (semana, categoría y total), abre `wa.me` con el mensaje cargado y pasa a la familia a «Avisada». **La app no envía nada sola:** lo manda una persona. El mensaje también se puede copiar. |
| Usuarios | No hay cuentas. El panel usa una sola clave. |

Toda la lógica de negocio está en funciones puras (`src/lib/reglas.ts`) y el guardado en
`src/store.tsx`, así que para conectar un backend alcanza con reemplazar las acciones del store.

## Datos de ejemplo

Todos los nombres, celulares y reservas son **inventados**. Están en `src/data/ejemplo.ts` y se
cargan solos la primera vez. Incluyen, para que la demo se entienda sin configurar nada:

- Semana del 9 al 16 de enero, Para 6: **completa**, con 3 familias en la lista.
- Semana del 16 al 23 de enero, Para 6: completa, con 1 familia anotada.
- Semana del 23 al 30 de enero, Para 4: completa, con 2 familias anotadas.
- Semana del 30 de enero al 6 de febrero, Para 6: se canceló una reserva, la primera familia avisada no
  respondió (Descartada) y el panel resalta a la **siguiente para avisar**.
- Semana del 6 al 13 de febrero, Para 4: una familia «Avisada» esperando respuesta.
- Reservas por noche en noviembre, diciembre (temporada media) y marzo.

### Cómo reiniciar los datos de ejemplo

- Desde el panel: **`/admin` → Datos → Reiniciar datos de ejemplo**.
- O a mano: borrar la clave `cabanas-del-rio:datos:v1` del `localStorage` (DevTools →
  Application → Local Storage) y recargar la página.

## Reglas implementadas

Configurables en `src/config.ts` (cabañas, precios, temporadas, horarios; todos de ejemplo).

- **Cabañas:** Para 4 (Sauce, Molle, Tala) y Para 6 (Algarrobo, Chañar). La familia elige la
  categoría y la app asigna la primera cabaña libre en el orden del catálogo.
- **Temporada alta (2 ene – 27 feb 2027):** se generan 8 semanas desde el sábado inicial. Solo se
  eligen semanas completas, una o varias seguidas. Para 4 $700.000 y Para 6 $980.000 por semana.
- **Media (15 dic – 1 ene y julio)** y **baja (resto del año):** por noche; cada noche se cobra según
  su fecha y el mínimo (3 o 2 noches) lo fija la noche de llegada.
- Una estadía por noche puede terminar justo el 2 de enero o empezar el 27 de febrero, pero no puede
  tener noches en temporada alta: se rechaza con «En enero y febrero alquilamos de sábado a sábado».
- **Cupo:** cada semana arranca con 3 lugares en Para 4 y 2 en Para 6. Cada reserva ocupa una cabaña
  por cada semana que incluye; cancelar libera el lugar. Fuera de temporada alta el cupo se controla
  por noche y por cabaña, sin lista de espera.
- **Lista de espera:** guarda semana, categoría, nombre, celular, personas y fecha y hora. Un mismo
  celular no se anota dos veces en la misma semana y categoría. Estados: Esperando, Avisada, Reservó y
  Descartada. La posición se muestra apenas la familia se anota.
- **Siguiente para avisar:** si una semana tiene lugar libre y familias anotadas, el panel resalta a la
  primera «Esperando» de esa categoría. La lista no bloquea la reserva: el lugar sigue abierto al público.

### Decisiones tomadas (no estaban definidas en el briefing)

- Si hay una familia «Avisada» esperando respuesta, ese lugar se considera en aviso y no se resalta a
  la siguiente hasta marcarla como «Descartada» (botón «No respondió · Descartar») o «Reservó».
- Una reserva de varias semanas usa la misma cabaña en todas; si ninguna está libre en todo el rango,
  se asigna la primera libre de cada semana.
- Si una familia anotada reserva desde el sitio con el mismo celular, su anotación pasa sola a «Reservó».
- Las personas se limitan a la capacidad de la categoría (4 o 6).

## Estructura

```
src/
  config.ts           Negocio, cabañas, temporadas, precios y clave del panel
  lib/reglas.ts       Reglas (temporadas, semanas, cupo, lista de espera, texto de aviso)
  lib/reglas.test.ts  Pruebas de las reglas
  lib/fechas.ts       Fechas en formato AAAA-MM-DD y textos en español
  data/ejemplo.ts     Datos de ejemplo
  store.tsx           Estado + localStorage
  pages/              Pantallas públicas (inicio, reservar, datos, confirmación, lista de espera)
  pages/admin/        Panel: semanas, detalle de semana, lista, reservas, datos
```

Stack: React 18, TypeScript, Vite, Tailwind CSS 3, React Router. Tipografías Lora y Nunito Sans
incluidas en el proyecto (sin servicios externos).
