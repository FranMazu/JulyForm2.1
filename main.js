const fs = require('fs');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const connectDB = require('./db');
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Asegurar carpeta uploads
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Configuración Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Modelo de MongoDB
const mongoose = require('mongoose');
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

// Ruta para procesar el formulario
app.post('/send', upload.fields([
    { name: 'archivo', maxCount: 1 },
    { name: 'foto', maxCount: 1 }
]), async (req, res) => {
    try {
        const { nombre, email, cuit, telefono, opciones } = req.body;
        const archivo = req.files['archivo'] ? req.files['archivo'][0] : null;
        const foto = req.files['foto'] ? req.files['foto'][0] : null;

        // Guardar en MongoDB
        await new Formulario({ nombre, email, cuit, telefono, opciones }).save();

        // Configurar email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Nuevo formulario recibido',
            text: `Nombre: ${nombre}\nEmail: ${email}\nCUIT: ${cuit}\nTeléfono: ${telefono}\nOpción: ${opciones}`,
            attachments: [
                archivo ? { filename: archivo.originalname, path: archivo.path } : null,
                foto ? { filename: foto.originalname, path: foto.path } : null
            ].filter(a => a !== null)
        };

        await transporter.sendMail(mailOptions);

        // Borrar archivos después de enviarlos
        [archivo, foto].forEach(file => {
            if (file) fs.unlink(file.path, err => err && console.error(err));
        });

        res.json({ message: 'Formulario enviado con éxito' });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ message: 'Error al procesar el formulario' });
    }
});


app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));