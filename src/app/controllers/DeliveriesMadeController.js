import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveriesMadeController {
  async index(req, res) {
    const existDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!existDeliveryman)
      return res.satatus(400).json({ error: 'Deliveryman not found' });

    const deliveriesMade = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: {
          [Op.not]: null,
        },
      },
      order: ['createdAt'],
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'createdAt',
        'updatedAt',
      ],
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

    return res.json(deliveriesMade);
  }
}

export default new DeliveriesMadeController();
