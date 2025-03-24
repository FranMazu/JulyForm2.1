const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();

// Tomar variables desde el entorno o la terminal
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!MONGO_URI || !EMAIL_USER || !EMAIL_PASS) {
    console.error("❌ ERROR: Faltan variables de entorno (MONGO_URI, EMAIL_USER, EMAIL_PASS)");
    process.exit(1);
}

// Conectar a MongoDB
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => {
      console.error('❌ Error al conectar con MongoDB:', err);
      process.exit(1);
  });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Servir archivos estáticos desde public
app.use(express.static(path.join(__dirname, "public")));

// Modelo de datos
const FormSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    cuit: String,
    telefono: String,
    opciones: String,
    fecha: { type: Date, default: Date.now }
});
const Formulario = mongoose.model('Formulario', FormSchema);

// Configuración de almacenamiento para archivos
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// Ruta para recibir formularios
app.post('/send', upload.fields([{ name: 'archivo' }, { name: 'foto' }]), async (req, res) => {
    try {
        const { nombre, email, cuit, telefono, opciones } = req.body;
        const archivosAdjuntos = [];

        // Guardar en MongoDB
        await new Formulario({ nombre, email, cuit, telefono, opciones }).save();

        // Adjuntar archivos si existen
        ['archivo', 'foto'].forEach(key => {
            if (req.files[key]) {
                archivosAdjuntos.push({ filename: req.files[key][0].originalname, path: req.files[key][0].path });
            }
        });

        // Enviar email
        await transporter.sendMail({
            from: EMAIL_USER,
            to: EMAIL_USER,
            subject: 'Nuevo formulario recibido',
            text: `Nombre: ${nombre}\nEmail: ${email}\nCUIT: ${cuit}\nTeléfono: ${telefono}\nOpción: ${opciones}`,
            attachments: archivosAdjuntos
        });

        // Eliminar archivos después de enviarlos
        archivosAdjuntos.forEach(file => fs.unlink(file.path, err => err && console.error(err)));

        res.json({ message: '✅ Formulario enviado con éxito' });
    } catch (error) {
        console.error('❌ Error en el servidor:', error);
        res.status(500).json({ message: 'Error al procesar el formulario' });
    }
});

// Ruta para servir index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));