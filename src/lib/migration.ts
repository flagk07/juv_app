import { supabase } from './supabase'

export async function migrateLocalStorageToSupabase() {
  try {
    console.log('🔄 Начинаем миграцию localStorage → Supabase...');

    // Проверяем доступность localStorage
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('localStorage недоступен');
    }

    // Загружаем товары из localStorage
    const storedProducts = localStorage.getItem('juv_products');
    if (!storedProducts) {
      console.log('📭 Нет товаров в localStorage для миграции');
      return { success: true, migrated: 0 };
    }

    const localProducts = JSON.parse(storedProducts);
    console.log(`📦 Найдено товаров в localStorage: ${localProducts.length}`);

    let migratedCount = 0;

    for (const product of localProducts) {
      try {
        // Преобразуем формат данных для Supabase
        const supabaseProduct = {
          name: product.name || product.title,
          description: product.description,
          price: parseFloat(product.price),
          image_url: product.image_url || product.imageUrl,
          category: product.category,
          in_stock: product.in_stock !== false // По умолчанию true
        };

        // Проверяем, не существует ли уже такой товар
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('name', supabaseProduct.name)
          .single();

        if (existingProduct) {
          console.log(`⏭️ Товар "${supabaseProduct.name}" уже существует, пропускаем`);
          continue;
        }

        // Добавляем товар в Supabase
        const { error } = await supabase
          .from('products')
          .insert(supabaseProduct);

        if (error) {
          console.error(`❌ Ошибка миграции товара "${supabaseProduct.name}":`, error);
        } else {
          console.log(`✅ Товар "${supabaseProduct.name}" мигрирован`);
          migratedCount++;
        }

      } catch (productError) {
        console.error('❌ Ошибка обработки товара:', productError);
      }
    }

    console.log(`🎉 Миграция завершена! Мигрировано товаров: ${migratedCount}`);
    
    return { 
      success: true, 
      migrated: migratedCount,
      total: localProducts.length
    };

  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

export async function syncSupabaseToLocalStorage() {
  try {
    console.log('🔄 Синхронизация Supabase → localStorage...');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Supabase: ${error.message}`);
    }

    if (products && products.length > 0) {
      localStorage.setItem('juv_products', JSON.stringify(products));
      console.log(`✅ Синхронизировано товаров: ${products.length}`);
      return { success: true, synced: products.length };
    } else {
      console.log('📭 Нет товаров в Supabase для синхронизации');
      return { success: true, synced: 0 };
    }

  } catch (error) {
    console.error('❌ Ошибка синхронизации:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}

// Проверка подключения к Supabase
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Проверяем подключение к Supabase...');
    
    // Простой запрос для проверки подключения - получаем количество товаров
    const { data, error, count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      throw new Error(`Supabase: ${error.message}`);
    }

    console.log('✅ Подключение к Supabase успешно, товаров:', count);
    return { 
      success: true, 
      connected: true,
      productsCount: count || 0
    };

  } catch (error) {
    console.error('❌ Ошибка подключения к Supabase:', error);
    return { 
      success: false, 
      connected: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}
