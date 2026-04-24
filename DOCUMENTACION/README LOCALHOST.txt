====================================================================
           GUIA DE INSTALACION LOCAL - PROYECTO STRATFORD
====================================================================

Sigue estos pasos EXACTAMENTE en este orden para ejecutar la 
plataforma de reclutamiento Stratford en tu computadora.

--------------------------------------------------------------------
PASO 1: VERIFICAR REQUISITOS (LO QUE NECESITAS INSTALADO)
--------------------------------------------------------------------
Antes de tocar el codigo, asegurate de tener instalados estos 
programas en tu computadora:
1. MySQL Workbench y MySQL Server.
2. Visual Studio Code (VS Code).
3. SDK de .NET 9.0 (Si no lo tienes, buscalo en Google como 
   "Download .NET 9.0 SDK" e instalalo).

--------------------------------------------------------------------
PASO 2: CREAR LA BASE DE DATOS EN MYSQL WORKBENCH
--------------------------------------------------------------------
1. Abre MySQL Workbench e inicia sesion en tu servidor local 
   (usualmente haciendo clic en "Local instance MySQL80").
   Te pedira tu contrasena de root (la que pusiste al instalarlo).
2. Ve al menu de arriba y da clic en "File" > "Open SQL Script...".
3. Busca y selecciona el archivo "BaseDeDatos.sql" que viene 
   incluido en esta carpeta.
4. Una vez que se abra el codigo en la pantalla, da clic en el 
   icono del rayito amarillo (Execute) que esta en la barra de 
   herramientas.
5. Revisa la ventana de abajo (Output). Si ves palomitas verdes, 
   la base de datos "StratfordDB" y la tabla de "Candidatos" ya 
   se crearon con exito. Puedes cerrar MySQL Workbench.

--------------------------------------------------------------------
PASO 3: PONER TU CONTRASENA EN EL CODIGO (BACKEND)
--------------------------------------------------------------------
El servidor C# necesita la llave para entrar a tu base de datos:
1. Abre Visual Studio Code.
2. Ve a "Archivo" > "Abrir carpeta..." y selecciona la carpeta 
   azul llamada "StratfordAPI" (El backend).
3. En la lista de archivos de la izquierda, da clic en el archivo 
   llamado "appsettings.json".
4. Busca la linea que dice "DefaultConnection". Se ve asi:
   "Server=localhost;Port=3306;Database=StratfordDB;User=root;Password=AQUI_PON_TU_CONTRASENA;"
5. Borra el texto "AQUI_PON_TU_CONTRASENA" y escribe exactamente 
   la contrasena de root que usas para entrar a tu MySQL.
   (Cuidado: No borres el punto y coma ';' del final).
6. Presiona Ctrl + S para guardar el archivo.

--------------------------------------------------------------------
PASO 4: ENCENDER EL SERVIDOR (LA API)
--------------------------------------------------------------------
1. Sin cerrar VS Code, ve al menu de arriba y selecciona 
   "Terminal" > "Nuevo Terminal" (o New Terminal).
2. Se abrira un panel en la parte inferior. Asegurate de que la 
   ruta termine en la carpeta del proyecto (ej. ...\StratfordAPI>).
3. Escribe el siguiente comando y presiona Enter:
   dotnet run
4. El sistema empezara a compilar. Espera unos segundos hasta 
   que veas unas letras verdes que digan:
   "Now listening on: http://localhost:5084"
5. ¡ALTO! No cierres esta ventana ni VS Code. El servidor debe 
   quedarse prendido en el fondo para que la pagina funcione.

--------------------------------------------------------------------
PASO 5: USAR LA PAGINA (FRONTEND)
--------------------------------------------------------------------
1. Abre tu explorador de archivos normal de Windows.
2. Entra a la carpeta del Frontend (donde estan los archivos HTML, 
   CSS y JS).
3. Da doble clic en el archivo "index.html". Se abrira en tu 
   navegador predeterminado (Chrome, Edge, etc.).
4. Ya puedes probar el sistema: 
   - Da clic en "Registrarse", crea una cuenta nueva.
   - Vuelve al Login e inicia sesion con ese correo y contrasena.
   - Al entrar a los contratos, veras que el sistema te saluda 
     por tu nombre y autocompleta tus datos.

====================================================================
Fin de las instrucciones. ¡Exito con la ejecucion!
====================================================================