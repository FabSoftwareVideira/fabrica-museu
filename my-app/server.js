const express = require('express');
const app = express();
const path = require('path');

const morgan = require('morgan');
const helmet = require('helmet');
const { title } = require('process');

require('dotenv').config();

const PORT = process.env.PORT || 2000;

//Adicionei o helmet e o morgan (São adicionais)
app.use(helmet())
app.use(morgan('dev'))

// Aqui eu to configurando a engine 
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Rota principal
app.get('/', (req, res) => {
    // res.render manda o EJS desenhar o arquivo 'index.ejs'
    res.render('index', { title: 'O EJS está funcionando perfeitamente!' });
});

app.get('/test', (req, res) => {
    res.render('index', { 
        mensagem: 'O EJS está funcionando!',
        whatsapp: process.env.WHATSAPP_MENSAGEM
    });
});