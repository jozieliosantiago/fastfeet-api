import { Op } from 'sequelize';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import Queue from '../../lib/Queue';
import CancelDeliveyMail from '../jobs/CancelDeliveyMail';

class CancelDeliveryController {
  async update(req, res) {
    const problem = await DeliveryProblem.findOne({
      where: {
        id: req.params.id,
      },
      include: [
        {
          model: Order,
          as: 'delivery',
          where: {
            canceled_at: null,
            end_date: null,
            start_date: {
              [Op.not]: null,
            },
          },
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
            },
            {
              model: Recipient,
              as: 'recipient',
            },
          ],
        },
      ],
    });

    if (!problem)
      return res.status(400).json({
        erro:
          'Problem not found. Cancellation can only be done when delivery has not been canceled, has not been completed and is in progress',
      });

    const order = await Order.findByPk(problem.delivery.id);

    await order.update({
      canceled_at: new Date(),
    });

    await Queue.add(CancelDeliveyMail.key, {
      deliveryman: problem.delivery.deliveryman,
      order: problem.delivery,
      recipient: problem.delivery.recipient,
    });

    return res.json({ message: 'Delivery canceled!' });
  }
}

export default new CancelDeliveryController();
