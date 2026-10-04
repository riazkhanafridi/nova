import { DataTypes } from "sequelize";
import { sequelize } from "../config/dbConnect.js";
import { NOTIFICATION_TYPE } from "../config/constants.js";

const Notification = sequelize.define(
  "Notifications",
  {
    notificationId: {
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
    type: {
      type: DataTypes.ENUM(...Object.values(NOTIFICATION_TYPE)),
      allowNull: false,
      defaultValue: NOTIFICATION_TYPE.system,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    referenceId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: "Reference to order, product, etc.",
    },
    referenceType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Type of reference: order, product, etc.",
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

export default Notification;
