define(["exports","./Cartesian2-efe7a869","./when-208fe5b0","./Check-d18af7c4","./Math-cdf89016"],function(e,o,r,t,i){"use strict";function n(e){this._ellipsoid=r.defaultValue(e,o.Ellipsoid.WGS84),this._semimajorAxis=this._ellipsoid.maximumRadius,this._oneOverSemimajorAxis=1/this._semimajorAxis}Object.defineProperties(n.prototype,{ellipsoid:{get:function(){return this._ellipsoid}}}),n.mercatorAngleToGeodeticLatitude=function(e){return i.CesiumMath.PI_OVER_TWO-2*Math.atan(Math.exp(-e))},n.geodeticLatitudeToMercatorAngle=function(e){n.MaximumLatitude<e?e=n.MaximumLatitude:e<-n.MaximumLatitude&&(e=-n.MaximumLatitude);e=Math.sin(e);return.5*Math.log((1+e)/(1-e))},n.MaximumLatitude=n.mercatorAngleToGeodeticLatitude(Math.PI),n.prototype.project=function(e,t){var i=this._semimajorAxis,a=e.longitude*i,i=n.geodeticLatitudeToMercatorAngle(e.latitude)*i,e=e.height;return r.defined(t)?(t.x=a,t.y=i,t.z=e,t):new o.Cartesian3(a,i,e)},n.prototype.unproject=function(e,t){var i=this._oneOverSemimajorAxis,a=e.x*i,i=n.mercatorAngleToGeodeticLatitude(e.y*i),e=e.z;return r.defined(t)?(t.longitude=a,t.latitude=i,t.height=e,t):new o.Cartographic(a,i,e)},e.WebMercatorProjection=n});
