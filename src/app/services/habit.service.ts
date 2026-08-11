import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private injector = inject(EnvironmentInjector);

  // Obtener los hábitos del usuario actual
  async getHabits() {
    return runInInjectionContext(this.injector, async () => {
      const user = this.auth.currentUser;
      if (!user) return [];
      
      const habitsRef = collection(this.firestore, `users/${user.uid}/habits`);
      const snapshot = await getDocs(habitsRef);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    });
  }

  // Agregar un nuevo hábito vinculado al UID del usuario
  async addHabit(habitData: any) {
    return runInInjectionContext(this.injector, async () => {
      const user = this.auth.currentUser;
      if (!user) return;
      
      const habitsRef = collection(this.firestore, `users/${user.uid}/habits`);
      return await addDoc(habitsRef, { 
        ...habitData, 
        userId: user.uid 
      });
    });
  }

  // Actualizar un hábito existente
  async updateHabit(habitId: string, data: any) {
    return runInInjectionContext(this.injector, async () => {
      const user = this.auth.currentUser;
      if (!user) return;
      
      const habitDocRef = doc(this.firestore, `users/${user.uid}/habits`, habitId);
      return await updateDoc(habitDocRef, data);
    });
  }

  // Borrar un hábito de la base de datos
  async deleteHabit(habitId: string) {
    return runInInjectionContext(this.injector, async () => {
      const user = this.auth.currentUser;
      if (!user) return;
      
      const habitDocRef = doc(this.firestore, `users/${user.uid}/habits`, habitId);
      return await deleteDoc(habitDocRef);
    });
  }
}