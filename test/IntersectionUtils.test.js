import { Vector3, Quaternion, Euler, Triangle, Sphere, Plane, Line3 } from 'three';
import { closestPointsSegmentToSegment, sphereIntersectTriangle } from '../src/math/MathUtilities.js';
import { SeparatingAxisTriangle } from '../src/math/SeparatingAxisTriangle.js';
import { OrientedBox } from '../src/math/OrientedBox.js';

function setRandomVector( vector, length ) {

	vector
		.set(
			Math.random() - 0.5,
			Math.random() - 0.5,
			Math.random() - 0.5
		)
		.normalize()
		.multiplyScalar( length );

	return vector;

}

function getRandomOrientation( matrix, range ) {

	const pos = new Vector3();
	const quat = new Quaternion();
	const sca = new Vector3( 1, 1, 1 );

	setRandomVector( pos, range );
	quat.setFromEuler( new Euler( Math.random() * 180, Math.random() * 180, Math.random() * 180 ) );
	matrix.compose( pos, quat, sca );
	return matrix;

}

describe( 'Triangle Intersections', () => {

	const t1 = new SeparatingAxisTriangle();
	const t2 = new Triangle();

	it( 'should return false if they are at different angles but not intersecting', () => {

		t1.a.set( - 1, - 1, 0 );
		t1.b.set( 1, - 1, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 1, 0, 0 );
		t2.b.set( 0, 0, 1 );
		t2.c.set( - 2, 0, 1 );
		t2.needsUpdate = true;

		expect( t1.intersectsTriangle( t2 ) ).toBe( false );

	} );

	it( 'should return true if the are the same', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 1, 0, 0 );
		t2.b.set( 1, 0, 0 );
		t2.c.set( 0, 1, 0 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( true );

	} );

	it( 'should return false if they the same but offset on one axis', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 1, 0, 0.01 );
		t2.b.set( 1, 0, 0.01 );
		t2.c.set( 0, 1, 0.01 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( false );

	} );

	it( 'should return false if the triangles are on the same plane but separated', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 3, 0, 0 );
		t2.b.set( - 1.001, 0, 0 );
		t2.c.set( - 2, 1, 0 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( false );

	} );

	it( 'should return true if the triangles are on the same plane and overlapping', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 2, 0, 0 );
		t2.b.set( 0, 0, 0 );
		t2.c.set( - 1, 1, 0 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( true );

	} );

	it( 'should return true if just one vertex is overlapping', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 1, 0, 0 );
		t2.b.set( - 3, 0, 0 );
		t2.c.set( - 2, 1, 0 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( true );

	} );

	it( 'should return true if just one vertex is in the middle of a triangle', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( 0, 0.5, 0 );
		t2.b.set( - 1, 0.5, 1 );
		t2.c.set( 1, 0.5, 1 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( true );

	} );

	it( 'should return true if one triangle is completely inside the other', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 0.5, 0.25, 0 );
		t2.b.set( 0.5, 0.25, 0 );
		t2.c.set( 0, 0.75, 0 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( true );

	} );

	it( 'should return true if the triangles are intersecting at an angle', () => {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( 0, 0.5, 0.5 );
		t2.b.set( 0.5, 0.5, - 0.5 );
		t2.c.set( - 0.5, 0.5, - 0.5 );

		expect( t1.intersectsTriangle( t2 ) ).toBe( true );

	} );

	it( 'should handle edge case correctly', () => {

		t1.a.set( 0, 1, 1 );
		t1.b.set( - 1, 1, 1 );
		t1.c.set( 0, 0, 1 );
		t1.needsUpdate = true;

		t2.a.set( - 0.1, 0, 0 );
		t2.b.set( - 0.1, 0, 1 );
		t2.c.set( - 0.1, 1, 1 );
		t2.needsUpdate = true;

		let target = new Line3();
		let info = {};
		expect( t1.intersectsTriangle( t2, target, info ) ).toBe( true );
		expect( info.isValid ).toBe( undefined );

		expect( target.start.x ).toBeCloseTo( - 0.1, 3 );
		expect( target.start.y ).toBeCloseTo( 0.1, 3 );
		expect( target.start.z ).toBeCloseTo( 1, 3 );

		expect( target.end.x ).toBeCloseTo( - 0.1, 3 );
		expect( target.end.y ).toBeCloseTo( 1, 3 );
		expect( target.end.z ).toBeCloseTo( 1, 3 );

	} );

	it( 'should handle other edge case correctly', () => {

		t1.a.set( 1, - 1, 1 );
		t1.b.set( 1, - 1, 0 );
		t1.c.set( 1, 0, 0 );
		t1.needsUpdate = true;


		t2.a.set( 1, 0, - 0.1 );
		t2.b.set( 1, 0, 0.9 );
		t2.c.set( 0, 0, 0.9 );
		t2.needsUpdate = true;

		let target = new Line3();
		let info = {};
		expect( t1.intersectsTriangle( t2, target, info ) ).toBe( true );

		expect( info.isValid ).toBe( undefined );

		expect( target.start.x ).toBeCloseTo( 1, 3 );
		expect( target.start.y ).toBeCloseTo( 0, 3 );
		expect( target.start.z ).toBeCloseTo( 0, 3 );

		expect( target.end.x ).toBeCloseTo( 1, 3 );
		expect( target.end.y ).toBeCloseTo( 0, 3 );
		expect( target.end.z ).toBeCloseTo( 0, 3 );

	} );

} );

describe( 'Sphere Intersections', () => {

	it( 'should intersect triangles with a vertex inside', () => {

		const sphere = new Sphere();
		sphere.radius = 1;
		setRandomVector( sphere.center, 10 );

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], Math.random() - 0.0001 )
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i1 ] ], 1 + 0.0001 + Math.random() )
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i2 ] ], 1 + 0.0001 + Math.random() )
				.add( sphere.center );

			expect( sphereIntersectTriangle( sphere, triangle ) ).toBe( true );

		}

	} );

	it( 'should intersect triangles with two vertices inside', () => {

		const sphere = new Sphere();
		sphere.radius = 1;
		setRandomVector( sphere.center, 10 );

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], Math.random() - 0.0001 )
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i1 ] ], Math.random() - 0.0001 )
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i2 ] ], 1 + 0.0001 + Math.random() )
				.add( sphere.center );

			expect( sphereIntersectTriangle( sphere, triangle ) ).toBe( true );

		}

	} );

	it( 'should intersect triangles with all vertices inside', () => {

		const sphere = new Sphere();
		sphere.radius = 1;
		setRandomVector( sphere.center, 10 );

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], Math.random() - 0.0001 )
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i1 ] ], Math.random() - 0.0001 )
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i2 ] ], Math.random() - 0.0001 )
				.add( sphere.center );

			expect( sphereIntersectTriangle( sphere, triangle ) ).toBe( true );

		}

	} );

	it( 'should intersect triangles that only intersect the middle', () => {

		const sphere = new Sphere();
		sphere.radius = 1;
		setRandomVector( sphere.center, 10 );

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], 1 + 0.0001 + Math.random() );

			triangle[ fields[ i1 ] ]
				.copy( triangle[ fields[ i0 ] ] )
				.multiplyScalar( - 1 )
				.add( sphere.center );

			triangle[ fields[ i0 ] ]
				.add( sphere.center );

			setRandomVector( triangle[ fields[ i2 ] ], 1 + 0.0001 + Math.random() )
				.add( sphere.center );

			expect( sphereIntersectTriangle( sphere, triangle ) ).toBe( true );

		}

	} );

	it( 'should not intersect triangles outside sphere', () => {

		const sphere = new Sphere();
		sphere.radius = 1;
		setRandomVector( sphere.center, 10 );

		const plane = new Plane();
		const vec = new Vector3();

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			// project the triangle out onto a plane
			setRandomVector( plane.normal, 1 );
			plane.setFromNormalAndCoplanarPoint( plane.normal, sphere.center );
			plane.constant += ( Math.sign( Math.random() - 0.5 ) || 1 ) * 1.001;

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( vec, 10 * Math.random() )
				.add( sphere.center );
			plane.projectPoint( vec, triangle[ fields[ i0 ] ] );

			setRandomVector( vec, 10 * Math.random() )
				.add( sphere.center );
			plane.projectPoint( vec, triangle[ fields[ i1 ] ] );

			setRandomVector( vec, 10 * Math.random() )
				.add( sphere.center );
			plane.projectPoint( vec, triangle[ fields[ i2 ] ] );

			expect( sphereIntersectTriangle( sphere, triangle ) ).toBe( false );

		}

	} );

} );

describe( 'Box Intersections', () => {

	let box, center;
	beforeEach( () => {

		box = new OrientedBox();
		box.min.set( - 1, - 1, - 1 );
		box.max.set( 1, 1, 1 );
		getRandomOrientation( box.matrix, 10 );
		box.needsUpdate = true;

		center = new Vector3();
		center.setFromMatrixPosition( box.matrix );

	} );

	it( 'should intersect triangles with a vertex inside', () => {

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], Math.random() - 0.0001 )
				.add( center );

			setRandomVector( triangle[ fields[ i1 ] ], 3 + 0.0001 + Math.random() )
				.add( center );

			setRandomVector( triangle[ fields[ i2 ] ], 3 + 0.0001 + Math.random() )
				.add( center );

			expect( box.intersectsTriangle( triangle ) ).toBe( true );

		}

	} );

	it( 'should intersect triangles with two vertices inside', () => {

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], Math.random() - 0.0001 )
				.add( center );

			setRandomVector( triangle[ fields[ i1 ] ], Math.random() - 0.0001 )
				.add( center );

			setRandomVector( triangle[ fields[ i2 ] ], 3 + 0.0001 + Math.random() )
				.add( center );

			expect( box.intersectsTriangle( triangle ) ).toBe( true );

		}

	} );

	it( 'should intersect triangles with all vertices inside', () => {

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], Math.random() - 0.0001 )
				.add( center );

			setRandomVector( triangle[ fields[ i1 ] ], Math.random() - 0.0001 )
				.add( center );

			setRandomVector( triangle[ fields[ i2 ] ], Math.random() - 0.0001 )
				.add( center );

			expect( box.intersectsTriangle( triangle ) ).toBe( true );

		}

	} );


	it( 'should intersect triangles that cut across', () => {

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( triangle[ fields[ i0 ] ], 3 + 0.0001 + Math.random() );

			triangle[ fields[ i1 ] ]
				.copy( triangle[ fields[ i0 ] ] )
				.multiplyScalar( - 1 )
				.add( center );

			triangle[ fields[ i0 ] ]
				.add( center );

			setRandomVector( triangle[ fields[ i2 ] ], 3 + 0.0001 + Math.random() )
				.add( center );

			expect( box.intersectsTriangle( triangle ) ).toBe( true );

		}

	} );

	it( 'should not intersect triangles outside sphere', () => {

		const plane = new Plane();
		const vec = new Vector3();

		const triangle = new Triangle();
		for ( let i = 0; i < 100; i ++ ) {

			// project the triangle out onto a plane
			setRandomVector( plane.normal, 1 );
			plane.setFromNormalAndCoplanarPoint( plane.normal, center );
			plane.constant += ( Math.sign( Math.random() - 0.5 ) || 1 ) * 5.001;

			const fields = [ 'a', 'b', 'c' ];
			const i0 = i % 3;
			const i1 = ( i + 1 ) % 3;
			const i2 = ( i + 2 ) % 3;

			setRandomVector( vec, 10 * Math.random() )
				.add( center );
			plane.projectPoint( vec, triangle[ fields[ i0 ] ] );

			setRandomVector( vec, 10 * Math.random() )
				.add( center );
			plane.projectPoint( vec, triangle[ fields[ i1 ] ] );

			setRandomVector( vec, 10 * Math.random() )
				.add( center );
			plane.projectPoint( vec, triangle[ fields[ i2 ] ] );

			expect( box.intersectsTriangle( triangle ) ).toBe( false );

		}

	} );

} );

describe( 'Distance Between Triangles', function () {

	const t1 = new SeparatingAxisTriangle();
	const t2 = new Triangle();

	it( 'should handle edge case', function () {

		t1.a.set( - 1, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, - 1, 0 );
		t1.needsUpdate = true;

		t2.a.set( - 1, 0, - 1 );
		t2.b.set( 1, 0, - 1 );
		t2.c.set( 0, 0, 1 );
		t2.needsUpdate = true;

		expect( t1.distanceToTriangle( t2 ) ).toEqual( 0 );

	} );

	it( 'should support edge case (2)', function () {

		t1.a.set( 0, 0, 0 );
		t1.b.set( 1, 0, 0 );
		t1.c.set( 0, 1, 0 );
		t1.needsUpdate = true;


		t2.a.set( 0, 0.1, - 0.1 );
		t2.b.set( 1, 0.1, - 0.1 );
		t2.c.set( 0, 0.1, 0.9 );
		t2.needsUpdate = true;

		expect( t1.distanceToTriangle( t2 ) ).toEqual( 0 );

	} );

} );

describe( 'closestPointsSegmentToSegment', function () {

	let point1 = new Vector3();
	let point2 = new Vector3();
	it( 'should support edge case', function () {

		const line1 = new Line3( new Vector3( - 1, 0, 0 ), new Vector3( 1, 0, 0 ) );
		const line2 = new Line3( new Vector3( 1, 0, - 1 ), new Vector3( 0, 0, 1 ) );
		closestPointsSegmentToSegment( line1, line2, point1, point2 );
		expect( point1.distanceToSquared( point2 ) ).toEqual( 0 );

	} );

} );
