import * as Yup from 'yup';
import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    let page =
      req.query.page && Number(req.query.page) > 0 ? req.query.page : 1;
    const limit = req.query.limit ? req.query.limit : 20;
    const { filter } = req.query;

    const totalRecords = await Recipient.count();
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

    const findParams = {
      limit,
      offset: (page - 1) * limit,
      order: ['createdAt'],
    };

    if (filter)
      findParams.where = {
        name: {
          [Op.iLike]: `%${filter}%`,
        },
      };

    const recipients = await Recipient.findAll(findParams);

    response.data = recipients;

    return res.json(response);
  }

  async indexById(req, res) {
    try {
      const recipient = await Recipient.findByPk(req.params.id);
      if (recipient) return res.json(recipient);
      return res.status(400).json({ message: 'Recipient not found' });
    } catch (error) {
      return res.status(400).json({ message: 'Erro fetching recipient' });
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      neighborhood: Yup.string().required(),
      address_complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    const recipient = await Recipient.create(req.body);
    return res.json(recipient);
  }

  async delete(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found' });

    try {
      await recipient.destroy();
      return res.json({ success: 'Recipient deleted' });
    } catch (error) {
      return res.status(400).json({ message: 'Erro delete recipient' });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      neighborhood: Yup.string().required(),
      address_complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip_code: Yup.number().required(),
    });

    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found' });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Bad Request' });

    await recipient.update({
      ...req.body,
    });

    return res.json(recipient);
  }
}

export default new RecipientController();
