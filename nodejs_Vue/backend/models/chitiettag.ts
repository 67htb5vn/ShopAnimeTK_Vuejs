import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface chitiettagAttributes {
  masp?: string;
  matag?: string;
}

export type chitiettagOptionalAttributes = "masp" | "matag";
export type chitiettagCreationAttributes = Optional<chitiettagAttributes, chitiettagOptionalAttributes>;

export class chitiettag extends Model<chitiettagAttributes, chitiettagCreationAttributes> implements chitiettagAttributes {
  masp?: string;
  matag?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof chitiettag {
    return chitiettag.init({
    masp: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    matag: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'chitiettag',
    schema: 'public',
    timestamps: false
  });
  }
}
