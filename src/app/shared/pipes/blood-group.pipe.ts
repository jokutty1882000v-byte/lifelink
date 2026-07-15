import { Pipe, PipeTransform } from '@angular/core';
import { BloodGroup } from '@core/models/blood-group.enum';

@Pipe({ name: 'bloodGroup', standalone: true, pure: true })
export class BloodGroupPipe implements PipeTransform {
  transform(value: BloodGroup | string | null | undefined): string {
    return value ? String(value) : '—';
  }
}
