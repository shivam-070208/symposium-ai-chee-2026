export type PlaceFact = {
  readonly label: string;
  readonly value: string;
};

export type Place = {
  readonly slug: string;
  readonly title: string;
  readonly location: string;
  readonly description: string;
  readonly image: string;
  readonly body: readonly string[];
  readonly facts: readonly PlaceFact[];
};

export const PLACES: readonly Place[] = [
  {
    slug: "gurudwara-sahib",
    title: "Gurudwara Sahib",
    location: "Patna, Bihar",
    description: "Sikh gurdwara in Patna",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Patna_Sahib_Gurudwara.jpg/1280px-Patna_Sahib_Gurudwara.jpg",
    body: [
      "Gurudwara Sahib, reverently known as Patna Sahib, stands on the bank of the Ganga in Patna. It marks the birthplace of Guru Gobind Singh, the tenth Guru of the Sikhs.",
      "Takht Sri Patna Sahib is one of the five Takhts — the highest seats of authority in Sikhism — and welcomes pilgrims and visitors from across the world through the year.",
      "The gurdwara is open to all. Visitors remove their footwear and cover their head before entering the complex.",
    ],
    facts: [
      { label: "City", value: "Patna, Bihar" },
      { label: "Faith", value: "Sikhism" },
      {
        label: "Significance",
        value: "Birthplace of Guru Gobind Singh · One of the five Takhts",
      },
    ],
  },
  {
    slug: "bihar-museum",
    title: "Bihar Museum",
    location: "Patna, Bihar",
    description: "Art and history museum in Patna",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bihar_Museum_Bailey_Road_01.jpg/1280px-Bihar_Museum_Bailey_Road_01.jpg",
    body: [
      "The Bihar Museum is a modern museum on Bailey Road, Patna, dedicated to presenting the art, history and culture of Bihar.",
      "Its galleries bring together objects and artworks from across the region in a contemporary setting, making it one of the city's landmark cultural destinations.",
      "Plan your visit around the museum's official website for current opening hours, tickets and running exhibitions.",
    ],
    facts: [
      { label: "City", value: "Patna, Bihar" },
      { label: "Type", value: "Art and history museum" },
      { label: "Area", value: "Bailey Road, Patna" },
    ],
  },
];

export const findPlaceBySlug = (slug: string): Place | undefined =>
  PLACES.find((place) => place.slug === slug);
