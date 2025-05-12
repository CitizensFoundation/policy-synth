import { AdminUser } from './src/models/adminUser.model';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const seedAdmin = async () => {
  console.log('Starting admin user seeding...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('Error: ADMIN_PASSWORD environment variable is not set.');
    console.log('Please set ADMIN_PASSWORD in your .env file and try again.');
    process.exit(1); // Exit with error code
  }

  try {
    const existingAdmin = await AdminUser.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists.`);
    } else {
      console.log(`Creating admin user: ${adminEmail}`);
      // Password hashing is handled by the model hook
      await AdminUser.create({
        email: adminEmail,
        passwordHash: adminPassword, // Pass plain password to be hashed by hook
        role: 'admin', // Ensure the role is admin
      });
      console.log(`Admin user ${adminEmail} created successfully.`);
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  } finally {
    // Optionally close DB connection if needed, but usually not necessary for simple scripts
    // await sequelize.close();
    console.log('Admin user seeding finished.');
  }
};

// Execute the seeding function
seedAdmin();