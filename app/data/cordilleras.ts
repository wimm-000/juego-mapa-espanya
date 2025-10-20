export interface Cordillera {
  id: string;
  nombre: string;
  x: number;
  y: number;
  tolerancia: number;
}

export const cordilleras: Cordillera[] = [
  { id: "1", nombre: "Pirineos", x: 490, y: 80, tolerancia: 60 },
  { id: "2", nombre: "Cordillera Cantábrica", x: 150, y: 90, tolerancia: 60 },
  { id: "3", nombre: "Sistema Ibérico", x: 350, y: 200, tolerancia: 60 },
  { id: "4", nombre: "Sierra Morena", x: 220, y: 350, tolerancia: 60 },
  { id: "5", nombre: "Sistemas Béticos", x: 300, y: 430, tolerancia: 60 },
];
