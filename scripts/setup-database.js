const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupDatabase() {
  console.log('🚀 Setting up JUV database schema...');

  const queries = [
    // Users table
    `
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(20) UNIQUE,
      password_hash VARCHAR(255),
      telegram_id BIGINT UNIQUE,
      telegram_username VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Products table
    `
    CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      price DECIMAL(10,2) NOT NULL,
      quantity_available INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Cart items table
    `
    CREATE TABLE IF NOT EXISTS cart_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      telegram_id BIGINT,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Orders table
    `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      telegram_id BIGINT NOT NULL,
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      items JSONB NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'new',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Logs table
    `
    CREATE TABLE IF NOT EXISTS logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      telegram_id BIGINT NOT NULL,
      telegram_username VARCHAR(255),
      action_type VARCHAR(100) NOT NULL,
      metadata JSONB,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    `,
    
    // Indexes for better performance
    `CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);`,
    `CREATE INDEX IF NOT EXISTS idx_cart_items_telegram_id ON cart_items(telegram_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_telegram_id ON orders(telegram_id);`,
    `CREATE INDEX IF NOT EXISTS idx_logs_telegram_id ON logs(telegram_id);`,
    `CREATE INDEX IF NOT EXISTS idx_logs_action_type ON logs(action_type);`
  ];

  for (const query of queries) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      if (error) {
        console.error('Error executing query:', error);
      }
    } catch (err) {
      console.error('Database setup error:', err.message);
    }
  }

  // Insert sample products
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
    }
  ];

  for (const product of sampleProducts) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'title' });
    
    if (error) {
      console.error('Error inserting product:', error);
    }
  }

  console.log('✅ Database setup completed!');
}

// Execute if called directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase }; 