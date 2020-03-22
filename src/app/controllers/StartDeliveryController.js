import {
  format,
  isWithinInterval,
  setHours,
  setMinutes,
  setSeconds,
  parseISO,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';

class StartDeliveryController {
  async update(req, res) {
    const start_date = format(new Date(), `yyyy-MM-dd'T'HH:mm:ssxxx`);

    const startHour = format(
      setSeconds(setMinutes(setHours(parseISO(start_date), 8), 0), 0),
      `yyyy-MM-dd'T'HH:mm:ssxxx`
    );

    const endHour = format(
      setSeconds(setMinutes(setHours(parseISO(start_date), 23), 0), 0),
      `yyyy-MM-dd'T'HH:mm:ssxxx`
    );

    if (
      !isWithinInterval(parseISO(start_date), {
        start: parseISO(startHour),
        end: parseISO(endHour),
      })
    )
      return res.status(401).json({
        error: 'You can only start deliveries between 08:00 AM and 18:00 PM.',
      });

    const existDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!existDeliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    const order = await Order.findOne({
      where: {
        id: req.params.deliverieId,
        deliveryman_id: req.params.id,
      },
    });

    if (!order) return res.status(400).json({ error: 'Order not found' });

    const deliveries = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        start_date: {
          [Op.between]: [
            startOfDay(parseISO(start_date)),
            endOfDay(parseISO(start_date)),
          ],
        },
      },
    });

    if (deliveries.length === 5)
      return res
        .status(401)
        .json({ error: 'You can only start 5 deliveries per day' });

    if (order.canceled_at !== null)
      return res
        .status(401)
        .json({ error: 'You cannot start deliveries already canceled' });

    if (order.end_date !== null)
      return res
        .status(401)
        .json({ error: 'You cannot start deliveries already completed' });

    if (order.start_date !== null)
      return res
        .status(401)
        .json({ error: 'This delivery has already started' });

    await order.update({
      start_date: parseISO(start_date),
    });

    return res.json(order);
  }
}

export default new StartDeliveryController();
