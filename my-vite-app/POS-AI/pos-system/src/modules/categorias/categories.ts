// Definimos los modificadores por defecto con ingredientes adicionales ordenados alfabéticamente
const defaultModifiers = {
  "+": {
    "+ alcachofas": 2,

"+ ajo": 2,

"+ anchoas": 2,

"+ atun": 2,

"+ bacon": 2,

"+ base nata": 2,

"+ carne mechada": 2,

"+ carne picada": 2,

"+ champiñon": 2,

"+ cherry": 2,

"+ cebolla": 2,

"+ gambas": 2,

"+ guindillas": 2,

"+ huevo": 2,

"+ jalapeños": 2,

"+ jamon": 2,

"+ jamon serrano": 2,

"+ maiz": 2,

"+ mozarella bufala": 2,

"+ olivas": 2,

"+ peperoni": 2,

"+ pimiento": 2,

"+ piña": 2,

"+ pollo": 2,

"+ queso": 2.5,

"+ queso de cabra": 2,

"+ roquefort": 2,

"+ salmon": 2,
  },
  "-": {
    "- alcachofas": 2,

"- ajo": 2,

"- anchoas": 2,

"- atun": 2,

"- bacon": 2,

"- base nata": 2,

"- carne mechada": 2,

"- carne picada": 2,

"- champiñon": 2,

"- cherry": 2,

"- cebolla": 2,

"- gambas": 2,

"- guindillas": 2,

"- huevo": 2,

"- jalapeños": 2,

"- jamon": 2,

"- jamon serrano": 2,

"- maiz": 2,

"- mozarella bufala": 2,

"- olivas": 2,

"- peperoni": 2,

"- pimiento": 2,

"- piña": 2,

"- pollo": 2,

"- queso": 2.5,

"- queso de cabra": 2,

"- roquefort": 2,

"- salmon": 2,
  },
};

// Función que añade los modificadores a cada producto
function addModifiers(products: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(products).map(([name, price]) => [
      name,
      { price, ...defaultModifiers },
    ])
  );
}

export const categorias = {
  "Bebidas 🥛": {
    "Refrescos 🥃": {
      "1/3 00": 2.5,
  "1/3 Cruzcampo": 2.5,
  "1/3 Estrella": 2.5,
  "1/3 Heineken": 2.5,
  "Agua": 2.5,
  "Agua con gas": 2.5,
  "Aquarius": 2.5,
  "Caña": 2.5,
  "Cerveza jarra": 12.5,
  "Chupito": 2.5,
  "Coca cola": 2.5,
  "Coca cola 0": 2.5,
  "Copa": 2.5,
  "Cubata": 2.5,
  "Fanta limon": 2.5,
  "Fanta naranja": 2.5,
  "Nestea": 2.5,
  "Pinta": 2.5,
  "Sangria jarra": 12.5,
  "Sangria vaso": 2.5,
  "Sprite": 2.5,
  "Tinto de verano": 2.5,
  "Tonica": 2.5,
  "Zumo manzana": 2.5,
  "Zumo melocoton": 2.5,
  "Zumo naranja": 2.5,
  "Zumo piña": 2.5
    },
    "Vinos 🍷": {
      Rioja: 10.5,
      Rueda: 11,
    },
    "Cafes ☕️": {
      Solo: 1.5,
      Cortado: 1.6,
      "Con leche": 1.7,
      Americano: 1.5,
      Bombon: 1.5,
      Capuchino:2.5,
      Irlandes:3.5,
      Carajillo:2.2,
      Infusion:1.5,
    },
    "Cocteles 🍸": {
      "Cocoa special": 6.5,
      "Pina colada": 6.6,
      Margarita: 5
    },
  },
  
  "Entrantes 🥙": {
    "Bacon chips": 11.5,
    "Chips": 5.5,
    "Ensalada atun": 9.5,
    "Ensalada caprese": 9.5,
    "Ensalada cesar": 12.5,
    "Ensalada griega": 11.5,
    "Ensalada jamon": 9.5,
    "Ensalada mixta": 9.0,
    "Finguers": 6.5,
    "Jalapeños": 6.5,
    "Menu niño": 9.25,
    "Nachos": 9.75,
    "Nachos especiales": 12.75,
    "Pan ajo": 2.75,
    "Pan pita": 5.0,
    "Pan pita ajo": 7.5,
    "Pizza marinara": 7.5,
    "Provoleta": 9.5
  },
  "Pizzas 🍕": {
    Enteras: addModifiers({
      
     "(1) Margarita": 9.35,
  "(2) Peperoni": 10.45,
  "(3) Pescatore": 11.0,
  "(4) Fungi": 10.20,
  "(5) Cuatro quesos": 13.2,
  "(6) Vesubio": 10.45,
  "(7) Diavola": 11.5,
  "(8) Monika": 12.4,
  "(9) Vegetariana": 12.1,
  "(12) Caprichosa": 11.3,
  "(14) Siciliana": 13.75,
  "(16) Calzone": 13.5,
  "(17) Calzone especial": 14.75,
  "(18) Calzone napolitana": 15.5,
  "(19) Mexicana": 12.75,
  "(21) Steck": 12.5,
  "(22) Hawai": 11.5,
  "(23) Rimini": 13.5,
  "(25) Cocoa": 13.75,
  "(26) Gran Alacant": 12.25,
  "(27) Padrino": 13.75,
  "(28) Kebab": 13.75,
  "(30) Barbacoa": 13.5,
  "(31) Carbonara": 13.0,
  "(32) Georgios": 13.75,
  "(33) Griega": 13.75,
  "(34) Española": 13.75,
  "(35) Cuatro estaciones": 13.75,
  "(36) Oliver": 13.5,
  "(37) Nordica": 14.75,
  "(38) Campera": 13.5,
  "(39) Capresse": 12.5,
  "(40) Nutella": 10.0,
  "(41) Lotus": 10.0,
  "(42) Kinder": 10.0,
  "(43) Pizza del mes": 14.95
    }),
    Medias: addModifiers({
      "(* media) (1) Margarita": 6.5,
  "(* media) (2) Peperoni": 7.0,
  "(* media) (3) Pescatore": 7.5,
  "(* media) (4) Fungi": 7.0,
  "(* media) (5) Cuatro quesos": 8.5,
  "(* media) (6) Vesubio": 7.0,
  "(* media) (7) Diavola": 7.5,
  "(* media) (8) Monika": 8.0,
  "(* media) (9) Vegetariana": 8.0,
  "(* media) (12) Caprichosa": 7.5,
  "(* media) (14) Siciliana": 8.5,
  "(* media) (16) Calzone": 8.5,
  "(* media) (17) Calzone especial": 9.0,
  "(* media) (18) Calzone napolitana": 9.5,
  "(* media) (19) Mexicana": 8.0,
  "(* media) (21) Steck": 8.0,
  "(* media) (22) Hawai": 7.5,
  "(* media) (23) Rimini": 8.5,
  "(* media) (25) Cocoa": 8.5,
  "(* media) (26) Gran Alacant": 8.0,
  "(* media) (27) Padrino": 8.5,
  "(* media) (28) Kebab": 8.5,
  "(* media) (30) Barbacoa": 8.5,
  "(* media) (31) Carbonara": 8.5,
  "(* media) (32) Georgios": 8.5,
  "(* media) (33) Griega": 8.5,
  "(* media) (34) Española": 8.5,
  "(* media) (35) Cuatro estaciones": 8.5,
  "(* media) (36) Oliver": 8.5,
  "(* media) (37) Nordica": 9.0,
  "(* media) (38) Campera": 8.5,
  "(* media) (39) Capresse": 8.0,
  "(* media) (40) Nutella": 7.0,
  "(* media) (41) Lotus": 7.0,
  "(* media) (42) Kinder": 7.0,
  "(* media) (43) Pizza del mes": 9.5
    }),
    },
    "Pastas 🍜": {
      Lasana: 10,
      "Esp. blanco":7.5,
      "Esp. carbonara": 11,
      "Esp. bolonesa": 11,
      "Esp. padrino": 12.5,
      "Esp. verduras": 11.5,
      "Esp. 4 quesos": 13,
    
  },
  "Carnes 🥩":{
    Entrecot: 23,
    Planstek: 25.5,
    Pepperstek: 23,
    "Kebab plato": 12.5,
    "Kebab pan": 10.5,
    Pollo:12.5,

  },
  "Pescados 🐟":{
    Salmon: 20.5,
    Merluza:14.5,
  },
  "Postres 🍰": {
    Tiramisú: 4.0,
    Coulant:5,
    "Helado bola":3.5,
    "Tarta zanahoria":5.5,
    Cheesecake:5.5,
    "Heldo niño":1.5
  },
  "Extras 🫘":{
    "Menu nino": 7.5,
    "Salsa pimienta": 2.5,
    "Salsa bearnesa": 2.5,
    "Salsa 4 quesos": 3.5,
    "A domicilio": 3.5,
    
  }
};
