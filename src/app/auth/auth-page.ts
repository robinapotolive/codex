import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from './auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly mode: AuthMode = this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login';
  readonly justRegistered = this.route.snapshot.queryParamMap.has('registered');
  readonly form = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      ...(this.mode === 'register'
        ? {
            confirmPassword: new FormControl('', {
              nonNullable: true,
              validators: [Validators.required],
            }),
          }
        : {}),
    },
    { validators: this.mode === 'register' ? this.passwordsMatch : null },
  );

  errorMessage = '';
  isSubmitting = false;
  submitted = false;

  get emailError(): string | null {
    const control = this.form.controls.email;
    if (!this.showError(control)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Enter your email address.';
    }
    return 'Enter a valid email address.';
  }

  get passwordError(): string | null {
    const control = this.form.controls.password;
    if (!this.showError(control)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Enter your password.';
    }
    return 'Use at least 8 characters.';
  }

  get confirmPasswordError(): string | null {
    const control = this.form.get('confirmPassword');
    if (!control || !(control.touched || this.submitted)) {
      return null;
    }
    if (control.hasError('required')) {
      return 'Confirm your password.';
    }
    return this.form.hasError('passwordMismatch') ? 'Passwords do not match.' : null;
  }

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.isSubmitting = true;
    try {
      const { email, password } = this.form.getRawValue();
      if (this.mode === 'register') {
        await this.auth.register(email, password);
        await this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      } else {
        await this.auth.login(email, password);
        await this.router.navigateByUrl('/dashboard');
      }
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private showError(control: { touched: boolean; invalid: boolean }): boolean {
    return control.invalid && (control.touched || this.submitted);
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmation = group.get('confirmPassword')?.value;

    return !confirmation || password === confirmation ? null : { passwordMismatch: true };
  }
}
