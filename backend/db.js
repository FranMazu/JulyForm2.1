const mongoose = require('mongoose');
require('dotenv').config(); // Cargar variables de entorno

const connectDB = async () => {
    console.log('📡 Intentando conectar a MongoDB...');
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`🔥 Conectado a MongoDB Atlas: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error al conectar con MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
