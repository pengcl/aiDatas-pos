import {Injectable} from '@angular/core';
import {RequestService} from '../../../../@core/utils/request.service';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class CinemasService {

  constructor(private requestSvc: RequestService) {
  }

  items(ProjectGID): Observable<any> {
    return this.requestSvc.send('/api/ProjectCommunity/ProjectCommunityDetail', {ProjectGID});
  }
}
