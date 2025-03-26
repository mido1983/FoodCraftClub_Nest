import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Получаем тело запроса
  const payload = await req.json();
  // Получаем заголовок Svix-Signature
  const headersList = headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  // Если отсутствуют необходимые заголовки, возвращаем ошибку
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Ошибка вебхука: отсутствуют заголовки', {
      status: 400
    });
  }

  // Получаем секретный ключ из переменных окружения
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    return new NextResponse('Ошибка вебхука: отсутствует секретный ключ', {
      status: 500
    });
  }

  // В реальном приложении здесь будет логика обработки вебхука
  // и синхронизации данных с бэкендом
  
  console.log('Получен вебхук от Clerk:', payload.type);
  
  return NextResponse.json({ success: true });
}
