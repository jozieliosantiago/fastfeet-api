import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanOrderController {
  async index(req, res) {
    const existsDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!existsDeliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    let page =
      req.query.page && Number(req.query.page) > 0 ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    const orders = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      order: ['createdAt'],
      attributes: ['id', 'start_date', 'createdAt', 'updatedAt'],
      limit,
      offset: (page - 1) * limit,
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

    const totalRecords = await Order.count({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
    });

    const total_pages = Math.ceil(totalRecords / limit);

    if (totalRecords) {
      if (Number(page) > total_pages && Number(page) > 1) page = total_pages;
    } else {
      page = 1;
    }

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

    response.data = orders;

    return res.json(response);
  }
}

export default new DeliverymanOrderController();
