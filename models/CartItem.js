import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const CartItem = sequelize.define(
  "CartItems",
  {
    cartItemId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Carts",
        key: "cartId",
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    priceAtAdd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Price at the time the item was added to cart",
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default CartItem;
