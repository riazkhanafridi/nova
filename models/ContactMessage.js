import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";

const ContactMessage = sequelize.define(
  "ContactMessages",
  {
    contactMessageId: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(40),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
    },
    topic: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("new", "read", "resolved"),
      allowNull: false,
      defaultValue: "new",
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default ContactMessage;
