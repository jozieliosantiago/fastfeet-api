import { Router } from 'express';
import multer from 'multer';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import OrderController from './app/controllers/OrderController';
import DeliverymanOrderController from './app/controllers/DeliverymanOrderController';
import DeliveriesMadeController from './app/controllers/DeliveriesMadeController';
import StartDeliveryController from './app/controllers/StartDeliveryController';
import EndDeliveryController from './app/controllers/EndDeliveryController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import DeliveryProblemByOrderIdController from './app/controllers/DeliveryProblemByOrderIdController';
import CancelDeliveryController from './app/controllers/CancelDeliveryController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/session', SessionController.store);

// deliverymen orders routes
routes.get('/deliveryman/:id/deliveries', DeliverymanOrderController.index);
routes.get('/deliveryman/:id/deliveries/made', DeliveriesMadeController.index);
routes.put(
  '/deliveryman/:id/deliveries/start/:deliverieId',
  StartDeliveryController.update
);
routes.put(
  '/deliveryman/:id/deliveries/end/:deliverieId',
  upload.single('signature'),
  EndDeliveryController.update
);

// deliveries with problems
routes.get('/delivery/problems', DeliveryProblemController.index);
routes.post('/delivery/:id/problems', DeliveryProblemController.store);
routes.get('/delivery/:id/problems', DeliveryProblemByOrderIdController.index);
routes.put(
  '/delivery/problem/:id/cancel-delivery',
  CancelDeliveryController.update
);

routes.use(authMiddleware);
routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);

// deliveryman routes
routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:id', DeliverymanController.update);
routes.delete('/deliveryman/:id', DeliverymanController.delete);

// orders routes
routes.get('/orders', OrderController.index);
routes.get('/orders/:id', OrderController.indexById);
routes.post('/orders', OrderController.store);
routes.put('/orders/:id', OrderController.update);
routes.delete('/orders/:id', OrderController.delete);

routes.post('/files', upload.single('avatar'), FileController.store);

export default routes;
