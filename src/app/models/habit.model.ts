export interface HabitLog {
  completed: boolean;
  mood: number;
  note?: string;
  photo?: string;
  timestamp: any;
}

export interface Habit {
  id?: string;
  userId: string;
  name: string;
  goal: string;        // Meta diaria (ej: "Leer 15 páginas")
  objective: string;   // Objetivo general (ej: "Terminar 1 libro al mes")
  time: string;        // Hora programada "14:30"
  days: number[];      // Días programados [0, 1, 2, ...]

  // Gamificación
  xpReward: number;     // XP que otorga (por defecto: 50)
  coinsReward: number;  // Monedas que otorga (por defecto: 10)
  masteryLevel: number; // Nivel de maestría (1 a 5)

  // Hábito Grupal
  isGroup?: boolean;
  partnerId?: string;   // UID del amigo vinculado

  history: { [dateStr: string]: HabitLog };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  xp: number;
  level: number;
  coins: number;
  badges: string[];     // IDs de logros desbloqueados
  friends: string[];    // UIDs de amigos
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
  category: string;
}