document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contact-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const backendUrl = window.location.origin;

        try {
            const response = await fetch(`${backendUrl}/send`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('✅ Formulario enviado con éxito!');
                form.reset();
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('❌ Error en el envío:', error);
            alert('Hubo un problema al enviar el formulario.');
        }
    });
});