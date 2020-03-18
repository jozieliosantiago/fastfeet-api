import Sequelize, { Model } from 'sequelize';

class Recipients extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        address_complement: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        zip_code: Sequelize.INTEGER,
      },
      { sequelize }
    );
    return this;
  }
}

export default Recipients;
