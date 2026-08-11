import { Component, OnInit, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Componentes Standalone de Ionic
import { 
  IonContent, 
  IonItem, 
  IonIcon, 
  IonInput, 
  IonNote, 
  IonButton 
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';

// Importaciones de AngularFire Auth
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonIcon,
    IonInput,
    IonNote,
    IonButton
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoginMode = true; // Controla si estamos en modo login o registro
  
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private injector = inject(EnvironmentInjector); // Inyector para el contexto de AngularFire

  constructor() {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'logo-google': logoGoogle
    });
  }

  async ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    //getRedirectResult en el contexto de inyección para evitar advertencias de Angular/Zone.js
    runInInjectionContext(this.injector, async () => {
      try {
        const result = await getRedirectResult(this.auth);
        if (result) {
          this.router.navigate(['/dashboard']);
        }
      } catch (error: any) {
        console.error('Error procesando la redirección de Google:', error.message);
      }
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      // Quitar el foco activo para evitar el error de aria-hidden durante la transición
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const { email, password } = this.loginForm.value;
      
      try {
        if (this.isLoginMode) {
          await signInWithEmailAndPassword(this.auth, email, password);
        } else {
          await createUserWithEmailAndPassword(this.auth, email, password);
        }
        
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          console.error('Credenciales incorrectas.');
        } else {
          console.error('Error de autenticación:', error.message);
        }
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(this.auth, provider);
    } catch (error: any) {
      console.error('Error iniciando la redirección con Google:', error.message);
    }
  }
}