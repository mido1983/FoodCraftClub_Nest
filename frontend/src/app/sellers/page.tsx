import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// u0412u0440u0435u043cu0435u043du043du044bu0435 u0434u0430u043du043du044bu0435 u0434u043bu044f u0434u0435u043cu043eu043du0441u0442u0440u0430u0446u0438u0438
const mockSellers = [
  {
    id: '1',
    name: 'u0410u043du043du0430 u041fu0435u0442u0440u043eu0432u0430',
    description: 'u0421u043fu0435u0446u0438u0430u043bu0438u0437u0438u0440u0443u044eu0441u044c u043du0430 u0434u043eu043cu0430u0448u043du0435u0439 u0432u044bu043fu0435u0447u043au0435 u0438u0437 u043du0430u0442u0443u0440u0430u043bu044cu043du044bu0445 u0438u043du0433u0440u0435u0434u0438u0435u043du0442u043eu0432. u0412u0441u0435 u0440u0435u0446u0435u043fu0442u044b u043fu0435u0440u0435u0434u0430u044eu0442u0441u044f u0432 u043du0430u0448u0435u0439 u0441u0435u043cu044cu0435 u0438u0437 u043fu043eu043au043eu043bu0435u043du0438u044f u0432 u043fu043eu043au043eu043bu0435u043du0438u0435.',
    rating: 4.8,
    reviewCount: 124,
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=500&auto=format&fit=crop',
    productCount: 15,
    location: 'u041cu043eu0441u043au0432u0430',
    verified: true,
  },
  {
    id: '2',
    name: 'u0418u0432u0430u043d u0421u0438u0434u043eu0440u043eu0432',
    description: 'u0424u0435u0440u043cu0435u0440u0441u043au0438u0435 u043cu043eu043bu043eu0447u043du044bu0435 u043fu0440u043eu0434u0443u043au0442u044b u0441 u043du0430u0448u0435u0439 u0441u0435u043cu0435u0439u043du043eu0439 u0444u0435u0440u043cu044b. u041du0430u0442u0443u0440u0430u043bu044cu043du044bu0435 u0441u044bu0440u044b, u0442u0432u043eu0440u043eu0433, u0441u043cu0435u0442u0430u043du0430 u0438 u043cu043eu043bu043eu043au043e.',
    rating: 4.9,
    reviewCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=500&auto=format&fit=crop',
    productCount: 12,
    location: 'u041fu043eu0434u043cu043eu0441u043au043eu0432u044cu0435',
    verified: true,
  },
  {
    id: '3',
    name: 'u0415u043au0430u0442u0435u0440u0438u043du0430 u0421u043cu0438u0440u043du043eu0432u0430',
    description: 'u0414u043eu043cu0430u0448u043du0438u0435 u0432u0430u0440u0435u043du044cu044f, u0441u043eu043bu0435u043du044cu044f u0438 u043au043eu043cu043fu043eu0442u044b u0438u0437 u0444u0440u0443u043au0442u043eu0432 u0438 u044fu0433u043eu0434 u0441 u0441u043eu0431u0441u0442u0432u0435u043du043du043eu0433u043e u0443u0447u0430u0441u0442u043au0430.',
    rating: 4.7,
    reviewCount: 56,
    imageUrl: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?q=80&w=500&auto=format&fit=crop',
    productCount: 8,
    location: 'u0421u0430u043du043au0442-u041fu0435u0442u0435u0440u0431u0443u0440u0433',
    verified: true,
  },
  {
    id: '4',
    name: 'u041cu0438u0445u0430u0438u043b u041au043eu0437u043bu043eu0432',
    description: 'u041cu044fu0441u043du044bu0435 u0434u0435u043bu0438u043au0430u0442u0435u0441u044b u0441u043eu0431u0441u0442u0432u0435u043du043du043eu0433u043e u043fu0440u043eu0438u0437u0432u043eu0434u0441u0442u0432u0430. u041au043eu043bu0431u0430u0441u044b, u0432u0435u0442u0447u0438u043du0430, u0441u0430u043bu043e u0438 u0434u0440u0443u0433u0438u0435 u0438u0437u0434u0435u043bu0438u044f u043fu043e u0441u0435u043cu0435u0439u043du044bu043c u0440u0435u0446u0435u043fu0442u0430u043c.',
    rating: 4.6,
    reviewCount: 72,
    imageUrl: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?q=80&w=500&auto=format&fit=crop',
    productCount: 10,
    location: 'u041au0430u0437u0430u043du044c',
    verified: false,
  },
  {
    id: '5',
    name: 'u041eu043bu044cu0433u0430 u041du0438u043au043eu043bu0430u0435u0432u0430',
    description: 'u0414u043eu043cu0430u0448u043du044fu044f u0432u044bu043fu0435u0447u043au0430 u0438 u0442u043eu0440u0442u044b u043du0430 u0437u0430u043au0430u0437. u0418u0441u043fu043eu043bu044cu0437u0443u044e u0442u043eu043bu044cu043au043e u043du0430u0442u0443u0440u0430u043bu044cu043du044bu0435 u0438u043du0433u0440u0435u0434u0438u0435u043du0442u044b u0438 u043cu0438u043du0438u043cu0443u043c u0441u0430u0445u0430u0440u0430.',
    rating: 4.9,
    reviewCount: 118,
    imageUrl: 'https://images.unsplash.com/photo-1556911073-38141963c9e0?q=80&w=500&auto=format&fit=crop',
    productCount: 20,
    location: 'u041du043eu0432u043eu0441u0438u0431u0438u0440u0441u043a',
    verified: true,
  },
  {
    id: '6',
    name: 'u0410u043bu0435u043au0441u0435u0439 u0412u043eu043bu043au043eu0432',
    description: 'u041du0430u0442u0443u0440u0430u043bu044cu043du044bu0439 u043cu0451u0434 u0438 u043fu0440u043eu0434u0443u043au0442u044b u043fu0447u0435u043bu043eu0432u043eu0434u0441u0442u0432u0430. u0421u043eu0431u0441u0442u0432u0435u043du043du0430u044f u043fu0430u0441u0435u043au0430 u0432 u044du043au043eu043bu043eu0433u0438u0447u0435u0441u043au0438 u0447u0438u0441u0442u043eu043c u0440u0430u0439u043eu043du0435.',
    rating: 4.8,
    reviewCount: 95,
    imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=500&auto=format&fit=crop',
    productCount: 7,
    location: 'u0410u043bu0442u0430u0439u0441u043au0438u0439 u043au0440u0430u0439',
    verified: false,
  },
];

export default function SellersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">u041du0430u0448u0438 u043fu0440u043eu0434u0430u0432u0446u044b</h1>
        <p className="text-muted-foreground">
          u041fu043eu0437u043du0430u043au043eu043cu044cu0442u0435u0441u044c u0441 u043du0430u0448u0438u043cu0438 u043fu0440u043eu0432u0435u0440u0435u043du043du044bu043cu0438 u043fu0440u043eu0434u0430u0432u0446u0430u043cu0438, u043au043eu0442u043eu0440u044bu0435 u043fu0440u0435u0434u043bu0430u0433u0430u044eu0442 u043au0430u0447u0435u0441u0442u0432u0435u043du043du044bu0435 u0434u043eu043cu0430u0448u043du0438u0435 u043fu0440u043eu0434u0443u043au0442u044b
        </p>
      </div>

      {/* u0411u0430u043du043du0435u0440 u0434u043bu044f u043fu0440u0438u0432u043bu0435u0447u0435u043du0438u044f u043du043eu0432u044bu0445 u043fu0440u043eu0434u0430u0432u0446u043eu0432 */}
      <div className="mb-12 rounded-xl bg-secondary p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-4 text-2xl font-bold">u0421u0442u0430u043du044cu0442u0435 u043fu0440u043eu0434u0430u0432u0446u043eu043c u043du0430 FoodCraftClub</h2>
            <p className="mb-6 text-muted-foreground">
              u041fu0440u0438u0441u043eu0435u0434u0438u043du044fu0439u0442u0435u0441u044c u043a u043du0430u0448u0435u043cu0443 u0441u043eu043eu0431u0449u0435u0441u0442u0432u0443 u043fu0440u043eu0434u0430u0432u0446u043eu0432 u0438 u043du0430u0447u043du0438u0442u0435 u043fu0440u043eu0434u0430u0432u0430u0442u044c u0441u0432u043eu0438 u0434u043eu043cu0430u0448u043du0438u0435 u043fu0440u043eu0434u0443u043au0442u044b u0443u0436u0435 u0441u0435u0433u043eu0434u043du044f!
            </p>
            <Button asChild>
              <Link href="/seller/register">u0421u0442u0430u0442u044c u043fu0440u043eu0434u0430u0432u0446u043eu043c</Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <Image 
              src="https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=600&auto=format&fit=crop" 
              alt="u0421u0442u0430u043du044cu0442u0435 u043fu0440u043eu0434u0430u0432u0446u043eu043c" 
              width={500} 
              height={300}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </div>

      {/* u0421u043fu0438u0441u043eu043a u043fu0440u043eu0434u0430u0432u0446u043eu0432 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockSellers.map((seller) => (
          <Card key={seller.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={seller.imageUrl}
                alt={seller.name}
                fill
                className="object-cover"
              />
              {seller.verified && (
                <div className="absolute right-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  u041fu0440u043eu0432u0435u0440u0435u043du043du044bu0439
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{seller.name}</span>
                <span className="flex items-center text-sm font-normal">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="mr-1 h-5 w-5 text-yellow-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {seller.rating} ({seller.reviewCount})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {seller.description}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">u041cu0435u0441u0442u043eu043fu043eu043bu043eu0436u0435u043du0438u0435: {seller.location}</span>
                <span className="text-muted-foreground">u0422u043eu0432u0430u0440u043eu0432: {seller.productCount}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={`/sellers/${seller.id}`}>u041fu043eu0441u043cu043eu0442u0440u0435u0442u044c u043fu0440u043eu0444u0438u043bu044c</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
