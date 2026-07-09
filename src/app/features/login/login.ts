import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = false;
  errorMensaje = '';

  form = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.cargando = true;
    this.errorMensaje = '';

    this.authService.login(this.form.value as { usuario: string; password: string }).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = err.error?.error ?? 'Usuario o contraseña incorrectos';
      }
    });
  }
}
