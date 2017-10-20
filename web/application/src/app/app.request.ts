import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()

export class RequestService {
  constructor(private http: Http) {}

  public post(url:string, parameters:any) {
    //url = url.replace("https://enc.brm.co/","http://127.0.0.1/encuestas_brm/web/server/");
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let options = new RequestOptions({ headers: headers, method: "post" });
    return this.http.post(url, parameters, options)
                  .map(this.extractData)
                  .catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || { };
  }

  private handleError (error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Promise.reject(errMsg);
  }
}