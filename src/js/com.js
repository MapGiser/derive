

/// <summary>
/// Convert degrees to radians
/// </summary>
/// <param name="x">Degrees</param>
/// <returns>The equivalent in radians</returns>
function Radians(x) {
  return x * Math.PI / 180;
}

/// <summary>
/// Calculate the bearing between two points using spherical laws(Spherical law of sines and cosines).
/// </summary>
/// <param name="lat1"></param>
/// <param name="lon1"></param>
/// <param name="lat2"></param>
/// <param name="lon2"></param>
/// <returns>The bearing in degrees.</returns>
function Complex(lat1, lon1, lat2, lon2) {
  var numerator = Math.sin(Radians(lon2 - lon1)) * Math.cos(Radians(lat2));
  var denominator = Math.cos(Radians(lat1)) * Math.sin(Radians(lat2))
    - Math.sin(Radians(lat1)) * Math.cos(Radians(lat2)) * Math.cos(Radians(lon2 - lon1));

  var x = Math.atan2(Math.abs(numerator), Math.abs(denominator));
  var result = x;

  if (lon2 > lon1) // right quadrant
  {
    if (lat2 > lat1) // first quadrant
      result = x;
    else if (lat2 < lat1) // forth quadrant
      result = Math.PI - x;
    else
      result = Math.PI / 2; // in positive-x axis
  }
  else if (lon2 < lon1) // left quadrant
  {
    if (lat2 > lat1) // second quadrant
      result = 2 * Math.PI - x;
    else if (lat2 < lat1) // third quadrant
      result = Math.PI + x;
    else
      result = Math.PI * 3 / 2; // in negative-x axis
  }
  else // same longitude
  {
    if (lat2 > lat1) // in positive-y axis
      result = 0;
    else if (lat2 < lat1)
      result = Math.PI; // in negative-y axis
    else
      throw new Exception("Shouldn't be same location!");
  }

  return result * 180 / Math.PI;
}

export default Complex;