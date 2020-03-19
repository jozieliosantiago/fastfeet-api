import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();
    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    const { deliveryman_id, recipient_id, product } = req.body;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    const recipient = await Recipient.findByPk(recipient_id);

    if (!deliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found' });

    const order = await Order.create({
      product,
      deliveryman_id,
      recipient_id,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().min(5),
      recipient_id: Yup.number().min(1),
      deliveryman_id: Yup.number().min(1),
      // signature_id: Yup.number().min(1),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    const order = await Order.findByPk(req.params.id);

    if (!order) return res.status(400).json({ error: 'Order not found' });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad request' });

    const {
      product,
      recipient_id,
      deliveryman_id,
      canceled_at,
      start_date,
      end_date,
    } = req.body;

    if (deliveryman_id && !(await Deliveryman.findByPk(deliveryman_id)))
      return res.status(400).json({ error: 'Deliveryman not found' });

    if (recipient_id && !(await Recipient.findByPk(recipient_id)))
      return res.status(400).json({ error: 'Recipient not found' });

    await order.update({
      product,
      recipient_id,
      deliveryman_id,
      canceled_at,
      start_date,
      end_date,
    });

    return res.json(order);
  }

  async delete(req, res) {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(400).json({ error: 'Order not found' });
    await order.destroy();
    return res.json({ success: 'Order deleted' });
  }
}

export default new OrderController();
