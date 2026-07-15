import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { environment } from '@env/environment';
import { GeoPoint } from '@core/models/geo.model';

export interface MapMarker {
  point: GeoPoint;
  title?: string;
  color?: string;
}

@Component({
  selector: 'll-map-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #host class="w-full rounded-2xl overflow-hidden" [style.height.px]="height"></div>`,
})
export class MapViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) private readonly host!: ElementRef<HTMLDivElement>;
  @Input() center: GeoPoint = { lat: environment.map.defaultCenter[0], lng: environment.map.defaultCenter[1] };
  @Input() zoom = environment.map.defaultZoom;
  @Input() height = 320;
  @Input() set markers(list: readonly MapMarker[]) { this._markers = list; this.renderMarkers(); }

  private map?: L.Map;
  private layer?: L.LayerGroup;
  private _markers: readonly MapMarker[] = [];

  ngAfterViewInit(): void {
    this.map = L.map(this.host.nativeElement).setView([this.center.lat, this.center.lng], this.zoom);
    L.tileLayer(environment.map.tileUrl, { attribution: environment.map.attribution }).addTo(this.map);
    this.layer = L.layerGroup().addTo(this.map);
    this.renderMarkers();
  }

  ngOnDestroy(): void { this.map?.remove(); }

  private renderMarkers(): void {
    if (!this.layer) return;
    this.layer.clearLayers();
    for (const m of this._markers) {
      L.marker([m.point.lat, m.point.lng], { title: m.title }).addTo(this.layer);
    }
  }
}
