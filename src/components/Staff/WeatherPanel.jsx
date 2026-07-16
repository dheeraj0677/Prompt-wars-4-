// Weather & Environment Panel
import { WEATHER_DATA } from '../../data/socialData';

export default function WeatherPanel() {
  const w = WEATHER_DATA;
  return (
    <div className="weather-panel">
      <div className="section-header">
        <span className="section-title">🌤️ Environment</span>
      </div>
      <div className="weather-main">
        <div className="weather-icon-big">{w.icon}</div>
        <div className="weather-temp">{w.temperature}°C</div>
        <div className="weather-condition">{w.condition}</div>
        <div className="weather-feels">Feels like {w.feelsLike}°C</div>
      </div>
      <div className="weather-grid">
        <div className="weather-stat"><span className="weather-stat-icon">💧</span><span className="weather-stat-value">{w.humidity}%</span><span className="weather-stat-label">Humidity</span></div>
        <div className="weather-stat"><span className="weather-stat-icon">💨</span><span className="weather-stat-value">{w.windSpeed} km/h</span><span className="weather-stat-label">Wind {w.windDirection}</span></div>
        <div className="weather-stat"><span className="weather-stat-icon">☀️</span><span className="weather-stat-value">{w.uvIndex}</span><span className="weather-stat-label">UV Index</span></div>
        <div className="weather-stat"><span className="weather-stat-icon">🏟️</span><span className="weather-stat-value">{w.roofStatus}</span><span className="weather-stat-label">Roof</span></div>
        <div className="weather-stat"><span className="weather-stat-icon">🌡️</span><span className="weather-stat-value">{w.heatStressIndex}</span><span className="weather-stat-label">Heat Stress</span></div>
        <div className="weather-stat"><span className="weather-stat-icon">🌅</span><span className="weather-stat-value">{w.sunset}</span><span className="weather-stat-label">Sunset</span></div>
      </div>
      {w.alerts.length > 0 && (
        <div className="weather-alert">
          <span>⚠️</span> {w.alerts[0].message}
        </div>
      )}
    </div>
  );
}
