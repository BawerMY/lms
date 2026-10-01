import { Router } from 'express';
import { CigarettesService } from './cigarettes.service';

export function createCigarettesRouter(service: CigarettesService): Router {
  const router = Router();

  // POST /api/cigarettes
  router.post('/', async (req, res, next) => {
    try {
      const log = await service.logCigarettes(req.body);
      res.status(201).json(log);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/cigarettes
  router.get('/', async (req, res, next) => {
    try {
      const logs = await service.getLogs(req.query as any);
      res.json(logs);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/cigarettes/sum
  router.get('/sum', async (req, res, next) => {
    try {
      const summary = await service.getSummary(req.query as any);
      res.json(summary);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/cigarettes/:id
  router.patch('/:id', async (req, res, next) => {
    try {
      const updated = await service.updateLog(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
