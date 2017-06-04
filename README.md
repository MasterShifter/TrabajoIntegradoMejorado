# TrabajoIntegradoMejorado
Voy a intentar hacer el trabajo integrado con los conocimientos que estoy adquiriendo en las prácticas, ya que con Spring no iba a poder llegar a acabar, porque no tengo tiempo para aprenderlo ni para solucionar los tantos errores que tiene.

# ¿Cómo está formada?
Consiste en una API restfull para crear usuarios, eventos y mensajes, también pueden editarse usuarios y eventos y pueden eliminarse quedadas. Los usuarios también pueden unirse a eventos para transmitir que van a acudir a él.

El servidor también ofrece un modelo vista controlador para consumir la API, la página es totalmente responsive por lo que se adapta a una vista de escritorio o una vista de smartphone.

# ¿Qué puedes hacer ya?
- Crear un usuario, iniciar sesión con él o cerrar sesión.
- Ver los eventos o usuarios disponibles.
- Ver los perfiles de otros usuarios o editarlos (si eres admin), por defecto solo puedes editar el tuyo propio.
- Ver, crear, editar o eliminar eventos, estas dos últimas solo si eres admin o el creador del evento.
- Comentar o unirte en los eventos.

# ¿Cómo se despliega?
Necesitamos descargar Node.js de su página oficial y una vez instalado, con la consola de comandos en el directorio del proyecto escribimos

npm install

Esto bajara los modulos necesarios (dependencias) para el proyecto, seguido de:

npm start

Podemos desplegar el app de modo local y verlo con la url:

http://localhost:3001/

Para hacer pruebas directamente con la API es conveniente tener un programa como Postman para enviar paquetes a una URL y cambiar entre GET, POST, PUT o DELETE.
