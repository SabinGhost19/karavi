import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Task } from '../models/task';
import { TaskService } from './task.service';
import { catchError, shareReplay, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title: string = "todo-app";
  description: string = "";
  dateString = new Date().toLocaleDateString('ro-RO');
  tasks: Task[] = [
    {
      task_id: 1,
      created_at: new Date(),
      description: "Miau tot ce vredadasdasau",
      status: "IN_PROGRESS"
      }
  ];

  constructor (private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.taskService.refetch
    .pipe(
      switchMap(() =>
        this.taskService.getTasks()
      ),
      shareReplay(1),
      catchError(err => {
        throw err.error;
      })
    ).subscribe(res => {
      this.tasks = res;
    })
  }

  createTask(): void {
    this.taskService.createTask(this.description)
    .subscribe(
      res => {
        this.description = "";
        this.loadData();
      }
    )
  }

  updateTask(task: Task): void {
    let current_status = task.status;
    let new_status = 'DONE'

    if (current_status === 'DONE') {
      new_status = 'IN_PROGRESS';
    }

    this.taskService.updateTask(task.task_id, new_status)
    .subscribe(
      res => {
        this.loadData();
      }
    )
  }

}
