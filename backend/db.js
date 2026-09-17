const mongoose = require('mongoose');

// El secreto está aquí: process.env.MONGODB_URI lo usará Render. Si no existe, usa tu localhost.
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boda';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Conectado a MongoDB correctamente'))
    .catch((err) => console.error(err));

const invitadoSchema = new mongoose.Schema({
    nombres: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    estadoAsistencia: { 
        type: String, 
        enum: ['Pendiente', 'Asistirá', 'No asistirá'], 
        default: 'Pendiente' 
    },
    limiteModificacion: { type: Date, required: true }
}, { collection: 'invitados' });

module.exports = mongoose.model('Invitado', invitadoSchema);