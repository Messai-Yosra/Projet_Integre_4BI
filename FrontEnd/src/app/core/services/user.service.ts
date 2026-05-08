import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  createUser(userData: any): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, userData);
  }

  updateUser(id: number, userData: any): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`);
  }

  changePassword(id: number, passwordData: any): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/users/${id}/password`, passwordData);
  }

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${environment.apiUrl}/roles`);
  }
}
