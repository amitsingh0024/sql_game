import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

// Import all models to ensure they are registered
import '../models/index.js';

// Load environment variables
dotenv.config();

async function testMongoConnection() {
  console.log('\n🔍 Testing MongoDB Connection...\n');
  
  // Display connection info (without password)
  const uri = env.MONGODB_URI;
  const maskedUri = uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  console.log('📋 Connection Details:');
  console.log(`   URI: ${maskedUri}`);
  console.log(`   Database: ${uri.split('/').pop()?.split('?')[0] || 'unknown'}\n`);

  try {
    console.log('⏳ Attempting to connect...\n');

    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000, // 10 seconds for testing
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(env.MONGODB_URI, options);

    const connection = mongoose.connection;
    
    console.log('✅ MongoDB Connected Successfully!\n');
    console.log('📊 Connection Information:');
    console.log(`   Host: ${connection.host}`);
    console.log(`   Port: ${connection.port}`);
    console.log(`   Database: ${connection.name}`);
    console.log(`   Ready State: ${getReadyStateName(connection.readyState)}\n`);

    // Test a simple operation
    console.log('🧪 Testing database operation...');
    const collections = await connection.db.listCollections().toArray();
    console.log(`   Collections found: ${collections.length}`);
    if (collections.length > 0) {
      console.log('   Collection names:');
      collections.forEach((col) => {
        console.log(`     - ${col.name}`);
      });
    }
    console.log('');

    // Show registered Mongoose models
    console.log('📋 Registered Mongoose Models:');
    const modelNames = mongoose.modelNames();
    console.log(`   Total models: ${modelNames.length}`);
    modelNames.forEach((name) => {
      console.log(`     - ${name}`);
    });
    console.log('');

    // Disconnect
    console.log('🔌 Disconnecting...');
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ MongoDB Connection Failed!\n');
    console.error('Error Details:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}`);
    console.error(`   Name: ${error.name || 'N/A'}\n`);

    if (error.message.includes('ENOTFOUND')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Check if the cluster name in your MongoDB URI is correct');
      console.error('   - Verify your MongoDB Atlas cluster is running');
      console.error('   - Ensure your IP address is whitelisted in MongoDB Atlas\n');
    } else if (error.message.includes('authentication')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Check your username and password in the MongoDB URI');
      console.error('   - Verify the database user has proper permissions\n');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Troubleshooting:');
      console.error('   - Check your internet connection');
      console.error('   - Verify your IP address is whitelisted in MongoDB Atlas');
      console.error('   - Check if MongoDB Atlas is experiencing issues\n');
    }

    process.exit(1);
  }
}

function getReadyStateName(state: number): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
}

// Run the test
testMongoConnection();

