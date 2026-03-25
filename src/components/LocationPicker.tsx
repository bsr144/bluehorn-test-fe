import { useState, useCallback } from 'react';
import { MapPin, Crosshair, Loader2, X } from 'lucide-react';

interface LocationPickerProps {
  value: string;
  onChange: (address: string) => void;
}

interface DetectedLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<DetectedLocation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const handleDetect = useCallback(async () => {
    setDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setDetected({ latitude, longitude, address });
          onChange(address);
        } catch {
          // If reverse geocoding fails, use coordinates as fallback
          const fallback = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setDetected({ latitude, longitude, address: fallback });
          onChange(fallback);
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Please allow location access in your browser settings.',
          2: 'Location unavailable. Please try again or enter an address manually.',
          3: 'Location request timed out. Please try again.',
        };
        setError(messages[err.code] || 'Failed to get location');
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [onChange]);

  const clearDetected = () => {
    setDetected(null);
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Location
      </label>

      {/* Text input + detect button */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (detected) setDetected(null);
            }}
            placeholder="Enter address or use GPS"
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={handleDetect}
          disabled={detecting}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors cursor-pointer border border-primary-200 dark:border-primary-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          title="Detect my location"
        >
          {detecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{detecting ? 'Detecting...' : 'My Location'}</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Detected location preview */}
      {detected && (
        <div className="mt-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-2.5 animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Static map thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <img
                  src={`https://static-maps.yandex.ru/v1?ll=${detected.longitude},${detected.latitude}&z=15&size=128,128&l=map&pt=${detected.longitude},${detected.latitude},pm2rdm`}
                  alt="Map preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback: hide broken image and show icon instead
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>';
                    icon.className = 'text-gray-400';
                    target.parentElement!.appendChild(icon);
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary-700 dark:text-primary-300 mb-0.5">Detected Location</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 break-words leading-relaxed">{detected.address}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">
                  {detected.latitude.toFixed(5)}, {detected.longitude.toFixed(5)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearDetected}
              className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer border-0 bg-transparent flex-shrink-0"
              title="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
