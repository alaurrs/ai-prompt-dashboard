import { Routes } from '@angular/router';
import {LoginPage} from './features/auth/login/login.page';
import {UnauthGuard} from './core/guards/unauth.guard';
import {AuthGuard} from './core/guards/auth.guard';
import {LogoutPage} from './features/auth/logout/logout.page';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [UnauthGuard], canMatch: [UnauthGuard]},
  { path: 'logout', component: LogoutPage},
  {
    path: '',
    canActivate: [AuthGuard],
    canMatch: [AuthGuard],
    loadComponent: () => import('./features/chat/chat-shell/chat-shell.page').then(m => m.ChatShellPage),
    children: [
      { path: '', loadComponent: () => import('./features/chat/empty-state/chat-empty-state.component').then(m => m.ChatEmptyStateComponent) },
      { path: ':threadId', loadComponent: () => import('./features/chat/chat-thread/chat-thread.page').then(m => m.ChatThreadPage) },
    ],
  },
  {path: '**', redirectTo: ''},
];
