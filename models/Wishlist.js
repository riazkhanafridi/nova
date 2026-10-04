import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const Wishlist = sequelize.define(
  "Wishlists",
  {
    wishlistId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "Users",
        key: "userId",
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
  },
  {
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "productId"],
        name: "unique_user_product_wishlist",
      },
    ],
  }
);

export default Wishlist;
