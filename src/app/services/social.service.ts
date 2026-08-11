import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDocs, updateDoc, query, orderBy, limit, addDoc, arrayUnion } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserProfile } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class SocialService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Obtener los mejores 10 usuarios por XP
  async getLeaderboardByXp(): Promise<UserProfile[]> {
    const usersCol = collection(this.firestore, 'users');
    const q = query(usersCol, orderBy('xp', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as UserProfile);
  }

  // Obtener los mejores 10 usuarios por Monedas
  async getLeaderboardByCoins(): Promise<UserProfile[]> {
    const usersCol = collection(this.firestore, 'users');
    const q = query(usersCol, orderBy('coins', 'desc'), limit(10));
    const snap = await getDocs(q);
    return snap.docs.map(doc => doc.data() as UserProfile);
  }

  // Enviar "Zumbido" / Alerta a un amigo para motivarlo
  async sendNudge(friendUid: string, habitName: string) {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return;

    const nudgesCol = collection(this.firestore, 'nudges');
    await addDoc(nudgesCol, {
      fromUid: currentUser.uid,
      fromName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Un amigo',
      toUid: friendUid,
      habitName: habitName,
      timestamp: new Date(),
      message: '¡Oye! No te desmotives, es hora de cumplir tu hábito 🔥'
    });
  }

  // Agregar un amigo por su UID
  async addFriend(friendUid: string) {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    await updateDoc(userRef, {
      friends: arrayUnion(friendUid)
    });
  }
}