import { MathUtils, Vector3Tuple } from "three";
import { Coords } from "./coords";
import { earthRadius } from "../core/earth-radius";
import { averageMercatorScale } from "./coords-to-vector-3";

export function vector3ToCoords(position: Vector3Tuple, origin: Coords): Coords {
  const [x, y, z] = position;

  const originScale = 1 / Math.cos(origin.latitude * MathUtils.DEG2RAD);

  // initial guess ignoring mercator scale correction
  let latDiff = (-z / earthRadius);

  // refine latitude difference using the same scaling as `coordsToVector3`
  for (let i = 0; i < 5; i++) {
    const lat = origin.latitude + latDiff * MathUtils.RAD2DEG;
    const avgScale = averageMercatorScale(origin.latitude, lat);
    const newLatDiff = (-z * originScale) / (earthRadius * avgScale);
    if (Math.abs(newLatDiff - latDiff) < 1e-12) break;
    latDiff = newLatDiff;
  }

  const latitude = origin.latitude + latDiff * MathUtils.RAD2DEG;
  const longitude = origin.longitude + (x / earthRadius) * MathUtils.RAD2DEG / Math.cos(origin.latitude * MathUtils.DEG2RAD);
  const altitude = (origin.altitude || 0) + y;
  const coords: Coords = { latitude, longitude, altitude };
  return coords;
}