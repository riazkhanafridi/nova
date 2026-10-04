import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const OrderItem = sequelize.define(
  "OrderItems",
  {
    orderItemId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Orders",
        key: "orderId",
      },
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Products",
        key: "productId",
      },
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Snapshot of product name at order time",
    },
    productImage: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Snapshot of product image at order time",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default OrderItem;
