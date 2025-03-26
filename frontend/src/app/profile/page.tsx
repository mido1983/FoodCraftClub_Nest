"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded && isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
          <p className="text-lg">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <p className="text-muted-foreground">Управление вашим профилем и заказами</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Мой профиль</CardTitle>
            <CardDescription>Ваши личные данные</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Имя:</span>
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Email:</span>
                <span>{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => window.open("https://accounts.clerk.dev/user", "_blank")}>
              Редактировать профиль
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Мои заказы</CardTitle>
            <CardDescription>История ваших заказов</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">У вас пока нет заказов</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/products")}>
              Перейти к покупкам
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Избранное</CardTitle>
            <CardDescription>Товары, которые вам понравились</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">У вас пока нет избранных товаров</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push("/products")}>
              Перейти к товарам
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
