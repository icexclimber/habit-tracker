import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Componentes Standalone de Ionic
import { 
  IonContent, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonCheckbox,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { 
  personCircleOutline, timeOutline, checkmarkCircleOutline, add, 
  cameraOutline, imageOutline, createOutline, documentTextOutline,
  colorPaletteOutline, trophyOutline, logOutOutline, closeOutline,
  analyticsOutline, medalOutline, starOutline, chevronBackOutline, 
  chevronForwardOutline, listOutline, shareSocialOutline, trashOutline
} from 'ionicons/icons';

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Auth, signOut } from '@angular/fire/auth';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule,
    // Componentes Standalone de Ionic registrados explícitamente
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonCheckbox,
    IonFab,
    IonFabButton,
    IonModal,
    IonInput,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTextarea
  ]
})
export class DashboardPage implements OnInit {
  
  private auth = inject(Auth);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private habitService = inject(HabitService);

  // Control de Modales
  isFeedbackModalOpen = false;
  isAddModalOpen = false;
  isEditModalOpen = false;
  isLogDetailModalOpen = false;
  isSummaryModalOpen = false;
  isAchievementsModalOpen = false;
  isAllHabitsModalOpen = false; 
  
  selectedHabit: any = null;
  editingHabit: any = null;
  summaryStats: any = null;
  selectedLogDetail: any = null;
  selectedLogDate: string = '';

  sessionNote: string = '';
  sessionPhoto: string | null = null;
  
  habitForm!: FormGroup;
  editForm!: FormGroup;

  selectedDate = new Date(); 
  currentMonthName = new Date().toLocaleString('es-ES', { month: 'long' });
  
  // Configuración de los 5 temas avanzados
  currentThemeIndex = 0;
  themesList = ['', 'theme-vintage', 'theme-amethyst', 'theme-crimson', 'theme-emerald'];
  themeNames = ['Clásico (Azul)', 'Modo Oscuro', 'Vintage (Sepia)', 'Retro 80s', 'Emerald (Bosque)'];

  habits: any[] = [];

  constructor() {
    // Registro explícito de íconos mapeados a sus nombres kebab-case
    addIcons({ 
      'person-circle-outline': personCircleOutline, 
      'time-outline': timeOutline, 
      'checkmark-circle-outline': checkmarkCircleOutline, 
      'add': add, 
      'camera-outline': cameraOutline, 
      'image-outline': imageOutline, 
      'create-outline': createOutline, 
      'document-text-outline': documentTextOutline, 
      'color-palette-outline': colorPaletteOutline, 
      'trophy-outline': trophyOutline, 
      'log-out-outline': logOutOutline, 
      'close-outline': closeOutline, 
      'analytics-outline': analyticsOutline, 
      'medal-outline': medalOutline, 
      'star-outline': starOutline, 
      'chevron-back-outline': chevronBackOutline, 
      'chevron-forward-outline': chevronForwardOutline, 
      'list-outline': listOutline, 
      'share-social-outline': shareSocialOutline, 
      'trash-outline': trashOutline
    });
  }

  ngOnInit() {
    this.habitForm = this.fb.group({ 
      name: ['', Validators.required], goal: ['', Validators.required], 
      time: ['12:00', Validators.required], days: [[1, 2, 3, 4, 5], Validators.required] 
    });
    this.editForm = this.fb.group({ 
      name: ['', Validators.required], goal: ['', Validators.required], 
      time: ['12:00', Validators.required], days: [[1, 2, 3, 4, 5], Validators.required] 
    });

    this.loadUserHabits();
  }

  async loadUserHabits() {
    if (this.auth.currentUser) {
      this.habits = await this.habitService.getHabits();
    } else {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  // Obtiene la fecha local exacta evitando el desfase de zona horaria UTC
  get todayStr() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get selectedDateStr() {
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get displayedDateText() {
    if (this.selectedDateStr === this.todayStr) return 'Para Hoy';
    return this.selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
  }

  prevDay() {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 1);
    this.selectedDate = d;
  }

  nextDay() {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 1);
    this.selectedDate = d;
  }

  get filteredHabits() {
    const dayOfWeek = this.selectedDate.getDay();
    return this.habits.filter(h => h.days && h.days.includes(dayOfWeek));
  }

  openAllHabits() {
    this.isAllHabitsModalOpen = true;
  }

  async deleteHabit(habitId: string) {
    await this.habitService.deleteHabit(habitId);
    await this.loadUserHabits();
  }

  async shareHabit(habit: any) {
    const totalLogs = habit.history ? Object.keys(habit.history).length : 0;
    const text = `¡Llevo un gran progreso con mi hábito "${habit.name}"! Lo he completado ${totalLogs} veces. 🔥`;
    
    if (navigator.share) {
      try { await navigator.share({ title: 'Mi Progreso', text }); } catch(e) {}
    } else {
      alert(text);
    }
  }

  async logout() {
    try { 
      await signOut(this.auth); 
      this.router.navigate(['/login'], { replaceUrl: true }); 
    } catch (error) { 
      console.error("Error al cerrar sesión", error); 
    }
  }

  viewAchievements() { this.isAchievementsModalOpen = true; }
  
  // Rotador avanzado de Temas y Estilos Globales
  changeTheme() {
    if (this.themesList[this.currentThemeIndex]) {
      document.body.classList.remove(this.themesList[this.currentThemeIndex]);
    }

    this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themesList.length;

    const newTheme = this.themesList[this.currentThemeIndex];
    if (newTheme) {
      document.body.classList.add(newTheme);
    }

    console.log(`Estilo aplicado: ${this.themeNames[this.currentThemeIndex]}`);
  }

  openSummaryModal(habit: any) {
    this.selectedHabit = habit;
    const history = habit.history || {};
    const totalLogs = Object.keys(history).length;
    let totalMood = 0;
    Object.values(history).forEach((log: any) => totalMood += log.mood);
    
    this.summaryStats = { 
      totalDays: totalLogs, 
      avgMood: totalLogs > 0 ? (totalMood / totalLogs).toFixed(1) : 0, 
      adherence: totalLogs > 0 ? '85%' : '0%' 
    };
    this.isSummaryModalOpen = true;
  }

  openEditFromSummary() {
    this.isSummaryModalOpen = false;
    setTimeout(() => { this.openEditModal(this.selectedHabit); }, 150);
  }

  openEditModal(habit: any) {
    this.editingHabit = habit;
    this.editForm.patchValue({ 
      name: habit.name, goal: habit.goal, time: habit.time, days: habit.days 
    });
    this.isEditModalOpen = true;
  }

  async saveHabitEdit() {
    if (this.editForm.valid && this.editingHabit) {
      const v = this.editForm.value;
      await this.habitService.updateHabit(this.editingHabit.id, {
        name: v.name, goal: v.goal, time: v.time, days: v.days
      });
      this.isEditModalOpen = false;
      await this.loadUserHabits();
    }
  }

  async saveHabit() {
    if (this.habitForm.valid) {
      const user = this.auth.currentUser;
      if (!user) return;

      const v = this.habitForm.value;
      await this.habitService.addHabit({
        name: v.name, 
        goal: v.goal, 
        time: v.time, 
        days: v.days, 
        history: {},
        userId: user.uid
      });
      
      this.habitForm.reset({ time: '12:00', days: [1, 2, 3, 4, 5] });
      this.isAddModalOpen = false;
      await this.loadUserHabits();
    }
  }

  getMonthProgress(habit: any) {
    const now = new Date(); 
    const year = now.getFullYear(); 
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const history = habit.history || {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const dayStr = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      const log = history[dateStr];
      days.push({
        dayNumber: day, dateStr: dateStr, 
        scheduled: habit.days && habit.days.includes(d.getDay()),
        completed: !!log, isToday: dateStr === this.todayStr,
        isSelected: dateStr === this.selectedDateStr,
        mood: log ? log.mood : null, logData: log || null
      });
    }
    return days;
  }

  openLogDetail(day: any) {
    if (day.completed && day.logData) {
      this.selectedLogDetail = day.logData; 
      this.selectedLogDate = day.dateStr;
      this.isLogDetailModalOpen = true;
    }
  }

  openFeedbackModal(habit: any) {
    this.selectedHabit = habit; 
    this.sessionNote = ''; 
    this.sessionPhoto = null;
    this.isFeedbackModalOpen = true;
  }

  async takePhoto(source: 'camera' | 'photos') {
    try {
      const image = await Camera.getPhoto({ 
        quality: 70, allowEditing: false, resultType: CameraResultType.DataUrl, 
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos 
      });
      this.sessionPhoto = image.dataUrl || null;
    } catch (e) {}
  }

  async saveLog(moodLevel: number) {
    if (this.selectedHabit) {
      if (!this.selectedHabit.history) {
        this.selectedHabit.history = {};
      }
      this.selectedHabit.history[this.selectedDateStr] = { 
        mood: moodLevel, note: this.sessionNote, photo: this.sessionPhoto, timestamp: new Date() 
      };
      await this.habitService.updateHabit(this.selectedHabit.id, { history: this.selectedHabit.history });
      await this.loadUserHabits();
    }
    this.isFeedbackModalOpen = false;
  }
}