import Sequelize, { Model } from 'sequelize';

class DeliveryProblem extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        created_at: Sequelize.DATE,
        updated_at: Sequelize.DATE,
      },
      { sequelize }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Order, {
      foreignKey: 'delivery_id',
      as: 'delivery',
    });
  }
}

export default DeliveryProblem;
