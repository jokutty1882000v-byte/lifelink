import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';
import { ApiResult } from '../interfaces/api-result.interface';

type ParamValue = string | number | boolean | null | undefined;
type QueryParams = Record<string, ParamValue | ParamValue[]>;

/**
 * Thin HTTP wrapper — unwraps the `ApiResult<T>` envelope and centralizes URL building.
 * Keeps feature services free of URL concatenation and boilerplate.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<ApiResult<T>>(this.url(path), { params: this.buildParams(params) })
      .pipe(map((r) => r.data));
  }

  post<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http.post<ApiResult<T>>(this.url(path), body).pipe(map((r) => r.data));
  }

  put<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http.put<ApiResult<T>>(this.url(path), body).pipe(map((r) => r.data));
  }

  patch<T, B = unknown>(path: string, body?: B): Observable<T> {
    return this.http.patch<ApiResult<T>>(this.url(path), body).pipe(map((r) => r.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResult<T>>(this.url(path)).pipe(map((r) => r.data));
  }

  private url(path: string): string {
    return `${this.base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private buildParams(input?: QueryParams): HttpParams | undefined {
    if (!input) return undefined;
    let p = new HttpParams();
    for (const [k, v] of Object.entries(input)) {
      if (v == null) continue;
      if (Array.isArray(v)) v.forEach((item) => (item != null) && (p = p.append(k, String(item))));
      else p = p.set(k, String(v));
    }
    return p;
  }
}
