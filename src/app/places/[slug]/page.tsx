import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { PlaceDetail } from "@/components/places/place-detail";
import { PLACES, findPlaceBySlug } from "@/components/places/places-data";

type PlacePageProps = {
  readonly params: Promise<{ slug: string }>;
};

export const instant = false;

export const generateStaticParams = async (): Promise<
  Array<{ slug: string }>
> => PLACES.map((place) => ({ slug: place.slug }));

export const generateMetadata = async ({
  params,
}: PlacePageProps): Promise<Metadata> => {
  const { slug } = await params;
  const place = findPlaceBySlug(slug);

  if (!place) {
    return { title: "Place not found" };
  }

  return {
    title: place.title,
    description: `${place.description}. Places to visit in Patna during AI-CHHE 2026.`,
  };
};

const PlaceRoute = async ({ params }: PlacePageProps) => {
  const { slug } = await params;
  const place = findPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <SiteHeader />
      <div className="flex-1">
        <PlaceDetail place={place} />
      </div>
      <footer className="border-t border-line px-5 py-6 sm:px-8">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-2 text-[12px] text-mist sm:flex-row sm:items-center sm:justify-between">
          <span>AI-CHHE 2026 · Department of Civil Engineering, NIT Patna</span>
          <span>Places to visit</span>
        </div>
      </footer>
    </div>
  );
};

export default PlaceRoute;
