const fs = require('fs');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const connectDB = require('./db');
connectDB();

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Esquema para los datos del formulario
const FormSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    cuit: String,
    telefono: String,
    opciones: String,
    fecha: { type: Date, default: Date.now }
});
const Formulario = mongoose.model('Formulario', FormSchema);

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Ruta para procesar el formulario y los archivos
app.post('/send', upload.fields([
    { name: 'archivo', maxCount: 1 },
    { name: 'foto', maxCount: 1 }
]), async (req, res) => {
    try {
        const { nombre, email, cuit, telefono, opciones } = req.body;
        const archivo = req.files['archivo'] ? req.files['archivo'][0] : null;
        const foto = req.files['foto'] ? req.files['foto'][0] : null;

        // Guardar datos en MongoDB
        await new Formulario({ nombre, email, cuit, telefono, opciones }).save();
        console.log('✅ Datos guardados en MongoDB');

        // Configuración del email con archivos adjuntos
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Nuevo formulario recibido',
            text: `Datos del formulario:\n\nNombre y Apellido: ${nombre}\nCorreo Electrónico: ${email}\nCUIT: ${cuit}\nTeléfono: ${telefono}\nOpción seleccionada: ${opciones}`,
            attachments: [
                archivo ? { filename: archivo.originalname, path: archivo.path } : null,
                foto ? { filename: foto.originalname, path: foto.path } : null
            ].filter(a => a !== null)
        };

        // Enviar el email
        await transporter.sendMail(mailOptions);
        console.log('📩 Correo enviado con archivos adjuntos');

        // Eliminar archivos después de enviarlos
        [archivo, foto].forEach(file => {
            if (file) {
                fs.unlink(file.path, err => {
                    if (err) console.error(`❌ Error al eliminar ${file.path}:`, err);
                    else console.log(`🗑️ Archivo ${file.path} eliminado`);
                });
            }
        });

        res.json({ message: 'Formulario recibido y procesado con éxito' });
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
        res.status(500).json({ message: 'Error al procesar el formulario' });
    }
});

// Servir el frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

