import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user.model';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  public registerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: passwordMatchValidator });

  public errorMessage: string = '';
  public isLoading: boolean = false;

  public onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Create new user minus confirmPassword
    const newUser: User = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
    };

    this.authService.register(newUser).subscribe({
      next: () => {
        this.isLoading = false;
        // Optionally pass a queryparam to show success toast on login
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err instanceof HttpErrorResponse && err.status === 0) {
          this.errorMessage = 'Serveur API indisponible. Lancez JSON Server sur le port 3000 puis réessayez.';
          return;
        }

        this.errorMessage = err?.error?.message || err?.message || 'Erreur lors de la création du compte.';
      }
    });
  }
}
