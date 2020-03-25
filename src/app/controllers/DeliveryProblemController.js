import * as Yup from 'yup';
import { Op } from 'sequelize';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async index(req, res) {
    let page =
      req.query.page && Number(req.query.page) > 0 ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    const totalRecords = await DeliveryProblem.count();
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

    const deliveryProblems = await DeliveryProblem.findAll({
      limit,
      offset: (page - 1) * limit,
      order: ['createdAt'],
      attributes: [
        'id',
        'delivery_id',
        'description',
        'createdAt',
        'updatedAt',
      ],
    });

    response.data = deliveryProblems;

    return res.json(response);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    const order = await Order.findOne({
      where: {
        id: req.params.id,
        canceled_at: null,
        end_date: null,
        start_date: {
          [Op.not]: null,
        },
      },
    });

    if (!order)
      return res.status(400).json({
        error:
          'Problems can only be reported when delivery has not been canceled, has not been completed and is ongoing',
      });

    const { description } = req.body;
    const delivery_id = req.params.id;

    const problem = await DeliveryProblem.create({
      description,
      delivery_id,
    });

    return res.json(problem);
  }
}

export default new DeliveryProblemController();
