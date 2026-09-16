const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/boda')
    .then(() => console.log('Conectado a la BD "boda"'))
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
}, { collection: 'invitados' }); // <-- Apunta exactamente a tu colección

module.exports = mongoose.model('Invitado', invitadoSchema);