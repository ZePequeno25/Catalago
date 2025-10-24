const app = require('./config/app');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({path: path.join(__dirname, '..','.env')});
console.log('Variável de ambiente PORT:', process.env.PORT);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serviço rodando na porta: ${PORT}`);
});