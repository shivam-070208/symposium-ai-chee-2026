import { Acc, type Place } from "./acc";

const PLACES: readonly Place[] = [
  {
    title: "Taj Mahal",
    location: "Agra, Uttar Pradesh",
    description: "Timeless marble monument of love",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/1280px-Taj_Mahal_%28Edited%29.jpeg",
  },
  {
    title: "Red Fort",
    location: "Delhi",
    description: "Mughal fortress of red sandstone",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Delhi_fort.jpg/1280px-Delhi_fort.jpg",
  },
  {
    title: "Qutb Minar",
    location: "Delhi",
    description: "Historic victory tower of Delhi",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Qutb_Minar_2022.jpg/1280px-Qutb_Minar_2022.jpg",
  },
  {
    title: "Hawa Mahal",
    location: "Jaipur, Rajasthan",
    description: "Pink palace with latticed windows",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/1280px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg",
  },
  {
    title: "Amber Fort",
    location: "Jaipur, Rajasthan",
    description: "Hilltop fort of Rajput grandeur",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg/1280px-20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg",
  },
  {
    title: "Gateway of India",
    location: "Mumbai, Maharashtra",
    description: "Seaside arch facing Mumbai harbour",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg/1280px-Mumbai_03-2016_30_Gateway_of_India.jpg",
  },
  {
    title: "Victoria Memorial",
    location: "Kolkata, West Bengal",
    description: "White marble memorial in Kolkata",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Victoria_Memorial_situated_in_Kolkata.jpg/1280px-Victoria_Memorial_situated_in_Kolkata.jpg",
  },
  {
    title: "Charminar",
    location: "Hyderabad, Telangana",
    description: "Four minarets at Hyderabad's heart",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Charminar_Hyderabad_1.jpg/1280px-Charminar_Hyderabad_1.jpg",
  },
  {
    title: "Mysore Palace",
    location: "Mysuru, Karnataka",
    description: "Royal palace of the Wadiyar dynasty",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Mysore_Palace_Morning.jpg/1280px-Mysore_Palace_Morning.jpg",
  },
  {
    title: "Mahabodhi Temple",
    location: "Bodh Gaya, Bihar",
    description: "Bodhi tree and ancient Buddhist shrine",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Mahabodhitemple.jpg/1280px-Mahabodhitemple.jpg",
  },
];

export const PlacesToVisit = () => (
  <section className="bg-white">
    <div className="mx-auto w-full max-w-[1240px] px-5 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-royal">
          Places to visit
        </p>
        <h2 className="mt-2 text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold leading-tight tracking-[-0.03em] text-navy">
          Beyond the Symposium
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-bodytext">
          While you are in India for AI-CHHE 2026, take time to explore these
          landmarks across the country.
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
