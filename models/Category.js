import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const Category = sequelize.define(
  "Categories",
  {
    categoryId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "Categories",
        key: "categoryId",
      },
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    paranoid: true,
    timestamps: true,
  }
);

export default Category;
