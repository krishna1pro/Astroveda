export interface PanchangData {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  varjyam: string;
  amrutam: string;
  durmuhurtam: string;
  sunrise: string;
  sunset: string;
  day: string;
}

export interface RashiHoroscope {
  Date: string;
  Rashi_EN: string;
  Rashi_TE: string;
  General_TE: string;
  General_EN: string;
  Love_TE: string;
  Love_EN: string;
  Career_TE: string;
  Career_EN: string;
  Health_TE: string;
  Health_EN: string;
}

export interface PujaItem {
  [key: string]: any;
}

export interface Puja {
  id: string;
  name: string;
}
