import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface tagAttributes {
  matag?: string;
  tentag?: string;
}

export type tagOptionalAttributes = "matag" | "tentag";
export type tagCreationAttributes = Optional<tagAttributes, tagOptionalAttributes>;

export class tag extends Model<tagAttributes, tagCreationAttributes> implements tagAttributes {
  matag?: string;
  tentag?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof tag {
    return tag.init({
    matag: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    tentag: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tag',
    schema: 'public',
    timestamps: false
  });
  }
}
