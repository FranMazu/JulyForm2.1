document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (!form) {
        console.error("No se encontró el formulario en la página.");
        return;
    }

    const backendUrl = "https://julyform21-production.up.railway.app"; // URL fija para evitar problemas

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita recargar la página

        const formData = new FormData(form); // Captura todo, incluyendo archivos
        console.log("Enviando a:", backendUrl);

        try {
            const response = await fetch(`${backendUrl}/send`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert('¡Formulario enviado con éxito!');
                console.log('Respuesta del servidor:', data);
                form.reset(); // Limpia el formulario después de enviarlo
            } else {
                throw new Error('Error en la respuesta del servidor.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un problema al enviar el formulario. Por favor, intentá de nuevo.');
        }
    });
});
