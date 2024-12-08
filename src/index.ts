import { AppDataSource } from "./data-source";
import express from 'express';
import routes from './routes';
import cookieParser from 'cookie-parser';
import { setupSecurity } from "./config/security.config";
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import { config } from './config/config';


const app = express();
app.use(express.json());
app.use(cookieParser());


setupSecurity(app);

const PORT = config.port; 

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection initialized');

    app.use(express.json());
    setupSecurity(app);

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/api', routes);

    app.listen(PORT, () => {
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => console.log('Error during Data Source initialization:', error));
