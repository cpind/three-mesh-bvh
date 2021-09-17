
import { Vector2, Vector3, Triangle } from 'three';

// sets the vertices of triangle `tri` with the 3 vertices after i
export function setTriangle( tri, i, index, pos ) {

	const ta = tri.a;
	const tb = tri.b;
	const tc = tri.c;

	let i0 = i;
	let i1 = i + 1;
	let i2 = i + 2;
	if ( index ) {

		i0 = index.getX( i );
		i1 = index.getX( i + 1 );
		i2 = index.getX( i + 2 );

	}

	ta.x = pos.getX( i0 );
	ta.y = pos.getY( i0 );
	ta.z = pos.getZ( i0 );

	tb.x = pos.getX( i1 );
	tb.y = pos.getY( i1 );
	tb.z = pos.getZ( i1 );

	tc.x = pos.getX( i2 );
	tc.y = pos.getY( i2 );
	tc.z = pos.getZ( i2 );

}

export function iterateOverTriangles(
	offset,
	count,
	geometry,
	intersectsTriangleFunc,
	contained,
	depth,
	triangle
) {

	const index = geometry.index;
	const pos = geometry.attributes.position;
	for ( let i = offset, l = count + offset; i < l; i ++ ) {

		setTriangle( triangle, i * 3, index, pos );
		triangle.needsUpdate = true;

		if ( intersectsTriangleFunc( triangle, i, contained, depth ) ) {

			return true;

		}

	}

	return false;

}

const tempV1 = /* @__PURE__ */ new Vector3();
const tempV2 = /* @__PURE__ */ new Vector3();
const tempV3 = /* @__PURE__ */ new Vector3();
const tempUV1 = /* @__PURE__ */ new Vector2();
const tempUV2 = /* @__PURE__ */ new Vector2();
const tempUV3 = /* @__PURE__ */ new Vector2();

export function getTriangleHitPointInfo( point, geometry, triangleIndex, target ) {

	const indices = geometry.getIndex().array;
	const positions = geometry.getAttribute( 'position' );
	const uvs = geometry.getAttribute( 'uv' );

	const a = indices[ triangleIndex * 3 ];
	const b = indices[ triangleIndex * 3 + 1 ];
	const c = indices[ triangleIndex * 3 + 2 ];

	tempV1.fromBufferAttribute( positions, a );
	tempV2.fromBufferAttribute( positions, b );
	tempV3.fromBufferAttribute( positions, c );

	let uv = null;
	if ( uvs ) {

		tempUV1.fromBufferAttribute( uvs, a );
		tempUV2.fromBufferAttribute( uvs, b );
		tempUV3.fromBufferAttribute( uvs, c );

		if ( target && target.uv ) uv = target.uv;
		else uv = new Vector2();

		Triangle.getUV( point, tempV1, tempV2, tempV3, tempUV1, tempUV2, tempUV3, uv );

	}

	if ( target ) {

		if ( ! target.point ) target.point = new Vector3();
		target.point.copy( point );

		if ( ! target.face ) target.face = { };
		target.face.a = a;
		target.face.b = b;
		target.face.c = c;
		target.face.materialIndex = 0;
		if ( ! target.face.normal ) target.face.normal = new Vector3();
		Triangle.getNormal( tempV1, tempV2, tempV3, target.face.normal );

		target.distance = 0;
		if ( ! target.uv ) target.uv = new Vector2();
		target.uv.copy( uv );

		return target;

	} else {

		return {
			point: point.clone(),
			face: {
				a: a,
				b: b,
				c: c,
				materialIndex: 0,
				normal: Triangle.getNormal( tempV1, tempV2, tempV3, new Vector3() )
			},
			uv: uv
		};

	}

}