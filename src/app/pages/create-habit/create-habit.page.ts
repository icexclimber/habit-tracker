import { Component, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-create-habit',
  templateUrl: './create-habit.page.html',
  styleUrls: ['./create-habit.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, FormsModule]
})
export class CreateHabitPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
