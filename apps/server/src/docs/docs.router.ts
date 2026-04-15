import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './openapi';

const router = Router();

const spec = generateOpenApiDocument();

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(spec));

export default router;
