import * as Yup from 'yup';
import { Op } from 'sequelize';
import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: [
        'id',
        'delivery_id',
        'description',
        'createdAt',
        'updatedAt',
      ],
    });
    return res.json(deliveryProblems);
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
