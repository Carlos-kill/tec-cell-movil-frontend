import { Component, inject, OnInit } from '@angular/core';
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
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = false;
  errorMensaje = '';
  infoMensaje = '';

  form = this.fb.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
    recordar: [false]
  });

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('tcm_recordar_usuario');
    if (usuarioGuardado) {
      this.form.patchValue({
        usuario: usuarioGuardado,
        recordar: true
      });
    }
  }

  onOlvidastePassword(event: Event): void {
    event.preventDefault();
    this.errorMensaje = '';
    this.infoMensaje = 'Por favor, contacta al administrador del sistema para restablecer tu contraseña.';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.cargando = true;
    this.errorMensaje = '';
    this.infoMensaje = '';

    const { usuario, password, recordar } = this.form.value;

    this.authService.login({ usuario: usuario!, password: password! }).subscribe({
      next: () => {
        this.cargando = false;
        if (recordar) {
          localStorage.setItem('tcm_recordar_usuario', usuario!);
        } else {
          localStorage.removeItem('tcm_recordar_usuario');
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.errorMensaje = err.error?.error ?? 'Usuario o contraseña incorrectos';
      }
    });
  }
}
