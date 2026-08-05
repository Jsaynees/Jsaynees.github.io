# Curso de inducción: registro de resultados

El sitio usa un Google Apps Script vinculado a la hoja de cálculo para registrar:

- `Diagnostico`
- `Encuesta`
- `Final`

El archivo [`induccion-apps-script.gs`](induccion-apps-script.gs) contiene la versión que reconoce los tres tipos de envío y evita duplicados del examen final.

## Actualizar Apps Script

1. En la hoja de resultados, abre **Extensiones → Apps Script**.
2. Conserva en privado los valores actuales de `TOKEN` y `CORREO`.
3. Sustituye el código del editor por el contenido de `induccion-apps-script.gs`.
4. Vuelve a colocar tus valores privados en `TOKEN` y `CORREO`. No los subas a GitHub.
5. Guarda el proyecto.
6. Abre **Implementar → Administrar implementaciones**.
7. Edita la implementación web actual, selecciona **Nueva versión** y pulsa **Implementar**.
8. Conserva la misma URL terminada en `/exec`; las páginas ya usan esa URL.

La pestaña `Final` se crea automáticamente al recibir el primer examen confirmado.

## Verificación segura

1. Presenta el examen con el nombre `PRUEBA` y un grupo válido.
2. Confirma que aparece una sola fila en `Final`.
3. Pulsa **Reintentar envío** o recarga si se simuló una interrupción: el mismo `ID de envío` no debe crear una segunda fila.
4. Abre `induccion-panel.html`, escribe el token docente y comprueba las estadísticas del examen final.
5. Elimina después la fila `PRUEBA`.

El servidor devuelve `{ok:true}` únicamente después de guardar la fila o de reconocer un reintento ya guardado. Los tipos desconocidos se rechazan y nunca se mandan por error a `Diagnostico`.
