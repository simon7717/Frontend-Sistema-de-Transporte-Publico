import { Injectable } from '@angular/core';

const AUDIT_USER_KEY = 'pos_audit_usuario_id';

@Injectable({
  providedIn: 'root'
})
export class AuditContextService {
  setAuditUserId(userId: string): void {
    localStorage.setItem(AUDIT_USER_KEY, userId);
  }

  getAuditUserId(): string | null {
    return localStorage.getItem(AUDIT_USER_KEY);
  }

  clearAuditUserId(): void {
    localStorage.removeItem(AUDIT_USER_KEY);
  }
}
