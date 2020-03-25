import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    let page =
      req.query.page && Number(req.query.page) > 0 ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;

    const totalRecords = await Deliveryman.count();
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

    const deliverymanList = await Deliveryman.findAll({
      order: ['createdAt'],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
    });

    response.data = deliverymanList;

    return res.json(response);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.number(),
    });

    const { name, email, avatar_id } = req.body;

    const emailExists = await Deliveryman.findOne({
      where: { email },
    });

    if (avatar_id && !(await File.findByPk(avatar_id)))
      return res.status(400).json({ error: 'Avatar not found' });

    if (emailExists)
      return res.status(400).json({ error: 'Email already exists' });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    const deliveryman = await Deliveryman.create({
      name,
      email,
      avatar_id,
    });
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
