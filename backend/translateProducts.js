import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import translate from 'google-translate-api-x';

dotenv.config();

const translateProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check...`);

    let updatedCount = 0;
    for (const product of products) {
      let changed = false;
      if (!product.name_mr && product.name) {
        try {
          const res = await translate(product.name, { to: 'mr' });
          product.name_mr = res.text;
          changed = true;
          console.log(`Translated name: ${product.name} -> ${product.name_mr}`);
        } catch (e) { console.error('Error translating name', e); }
      }
      if (!product.category_mr && product.category) {
        try {
          const res = await translate(product.category, { to: 'mr' });
          product.category_mr = res.text;
          changed = true;
          console.log(`Translated cat: ${product.category} -> ${product.category_mr}`);
        } catch (e) { console.error('Error translating category', e); }
      }

      if (changed) {
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Migration completed. Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

translateProducts();
