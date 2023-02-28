import { apiBaseUrl, NextAuthClientConfig } from 'next-auth/client/_utils';
import { RedirectableProviderType, BuiltInProviderType } from 'next-auth/providers';
import {
  LiteralUnion,
  SignInOptions,
  SignInAuthorizationParams,
  SignInResponse,
  getProviders,
  getCsrfToken,
} from 'next-auth/react';

interface InternalUrl {
  /** @default "http://localhost:3000" */
  origin: string;
  /** @default "localhost:3000" */
  host: string;
  /** @default "/api/auth" */
  path: string;
  /** @default "http://localhost:3000/api/auth" */
  base: string;
  /** @default "http://localhost:3000/api/auth" */
  toString: () => string;
}

function parseUrl(url?: string): InternalUrl {
  const defaultUrl = new URL('http://localhost:3000/api/auth');

  if (url && !url.startsWith('http')) {
    url = `https://${url}`;
  }

  const _url = new URL(url ?? defaultUrl);
  const path = (_url.pathname === '/' ? defaultUrl.pathname : _url.pathname)
    // Remove trailing slash
    .replace(/\/$/, '');

  const base = `${_url.origin}${path}`;

  return {
    origin: _url.origin,
    host: _url.host,
    path,
    base,
    toString: () => base,
  };
}

const __NEXTAUTH: NextAuthClientConfig = {
  baseUrl: parseUrl(process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL!).origin,
  basePath: parseUrl(process.env.NEXTAUTH_URL!).path,
  baseUrlServer: parseUrl(process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL!)
    .origin,
  basePathServer: parseUrl(process.env.NEXTAUTH_URL_INTERNAL ?? process.env.NEXTAUTH_URL!).path,
  _lastSync: 0,
  _session: undefined,
  _getSession: () => {},
};

export async function signUp<P extends RedirectableProviderType | undefined = undefined>(
  provider?: LiteralUnion<P extends RedirectableProviderType ? P | BuiltInProviderType : BuiltInProviderType>,
  options?: SignInOptions,
  authorizationParams?: SignInAuthorizationParams
): Promise<P extends RedirectableProviderType ? SignInResponse | undefined : undefined> {
  const { callbackUrl = window.location.href, redirect = true } = options ?? {};

  const baseUrl = apiBaseUrl(__NEXTAUTH);
  const providers = await getProviders();

  if (!providers) {
    window.location.href = `${baseUrl}/error`;
    return;
  }

  if (!provider || !(provider in providers)) {
    window.location.href = `${baseUrl}/signup?${new URLSearchParams({
      callbackUrl,
    })}`;
    return;
  }

  const isCredentials = providers[provider].type === 'credentials';
  const isEmail = providers[provider].type === 'email';
  const isSupportingReturn = isCredentials || isEmail;

  const signUpUrl = `${baseUrl}/${isCredentials ? 'callback' : 'signup'}/${provider}`;

  const _signUpUrl = `${signUpUrl}?${new URLSearchParams(authorizationParams)}`;

  const res = await fetch(_signUpUrl, {
    method: 'post',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    // @ts-expect-error
    body: new URLSearchParams({
      ...options,
      csrfToken: await getCsrfToken(),
      callbackUrl,
      json: true,
    }),
  });

  const data = await res.json();

  // TODO: Do not redirect for Credentials and Email providers by default in next major
  if (redirect || !isSupportingReturn) {
    const url = data.url ?? callbackUrl;
    window.location.href = url;
    // If url contains a hash, the browser does not reload the page. We reload manually
    if (url.includes('#')) window.location.reload();
    return;
  }

  const error = new URL(data.url).searchParams.get('error');

  if (res.ok) {
    await __NEXTAUTH._getSession({ event: 'storage' });
  }

  return {
    error,
    status: res.status,
    ok: res.ok,
    url: error ? null : data.url,
  } as any;
}
