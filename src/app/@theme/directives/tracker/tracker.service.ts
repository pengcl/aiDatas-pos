import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class TrackerService {

  constructor(private http: HttpClient,
              private router: Router) {
  }

  post(body): Observable<any> {
    return this.http.post('/api/Track/TrackCreate', body);
  }
}
