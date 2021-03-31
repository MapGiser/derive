define(["./when-208fe5b0","./Cartesian2-8417ca3d","./arrayRemoveDuplicates-0f62a181","./BoundingRectangle-7ee12c46","./Transforms-a73b3b3b","./ComponentDatatype-9204e9f6","./PolylineVolumeGeometryLibrary-0881a44a","./Check-d18af7c4","./GeometryAttribute-04a19cfe","./GeometryAttributes-b0b294d8","./IndexDatatype-d47ad6f6","./Math-4e53b694","./PolygonPipeline-bfd1975b","./RuntimeError-7f634f5d","./WebGLConstants-76bb35d1","./EllipsoidTangentPlane-9123a53b","./IntersectionTests-7d224a2f","./Plane-4aa8974d","./PolylinePipeline-6c0541b0","./EllipsoidGeodesic-691360b8","./EllipsoidRhumbLine-8cb2e5a4"],function(d,u,a,r,c,y,o,e,h,f,g,t,l,i,n,s,p,m,E,b,v){"use strict";function P(e){var i=(e=d.defaultValue(e,d.defaultValue.EMPTY_OBJECT)).polylinePositions,n=e.shapePositions;this._positions=i,this._shape=n,this._ellipsoid=u.Ellipsoid.clone(d.defaultValue(e.ellipsoid,u.Ellipsoid.WGS84)),this._cornerType=d.defaultValue(e.cornerType,o.CornerType.ROUNDED),this._granularity=d.defaultValue(e.granularity,t.CesiumMath.RADIANS_PER_DEGREE),this._workerName="createPolylineVolumeOutlineGeometry";i=1+i.length*u.Cartesian3.packedLength;i+=1+n.length*u.Cartesian2.packedLength,this.packedLength=i+u.Ellipsoid.packedLength+2}P.pack=function(e,i,n){var t;n=d.defaultValue(n,0);var a=e._positions,r=a.length;for(i[n++]=r,t=0;t<r;++t,n+=u.Cartesian3.packedLength)u.Cartesian3.pack(a[t],i,n);var o=e._shape,r=o.length;for(i[n++]=r,t=0;t<r;++t,n+=u.Cartesian2.packedLength)u.Cartesian2.pack(o[t],i,n);return u.Ellipsoid.pack(e._ellipsoid,i,n),n+=u.Ellipsoid.packedLength,i[n++]=e._cornerType,i[n]=e._granularity,i};var _=u.Ellipsoid.clone(u.Ellipsoid.UNIT_SPHERE),k={polylinePositions:void 0,shapePositions:void 0,ellipsoid:_,height:void 0,cornerType:void 0,granularity:void 0};P.unpack=function(e,i,n){i=d.defaultValue(i,0);for(var t=e[i++],a=new Array(t),r=0;r<t;++r,i+=u.Cartesian3.packedLength)a[r]=u.Cartesian3.unpack(e,i);var t=e[i++],o=new Array(t);for(r=0;r<t;++r,i+=u.Cartesian2.packedLength)o[r]=u.Cartesian2.unpack(e,i);var l=u.Ellipsoid.unpack(e,i,_);i+=u.Ellipsoid.packedLength;var s=e[i++],p=e[i];return d.defined(n)?(n._positions=a,n._shape=o,n._ellipsoid=u.Ellipsoid.clone(l,n._ellipsoid),n._cornerType=s,n._granularity=p,n):(k.polylinePositions=a,k.shapePositions=o,k.cornerType=s,k.granularity=p,new P(k))};var C=new r.BoundingRectangle;return P.createGeometry=function(e){var i=e._positions,n=a.arrayRemoveDuplicates(i,u.Cartesian3.equalsEpsilon),t=e._shape,t=o.PolylineVolumeGeometryLibrary.removeDuplicatesFromShape(t);if(!(n.length<2||t.length<3)){l.PolygonPipeline.computeWindingOrder2D(t)===l.WindingOrder.CLOCKWISE&&t.reverse();i=r.BoundingRectangle.fromPoints(t,C);return function(e,i){var n=new f.GeometryAttributes;n.position=new h.GeometryAttribute({componentDatatype:y.ComponentDatatype.DOUBLE,componentsPerAttribute:3,values:e});var t=i.length,i=n.position.values.length/3,a=e.length/3/t,r=g.IndexDatatype.createTypedArray(i,2*t*(1+a)),o=0,l=0,s=l*t;for(u=0;u<t-1;u++)r[o++]=u+s,r[o++]=u+s+1;for(r[o++]=t-1+s,r[o++]=s,s=(l=a-1)*t,u=0;u<t-1;u++)r[o++]=u+s,r[o++]=u+s+1;for(r[o++]=t-1+s,r[o++]=s,l=0;l<a-1;l++)for(var p=t*l,d=p+t,u=0;u<t;u++)r[o++]=u+p,r[o++]=u+d;return new h.Geometry({attributes:n,indices:g.IndexDatatype.createTypedArray(i,r),boundingSphere:c.BoundingSphere.fromVertices(e),primitiveType:h.PrimitiveType.LINES})}(o.PolylineVolumeGeometryLibrary.computePositions(n,t,i,e,!1),t)}},function(e,i){return(e=d.defined(i)?P.unpack(e,i):e)._ellipsoid=u.Ellipsoid.clone(e._ellipsoid),P.createGeometry(e)}});
