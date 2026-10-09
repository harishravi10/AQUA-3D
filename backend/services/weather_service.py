import httpx
from datetime import datetime
from typing import Dict, Any, Optional

WMO_WEATHER_MAP = {
    0: ("Clear sky", "clear"),
    1: ("Mainly clear", "mostly_clear"),
    2: ("Partly cloudy", "partly_cloudy"),
    3: ("Overcast", "overcast"),
    45: ("Foggy", "fog"),
    48: ("Depositing rime fog", "fog"),
    51: ("Light drizzle", "rain"),
    53: ("Moderate drizzle", "rain"),
    55: ("Dense drizzle", "rain"),
    61: ("Slight rain", "rain"),
    63: ("Moderate rain", "rain"),
    65: ("Heavy rain", "rain"),
    71: ("Slight snowfall", "snow"),
    73: ("Moderate snowfall", "snow"),
    75: ("Heavy snowfall", "snow"),
    80: ("Rain showers", "rain"),
    81: ("Moderate rain showers", "rain"),
    82: ("Violent rain showers", "rain"),
    95: ("Thunderstorm", "thunderstorm"),
}

# Cache: key -> {timestamp, data}
_weather_cache: Dict[str, Any] = {}

async def fetch_weather_data(city: str = "New York", lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    cache_key = f"{city}_{lat}_{lon}"
    now = datetime.now()
    
    # Check 15-minute cache
    if cache_key in _weather_cache:
        cached = _weather_cache[cache_key]
        if (now - cached["time"]).total_seconds() < 900:
            return cached["data"]

    target_city = city or "New York"
    latitude = lat
    longitude = lon

    async with httpx.AsyncClient(timeout=6.0) as client:
        # If no coordinates, resolve via Open-Meteo Geocoding
        if latitude is None or longitude is None:
            try:
                geo_resp = await client.get(
                    f"https://geocoding-api.open-meteo.com/v1/search?name={target_city}&count=1&language=en&format=json"
                )
                if geo_resp.status_code == 200:
                    geo_data = geo_resp.json()
                    if geo_data.get("results"):
                        first = geo_data["results"][0]
                        latitude = first["latitude"]
                        longitude = first["longitude"]
                        target_city = first.get("name", target_city)
            except Exception as e:
                print(f"[WeatherService] Geocoding fallback: {e}")
                latitude = 40.7128
                longitude = -74.0060

        # Query Open-Meteo weather
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={latitude}&longitude={longitude}"
                f"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
            )
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json().get("current", {})
                temp_c = data.get("temperature_2m", 21.0)
                temp_f = round((temp_c * 9/5) + 32, 1)
                humidity = data.get("relative_humidity_2m", 50)
                weather_code = data.get("weather_code", 0)
                wind = data.get("wind_speed_10m", 10.0)
                
                cond_name, _ = WMO_WEATHER_MAP.get(weather_code, ("Fair", "fair"))
                
                # Contextual hydration advice
                advice = "Great conditions for regular hydration pacing. Drink water consistently throughout your day."
                adjustment = 0
                
                if temp_c >= 30:
                    advice = f"High heat ({temp_c}°C / {temp_f}°F). Sweat rates increase rapidly; consider adding +500 ml today and taking small sips every 30 minutes."
                    adjustment = 500
                elif temp_c >= 25:
                    advice = f"Warm climate ({temp_c}°C). Higher perspiration potential; aim for an extra 250 ml to stay sharp and refreshed."
                    adjustment = 250
                elif temp_c <= 10:
                    advice = f"Crisp cold weather ({temp_c}°C). Cold temperatures often blunt thirst receptors. Keep sipping warm water or herbal teas regularly."
                    adjustment = 100
                elif humidity <= 35:
                    advice = f"Low humidity ({humidity}%). Dry air increases moisture loss through breathing. Keep your bottle nearby."
                    adjustment = 200

                result = {
                    "city": target_city,
                    "temperature_c": round(temp_c, 1),
                    "temperature_f": temp_f,
                    "humidity": int(humidity),
                    "condition": cond_name,
                    "weather_code": weather_code,
                    "wind_speed_kmh": round(wind, 1),
                    "hydration_advice": advice,
                    "recommended_intake_adjustment_ml": adjustment,
                    "last_updated": now.strftime("%I:%M %p")
                }
                
                _weather_cache[cache_key] = {"time": now, "data": result}
                return result
        except Exception as e:
            print(f"[WeatherService] Weather fetch fallback: {e}")

    # Graceful fallback
    fallback_data = {
        "city": target_city,
        "temperature_c": 22.0,
        "temperature_f": 71.6,
        "humidity": 45,
        "condition": "Pleasant",
        "weather_code": 1,
        "wind_speed_kmh": 12.0,
        "hydration_advice": "Ideal room temperature conditions. Aim to hit your baseline daily target with steady hourly sips.",
        "recommended_intake_adjustment_ml": 0,
        "last_updated": now.strftime("%I:%M %p")
    }
    _weather_cache[cache_key] = {"time": now, "data": fallback_data}
    return fallback_data
