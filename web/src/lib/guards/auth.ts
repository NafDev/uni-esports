import type { LoadOutput } from '@sveltejs/kit/types/internal';
import type { Roles } from '@uniesports/types';
import { authUser, isAuthed } from '../stores/auth.store';

export function isLoggedInGuard(): LoadOutput {
  if (isAuthed.get()) {
    return {};
  }
  return { status: 302, redirect: '/login' };
}

export function isLoggedOutGuard(): LoadOutput {
  if (!isAuthed.get()) {
    return {};
  }
  return { status: 302, redirect: '/' };
}

export function hasRolesGuard(roles: Roles[]) {
  if (authUser.get() && authUser.get()?.roles) {
    return roles.every((role) => authUser.get()?.roles.includes(role));
  }
  return false;
}
