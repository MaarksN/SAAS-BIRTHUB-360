from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any, Literal

class GeoLocation(BaseModel):
    type: Literal['Point'] = 'Point'
    coordinates: List[float] # [longitude, latitude]

class LocalBusiness(BaseModel):
    externalId: str
    name: str
    address: str
    location: GeoLocation
    types: List[str]
    rating: Optional[float] = None
    userRatingsTotal: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    source: Literal['google_places', 'serp_api']
    metadata: Optional[Dict[str, Any]] = None

class SearchPlacesRequest(BaseModel):
    query: str = Field(..., min_length=1)
    lat: float = Field(..., ge=-90, le=90)
    long: float = Field(..., ge=-180, le=180)
    radius: float = Field(..., gt=0)
