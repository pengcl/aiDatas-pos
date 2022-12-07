import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class StorageService {
  type = environment.cacheType; // 存储类型，由环境变量决定；
  memory: any = {};
  keys = ['aliasList', 'remember', 'name', 'password', 'mac'];
  public localStorage: any;

  constructor() {
    if (!localStorage) {
      throw new Error('Current browser does not support Local Storage');
    }
    this.localStorage = localStorage;
  }

  public set(key: string, value): void {
    if (this.keys.indexOf(key) !== -1) {
      this.localStorage[key] = value;
    } else {
      this[this.type][key] = value;
    }
  }

  public get(key: string): string {
    let value = '';
    if (this.keys.indexOf(key) !== -1) {
      value = this.localStorage[key] || false;
    } else {
      value = this[this.type][key] || false;
    }
    return value;
  }

  public setObject(key: string, value: any): void {
    this[this.type][key] = JSON.stringify(value);
  }

  public getObject(key: string): any {
    return JSON.parse(this[this.type][key] || '{}');
  }

  public remove(key: string): any {
    if (this.type === 'memory') {
      delete this[this.type][key];
    } else {
      this.localStorage.removeItem(key);
    }
  }

  public clear() {
    if (this.type === 'memory') {
      this[this.type] = {};
    } else {
      const aliasList = this.get('aliasList');
      const remember = this.get('remember');
      const name = this.get('name');
      const password = this.get('password');
      const mac =  this.get('mac');
      this.localStorage.clear();
      this.set('aliasList', aliasList);
      this.set('remember', remember);
      this.set('mac', mac);
      if (remember === 'true') {
        this.set('name', name);
        this.set('password', password);
      }
    }
  }

}
