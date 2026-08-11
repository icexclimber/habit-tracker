import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, orderBy, limit } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile, Reward } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Catálogo de recompensas por defecto
  readonly defaultRewards: Reward[] = [
    { id: 'movie', title: 'Ver una Película', cost: 100, icon: 'film-outline', category: 'Entretenimiento' },
    { id: 'gaming', title: '1 hora de Videojuegos', cost: 150, icon: 'game-controller-outline', category: 'Entretenimiento' },
    { id: 'coffee', title: 'Ir por un Café', cost: 80, icon: 'cafe-outline', category: 'Personal' },
    { id: 'beer', title: 'Ir por una Cerveza / Salida', cost: 200, icon: 'beer-outline', category: 'Social' },
    { id: 'relax', title: 'Tiempo de Descanso / Fumar', cost: 90, icon: 'flame-outline', category: 'Relax' }
  ];

  // Obtener o inicializar el perfil del usuario
  async getUserProfile(): Promise<UserProfile> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuario no autenticado');

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data() as UserProfile;
    } else {
      const newProfile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        email: user.email || '',
        xp: 0,
        level: 1,
        coins: 50, // Monedas de bienvenida
        badges: ['welcome_badge'],
        friends: []
      };
      await setDoc(userRef, newProfile);
      return newProfile;
    }
  }

  // Otorgar recompensas al completar un hábito
  async awardHabitCompletion(xp: number = 50, coins: number = 10): Promise<{ newLevel: boolean; profile: UserProfile }> {
    const profile = await this.getUserProfile();
    const newXp = profile.xp + xp;
    const newCoins = profile.coins + coins;
    
    // Cada 200 XP se sube un nivel
    const calculatedLevel = Math.floor(newXp / 200) + 1;
    const levelUp = calculatedLevel > profile.level;

    const updatedProfile: Partial<UserProfile> = {
      xp: newXp,
      coins: newCoins,
      level: calculatedLevel
    };

    const userRef = doc(this.firestore, `users/${profile.uid}`);
    await updateDoc(userRef, updatedProfile);

    return {
      newLevel: levelUp,
      profile: { ...profile, ...updatedProfile } as UserProfile
    };
  }

  // Canjear recompensa en la Tienda
  async redeemReward(reward: Reward): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    if (profile.coins < reward.cost) {
      throw new Error('Monedas insuficientes');
    }

    const newCoins = profile.coins - reward.cost;
    const userRef = doc(this.firestore, `users/${profile.uid}`);
    await updateDoc(userRef, { coins: newCoins });

    return { ...profile, coins: newCoins };
  }

  // Tabla de Clasificación de Amigos (Leaderboard)
  async getLeaderboard(): Promise<UserProfile[]> {
    const usersCol = collection(this.firestore, 'users');
    const q = query(usersCol, orderBy('xp', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as UserProfile);
  }
}