document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar recarga de la página

        const formData = new FormData(form); // Captura todo, incluyendo los archivos
        console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/send`, {
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