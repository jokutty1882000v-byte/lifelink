import { Pipe, PipeTransform } from '@angular/core';
import { timeAgo } from '@core/utils/date.util';

@Pipe({ name: 'timeAgo', standalone: true, pure: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    const iso = typeof value === 'string' ? value : value.toISOString();
    return timeAgo(iso);
  }
}
