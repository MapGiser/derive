define(["exports","./Cartesian2-efe7a869","./PolylineVolumeGeometryLibrary-6728ea45","./when-208fe5b0","./Math-cdf89016","./Transforms-6ad5ced7","./PolylinePipeline-04a1a057"],function(a,O,R,s,V,u,Q){"use strict";var e={},U=new O.Cartesian3,d=new O.Cartesian3,p=new O.Cartesian3,m=new O.Cartesian3,G=[new O.Cartesian3,new O.Cartesian3],I=new O.Cartesian3,q=new O.Cartesian3,j=new O.Cartesian3,k=new O.Cartesian3,F=new O.Cartesian3,H=new O.Cartesian3,J=new O.Cartesian3,K=new O.Cartesian3,W=new O.Cartesian3,X=new O.Cartesian3,c=new u.Quaternion,g=new u.Matrix3;function Y(a,e,r,n,t){var i=O.Cartesian3.angleBetween(O.Cartesian3.subtract(e,a,U),O.Cartesian3.subtract(r,a,d)),s=n===R.CornerType.BEVELED?1:Math.ceil(i/V.CesiumMath.toRadians(5))+1,n=3*s,o=new Array(n);o[n-3]=r.x,o[n-2]=r.y,o[n-1]=r.z;var C=t?u.Matrix3.fromQuaternion(u.Quaternion.fromAxisAngle(O.Cartesian3.negate(a,U),i/s,c),g):u.Matrix3.fromQuaternion(u.Quaternion.fromAxisAngle(a,i/s,c),g),l=0;e=O.Cartesian3.clone(e,U);for(var y=0;y<s;y++)e=u.Matrix3.multiplyByVector(C,e,e),o[l++]=e.x,o[l++]=e.y,o[l++]=e.z;return o}function Z(a,e,r,n){var t=U;return[(t=(n||(e=O.Cartesian3.negate(e,e)),O.Cartesian3.add(a,e,t))).x,t.y,t.z,r.x,r.y,r.z]}function $(a,e,r,n){for(var t=new Array(a.length),i=new Array(a.length),s=O.Cartesian3.multiplyByScalar(e,r,U),o=O.Cartesian3.negate(s,d),C=0,l=a.length-1,y=0;y<a.length;y+=3){var u=O.Cartesian3.fromArray(a,y,p),c=O.Cartesian3.add(u,o,m);t[C++]=c.x,t[C++]=c.y,t[C++]=c.z;u=O.Cartesian3.add(u,s,m);i[l--]=u.z,i[l--]=u.y,i[l--]=u.x}return n.push(t,i),n}e.addAttribute=function(a,e,r,n){var t=e.x,i=e.y,e=e.z;s.defined(r)&&(a[r]=t,a[r+1]=i,a[r+2]=e),s.defined(n)&&(a[n]=e,a[n-1]=i,a[n-2]=t)};var _=new O.Cartesian3,aa=new O.Cartesian3;e.computePositions=function(a){var e=a.granularity,r=a.positions,n=a.ellipsoid,t=a.width/2,i=a.cornerType,s=a.saveAttributes,o=I,C=j,l=k,y=F,u=H,c=J,d=K,p=W,m=X,g=[],h=s?[]:void 0,f=s?[]:void 0,w=r[0],z=r[1],x=O.Cartesian3.normalize(O.Cartesian3.subtract(z,w,x=q),x),o=n.geodeticSurfaceNormal(w,o),l=O.Cartesian3.normalize(O.Cartesian3.cross(o,x,l),l);s&&(h.push(l.x,l.y,l.z),f.push(o.x,o.y,o.z));for(var P,A,B,v,E,S,b,c=O.Cartesian3.clone(w,c),w=z,C=O.Cartesian3.negate(x,C),D=[],M=r.length,T=1;T<M-1;T++){o=n.geodeticSurfaceNormal(w,o),z=r[T+1],x=O.Cartesian3.normalize(O.Cartesian3.subtract(z,w,x),x),y=O.Cartesian3.normalize(O.Cartesian3.add(x,C,y),y);var N=O.Cartesian3.multiplyByScalar(o,O.Cartesian3.dot(x,o),_);O.Cartesian3.subtract(x,N,N),O.Cartesian3.normalize(N,N);var L=O.Cartesian3.multiplyByScalar(o,O.Cartesian3.dot(C,o),aa);O.Cartesian3.subtract(C,L,L),O.Cartesian3.normalize(L,L),V.CesiumMath.equalsEpsilon(Math.abs(O.Cartesian3.dot(N,L)),1,V.CesiumMath.EPSILON7)||(y=O.Cartesian3.cross(y,o,y),y=O.Cartesian3.cross(o,y,y),y=O.Cartesian3.normalize(y,y),N=t/Math.max(.25,O.Cartesian3.magnitude(O.Cartesian3.cross(y,C,U))),L=R.PolylineVolumeGeometryLibrary.angleIsGreaterThanPi(x,C,w,n),y=O.Cartesian3.multiplyByScalar(y,N,y),L?(d=O.Cartesian3.add(w,y,d),m=O.Cartesian3.add(d,O.Cartesian3.multiplyByScalar(l,t,m),m),p=O.Cartesian3.add(d,O.Cartesian3.multiplyByScalar(l,2*t,p),p),G[0]=O.Cartesian3.clone(c,G[0]),G[1]=O.Cartesian3.clone(m,G[1]),g=$(Q.PolylinePipeline.generateArc({positions:G,granularity:e,ellipsoid:n}),l,t,g),s&&(h.push(l.x,l.y,l.z),f.push(o.x,o.y,o.z)),u=O.Cartesian3.clone(p,u),l=O.Cartesian3.normalize(O.Cartesian3.cross(o,x,l),l),p=O.Cartesian3.add(d,O.Cartesian3.multiplyByScalar(l,2*t,p),p),c=O.Cartesian3.add(d,O.Cartesian3.multiplyByScalar(l,t,c),c),i===R.CornerType.ROUNDED||i===R.CornerType.BEVELED?D.push({leftPositions:Y(d,u,p,i,L)}):D.push({leftPositions:Z(w,O.Cartesian3.negate(y,y),p,L)})):(p=O.Cartesian3.add(w,y,p),m=O.Cartesian3.add(p,O.Cartesian3.negate(O.Cartesian3.multiplyByScalar(l,t,m),m),m),d=O.Cartesian3.add(p,O.Cartesian3.negate(O.Cartesian3.multiplyByScalar(l,2*t,d),d),d),G[0]=O.Cartesian3.clone(c,G[0]),G[1]=O.Cartesian3.clone(m,G[1]),g=$(Q.PolylinePipeline.generateArc({positions:G,granularity:e,ellipsoid:n}),l,t,g),s&&(h.push(l.x,l.y,l.z),f.push(o.x,o.y,o.z)),u=O.Cartesian3.clone(d,u),l=O.Cartesian3.normalize(O.Cartesian3.cross(o,x,l),l),d=O.Cartesian3.add(p,O.Cartesian3.negate(O.Cartesian3.multiplyByScalar(l,2*t,d),d),d),c=O.Cartesian3.add(p,O.Cartesian3.negate(O.Cartesian3.multiplyByScalar(l,t,c),c),c),i===R.CornerType.ROUNDED||i===R.CornerType.BEVELED?D.push({rightPositions:Y(p,u,d,i,L)}):D.push({rightPositions:Z(w,y,d,L)})),C=O.Cartesian3.negate(x,C)),w=z}return o=n.geodeticSurfaceNormal(w,o),G[0]=O.Cartesian3.clone(c,G[0]),G[1]=O.Cartesian3.clone(w,G[1]),g=$(Q.PolylinePipeline.generateArc({positions:G,granularity:e,ellipsoid:n}),l,t,g),s&&(h.push(l.x,l.y,l.z),f.push(o.x,o.y,o.z)),i===R.CornerType.ROUNDED&&(A=I,B=j,v=(P=g)[1],E=O.Cartesian3.fromArray(P[1],v.length-3,E=q),B=O.Cartesian3.fromArray(P[0],0,B),S=Y(A=O.Cartesian3.midpoint(E,B,A),E,B,R.CornerType.ROUNDED,!1),b=P.length-1,a=P[b-1],v=P[b],E=O.Cartesian3.fromArray(a,a.length-3,E),B=O.Cartesian3.fromArray(v,0,B),B=[S,Y(A=O.Cartesian3.midpoint(E,B,A),E,B,R.CornerType.ROUNDED,!1)]),{positions:g,corners:D,lefts:h,normals:f,endPositions:B}},a.CorridorGeometryLibrary=e});
