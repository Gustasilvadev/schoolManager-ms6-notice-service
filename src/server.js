require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`NoticeService rodando na porta ${PORT}`);
  console.log(`Documentação Swagger: http://localhost:${PORT}/api-docs`);
});