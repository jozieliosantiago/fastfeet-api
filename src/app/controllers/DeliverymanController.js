import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async index(req, res) {
    const deliverymanList = await Deliveryman.findAll();
    return res.json(deliverymanList);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    const userExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (userExists)
      return res.status(400).json({ error: 'Email already exists' });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    const deliveryman = await Deliveryman.create(req.body);
    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().min(5),
      email: Yup.string()
        .email()
        .min(10),
      avatar_id: Yup.number().min(1),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    const deliveryman = await Deliveryman.findByPk(req.params.id);

    if (!deliveryman)
      return res.status(400).json({ error: 'Unable to update record' });

    const { id, name, email, avatar_id } = await deliveryman.update(req.body);

    return res.json({ id, name, email, avatar_id });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (deliveryman) {
      await deliveryman.destroy();
      return res.json({ success: 'Deliveryman deleted' });
    }
    return res.json({ failed: 'Unable to delete record' });
  }
}

export default new DeliverymanController();