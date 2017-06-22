export class LoginService {
  constructor() {}

  validateSession():boolean{
    if (this.getSession() == null || this.getSession().id == "") {
      return false;
    }else{
      return true;
    }
  }

  public getSession():any{
    return JSON.parse( window.localStorage.getItem('!us3r4pp#'));
  }

  public setSession(data:any):any{
    window.localStorage.setItem('!us3r4pp#', JSON.stringify(data));
  }

  public deleteSession():any{
    window.localStorage.removeItem('!us3r4pp#');
  }

}