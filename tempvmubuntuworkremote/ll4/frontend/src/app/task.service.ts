import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from '../models/task';
import { BehaviorSubject, Observable } from 'rxjs';
import { ServerResponse } from '../models/response';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private taskUrl: string  = "/api/tasks/";
  private refetchSubject = new BehaviorSubject(null);

  constructor(private http: HttpClient) { }

  get refetch() {
    return this.refetchSubject.asObservable();
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.taskUrl);
  }

  createTask(description: string): Observable<ServerResponse> {
    return this.http.post<ServerResponse>(this.taskUrl, {
      description
    });
  }

  updateTask(task_id:number, status: string): Observable<ServerResponse> {
    return this.http.put<ServerResponse>(this.taskUrl + task_id, {
      status
    });
  }
  
}
