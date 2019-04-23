import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class TwitchConfigService {
    private twitchConfig: any;

    constructor(private http: HttpClient) { }

    loadTwitchConfig() {
        return this.http.get('/assets/twitch.config.json')
            .toPromise()
            .then(data => {
                this.twitchConfig = data;
            });
    }

    getConfigValue(key: string) {
        if (!this.twitchConfig) {
            throw Error('Config file not loaded!');
        }

        return this.twitchConfig[key];
    }
}
