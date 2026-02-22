const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'staff'),
      defaultValue: 'staff'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Method to check password validity
  user.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  return user;
}; 