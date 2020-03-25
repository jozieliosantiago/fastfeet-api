import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';

class DeliveriesMadeController {
  async index(req, res) {
    const existDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!existDeliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    let page =
      req.query.page && Number(req.query.page) > 0 ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    const deliveriesMade = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: {
          [Op.not]: null,
        },
      },
      limit,
      offset: (page - 1) * limit,
      order: [['end_date', 'DESC']],
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

    if (deliveriesMade.length === 0)
      return res.json({ message: 'No delivery made' });

    const totalRecords = await Order.count({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: {
          [Op.not]: null,
        },
      },
    });
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

    response.data = deliveriesMade;

    return res.json(response);
  }
}

export default new DeliveriesMadeController();
