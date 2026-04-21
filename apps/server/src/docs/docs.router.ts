import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocument } from './openapi';
import { requireRole, requireSession } from '@/middleware/auth.middleware';

const router = Router();

const spec = generateOpenApiDocument();

router.use('/', swaggerUi.serve);
router.get('/',
  requireSession,
  requireRole(['admin']),
  swaggerUi.setup(spec)
);

export default router;
