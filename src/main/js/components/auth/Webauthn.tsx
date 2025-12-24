import React from 'react';

// Helper functions for Base64URL
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const lookup = new Uint8Array(256);
for (let i = 0; i < chars.length; i++) {
  lookup[chars.charCodeAt(i)] = i;
}

export const bufferToBase64 = (arraybuffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(arraybuffer);
  let i;
  let len = bytes.length;
  let base64url = '';

  for (i = 0; i < len; i += 3) {
    base64url += chars[bytes[i] >> 2];
    base64url += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
    base64url += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
    base64url += chars[bytes[i + 2] & 63];
  }

  if ((len % 3) === 2) {
    base64url = base64url.substring(0, base64url.length - 1);
  } else if (len % 3 === 1) {
    base64url = base64url.substring(0, base64url.length - 2);
  }

  return base64url;
};

export const base64ToBuffer = (base64string: string): ArrayBuffer => {
  if (base64string) {
    let bufferLength = base64string.length * 0.75;
    let len = base64string.length;
    let i;
    let p = 0;
    let encoded1, encoded2, encoded3, encoded4;

    const bytes = new Uint8Array(bufferLength);

    for (i = 0; i < len; i += 4) {
      encoded1 = lookup[base64string.charCodeAt(i)];
      encoded2 = lookup[base64string.charCodeAt(i + 1)];
      encoded3 = lookup[base64string.charCodeAt(i + 2)];
      encoded4 = lookup[base64string.charCodeAt(i + 3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }
    return bytes.buffer;
  }
  return new ArrayBuffer(0);
};

export interface WebAuthnOptions {
  registerOptionsChallengePath?: string;
  loginOptionsChallengePath?: string;
  registerPath?: string;
  loginPath?: string;
  csrf?: {
    header: string;
    value: string;
  };
}

export interface WebAuthnUser {
  username: string;
  displayName?: string;
  id?: string;
}

export class WebAuthn {
  registerOptionsChallengePath: string;
  loginOptionsChallengePath: string;
  registerPath: string;
  loginPath: string;
  csrf?: { header: string; value: string };

  constructor(options: WebAuthnOptions = {}) {
    this.registerOptionsChallengePath = options.registerOptionsChallengePath || "/q/webauthn/register-options-challenge";
    this.loginOptionsChallengePath = options.loginOptionsChallengePath || "/q/webauthn/login-options-challenge";
    this.registerPath = options.registerPath || "/q/webauthn/register";
    this.loginPath = options.loginPath || "/q/webauthn/login";
    this.csrf = options.csrf;
  }

  fetchWithCsrf(path: string, options: RequestInit): Promise<Response> {
    if (this.csrf) {
      if (!options.headers) {
        options.headers = {};
      }
      // @ts-ignore
      options.headers[this.csrf.header] = this.csrf.value;
    }
    return fetch(path, options);
  }

  registerClientSteps(user: WebAuthnUser): Promise<any> {
    if (!this.registerOptionsChallengePath) {
      return Promise.reject('Register challenge path missing form the initial configuration!');
    }
    const params = new URLSearchParams({ username: user.username });
    if (user.displayName) {
        params.append('displayName', user.displayName);
    }
    
    return this.fetchWithCsrf(this.registerOptionsChallengePath + "?" + params.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(res => {
        if (res.status === 200) {
          return res;
        }
        throw new Error(res.statusText, { cause: res });
      })
      .then(res => res.json())
      .then(res => {
        res.challenge = base64ToBuffer(res.challenge);
        res.user.id = base64ToBuffer(res.user.id);
        if (res.excludeCredentials) {
          for (let i = 0; i < res.excludeCredentials.length; i++) {
            res.excludeCredentials[i].id = base64ToBuffer(res.excludeCredentials[i].id);
          }
        }
        return res;
      })
      .then(res => navigator.credentials.create({ publicKey: res }))
      .then((credential: any) => {
        return {
          id: credential.id,
          rawId: bufferToBase64(credential.rawId),
          response: {
            attestationObject: bufferToBase64(credential.response.attestationObject),
            clientDataJSON: bufferToBase64(credential.response.clientDataJSON)
          },
          type: credential.type
        };
      });
  }

  register(user: WebAuthnUser): Promise<Response> {
    if (!this.registerPath) {
      throw new Error('Register path is missing!');
    }
    if (!user || !user.username) {
      return Promise.reject('User name (user.username) required');
    }
    return this.registerClientSteps(user)
      .then(body => {
        return this.fetchWithCsrf(this.registerPath + "?" + new URLSearchParams({ username: user.username }).toString(), {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        })
      })
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          return res;
        }
        throw new Error(res.statusText, { cause: res });
      });
  }

  loginClientSteps(user: WebAuthnUser): Promise<any> {
    if (!this.loginOptionsChallengePath) {
      return Promise.reject('Login challenge path missing from the initial configuration!');
    }
    let path = this.loginOptionsChallengePath;
    if (user != null && user.username != null) {
      path = path + "?" + new URLSearchParams({ username: user.username }).toString();
    }
    return this.fetchWithCsrf(path, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(res => {
        if (res.status === 200) {
          return res;
        }
        throw new Error(res.statusText, { cause: res });
      })
      .then(res => res.json())
      .then(res => {
        res.challenge = base64ToBuffer(res.challenge);
        if (res.allowCredentials) {
          for (let i = 0; i < res.allowCredentials.length; i++) {
            res.allowCredentials[i].id = base64ToBuffer(res.allowCredentials[i].id);
          }
        }
        return res;
      })
      .then(res => navigator.credentials.get({ publicKey: res }))
      .then((credential: any) => {
        return {
          id: credential.id,
          rawId: bufferToBase64(credential.rawId),
          response: {
            clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
            authenticatorData: bufferToBase64(credential.response.authenticatorData),
            signature: bufferToBase64(credential.response.signature),
            userHandle: credential.response.userHandle ? bufferToBase64(credential.response.userHandle) : undefined,
          },
          type: credential.type
        };
      });
  }

  login(user: WebAuthnUser): Promise<Response> {
    if (!this.loginPath) {
      throw new Error('Login path is missing!');
    }
    return this.loginClientSteps(user)
      .then(body => {
        return this.fetchWithCsrf(this.loginPath, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })
      })
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          return res;
        }
        throw new Error(res.statusText, { cause: res });
      });
  }
}
