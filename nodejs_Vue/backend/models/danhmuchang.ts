import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface danhmuchangAttributes {
  madmh?: string;
  tendmh?: string;
}

export type danhmuchangOptionalAttributes = "madmh" | "tendmh";
export type danhmuchangCreationAttributes = Optional<danhmuchangAttributes, danhmuchangOptionalAttributes>;

export class danhmuchang extends Model<danhmuchangAttributes, danhmuchangCreationAttributes> implements danhmuchangAttributes {
  madmh?: string;
  tendmh?: string;


  static initModel(sequelize: Sequelize.Sequelize): typeof danhmuchang {
    return danhmuchang.init({
    madmh: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    tendmh: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'danhmuchang',
    schema: 'public',
    timestamps: false
  });
  }
}
