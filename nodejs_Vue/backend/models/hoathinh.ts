import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface hoathinhAttributes {
  mahh?: string;
  tenhh?: string;
  mota?: string;
}

export type hoathinhOptionalAttributes = "mahh" | "tenhh" | "mota";
export type hoathinhCreationAttributes = Optional<hoathinhAttributes, hoathinhOptionalAttributes>;

export class hoathinh extends Model<hoathinhAttributes, hoathinhCreationAttributes> implements hoathinhAttributes {
  mahh?: string;
  tenhh?: string;
  mota?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof hoathinh {
    return hoathinh.init({
    mahh: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    tenhh: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    mota: {
      type: DataTypes.STRING(250),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'hoathinh',
    schema: 'public',
    timestamps: false
  });
  }
}
