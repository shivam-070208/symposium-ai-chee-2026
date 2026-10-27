import { Acc, type Place } from "./acc";

const PLACES: readonly Place[] = [
  {
    title: "Gurudwara Sahib",
    location: "Patna, Bihar",
    description: "Sikh gurdwara in Patna",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Patna_Sahib_Gurudwara.jpg/1280px-Patna_Sahib_Gurudwara.jpg",
  },
  {
    title: "Bihar Museum",
    location: "Patna, Bihar",
    description: "Art and history museum in Patna",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bihar_Museum_Bailey_Road_01.jpg/1280px-Bihar_Museum_Bailey_Road_01.jpg",
  },
];

export const PlacesToVisit = () => (
  <section id="places" className="bg-white">
    <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-royal">
          Places to visit
        </p>
        <h2 className="mt-2 text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold leading-tight tracking-[-0.03em] text-navy">
          Beyond the Symposium
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-bodytext">
          While you are in Patna for AI-CHHE 2026, take time to explore these
          landmarks around the city.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-1 sm:mt-14 sm:gap-3">
        {PLACES.map((place, index) => (
          <Acc key={place.title} place={place} index={index} />
        ))}
      </div>
    </div>
  </section>
);
