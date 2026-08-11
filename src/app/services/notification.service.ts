import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Catálogo de frases motivacionales aleatorias
  private motivationalQuotes: string[] = [
    "¡El éxito es la suma de pequeños esfuerzos repetidos día tras día!",
    "No cuentes los días, haz que los días cuenten. ¡Cumple tu hábito!",
    "La disciplina es el puente entre tus metas y tus logros.",
    "El mejor momento para empezar fue ayer. El segundo mejor momento es hoy.",
    "Un pequeño avance diario suma grandes resultados.",
    "¡Hoy es un gran día para no romper la racha!"
  ];

  // Solicitar permisos de notificación al usuario
  async requestPermissions(): Promise<boolean> {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  }

  // Programar notificación 2 horas después de la hora configurada
  async scheduleHabitReminder(habitId: string, habitName: string, habitTime: string) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const [hours, minutes] = habitTime.split(':').map(Number);
    const now = new Date();
    
    // Configurar la hora del hábito + 2 horas de tolerancia
    const scheduledDate = new Date();
    scheduledDate.setHours(hours + 2, minutes, 0, 0);

    // Si la hora programada ya pasó hoy, programarla para el día siguiente
    if (scheduledDate.getTime() <= now.getTime()) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    // Seleccionar una frase aleatoria
    const randomQuote = this.motivationalQuotes[Math.floor(Math.random() * this.motivationalQuotes.length)];
    const notificationId = this.generateNumericId(habitId);

    // Cancelar cualquier notificación previa vinculada a este hábito
    await this.cancelNotification(habitId);

    // Programar la nueva alerta local
    await LocalNotifications.schedule({
      notifications: [
        {
          title: `⚠️ Recordatorio de Hábito: ${habitName}`,
          body: `${randomQuote}`,
          id: notificationId,
          schedule: { at: scheduledDate },
          sound: undefined,
          actionTypeId: '',
          extra: { habitId }
        }
      ]
    });
  }

  // Cancelar la notificación pendiente cuando el hábito es completado o borrado
  async cancelNotification(habitId: string) {
    const notificationId = this.generateNumericId(habitId);
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
    } catch (e) {
      console.log('No se pudo cancelar la notificación:', e);
    }
  }

  // Generador de ID numérico único a partir del ID del hábito (string)
  private generateNumericId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 1000000;
  }
}