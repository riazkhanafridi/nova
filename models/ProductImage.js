import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const ProductImage = sequelize.define(
  "ProductImages",
  {
    imageId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Products",
        key: "productId",
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    altText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default ProductImage;
