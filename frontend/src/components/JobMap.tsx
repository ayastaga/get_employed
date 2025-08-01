import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type {Geometry} from 'geojson';
import "./JobMap.css"

type HoverMapProps = {
  isSubmitted : boolean;
}

export default function HoverMap( {isSubmitted} : HoverMapProps ) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hoveredStateIdRef = useRef<number | string | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.486052, 37.830348],
      zoom: 3.2
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('states', {
        type: 'geojson',
        data: '/new.geojson'
      });

      map.addLayer({
        id: 'state-fills',
        type: 'fill',
        source: 'states',
        layout: {},
        paint: {
          'fill-color': '#627BC1',
          'fill-opacity': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            1,
            0.5
          ]
        }
      });

      map.addLayer({
        id: 'state-borders',
        type: 'line',
        source: 'states',
        layout: {},
        paint: {
          'line-color': '#627BC1',
          'line-width': 2
        }
      });

      map.on('mousemove', 'state-fills', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['state-fills']
        });

        if (features.length > 0) {
          const feature = features[0];
          const featureId = feature.id;

          if (hoveredStateIdRef.current !== null && featureId !== hoveredStateIdRef.current) {
            map.setFeatureState(
              { source: 'states', id: hoveredStateIdRef.current },
              { hover: false }
            );
          }

          hoveredStateIdRef.current = featureId as string | number;

          map.setFeatureState(
            { source: 'states', id: hoveredStateIdRef.current },
            { hover: true }
          );
        }
      });

      map.on('mouseleave', 'state-fills', () => {
        if (hoveredStateIdRef.current !== null) {
          map.setFeatureState(
            { source: 'states', id: hoveredStateIdRef.current },
            { hover: false }
          );
        }
        hoveredStateIdRef.current = null;
      });
    });


    // Popup on click
    map.on('click', 'state-fills', (e) => {
      if (!isSubmitted) return;
      const feature = e.features?.[0];
      if (!feature) return;

      const stateName = feature.properties?.STATE_NAME || 'Unknown';
      const description = JSON.parse(feature.properties?.description) || '';

      const coordinates = (feature.geometry as Geometry);

      let lng = 0, lat = 0;
      if (coordinates.type === 'Polygon') {
        [lng, lat] = coordinates.coordinates[0][0] as [number, number];
      } else if (coordinates.type === 'MultiPolygon') {
        [lng, lat] = coordinates.coordinates[0][0][0] as [number, number];
      }

      if (popupRef.current) popupRef.current.remove();
      popupRef.current = new mapboxgl.Popup()
        .setLngLat([lng, lat])
        .setHTML(`
          <div class="card-container">
            <h2 class="state-label">
              ${stateName}
            </h2>
            <p class="card-label">
              Job results
            </p>
            <ul class="card-list-container">
              ${description.map((job:object) => `
                <li class="card-list-item">
                  <a class="job-title" href=${job.job_link} target="_blank">${job.job_title}</a>
                  <p><a class="company-title" href=${job.company_link} target="_blank">${job.company_name}</a> | ${job.employment_type}</p>
                  <p class="posting-time">Posted: ${job.posting_time}</p>
                  <p class="last-updated">${job.created_at}</p>
                  <p class="applicant-count">
                    ${job.applicant_count ?? "N/A"} applicants
                  </p>
                </li>
              `).join('')}
            </ul>
          </div>
        `)

        .addTo(map);
    });
    
    return () => {
      map.remove();
    };
  }, [isSubmitted]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '90%', height: '60vh' }}
    />
  );
}
