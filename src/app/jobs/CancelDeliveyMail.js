import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancelDeliveyMail {
  get key() {
    return 'CancelDeliveryMail';
  }

  async handle({ data }) {
    const { deliveryman, order, recipient } = data;
    await Mail.sendmail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Delivery cancel',
      template: 'cancelDelivery',
      context: {
        deliveryman: deliveryman.name,
        date: format(parseISO(order.createdAt), "dd'/'MM'/'yyyy' 'HH:mm:ss", {
          locale: pt,
        }),
        id: order.id,
        recipient: recipient.name,
      },
    });
  }
}

export default new CancelDeliveyMail();
