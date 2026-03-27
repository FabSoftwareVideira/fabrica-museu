const express = require('express');
const app = express();
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 2000;

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Rota principal
app.get('/', (req, res) => {
    // res.render manda o EJS desenhar o arquivo 'index.ejs'
    res.render('index', { mensagem: 'O EJS está funcionando perfeitamente!' });
});

app.get('/test', (req, res) => {
    res.render('index', { 
        mensagem: 'O EJS está funcionando!',
        whatsapp: process.env.WHATSAPP_NUMERO 
    });
});