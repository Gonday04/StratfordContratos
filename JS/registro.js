document.getElementById('formRegistro').addEventListener('submit', function(e) {
    // 1. Evitamos que la página parpadee
    e.preventDefault(); 

    // 2. Recolectamos los datos de las casillas
    const nuevoCandidato = {
        nombre: document.getElementById('regNombre').value,
        apellido: document.getElementById('regApellido').value,
        correo: document.getElementById('regCorreo').value,
        contrasena: document.getElementById('regContrasena').value,
        telefono: document.getElementById('regTelefono').value,
        carrera: document.getElementById('regCarrera').value
    };

    // 3. ¡Encendemos la manguera! Apuntamos a la bóveda de C#
    fetch('http://localhost:5084/api/auth/registro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoCandidato) // Convertimos el paquete a texto para el viaje
    })
    .then(response => response.json())
    .then(data => {
        // 4. Mostramos la respuesta de C# en la pantalla
        const mensaje = document.getElementById('mensajeRegistro');
        mensaje.style.display = 'block';

        // Si el mensaje dice "éxito", lo pintamos de verde Stratford
        if (data.mensaje.includes("éxito")) {
            mensaje.style.color = '#166534'; 
            mensaje.innerText = data.mensaje;
            document.getElementById('formRegistro').reset(); // Limpiamos las casillas automáticamente
        } else {
            // Si el correo ya existía, lo pintamos de rojo Stratford
            mensaje.style.color = '#cc1f1f'; 
            mensaje.innerText = data.mensaje;
        }
    })
    .catch(error => {
        // Por si olvidaste prender el servidor C#
        const mensaje = document.getElementById('mensajeRegistro');
        mensaje.style.display = 'block';
        mensaje.style.color = '#cc1f1f';
        mensaje.innerText = "No nos pudimos conectar con el servidor.";
    });
});