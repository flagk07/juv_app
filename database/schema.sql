-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы логов действий пользователей
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  telegram_username TEXT,
  action_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы товаров
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL,
  telegram_username TEXT,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  contact_info JSONB,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_logs_telegram_id ON logs(telegram_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_telegram_id ON orders(telegram_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Включаем Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Политики доступа (разрешаем все операции для anon роли)
CREATE POLICY "Enable all operations for anon users" ON users FOR ALL USING (true);
CREATE POLICY "Enable all operations for anon users" ON logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for anon users" ON products FOR ALL USING (true);
CREATE POLICY "Enable all operations for anon users" ON orders FOR ALL USING (true);

-- Добавляем тестовые данные товаров
INSERT INTO products (name, description, price, image_url, category) VALUES
('Золотое кольцо с бриллиантом', 'Элегантное кольцо из белого золота 585 пробы с бриллиантом 0.25 карат', 85000.00, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400', 'rings'),
('Серьги с жемчугом', 'Классические серьги с натуральным жемчугом', 25000.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400', 'earrings'),
('Золотая цепочка', 'Изящная золотая цепочка 585 пробы, плетение "Якорное"', 35000.00, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400', 'necklaces'),
('Браслет с подвеской', 'Нежный браслет из серебра с подвеской-сердечком', 12000.00, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400', 'bracelets'),
('Обручальные кольца', 'Парные обручальные кольца из розового золота', 55000.00, 'https://images.unsplash.com/photo-1544376798-89aa20e1d726?w=400', 'rings'),
('Колье с камнями', 'Роскошное колье с полудрагоценными камнями', 75000.00, 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400', 'necklaces');

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 