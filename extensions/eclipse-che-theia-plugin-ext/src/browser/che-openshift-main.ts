/*********************************************************************
 * Copyright (c) 2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { CheOpenshiftMain } from '../common/che-protocol';
import { interfaces } from 'inversify';
import { OauthUtils } from './oauth-utils';

export class CheOpenshiftMainImpl implements CheOpenshiftMain {
    private token: string | undefined;
    private readonly oAuthUtils: OauthUtils;

    constructor(container: interfaces.Container) {
        this.oAuthUtils = new OauthUtils(container);
    }
    async $getToken(): Promise<string> {
        await this.fetchToken();
        if (this.token) {
            return this.token;
        } else {
            throw new Error('Failed to get GitHub authentication token');
        }
    }

    private async fetchToken(): Promise<void> {
        if (!this.token) {
            await this.updateToken();
        } else {
            try {
                await this.oAuthUtils.checkToken('https://api.github.com/user?access_token=' + this.token);
            } catch (e) {
                await this.updateToken();
            }
        }
    }

    private async updateToken(): Promise<void> {
        this.token = await this.oAuthUtils.getToken('openshift');
        if (!this.token) {
            await this.oAuthUtils.authenticate('openshift');
            this.token = await this.oAuthUtils.getToken('openshift');
        }
    }
}
