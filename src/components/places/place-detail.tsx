import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { PLACES, type Place } from "./places-data";

type PlaceDetailProps = {
  readonly place: Place;
};

const VISITOR_NOTE =
  "Hours, tickets and access can change — check the official sources before you go.";

export const PlaceDetail = ({ place }: PlaceDetailProps) => {
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${place.title}, ${place.location}`,
  )}`;

  const otherPlaces = PLACES.filter((item) => item.slug !== place.slug);

  return (
    <article className="bg-canvas">
      <div className="mx-auto w-full max-w-[960px] px-4 py-10 sm:px-6 lg:py-14">
        <Link
          href="/#places"
          className="inline-flex items-center gap-2 text-[13px] font-medium text-royal hover:text-navy"
        >
          <ArrowLeft className="size-4" />
          Places to visit
        </Link>

        <header className="mt-6 border-b border-line pb-6">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-royal">
            AI-CHHE 2026 · Patna
          </p>
          <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.03em] text-navy sm:text-[38px]">
            {place.title}
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 text-[14px] text-bodytext">
            <MapPin className="size-4 text-royal" strokeWidth={1.8} />
            {place.location}
          </p>
        </header>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl border border-line">
          <Image
            src={place.image}
            alt={place.title}
            fill
            unoptimized
            sizes="(max-width: 960px) 100vw, 960px"
            className="object-cover"
          />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            <p className="text-[17px] font-medium leading-relaxed text-navy">
              {place.description}.
            </p>
            {place.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-4 text-[15px] leading-relaxed text-bodytext"
              >
                {paragraph}
              </p>
            ))}

            <p className="mt-6 rounded-lg border border-line bg-white px-4 py-3 text-[13px] leading-relaxed text-mist">
              {VISITOR_NOTE}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg bg-royal px-5 text-[14px] font-semibold text-white transition-colors hover:bg-navy"
              >
                Open in Google Maps
                <ArrowUpRight className="size-4" />
              </a>
              <Link
                href="/#places"
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-[14px] font-semibold text-navy transition-colors hover:border-royal hover:text-royal"
              >
                All places
              </Link>
            </div>
          </div>

          <aside className="h-fit rounded-xl border border-line bg-white p-5">
            <h2 className="text-[15px] font-semibold text-navy">Quick facts</h2>
            <dl className="mt-3 space-y-2.5 text-[13px]">
              {place.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4"
                >
                  <dt className="shrink-0 text-mist">{fact.label}</dt>
                  <dd className="break-words text-right font-medium text-navy">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {otherPlaces.length > 0 ? (
          <section className="mt-10 border-t border-line pt-8">
            <h2 className="text-[17px] font-semibold text-navy">
              More places to visit
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {otherPlaces.map((item) => (
                <Link
                  key={item.slug}
                  href={`/places/${item.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-white p-3 transition-colors hover:border-royal/40"
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={72}
                    height={72}
                    unoptimized
                    className="size-[72px] shrink-0 rounded-lg object-cover"
                  />
                  <span>
                    <span className="block text-[14px] font-medium text-navy group-hover:text-royal">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-mist">
                      {item.location}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
};
