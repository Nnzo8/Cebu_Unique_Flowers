import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the register form with fullName, email, and password controls.
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Handle form submission. Logs form value to console as a placeholder for Firebase Auth.
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    // Placeholder: Future Firebase Authentication integration
    console.log('Register Form Data:', this.registerForm.value);
  }

  /**
   * Convenience getter for fullName control validation.
   */
  get fullName() {
    return this.registerForm.get('fullName');
  }

  /**
   * Convenience getter for email control validation.
   */
  get email() {
    return this.registerForm.get('email');
  }

  /**
   * Convenience getter for password control validation.
   */
  get password() {
    return this.registerForm.get('password');
  }
}
