import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, timeout } from 'rxjs';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  public errorMessage: string = '';
  public isLoading: boolean = false;

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).pipe(
      timeout(10000),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/books']);
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse && err.status === 0) {
          this.errorMessage = 'Serveur API indisponible. Lancez JSON Server sur le port 3000 puis réessayez.';
          return;
        }

        if (err?.name === 'TimeoutError') {
          this.errorMessage = 'La connexion prend trop de temps. Vérifiez que JSON Server est bien lancé.';
          return;
        }

        this.errorMessage = err?.message || 'Erreur lors de la connexion. Veuillez vérifier vos identifiants.';
      }
    });
  }
}
