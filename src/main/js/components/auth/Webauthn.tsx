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
  registerPath?: string;
  loginPath?: string;
  callbackPath?: string;
  csrf?: {
    header: string;
    value: string;
  };
}

export interface WebAuthnUser {
  username: string;
  name: string;
  displayName?: string;
  id?: string;
}

export class WebAuthn {
  registerPath: string;
  loginPath: string;
  callbackPath: string;
  csrf?: { header: string; value: string };

  constructor(options: WebAuthnOptions = {}) {
    this.registerPath = options.registerPath || "/webauthn/register";
    this.loginPath = options.loginPath || "/webauthn/login";
    this.callbackPath = options.callbackPath || "/webauthn/callback";
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
    if (!options.credentials) {
      options.credentials = 'include';
    }
    return fetch(path, options);
  }

  register(user: WebAuthnUser): Promise<Response> {
    if (!this.registerPath) {
      return Promise.reject('Register path missing from the initial configuration!');
    }
    if (!this.callbackPath) {
      return Promise.reject('Callback path missing from the initial configuration!');
    }
    return this.fetchWithCsrf(this.registerPath, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user || {})
    })
      .then(res => {
        if (res.status === 200) {
          return res;
        }
        throw new Error(res.statusText);
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
        return this.fetchWithCsrf(this.callbackPath, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: credential.id,
            rawId: bufferToBase64(credential.rawId),
            response: {
              attestationObject: bufferToBase64(credential.response.attestationObject),
              clientDataJSON: bufferToBase64(credential.response.clientDataJSON)
            },
            type: credential.type
          })
        });
      })
      .then(async res => {
        if (res.status >= 200 && res.status < 300) {
          return res;
        }
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
      });
  }

  login(user: WebAuthnUser): Promise<Response> {
    if (!this.loginPath) {
      return Promise.reject('Login path is missing!');
    }
    if (!this.callbackPath) {
      return Promise.reject('Callback path missing from the initial configuration!');
    }
    return this.fetchWithCsrf(this.loginPath, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(res => {
        if (res.status === 200) {
          return res;
        }
        throw new Error(res.statusText);
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
        return this.fetchWithCsrf(this.callbackPath, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: credential.id,
            rawId: bufferToBase64(credential.rawId),
            response: {
              clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
              authenticatorData: bufferToBase64(credential.response.authenticatorData),
              signature: bufferToBase64(credential.response.signature),
              userHandle: credential.response.userHandle
                ? bufferToBase64(credential.response.userHandle)
                : undefined
            },
            type: credential.type
          })
        });
      })
      .then(async res => {
        if (res.status >= 200 && res.status < 300) {
          return res;
        }
        const text = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
      });
  }
}
