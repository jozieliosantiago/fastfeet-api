import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { deliveryman, order, recipient } = data;
    await Mail.sendmail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'New order',
      template: 'newOrder',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        date: format(parseISO(order.createdAt), "dd'/'MM'/'yyyy' 'HH:mm:ss", {
          locale: pt,
        }),
        street: recipient.street,
        number: recipient.number,
        address_complement: recipient.address_complement,
        neighborhood: recipient.neighborhood,
        zip_code: recipient.zip_code,
        city: recipient.city,
        state: recipient.state,
      },
    });
  }
}

export default new NewOrderMail();
