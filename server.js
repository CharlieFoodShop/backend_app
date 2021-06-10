const express = require('express');
const app = express();
const config = require('./config');

const test = require('./router/test');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/test', test);

app.listen(config.default_port,
    () => console.log('Server is running.'));