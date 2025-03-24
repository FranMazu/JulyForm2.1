document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contact-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        try {
            const response = await fetch('/send', { method: 'POST', body: formData });

            if (!response.ok) throw new Error('Error en el servidor');

            alert('✅ Formulario enviado con éxito!');
            form.reset();
        } catch (error) {
            console.error('❌ Error en el envío:', error);
            alert('Hubo un problema al enviar el formulario.');
        }
    });
});