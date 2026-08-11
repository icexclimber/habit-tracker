import { Component, OnInit, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';
import { Router } from '@angular/router';

// Importaciones de AngularFire Auth
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoginMode = true; // Controla si estamos en modo login o registro
  
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private injector = inject(EnvironmentInjector); // Inyector necesario para el contexto de AngularFire

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
  }

  async ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // EnvolvemosgetRedirectResult en el contexto de inyección para evitar advertencias de Angular/Zone.js
    runInInjectionContext(this.injector, async () => {
      try {
        const result = await getRedirectResult(this.auth);
        if (result) {
          // Si el usuario regresa exitosamente del flujo de Google
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
      // Inicia el flujo seguro de redirección con Google
      await signInWithRedirect(this.auth, provider);
    } catch (error: any) {
      console.error('Error iniciando la redirección con Google:', error.message);
    }
  }
}