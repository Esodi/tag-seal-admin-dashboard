"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { Compass, Expand, LocateFixed, MapPin, Minus, Plus, RotateCcw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
// Default center: Tanzania (-6.3690, 34.8888)
const DEFAULT_CENTER = { lat: -6.369, lng: 34.8888 };
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 14;

export type Coordinates = { lat: number; lng: number };

type Props = {
  prefix: string;
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  label?: string;
  hint?: string;
  className?: string;
  onChange?: (coords: { latitude: number | null; longitude: number | null }) => void;
};

function clampLat(lat: number) {
  return Math.max(-85.0511, Math.min(85.0511, lat));
}

function normalizeLng(lng: number) {
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

function clampZoom(z: number) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
}

function lngToWorldX(lng: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return ((lng + 180) / 360) * scale;
}

function latToWorldY(lat: number, zoom: number) {
  const clamped = clampLat(lat);
  const sin = Math.sin((clamped * Math.PI) / 180);
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
}

function worldXToLng(x: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  return normalizeLng((x / scale) * 360 - 180);
}

function worldYToLat(y: number, zoom: number) {
  const scale = TILE_SIZE * Math.pow(2, zoom);
  const n = Math.PI - (2 * Math.PI * y) / scale;
  return clampLat((180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

function roundCoord(value: number) {
  return Number(value.toFixed(6));
}

function parseInitial(lat?: number | null, lng?: number | null): Coordinates | null {
  if (lat == null || lng == null) return null;
  const nLat = Number(lat);
  const nLng = Number(lng);
  if (!Number.isFinite(nLat) || !Number.isFinite(nLng)) return null;
  return { lat: roundCoord(nLat), lng: roundCoord(nLng) };
}

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

function InteractiveSlippyMap({
  center,
  zoom,
  marker,
  heightClass = "h-64",
  onViewChange,
  onSelectPoint,
}: {
  center: Coordinates;
  zoom: number;
  marker: Coordinates | null;
  heightClass?: string;
  onViewChange: (center: Coordinates, zoom: number) => void;
  onSelectPoint: (point: Coordinates) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 600, height: 320 });
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startWorldX: number;
    startWorldY: number;
    moved: boolean;
  } | null>(null);
  const pinchRef = useRef<{
    initialDistance: number;
    initialZoom: number;
    midX: number;
    midY: number;
    anchorLat: number;
    anchorLng: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const tileZoom = Math.floor(clampZoom(zoom));
  const zoomScale = Math.pow(2, zoom - tileZoom);
  const numTiles = 1 << tileZoom;

  const centerWorldX = lngToWorldX(center.lng, tileZoom);
  const centerWorldY = latToWorldY(center.lat, tileZoom);

  const halfW = size.width / (2 * zoomScale);
  const halfH = size.height / (2 * zoomScale);

  const minTileX = Math.floor((centerWorldX - halfW) / TILE_SIZE) - 1;
  const maxTileX = Math.floor((centerWorldX + halfW) / TILE_SIZE) + 1;
  const minTileY = Math.max(0, Math.floor((centerWorldY - halfH) / TILE_SIZE) - 1);
  const maxTileY = Math.min(numTiles - 1, Math.floor((centerWorldY + halfH) / TILE_SIZE) + 1);

  const tiles: { key: string; url: string; left: number; top: number }[] = [];
  for (let tx = minTileX; tx <= maxTileX; tx++) {
    const wrappedX = ((tx % numTiles) + numTiles) % numTiles;
    for (let ty = minTileY; ty <= maxTileY; ty++) {
      const left = size.width / 2 + (tx * TILE_SIZE - centerWorldX) * zoomScale;
      const top = size.height / 2 + (ty * TILE_SIZE - centerWorldY) * zoomScale;
      tiles.push({
        key: `${tileZoom}-${tx}-${ty}`,
        url: `https://tile.openstreetmap.org/${tileZoom}/${wrappedX}/${ty}.png`,
        left,
        top,
      });
    }
  }

  function clientToCoords(clientX: number, clientY: number, atZoom = zoom, atCenter = center): Coordinates {
    const rect = containerRef.current?.getBoundingClientRect();
    const offsetX = rect ? clientX - rect.left - rect.width / 2 : 0;
    const offsetY = rect ? clientY - rect.top - rect.height / 2 : 0;
    const wx = lngToWorldX(atCenter.lng, atZoom) + offsetX;
    const wy = latToWorldY(atCenter.lat, atZoom) + offsetY;
    return {
      lat: roundCoord(worldYToLat(wy, atZoom)),
      lng: roundCoord(worldXToLng(wx, atZoom)),
    };
  }

  function zoomAroundPoint(nextZoomRaw: number, clientX: number, clientY: number) {
    const nextZoom = clampZoom(nextZoomRaw);
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      onViewChange(center, nextZoom);
      return;
    }
    const offsetX = clientX - rect.left - rect.width / 2;
    const offsetY = clientY - rect.top - rect.height / 2;
    const anchor = clientToCoords(clientX, clientY, zoom, center);
    const nextCenterWorldX = lngToWorldX(anchor.lng, nextZoom) - offsetX;
    const nextCenterWorldY = latToWorldY(anchor.lat, nextZoom) - offsetY;
    onViewChange(
      {
        lat: worldYToLat(nextCenterWorldY, nextZoom),
        lng: worldXToLng(nextCenterWorldX, nextZoom),
      },
      nextZoom,
    );
  }

  function handleMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startWorldX: lngToWorldX(center.lng, zoom),
      startWorldY: latToWorldY(center.lat, zoom),
      moved: false,
    };
  }

  function handleMouseMove(event: ReactMouseEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    onViewChange(
      {
        lat: worldYToLat(drag.startWorldY - dy, zoom),
        lng: worldXToLng(drag.startWorldX - dx, zoom),
      },
      zoom,
    );
  }

  function handleMouseUp(event: ReactMouseEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (!drag.moved) {
      onSelectPoint(clientToCoords(event.clientX, event.clientY));
    }
  }

  function handleDoubleClick(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault();
    zoomAroundPoint(Math.round(zoom + 1), event.clientX, event.clientY);
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = -event.deltaY * 0.0025;
    zoomAroundPoint(zoom + delta, event.clientX, event.clientY);
  }

  function handleTouchStart(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length === 1) {
      const t = event.touches[0];
      pinchRef.current = null;
      dragRef.current = {
        startX: t.clientX,
        startY: t.clientY,
        startWorldX: lngToWorldX(center.lng, zoom),
        startWorldY: latToWorldY(center.lat, zoom),
        moved: false,
      };
    } else if (event.touches.length === 2) {
      dragRef.current = null;
      const [t1, t2] = [event.touches[0], event.touches[1]];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      const anchor = clientToCoords(midX, midY, zoom, center);
      pinchRef.current = {
        initialDistance: Math.max(10, dist),
        initialZoom: zoom,
        midX,
        midY,
        anchorLat: anchor.lat,
        anchorLng: anchor.lng,
      };
    }
  }

  function handleTouchMove(event: ReactTouchEvent<HTMLDivElement>) {
    if (event.touches.length === 1 && dragRef.current) {
      const t = event.touches[0];
      const drag = dragRef.current;
      const dx = t.clientX - drag.startX;
      const dy = t.clientY - drag.startY;
      if (Math.hypot(dx, dy) > 5) drag.moved = true;
      if (!drag.moved) return;
      onViewChange(
        {
          lat: worldYToLat(drag.startWorldY - dy, zoom),
          lng: worldXToLng(drag.startWorldX - dx, zoom),
        },
        zoom,
      );
    } else if (event.touches.length === 2 && pinchRef.current) {
      const [t1, t2] = [event.touches[0], event.touches[1]];
      const dist = Math.max(10, Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY));
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;
      const pinch = pinchRef.current;
      const scaleRatio = dist / pinch.initialDistance;
      const nextZoom = clampZoom(pinch.initialZoom + Math.log2(scaleRatio));
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const offsetX = midX - rect.left - rect.width / 2;
      const offsetY = midY - rect.top - rect.height / 2;
      const nextCenterWorldX = lngToWorldX(pinch.anchorLng, nextZoom) - offsetX;
      const nextCenterWorldY = latToWorldY(pinch.anchorLat, nextZoom) - offsetY;
      onViewChange(
        {
          lat: worldYToLat(nextCenterWorldY, nextZoom),
          lng: worldXToLng(nextCenterWorldX, nextZoom),
        },
        nextZoom,
      );
    }
  }

  function handleTouchEnd(event: ReactTouchEvent<HTMLDivElement>) {
    if (pinchRef.current && event.touches.length < 2) {
      pinchRef.current = null;
      return;
    }
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved && event.changedTouches.length === 1) {
      const t = event.changedTouches[0];
      onSelectPoint(clientToCoords(t.clientX, t.clientY));
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const panStep = 48;
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onViewChange({ lat: worldYToLat(latToWorldY(center.lat, zoom) - panStep, zoom), lng: center.lng }, zoom);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      onViewChange({ lat: worldYToLat(latToWorldY(center.lat, zoom) + panStep, zoom), lng: center.lng }, zoom);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      onViewChange({ lat: center.lat, lng: worldXToLng(lngToWorldX(center.lng, zoom) - panStep, zoom) }, zoom);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onViewChange({ lat: center.lat, lng: worldXToLng(lngToWorldX(center.lng, zoom) + panStep, zoom) }, zoom);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      onViewChange(center, clampZoom(Math.round(zoom + 1)));
    } else if (event.key === "-") {
      event.preventDefault();
      onViewChange(center, clampZoom(Math.round(zoom - 1)));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectPoint({ lat: roundCoord(center.lat), lng: roundCoord(center.lng) });
    }
  }

  const markerScreen = marker
    ? {
        x: size.width / 2 + (lngToWorldX(marker.lng, zoom) - lngToWorldX(center.lng, zoom)),
        y: size.height / 2 + (latToWorldY(marker.lat, zoom) - latToWorldY(center.lat, zoom)),
      }
    : null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label="Interactive map. Click or tap to place the marker, drag to pan, scroll or pinch to zoom, or press Enter to drop the marker at the center."
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        dragRef.current = null;
      }}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      className={`relative w-full ${heightClass} cursor-grab select-none overflow-hidden rounded-xl border bg-muted/40 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing`}
      style={{ touchAction: "none" }}
    >
      {tiles.map((tile) => (
        <img
          key={tile.key}
          src={tile.url}
          alt=""
          draggable={false}
          className="pointer-events-none absolute max-w-none select-none"
          style={{
            left: `${tile.left}px`,
            top: `${tile.top}px`,
            width: `${TILE_SIZE * zoomScale}px`,
            height: `${TILE_SIZE * zoomScale}px`,
          }}
        />
      ))}

      {/* Subtle center crosshair to assist keyboard / precision placement */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="size-3 rounded-full border border-primary/50 bg-background/60" />
      </div>

      {/* Selected pin marker */}
      {markerScreen &&
        markerScreen.x >= -32 &&
        markerScreen.x <= size.width + 32 &&
        markerScreen.y >= -32 &&
        markerScreen.y <= size.height + 32 && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full transition-transform duration-75"
            style={{ left: `${markerScreen.x}px`, top: `${markerScreen.y}px` }}
          >
            <div className="flex flex-col items-center">
              <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-lg">
                <MapPin className="size-4" />
              </div>
              <div className="size-2 -mt-1 rotate-45 bg-primary" />
            </div>
          </div>
        )}

      {/* Map zoom & locate controls */}
      <div
        className="absolute right-2.5 top-2.5 flex flex-col gap-1 rounded-lg border bg-background/95 p-1 shadow-sm backdrop-blur-sm"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Zoom in (+)"
          aria-label="Zoom in"
          onClick={() => onViewChange(center, clampZoom(Math.round(zoom + 1)))}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Zoom out (-)"
          aria-label="Zoom out"
          onClick={() => onViewChange(center, clampZoom(Math.round(zoom - 1)))}
        >
          <Minus className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title="Reset map view"
          aria-label="Reset map view"
          onClick={() =>
            onViewChange(
              marker ?? DEFAULT_CENTER,
              marker ? SELECTED_ZOOM : DEFAULT_ZOOM,
            )
          }
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>

      {/* Bottom status pill */}
      <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="rounded-md border bg-background/90 px-2 py-0.5 font-medium text-foreground shadow-xs backdrop-blur-xs">
          {marker
            ? `Selected: ${marker.lat.toFixed(5)}, ${marker.lng.toFixed(5)}`
            : "Click or tap anywhere on the map to select a point"}
        </span>
        <span className="rounded-md border bg-background/85 px-1.5 py-0.5 text-muted-foreground backdrop-blur-xs">
          Zoom {zoom.toFixed(1)}x · © OpenStreetMap
        </span>
      </div>
    </div>
  );
}

/**
 * Interactive Map Location picker with click-to-pin, drag pan, wheel zoom,
 * two-finger pinch zoom, place search, and modal map selector on Enter/click.
 */
export function MapLocationPicker({
  prefix,
  defaultLatitude,
  defaultLongitude,
  label = "Map location (GPS coordinates)",
  hint = "Click the map or press Enter on the location field to pick the market point. Drag to pan, scroll or pinch to zoom.",
  className = "sm:col-span-2",
  onChange,
}: Props) {
  const initial = parseInitial(defaultLatitude, defaultLongitude);
  const [selected, setSelected] = useState<Coordinates | null>(initial);
  const [center, setCenter] = useState<Coordinates>(initial ?? DEFAULT_CENTER);
  const [zoom, setZoom] = useState<number>(initial ? SELECTED_ZOOM : DEFAULT_ZOOM);
  const [latInput, setLatInput] = useState(initial ? String(initial.lat) : "");
  const [lngInput, setLngInput] = useState(initial ? String(initial.lng) : "");
  const [coordError, setCoordError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [locating, setLocating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  function applyCoordinates(point: Coordinates | null, recenter = true) {
    setSelected(point);
    setCoordError(null);
    if (point) {
      setLatInput(String(point.lat));
      setLngInput(String(point.lng));
      if (recenter) {
        setCenter(point);
        setZoom((z) => Math.max(z, 13));
      }
      onChange?.({ latitude: point.lat, longitude: point.lng });
    } else {
      setLatInput("");
      setLngInput("");
      onChange?.({ latitude: null, longitude: null });
    }
  }

  function syncManualInputs(nextLatRaw: string, nextLngRaw: string, flyTo = false) {
    setLatInput(nextLatRaw);
    setLngInput(nextLngRaw);
    const trimmedLat = nextLatRaw.trim();
    const trimmedLng = nextLngRaw.trim();
    if (!trimmedLat && !trimmedLng) {
      setSelected(null);
      setCoordError(null);
      onChange?.({ latitude: null, longitude: null });
      return;
    }
    const parsedLat = Number(trimmedLat);
    const parsedLng = Number(trimmedLng);
    if (
      !trimmedLat ||
      !trimmedLng ||
      !Number.isFinite(parsedLat) ||
      !Number.isFinite(parsedLng) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLng < -180 ||
      parsedLng > 180
    ) {
      setCoordError("Enter valid latitude (-90 to 90) and longitude (-180 to 180).");
      return;
    }
    const point = { lat: roundCoord(parsedLat), lng: roundCoord(parsedLng) };
    setCoordError(null);
    setSelected(point);
    if (flyTo) {
      setCenter(point);
      setZoom((z) => Math.max(z, SELECTED_ZOOM));
    }
    onChange?.({ latitude: point.lat, longitude: point.lng });
  }

  function useCurrentDeviceLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setCoordError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const point = {
          lat: roundCoord(pos.coords.latitude),
          lng: roundCoord(pos.coords.longitude),
        };
        applyCoordinates(point, true);
        setZoom(15);
      },
      () => {
        setLocating(false);
        setCoordError("Could not read your current location. Select the point directly on the map.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function runPlaceSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
        { headers: { Accept: "application/json" } },
      );
      if (response.ok) {
        const data = (await response.json()) as SearchResult[];
        setSearchResults(data);
        if (data.length > 0) {
          const first = data[0];
          const point = { lat: roundCoord(Number(first.lat)), lng: roundCoord(Number(first.lon)) };
          applyCoordinates(point, true);
          setZoom(14);
        }
      }
    } catch {
      // Ignore network errors if offline; manual map & coordinate inputs still work
    } finally {
      setSearching(false);
    }
  }

  const summaryValue = selected
    ? `${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`
    : "";

  return (
    <Field className={className}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FieldLabel htmlFor={`${prefix}-map-location`}>{label}</FieldLabel>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={useCurrentDeviceLocation}
            disabled={locating}
          >
            <LocateFixed className="size-3.5" />
            {locating ? "Locating…" : "Use my location"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => setDialogOpen(true)}
          >
            <Expand className="size-3.5" />
            Open map picker
          </Button>
          {selected && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => applyCoordinates(null, false)}
            >
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Hidden form inputs so FormData(form) receives latitude and longitude */}
      <input type="hidden" name="latitude" value={selected ? String(selected.lat) : ""} />
      <input type="hidden" name="longitude" value={selected ? String(selected.lng) : ""} />

      {/* MapLocation input: pressing Enter or clicking opens the interactive map modal */}
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
        <Input
          id={`${prefix}-map-location`}
          readOnly
          value={summaryValue}
          placeholder="Press Enter or click to select the market point on the map…"
          className="cursor-pointer pl-9 pr-28 font-mono text-xs"
          onClick={() => setDialogOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setDialogOpen(true);
            }
          }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Enter ↵
        </span>
      </div>

      {/* Inline interactive map preview with pan, wheel zoom, pinch zoom, and click-to-select */}
      <InteractiveSlippyMap
        center={center}
        zoom={zoom}
        marker={selected}
        heightClass="h-56"
        onViewChange={(nextCenter, nextZoom) => {
          setCenter(nextCenter);
          setZoom(nextZoom);
        }}
        onSelectPoint={(point) => applyCoordinates(point, false)}
      />

      {/* Synchronized Latitude / Longitude inputs for fine adjustments */}
      <div className="grid grid-cols-1 gap-2.5 pt-1 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor={`${prefix}-latitude`}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <Compass className="size-3.5" />
            Latitude (-90 to 90)
          </label>
          <Input
            id={`${prefix}-latitude`}
            type="number"
            step="any"
            min={-90}
            max={90}
            placeholder="-6.823500"
            value={latInput}
            onChange={(e) => syncManualInputs(e.target.value, lngInput, false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                syncManualInputs(latInput, lngInput, true);
              }
            }}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`${prefix}-longitude`}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <Compass className="size-3.5" />
            Longitude (-180 to 180)
          </label>
          <Input
            id={`${prefix}-longitude`}
            type="number"
            step="any"
            min={-180}
            max={180}
            placeholder="39.269500"
            value={lngInput}
            onChange={(e) => syncManualInputs(latInput, e.target.value, false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                syncManualInputs(latInput, lngInput, true);
              }
            }}
          />
        </div>
      </div>

      {coordError ? <FieldError>{coordError}</FieldError> : hint ? <FieldDescription>{hint}</FieldDescription> : null}

      {/* Expanded Map Location Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Map Location</DialogTitle>
            <DialogDescription>
              Search a place or click/tap directly on the map to drop the pin. Drag to pan, scroll wheel or pinch with two fingers to zoom.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search town, district, or market (e.g. Pugu, Dodoma, Arusha) and press Enter…"
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void runPlaceSearch();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => void runPlaceSearch()}
                disabled={searching}
              >
                {searching ? "Searching…" : "Find"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={useCurrentDeviceLocation}
                disabled={locating}
              >
                <LocateFixed className="size-4" />
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.lat}-${item.lon}-${idx}`}
                    type="button"
                    onClick={() => {
                      const point = {
                        lat: roundCoord(Number(item.lat)),
                        lng: roundCoord(Number(item.lon)),
                      };
                      applyCoordinates(point, true);
                      setZoom(15);
                    }}
                    className="max-w-xs truncate rounded-full border bg-muted/60 px-2.5 py-1 text-xs text-foreground transition hover:border-primary hover:bg-primary/10"
                  >
                    {item.display_name}
                  </button>
                ))}
              </div>
            )}

            <InteractiveSlippyMap
              center={center}
              zoom={zoom}
              marker={selected}
              heightClass="h-96"
              onViewChange={(nextCenter, nextZoom) => {
                setCenter(nextCenter);
                setZoom(nextZoom);
              }}
              onSelectPoint={(point) => applyCoordinates(point, false)}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {selected
                  ? `Pinned coordinates: ${selected.lat.toFixed(6)}, ${selected.lng.toFixed(6)}`
                  : "No point selected yet — click or tap on the map to drop a pin."}
              </span>
              <div className="flex items-center gap-2">
                <span>Zoom</span>
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.5}
                  value={zoom}
                  aria-label="Map zoom level"
                  onChange={(e) => setZoom(clampZoom(Number(e.target.value)))}
                  className="w-28 accent-primary"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field>
  );
}
