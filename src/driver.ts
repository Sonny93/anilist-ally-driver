/*
|--------------------------------------------------------------------------
| Ally Oauth driver
|--------------------------------------------------------------------------
|
| Make sure you through the code and comments properly and make necessary
| changes as per the requirements of your implementation.
|
*/

/**
|--------------------------------------------------------------------------
 *  Search keyword "YourDriver" and replace it with a meaningful name
|--------------------------------------------------------------------------
 */

import { Oauth2Driver, RedirectRequest } from '@adonisjs/ally'
import type { AllyDriverContract, AllyUserContract, ApiRequestContract } from '@adonisjs/ally/types'
import type { HttpContext } from '@adonisjs/core/http'

/**
 *
 * Access token returned by your driver implementation. An access
 * token must have "token" and "type" properties and you may
 * define additional properties (if needed)
 */
export type AniListDriverAccessToken = {
  token: string
  type: 'bearer'
}

/**
 * Scopes accepted by the driver implementation.
 */
export type AniListDriverScopes = string

/**
 * The configuration accepted by the driver implementation.
 */
export type AniListDriverConfig = {
  clientId: string
  clientSecret: string
  callbackUrl: string
  authorizeUrl?: string
  accessTokenUrl?: string
  userInfoUrl?: string
}

/**
 * Driver implementation. It is mostly configuration driven except the API call
 * to get user info.
 */
export class AniListDriver
  extends Oauth2Driver<AniListDriverAccessToken, AniListDriverScopes>
  implements AllyDriverContract<AniListDriverAccessToken, AniListDriverScopes>
{
  /**
   * The URL for the redirect request. The user will be redirected on this page
   * to authorize the request.
   *
   * Do not define query strings in this URL.
   */
  protected authorizeUrl = 'https://anilist.co/api/v2/oauth/authorize'

  /**
   * The URL to hit to exchange the authorization code for the access token
   *
   * Do not define query strings in this URL.
   */
  protected accessTokenUrl = 'https://anilist.co/api/v2/oauth/token'

  /**
   * The URL to hit to get the user details
   *
   * Do not define query strings in this URL.
   */
  protected userInfoUrl = 'https://graphql.anilist.co'

  /**
   * The param name for the authorization code. Read the documentation of your oauth
   * provider and update the param name to match the query string field name in
   * which the oauth provider sends the authorization_code post redirect.
   */
  protected codeParamName = 'code'

  /**
   * The param name for the error. Read the documentation of your oauth provider and update
   * the param name to match the query string field name in which the oauth provider sends
   * the error post redirect
   */
  protected errorParamName = 'error'

  /**
   * Cookie name for storing the CSRF token. Make sure it is always unique. So a better
   * approach is to prefix the oauth provider name to `oauth_state` value. For example:
   * For example: "facebook_oauth_state"
   */
  protected stateCookieName = 'AniListDriver_oauth_state'

  /**
   * Parameter name to be used for sending and receiving the state from.
   * Read the documentation of your oauth provider and update the param
   * name to match the query string used by the provider for exchanging
   * the state.
   */
  protected stateParamName = 'state'

  /**
   * Parameter name for sending the scopes to the oauth provider.
   */
  protected scopeParamName = 'scope'

  /**
   * The separator indentifier for defining multiple scopes
   */
  protected scopesSeparator = ' '

  constructor(
    ctx: HttpContext,
    public config: AniListDriverConfig
  ) {
    super(ctx, config)

    /**
     * Extremely important to call the following method to clear the
     * state set by the redirect request.
     *
     * DO NOT REMOVE THE FOLLOWING LINE
     */
    this.loadState()
  }

  /**
   * Optionally configure the authorization redirect request. The actual request
   * is made by the base implementation of "Oauth2" driver and this is a
   * hook to pre-configure the request.
   */
  protected configureRedirectRequest(request: RedirectRequest<AniListDriverScopes>) {
    request.param('response_type', 'code')
  }

  /**
   * Optionally configure the access token request. The actual request is made by
   * the base implementation of "Oauth2" driver and this is a hook to pre-configure
   * the request
   */
  // protected configureAccessTokenRequest(request: ApiRequest) {}

  /**
   * Update the implementation to tell if the error received during redirect
   * means "ACCESS DENIED".
   */
  accessDenied() {
    return this.ctx.request.input('error') === 'user_denied'
  }

  async getCurrentUser(accessToken: string) {
    const query = `
      query {
        Viewer {
          id
          name
          avatar {
            medium
          }
          bannerImage
          about
          siteUrl
        }
      }
    `
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
    const response = await fetch(this.userInfoUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    })
    const data = (await response.json()) as {
      data: {
        Viewer: {
          id: string
          name: string
          avatar: {
            medium: string
          }
        }
      }
    }
    return data.data.Viewer
  }

  /**
   * Get the user details by query the provider API. This method must return
   * the access token and the user details both. Checkout the google
   * implementation for same.
   *
   * https://github.com/adonisjs/ally/blob/develop/src/Drivers/Google/index.ts#L191-L199
   */
  async user(
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<AniListDriverAccessToken>> {
    const accessToken = await this.accessToken()
    const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl)

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if needed)
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    const user = await this.getCurrentUser(accessToken.token)
    return {
      id: user.id,
      name: user.name,
      nickName: user.name,
      avatarUrl: user.avatar?.medium,
      email: null,
      token: accessToken,
      emailVerificationState: 'unverified',
      original: user,
    }
  }

  async userFromToken(
    accessToken: string,
    callback?: (request: ApiRequestContract) => void
  ): Promise<AllyUserContract<{ token: string; type: 'bearer' }>> {
    const request = this.httpClient(this.config.userInfoUrl || this.userInfoUrl)

    /**
     * Allow end user to configure the request. This should be called after your custom
     * configuration, so that the user can override them (if needed)
     */
    if (typeof callback === 'function') {
      callback(request)
    }

    const user = await this.getCurrentUser(accessToken)
    return {
      id: user.id,
      name: user.name,
      nickName: user.name,
      avatarUrl: user.avatar?.medium,
      email: null,
      emailVerificationState: 'unverified',
      token: {
        token: accessToken,
        type: 'bearer',
      },
      original: user,
    }
  }
}

/**
 * The factory function to reference the driver implementation
 * inside the "config/ally.ts" file.
 */
export function AniListDriverService(
  config: AniListDriverConfig
): (ctx: HttpContext) => AniListDriver {
  return (ctx) => new AniListDriver(ctx, config)
}
