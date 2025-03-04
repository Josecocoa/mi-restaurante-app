// src/types.ts
export interface Order {
  base: string;
  priceBase: number;
  secondHalf?: string;
  priceSecond?: number;
  added?: string[];
  removed?: string[];
  qty: number;
  status: "Pendiente" | "Hecho";
  serveStatus?: "Por servir" | "Servido";
}

export interface Table {
  id: number;
  name: string;
  orders: Order[];
}
