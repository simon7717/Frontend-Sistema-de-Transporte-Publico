import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AUDIT_USER_KEY = 'pos_audit_usuario_id';

export const auditUserGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userId = localStorage.getItem(AUDIT_USER_KEY);

  if (userId && UUID_REGEX.test(userId)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
