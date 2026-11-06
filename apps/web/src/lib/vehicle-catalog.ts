import type { VehicleType } from "@/types"

export interface VehicleTypeOption {
  value: VehicleType
  label: string
  shortLabel: string
  icon: string
  description: string
}

export const VEHICLE_TYPES: VehicleTypeOption[] = [
  {
    value: "CAR",
    label: "Carro / Camioneta",
    shortLabel: "Carro",
    icon: "🚗",
    description: "Automóvil, campero, camioneta, SUV",
  },
  {
    value: "MOTORCYCLE",
    label: "Moto / Motocicleta",
    shortLabel: "Moto",
    icon: "🏍️",
    description: "Motocicletas urbanas, deportivas, scooter",
  },
  {
    value: "ATV",
    label: "Cuatrimoto / ATV / UTV",
    shortLabel: "Cuatrimoto",
    icon: "🛞",
    description: "Cuatrimotos, 4x4 todoterreno, side-by-side",
  },
  {
    value: "OTHER",
    label: "Otro (Camión / Especial)",
    shortLabel: "Otro",
    icon: "🚚",
    description: "Furgón, camión, motocarro, maquinaria",
  },
]

export const POPULAR_BRANDS: Record<VehicleType, string[]> = {
  CAR: [
    "Chevrolet",
    "Renault",
    "Toyota",
    "Kia",
    "Mazda",
    "Nissan",
    "Ford",
    "Hyundai",
    "Volkswagen",
    "Suzuki",
    "Honda",
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Jeep",
    "BYD",
    "Chery",
    "Mitsubishi",
    "Peugeot",
    "Subaru",
    "Volvo",
    "Fiat",
    "Citroën",
    "Seat",
    "RAM",
    "Dodge",
    "Mini",
    "Land Rover",
    "Changan",
    "JAC",
    "Foton",
    "Great Wall",
  ],
  MOTORCYCLE: [
    "Yamaha",
    "Bajaj",
    "Honda",
    "Suzuki",
    "AKT",
    "KTM",
    "TVS",
    "Kawasaki",
    "Hero",
    "BMW",
    "Kymco",
    "Royal Enfield",
    "Ducati",
    "Benelli",
    "Victory",
    "Husqvarna",
    "Harley-Davidson",
    "Vespa",
    "Piaggio",
    "CF Moto",
    "SYM",
    "Aprilia",
    "Triumph",
  ],
  ATV: [
    "Can-Am",
    "Polaris",
    "Yamaha",
    "Honda",
    "CF Moto",
    "Suzuki",
    "Kawasaki",
    "Arctic Cat",
    "Kymco",
    "Linhai",
    "TGB",
    "Segway",
    "Hisun",
    "BRP",
    "TaoTao",
  ],
  OTHER: [
    "Chevrolet",
    "Hino",
    "Fuso",
    "Isuzu",
    "International",
    "Mercedes-Benz",
    "Kenworth",
    "Freightliner",
    "JAC",
    "Foton",
    "Ford",
    "Mack",
    "Dongfeng",
    "Scania",
    "Volvo",
    "Piaggio",
    "Bajaj",
    "Torito",
  ],
}

export function getVehicleTypeInfo(type?: VehicleType): VehicleTypeOption {
  return VEHICLE_TYPES.find((t) => t.value === type) ?? VEHICLE_TYPES[0]
}

export function getBrandsForType(type: VehicleType): string[] {
  return POPULAR_BRANDS[type] || POPULAR_BRANDS.CAR
}
