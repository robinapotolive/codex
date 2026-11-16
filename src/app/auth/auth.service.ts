import { Injectable, signal } from '@angular/core';

interface StoredUser {
  email: string;
  salt: string;
  passwordHash: string;
}

function isStoredUser(value: unknown): value is StoredUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return (
    'email' in value &&
    typeof value.email === 'string' &&
    'salt' in value &&
    typeof value.salt === 'string' &&
    'passwordHash' in value &&
    typeof value.passwordHash === 'string'
  );
}

const USERS_KEY = 'codex-auth-demo.users';
const SESSION_KEY = 'codex-auth-demo.session';
const PBKDF2_ITERATIONS = 120_000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal(this.readSession());

  async register(email: string, password: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const users = this.readUsers();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await this.hashPassword(password, salt);
    users.push({
      email: normalizedEmail,
      salt: this.toBase64(salt),
      passwordHash: this.toBase64(passwordHash),
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async login(email: string, password: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const user = this.readUsers().find((storedUser) => storedUser.email === normalizedEmail);

    if (!user) {
      throw new Error('Incorrect email or password.');
    }

    const salt = this.fromBase64(user.salt);
    const passwordHash = await this.hashPassword(password, salt);

    if (!this.matches(passwordHash, this.fromBase64(user.passwordHash))) {
      throw new Error('Incorrect email or password.');
    }

    sessionStorage.setItem(SESSION_KEY, normalizedEmail);
    this.currentUser.set(normalizedEmail);
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private readUsers(): StoredUser[] {
    const storedUsers = localStorage.getItem(USERS_KEY);

    if (!storedUsers) {
      return [];
    }

    try {
      const users: unknown = JSON.parse(storedUsers);
      if (!Array.isArray(users) || !users.every(isStoredUser)) {
        throw new Error('Saved accounts are not in the expected format.');
      }
      return users;
    } catch (error) {
      throw new Error('Unable to read saved accounts from this browser.', { cause: error });
    }
  }

  private readSession(): string | null {
    return sessionStorage.getItem(SESSION_KEY);
  }

  private async hashPassword(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
      'deriveBits',
    ]);
    const hash = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: new Uint8Array(salt), iterations: PBKDF2_ITERATIONS },
      key,
      256,
    );
    return new Uint8Array(hash);
  }

  private toBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  private matches(left: Uint8Array, right: Uint8Array): boolean {
    if (left.length !== right.length) {
      return false;
    }

    let difference = 0;
    for (let index = 0; index < left.length; index += 1) {
      difference |= left[index] ^ right[index];
    }
    return difference === 0;
  }
}
