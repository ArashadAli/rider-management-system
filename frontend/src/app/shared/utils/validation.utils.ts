import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Sanitizes input event value by allowing only digits and limiting to a maximum length.
 * Extracted from Order Drawer to be reused across all numeric/mobile inputs.
 *
 * @param event DOM input event
 * @param control Optional Angular AbstractControl / FormControl to synchronize value
 * @param maxLength Maximum allowed digits (default: 10)
 * @returns Sanitized string containing only digits
 */
export function limitDigitsInput(
  event: Event,
  control?: AbstractControl | null,
  maxLength: number = 10
): string {
  const input = event.target as HTMLInputElement;
  if (!input) return '';
  const value = input.value.replace(/\D/g, '').slice(0, maxLength);
  input.value = value;
  if (control) {
    control.setValue(value);
  }
  return value;
}

/**
 * Restricts input to maximum 10 numeric digits for mobile number fields.
 *
 * @param event DOM input event
 * @param control Optional Angular AbstractControl / FormControl to synchronize value
 * @returns Sanitized 10-digit numeric string
 */
export function limitMobileNumber(
  event: Event,
  control?: AbstractControl | null
): string {
  return limitDigitsInput(event, control, 10);
}

/**
 * Finds the first invalid control in a FormGroup in definition order,
 * smoothly scrolls the container so that the invalid field is centered in view,
 * and sets focus directly on that input.
 *
 * @param form The Angular FormGroup
 * @param container Optional HTMLElement root to query within (defaults to document)
 */
export function scrollToFirstInvalidControl(
  form: FormGroup,
  container?: HTMLElement
): void {
  // Allow Angular change detection to reflect touched states and error messages in the DOM
  setTimeout(() => {
    for (const controlName of Object.keys(form.controls)) {
      const control = form.controls[controlName];
      if (control && control.invalid) {
        const root = container || document;
        const element = root.querySelector<HTMLElement>(
          `[formControlName="${controlName}"], #${controlName}, [name="${controlName}"]`
        );

        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });

          let targetToFocus: HTMLElement = element;
          if (!['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(element.tagName)) {
            const childInput = element.querySelector<HTMLElement>('input, select, textarea');
            if (childInput) {
              targetToFocus = childInput;
            }
          }

          targetToFocus.focus({ preventScroll: true });
          break;
        }
      }
    }
  }, 50);
}
