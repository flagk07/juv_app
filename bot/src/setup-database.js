const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('🚀 Setting up JUV database schema...');

  try {
    // Insert sample products if they don't exist
    const sampleProducts = [
      {
        title: 'Кольцо с бриллиантом "Классика"',
        description: 'Элегантное золотое кольцо с бриллиантом огранки "Принцесса". Вес камня 0.5 карат.',
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        price: 150000.00,
        quantity_available: 5
      },
      {
        title: 'Серьги "Капли росы"',
        description: 'Изящные серьги из белого золота с жемчугом и бриллиантами.',
        image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400',
        price: 85000.00,
        quantity_available: 8
      },
      {
        title: 'Колье "Звездная ночь"',
        description: 'Роскошное колье из желтого золота с сапфирами и бриллиантами.',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        price: 320000.00,
        quantity_available: 2
      },
      {
        title: 'Браслет "Нежность"',
        description: 'Тонкий браслет из розового золота с изумрудами.',
        image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400',
        price: 95000.00,
        quantity_available: 12
      },
      {
        title: 'Подвеска "Сердце океана"',
        description: 'Изысканная подвеска с крупным аквамарином в обрамлении бриллиантов.',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
        price: 275000.00,
        quantity_available: 3
      },
      {
        title: 'Кольцо "Розовая мечта"',
        description: 'Романтичное кольцо с розовым турмалином и россыпью мелких бриллиантов.',
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400',
        price: 128000.00,
        quantity_available: 7
      }
    ];

    // Check if products already exist
    const { data: existingProducts } = await supabase
      .from('products')
      .select('title')
      .limit(1);

    if (!existingProducts || existingProducts.length === 0) {
      console.log('📦 Adding sample products...');
      
      for (const product of sampleProducts) {
        const { error } = await supabase
          .from('products')
          .insert(product);
        
        if (error) {
          console.error('Error inserting product:', error);
        } else {
          console.log(`✅ Added product: ${product.title}`);
        }
      }
    } else {
      console.log('📦 Products already exist, skipping...');
    }

    console.log('✅ Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup error:', error);
  }
}

// Execute if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase }; 