import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanOrderController {
  async index(req, res) {
    const existsDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!existsDeliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      order: ['createdAt'],
      attributes: ['product', 'start_date', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'name',
            'street',
            'number',
            'neighborhood',
            'address_complement',
            'state',
            'city',
            'zip_code',
          ],
        },
      ],
    });

    if (orders.length === 0)
      return res.json({ message: 'No deliveries to be made' });

    return res.json(orders);
  }
}

export default new DeliverymanOrderController();
