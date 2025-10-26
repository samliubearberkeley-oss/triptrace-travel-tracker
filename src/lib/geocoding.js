// 地理编码服务 - 将经纬度转换为地址信息
export class GeocodingService {
  constructor() {
    this.cache = new Map(); // 缓存地理编码结果
    this.baseUrl = 'https://nominatim.openstreetmap.org/reverse';
  }

  // 反向地理编码：根据经纬度获取地址信息
  async reverseGeocode(latitude, longitude) {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        format: 'json',
        addressdetails: '1',
        'accept-language': 'en'
      });

      const response = await fetch(`${this.baseUrl}?${params}`, {
        headers: {
          'User-Agent': 'TripTrace/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const result = {
          city: this.extractCity(address),
          state: this.extractState(address),
          country: address.country || '',
          fullAddress: data.display_name || '',
          raw: address
        };

        // 缓存结果
        this.cache.set(cacheKey, result);
        return result;
      }

      throw new Error('No address data found');
    } catch (error) {
      console.error('Geocoding error:', error);
      return {
        city: 'Unknown',
        state: 'Unknown',
        country: '',
        fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        error: error.message
      };
    }
  }

  // 提取城市名称
  extractCity(address) {
    return address.city || 
           address.town || 
           address.village || 
           address.hamlet || 
           address.municipality ||
           address.county ||
           'Unknown City';
  }

  // 提取州/省名称
  extractState(address) {
    return address.state || 
           address.province || 
           address.region ||
           address.county ||
           'Unknown State';
  }

  // 批量地理编码
  async batchReverseGeocode(records) {
    const promises = records.map(async (record) => {
      if (record.latitude && record.longitude) {
        const geocodeResult = await this.reverseGeocode(record.latitude, record.longitude);
        return {
          ...record,
          geocodedLocation: geocodeResult
        };
      }
      return record;
    });

    return Promise.all(promises);
  }

  // 格式化显示地址
  formatLocation(geocodedLocation) {
    if (!geocodedLocation) return 'Unknown Location';
    
    const { city, state, country } = geocodedLocation;
    
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    } else {
      return geocodedLocation.fullAddress || 'Unknown Location';
    }
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
  }
}

// 创建单例实例
export const geocodingService = new GeocodingService();
