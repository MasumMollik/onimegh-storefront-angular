import { Injectable } from '@angular/core';
import { NetworkStatus, WatchQueryFetchPolicy } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {HttpClient} from "@angular/common/http";


export class District {
    id: string;
    division_id: string;
    name: string;
    bn_name: string;
    lat: string;
    lon: string;
    url: string;
}

export class Upazilla {
    id: string;
    district_id: string;
    name: string;
    bn_name: string;
    url: string;
}
@Injectable({
    providedIn: 'root',
})
export class DataService {

    private readonly context =  {
        headers: {},
    };

    constructor(private apollo: Apollo,
                private http: HttpClient) { }

    query<T = any, V extends Record<string, any> = {}>(query: DocumentNode, variables?: V, fetchPolicy?: WatchQueryFetchPolicy): Observable<T> {
        return this.apollo.watchQuery<T, V>({
            query,
            variables,
            context: this.context,
            fetchPolicy: fetchPolicy || 'cache-first',
        }).valueChanges.pipe(
            filter(result => result.networkStatus === NetworkStatus.ready),
            map(response => response.data));
    }

    mutate<T = any, V = any>(mutation: DocumentNode, variables?: V): Observable<T> {
        return this.apollo.mutate<T, V>({
            mutation,
            variables,
            context: this.context,
        }).pipe(map(response => response.data as T));
    }

    public getDistricts(): Observable<District[]> {
        return this.http.get<District[]>("./assets/locations/district.json");
    }

    public getUnions(): Observable<any> {
        return this.http.get("./assets/locations/unions.json");
    }

    public getUpazillas(): Observable<Upazilla[]> {
        return this.http.get<Upazilla[]>("./assets/locations/upazilla.json");
    }
}
