import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Queue from '../../lib/Queue';
import NewOrderMail from '../jobs/NewOrderMail';

class OrderController {
  async index(req, res) {
    let page =
      req.query.page && Number(req.query.page) > 0 ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    const totalRecords = await Order.count();
    const total_pages = Math.ceil(totalRecords / limit);

    if (Number(page) > total_pages) page = total_pages;

    const response = {
      total_records: totalRecords,
      total_pages,
      page: Number(page),
      next_page:
        Number(page) === Math.ceil(totalRecords / limit)
          ? null
          : Number(page) + 1,
      prev_page: Number(page) === 1 ? null : Number(page) - 1,
    };

    const orders = await Order.findAll({
      limit,
      offset: (page - 1) * limit,
      order: ['createdAt'],
    });

    response.data = orders;

    return res.json(response);
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

    await Queue.add(NewOrderMail.key, {
      deliveryman,
      order,
      recipient,
    });

    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().min(5),
      recipient_id: Yup.number().min(1),
      deliveryman_id: Yup.number().min(1),
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
