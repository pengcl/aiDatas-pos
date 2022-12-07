import {Directive, HostListener, Input} from '@angular/core';
import {AuthService} from '../../../pages/auth/auth.service';
import {TrackerService} from './tracker.service';
import {DatePipe} from '@angular/common';

@Directive({
  selector: '[appTracker]',
  providers: [DatePipe]
})

export class TrackerDirective {
  user = this.authSvc.currentUser;
  @Input() appTracker;

  @HostListener('click', ['$event'])
  click(e) {
    console.log(e);
  }

  constructor(private datePipe: DatePipe, private authSvc: AuthService, private trackerSvc: TrackerService) {
  }
}
