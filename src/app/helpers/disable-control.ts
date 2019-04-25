import { NgControl } from '@angular/forms';
import { Input, Directive } from '@angular/core';

@Directive({
  selector: '[appDisableControl]'
})
export class DisableControlDirective {
  @Input() set appDisableControl( condition: boolean ) {
    const action = condition ? 'disable' : 'enable';
    this.ngControl.control[action]();
  }

  constructor( private ngControl: NgControl ) {
  }
}
