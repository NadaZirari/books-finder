import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  public get isLoggedIn$(): Observable<boolean> {
    return this.currentUser$.pipe(map(user => !!user));
  }

  constructor() {}

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public register(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  public login(email: string, password?: string): Observable<User> {
    // Basic auth check against JSON Server list
    let params: any = { email };
    if (password) {
      params.password = password;
    }
    
    return this.http.get<User[]>(this.apiUrl, { params }).pipe(
      map(users => {
        if (users.length === 0) {
          throw new Error('Email ou mot de passe incorrect');
        }
        const user = users[0];
        // Strip password before storing
        const userToStore = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userToStore));
        this.currentUserSubject.next(userToStore);
        return userToStore;
      })
    );
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
