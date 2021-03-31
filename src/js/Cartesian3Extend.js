function Cartesian3Extend(options) {
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.z = options.z || 0;
}
Cartesian3Extend.prototype.projectOnVector = function (v) {
  const denominator = v.lengthSq();
  if (denominator === 0) return this.set(0, 0, 0);
  const scalar = v.dot(this) / denominator;
  return this.copy(v).multiplyScalar(scalar);
}

Cartesian3Extend.prototype.projectOnPlane = function (planeNormal) {
  _vector.copy(this).projectOnVector(planeNormal);
  return this.sub(_vector);
}


Cartesian3Extend.prototype.lengthSq = function () {
  return this.x * this.x + this.y * this.y + this.z * this.z;
}

Cartesian3Extend.prototype.dot = function (v) {
  return this.x * v.x + this.y * v.y + this.z * v.z;
}

Cartesian3Extend.prototype.copy = function (v) {
  this.x = v.x;
  this.y = v.y;
  this.z = v.z;
  return this;

}

Cartesian3Extend.prototype.sub = function (v, w) {
  if (w !== undefined) {
    console.warn('THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.');
    return this.subVectors(v, w);
  }
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;
  return this;

}

Cartesian3Extend.prototype.subVectors = function (a, b) {
  this.x = a.x - b.x;
  this.y = a.y - b.y;
  this.z = a.z - b.z;
  return this;

}

Cartesian3Extend.prototype.multiplyScalar = function (scalar) {
  this.x *= scalar;
  this.y *= scalar;
  this.z *= scalar;
  return this;

}

const _vector = new Cartesian3Extend({});

export default Cartesian3Extend;