import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface hinhanhspAttributes {
  maha?: string;
  duongdan?: string;
  masp?: string;
  anhdaidien?: number;
}

export type hinhanhspOptionalAttributes = "maha" | "duongdan" | "masp" | "anhdaidien";
export type hinhanhspCreationAttributes = Optional<hinhanhspAttributes, hinhanhspOptionalAttributes>;

export class hinhanhsp extends Model<hinhanhspAttributes, hinhanhspCreationAttributes> implements hinhanhspAttributes {
  maha?: string;
  duongdan?: string;
  masp?: string;
  anhdaidien?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof hinhanhsp {
    return hinhanhsp.init({
    maha: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    duongdan: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    masp: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    anhdaidien: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'hinhanhsp',
    schema: 'public',
    timestamps: false
  });
  }
}
