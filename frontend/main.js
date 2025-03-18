document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded ejecutado');
    
    const form = document.querySelector('form');
    
    if (!form) {
        console.error('No se encontró el formulario en el DOM');
        return;
    }
    
    console.log('Formulario encontrado:', form);
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar recarga de la página

        const formData = new FormData(form);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://julyform21-production.up.railway.app";
        
        console.log('Intentando enviar datos a:', `${backendUrl}/send`);
        console.log('Datos del formulario:', [...formData.entries()]);
        
        try {
            const response = await fetch(`${backendUrl}/send`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                alert('¡Formulario enviado con éxito!');
                console.log('Respuesta del servidor:', data);
                form.reset();
            } else {
                throw new Error('Error en la respuesta del servidor.');
            }
        } catch (error) {
            console.error('Error en el envío:', error);
            alert('Hubo un problema al enviar el formulario. Por favor, intentá de nuevo.');
        }
    });
});