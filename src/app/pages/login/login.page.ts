import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';
import { Router } from '@angular/router';
// Importaciones clave de Firebase
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  isLoginMode = true; // Controla si estamos iniciando sesión o registrando
  
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  constructor() {
    addIcons({ mailOutline, lockClosedOutline, logoGoogle });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode; // Cambia entre login y registro
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      
      try {
        if (this.isLoginMode) {
          // Iniciar sesión
          await signInWithEmailAndPassword(this.auth, email, password);
        } else {
          // Crear cuenta nueva
          await createUserWithEmailAndPassword(this.auth, email, password);
        }
        
        // Si todo sale bien, lo mandamos a su panel de hábitos
        this.router.navigate(['/dashboard']);
        
      } catch (error: any) {
        console.error('Error de autenticación:', error.message);
        // Aquí luego podemos agregar un mensaje de error visual (Toast)
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Error con Google:', error.message);
    }
  }
}