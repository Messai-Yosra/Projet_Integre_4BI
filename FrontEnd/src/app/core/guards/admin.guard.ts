import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminAuthService } from '../services/admin-auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const adminAuthService = inject(AdminAuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();
  if (!user || user.role?.name !== 'Admin') {
    router.navigate(['/home']);
    return false;
  }

  // Admin session may not be unlocked yet — the page itself will show the modal
  return true;
};
