import { QueryInterface } from "sequelize";
import bcrypt from "bcrypt";

module.exports = {
  async up(queryInterface: QueryInterface) {
    const password = await bcrypt.hash("123456", 10);

    await queryInterface.bulkInsert("users", [
      {
        firstName: "Super",
        lastName: "Admin",
        email: "superadmin@example.com",
        password,
        role: "SUPER_ADMIN",
        accountStatus: "ACTIVE",
        phone: "12345678",
        CIN: "00000000",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("Users", {
      email: "superadmin@example.com",
    });
  },
};