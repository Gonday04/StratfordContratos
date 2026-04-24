
       GUIA DE DESPLIEGUE EN HOSTINGER - STRATFORD

Este documento contiene las instrucciones para implementar el 
proyecto en un entorno de produccion utilizando Hostinger 
para la Base de Datos y el Frontend.

------------------------------------------------------------
1. CREACION DE LA BASE DE DATOS EN LA NUBE
------------------------------------------------------------
1. Entra al hPanel de Hostinger.
2. Ve a la seccion "Bases de Datos" > "Bases de Datos MySQL".
3. Crea una base de datos nueva. Anota y guarda estos 3 datos 
   generados (Hostinger les agregara un prefijo, ej. u123_):
   - Nombre de la base de datos
   - Usuario de la base de datos
   - Contrasena

------------------------------------------------------------
2. IMPORTACION DE TABLAS (phpMyAdmin)
------------------------------------------------------------
1. Ahi mismo en Hostinger, da clic en "Entrar a phpMyAdmin".
2. Selecciona tu nueva base de datos en el panel izquierdo.
3. Ve a la pestana "Importar" en el menu superior.
4. Selecciona el archivo "BaseDeDatos.sql" incluido en este 
   paquete y da clic en "Continuar" para crear la estructura.

------------------------------------------------------------
3. HABILITAR CONEXION REMOTA (VITAL PARA LA API)
------------------------------------------------------------
Por seguridad, Hostinger bloquea conexiones externas. Para que 
el codigo C# pueda mandar datos a la nube:
1. En Hostinger, ve a "Bases de Datos" > "MySQL Remoto".
2. En el campo de "Direccion IP", ingresa la IP publica de la 
   computadora donde estara corriendo la API. 
   (Puedes buscar "Cual es mi IP" en Google).
3. Da clic en "Guardar".

------------------------------------------------------------
4. CONFIGURAR LA API (BACKEND)
------------------------------------------------------------
1. Abre el archivo "appsettings.json" en tu proyecto C#.
2. Actualiza la cadena "DefaultConnection" con los datos del
   Paso 1 y la IP de tu servidor Hostinger. Ejemplo:
   Server=IP_HOSTINGER;Port=3306;Database=u123_TuBase;User=u123_TuUsuario;Password=TuPassNube;
3. Guarda y ejecuta "dotnet run". La API ahora guardara a los 
   candidatos directamente en la nube.

------------------------------------------------------------
5. SUBIR EL FRONTEND AL HOSTING
------------------------------------------------------------
1. En Hostinger, ve a "Archivos" > "Administrador de Archivos".
2. Abre la carpeta publica llamada "public_html".
3. Arrastra y suelta todos los archivos de la carpeta Frontend 
   (index.html, registro.html, carpetas de CSS y JS).
4. Verifica que los archivos .js ("registro.js" y "contratos.js")
   tengan la URL correcta en el "fetch" apuntando a donde 
   este corriendo tu API C# (ej. http://IP_DE_TU_API:5084/api...).

Sistema configurado para entorno de produccion.
