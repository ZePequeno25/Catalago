const app = require('./config/app');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({path: path.join(__dirname, '..','.env')});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serviço rodando na porta: ${PORT}`);
});