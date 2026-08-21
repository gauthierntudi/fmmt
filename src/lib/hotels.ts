export type HotelInfo = {
  category: string;
  distance: string;
  rooms: Record<string, string>;
};

export const hotelsData: Record<string, HotelInfo> = {
  "FLEUVE CONGO HOTEL": {
    category: "5 stars",
    distance: "6.2 Km",
    rooms: {
      "Standard Single": "400",
      "Standard Double": "440",
      "Premium Deluxe Single": "440",
      "Premium Deluxe Double": "480",
      "Junior Suite Single": "500",
      "Junior Suite Double": "540",
      "Executive Suite": "1,650",
    },
  },
  "HILTON KINSHASA": {
    category: "5 stars",
    distance: "4.7 Km",
    rooms: {
      Standard: "250",
      Double: "290",
      "1-Bedroom Suite": "620",
      "2-Bedroom Suite": "1,430",
    },
  },
  "PULLMAN HOTEL": {
    category: "4 stars",
    distance: "6.1 Km",
    rooms: {
      Standard: "382",
      "Premium Deluxe": "530",
      "Junior Suite": "782",
    },
  },
  NOVOTEL: {
    category: "4 stars",
    distance: "4.3 Km",
    rooms: {
      Standard: "220",
    },
  },
  "KIN PLAZA ARJAAN HOTEL BY ROTANA": {
    category: "4 stars",
    distance: "5.2 Km",
    rooms: {
      Standard: "290",
      "Deluxe Standard": "310",
      Studio: "350",
      "Apartment (1 bedroom)": "420",
      "Apartment (2 bedrooms)": "530",
    },
  },
  "ROYAL HOTEL": {
    category: "4 stars",
    distance: "4.1 Km",
    rooms: {
      Single: "180",
      Standard: "250",
      "Junior Suite": "350",
    },
  },
  "BEATRICE HOTEL": {
    category: "4 stars",
    distance: "4.1 Km",
    rooms: {
      Standard: "200",
      Deluxe: "230",
      Suite: "580",
    },
  },
  "SELTON HOTEL": {
    category: "3 stars",
    distance: "4 Km",
    rooms: {
      Single: "140",
      Standard: "180",
      Double: "150",
    },
  },
  "LEON HOTEL": {
    category: "3 stars",
    distance: "4.5 Km",
    rooms: {
      Single: "150",
      Double: "180",
      VIP: "200",
      Suite: "250",
    },
  },
  "FORTUNE HOTEL": {
    category: "3 stars",
    distance: "5.1 Km",
    rooms: {
      Single: "100",
      Standard: "130",
      "Junior Suite": "150",
      "Senior Suite": "220",
    },
  },
  "BELLE VIE HOTEL": {
    category: "3 stars",
    distance: "4.1 Km",
    rooms: {
      "Standard 1": "120",
      "Standard 2": "150",
      Deluxe: "180",
    },
  },
  "RELAX HOTEL": {
    category: "3 stars",
    distance: "4 Km",
    rooms: {
      Single: "95",
      Standard: "120",
    },
  },
  "FADEN HOUSE": {
    category: "3 stars",
    distance: "6.1 Km",
    rooms: {
      Single: "100",
      Double: "150",
    },
  },
  "SULTANI HOTEL": {
    category: "3 stars",
    distance: "4.9 Km",
    rooms: {
      Standard: "140",
      Suite: "200",
    },
  },
  "EVEREST HOTEL": {
    category: "3 stars",
    distance: "1.5 Km",
    rooms: {
      Standard: "80",
      "Superior B": "90",
      "Superior A": "100",
      Suite: "300",
    },
  },
  "HOTEL PARADIS M": {
    category: "3 stars",
    distance: "3.2 Km",
    rooms: {
      Single: "40",
      "Standard 1": "60",
      "Standard 2": "70",
      Deluxe: "80/90",
      "Suite 1": "110",
      "Suite 2": "120",
    },
  },
  "EMILITON HOTEL": {
    category: "3 stars",
    distance: "2.1 Km",
    rooms: {
      Standard: "100",
    },
  },
  "AFRICANA PALACE": {
    category: "3 stars",
    distance: "1.6 Km",
    rooms: {
      Single: "70",
      Standard: "110",
      Deluxe: "185",
    },
  },
};

export const hotelCategories: Record<string, string[]> = {
  "5 stars": ["FLEUVE CONGO HOTEL", "HILTON KINSHASA"],
  "4 stars": [
    "PULLMAN HOTEL",
    "NOVOTEL",
    "KIN PLAZA ARJAAN HOTEL BY ROTANA",
    "ROYAL HOTEL",
    "BEATRICE HOTEL",
  ],
  "3 stars": [
    "SELTON HOTEL",
    "LEON HOTEL",
    "FORTUNE HOTEL",
    "BELLE VIE HOTEL",
    "RELAX HOTEL",
    "FADEN HOUSE",
    "SULTANI HOTEL",
    "EVEREST HOTEL",
    "HOTEL PARADIS M",
    "EMILITON HOTEL",
    "AFRICANA PALACE",
  ],
};

export function getHotel(name: string): HotelInfo | undefined {
  return hotelsData[name];
}

export function getRoomPrice(hotel: string, roomType: string): string | null {
  const info = hotelsData[hotel];
  if (!info) return null;
  return info.rooms[roomType] ?? null;
}
