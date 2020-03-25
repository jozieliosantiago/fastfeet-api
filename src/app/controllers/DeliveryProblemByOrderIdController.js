import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async index(req, res) {
    const existOrder = await Order.findByPk(req.params.id);

    if (!existOrder) return res.status(400).json({ error: 'Order not found' });

    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: req.params.id,
      },
    });

    if (deliveryProblems.length === 0)
      return res.json({ message: 'No reported problems' });

    return res.json(deliveryProblems);
  }
}

export default new DeliveryProblemController();
