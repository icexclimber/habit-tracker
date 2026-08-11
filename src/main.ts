import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

// Importar Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from './environments/environment';

// Importar registrar de íconos e íconos utilizados
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, logoGoogle } from 'ionicons/icons';

// Registrar íconos globalmente para que estén disponibles en toda la app
addIcons({
  'mail-outline': mailOutline,
  'lock-closed-outline': lockClosedOutline,
  'logo-google': logoGoogle
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      mode: 'md' // Forzar modo Material Design o 'ios' para consistencia visual
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    
    // Proveedores de Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
});