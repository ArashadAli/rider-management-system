import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterModule
} from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface Breadcrumb {
    label: string;
    url: string;
}

@Component({
    selector: 'app-breadcrumb',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule
    ],
    templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit, OnDestroy {

    breadcrumbs: Breadcrumb[] = [];

    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {

        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this.destroy$)
            )
            .subscribe(() => {
                this.buildBreadcrumbs();
            });

        this.buildBreadcrumbs();
    }

    buildBreadcrumbs(): void {

        const breadcrumbs: Breadcrumb[] = [];

        let route = this.activatedRoute.root;
        let url = '';

        while (route.firstChild) {

            route = route.firstChild;

            const path = route.snapshot.url
                .map(segment => segment.path)
                .join('/');

            if (path) {
                url += `/${path}`;
            }

            const label = route.snapshot.data['breadcrumb'];

            if (label) {

                breadcrumbs.push({
                    label,
                    url
                });

            }

        }

        this.breadcrumbs = breadcrumbs;
    }

    ngOnDestroy(): void {

        this.destroy$.next();
        this.destroy$.complete();
    }
}