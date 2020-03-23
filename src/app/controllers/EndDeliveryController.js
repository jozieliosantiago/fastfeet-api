import { Op } from 'sequelize';
import { resolve } from 'path';
import { unlink } from 'fs';
import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import File from '../models/File';

class EndDeliveryController {
  async update(req, res) {
    if (req.file === undefined)
      return res.status(400).json({ error: 'Signature is required' });

    const { originalname: name, filename: path } = req.file;

    const tmpFile = `${resolve(
      __dirname,
      '..',
      '..',
      '..',
      'tmp',
      'uploads'
    )}/${path}`;

    const deleteFile = async () => {
      await unlink(tmpFile, () => {
        return 'Removed file';
      });
    };

    const existDeliveryman = await Deliveryman.findByPk(req.params.id);

    if (!existDeliveryman) {
      deleteFile();
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.deliverieId,
        deliveryman_id: req.params.id,
        start_date: { [Op.not]: null },
      },
    });

    if (!order) {
      deleteFile();
      return res.status(400).json({
        error:
          'Order not found. You can only finalize deliveries already started',
      });
    }

    if (order.canceled_at) {
      deleteFile();
      return res
        .status(401)
        .json({ error: 'You cannot finish deliveries already canceled' });
    }

    if (order.end_date) {
      deleteFile();
      return res
        .status(401)
        .json({ error: 'This delivery has already been completed' });
    }

    const file = await File.create({
      name,
      path,
    });

    await order.update({
      signature_id: file.id,
      end_date: new Date(),
    });

    return res.json(order);
  }
}

export default new EndDeliveryController();
