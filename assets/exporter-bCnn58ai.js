import{a5 as sa,a6 as Pt,y as Mr,C as qe,a7 as Tr,a as At,V as Fe,R as xr,a8 as dt,a9 as Vn,aa as ci,ab as Kt,ac as rt,ad as Wt,ae as Sn,af as Ht,D as Tt,c as Et,F as tn,ag as Mn,ah as ca,ai as nn,aj as qt,e as Ct,ak as la,P as un,K as fa,B as Ar,al as ua,j as pt,am as da,an as Cn,ao as xt,ap as mn,aq as ei,ar as rn,as as an,at as Rr,au as pa,av as Vt,aw as Gt,ax as Tn,z as xn,h as tt,ay as Ot,az as Nt,aA as _n,aB as ha,aC as ma,aD as Jt,aE as _a,aF as ga,aG as va,aH as Ea,aI as Sa,aJ as Ma,aK as Ta,aL as xa,aM as Aa,aN as Ra,aO as ba,aP as Ca,aQ as wa,aR as Pa,aS as La,aT as br,aU as Cr,aV as wr,aW as dn,aX as Qt,aY as Pr,aZ as Yt,a_ as Ua,a$ as ya,b0 as Da,b1 as Ia,b2 as Lr,b3 as Na,b4 as Fa,b5 as Oa,i as Ba,b6 as Be,b7 as Ga,b8 as Ha,b9 as Va,ba as Ur,bb as bt,bc as gn,bd as yr,be as Dr,bf as Ir,_ as Nr,bg as ka,bh as za,bi as Wa,bj as Xa,bk as Fr,bl as Bt,bm as Ya,bn as Ka,bo as qa,bp as Or,bq as $a,br as Br,bs as Gr,bt as wn,bu as Pn,bv as Ln,bw as Un,bx as Ke,by as li,bz as fi,bA as ui,bB as di,bC as pi,bD as hi,bE as mi,bF as _i,bG as gi,bH as vi,bI as Ei,bJ as Si,bK as Mi,bL as Ti,bM as xi,bN as Ai,bO as Ri,bP as bi,bQ as Ci,bR as wi,bS as Pi,bT as Li,bU as Ui,bV as yi,bW as Di,bX as Ii,bY as Ni,bZ as Fi,b_ as kn,b$ as zn,c0 as Wn,c1 as Xn,c2 as Yn,c3 as Kn,c4 as qn,c5 as Za,c6 as Oi,c7 as Ja,c8 as pn,c9 as Qa,ca as Bi,cb as Gi,cc as Hi,cd as $n,ce as Zn,cf as ja,cg as Hr,ch as eo,ci as to,cj as no,ck as Vr,cl as Vi,E as kr,cm as ki,cn as zr,co as io,cp as ro,cq as ao,cr as zi,cs as ut,ct as oo,cu as so,cv as co,cw as lo,cx as fo,A as uo,cy as po,cz as ho,cA as mo,cB as _o,cC as go,cD as vo,cE as Eo,cF as So,cG as Mo,cH as To,cI as xo,cJ as Ao,g as Ro,Q as Wr,cK as yn,cL as bo,M as Jn,cM as Co,cN as vn,cO as wo,S as Qn,cP as Po,b as Xr,cQ as Lo,cR as Uo,cS as yo}from"./three.core-th-Yed6l.js";/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Yr(){let e=null,t=!1,n=null,i=null;function a(r,o){n(r,o),i=e.requestAnimationFrame(a)}return{start:function(){t!==!0&&n!==null&&(i=e.requestAnimationFrame(a),t=!0)},stop:function(){e.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){n=r},setContext:function(r){e=r}}}function Do(e){const t=new WeakMap;function n(s,d){const v=s.array,T=s.usage,p=v.byteLength,m=e.createBuffer();e.bindBuffer(d,m),e.bufferData(d,v,T),s.onUploadCallback();let E;if(v instanceof Float32Array)E=e.FLOAT;else if(typeof Float16Array<"u"&&v instanceof Float16Array)E=e.HALF_FLOAT;else if(v instanceof Uint16Array)s.isFloat16BufferAttribute?E=e.HALF_FLOAT:E=e.UNSIGNED_SHORT;else if(v instanceof Int16Array)E=e.SHORT;else if(v instanceof Uint32Array)E=e.UNSIGNED_INT;else if(v instanceof Int32Array)E=e.INT;else if(v instanceof Int8Array)E=e.BYTE;else if(v instanceof Uint8Array)E=e.UNSIGNED_BYTE;else if(v instanceof Uint8ClampedArray)E=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+v);return{buffer:m,type:E,bytesPerElement:v.BYTES_PER_ELEMENT,version:s.version,size:p}}function i(s,d,v){const T=d.array,p=d.updateRanges;if(e.bindBuffer(v,s),p.length===0)e.bufferSubData(v,0,T);else{p.sort((E,C)=>E.start-C.start);let m=0;for(let E=1;E<p.length;E++){const C=p[m],x=p[E];x.start<=C.start+C.count+1?C.count=Math.max(C.count,x.start+x.count-C.start):(++m,p[m]=x)}p.length=m+1;for(let E=0,C=p.length;E<C;E++){const x=p[E];e.bufferSubData(v,x.start*T.BYTES_PER_ELEMENT,T,x.start,x.count)}d.clearUpdateRanges()}d.onUploadCallback()}function a(s){return s.isInterleavedBufferAttribute&&(s=s.data),t.get(s)}function r(s){s.isInterleavedBufferAttribute&&(s=s.data);const d=t.get(s);d&&(e.deleteBuffer(d.buffer),t.delete(s))}function o(s,d){if(s.isInterleavedBufferAttribute&&(s=s.data),s.isGLBufferAttribute){const T=t.get(s);(!T||T.version<s.version)&&t.set(s,{buffer:s.buffer,type:s.type,bytesPerElement:s.elementSize,version:s.version});return}const v=t.get(s);if(v===void 0)t.set(s,n(s,d));else if(v.version<s.version){if(v.size!==s.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(v.buffer,s,d),v.version=s.version}}return{get:a,remove:r,update:o}}var Io=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,No=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Fo=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Oo=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Bo=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Go=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ho=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Vo=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ko=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,zo=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Wo=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Xo=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Yo=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ko=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,qo=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$o=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Zo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Qo=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jo=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,es=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,ts=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,ns=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,is=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,rs=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,as=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,os=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ss=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,cs=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ls=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,fs="gl_FragColor = linearToOutputTexel( gl_FragColor );",us=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ds=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ps=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,hs=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ms=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,_s=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,gs=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,vs=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Es=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ss=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ms=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ts=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,xs=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,As=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Rs=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,bs=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Cs=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ws=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ps=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ls=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Us=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,ys=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Ds=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Is=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ns=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Fs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Os=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bs=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gs=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Hs=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Vs=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ks=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,zs=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ws=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Xs=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ys=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ks=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,qs=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$s=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Zs=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Js=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Qs=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,js=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ec=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,tc=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,nc=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,ic=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,rc=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ac=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,oc=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,sc=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,cc=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,lc=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fc=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,uc=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dc=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,pc=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,hc=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mc=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,_c=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,gc=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,vc=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Ec=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Sc=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Mc=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tc=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,xc=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ac=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Rc=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,bc=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Cc=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,wc=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Pc=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Lc=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Uc=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,yc=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Dc=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ic=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Nc=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Fc=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Oc=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Bc=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gc=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Hc=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Vc=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,kc=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,zc=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Wc=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Xc=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Yc=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Kc=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,qc=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$c=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zc=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jc=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Qc=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jc=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,el=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,tl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,il=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,rl=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,al=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ol=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sl=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,cl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ll=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fl=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ul=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,dl=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,De={alphahash_fragment:Io,alphahash_pars_fragment:No,alphamap_fragment:Fo,alphamap_pars_fragment:Oo,alphatest_fragment:Bo,alphatest_pars_fragment:Go,aomap_fragment:Ho,aomap_pars_fragment:Vo,batching_pars_vertex:ko,batching_vertex:zo,begin_vertex:Wo,beginnormal_vertex:Xo,bsdfs:Yo,iridescence_fragment:Ko,bumpmap_pars_fragment:qo,clipping_planes_fragment:$o,clipping_planes_pars_fragment:Zo,clipping_planes_pars_vertex:Jo,clipping_planes_vertex:Qo,color_fragment:jo,color_pars_fragment:es,color_pars_vertex:ts,color_vertex:ns,common:is,cube_uv_reflection_fragment:rs,defaultnormal_vertex:as,displacementmap_pars_vertex:os,displacementmap_vertex:ss,emissivemap_fragment:cs,emissivemap_pars_fragment:ls,colorspace_fragment:fs,colorspace_pars_fragment:us,envmap_fragment:ds,envmap_common_pars_fragment:ps,envmap_pars_fragment:hs,envmap_pars_vertex:ms,envmap_physical_pars_fragment:bs,envmap_vertex:_s,fog_vertex:gs,fog_pars_vertex:vs,fog_fragment:Es,fog_pars_fragment:Ss,gradientmap_pars_fragment:Ms,lightmap_pars_fragment:Ts,lights_lambert_fragment:xs,lights_lambert_pars_fragment:As,lights_pars_begin:Rs,lights_toon_fragment:Cs,lights_toon_pars_fragment:ws,lights_phong_fragment:Ps,lights_phong_pars_fragment:Ls,lights_physical_fragment:Us,lights_physical_pars_fragment:ys,lights_fragment_begin:Ds,lights_fragment_maps:Is,lights_fragment_end:Ns,logdepthbuf_fragment:Fs,logdepthbuf_pars_fragment:Os,logdepthbuf_pars_vertex:Bs,logdepthbuf_vertex:Gs,map_fragment:Hs,map_pars_fragment:Vs,map_particle_fragment:ks,map_particle_pars_fragment:zs,metalnessmap_fragment:Ws,metalnessmap_pars_fragment:Xs,morphinstance_vertex:Ys,morphcolor_vertex:Ks,morphnormal_vertex:qs,morphtarget_pars_vertex:$s,morphtarget_vertex:Zs,normal_fragment_begin:Js,normal_fragment_maps:Qs,normal_pars_fragment:js,normal_pars_vertex:ec,normal_vertex:tc,normalmap_pars_fragment:nc,clearcoat_normal_fragment_begin:ic,clearcoat_normal_fragment_maps:rc,clearcoat_pars_fragment:ac,iridescence_pars_fragment:oc,opaque_fragment:sc,packing:cc,premultiplied_alpha_fragment:lc,project_vertex:fc,dithering_fragment:uc,dithering_pars_fragment:dc,roughnessmap_fragment:pc,roughnessmap_pars_fragment:hc,shadowmap_pars_fragment:mc,shadowmap_pars_vertex:_c,shadowmap_vertex:gc,shadowmask_pars_fragment:vc,skinbase_vertex:Ec,skinning_pars_vertex:Sc,skinning_vertex:Mc,skinnormal_vertex:Tc,specularmap_fragment:xc,specularmap_pars_fragment:Ac,tonemapping_fragment:Rc,tonemapping_pars_fragment:bc,transmission_fragment:Cc,transmission_pars_fragment:wc,uv_pars_fragment:Pc,uv_pars_vertex:Lc,uv_vertex:Uc,worldpos_vertex:yc,background_vert:Dc,background_frag:Ic,backgroundCube_vert:Nc,backgroundCube_frag:Fc,cube_vert:Oc,cube_frag:Bc,depth_vert:Gc,depth_frag:Hc,distanceRGBA_vert:Vc,distanceRGBA_frag:kc,equirect_vert:zc,equirect_frag:Wc,linedashed_vert:Xc,linedashed_frag:Yc,meshbasic_vert:Kc,meshbasic_frag:qc,meshlambert_vert:$c,meshlambert_frag:Zc,meshmatcap_vert:Jc,meshmatcap_frag:Qc,meshnormal_vert:jc,meshnormal_frag:el,meshphong_vert:tl,meshphong_frag:nl,meshphysical_vert:il,meshphysical_frag:rl,meshtoon_vert:al,meshtoon_frag:ol,points_vert:sl,points_frag:cl,shadow_vert:ll,shadow_frag:fl,sprite_vert:ul,sprite_frag:dl},ie={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Mt={basic:{uniforms:ut([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.fog]),vertexShader:De.meshbasic_vert,fragmentShader:De.meshbasic_frag},lambert:{uniforms:ut([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new qe(0)}}]),vertexShader:De.meshlambert_vert,fragmentShader:De.meshlambert_frag},phong:{uniforms:ut([ie.common,ie.specularmap,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,ie.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30}}]),vertexShader:De.meshphong_vert,fragmentShader:De.meshphong_frag},standard:{uniforms:ut([ie.common,ie.envmap,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.roughnessmap,ie.metalnessmap,ie.fog,ie.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:De.meshphysical_vert,fragmentShader:De.meshphysical_frag},toon:{uniforms:ut([ie.common,ie.aomap,ie.lightmap,ie.emissivemap,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.gradientmap,ie.fog,ie.lights,{emissive:{value:new qe(0)}}]),vertexShader:De.meshtoon_vert,fragmentShader:De.meshtoon_frag},matcap:{uniforms:ut([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,ie.fog,{matcap:{value:null}}]),vertexShader:De.meshmatcap_vert,fragmentShader:De.meshmatcap_frag},points:{uniforms:ut([ie.points,ie.fog]),vertexShader:De.points_vert,fragmentShader:De.points_frag},dashed:{uniforms:ut([ie.common,ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:De.linedashed_vert,fragmentShader:De.linedashed_frag},depth:{uniforms:ut([ie.common,ie.displacementmap]),vertexShader:De.depth_vert,fragmentShader:De.depth_frag},normal:{uniforms:ut([ie.common,ie.bumpmap,ie.normalmap,ie.displacementmap,{opacity:{value:1}}]),vertexShader:De.meshnormal_vert,fragmentShader:De.meshnormal_frag},sprite:{uniforms:ut([ie.sprite,ie.fog]),vertexShader:De.sprite_vert,fragmentShader:De.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:De.background_vert,fragmentShader:De.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:De.backgroundCube_vert,fragmentShader:De.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:De.cube_vert,fragmentShader:De.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:De.equirect_vert,fragmentShader:De.equirect_frag},distanceRGBA:{uniforms:ut([ie.common,ie.displacementmap,{referencePosition:{value:new Fe},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:De.distanceRGBA_vert,fragmentShader:De.distanceRGBA_frag},shadow:{uniforms:ut([ie.lights,ie.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:De.shadow_vert,fragmentShader:De.shadow_frag}};Mt.physical={uniforms:ut([Mt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:De.meshphysical_vert,fragmentShader:De.meshphysical_frag};const cn={r:0,b:0,g:0},yt=new kr,pl=new At;function hl(e,t,n,i,a,r,o){const s=new qe(0);let d=r===!0?0:1,v,T,p=null,m=0,E=null;function C(P){let S=P.isScene===!0?P.background:null;return S&&S.isTexture&&(S=(P.backgroundBlurriness>0?n:t).get(S)),S}function x(P){let S=!1;const y=C(P);y===null?c(s,d):y&&y.isColor&&(c(y,1),S=!0);const R=e.xr.getEnvironmentBlendMode();R==="additive"?i.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(e.autoClear||S)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function f(P,S){const y=C(S);y&&(y.isCubeTexture||y.mapping===Tn)?(T===void 0&&(T=new Ct(new Ar(1,1,1),new Vt({name:"BackgroundCubeMaterial",uniforms:Vi(Mt.backgroundCube.uniforms),vertexShader:Mt.backgroundCube.vertexShader,fragmentShader:Mt.backgroundCube.fragmentShader,side:Et,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),T.geometry.deleteAttribute("normal"),T.geometry.deleteAttribute("uv"),T.onBeforeRender=function(R,I,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(T.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(T)),yt.copy(S.backgroundRotation),yt.x*=-1,yt.y*=-1,yt.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(yt.y*=-1,yt.z*=-1),T.material.uniforms.envMap.value=y,T.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,T.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,T.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,T.material.uniforms.backgroundRotation.value.setFromMatrix4(pl.makeRotationFromEuler(yt)),T.material.toneMapped=rt.getTransfer(y.colorSpace)!==Ke,(p!==y||m!==y.version||E!==e.toneMapping)&&(T.material.needsUpdate=!0,p=y,m=y.version,E=e.toneMapping),T.layers.enableAll(),P.unshift(T,T.geometry,T.material,0,0,null)):y&&y.isTexture&&(v===void 0&&(v=new Ct(new Nr(2,2),new Vt({name:"BackgroundMaterial",uniforms:Vi(Mt.background.uniforms),vertexShader:Mt.background.vertexShader,fragmentShader:Mt.background.fragmentShader,side:tn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),v.geometry.deleteAttribute("normal"),Object.defineProperty(v.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(v)),v.material.uniforms.t2D.value=y,v.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,v.material.toneMapped=rt.getTransfer(y.colorSpace)!==Ke,y.matrixAutoUpdate===!0&&y.updateMatrix(),v.material.uniforms.uvTransform.value.copy(y.matrix),(p!==y||m!==y.version||E!==e.toneMapping)&&(v.material.needsUpdate=!0,p=y,m=y.version,E=e.toneMapping),v.layers.enableAll(),P.unshift(v,v.geometry,v.material,0,0,null))}function c(P,S){P.getRGB(cn,Vr(e)),i.buffers.color.setClear(cn.r,cn.g,cn.b,S,o)}function U(){T!==void 0&&(T.geometry.dispose(),T.material.dispose(),T=void 0),v!==void 0&&(v.geometry.dispose(),v.material.dispose(),v=void 0)}return{getClearColor:function(){return s},setClearColor:function(P,S=1){s.set(P),d=S,c(s,d)},getClearAlpha:function(){return d},setClearAlpha:function(P){d=P,c(s,d)},render:x,addToRenderList:f,dispose:U}}function ml(e,t){const n=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},a=m(null);let r=a,o=!1;function s(h,b,B,Y,K){let z=!1;const W=p(Y,B,b);r!==W&&(r=W,v(r.object)),z=E(h,Y,B,K),z&&C(h,Y,B,K),K!==null&&t.update(K,e.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,S(h,b,B,Y),K!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(K).buffer))}function d(){return e.createVertexArray()}function v(h){return e.bindVertexArray(h)}function T(h){return e.deleteVertexArray(h)}function p(h,b,B){const Y=B.wireframe===!0;let K=i[h.id];K===void 0&&(K={},i[h.id]=K);let z=K[b.id];z===void 0&&(z={},K[b.id]=z);let W=z[Y];return W===void 0&&(W=m(d()),z[Y]=W),W}function m(h){const b=[],B=[],Y=[];for(let K=0;K<n;K++)b[K]=0,B[K]=0,Y[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:B,attributeDivisors:Y,object:h,attributes:{},index:null}}function E(h,b,B,Y){const K=r.attributes,z=b.attributes;let W=0;const ee=B.getAttributes();for(const V in ee)if(ee[V].location>=0){const Te=K[V];let Ue=z[V];if(Ue===void 0&&(V==="instanceMatrix"&&h.instanceMatrix&&(Ue=h.instanceMatrix),V==="instanceColor"&&h.instanceColor&&(Ue=h.instanceColor)),Te===void 0||Te.attribute!==Ue||Ue&&Te.data!==Ue.data)return!0;W++}return r.attributesNum!==W||r.index!==Y}function C(h,b,B,Y){const K={},z=b.attributes;let W=0;const ee=B.getAttributes();for(const V in ee)if(ee[V].location>=0){let Te=z[V];Te===void 0&&(V==="instanceMatrix"&&h.instanceMatrix&&(Te=h.instanceMatrix),V==="instanceColor"&&h.instanceColor&&(Te=h.instanceColor));const Ue={};Ue.attribute=Te,Te&&Te.data&&(Ue.data=Te.data),K[V]=Ue,W++}r.attributes=K,r.attributesNum=W,r.index=Y}function x(){const h=r.newAttributes;for(let b=0,B=h.length;b<B;b++)h[b]=0}function f(h){c(h,0)}function c(h,b){const B=r.newAttributes,Y=r.enabledAttributes,K=r.attributeDivisors;B[h]=1,Y[h]===0&&(e.enableVertexAttribArray(h),Y[h]=1),K[h]!==b&&(e.vertexAttribDivisor(h,b),K[h]=b)}function U(){const h=r.newAttributes,b=r.enabledAttributes;for(let B=0,Y=b.length;B<Y;B++)b[B]!==h[B]&&(e.disableVertexAttribArray(B),b[B]=0)}function P(h,b,B,Y,K,z,W){W===!0?e.vertexAttribIPointer(h,b,B,K,z):e.vertexAttribPointer(h,b,B,Y,K,z)}function S(h,b,B,Y){x();const K=Y.attributes,z=B.getAttributes(),W=b.defaultAttributeValues;for(const ee in z){const V=z[ee];if(V.location>=0){let ge=K[ee];if(ge===void 0&&(ee==="instanceMatrix"&&h.instanceMatrix&&(ge=h.instanceMatrix),ee==="instanceColor"&&h.instanceColor&&(ge=h.instanceColor)),ge!==void 0){const Te=ge.normalized,Ue=ge.itemSize,He=t.get(ge);if(He===void 0)continue;const nt=He.buffer,je=He.type,ze=He.bytesPerElement,k=je===e.INT||je===e.UNSIGNED_INT||ge.gpuType===Fr;if(ge.isInterleavedBufferAttribute){const $=ge.data,le=$.stride,Ce=ge.offset;if($.isInstancedInterleavedBuffer){for(let Ee=0;Ee<V.locationSize;Ee++)c(V.location+Ee,$.meshPerAttribute);h.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let Ee=0;Ee<V.locationSize;Ee++)f(V.location+Ee);e.bindBuffer(e.ARRAY_BUFFER,nt);for(let Ee=0;Ee<V.locationSize;Ee++)P(V.location+Ee,Ue/V.locationSize,je,Te,le*ze,(Ce+Ue/V.locationSize*Ee)*ze,k)}else{if(ge.isInstancedBufferAttribute){for(let $=0;$<V.locationSize;$++)c(V.location+$,ge.meshPerAttribute);h.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let $=0;$<V.locationSize;$++)f(V.location+$);e.bindBuffer(e.ARRAY_BUFFER,nt);for(let $=0;$<V.locationSize;$++)P(V.location+$,Ue/V.locationSize,je,Te,Ue*ze,Ue/V.locationSize*$*ze,k)}}else if(W!==void 0){const Te=W[ee];if(Te!==void 0)switch(Te.length){case 2:e.vertexAttrib2fv(V.location,Te);break;case 3:e.vertexAttrib3fv(V.location,Te);break;case 4:e.vertexAttrib4fv(V.location,Te);break;default:e.vertexAttrib1fv(V.location,Te)}}}}U()}function y(){O();for(const h in i){const b=i[h];for(const B in b){const Y=b[B];for(const K in Y)T(Y[K].object),delete Y[K];delete b[B]}delete i[h]}}function R(h){if(i[h.id]===void 0)return;const b=i[h.id];for(const B in b){const Y=b[B];for(const K in Y)T(Y[K].object),delete Y[K];delete b[B]}delete i[h.id]}function I(h){for(const b in i){const B=i[b];if(B[h.id]===void 0)continue;const Y=B[h.id];for(const K in Y)T(Y[K].object),delete Y[K];delete B[h.id]}}function O(){g(),o=!0,r!==a&&(r=a,v(r.object))}function g(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:s,reset:O,resetDefaultState:g,dispose:y,releaseStatesOfGeometry:R,releaseStatesOfProgram:I,initAttributes:x,enableAttribute:f,disableUnusedAttributes:U}}function _l(e,t,n){let i;function a(v){i=v}function r(v,T){e.drawArrays(i,v,T),n.update(T,i,1)}function o(v,T,p){p!==0&&(e.drawArraysInstanced(i,v,T,p),n.update(T,i,p))}function s(v,T,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,v,0,T,0,p);let E=0;for(let C=0;C<p;C++)E+=T[C];n.update(E,i,1)}function d(v,T,p,m){if(p===0)return;const E=t.get("WEBGL_multi_draw");if(E===null)for(let C=0;C<v.length;C++)o(v[C],T[C],m[C]);else{E.multiDrawArraysInstancedWEBGL(i,v,0,T,0,m,0,p);let C=0;for(let x=0;x<p;x++)C+=T[x]*m[x];n.update(C,i,1)}}this.setMode=a,this.render=r,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=d}function gl(e,t,n,i){let a;function r(){if(a!==void 0)return a;if(t.has("EXT_texture_filter_anisotropic")===!0){const I=t.get("EXT_texture_filter_anisotropic");a=e.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function o(I){return!(I!==xt&&i.convert(I)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function s(I){const O=I===Sn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(I!==Ht&&i.convert(I)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&I!==Bt&&!O)}function d(I){if(I==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let v=n.precision!==void 0?n.precision:"highp";const T=d(v);T!==v&&(console.warn("THREE.WebGLRenderer:",v,"not supported, using",T,"instead."),v=T);const p=n.logarithmicDepthBuffer===!0,m=n.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),E=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),C=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=e.getParameter(e.MAX_TEXTURE_SIZE),f=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),c=e.getParameter(e.MAX_VERTEX_ATTRIBS),U=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),P=e.getParameter(e.MAX_VARYING_VECTORS),S=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),y=C>0,R=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:d,textureFormatReadable:o,textureTypeReadable:s,precision:v,logarithmicDepthBuffer:p,reversedDepthBuffer:m,maxTextures:E,maxVertexTextures:C,maxTextureSize:x,maxCubemapSize:f,maxAttributes:c,maxVertexUniforms:U,maxVaryings:P,maxFragmentUniforms:S,vertexTextures:y,maxSamples:R}}function vl(e){const t=this;let n=null,i=0,a=!1,r=!1;const o=new Ba,s=new Be,d={value:null,needsUpdate:!1};this.uniform=d,this.numPlanes=0,this.numIntersection=0,this.init=function(p,m){const E=p.length!==0||m||i!==0||a;return a=m,i=p.length,E},this.beginShadows=function(){r=!0,T(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(p,m){n=T(p,m,0)},this.setState=function(p,m,E){const C=p.clippingPlanes,x=p.clipIntersection,f=p.clipShadows,c=e.get(p);if(!a||C===null||C.length===0||r&&!f)r?T(null):v();else{const U=r?0:i,P=U*4;let S=c.clippingState||null;d.value=S,S=T(C,m,P,E);for(let y=0;y!==P;++y)S[y]=n[y];c.clippingState=S,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=U}};function v(){d.value!==n&&(d.value=n,d.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function T(p,m,E,C){const x=p!==null?p.length:0;let f=null;if(x!==0){if(f=d.value,C!==!0||f===null){const c=E+x*4,U=m.matrixWorldInverse;s.getNormalMatrix(U),(f===null||f.length<c)&&(f=new Float32Array(c));for(let P=0,S=E;P!==x;++P,S+=4)o.copy(p[P]).applyMatrix4(U,s),o.normal.toArray(f,S),f[S+3]=o.constant}d.value=f,d.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,f}}function El(e){let t=new WeakMap;function n(o,s){return s===$n?o.mapping=nn:s===Zn&&(o.mapping=qt),o}function i(o){if(o&&o.isTexture){const s=o.mapping;if(s===$n||s===Zn)if(t.has(o)){const d=t.get(o).texture;return n(d,o.mapping)}else{const d=o.image;if(d&&d.height>0){const v=new ja(d.height);return v.fromEquirectangularTexture(e,o),t.set(o,v),o.addEventListener("dispose",a),n(v.texture,o.mapping)}else return null}}return o}function a(o){const s=o.target;s.removeEventListener("dispose",a);const d=t.get(s);d!==void 0&&(t.delete(s),d.dispose())}function r(){t=new WeakMap}return{get:i,dispose:r}}const Xt=4,Wi=[.125,.215,.35,.446,.526,.582],Ft=20,Dn=new la,Xi=new qe;let In=null,Nn=0,Fn=0,On=!1;const It=(1+Math.sqrt(5))/2,zt=1/It,Yi=[new Fe(-It,zt,0),new Fe(It,zt,0),new Fe(-zt,0,It),new Fe(zt,0,It),new Fe(0,It,-zt),new Fe(0,It,zt),new Fe(-1,1,-1),new Fe(1,1,-1),new Fe(-1,1,1),new Fe(1,1,1)],Sl=new Fe;class Ki{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,n=0,i=.1,a=100,r={}){const{size:o=256,position:s=Sl}=r;In=this._renderer.getRenderTarget(),Nn=this._renderer.getActiveCubeFace(),Fn=this._renderer.getActiveMipmapLevel(),On=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const d=this._allocateTargets();return d.depthBuffer=!0,this._sceneToCubeUV(t,i,a,d,s),n>0&&this._blur(d,0,0,n),this._applyPMREM(d),this._cleanup(d),d}fromEquirectangular(t,n=null){return this._fromTexture(t,n)}fromCubemap(t,n=null){return this._fromTexture(t,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Zi(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=$i(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(In,Nn,Fn),this._renderer.xr.enabled=On,t.scissorTest=!1,ln(t,0,0,t.width,t.height)}_fromTexture(t,n){t.mapping===nn||t.mapping===qt?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),In=this._renderer.getRenderTarget(),Nn=this._renderer.getActiveCubeFace(),Fn=this._renderer.getActiveMipmapLevel(),On=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Ot,minFilter:Ot,generateMipmaps:!1,type:Sn,format:xt,colorSpace:Mn,depthBuffer:!1},a=qi(t,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=qi(t,n,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Ml(r)),this._blurMaterial=Tl(r,t,n)}return a}_compileMaterial(t){const n=new Ct(this._lodPlanes[0],t);this._renderer.compile(n,Dn)}_sceneToCubeUV(t,n,i,a,r){const d=new un(90,1,n,i),v=[1,-1,1,1,1,1],T=[1,1,1,-1,-1,-1],p=this._renderer,m=p.autoClear,E=p.toneMapping;p.getClearColor(Xi),p.toneMapping=Pt,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(a),p.clearDepth(),p.setRenderTarget(null));const x=new fa({name:"PMREM.Background",side:Et,depthWrite:!1,depthTest:!1}),f=new Ct(new Ar,x);let c=!1;const U=t.background;U?U.isColor&&(x.color.copy(U),t.background=null,c=!0):(x.color.copy(Xi),c=!0);for(let P=0;P<6;P++){const S=P%3;S===0?(d.up.set(0,v[P],0),d.position.set(r.x,r.y,r.z),d.lookAt(r.x+T[P],r.y,r.z)):S===1?(d.up.set(0,0,v[P]),d.position.set(r.x,r.y,r.z),d.lookAt(r.x,r.y+T[P],r.z)):(d.up.set(0,v[P],0),d.position.set(r.x,r.y,r.z),d.lookAt(r.x,r.y,r.z+T[P]));const y=this._cubeSize;ln(a,S*y,P>2?y:0,y,y),p.setRenderTarget(a),c&&p.render(f,d),p.render(t,d)}f.geometry.dispose(),f.material.dispose(),p.toneMapping=E,p.autoClear=m,t.background=U}_textureToCubeUV(t,n){const i=this._renderer,a=t.mapping===nn||t.mapping===qt;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=Zi()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=$i());const r=a?this._cubemapMaterial:this._equirectMaterial,o=new Ct(this._lodPlanes[0],r),s=r.uniforms;s.envMap.value=t;const d=this._cubeSize;ln(n,0,0,3*d,2*d),i.setRenderTarget(n),i.render(o,Dn)}_applyPMREM(t){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const a=this._lodPlanes.length;for(let r=1;r<a;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),s=Yi[(a-r-1)%Yi.length];this._blur(t,r-1,r,o,s)}n.autoClear=i}_blur(t,n,i,a,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,n,i,a,"latitudinal",r),this._halfBlur(o,t,i,i,a,"longitudinal",r)}_halfBlur(t,n,i,a,r,o,s){const d=this._renderer,v=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const T=3,p=new Ct(this._lodPlanes[a],v),m=v.uniforms,E=this._sizeLods[i]-1,C=isFinite(r)?Math.PI/(2*E):2*Math.PI/(2*Ft-1),x=r/C,f=isFinite(r)?1+Math.floor(T*x):Ft;f>Ft&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${f} samples when the maximum is set to ${Ft}`);const c=[];let U=0;for(let I=0;I<Ft;++I){const O=I/x,g=Math.exp(-O*O/2);c.push(g),I===0?U+=g:I<f&&(U+=2*g)}for(let I=0;I<c.length;I++)c[I]=c[I]/U;m.envMap.value=t.texture,m.samples.value=f,m.weights.value=c,m.latitudinal.value=o==="latitudinal",s&&(m.poleAxis.value=s);const{_lodMax:P}=this;m.dTheta.value=C,m.mipInt.value=P-i;const S=this._sizeLods[a],y=3*S*(a>P-Xt?a-P+Xt:0),R=4*(this._cubeSize-S);ln(n,y,R,3*S,2*S),d.setRenderTarget(n),d.render(p,Dn)}}function Ml(e){const t=[],n=[],i=[];let a=e;const r=e-Xt+1+Wi.length;for(let o=0;o<r;o++){const s=Math.pow(2,a);n.push(s);let d=1/s;o>e-Xt?d=Wi[o-e+Xt-1]:o===0&&(d=0),i.push(d);const v=1/(s-2),T=-v,p=1+v,m=[T,T,p,T,p,p,T,T,p,p,T,p],E=6,C=6,x=3,f=2,c=1,U=new Float32Array(x*C*E),P=new Float32Array(f*C*E),S=new Float32Array(c*C*E);for(let R=0;R<E;R++){const I=R%3*2/3-1,O=R>2?0:-1,g=[I,O,0,I+2/3,O,0,I+2/3,O+1,0,I,O,0,I+2/3,O+1,0,I,O+1,0];U.set(g,x*C*R),P.set(m,f*C*R);const h=[R,R,R,R,R,R];S.set(h,c*C*R)}const y=new xn;y.setAttribute("position",new tt(U,x)),y.setAttribute("uv",new tt(P,f)),y.setAttribute("faceIndex",new tt(S,c)),t.push(y),a>Xt&&a--}return{lodPlanes:t,sizeLods:n,sigmas:i}}function qi(e,t,n){const i=new Kt(e,t,n);return i.texture.mapping=Tn,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ln(e,t,n,i,a){e.viewport.set(t,n,i,a),e.scissor.set(t,n,i,a)}function Tl(e,t,n){const i=new Float32Array(Ft),a=new Fe(0,1,0);return new Vt({name:"SphericalGaussianBlur",defines:{n:Ft,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:ti(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Gt,depthTest:!1,depthWrite:!1})}function $i(){return new Vt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ti(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Gt,depthTest:!1,depthWrite:!1})}function Zi(){return new Vt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ti(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Gt,depthTest:!1,depthWrite:!1})}function ti(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function xl(e){let t=new WeakMap,n=null;function i(s){if(s&&s.isTexture){const d=s.mapping,v=d===$n||d===Zn,T=d===nn||d===qt;if(v||T){let p=t.get(s);const m=p!==void 0?p.texture.pmremVersion:0;if(s.isRenderTargetTexture&&s.pmremVersion!==m)return n===null&&(n=new Ki(e)),p=v?n.fromEquirectangular(s,p):n.fromCubemap(s,p),p.texture.pmremVersion=s.pmremVersion,t.set(s,p),p.texture;if(p!==void 0)return p.texture;{const E=s.image;return v&&E&&E.height>0||T&&E&&a(E)?(n===null&&(n=new Ki(e)),p=v?n.fromEquirectangular(s):n.fromCubemap(s),p.texture.pmremVersion=s.pmremVersion,t.set(s,p),s.addEventListener("dispose",r),p.texture):null}}}return s}function a(s){let d=0;const v=6;for(let T=0;T<v;T++)s[T]!==void 0&&d++;return d===v}function r(s){const d=s.target;d.removeEventListener("dispose",r);const v=t.get(d);v!==void 0&&(t.delete(d),v.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:i,dispose:o}}function Al(e){const t={};function n(i){if(t[i]!==void 0)return t[i];let a;switch(i){case"WEBGL_depth_texture":a=e.getExtension("WEBGL_depth_texture")||e.getExtension("MOZ_WEBGL_depth_texture")||e.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=e.getExtension("EXT_texture_filter_anisotropic")||e.getExtension("MOZ_EXT_texture_filter_anisotropic")||e.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=e.getExtension("WEBGL_compressed_texture_s3tc")||e.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=e.getExtension("WEBGL_compressed_texture_pvrtc")||e.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=e.getExtension(i)}return t[i]=a,a}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const a=n(i);return a===null&&Vn("THREE.WebGLRenderer: "+i+" extension not supported."),a}}}function Rl(e,t,n,i){const a={},r=new WeakMap;function o(p){const m=p.target;m.index!==null&&t.remove(m.index);for(const C in m.attributes)t.remove(m.attributes[C]);m.removeEventListener("dispose",o),delete a[m.id];const E=r.get(m);E&&(t.remove(E),r.delete(m)),i.releaseStatesOfGeometry(m),m.isInstancedBufferGeometry===!0&&delete m._maxInstanceCount,n.memory.geometries--}function s(p,m){return a[m.id]===!0||(m.addEventListener("dispose",o),a[m.id]=!0,n.memory.geometries++),m}function d(p){const m=p.attributes;for(const E in m)t.update(m[E],e.ARRAY_BUFFER)}function v(p){const m=[],E=p.index,C=p.attributes.position;let x=0;if(E!==null){const U=E.array;x=E.version;for(let P=0,S=U.length;P<S;P+=3){const y=U[P+0],R=U[P+1],I=U[P+2];m.push(y,R,R,I,I,y)}}else if(C!==void 0){const U=C.array;x=C.version;for(let P=0,S=U.length/3-1;P<S;P+=3){const y=P+0,R=P+1,I=P+2;m.push(y,R,R,I,I,y)}}else return;const f=new(ao(m)?io:ro)(m,1);f.version=x;const c=r.get(p);c&&t.remove(c),r.set(p,f)}function T(p){const m=r.get(p);if(m){const E=p.index;E!==null&&m.version<E.version&&v(p)}else v(p);return r.get(p)}return{get:s,update:d,getWireframeAttribute:T}}function bl(e,t,n){let i;function a(m){i=m}let r,o;function s(m){r=m.type,o=m.bytesPerElement}function d(m,E){e.drawElements(i,E,r,m*o),n.update(E,i,1)}function v(m,E,C){C!==0&&(e.drawElementsInstanced(i,E,r,m*o,C),n.update(E,i,C))}function T(m,E,C){if(C===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,E,0,r,m,0,C);let f=0;for(let c=0;c<C;c++)f+=E[c];n.update(f,i,1)}function p(m,E,C,x){if(C===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let c=0;c<m.length;c++)v(m[c]/o,E[c],x[c]);else{f.multiDrawElementsInstancedWEBGL(i,E,0,r,m,0,x,0,C);let c=0;for(let U=0;U<C;U++)c+=E[U]*x[U];n.update(c,i,1)}}this.setMode=a,this.setIndex=s,this.render=d,this.renderInstances=v,this.renderMultiDraw=T,this.renderMultiDrawInstances=p}function Cl(e){const t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,s){switch(n.calls++,o){case e.TRIANGLES:n.triangles+=s*(r/3);break;case e.LINES:n.lines+=s*(r/2);break;case e.LINE_STRIP:n.lines+=s*(r-1);break;case e.LINE_LOOP:n.lines+=s*r;break;case e.POINTS:n.points+=s*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function a(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:a,update:i}}function wl(e,t,n){const i=new WeakMap,a=new dt;function r(o,s,d){const v=o.morphTargetInfluences,T=s.morphAttributes.position||s.morphAttributes.normal||s.morphAttributes.color,p=T!==void 0?T.length:0;let m=i.get(s);if(m===void 0||m.count!==p){let g=function(){I.dispose(),i.delete(s),s.removeEventListener("dispose",g)};m!==void 0&&m.texture.dispose();const E=s.morphAttributes.position!==void 0,C=s.morphAttributes.normal!==void 0,x=s.morphAttributes.color!==void 0,f=s.morphAttributes.position||[],c=s.morphAttributes.normal||[],U=s.morphAttributes.color||[];let P=0;E===!0&&(P=1),C===!0&&(P=2),x===!0&&(P=3);let S=s.attributes.position.count*P,y=1;S>t.maxTextureSize&&(y=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);const R=new Float32Array(S*y*4*p),I=new Hr(R,S,y,p);I.type=Bt,I.needsUpdate=!0;const O=P*4;for(let h=0;h<p;h++){const b=f[h],B=c[h],Y=U[h],K=S*y*4*h;for(let z=0;z<b.count;z++){const W=z*O;E===!0&&(a.fromBufferAttribute(b,z),R[K+W+0]=a.x,R[K+W+1]=a.y,R[K+W+2]=a.z,R[K+W+3]=0),C===!0&&(a.fromBufferAttribute(B,z),R[K+W+4]=a.x,R[K+W+5]=a.y,R[K+W+6]=a.z,R[K+W+7]=0),x===!0&&(a.fromBufferAttribute(Y,z),R[K+W+8]=a.x,R[K+W+9]=a.y,R[K+W+10]=a.z,R[K+W+11]=Y.itemSize===4?a.w:1)}}m={count:p,texture:I,size:new pt(S,y)},i.set(s,m),s.addEventListener("dispose",g)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)d.getUniforms().setValue(e,"morphTexture",o.morphTexture,n);else{let E=0;for(let x=0;x<v.length;x++)E+=v[x];const C=s.morphTargetsRelative?1:1-E;d.getUniforms().setValue(e,"morphTargetBaseInfluence",C),d.getUniforms().setValue(e,"morphTargetInfluences",v)}d.getUniforms().setValue(e,"morphTargetsTexture",m.texture,n),d.getUniforms().setValue(e,"morphTargetsTextureSize",m.size)}return{update:r}}function Pl(e,t,n,i){let a=new WeakMap;function r(d){const v=i.render.frame,T=d.geometry,p=t.get(d,T);if(a.get(p)!==v&&(t.update(p),a.set(p,v)),d.isInstancedMesh&&(d.hasEventListener("dispose",s)===!1&&d.addEventListener("dispose",s),a.get(d)!==v&&(n.update(d.instanceMatrix,e.ARRAY_BUFFER),d.instanceColor!==null&&n.update(d.instanceColor,e.ARRAY_BUFFER),a.set(d,v))),d.isSkinnedMesh){const m=d.skeleton;a.get(m)!==v&&(m.update(),a.set(m,v))}return p}function o(){a=new WeakMap}function s(d){const v=d.target;v.removeEventListener("dispose",s),n.remove(v.instanceMatrix),v.instanceColor!==null&&n.remove(v.instanceColor)}return{update:r,dispose:o}}const Kr=new vo,Ji=new Rr(1,1),qr=new Hr,$r=new go,Zr=new _o,Qi=[],ji=[],er=new Float32Array(16),tr=new Float32Array(9),nr=new Float32Array(4);function $t(e,t,n){const i=e[0];if(i<=0||i>0)return e;const a=t*n;let r=Qi[a];if(r===void 0&&(r=new Float32Array(a),Qi[a]=r),t!==0){i.toArray(r,0);for(let o=1,s=0;o!==t;++o)s+=n,e[o].toArray(r,s)}return r}function at(e,t){if(e.length!==t.length)return!1;for(let n=0,i=e.length;n<i;n++)if(e[n]!==t[n])return!1;return!0}function ot(e,t){for(let n=0,i=t.length;n<i;n++)e[n]=t[n]}function An(e,t){let n=ji[t];n===void 0&&(n=new Int32Array(t),ji[t]=n);for(let i=0;i!==t;++i)n[i]=e.allocateTextureUnit();return n}function Ll(e,t){const n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ul(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(at(n,t))return;e.uniform2fv(this.addr,t),ot(n,t)}}function yl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(at(n,t))return;e.uniform3fv(this.addr,t),ot(n,t)}}function Dl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(at(n,t))return;e.uniform4fv(this.addr,t),ot(n,t)}}function Il(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(at(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),ot(n,t)}else{if(at(n,i))return;nr.set(i),e.uniformMatrix2fv(this.addr,!1,nr),ot(n,i)}}function Nl(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(at(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),ot(n,t)}else{if(at(n,i))return;tr.set(i),e.uniformMatrix3fv(this.addr,!1,tr),ot(n,i)}}function Fl(e,t){const n=this.cache,i=t.elements;if(i===void 0){if(at(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),ot(n,t)}else{if(at(n,i))return;er.set(i),e.uniformMatrix4fv(this.addr,!1,er),ot(n,i)}}function Ol(e,t){const n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Bl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(at(n,t))return;e.uniform2iv(this.addr,t),ot(n,t)}}function Gl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(at(n,t))return;e.uniform3iv(this.addr,t),ot(n,t)}}function Hl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(at(n,t))return;e.uniform4iv(this.addr,t),ot(n,t)}}function Vl(e,t){const n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function kl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(at(n,t))return;e.uniform2uiv(this.addr,t),ot(n,t)}}function zl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(at(n,t))return;e.uniform3uiv(this.addr,t),ot(n,t)}}function Wl(e,t){const n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(at(n,t))return;e.uniform4uiv(this.addr,t),ot(n,t)}}function Xl(e,t,n){const i=this.cache,a=n.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a);let r;this.type===e.SAMPLER_2D_SHADOW?(Ji.compareFunction=Lr,r=Ji):r=Kr,n.setTexture2D(t||r,a)}function Yl(e,t,n){const i=this.cache,a=n.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),n.setTexture3D(t||$r,a)}function Kl(e,t,n){const i=this.cache,a=n.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),n.setTextureCube(t||Zr,a)}function ql(e,t,n){const i=this.cache,a=n.allocateTextureUnit();i[0]!==a&&(e.uniform1i(this.addr,a),i[0]=a),n.setTexture2DArray(t||qr,a)}function $l(e){switch(e){case 5126:return Ll;case 35664:return Ul;case 35665:return yl;case 35666:return Dl;case 35674:return Il;case 35675:return Nl;case 35676:return Fl;case 5124:case 35670:return Ol;case 35667:case 35671:return Bl;case 35668:case 35672:return Gl;case 35669:case 35673:return Hl;case 5125:return Vl;case 36294:return kl;case 36295:return zl;case 36296:return Wl;case 35678:case 36198:case 36298:case 36306:case 35682:return Xl;case 35679:case 36299:case 36307:return Yl;case 35680:case 36300:case 36308:case 36293:return Kl;case 36289:case 36303:case 36311:case 36292:return ql}}function Zl(e,t){e.uniform1fv(this.addr,t)}function Jl(e,t){const n=$t(t,this.size,2);e.uniform2fv(this.addr,n)}function Ql(e,t){const n=$t(t,this.size,3);e.uniform3fv(this.addr,n)}function jl(e,t){const n=$t(t,this.size,4);e.uniform4fv(this.addr,n)}function ef(e,t){const n=$t(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function tf(e,t){const n=$t(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function nf(e,t){const n=$t(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function rf(e,t){e.uniform1iv(this.addr,t)}function af(e,t){e.uniform2iv(this.addr,t)}function of(e,t){e.uniform3iv(this.addr,t)}function sf(e,t){e.uniform4iv(this.addr,t)}function cf(e,t){e.uniform1uiv(this.addr,t)}function lf(e,t){e.uniform2uiv(this.addr,t)}function ff(e,t){e.uniform3uiv(this.addr,t)}function uf(e,t){e.uniform4uiv(this.addr,t)}function df(e,t,n){const i=this.cache,a=t.length,r=An(n,a);at(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let o=0;o!==a;++o)n.setTexture2D(t[o]||Kr,r[o])}function pf(e,t,n){const i=this.cache,a=t.length,r=An(n,a);at(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let o=0;o!==a;++o)n.setTexture3D(t[o]||$r,r[o])}function hf(e,t,n){const i=this.cache,a=t.length,r=An(n,a);at(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let o=0;o!==a;++o)n.setTextureCube(t[o]||Zr,r[o])}function mf(e,t,n){const i=this.cache,a=t.length,r=An(n,a);at(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let o=0;o!==a;++o)n.setTexture2DArray(t[o]||qr,r[o])}function _f(e){switch(e){case 5126:return Zl;case 35664:return Jl;case 35665:return Ql;case 35666:return jl;case 35674:return ef;case 35675:return tf;case 35676:return nf;case 5124:case 35670:return rf;case 35667:case 35671:return af;case 35668:case 35672:return of;case 35669:case 35673:return sf;case 5125:return cf;case 36294:return lf;case 36295:return ff;case 36296:return uf;case 35678:case 36198:case 36298:case 36306:case 35682:return df;case 35679:case 36299:case 36307:return pf;case 35680:case 36300:case 36308:case 36293:return hf;case 36289:case 36303:case 36311:case 36292:return mf}}class gf{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.setValue=$l(n.type)}}class vf{constructor(t,n,i){this.id=t,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=_f(n.type)}}class Ef{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,n,i){const a=this.seq;for(let r=0,o=a.length;r!==o;++r){const s=a[r];s.setValue(t,n[s.id],i)}}}const Bn=/(\w+)(\])?(\[|\.)?/g;function ir(e,t){e.seq.push(t),e.map[t.id]=t}function Sf(e,t,n){const i=e.name,a=i.length;for(Bn.lastIndex=0;;){const r=Bn.exec(i),o=Bn.lastIndex;let s=r[1];const d=r[2]==="]",v=r[3];if(d&&(s=s|0),v===void 0||v==="["&&o+2===a){ir(n,v===void 0?new gf(s,e,t):new vf(s,e,t));break}else{let p=n.map[s];p===void 0&&(p=new Ef(s),ir(n,p)),n=p}}}class hn{constructor(t,n){this.seq=[],this.map={};const i=t.getProgramParameter(n,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const r=t.getActiveUniform(n,a),o=t.getUniformLocation(n,r.name);Sf(r,o,this)}}setValue(t,n,i,a){const r=this.map[n];r!==void 0&&r.setValue(t,i,a)}setOptional(t,n,i){const a=n[i];a!==void 0&&this.setValue(t,i,a)}static upload(t,n,i,a){for(let r=0,o=n.length;r!==o;++r){const s=n[r],d=i[s.id];d.needsUpdate!==!1&&s.setValue(t,d.value,a)}}static seqWithValue(t,n){const i=[];for(let a=0,r=t.length;a!==r;++a){const o=t[a];o.id in n&&i.push(o)}return i}}function rr(e,t,n){const i=e.createShader(t);return e.shaderSource(i,n),e.compileShader(i),i}const Mf=37297;let Tf=0;function xf(e,t){const n=e.split(`
`),i=[],a=Math.max(t-6,0),r=Math.min(t+6,n.length);for(let o=a;o<r;o++){const s=o+1;i.push(`${s===t?">":" "} ${s}: ${n[o]}`)}return i.join(`
`)}const ar=new Be;function Af(e){rt._getMatrix(ar,rt.workingColorSpace,e);const t=`mat3( ${ar.elements.map(n=>n.toFixed(4))} )`;switch(rt.getTransfer(e)){case zr:return[t,"LinearTransferOETF"];case Ke:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",e),[t,"LinearTransferOETF"]}}function or(e,t,n){const i=e.getShaderParameter(t,e.COMPILE_STATUS),r=(e.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const s=parseInt(o[1]);return n.toUpperCase()+`

`+r+`

`+xf(e.getShaderSource(t),s)}else return r}function Rf(e,t){const n=Af(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}function bf(e,t){let n;switch(t){case mo:n="Linear";break;case ho:n="Reinhard";break;case po:n="Cineon";break;case uo:n="ACESFilmic";break;case fo:n="AgX";break;case lo:n="Neutral";break;case co:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),n="Linear"}return"vec3 "+e+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const fn=new Fe;function Cf(){rt.getLuminanceCoefficients(fn);const e=fn.x.toFixed(4),t=fn.y.toFixed(4),n=fn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${t}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function wf(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(jt).join(`
`)}function Pf(e){const t=[];for(const n in e){const i=e[n];i!==!1&&t.push("#define "+n+" "+i)}return t.join(`
`)}function Lf(e,t){const n={},i=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let a=0;a<i;a++){const r=e.getActiveAttrib(t,a),o=r.name;let s=1;r.type===e.FLOAT_MAT2&&(s=2),r.type===e.FLOAT_MAT3&&(s=3),r.type===e.FLOAT_MAT4&&(s=4),n[o]={type:r.type,location:e.getAttribLocation(t,o),locationSize:s}}return n}function jt(e){return e!==""}function sr(e,t){const n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function cr(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Uf=/^[ \t]*#include +<([\w\d./]+)>/gm;function jn(e){return e.replace(Uf,Df)}const yf=new Map;function Df(e,t){let n=De[t];if(n===void 0){const i=yf.get(t);if(i!==void 0)n=De[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return jn(n)}const If=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function lr(e){return e.replace(If,Nf)}function Nf(e,t,n,i){let a="";for(let r=parseInt(t);r<parseInt(n);r++)a+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return a}function fr(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?t+=`
#define HIGH_PRECISION`:e.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Ff(e){let t="SHADOWMAP_TYPE_BASIC";return e.shadowMapType===Ur?t="SHADOWMAP_TYPE_PCF":e.shadowMapType===so?t="SHADOWMAP_TYPE_PCF_SOFT":e.shadowMapType===bt&&(t="SHADOWMAP_TYPE_VSM"),t}function Of(e){let t="ENVMAP_TYPE_CUBE";if(e.envMap)switch(e.envMapMode){case nn:case qt:t="ENVMAP_TYPE_CUBE";break;case Tn:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Bf(e){let t="ENVMAP_MODE_REFLECTION";if(e.envMap)switch(e.envMapMode){case qt:t="ENVMAP_MODE_REFRACTION";break}return t}function Gf(e){let t="ENVMAP_BLENDING_NONE";if(e.envMap)switch(e.combine){case To:t="ENVMAP_BLENDING_MULTIPLY";break;case Mo:t="ENVMAP_BLENDING_MIX";break;case So:t="ENVMAP_BLENDING_ADD";break}return t}function Hf(e){const t=e.envMapCubeUVHeight;if(t===null)return null;const n=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:i,maxMip:n}}function Vf(e,t,n,i){const a=e.getContext(),r=n.defines;let o=n.vertexShader,s=n.fragmentShader;const d=Ff(n),v=Of(n),T=Bf(n),p=Gf(n),m=Hf(n),E=wf(n),C=Pf(r),x=a.createProgram();let f,c,U=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(f=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,C].filter(jt).join(`
`),f.length>0&&(f+=`
`),c=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,C].filter(jt).join(`
`),c.length>0&&(c+=`
`)):(f=[fr(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,C,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+T:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+d:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(jt).join(`
`),c=[fr(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,C,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+v:"",n.envMap?"#define "+T:"",n.envMap?"#define "+p:"",m?"#define CUBEUV_TEXEL_WIDTH "+m.texelWidth:"",m?"#define CUBEUV_TEXEL_HEIGHT "+m.texelHeight:"",m?"#define CUBEUV_MAX_MIP "+m.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+d:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Pt?"#define TONE_MAPPING":"",n.toneMapping!==Pt?De.tonemapping_pars_fragment:"",n.toneMapping!==Pt?bf("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",De.colorspace_pars_fragment,Rf("linearToOutputTexel",n.outputColorSpace),Cf(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(jt).join(`
`)),o=jn(o),o=sr(o,n),o=cr(o,n),s=jn(s),s=sr(s,n),s=cr(s,n),o=lr(o),s=lr(s),n.isRawShaderMaterial!==!0&&(U=`#version 300 es
`,f=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+f,c=["#define varying in",n.glslVersion===zi?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===zi?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+c);const P=U+f+o,S=U+c+s,y=rr(a,a.VERTEX_SHADER,P),R=rr(a,a.FRAGMENT_SHADER,S);a.attachShader(x,y),a.attachShader(x,R),n.index0AttributeName!==void 0?a.bindAttribLocation(x,0,n.index0AttributeName):n.morphTargets===!0&&a.bindAttribLocation(x,0,"position"),a.linkProgram(x);function I(b){if(e.debug.checkShaderErrors){const B=a.getProgramInfoLog(x)||"",Y=a.getShaderInfoLog(y)||"",K=a.getShaderInfoLog(R)||"",z=B.trim(),W=Y.trim(),ee=K.trim();let V=!0,ge=!0;if(a.getProgramParameter(x,a.LINK_STATUS)===!1)if(V=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(a,x,y,R);else{const Te=or(a,y,"vertex"),Ue=or(a,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(x,a.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+z+`
`+Te+`
`+Ue)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(W===""||ee==="")&&(ge=!1);ge&&(b.diagnostics={runnable:V,programLog:z,vertexShader:{log:W,prefix:f},fragmentShader:{log:ee,prefix:c}})}a.deleteShader(y),a.deleteShader(R),O=new hn(a,x),g=Lf(a,x)}let O;this.getUniforms=function(){return O===void 0&&I(this),O};let g;this.getAttributes=function(){return g===void 0&&I(this),g};let h=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return h===!1&&(h=a.getProgramParameter(x,Mf)),h},this.destroy=function(){i.releaseStatesOfProgram(this),a.deleteProgram(x),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Tf++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=y,this.fragmentShader=R,this}let kf=0;class zf{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const n=t.vertexShader,i=t.fragmentShader,a=this._getShaderStage(n),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(t);return o.has(a)===!1&&(o.add(a),a.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const n=this.materialCache.get(t);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const n=this.materialCache;let i=n.get(t);return i===void 0&&(i=new Set,n.set(t,i)),i}_getShaderStage(t){const n=this.shaderCache;let i=n.get(t);return i===void 0&&(i=new Wf(t),n.set(t,i)),i}}class Wf{constructor(t){this.id=kf++,this.code=t,this.usedTimes=0}}function Xf(e,t,n,i,a,r,o){const s=new oo,d=new zf,v=new Set,T=[],p=a.logarithmicDepthBuffer,m=a.vertexTextures;let E=a.precision;const C={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(g){return v.add(g),g===0?"uv":`uv${g}`}function f(g,h,b,B,Y){const K=B.fog,z=Y.geometry,W=g.isMeshStandardMaterial?B.environment:null,ee=(g.isMeshStandardMaterial?n:t).get(g.envMap||W),V=ee&&ee.mapping===Tn?ee.image.height:null,ge=C[g.type];g.precision!==null&&(E=a.getMaxPrecision(g.precision),E!==g.precision&&console.warn("THREE.WebGLProgram.getParameters:",g.precision,"not supported, using",E,"instead."));const Te=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ue=Te!==void 0?Te.length:0;let He=0;z.morphAttributes.position!==void 0&&(He=1),z.morphAttributes.normal!==void 0&&(He=2),z.morphAttributes.color!==void 0&&(He=3);let nt,je,ze,k;if(ge){const Ve=Mt[ge];nt=Ve.vertexShader,je=Ve.fragmentShader}else nt=g.vertexShader,je=g.fragmentShader,d.update(g),ze=d.getVertexShaderID(g),k=d.getFragmentShaderID(g);const $=e.getRenderTarget(),le=e.state.buffers.depth.getReversed(),Ce=Y.isInstancedMesh===!0,Ee=Y.isBatchedMesh===!0,Oe=!!g.map,ct=!!g.matcap,M=!!ee,$e=!!g.aoMap,Pe=!!g.lightMap,Re=!!g.bumpMap,de=!!g.normalMap,Ze=!!g.displacementMap,pe=!!g.emissiveMap,ye=!!g.metalnessMap,st=!!g.roughnessMap,it=g.anisotropy>0,_=g.clearcoat>0,l=g.dispersion>0,D=g.iridescence>0,H=g.sheen>0,q=g.transmission>0,G=it&&!!g.anisotropyMap,ve=_&&!!g.clearcoatMap,te=_&&!!g.clearcoatNormalMap,he=_&&!!g.clearcoatRoughnessMap,me=D&&!!g.iridescenceMap,Q=D&&!!g.iridescenceThicknessMap,oe=H&&!!g.sheenColorMap,Ae=H&&!!g.sheenRoughnessMap,_e=!!g.specularMap,re=!!g.specularColorMap,Le=!!g.specularIntensityMap,A=q&&!!g.transmissionMap,j=q&&!!g.thicknessMap,ne=!!g.gradientMap,ce=!!g.alphaMap,Z=g.alphaTest>0,X=!!g.alphaHash,ue=!!g.extensions;let we=Pt;g.toneMapped&&($===null||$.isXRRenderTarget===!0)&&(we=e.toneMapping);const Xe={shaderID:ge,shaderType:g.type,shaderName:g.name,vertexShader:nt,fragmentShader:je,defines:g.defines,customVertexShaderID:ze,customFragmentShaderID:k,isRawShaderMaterial:g.isRawShaderMaterial===!0,glslVersion:g.glslVersion,precision:E,batching:Ee,batchingColor:Ee&&Y._colorsTexture!==null,instancing:Ce,instancingColor:Ce&&Y.instanceColor!==null,instancingMorph:Ce&&Y.morphTexture!==null,supportsVertexTextures:m,outputColorSpace:$===null?e.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:Mn,alphaToCoverage:!!g.alphaToCoverage,map:Oe,matcap:ct,envMap:M,envMapMode:M&&ee.mapping,envMapCubeUVHeight:V,aoMap:$e,lightMap:Pe,bumpMap:Re,normalMap:de,displacementMap:m&&Ze,emissiveMap:pe,normalMapObjectSpace:de&&g.normalMapType===no,normalMapTangentSpace:de&&g.normalMapType===to,metalnessMap:ye,roughnessMap:st,anisotropy:it,anisotropyMap:G,clearcoat:_,clearcoatMap:ve,clearcoatNormalMap:te,clearcoatRoughnessMap:he,dispersion:l,iridescence:D,iridescenceMap:me,iridescenceThicknessMap:Q,sheen:H,sheenColorMap:oe,sheenRoughnessMap:Ae,specularMap:_e,specularColorMap:re,specularIntensityMap:Le,transmission:q,transmissionMap:A,thicknessMap:j,gradientMap:ne,opaque:g.transparent===!1&&g.blending===pn&&g.alphaToCoverage===!1,alphaMap:ce,alphaTest:Z,alphaHash:X,combine:g.combine,mapUv:Oe&&x(g.map.channel),aoMapUv:$e&&x(g.aoMap.channel),lightMapUv:Pe&&x(g.lightMap.channel),bumpMapUv:Re&&x(g.bumpMap.channel),normalMapUv:de&&x(g.normalMap.channel),displacementMapUv:Ze&&x(g.displacementMap.channel),emissiveMapUv:pe&&x(g.emissiveMap.channel),metalnessMapUv:ye&&x(g.metalnessMap.channel),roughnessMapUv:st&&x(g.roughnessMap.channel),anisotropyMapUv:G&&x(g.anisotropyMap.channel),clearcoatMapUv:ve&&x(g.clearcoatMap.channel),clearcoatNormalMapUv:te&&x(g.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&x(g.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&x(g.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&x(g.iridescenceThicknessMap.channel),sheenColorMapUv:oe&&x(g.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&x(g.sheenRoughnessMap.channel),specularMapUv:_e&&x(g.specularMap.channel),specularColorMapUv:re&&x(g.specularColorMap.channel),specularIntensityMapUv:Le&&x(g.specularIntensityMap.channel),transmissionMapUv:A&&x(g.transmissionMap.channel),thicknessMapUv:j&&x(g.thicknessMap.channel),alphaMapUv:ce&&x(g.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(de||it),vertexColors:g.vertexColors,vertexAlphas:g.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!z.attributes.uv&&(Oe||ce),fog:!!K,useFog:g.fog===!0,fogExp2:!!K&&K.isFogExp2,flatShading:g.flatShading===!0&&g.wireframe===!1,sizeAttenuation:g.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:le,skinning:Y.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Ue,morphTextureStride:He,numDirLights:h.directional.length,numPointLights:h.point.length,numSpotLights:h.spot.length,numSpotLightMaps:h.spotLightMap.length,numRectAreaLights:h.rectArea.length,numHemiLights:h.hemi.length,numDirLightShadows:h.directionalShadowMap.length,numPointLightShadows:h.pointShadowMap.length,numSpotLightShadows:h.spotShadowMap.length,numSpotLightShadowsWithMaps:h.numSpotLightShadowsWithMaps,numLightProbes:h.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:g.dithering,shadowMapEnabled:e.shadowMap.enabled&&b.length>0,shadowMapType:e.shadowMap.type,toneMapping:we,decodeVideoTexture:Oe&&g.map.isVideoTexture===!0&&rt.getTransfer(g.map.colorSpace)===Ke,decodeVideoTextureEmissive:pe&&g.emissiveMap.isVideoTexture===!0&&rt.getTransfer(g.emissiveMap.colorSpace)===Ke,premultipliedAlpha:g.premultipliedAlpha,doubleSided:g.side===Tt,flipSided:g.side===Et,useDepthPacking:g.depthPacking>=0,depthPacking:g.depthPacking||0,index0AttributeName:g.index0AttributeName,extensionClipCullDistance:ue&&g.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ue&&g.extensions.multiDraw===!0||Ee)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:g.customProgramCacheKey()};return Xe.vertexUv1s=v.has(1),Xe.vertexUv2s=v.has(2),Xe.vertexUv3s=v.has(3),v.clear(),Xe}function c(g){const h=[];if(g.shaderID?h.push(g.shaderID):(h.push(g.customVertexShaderID),h.push(g.customFragmentShaderID)),g.defines!==void 0)for(const b in g.defines)h.push(b),h.push(g.defines[b]);return g.isRawShaderMaterial===!1&&(U(h,g),P(h,g),h.push(e.outputColorSpace)),h.push(g.customProgramCacheKey),h.join()}function U(g,h){g.push(h.precision),g.push(h.outputColorSpace),g.push(h.envMapMode),g.push(h.envMapCubeUVHeight),g.push(h.mapUv),g.push(h.alphaMapUv),g.push(h.lightMapUv),g.push(h.aoMapUv),g.push(h.bumpMapUv),g.push(h.normalMapUv),g.push(h.displacementMapUv),g.push(h.emissiveMapUv),g.push(h.metalnessMapUv),g.push(h.roughnessMapUv),g.push(h.anisotropyMapUv),g.push(h.clearcoatMapUv),g.push(h.clearcoatNormalMapUv),g.push(h.clearcoatRoughnessMapUv),g.push(h.iridescenceMapUv),g.push(h.iridescenceThicknessMapUv),g.push(h.sheenColorMapUv),g.push(h.sheenRoughnessMapUv),g.push(h.specularMapUv),g.push(h.specularColorMapUv),g.push(h.specularIntensityMapUv),g.push(h.transmissionMapUv),g.push(h.thicknessMapUv),g.push(h.combine),g.push(h.fogExp2),g.push(h.sizeAttenuation),g.push(h.morphTargetsCount),g.push(h.morphAttributeCount),g.push(h.numDirLights),g.push(h.numPointLights),g.push(h.numSpotLights),g.push(h.numSpotLightMaps),g.push(h.numHemiLights),g.push(h.numRectAreaLights),g.push(h.numDirLightShadows),g.push(h.numPointLightShadows),g.push(h.numSpotLightShadows),g.push(h.numSpotLightShadowsWithMaps),g.push(h.numLightProbes),g.push(h.shadowMapType),g.push(h.toneMapping),g.push(h.numClippingPlanes),g.push(h.numClipIntersection),g.push(h.depthPacking)}function P(g,h){s.disableAll(),h.supportsVertexTextures&&s.enable(0),h.instancing&&s.enable(1),h.instancingColor&&s.enable(2),h.instancingMorph&&s.enable(3),h.matcap&&s.enable(4),h.envMap&&s.enable(5),h.normalMapObjectSpace&&s.enable(6),h.normalMapTangentSpace&&s.enable(7),h.clearcoat&&s.enable(8),h.iridescence&&s.enable(9),h.alphaTest&&s.enable(10),h.vertexColors&&s.enable(11),h.vertexAlphas&&s.enable(12),h.vertexUv1s&&s.enable(13),h.vertexUv2s&&s.enable(14),h.vertexUv3s&&s.enable(15),h.vertexTangents&&s.enable(16),h.anisotropy&&s.enable(17),h.alphaHash&&s.enable(18),h.batching&&s.enable(19),h.dispersion&&s.enable(20),h.batchingColor&&s.enable(21),h.gradientMap&&s.enable(22),g.push(s.mask),s.disableAll(),h.fog&&s.enable(0),h.useFog&&s.enable(1),h.flatShading&&s.enable(2),h.logarithmicDepthBuffer&&s.enable(3),h.reversedDepthBuffer&&s.enable(4),h.skinning&&s.enable(5),h.morphTargets&&s.enable(6),h.morphNormals&&s.enable(7),h.morphColors&&s.enable(8),h.premultipliedAlpha&&s.enable(9),h.shadowMapEnabled&&s.enable(10),h.doubleSided&&s.enable(11),h.flipSided&&s.enable(12),h.useDepthPacking&&s.enable(13),h.dithering&&s.enable(14),h.transmission&&s.enable(15),h.sheen&&s.enable(16),h.opaque&&s.enable(17),h.pointsUvs&&s.enable(18),h.decodeVideoTexture&&s.enable(19),h.decodeVideoTextureEmissive&&s.enable(20),h.alphaToCoverage&&s.enable(21),g.push(s.mask)}function S(g){const h=C[g.type];let b;if(h){const B=Mt[h];b=eo.clone(B.uniforms)}else b=g.uniforms;return b}function y(g,h){let b;for(let B=0,Y=T.length;B<Y;B++){const K=T[B];if(K.cacheKey===h){b=K,++b.usedTimes;break}}return b===void 0&&(b=new Vf(e,h,g,r),T.push(b)),b}function R(g){if(--g.usedTimes===0){const h=T.indexOf(g);T[h]=T[T.length-1],T.pop(),g.destroy()}}function I(g){d.remove(g)}function O(){d.dispose()}return{getParameters:f,getProgramCacheKey:c,getUniforms:S,acquireProgram:y,releaseProgram:R,releaseShaderCache:I,programs:T,dispose:O}}function Yf(){let e=new WeakMap;function t(o){return e.has(o)}function n(o){let s=e.get(o);return s===void 0&&(s={},e.set(o,s)),s}function i(o){e.delete(o)}function a(o,s,d){e.get(o)[s]=d}function r(){e=new WeakMap}return{has:t,get:n,remove:i,update:a,dispose:r}}function Kf(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.material.id!==t.material.id?e.material.id-t.material.id:e.z!==t.z?e.z-t.z:e.id-t.id}function ur(e,t){return e.groupOrder!==t.groupOrder?e.groupOrder-t.groupOrder:e.renderOrder!==t.renderOrder?e.renderOrder-t.renderOrder:e.z!==t.z?t.z-e.z:e.id-t.id}function dr(){const e=[];let t=0;const n=[],i=[],a=[];function r(){t=0,n.length=0,i.length=0,a.length=0}function o(p,m,E,C,x,f){let c=e[t];return c===void 0?(c={id:p.id,object:p,geometry:m,material:E,groupOrder:C,renderOrder:p.renderOrder,z:x,group:f},e[t]=c):(c.id=p.id,c.object=p,c.geometry=m,c.material=E,c.groupOrder=C,c.renderOrder=p.renderOrder,c.z=x,c.group=f),t++,c}function s(p,m,E,C,x,f){const c=o(p,m,E,C,x,f);E.transmission>0?i.push(c):E.transparent===!0?a.push(c):n.push(c)}function d(p,m,E,C,x,f){const c=o(p,m,E,C,x,f);E.transmission>0?i.unshift(c):E.transparent===!0?a.unshift(c):n.unshift(c)}function v(p,m){n.length>1&&n.sort(p||Kf),i.length>1&&i.sort(m||ur),a.length>1&&a.sort(m||ur)}function T(){for(let p=t,m=e.length;p<m;p++){const E=e[p];if(E.id===null)break;E.id=null,E.object=null,E.geometry=null,E.material=null,E.group=null}}return{opaque:n,transmissive:i,transparent:a,init:r,push:s,unshift:d,finish:T,sort:v}}function qf(){let e=new WeakMap;function t(i,a){const r=e.get(i);let o;return r===void 0?(o=new dr,e.set(i,[o])):a>=r.length?(o=new dr,r.push(o)):o=r[a],o}function n(){e=new WeakMap}return{get:t,dispose:n}}function $f(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={direction:new Fe,color:new qe};break;case"SpotLight":n={position:new Fe,direction:new Fe,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new Fe,color:new qe,distance:0,decay:0};break;case"HemisphereLight":n={direction:new Fe,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":n={color:new qe,position:new Fe,halfWidth:new Fe,halfHeight:new Fe};break}return e[t.id]=n,n}}}function Zf(){const e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[t.id]=n,n}}}let Jf=0;function Qf(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+(t.map?1:0)-(e.map?1:0)}function jf(e){const t=new $f,n=Zf(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let v=0;v<9;v++)i.probe.push(new Fe);const a=new Fe,r=new At,o=new At;function s(v){let T=0,p=0,m=0;for(let g=0;g<9;g++)i.probe[g].set(0,0,0);let E=0,C=0,x=0,f=0,c=0,U=0,P=0,S=0,y=0,R=0,I=0;v.sort(Qf);for(let g=0,h=v.length;g<h;g++){const b=v[g],B=b.color,Y=b.intensity,K=b.distance,z=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)T+=B.r*Y,p+=B.g*Y,m+=B.b*Y;else if(b.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(b.sh.coefficients[W],Y);I++}else if(b.isDirectionalLight){const W=t.get(b);if(W.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){const ee=b.shadow,V=n.get(b);V.shadowIntensity=ee.intensity,V.shadowBias=ee.bias,V.shadowNormalBias=ee.normalBias,V.shadowRadius=ee.radius,V.shadowMapSize=ee.mapSize,i.directionalShadow[E]=V,i.directionalShadowMap[E]=z,i.directionalShadowMatrix[E]=b.shadow.matrix,U++}i.directional[E]=W,E++}else if(b.isSpotLight){const W=t.get(b);W.position.setFromMatrixPosition(b.matrixWorld),W.color.copy(B).multiplyScalar(Y),W.distance=K,W.coneCos=Math.cos(b.angle),W.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),W.decay=b.decay,i.spot[x]=W;const ee=b.shadow;if(b.map&&(i.spotLightMap[y]=b.map,y++,ee.updateMatrices(b),b.castShadow&&R++),i.spotLightMatrix[x]=ee.matrix,b.castShadow){const V=n.get(b);V.shadowIntensity=ee.intensity,V.shadowBias=ee.bias,V.shadowNormalBias=ee.normalBias,V.shadowRadius=ee.radius,V.shadowMapSize=ee.mapSize,i.spotShadow[x]=V,i.spotShadowMap[x]=z,S++}x++}else if(b.isRectAreaLight){const W=t.get(b);W.color.copy(B).multiplyScalar(Y),W.halfWidth.set(b.width*.5,0,0),W.halfHeight.set(0,b.height*.5,0),i.rectArea[f]=W,f++}else if(b.isPointLight){const W=t.get(b);if(W.color.copy(b.color).multiplyScalar(b.intensity),W.distance=b.distance,W.decay=b.decay,b.castShadow){const ee=b.shadow,V=n.get(b);V.shadowIntensity=ee.intensity,V.shadowBias=ee.bias,V.shadowNormalBias=ee.normalBias,V.shadowRadius=ee.radius,V.shadowMapSize=ee.mapSize,V.shadowCameraNear=ee.camera.near,V.shadowCameraFar=ee.camera.far,i.pointShadow[C]=V,i.pointShadowMap[C]=z,i.pointShadowMatrix[C]=b.shadow.matrix,P++}i.point[C]=W,C++}else if(b.isHemisphereLight){const W=t.get(b);W.skyColor.copy(b.color).multiplyScalar(Y),W.groundColor.copy(b.groundColor).multiplyScalar(Y),i.hemi[c]=W,c++}}f>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ie.LTC_FLOAT_1,i.rectAreaLTC2=ie.LTC_FLOAT_2):(i.rectAreaLTC1=ie.LTC_HALF_1,i.rectAreaLTC2=ie.LTC_HALF_2)),i.ambient[0]=T,i.ambient[1]=p,i.ambient[2]=m;const O=i.hash;(O.directionalLength!==E||O.pointLength!==C||O.spotLength!==x||O.rectAreaLength!==f||O.hemiLength!==c||O.numDirectionalShadows!==U||O.numPointShadows!==P||O.numSpotShadows!==S||O.numSpotMaps!==y||O.numLightProbes!==I)&&(i.directional.length=E,i.spot.length=x,i.rectArea.length=f,i.point.length=C,i.hemi.length=c,i.directionalShadow.length=U,i.directionalShadowMap.length=U,i.pointShadow.length=P,i.pointShadowMap.length=P,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=U,i.pointShadowMatrix.length=P,i.spotLightMatrix.length=S+y-R,i.spotLightMap.length=y,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=I,O.directionalLength=E,O.pointLength=C,O.spotLength=x,O.rectAreaLength=f,O.hemiLength=c,O.numDirectionalShadows=U,O.numPointShadows=P,O.numSpotShadows=S,O.numSpotMaps=y,O.numLightProbes=I,i.version=Jf++)}function d(v,T){let p=0,m=0,E=0,C=0,x=0;const f=T.matrixWorldInverse;for(let c=0,U=v.length;c<U;c++){const P=v[c];if(P.isDirectionalLight){const S=i.directional[p];S.direction.setFromMatrixPosition(P.matrixWorld),a.setFromMatrixPosition(P.target.matrixWorld),S.direction.sub(a),S.direction.transformDirection(f),p++}else if(P.isSpotLight){const S=i.spot[E];S.position.setFromMatrixPosition(P.matrixWorld),S.position.applyMatrix4(f),S.direction.setFromMatrixPosition(P.matrixWorld),a.setFromMatrixPosition(P.target.matrixWorld),S.direction.sub(a),S.direction.transformDirection(f),E++}else if(P.isRectAreaLight){const S=i.rectArea[C];S.position.setFromMatrixPosition(P.matrixWorld),S.position.applyMatrix4(f),o.identity(),r.copy(P.matrixWorld),r.premultiply(f),o.extractRotation(r),S.halfWidth.set(P.width*.5,0,0),S.halfHeight.set(0,P.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),C++}else if(P.isPointLight){const S=i.point[m];S.position.setFromMatrixPosition(P.matrixWorld),S.position.applyMatrix4(f),m++}else if(P.isHemisphereLight){const S=i.hemi[x];S.direction.setFromMatrixPosition(P.matrixWorld),S.direction.transformDirection(f),x++}}}return{setup:s,setupView:d,state:i}}function pr(e){const t=new jf(e),n=[],i=[];function a(T){v.camera=T,n.length=0,i.length=0}function r(T){n.push(T)}function o(T){i.push(T)}function s(){t.setup(n)}function d(T){t.setupView(n,T)}const v={lightsArray:n,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:a,state:v,setupLights:s,setupLightsView:d,pushLight:r,pushShadow:o}}function eu(e){let t=new WeakMap;function n(a,r=0){const o=t.get(a);let s;return o===void 0?(s=new pr(e),t.set(a,[s])):r>=o.length?(s=new pr(e),o.push(s)):s=o[r],s}function i(){t=new WeakMap}return{get:n,dispose:i}}const tu=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nu=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function iu(e,t,n){let i=new Tr;const a=new pt,r=new pt,o=new dt,s=new Ga({depthPacking:Ha}),d=new Va,v={},T=n.maxTextureSize,p={[tn]:Et,[Et]:tn,[Tt]:Tt},m=new Vt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:tu,fragmentShader:nu}),E=m.clone();E.defines.HORIZONTAL_PASS=1;const C=new xn;C.setAttribute("position",new tt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new Ct(C,m),f=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ur;let c=this.type;this.render=function(R,I,O){if(f.enabled===!1||f.autoUpdate===!1&&f.needsUpdate===!1||R.length===0)return;const g=e.getRenderTarget(),h=e.getActiveCubeFace(),b=e.getActiveMipmapLevel(),B=e.state;B.setBlending(Gt),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const Y=c!==bt&&this.type===bt,K=c===bt&&this.type!==bt;for(let z=0,W=R.length;z<W;z++){const ee=R[z],V=ee.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",ee,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;a.copy(V.mapSize);const ge=V.getFrameExtents();if(a.multiply(ge),r.copy(V.mapSize),(a.x>T||a.y>T)&&(a.x>T&&(r.x=Math.floor(T/ge.x),a.x=r.x*ge.x,V.mapSize.x=r.x),a.y>T&&(r.y=Math.floor(T/ge.y),a.y=r.y*ge.y,V.mapSize.y=r.y)),V.map===null||Y===!0||K===!0){const Ue=this.type!==bt?{minFilter:Yt,magFilter:Yt}:{};V.map!==null&&V.map.dispose(),V.map=new Kt(a.x,a.y,Ue),V.map.texture.name=ee.name+".shadowMap",V.camera.updateProjectionMatrix()}e.setRenderTarget(V.map),e.clear();const Te=V.getViewportCount();for(let Ue=0;Ue<Te;Ue++){const He=V.getViewport(Ue);o.set(r.x*He.x,r.y*He.y,r.x*He.z,r.y*He.w),B.viewport(o),V.updateMatrices(ee,Ue),i=V.getFrustum(),S(I,O,V.camera,ee,this.type)}V.isPointLightShadow!==!0&&this.type===bt&&U(V,O),V.needsUpdate=!1}c=this.type,f.needsUpdate=!1,e.setRenderTarget(g,h,b)};function U(R,I){const O=t.update(x);m.defines.VSM_SAMPLES!==R.blurSamples&&(m.defines.VSM_SAMPLES=R.blurSamples,E.defines.VSM_SAMPLES=R.blurSamples,m.needsUpdate=!0,E.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Kt(a.x,a.y)),m.uniforms.shadow_pass.value=R.map.texture,m.uniforms.resolution.value=R.mapSize,m.uniforms.radius.value=R.radius,e.setRenderTarget(R.mapPass),e.clear(),e.renderBufferDirect(I,null,O,m,x,null),E.uniforms.shadow_pass.value=R.mapPass.texture,E.uniforms.resolution.value=R.mapSize,E.uniforms.radius.value=R.radius,e.setRenderTarget(R.map),e.clear(),e.renderBufferDirect(I,null,O,E,x,null)}function P(R,I,O,g){let h=null;const b=O.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(b!==void 0)h=b;else if(h=O.isPointLight===!0?d:s,e.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){const B=h.uuid,Y=I.uuid;let K=v[B];K===void 0&&(K={},v[B]=K);let z=K[Y];z===void 0&&(z=h.clone(),K[Y]=z,I.addEventListener("dispose",y)),h=z}if(h.visible=I.visible,h.wireframe=I.wireframe,g===bt?h.side=I.shadowSide!==null?I.shadowSide:I.side:h.side=I.shadowSide!==null?I.shadowSide:p[I.side],h.alphaMap=I.alphaMap,h.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,h.map=I.map,h.clipShadows=I.clipShadows,h.clippingPlanes=I.clippingPlanes,h.clipIntersection=I.clipIntersection,h.displacementMap=I.displacementMap,h.displacementScale=I.displacementScale,h.displacementBias=I.displacementBias,h.wireframeLinewidth=I.wireframeLinewidth,h.linewidth=I.linewidth,O.isPointLight===!0&&h.isMeshDistanceMaterial===!0){const B=e.properties.get(h);B.light=O}return h}function S(R,I,O,g,h){if(R.visible===!1)return;if(R.layers.test(I.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&h===bt)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,R.matrixWorld);const Y=t.update(R),K=R.material;if(Array.isArray(K)){const z=Y.groups;for(let W=0,ee=z.length;W<ee;W++){const V=z[W],ge=K[V.materialIndex];if(ge&&ge.visible){const Te=P(R,ge,g,h);R.onBeforeShadow(e,R,I,O,Y,Te,V),e.renderBufferDirect(O,null,Y,Te,R,V),R.onAfterShadow(e,R,I,O,Y,Te,V)}}}else if(K.visible){const z=P(R,K,g,h);R.onBeforeShadow(e,R,I,O,Y,z,null),e.renderBufferDirect(O,null,Y,z,R,null),R.onAfterShadow(e,R,I,O,Y,z,null)}}const B=R.children;for(let Y=0,K=B.length;Y<K;Y++)S(B[Y],I,O,g,h)}function y(R){R.target.removeEventListener("dispose",y);for(const O in v){const g=v[O],h=R.target.uuid;h in g&&(g[h].dispose(),delete g[h])}}}const ru={[qn]:Kn,[Yn]:zn,[Xn]:kn,[_n]:Wn,[Kn]:qn,[zn]:Yn,[kn]:Xn,[Wn]:_n};function au(e,t){function n(){let A=!1;const j=new dt;let ne=null;const ce=new dt(0,0,0,0);return{setMask:function(Z){ne!==Z&&!A&&(e.colorMask(Z,Z,Z,Z),ne=Z)},setLocked:function(Z){A=Z},setClear:function(Z,X,ue,we,Xe){Xe===!0&&(Z*=we,X*=we,ue*=we),j.set(Z,X,ue,we),ce.equals(j)===!1&&(e.clearColor(Z,X,ue,we),ce.copy(j))},reset:function(){A=!1,ne=null,ce.set(-1,0,0,0)}}}function i(){let A=!1,j=!1,ne=null,ce=null,Z=null;return{setReversed:function(X){if(j!==X){const ue=t.get("EXT_clip_control");X?ue.clipControlEXT(ue.LOWER_LEFT_EXT,ue.ZERO_TO_ONE_EXT):ue.clipControlEXT(ue.LOWER_LEFT_EXT,ue.NEGATIVE_ONE_TO_ONE_EXT),j=X;const we=Z;Z=null,this.setClear(we)}},getReversed:function(){return j},setTest:function(X){X?$(e.DEPTH_TEST):le(e.DEPTH_TEST)},setMask:function(X){ne!==X&&!A&&(e.depthMask(X),ne=X)},setFunc:function(X){if(j&&(X=ru[X]),ce!==X){switch(X){case qn:e.depthFunc(e.NEVER);break;case Kn:e.depthFunc(e.ALWAYS);break;case Yn:e.depthFunc(e.LESS);break;case _n:e.depthFunc(e.LEQUAL);break;case Xn:e.depthFunc(e.EQUAL);break;case Wn:e.depthFunc(e.GEQUAL);break;case zn:e.depthFunc(e.GREATER);break;case kn:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}ce=X}},setLocked:function(X){A=X},setClear:function(X){Z!==X&&(j&&(X=1-X),e.clearDepth(X),Z=X)},reset:function(){A=!1,ne=null,ce=null,Z=null,j=!1}}}function a(){let A=!1,j=null,ne=null,ce=null,Z=null,X=null,ue=null,we=null,Xe=null;return{setTest:function(Ve){A||(Ve?$(e.STENCIL_TEST):le(e.STENCIL_TEST))},setMask:function(Ve){j!==Ve&&!A&&(e.stencilMask(Ve),j=Ve)},setFunc:function(Ve,Rt,St){(ne!==Ve||ce!==Rt||Z!==St)&&(e.stencilFunc(Ve,Rt,St),ne=Ve,ce=Rt,Z=St)},setOp:function(Ve,Rt,St){(X!==Ve||ue!==Rt||we!==St)&&(e.stencilOp(Ve,Rt,St),X=Ve,ue=Rt,we=St)},setLocked:function(Ve){A=Ve},setClear:function(Ve){Xe!==Ve&&(e.clearStencil(Ve),Xe=Ve)},reset:function(){A=!1,j=null,ne=null,ce=null,Z=null,X=null,ue=null,we=null,Xe=null}}}const r=new n,o=new i,s=new a,d=new WeakMap,v=new WeakMap;let T={},p={},m=new WeakMap,E=[],C=null,x=!1,f=null,c=null,U=null,P=null,S=null,y=null,R=null,I=new qe(0,0,0),O=0,g=!1,h=null,b=null,B=null,Y=null,K=null;const z=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,ee=0;const V=e.getParameter(e.VERSION);V.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(V)[1]),W=ee>=1):V.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),W=ee>=2);let ge=null,Te={};const Ue=e.getParameter(e.SCISSOR_BOX),He=e.getParameter(e.VIEWPORT),nt=new dt().fromArray(Ue),je=new dt().fromArray(He);function ze(A,j,ne,ce){const Z=new Uint8Array(4),X=e.createTexture();e.bindTexture(A,X),e.texParameteri(A,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(A,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let ue=0;ue<ne;ue++)A===e.TEXTURE_3D||A===e.TEXTURE_2D_ARRAY?e.texImage3D(j,0,e.RGBA,1,1,ce,0,e.RGBA,e.UNSIGNED_BYTE,Z):e.texImage2D(j+ue,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Z);return X}const k={};k[e.TEXTURE_2D]=ze(e.TEXTURE_2D,e.TEXTURE_2D,1),k[e.TEXTURE_CUBE_MAP]=ze(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),k[e.TEXTURE_2D_ARRAY]=ze(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),k[e.TEXTURE_3D]=ze(e.TEXTURE_3D,e.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),s.setClear(0),$(e.DEPTH_TEST),o.setFunc(_n),Re(!1),de(Oi),$(e.CULL_FACE),$e(Gt);function $(A){T[A]!==!0&&(e.enable(A),T[A]=!0)}function le(A){T[A]!==!1&&(e.disable(A),T[A]=!1)}function Ce(A,j){return p[A]!==j?(e.bindFramebuffer(A,j),p[A]=j,A===e.DRAW_FRAMEBUFFER&&(p[e.FRAMEBUFFER]=j),A===e.FRAMEBUFFER&&(p[e.DRAW_FRAMEBUFFER]=j),!0):!1}function Ee(A,j){let ne=E,ce=!1;if(A){ne=m.get(j),ne===void 0&&(ne=[],m.set(j,ne));const Z=A.textures;if(ne.length!==Z.length||ne[0]!==e.COLOR_ATTACHMENT0){for(let X=0,ue=Z.length;X<ue;X++)ne[X]=e.COLOR_ATTACHMENT0+X;ne.length=Z.length,ce=!0}}else ne[0]!==e.BACK&&(ne[0]=e.BACK,ce=!0);ce&&e.drawBuffers(ne)}function Oe(A){return C!==A?(e.useProgram(A),C=A,!0):!1}const ct={[Jt]:e.FUNC_ADD,[ma]:e.FUNC_SUBTRACT,[ha]:e.FUNC_REVERSE_SUBTRACT};ct[xo]=e.MIN,ct[Ao]=e.MAX;const M={[La]:e.ZERO,[Pa]:e.ONE,[wa]:e.SRC_COLOR,[Ca]:e.SRC_ALPHA,[ba]:e.SRC_ALPHA_SATURATE,[Ra]:e.DST_COLOR,[Aa]:e.DST_ALPHA,[xa]:e.ONE_MINUS_SRC_COLOR,[Ta]:e.ONE_MINUS_SRC_ALPHA,[Ma]:e.ONE_MINUS_DST_COLOR,[Sa]:e.ONE_MINUS_DST_ALPHA,[Ea]:e.CONSTANT_COLOR,[va]:e.ONE_MINUS_CONSTANT_COLOR,[ga]:e.CONSTANT_ALPHA,[_a]:e.ONE_MINUS_CONSTANT_ALPHA};function $e(A,j,ne,ce,Z,X,ue,we,Xe,Ve){if(A===Gt){x===!0&&(le(e.BLEND),x=!1);return}if(x===!1&&($(e.BLEND),x=!0),A!==Qa){if(A!==f||Ve!==g){if((c!==Jt||S!==Jt)&&(e.blendEquation(e.FUNC_ADD),c=Jt,S=Jt),Ve)switch(A){case pn:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Hi:e.blendFunc(e.ONE,e.ONE);break;case Gi:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Bi:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",A);break}else switch(A){case pn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case Hi:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case Gi:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Bi:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",A);break}U=null,P=null,y=null,R=null,I.set(0,0,0),O=0,f=A,g=Ve}return}Z=Z||j,X=X||ne,ue=ue||ce,(j!==c||Z!==S)&&(e.blendEquationSeparate(ct[j],ct[Z]),c=j,S=Z),(ne!==U||ce!==P||X!==y||ue!==R)&&(e.blendFuncSeparate(M[ne],M[ce],M[X],M[ue]),U=ne,P=ce,y=X,R=ue),(we.equals(I)===!1||Xe!==O)&&(e.blendColor(we.r,we.g,we.b,Xe),I.copy(we),O=Xe),f=A,g=!1}function Pe(A,j){A.side===Tt?le(e.CULL_FACE):$(e.CULL_FACE);let ne=A.side===Et;j&&(ne=!ne),Re(ne),A.blending===pn&&A.transparent===!1?$e(Gt):$e(A.blending,A.blendEquation,A.blendSrc,A.blendDst,A.blendEquationAlpha,A.blendSrcAlpha,A.blendDstAlpha,A.blendColor,A.blendAlpha,A.premultipliedAlpha),o.setFunc(A.depthFunc),o.setTest(A.depthTest),o.setMask(A.depthWrite),r.setMask(A.colorWrite);const ce=A.stencilWrite;s.setTest(ce),ce&&(s.setMask(A.stencilWriteMask),s.setFunc(A.stencilFunc,A.stencilRef,A.stencilFuncMask),s.setOp(A.stencilFail,A.stencilZFail,A.stencilZPass)),pe(A.polygonOffset,A.polygonOffsetFactor,A.polygonOffsetUnits),A.alphaToCoverage===!0?$(e.SAMPLE_ALPHA_TO_COVERAGE):le(e.SAMPLE_ALPHA_TO_COVERAGE)}function Re(A){h!==A&&(A?e.frontFace(e.CW):e.frontFace(e.CCW),h=A)}function de(A){A!==Za?($(e.CULL_FACE),A!==b&&(A===Oi?e.cullFace(e.BACK):A===Ja?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):le(e.CULL_FACE),b=A}function Ze(A){A!==B&&(W&&e.lineWidth(A),B=A)}function pe(A,j,ne){A?($(e.POLYGON_OFFSET_FILL),(Y!==j||K!==ne)&&(e.polygonOffset(j,ne),Y=j,K=ne)):le(e.POLYGON_OFFSET_FILL)}function ye(A){A?$(e.SCISSOR_TEST):le(e.SCISSOR_TEST)}function st(A){A===void 0&&(A=e.TEXTURE0+z-1),ge!==A&&(e.activeTexture(A),ge=A)}function it(A,j,ne){ne===void 0&&(ge===null?ne=e.TEXTURE0+z-1:ne=ge);let ce=Te[ne];ce===void 0&&(ce={type:void 0,texture:void 0},Te[ne]=ce),(ce.type!==A||ce.texture!==j)&&(ge!==ne&&(e.activeTexture(ne),ge=ne),e.bindTexture(A,j||k[A]),ce.type=A,ce.texture=j)}function _(){const A=Te[ge];A!==void 0&&A.type!==void 0&&(e.bindTexture(A.type,null),A.type=void 0,A.texture=void 0)}function l(){try{e.compressedTexImage2D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function D(){try{e.compressedTexImage3D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function H(){try{e.texSubImage2D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function q(){try{e.texSubImage3D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function G(){try{e.compressedTexSubImage2D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function ve(){try{e.compressedTexSubImage3D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function te(){try{e.texStorage2D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function he(){try{e.texStorage3D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function me(){try{e.texImage2D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function Q(){try{e.texImage3D(...arguments)}catch(A){console.error("THREE.WebGLState:",A)}}function oe(A){nt.equals(A)===!1&&(e.scissor(A.x,A.y,A.z,A.w),nt.copy(A))}function Ae(A){je.equals(A)===!1&&(e.viewport(A.x,A.y,A.z,A.w),je.copy(A))}function _e(A,j){let ne=v.get(j);ne===void 0&&(ne=new WeakMap,v.set(j,ne));let ce=ne.get(A);ce===void 0&&(ce=e.getUniformBlockIndex(j,A.name),ne.set(A,ce))}function re(A,j){const ce=v.get(j).get(A);d.get(j)!==ce&&(e.uniformBlockBinding(j,ce,A.__bindingPointIndex),d.set(j,ce))}function Le(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),T={},ge=null,Te={},p={},m=new WeakMap,E=[],C=null,x=!1,f=null,c=null,U=null,P=null,S=null,y=null,R=null,I=new qe(0,0,0),O=0,g=!1,h=null,b=null,B=null,Y=null,K=null,nt.set(0,0,e.canvas.width,e.canvas.height),je.set(0,0,e.canvas.width,e.canvas.height),r.reset(),o.reset(),s.reset()}return{buffers:{color:r,depth:o,stencil:s},enable:$,disable:le,bindFramebuffer:Ce,drawBuffers:Ee,useProgram:Oe,setBlending:$e,setMaterial:Pe,setFlipSided:Re,setCullFace:de,setLineWidth:Ze,setPolygonOffset:pe,setScissorTest:ye,activeTexture:st,bindTexture:it,unbindTexture:_,compressedTexImage2D:l,compressedTexImage3D:D,texImage2D:me,texImage3D:Q,updateUBOMapping:_e,uniformBlockBinding:re,texStorage2D:te,texStorage3D:he,texSubImage2D:H,texSubImage3D:q,compressedTexSubImage2D:G,compressedTexSubImage3D:ve,scissor:oe,viewport:Ae,reset:Le}}function ou(e,t,n,i,a,r,o){const s=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,d=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),v=new pt,T=new WeakMap;let p;const m=new WeakMap;let E=!1;try{E=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function C(_,l){return E?new OffscreenCanvas(_,l):Eo("canvas")}function x(_,l,D){let H=1;const q=it(_);if((q.width>D||q.height>D)&&(H=D/Math.max(q.width,q.height)),H<1)if(typeof HTMLImageElement<"u"&&_ instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&_ instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&_ instanceof ImageBitmap||typeof VideoFrame<"u"&&_ instanceof VideoFrame){const G=Math.floor(H*q.width),ve=Math.floor(H*q.height);p===void 0&&(p=C(G,ve));const te=l?C(G,ve):p;return te.width=G,te.height=ve,te.getContext("2d").drawImage(_,0,0,G,ve),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+G+"x"+ve+")."),te}else return"data"in _&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),_;return _}function f(_){return _.generateMipmaps}function c(_){e.generateMipmap(_)}function U(_){return _.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:_.isWebGL3DRenderTarget?e.TEXTURE_3D:_.isWebGLArrayRenderTarget||_.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function P(_,l,D,H,q=!1){if(_!==null){if(e[_]!==void 0)return e[_];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+_+"'")}let G=l;if(l===e.RED&&(D===e.FLOAT&&(G=e.R32F),D===e.HALF_FLOAT&&(G=e.R16F),D===e.UNSIGNED_BYTE&&(G=e.R8)),l===e.RED_INTEGER&&(D===e.UNSIGNED_BYTE&&(G=e.R8UI),D===e.UNSIGNED_SHORT&&(G=e.R16UI),D===e.UNSIGNED_INT&&(G=e.R32UI),D===e.BYTE&&(G=e.R8I),D===e.SHORT&&(G=e.R16I),D===e.INT&&(G=e.R32I)),l===e.RG&&(D===e.FLOAT&&(G=e.RG32F),D===e.HALF_FLOAT&&(G=e.RG16F),D===e.UNSIGNED_BYTE&&(G=e.RG8)),l===e.RG_INTEGER&&(D===e.UNSIGNED_BYTE&&(G=e.RG8UI),D===e.UNSIGNED_SHORT&&(G=e.RG16UI),D===e.UNSIGNED_INT&&(G=e.RG32UI),D===e.BYTE&&(G=e.RG8I),D===e.SHORT&&(G=e.RG16I),D===e.INT&&(G=e.RG32I)),l===e.RGB_INTEGER&&(D===e.UNSIGNED_BYTE&&(G=e.RGB8UI),D===e.UNSIGNED_SHORT&&(G=e.RGB16UI),D===e.UNSIGNED_INT&&(G=e.RGB32UI),D===e.BYTE&&(G=e.RGB8I),D===e.SHORT&&(G=e.RGB16I),D===e.INT&&(G=e.RGB32I)),l===e.RGBA_INTEGER&&(D===e.UNSIGNED_BYTE&&(G=e.RGBA8UI),D===e.UNSIGNED_SHORT&&(G=e.RGBA16UI),D===e.UNSIGNED_INT&&(G=e.RGBA32UI),D===e.BYTE&&(G=e.RGBA8I),D===e.SHORT&&(G=e.RGBA16I),D===e.INT&&(G=e.RGBA32I)),l===e.RGB&&(D===e.UNSIGNED_INT_5_9_9_9_REV&&(G=e.RGB9_E5),D===e.UNSIGNED_INT_10F_11F_11F_REV&&(G=e.R11F_G11F_B10F)),l===e.RGBA){const ve=q?zr:rt.getTransfer(H);D===e.FLOAT&&(G=e.RGBA32F),D===e.HALF_FLOAT&&(G=e.RGBA16F),D===e.UNSIGNED_BYTE&&(G=ve===Ke?e.SRGB8_ALPHA8:e.RGBA8),D===e.UNSIGNED_SHORT_4_4_4_4&&(G=e.RGBA4),D===e.UNSIGNED_SHORT_5_5_5_1&&(G=e.RGB5_A1)}return(G===e.R16F||G===e.R32F||G===e.RG16F||G===e.RG32F||G===e.RGBA16F||G===e.RGBA32F)&&t.get("EXT_color_buffer_float"),G}function S(_,l){let D;return _?l===null||l===an||l===rn?D=e.DEPTH24_STENCIL8:l===Bt?D=e.DEPTH32F_STENCIL8:l===gn&&(D=e.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):l===null||l===an||l===rn?D=e.DEPTH_COMPONENT24:l===Bt?D=e.DEPTH_COMPONENT32F:l===gn&&(D=e.DEPTH_COMPONENT16),D}function y(_,l){return f(_)===!0||_.isFramebufferTexture&&_.minFilter!==Yt&&_.minFilter!==Ot?Math.log2(Math.max(l.width,l.height))+1:_.mipmaps!==void 0&&_.mipmaps.length>0?_.mipmaps.length:_.isCompressedTexture&&Array.isArray(_.image)?l.mipmaps.length:1}function R(_){const l=_.target;l.removeEventListener("dispose",R),O(l),l.isVideoTexture&&T.delete(l)}function I(_){const l=_.target;l.removeEventListener("dispose",I),h(l)}function O(_){const l=i.get(_);if(l.__webglInit===void 0)return;const D=_.source,H=m.get(D);if(H){const q=H[l.__cacheKey];q.usedTimes--,q.usedTimes===0&&g(_),Object.keys(H).length===0&&m.delete(D)}i.remove(_)}function g(_){const l=i.get(_);e.deleteTexture(l.__webglTexture);const D=_.source,H=m.get(D);delete H[l.__cacheKey],o.memory.textures--}function h(_){const l=i.get(_);if(_.depthTexture&&(_.depthTexture.dispose(),i.remove(_.depthTexture)),_.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(l.__webglFramebuffer[H]))for(let q=0;q<l.__webglFramebuffer[H].length;q++)e.deleteFramebuffer(l.__webglFramebuffer[H][q]);else e.deleteFramebuffer(l.__webglFramebuffer[H]);l.__webglDepthbuffer&&e.deleteRenderbuffer(l.__webglDepthbuffer[H])}else{if(Array.isArray(l.__webglFramebuffer))for(let H=0;H<l.__webglFramebuffer.length;H++)e.deleteFramebuffer(l.__webglFramebuffer[H]);else e.deleteFramebuffer(l.__webglFramebuffer);if(l.__webglDepthbuffer&&e.deleteRenderbuffer(l.__webglDepthbuffer),l.__webglMultisampledFramebuffer&&e.deleteFramebuffer(l.__webglMultisampledFramebuffer),l.__webglColorRenderbuffer)for(let H=0;H<l.__webglColorRenderbuffer.length;H++)l.__webglColorRenderbuffer[H]&&e.deleteRenderbuffer(l.__webglColorRenderbuffer[H]);l.__webglDepthRenderbuffer&&e.deleteRenderbuffer(l.__webglDepthRenderbuffer)}const D=_.textures;for(let H=0,q=D.length;H<q;H++){const G=i.get(D[H]);G.__webglTexture&&(e.deleteTexture(G.__webglTexture),o.memory.textures--),i.remove(D[H])}i.remove(_)}let b=0;function B(){b=0}function Y(){const _=b;return _>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+_+" texture units while this GPU supports only "+a.maxTextures),b+=1,_}function K(_){const l=[];return l.push(_.wrapS),l.push(_.wrapT),l.push(_.wrapR||0),l.push(_.magFilter),l.push(_.minFilter),l.push(_.anisotropy),l.push(_.internalFormat),l.push(_.format),l.push(_.type),l.push(_.generateMipmaps),l.push(_.premultiplyAlpha),l.push(_.flipY),l.push(_.unpackAlignment),l.push(_.colorSpace),l.join()}function z(_,l){const D=i.get(_);if(_.isVideoTexture&&ye(_),_.isRenderTargetTexture===!1&&_.isExternalTexture!==!0&&_.version>0&&D.__version!==_.version){const H=_.image;if(H===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{k(D,_,l);return}}else _.isExternalTexture&&(D.__webglTexture=_.sourceTexture?_.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,D.__webglTexture,e.TEXTURE0+l)}function W(_,l){const D=i.get(_);if(_.isRenderTargetTexture===!1&&_.version>0&&D.__version!==_.version){k(D,_,l);return}n.bindTexture(e.TEXTURE_2D_ARRAY,D.__webglTexture,e.TEXTURE0+l)}function ee(_,l){const D=i.get(_);if(_.isRenderTargetTexture===!1&&_.version>0&&D.__version!==_.version){k(D,_,l);return}n.bindTexture(e.TEXTURE_3D,D.__webglTexture,e.TEXTURE0+l)}function V(_,l){const D=i.get(_);if(_.version>0&&D.__version!==_.version){$(D,_,l);return}n.bindTexture(e.TEXTURE_CUBE_MAP,D.__webglTexture,e.TEXTURE0+l)}const ge={[wr]:e.REPEAT,[Cr]:e.CLAMP_TO_EDGE,[br]:e.MIRRORED_REPEAT},Te={[Yt]:e.NEAREST,[Pr]:e.NEAREST_MIPMAP_NEAREST,[Qt]:e.NEAREST_MIPMAP_LINEAR,[Ot]:e.LINEAR,[dn]:e.LINEAR_MIPMAP_NEAREST,[Wt]:e.LINEAR_MIPMAP_LINEAR},Ue={[Oa]:e.NEVER,[Fa]:e.ALWAYS,[Na]:e.LESS,[Lr]:e.LEQUAL,[Ia]:e.EQUAL,[Da]:e.GEQUAL,[ya]:e.GREATER,[Ua]:e.NOTEQUAL};function He(_,l){if(l.type===Bt&&t.has("OES_texture_float_linear")===!1&&(l.magFilter===Ot||l.magFilter===dn||l.magFilter===Qt||l.magFilter===Wt||l.minFilter===Ot||l.minFilter===dn||l.minFilter===Qt||l.minFilter===Wt)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(_,e.TEXTURE_WRAP_S,ge[l.wrapS]),e.texParameteri(_,e.TEXTURE_WRAP_T,ge[l.wrapT]),(_===e.TEXTURE_3D||_===e.TEXTURE_2D_ARRAY)&&e.texParameteri(_,e.TEXTURE_WRAP_R,ge[l.wrapR]),e.texParameteri(_,e.TEXTURE_MAG_FILTER,Te[l.magFilter]),e.texParameteri(_,e.TEXTURE_MIN_FILTER,Te[l.minFilter]),l.compareFunction&&(e.texParameteri(_,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(_,e.TEXTURE_COMPARE_FUNC,Ue[l.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(l.magFilter===Yt||l.minFilter!==Qt&&l.minFilter!==Wt||l.type===Bt&&t.has("OES_texture_float_linear")===!1)return;if(l.anisotropy>1||i.get(l).__currentAnisotropy){const D=t.get("EXT_texture_filter_anisotropic");e.texParameterf(_,D.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(l.anisotropy,a.getMaxAnisotropy())),i.get(l).__currentAnisotropy=l.anisotropy}}}function nt(_,l){let D=!1;_.__webglInit===void 0&&(_.__webglInit=!0,l.addEventListener("dispose",R));const H=l.source;let q=m.get(H);q===void 0&&(q={},m.set(H,q));const G=K(l);if(G!==_.__cacheKey){q[G]===void 0&&(q[G]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,D=!0),q[G].usedTimes++;const ve=q[_.__cacheKey];ve!==void 0&&(q[_.__cacheKey].usedTimes--,ve.usedTimes===0&&g(l)),_.__cacheKey=G,_.__webglTexture=q[G].texture}return D}function je(_,l,D){return Math.floor(Math.floor(_/D)/l)}function ze(_,l,D,H){const G=_.updateRanges;if(G.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,l.width,l.height,D,H,l.data);else{G.sort((Q,oe)=>Q.start-oe.start);let ve=0;for(let Q=1;Q<G.length;Q++){const oe=G[ve],Ae=G[Q],_e=oe.start+oe.count,re=je(Ae.start,l.width,4),Le=je(oe.start,l.width,4);Ae.start<=_e+1&&re===Le&&je(Ae.start+Ae.count-1,l.width,4)===re?oe.count=Math.max(oe.count,Ae.start+Ae.count-oe.start):(++ve,G[ve]=Ae)}G.length=ve+1;const te=e.getParameter(e.UNPACK_ROW_LENGTH),he=e.getParameter(e.UNPACK_SKIP_PIXELS),me=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,l.width);for(let Q=0,oe=G.length;Q<oe;Q++){const Ae=G[Q],_e=Math.floor(Ae.start/4),re=Math.ceil(Ae.count/4),Le=_e%l.width,A=Math.floor(_e/l.width),j=re,ne=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,Le),e.pixelStorei(e.UNPACK_SKIP_ROWS,A),n.texSubImage2D(e.TEXTURE_2D,0,Le,A,j,ne,D,H,l.data)}_.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,te),e.pixelStorei(e.UNPACK_SKIP_PIXELS,he),e.pixelStorei(e.UNPACK_SKIP_ROWS,me)}}function k(_,l,D){let H=e.TEXTURE_2D;(l.isDataArrayTexture||l.isCompressedArrayTexture)&&(H=e.TEXTURE_2D_ARRAY),l.isData3DTexture&&(H=e.TEXTURE_3D);const q=nt(_,l),G=l.source;n.bindTexture(H,_.__webglTexture,e.TEXTURE0+D);const ve=i.get(G);if(G.version!==ve.__version||q===!0){n.activeTexture(e.TEXTURE0+D);const te=rt.getPrimaries(rt.workingColorSpace),he=l.colorSpace===Nt?null:rt.getPrimaries(l.colorSpace),me=l.colorSpace===Nt||te===he?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,l.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,l.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,l.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let Q=x(l.image,!1,a.maxTextureSize);Q=st(l,Q);const oe=r.convert(l.format,l.colorSpace),Ae=r.convert(l.type);let _e=P(l.internalFormat,oe,Ae,l.colorSpace,l.isVideoTexture);He(H,l);let re;const Le=l.mipmaps,A=l.isVideoTexture!==!0,j=ve.__version===void 0||q===!0,ne=G.dataReady,ce=y(l,Q);if(l.isDepthTexture)_e=S(l.format===mn,l.type),j&&(A?n.texStorage2D(e.TEXTURE_2D,1,_e,Q.width,Q.height):n.texImage2D(e.TEXTURE_2D,0,_e,Q.width,Q.height,0,oe,Ae,null));else if(l.isDataTexture)if(Le.length>0){A&&j&&n.texStorage2D(e.TEXTURE_2D,ce,_e,Le[0].width,Le[0].height);for(let Z=0,X=Le.length;Z<X;Z++)re=Le[Z],A?ne&&n.texSubImage2D(e.TEXTURE_2D,Z,0,0,re.width,re.height,oe,Ae,re.data):n.texImage2D(e.TEXTURE_2D,Z,_e,re.width,re.height,0,oe,Ae,re.data);l.generateMipmaps=!1}else A?(j&&n.texStorage2D(e.TEXTURE_2D,ce,_e,Q.width,Q.height),ne&&ze(l,Q,oe,Ae)):n.texImage2D(e.TEXTURE_2D,0,_e,Q.width,Q.height,0,oe,Ae,Q.data);else if(l.isCompressedTexture)if(l.isCompressedArrayTexture){A&&j&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ce,_e,Le[0].width,Le[0].height,Q.depth);for(let Z=0,X=Le.length;Z<X;Z++)if(re=Le[Z],l.format!==xt)if(oe!==null)if(A){if(ne)if(l.layerUpdates.size>0){const ue=ki(re.width,re.height,l.format,l.type);for(const we of l.layerUpdates){const Xe=re.data.subarray(we*ue/re.data.BYTES_PER_ELEMENT,(we+1)*ue/re.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,we,re.width,re.height,1,oe,Xe)}l.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,re.width,re.height,Q.depth,oe,re.data)}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Z,_e,re.width,re.height,Q.depth,0,re.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else A?ne&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,re.width,re.height,Q.depth,oe,Ae,re.data):n.texImage3D(e.TEXTURE_2D_ARRAY,Z,_e,re.width,re.height,Q.depth,0,oe,Ae,re.data)}else{A&&j&&n.texStorage2D(e.TEXTURE_2D,ce,_e,Le[0].width,Le[0].height);for(let Z=0,X=Le.length;Z<X;Z++)re=Le[Z],l.format!==xt?oe!==null?A?ne&&n.compressedTexSubImage2D(e.TEXTURE_2D,Z,0,0,re.width,re.height,oe,re.data):n.compressedTexImage2D(e.TEXTURE_2D,Z,_e,re.width,re.height,0,re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):A?ne&&n.texSubImage2D(e.TEXTURE_2D,Z,0,0,re.width,re.height,oe,Ae,re.data):n.texImage2D(e.TEXTURE_2D,Z,_e,re.width,re.height,0,oe,Ae,re.data)}else if(l.isDataArrayTexture)if(A){if(j&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ce,_e,Q.width,Q.height,Q.depth),ne)if(l.layerUpdates.size>0){const Z=ki(Q.width,Q.height,l.format,l.type);for(const X of l.layerUpdates){const ue=Q.data.subarray(X*Z/Q.data.BYTES_PER_ELEMENT,(X+1)*Z/Q.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,X,Q.width,Q.height,1,oe,Ae,ue)}l.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,oe,Ae,Q.data)}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,_e,Q.width,Q.height,Q.depth,0,oe,Ae,Q.data);else if(l.isData3DTexture)A?(j&&n.texStorage3D(e.TEXTURE_3D,ce,_e,Q.width,Q.height,Q.depth),ne&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,oe,Ae,Q.data)):n.texImage3D(e.TEXTURE_3D,0,_e,Q.width,Q.height,Q.depth,0,oe,Ae,Q.data);else if(l.isFramebufferTexture){if(j)if(A)n.texStorage2D(e.TEXTURE_2D,ce,_e,Q.width,Q.height);else{let Z=Q.width,X=Q.height;for(let ue=0;ue<ce;ue++)n.texImage2D(e.TEXTURE_2D,ue,_e,Z,X,0,oe,Ae,null),Z>>=1,X>>=1}}else if(Le.length>0){if(A&&j){const Z=it(Le[0]);n.texStorage2D(e.TEXTURE_2D,ce,_e,Z.width,Z.height)}for(let Z=0,X=Le.length;Z<X;Z++)re=Le[Z],A?ne&&n.texSubImage2D(e.TEXTURE_2D,Z,0,0,oe,Ae,re):n.texImage2D(e.TEXTURE_2D,Z,_e,oe,Ae,re);l.generateMipmaps=!1}else if(A){if(j){const Z=it(Q);n.texStorage2D(e.TEXTURE_2D,ce,_e,Z.width,Z.height)}ne&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,oe,Ae,Q)}else n.texImage2D(e.TEXTURE_2D,0,_e,oe,Ae,Q);f(l)&&c(H),ve.__version=G.version,l.onUpdate&&l.onUpdate(l)}_.__version=l.version}function $(_,l,D){if(l.image.length!==6)return;const H=nt(_,l),q=l.source;n.bindTexture(e.TEXTURE_CUBE_MAP,_.__webglTexture,e.TEXTURE0+D);const G=i.get(q);if(q.version!==G.__version||H===!0){n.activeTexture(e.TEXTURE0+D);const ve=rt.getPrimaries(rt.workingColorSpace),te=l.colorSpace===Nt?null:rt.getPrimaries(l.colorSpace),he=l.colorSpace===Nt||ve===te?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,l.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,l.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,l.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);const me=l.isCompressedTexture||l.image[0].isCompressedTexture,Q=l.image[0]&&l.image[0].isDataTexture,oe=[];for(let X=0;X<6;X++)!me&&!Q?oe[X]=x(l.image[X],!0,a.maxCubemapSize):oe[X]=Q?l.image[X].image:l.image[X],oe[X]=st(l,oe[X]);const Ae=oe[0],_e=r.convert(l.format,l.colorSpace),re=r.convert(l.type),Le=P(l.internalFormat,_e,re,l.colorSpace),A=l.isVideoTexture!==!0,j=G.__version===void 0||H===!0,ne=q.dataReady;let ce=y(l,Ae);He(e.TEXTURE_CUBE_MAP,l);let Z;if(me){A&&j&&n.texStorage2D(e.TEXTURE_CUBE_MAP,ce,Le,Ae.width,Ae.height);for(let X=0;X<6;X++){Z=oe[X].mipmaps;for(let ue=0;ue<Z.length;ue++){const we=Z[ue];l.format!==xt?_e!==null?A?ne&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue,0,0,we.width,we.height,_e,we.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue,Le,we.width,we.height,0,we.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):A?ne&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue,0,0,we.width,we.height,_e,re,we.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue,Le,we.width,we.height,0,_e,re,we.data)}}}else{if(Z=l.mipmaps,A&&j){Z.length>0&&ce++;const X=it(oe[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,ce,Le,X.width,X.height)}for(let X=0;X<6;X++)if(Q){A?ne&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,oe[X].width,oe[X].height,_e,re,oe[X].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Le,oe[X].width,oe[X].height,0,_e,re,oe[X].data);for(let ue=0;ue<Z.length;ue++){const Xe=Z[ue].image[X].image;A?ne&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue+1,0,0,Xe.width,Xe.height,_e,re,Xe.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue+1,Le,Xe.width,Xe.height,0,_e,re,Xe.data)}}else{A?ne&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,0,0,_e,re,oe[X]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,0,Le,_e,re,oe[X]);for(let ue=0;ue<Z.length;ue++){const we=Z[ue];A?ne&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue+1,0,0,_e,re,we.image[X]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+X,ue+1,Le,_e,re,we.image[X])}}}f(l)&&c(e.TEXTURE_CUBE_MAP),G.__version=q.version,l.onUpdate&&l.onUpdate(l)}_.__version=l.version}function le(_,l,D,H,q,G){const ve=r.convert(D.format,D.colorSpace),te=r.convert(D.type),he=P(D.internalFormat,ve,te,D.colorSpace),me=i.get(l),Q=i.get(D);if(Q.__renderTarget=l,!me.__hasExternalTextures){const oe=Math.max(1,l.width>>G),Ae=Math.max(1,l.height>>G);q===e.TEXTURE_3D||q===e.TEXTURE_2D_ARRAY?n.texImage3D(q,G,he,oe,Ae,l.depth,0,ve,te,null):n.texImage2D(q,G,he,oe,Ae,0,ve,te,null)}n.bindFramebuffer(e.FRAMEBUFFER,_),pe(l)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,H,q,Q.__webglTexture,0,Ze(l)):(q===e.TEXTURE_2D||q>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,H,q,Q.__webglTexture,G),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ce(_,l,D){if(e.bindRenderbuffer(e.RENDERBUFFER,_),l.depthBuffer){const H=l.depthTexture,q=H&&H.isDepthTexture?H.type:null,G=S(l.stencilBuffer,q),ve=l.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,te=Ze(l);pe(l)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,te,G,l.width,l.height):D?e.renderbufferStorageMultisample(e.RENDERBUFFER,te,G,l.width,l.height):e.renderbufferStorage(e.RENDERBUFFER,G,l.width,l.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,ve,e.RENDERBUFFER,_)}else{const H=l.textures;for(let q=0;q<H.length;q++){const G=H[q],ve=r.convert(G.format,G.colorSpace),te=r.convert(G.type),he=P(G.internalFormat,ve,te,G.colorSpace),me=Ze(l);D&&pe(l)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,me,he,l.width,l.height):pe(l)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,me,he,l.width,l.height):e.renderbufferStorage(e.RENDERBUFFER,he,l.width,l.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Ee(_,l){if(l&&l.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(e.FRAMEBUFFER,_),!(l.depthTexture&&l.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const H=i.get(l.depthTexture);H.__renderTarget=l,(!H.__webglTexture||l.depthTexture.image.width!==l.width||l.depthTexture.image.height!==l.height)&&(l.depthTexture.image.width=l.width,l.depthTexture.image.height=l.height,l.depthTexture.needsUpdate=!0),z(l.depthTexture,0);const q=H.__webglTexture,G=Ze(l);if(l.depthTexture.format===ei)pe(l)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,q,0,G):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,q,0);else if(l.depthTexture.format===mn)pe(l)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,q,0,G):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,q,0);else throw new Error("Unknown depthTexture format")}function Oe(_){const l=i.get(_),D=_.isWebGLCubeRenderTarget===!0;if(l.__boundDepthTexture!==_.depthTexture){const H=_.depthTexture;if(l.__depthDisposeCallback&&l.__depthDisposeCallback(),H){const q=()=>{delete l.__boundDepthTexture,delete l.__depthDisposeCallback,H.removeEventListener("dispose",q)};H.addEventListener("dispose",q),l.__depthDisposeCallback=q}l.__boundDepthTexture=H}if(_.depthTexture&&!l.__autoAllocateDepthBuffer){if(D)throw new Error("target.depthTexture not supported in Cube render targets");const H=_.texture.mipmaps;H&&H.length>0?Ee(l.__webglFramebuffer[0],_):Ee(l.__webglFramebuffer,_)}else if(D){l.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer[H]),l.__webglDepthbuffer[H]===void 0)l.__webglDepthbuffer[H]=e.createRenderbuffer(),Ce(l.__webglDepthbuffer[H],_,!1);else{const q=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,G=l.__webglDepthbuffer[H];e.bindRenderbuffer(e.RENDERBUFFER,G),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,G)}}else{const H=_.texture.mipmaps;if(H&&H.length>0?n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer),l.__webglDepthbuffer===void 0)l.__webglDepthbuffer=e.createRenderbuffer(),Ce(l.__webglDepthbuffer,_,!1);else{const q=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,G=l.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,G),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,G)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ct(_,l,D){const H=i.get(_);l!==void 0&&le(H.__webglFramebuffer,_,_.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),D!==void 0&&Oe(_)}function M(_){const l=_.texture,D=i.get(_),H=i.get(l);_.addEventListener("dispose",I);const q=_.textures,G=_.isWebGLCubeRenderTarget===!0,ve=q.length>1;if(ve||(H.__webglTexture===void 0&&(H.__webglTexture=e.createTexture()),H.__version=l.version,o.memory.textures++),G){D.__webglFramebuffer=[];for(let te=0;te<6;te++)if(l.mipmaps&&l.mipmaps.length>0){D.__webglFramebuffer[te]=[];for(let he=0;he<l.mipmaps.length;he++)D.__webglFramebuffer[te][he]=e.createFramebuffer()}else D.__webglFramebuffer[te]=e.createFramebuffer()}else{if(l.mipmaps&&l.mipmaps.length>0){D.__webglFramebuffer=[];for(let te=0;te<l.mipmaps.length;te++)D.__webglFramebuffer[te]=e.createFramebuffer()}else D.__webglFramebuffer=e.createFramebuffer();if(ve)for(let te=0,he=q.length;te<he;te++){const me=i.get(q[te]);me.__webglTexture===void 0&&(me.__webglTexture=e.createTexture(),o.memory.textures++)}if(_.samples>0&&pe(_)===!1){D.__webglMultisampledFramebuffer=e.createFramebuffer(),D.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let te=0;te<q.length;te++){const he=q[te];D.__webglColorRenderbuffer[te]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,D.__webglColorRenderbuffer[te]);const me=r.convert(he.format,he.colorSpace),Q=r.convert(he.type),oe=P(he.internalFormat,me,Q,he.colorSpace,_.isXRRenderTarget===!0),Ae=Ze(_);e.renderbufferStorageMultisample(e.RENDERBUFFER,Ae,oe,_.width,_.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+te,e.RENDERBUFFER,D.__webglColorRenderbuffer[te])}e.bindRenderbuffer(e.RENDERBUFFER,null),_.depthBuffer&&(D.__webglDepthRenderbuffer=e.createRenderbuffer(),Ce(D.__webglDepthRenderbuffer,_,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(G){n.bindTexture(e.TEXTURE_CUBE_MAP,H.__webglTexture),He(e.TEXTURE_CUBE_MAP,l);for(let te=0;te<6;te++)if(l.mipmaps&&l.mipmaps.length>0)for(let he=0;he<l.mipmaps.length;he++)le(D.__webglFramebuffer[te][he],_,l,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+te,he);else le(D.__webglFramebuffer[te],_,l,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);f(l)&&c(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ve){for(let te=0,he=q.length;te<he;te++){const me=q[te],Q=i.get(me);let oe=e.TEXTURE_2D;(_.isWebGL3DRenderTarget||_.isWebGLArrayRenderTarget)&&(oe=_.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(oe,Q.__webglTexture),He(oe,me),le(D.__webglFramebuffer,_,me,e.COLOR_ATTACHMENT0+te,oe,0),f(me)&&c(oe)}n.unbindTexture()}else{let te=e.TEXTURE_2D;if((_.isWebGL3DRenderTarget||_.isWebGLArrayRenderTarget)&&(te=_.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(te,H.__webglTexture),He(te,l),l.mipmaps&&l.mipmaps.length>0)for(let he=0;he<l.mipmaps.length;he++)le(D.__webglFramebuffer[he],_,l,e.COLOR_ATTACHMENT0,te,he);else le(D.__webglFramebuffer,_,l,e.COLOR_ATTACHMENT0,te,0);f(l)&&c(te),n.unbindTexture()}_.depthBuffer&&Oe(_)}function $e(_){const l=_.textures;for(let D=0,H=l.length;D<H;D++){const q=l[D];if(f(q)){const G=U(_),ve=i.get(q).__webglTexture;n.bindTexture(G,ve),c(G),n.unbindTexture()}}}const Pe=[],Re=[];function de(_){if(_.samples>0){if(pe(_)===!1){const l=_.textures,D=_.width,H=_.height;let q=e.COLOR_BUFFER_BIT;const G=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,ve=i.get(_),te=l.length>1;if(te)for(let me=0;me<l.length;me++)n.bindFramebuffer(e.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,ve.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer);const he=_.texture.mipmaps;he&&he.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let me=0;me<l.length;me++){if(_.resolveDepthBuffer&&(_.depthBuffer&&(q|=e.DEPTH_BUFFER_BIT),_.stencilBuffer&&_.resolveStencilBuffer&&(q|=e.STENCIL_BUFFER_BIT)),te){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,ve.__webglColorRenderbuffer[me]);const Q=i.get(l[me]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,Q,0)}e.blitFramebuffer(0,0,D,H,0,0,D,H,q,e.NEAREST),d===!0&&(Pe.length=0,Re.length=0,Pe.push(e.COLOR_ATTACHMENT0+me),_.depthBuffer&&_.resolveDepthBuffer===!1&&(Pe.push(G),Re.push(G),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Re)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Pe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),te)for(let me=0;me<l.length;me++){n.bindFramebuffer(e.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.RENDERBUFFER,ve.__webglColorRenderbuffer[me]);const Q=i.get(l[me]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,ve.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+me,e.TEXTURE_2D,Q,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(_.depthBuffer&&_.resolveDepthBuffer===!1&&d){const l=_.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[l])}}}function Ze(_){return Math.min(a.maxSamples,_.samples)}function pe(_){const l=i.get(_);return _.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&l.__useRenderToTexture!==!1}function ye(_){const l=o.render.frame;T.get(_)!==l&&(T.set(_,l),_.update())}function st(_,l){const D=_.colorSpace,H=_.format,q=_.type;return _.isCompressedTexture===!0||_.isVideoTexture===!0||D!==Mn&&D!==Nt&&(rt.getTransfer(D)===Ke?(H!==xt||q!==Ht)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",D)),l}function it(_){return typeof HTMLImageElement<"u"&&_ instanceof HTMLImageElement?(v.width=_.naturalWidth||_.width,v.height=_.naturalHeight||_.height):typeof VideoFrame<"u"&&_ instanceof VideoFrame?(v.width=_.displayWidth,v.height=_.displayHeight):(v.width=_.width,v.height=_.height),v}this.allocateTextureUnit=Y,this.resetTextureUnits=B,this.setTexture2D=z,this.setTexture2DArray=W,this.setTexture3D=ee,this.setTextureCube=V,this.rebindTextures=ct,this.setupRenderTarget=M,this.updateRenderTargetMipmap=$e,this.updateMultisampleRenderTarget=de,this.setupDepthRenderbuffer=Oe,this.setupFrameBufferTexture=le,this.useMultisampledRTT=pe}function su(e,t){function n(i,a=Nt){let r;const o=rt.getTransfer(a);if(i===Ht)return e.UNSIGNED_BYTE;if(i===yr)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Dr)return e.UNSIGNED_SHORT_5_5_5_1;if(i===ka)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===za)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===Wa)return e.BYTE;if(i===Xa)return e.SHORT;if(i===gn)return e.UNSIGNED_SHORT;if(i===Fr)return e.INT;if(i===an)return e.UNSIGNED_INT;if(i===Bt)return e.FLOAT;if(i===Sn)return e.HALF_FLOAT;if(i===Ya)return e.ALPHA;if(i===Ka)return e.RGB;if(i===xt)return e.RGBA;if(i===ei)return e.DEPTH_COMPONENT;if(i===mn)return e.DEPTH_STENCIL;if(i===qa)return e.RED;if(i===Or)return e.RED_INTEGER;if(i===$a)return e.RG;if(i===Br)return e.RG_INTEGER;if(i===Gr)return e.RGBA_INTEGER;if(i===wn||i===Pn||i===Ln||i===Un)if(o===Ke)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===wn)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Pn)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Ln)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Un)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===wn)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Pn)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Ln)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Un)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===li||i===fi||i===ui||i===di)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===li)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===fi)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===ui)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===di)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===pi||i===hi||i===mi)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===pi||i===hi)return o===Ke?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===mi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===_i||i===gi||i===vi||i===Ei||i===Si||i===Mi||i===Ti||i===xi||i===Ai||i===Ri||i===bi||i===Ci||i===wi||i===Pi)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===_i)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===gi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===vi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Ei)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Si)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Mi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ti)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===xi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ai)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ri)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===bi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Ci)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===wi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Pi)return o===Ke?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Li||i===Ui||i===yi)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Li)return o===Ke?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ui)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===yi)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Di||i===Ii||i===Ni||i===Fi)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Di)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Ii)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ni)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Fi)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===rn?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:n}}const cu=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,lu=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class fu{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,n){if(this.texture===null){const i=new Ir(t.texture);(t.depthNear!==n.depthNear||t.depthFar!==n.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const n=t.cameras[0].viewport,i=new Vt({vertexShader:cu,fragmentShader:lu,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new Ct(new Nr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class uu extends ua{constructor(t,n){super();const i=this;let a=null,r=1,o=null,s="local-floor",d=1,v=null,T=null,p=null,m=null,E=null,C=null;const x=typeof XRWebGLBinding<"u",f=new fu,c={},U=n.getContextAttributes();let P=null,S=null;const y=[],R=[],I=new pt;let O=null;const g=new un;g.viewport=new dt;const h=new un;h.viewport=new dt;const b=[g,h],B=new da;let Y=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let $=y[k];return $===void 0&&($=new Cn,y[k]=$),$.getTargetRaySpace()},this.getControllerGrip=function(k){let $=y[k];return $===void 0&&($=new Cn,y[k]=$),$.getGripSpace()},this.getHand=function(k){let $=y[k];return $===void 0&&($=new Cn,y[k]=$),$.getHandSpace()};function z(k){const $=R.indexOf(k.inputSource);if($===-1)return;const le=y[$];le!==void 0&&(le.update(k.inputSource,k.frame,v||o),le.dispatchEvent({type:k.type,data:k.inputSource}))}function W(){a.removeEventListener("select",z),a.removeEventListener("selectstart",z),a.removeEventListener("selectend",z),a.removeEventListener("squeeze",z),a.removeEventListener("squeezestart",z),a.removeEventListener("squeezeend",z),a.removeEventListener("end",W),a.removeEventListener("inputsourceschange",ee);for(let k=0;k<y.length;k++){const $=R[k];$!==null&&(R[k]=null,y[k].disconnect($))}Y=null,K=null,f.reset();for(const k in c)delete c[k];t.setRenderTarget(P),E=null,m=null,p=null,a=null,S=null,ze.stop(),i.isPresenting=!1,t.setPixelRatio(O),t.setSize(I.width,I.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){s=k,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return v||o},this.setReferenceSpace=function(k){v=k},this.getBaseLayer=function(){return m!==null?m:E},this.getBinding=function(){return p===null&&x&&(p=new XRWebGLBinding(a,n)),p},this.getFrame=function(){return C},this.getSession=function(){return a},this.setSession=async function(k){if(a=k,a!==null){if(P=t.getRenderTarget(),a.addEventListener("select",z),a.addEventListener("selectstart",z),a.addEventListener("selectend",z),a.addEventListener("squeeze",z),a.addEventListener("squeezestart",z),a.addEventListener("squeezeend",z),a.addEventListener("end",W),a.addEventListener("inputsourceschange",ee),U.xrCompatible!==!0&&await n.makeXRCompatible(),O=t.getPixelRatio(),t.getSize(I),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let le=null,Ce=null,Ee=null;U.depth&&(Ee=U.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,le=U.stencil?mn:ei,Ce=U.stencil?rn:an);const Oe={colorFormat:n.RGBA8,depthFormat:Ee,scaleFactor:r};p=this.getBinding(),m=p.createProjectionLayer(Oe),a.updateRenderState({layers:[m]}),t.setPixelRatio(1),t.setSize(m.textureWidth,m.textureHeight,!1),S=new Kt(m.textureWidth,m.textureHeight,{format:xt,type:Ht,depthTexture:new Rr(m.textureWidth,m.textureHeight,Ce,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:U.stencil,colorSpace:t.outputColorSpace,samples:U.antialias?4:0,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}else{const le={antialias:U.antialias,alpha:!0,depth:U.depth,stencil:U.stencil,framebufferScaleFactor:r};E=new XRWebGLLayer(a,n,le),a.updateRenderState({baseLayer:E}),t.setPixelRatio(1),t.setSize(E.framebufferWidth,E.framebufferHeight,!1),S=new Kt(E.framebufferWidth,E.framebufferHeight,{format:xt,type:Ht,colorSpace:t.outputColorSpace,stencilBuffer:U.stencil,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(d),v=null,o=await a.requestReferenceSpace(s),ze.setContext(a),ze.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return f.getDepthTexture()};function ee(k){for(let $=0;$<k.removed.length;$++){const le=k.removed[$],Ce=R.indexOf(le);Ce>=0&&(R[Ce]=null,y[Ce].disconnect(le))}for(let $=0;$<k.added.length;$++){const le=k.added[$];let Ce=R.indexOf(le);if(Ce===-1){for(let Oe=0;Oe<y.length;Oe++)if(Oe>=R.length){R.push(le),Ce=Oe;break}else if(R[Oe]===null){R[Oe]=le,Ce=Oe;break}if(Ce===-1)break}const Ee=y[Ce];Ee&&Ee.connect(le)}}const V=new Fe,ge=new Fe;function Te(k,$,le){V.setFromMatrixPosition($.matrixWorld),ge.setFromMatrixPosition(le.matrixWorld);const Ce=V.distanceTo(ge),Ee=$.projectionMatrix.elements,Oe=le.projectionMatrix.elements,ct=Ee[14]/(Ee[10]-1),M=Ee[14]/(Ee[10]+1),$e=(Ee[9]+1)/Ee[5],Pe=(Ee[9]-1)/Ee[5],Re=(Ee[8]-1)/Ee[0],de=(Oe[8]+1)/Oe[0],Ze=ct*Re,pe=ct*de,ye=Ce/(-Re+de),st=ye*-Re;if($.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(st),k.translateZ(ye),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),Ee[10]===-1)k.projectionMatrix.copy($.projectionMatrix),k.projectionMatrixInverse.copy($.projectionMatrixInverse);else{const it=ct+ye,_=M+ye,l=Ze-st,D=pe+(Ce-st),H=$e*M/_*it,q=Pe*M/_*it;k.projectionMatrix.makePerspective(l,D,H,q,it,_),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function Ue(k,$){$===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices($.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(a===null)return;let $=k.near,le=k.far;f.texture!==null&&(f.depthNear>0&&($=f.depthNear),f.depthFar>0&&(le=f.depthFar)),B.near=h.near=g.near=$,B.far=h.far=g.far=le,(Y!==B.near||K!==B.far)&&(a.updateRenderState({depthNear:B.near,depthFar:B.far}),Y=B.near,K=B.far),B.layers.mask=k.layers.mask|6,g.layers.mask=B.layers.mask&3,h.layers.mask=B.layers.mask&5;const Ce=k.parent,Ee=B.cameras;Ue(B,Ce);for(let Oe=0;Oe<Ee.length;Oe++)Ue(Ee[Oe],Ce);Ee.length===2?Te(B,g,h):B.projectionMatrix.copy(g.projectionMatrix),He(k,B,Ce)};function He(k,$,le){le===null?k.matrix.copy($.matrixWorld):(k.matrix.copy(le.matrixWorld),k.matrix.invert(),k.matrix.multiply($.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy($.projectionMatrix),k.projectionMatrixInverse.copy($.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=pa*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return B},this.getFoveation=function(){if(!(m===null&&E===null))return d},this.setFoveation=function(k){d=k,m!==null&&(m.fixedFoveation=k),E!==null&&E.fixedFoveation!==void 0&&(E.fixedFoveation=k)},this.hasDepthSensing=function(){return f.texture!==null},this.getDepthSensingMesh=function(){return f.getMesh(B)},this.getCameraTexture=function(k){return c[k]};let nt=null;function je(k,$){if(T=$.getViewerPose(v||o),C=$,T!==null){const le=T.views;E!==null&&(t.setRenderTargetFramebuffer(S,E.framebuffer),t.setRenderTarget(S));let Ce=!1;le.length!==B.cameras.length&&(B.cameras.length=0,Ce=!0);for(let M=0;M<le.length;M++){const $e=le[M];let Pe=null;if(E!==null)Pe=E.getViewport($e);else{const de=p.getViewSubImage(m,$e);Pe=de.viewport,M===0&&(t.setRenderTargetTextures(S,de.colorTexture,de.depthStencilTexture),t.setRenderTarget(S))}let Re=b[M];Re===void 0&&(Re=new un,Re.layers.enable(M),Re.viewport=new dt,b[M]=Re),Re.matrix.fromArray($e.transform.matrix),Re.matrix.decompose(Re.position,Re.quaternion,Re.scale),Re.projectionMatrix.fromArray($e.projectionMatrix),Re.projectionMatrixInverse.copy(Re.projectionMatrix).invert(),Re.viewport.set(Pe.x,Pe.y,Pe.width,Pe.height),M===0&&(B.matrix.copy(Re.matrix),B.matrix.decompose(B.position,B.quaternion,B.scale)),Ce===!0&&B.cameras.push(Re)}const Ee=a.enabledFeatures;if(Ee&&Ee.includes("depth-sensing")&&a.depthUsage=="gpu-optimized"&&x){p=i.getBinding();const M=p.getDepthInformation(le[0]);M&&M.isValid&&M.texture&&f.init(M,a.renderState)}if(Ee&&Ee.includes("camera-access")&&x){t.state.unbindTexture(),p=i.getBinding();for(let M=0;M<le.length;M++){const $e=le[M].camera;if($e){let Pe=c[$e];Pe||(Pe=new Ir,c[$e]=Pe);const Re=p.getCameraImage($e);Pe.sourceTexture=Re}}}}for(let le=0;le<y.length;le++){const Ce=R[le],Ee=y[le];Ce!==null&&Ee!==void 0&&Ee.update(Ce,$,v||o)}nt&&nt(k,$),$.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:$}),C=null}const ze=new Yr;ze.setAnimationLoop(je),this.setAnimationLoop=function(k){nt=k},this.dispose=function(){}}}const Dt=new kr,du=new At;function pu(e,t){function n(f,c){f.matrixAutoUpdate===!0&&f.updateMatrix(),c.value.copy(f.matrix)}function i(f,c){c.color.getRGB(f.fogColor.value,Vr(e)),c.isFog?(f.fogNear.value=c.near,f.fogFar.value=c.far):c.isFogExp2&&(f.fogDensity.value=c.density)}function a(f,c,U,P,S){c.isMeshBasicMaterial||c.isMeshLambertMaterial?r(f,c):c.isMeshToonMaterial?(r(f,c),p(f,c)):c.isMeshPhongMaterial?(r(f,c),T(f,c)):c.isMeshStandardMaterial?(r(f,c),m(f,c),c.isMeshPhysicalMaterial&&E(f,c,S)):c.isMeshMatcapMaterial?(r(f,c),C(f,c)):c.isMeshDepthMaterial?r(f,c):c.isMeshDistanceMaterial?(r(f,c),x(f,c)):c.isMeshNormalMaterial?r(f,c):c.isLineBasicMaterial?(o(f,c),c.isLineDashedMaterial&&s(f,c)):c.isPointsMaterial?d(f,c,U,P):c.isSpriteMaterial?v(f,c):c.isShadowMaterial?(f.color.value.copy(c.color),f.opacity.value=c.opacity):c.isShaderMaterial&&(c.uniformsNeedUpdate=!1)}function r(f,c){f.opacity.value=c.opacity,c.color&&f.diffuse.value.copy(c.color),c.emissive&&f.emissive.value.copy(c.emissive).multiplyScalar(c.emissiveIntensity),c.map&&(f.map.value=c.map,n(c.map,f.mapTransform)),c.alphaMap&&(f.alphaMap.value=c.alphaMap,n(c.alphaMap,f.alphaMapTransform)),c.bumpMap&&(f.bumpMap.value=c.bumpMap,n(c.bumpMap,f.bumpMapTransform),f.bumpScale.value=c.bumpScale,c.side===Et&&(f.bumpScale.value*=-1)),c.normalMap&&(f.normalMap.value=c.normalMap,n(c.normalMap,f.normalMapTransform),f.normalScale.value.copy(c.normalScale),c.side===Et&&f.normalScale.value.negate()),c.displacementMap&&(f.displacementMap.value=c.displacementMap,n(c.displacementMap,f.displacementMapTransform),f.displacementScale.value=c.displacementScale,f.displacementBias.value=c.displacementBias),c.emissiveMap&&(f.emissiveMap.value=c.emissiveMap,n(c.emissiveMap,f.emissiveMapTransform)),c.specularMap&&(f.specularMap.value=c.specularMap,n(c.specularMap,f.specularMapTransform)),c.alphaTest>0&&(f.alphaTest.value=c.alphaTest);const U=t.get(c),P=U.envMap,S=U.envMapRotation;P&&(f.envMap.value=P,Dt.copy(S),Dt.x*=-1,Dt.y*=-1,Dt.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(Dt.y*=-1,Dt.z*=-1),f.envMapRotation.value.setFromMatrix4(du.makeRotationFromEuler(Dt)),f.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,f.reflectivity.value=c.reflectivity,f.ior.value=c.ior,f.refractionRatio.value=c.refractionRatio),c.lightMap&&(f.lightMap.value=c.lightMap,f.lightMapIntensity.value=c.lightMapIntensity,n(c.lightMap,f.lightMapTransform)),c.aoMap&&(f.aoMap.value=c.aoMap,f.aoMapIntensity.value=c.aoMapIntensity,n(c.aoMap,f.aoMapTransform))}function o(f,c){f.diffuse.value.copy(c.color),f.opacity.value=c.opacity,c.map&&(f.map.value=c.map,n(c.map,f.mapTransform))}function s(f,c){f.dashSize.value=c.dashSize,f.totalSize.value=c.dashSize+c.gapSize,f.scale.value=c.scale}function d(f,c,U,P){f.diffuse.value.copy(c.color),f.opacity.value=c.opacity,f.size.value=c.size*U,f.scale.value=P*.5,c.map&&(f.map.value=c.map,n(c.map,f.uvTransform)),c.alphaMap&&(f.alphaMap.value=c.alphaMap,n(c.alphaMap,f.alphaMapTransform)),c.alphaTest>0&&(f.alphaTest.value=c.alphaTest)}function v(f,c){f.diffuse.value.copy(c.color),f.opacity.value=c.opacity,f.rotation.value=c.rotation,c.map&&(f.map.value=c.map,n(c.map,f.mapTransform)),c.alphaMap&&(f.alphaMap.value=c.alphaMap,n(c.alphaMap,f.alphaMapTransform)),c.alphaTest>0&&(f.alphaTest.value=c.alphaTest)}function T(f,c){f.specular.value.copy(c.specular),f.shininess.value=Math.max(c.shininess,1e-4)}function p(f,c){c.gradientMap&&(f.gradientMap.value=c.gradientMap)}function m(f,c){f.metalness.value=c.metalness,c.metalnessMap&&(f.metalnessMap.value=c.metalnessMap,n(c.metalnessMap,f.metalnessMapTransform)),f.roughness.value=c.roughness,c.roughnessMap&&(f.roughnessMap.value=c.roughnessMap,n(c.roughnessMap,f.roughnessMapTransform)),c.envMap&&(f.envMapIntensity.value=c.envMapIntensity)}function E(f,c,U){f.ior.value=c.ior,c.sheen>0&&(f.sheenColor.value.copy(c.sheenColor).multiplyScalar(c.sheen),f.sheenRoughness.value=c.sheenRoughness,c.sheenColorMap&&(f.sheenColorMap.value=c.sheenColorMap,n(c.sheenColorMap,f.sheenColorMapTransform)),c.sheenRoughnessMap&&(f.sheenRoughnessMap.value=c.sheenRoughnessMap,n(c.sheenRoughnessMap,f.sheenRoughnessMapTransform))),c.clearcoat>0&&(f.clearcoat.value=c.clearcoat,f.clearcoatRoughness.value=c.clearcoatRoughness,c.clearcoatMap&&(f.clearcoatMap.value=c.clearcoatMap,n(c.clearcoatMap,f.clearcoatMapTransform)),c.clearcoatRoughnessMap&&(f.clearcoatRoughnessMap.value=c.clearcoatRoughnessMap,n(c.clearcoatRoughnessMap,f.clearcoatRoughnessMapTransform)),c.clearcoatNormalMap&&(f.clearcoatNormalMap.value=c.clearcoatNormalMap,n(c.clearcoatNormalMap,f.clearcoatNormalMapTransform),f.clearcoatNormalScale.value.copy(c.clearcoatNormalScale),c.side===Et&&f.clearcoatNormalScale.value.negate())),c.dispersion>0&&(f.dispersion.value=c.dispersion),c.iridescence>0&&(f.iridescence.value=c.iridescence,f.iridescenceIOR.value=c.iridescenceIOR,f.iridescenceThicknessMinimum.value=c.iridescenceThicknessRange[0],f.iridescenceThicknessMaximum.value=c.iridescenceThicknessRange[1],c.iridescenceMap&&(f.iridescenceMap.value=c.iridescenceMap,n(c.iridescenceMap,f.iridescenceMapTransform)),c.iridescenceThicknessMap&&(f.iridescenceThicknessMap.value=c.iridescenceThicknessMap,n(c.iridescenceThicknessMap,f.iridescenceThicknessMapTransform))),c.transmission>0&&(f.transmission.value=c.transmission,f.transmissionSamplerMap.value=U.texture,f.transmissionSamplerSize.value.set(U.width,U.height),c.transmissionMap&&(f.transmissionMap.value=c.transmissionMap,n(c.transmissionMap,f.transmissionMapTransform)),f.thickness.value=c.thickness,c.thicknessMap&&(f.thicknessMap.value=c.thicknessMap,n(c.thicknessMap,f.thicknessMapTransform)),f.attenuationDistance.value=c.attenuationDistance,f.attenuationColor.value.copy(c.attenuationColor)),c.anisotropy>0&&(f.anisotropyVector.value.set(c.anisotropy*Math.cos(c.anisotropyRotation),c.anisotropy*Math.sin(c.anisotropyRotation)),c.anisotropyMap&&(f.anisotropyMap.value=c.anisotropyMap,n(c.anisotropyMap,f.anisotropyMapTransform))),f.specularIntensity.value=c.specularIntensity,f.specularColor.value.copy(c.specularColor),c.specularColorMap&&(f.specularColorMap.value=c.specularColorMap,n(c.specularColorMap,f.specularColorMapTransform)),c.specularIntensityMap&&(f.specularIntensityMap.value=c.specularIntensityMap,n(c.specularIntensityMap,f.specularIntensityMapTransform))}function C(f,c){c.matcap&&(f.matcap.value=c.matcap)}function x(f,c){const U=t.get(c).light;f.referencePosition.value.setFromMatrixPosition(U.matrixWorld),f.nearDistance.value=U.shadow.camera.near,f.farDistance.value=U.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:a}}function hu(e,t,n,i){let a={},r={},o=[];const s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function d(U,P){const S=P.program;i.uniformBlockBinding(U,S)}function v(U,P){let S=a[U.id];S===void 0&&(C(U),S=T(U),a[U.id]=S,U.addEventListener("dispose",f));const y=P.program;i.updateUBOMapping(U,y);const R=t.render.frame;r[U.id]!==R&&(m(U),r[U.id]=R)}function T(U){const P=p();U.__bindingPointIndex=P;const S=e.createBuffer(),y=U.__size,R=U.usage;return e.bindBuffer(e.UNIFORM_BUFFER,S),e.bufferData(e.UNIFORM_BUFFER,y,R),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,P,S),S}function p(){for(let U=0;U<s;U++)if(o.indexOf(U)===-1)return o.push(U),U;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function m(U){const P=a[U.id],S=U.uniforms,y=U.__cache;e.bindBuffer(e.UNIFORM_BUFFER,P);for(let R=0,I=S.length;R<I;R++){const O=Array.isArray(S[R])?S[R]:[S[R]];for(let g=0,h=O.length;g<h;g++){const b=O[g];if(E(b,R,g,y)===!0){const B=b.__offset,Y=Array.isArray(b.value)?b.value:[b.value];let K=0;for(let z=0;z<Y.length;z++){const W=Y[z],ee=x(W);typeof W=="number"||typeof W=="boolean"?(b.__data[0]=W,e.bufferSubData(e.UNIFORM_BUFFER,B+K,b.__data)):W.isMatrix3?(b.__data[0]=W.elements[0],b.__data[1]=W.elements[1],b.__data[2]=W.elements[2],b.__data[3]=0,b.__data[4]=W.elements[3],b.__data[5]=W.elements[4],b.__data[6]=W.elements[5],b.__data[7]=0,b.__data[8]=W.elements[6],b.__data[9]=W.elements[7],b.__data[10]=W.elements[8],b.__data[11]=0):(W.toArray(b.__data,K),K+=ee.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,B,b.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function E(U,P,S,y){const R=U.value,I=P+"_"+S;if(y[I]===void 0)return typeof R=="number"||typeof R=="boolean"?y[I]=R:y[I]=R.clone(),!0;{const O=y[I];if(typeof R=="number"||typeof R=="boolean"){if(O!==R)return y[I]=R,!0}else if(O.equals(R)===!1)return O.copy(R),!0}return!1}function C(U){const P=U.uniforms;let S=0;const y=16;for(let I=0,O=P.length;I<O;I++){const g=Array.isArray(P[I])?P[I]:[P[I]];for(let h=0,b=g.length;h<b;h++){const B=g[h],Y=Array.isArray(B.value)?B.value:[B.value];for(let K=0,z=Y.length;K<z;K++){const W=Y[K],ee=x(W),V=S%y,ge=V%ee.boundary,Te=V+ge;S+=ge,Te!==0&&y-Te<ee.storage&&(S+=y-Te),B.__data=new Float32Array(ee.storage/Float32Array.BYTES_PER_ELEMENT),B.__offset=S,S+=ee.storage}}}const R=S%y;return R>0&&(S+=y-R),U.__size=S,U.__cache={},this}function x(U){const P={boundary:0,storage:0};return typeof U=="number"||typeof U=="boolean"?(P.boundary=4,P.storage=4):U.isVector2?(P.boundary=8,P.storage=8):U.isVector3||U.isColor?(P.boundary=16,P.storage=12):U.isVector4?(P.boundary=16,P.storage=16):U.isMatrix3?(P.boundary=48,P.storage=48):U.isMatrix4?(P.boundary=64,P.storage=64):U.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",U),P}function f(U){const P=U.target;P.removeEventListener("dispose",f);const S=o.indexOf(P.__bindingPointIndex);o.splice(S,1),e.deleteBuffer(a[P.id]),delete a[P.id],delete r[P.id]}function c(){for(const U in a)e.deleteBuffer(a[U]);o=[],a={},r={}}return{bind:d,update:v,dispose:c}}class $u{constructor(t={}){const{canvas:n=sa(),context:i=null,depth:a=!0,stencil:r=!1,alpha:o=!1,antialias:s=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:v=!1,powerPreference:T="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:m=!1}=t;this.isWebGLRenderer=!0;let E;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");E=i.getContextAttributes().alpha}else E=o;const C=new Uint32Array(4),x=new Int32Array(4);let f=null,c=null;const U=[],P=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Pt,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const S=this;let y=!1;this._outputColorSpace=Mr;let R=0,I=0,O=null,g=-1,h=null;const b=new dt,B=new dt;let Y=null;const K=new qe(0);let z=0,W=n.width,ee=n.height,V=1,ge=null,Te=null;const Ue=new dt(0,0,W,ee),He=new dt(0,0,W,ee);let nt=!1;const je=new Tr;let ze=!1,k=!1;const $=new At,le=new Fe,Ce=new dt,Ee={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Oe=!1;function ct(){return O===null?V:1}let M=i;function $e(u,w){return n.getContext(u,w)}try{const u={alpha:!0,depth:a,stencil:r,antialias:s,premultipliedAlpha:d,preserveDrawingBuffer:v,powerPreference:T,failIfMajorPerformanceCaveat:p};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${xr}`),n.addEventListener("webglcontextlost",ne,!1),n.addEventListener("webglcontextrestored",ce,!1),n.addEventListener("webglcontextcreationerror",Z,!1),M===null){const w="webgl2";if(M=$e(w,u),M===null)throw $e(w)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(u){throw console.error("THREE.WebGLRenderer: "+u.message),u}let Pe,Re,de,Ze,pe,ye,st,it,_,l,D,H,q,G,ve,te,he,me,Q,oe,Ae,_e,re,Le;function A(){Pe=new Al(M),Pe.init(),_e=new su(M,Pe),Re=new gl(M,Pe,t,_e),de=new au(M,Pe),Re.reversedDepthBuffer&&m&&de.buffers.depth.setReversed(!0),Ze=new Cl(M),pe=new Yf,ye=new ou(M,Pe,de,pe,Re,_e,Ze),st=new El(S),it=new xl(S),_=new Do(M),re=new ml(M,_),l=new Rl(M,_,Ze,re),D=new Pl(M,l,_,Ze),Q=new wl(M,Re,ye),te=new vl(pe),H=new Xf(S,st,it,Pe,Re,re,te),q=new pu(S,pe),G=new qf,ve=new eu(Pe),me=new hl(S,st,it,de,D,E,d),he=new iu(S,D,Re),Le=new hu(M,Ze,Re,de),oe=new _l(M,Pe,Ze),Ae=new bl(M,Pe,Ze),Ze.programs=H.programs,S.capabilities=Re,S.extensions=Pe,S.properties=pe,S.renderLists=G,S.shadowMap=he,S.state=de,S.info=Ze}A();const j=new uu(S,M);this.xr=j,this.getContext=function(){return M},this.getContextAttributes=function(){return M.getContextAttributes()},this.forceContextLoss=function(){const u=Pe.get("WEBGL_lose_context");u&&u.loseContext()},this.forceContextRestore=function(){const u=Pe.get("WEBGL_lose_context");u&&u.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(u){u!==void 0&&(V=u,this.setSize(W,ee,!1))},this.getSize=function(u){return u.set(W,ee)},this.setSize=function(u,w,N=!0){if(j.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=u,ee=w,n.width=Math.floor(u*V),n.height=Math.floor(w*V),N===!0&&(n.style.width=u+"px",n.style.height=w+"px"),this.setViewport(0,0,u,w)},this.getDrawingBufferSize=function(u){return u.set(W*V,ee*V).floor()},this.setDrawingBufferSize=function(u,w,N){W=u,ee=w,V=N,n.width=Math.floor(u*N),n.height=Math.floor(w*N),this.setViewport(0,0,u,w)},this.getCurrentViewport=function(u){return u.copy(b)},this.getViewport=function(u){return u.copy(Ue)},this.setViewport=function(u,w,N,F){u.isVector4?Ue.set(u.x,u.y,u.z,u.w):Ue.set(u,w,N,F),de.viewport(b.copy(Ue).multiplyScalar(V).round())},this.getScissor=function(u){return u.copy(He)},this.setScissor=function(u,w,N,F){u.isVector4?He.set(u.x,u.y,u.z,u.w):He.set(u,w,N,F),de.scissor(B.copy(He).multiplyScalar(V).round())},this.getScissorTest=function(){return nt},this.setScissorTest=function(u){de.setScissorTest(nt=u)},this.setOpaqueSort=function(u){ge=u},this.setTransparentSort=function(u){Te=u},this.getClearColor=function(u){return u.copy(me.getClearColor())},this.setClearColor=function(){me.setClearColor(...arguments)},this.getClearAlpha=function(){return me.getClearAlpha()},this.setClearAlpha=function(){me.setClearAlpha(...arguments)},this.clear=function(u=!0,w=!0,N=!0){let F=0;if(u){let L=!1;if(O!==null){const J=O.texture.format;L=J===Gr||J===Br||J===Or}if(L){const J=O.texture.type,ae=J===Ht||J===an||J===gn||J===rn||J===yr||J===Dr,fe=me.getClearColor(),se=me.getClearAlpha(),xe=fe.r,be=fe.g,Se=fe.b;ae?(C[0]=xe,C[1]=be,C[2]=Se,C[3]=se,M.clearBufferuiv(M.COLOR,0,C)):(x[0]=xe,x[1]=be,x[2]=Se,x[3]=se,M.clearBufferiv(M.COLOR,0,x))}else F|=M.COLOR_BUFFER_BIT}w&&(F|=M.DEPTH_BUFFER_BIT),N&&(F|=M.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),M.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",ne,!1),n.removeEventListener("webglcontextrestored",ce,!1),n.removeEventListener("webglcontextcreationerror",Z,!1),me.dispose(),G.dispose(),ve.dispose(),pe.dispose(),st.dispose(),it.dispose(),D.dispose(),re.dispose(),Le.dispose(),H.dispose(),j.dispose(),j.removeEventListener("sessionstart",St),j.removeEventListener("sessionend",ni),Lt.stop()};function ne(u){u.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),y=!0}function ce(){console.log("THREE.WebGLRenderer: Context Restored."),y=!1;const u=Ze.autoReset,w=he.enabled,N=he.autoUpdate,F=he.needsUpdate,L=he.type;A(),Ze.autoReset=u,he.enabled=w,he.autoUpdate=N,he.needsUpdate=F,he.type=L}function Z(u){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",u.statusMessage)}function X(u){const w=u.target;w.removeEventListener("dispose",X),ue(w)}function ue(u){we(u),pe.remove(u)}function we(u){const w=pe.get(u).programs;w!==void 0&&(w.forEach(function(N){H.releaseProgram(N)}),u.isShaderMaterial&&H.releaseShaderCache(u))}this.renderBufferDirect=function(u,w,N,F,L,J){w===null&&(w=Ee);const ae=L.isMesh&&L.matrixWorld.determinant()<0,fe=ta(u,w,N,F,L);de.setMaterial(F,ae);let se=N.index,xe=1;if(F.wireframe===!0){if(se=l.getWireframeAttribute(N),se===void 0)return;xe=2}const be=N.drawRange,Se=N.attributes.position;let Ne=be.start*xe,ke=(be.start+be.count)*xe;J!==null&&(Ne=Math.max(Ne,J.start*xe),ke=Math.min(ke,(J.start+J.count)*xe)),se!==null?(Ne=Math.max(Ne,0),ke=Math.min(ke,se.count)):Se!=null&&(Ne=Math.max(Ne,0),ke=Math.min(ke,Se.count));const et=ke-Ne;if(et<0||et===1/0)return;re.setup(L,F,fe,N,se);let Ye,We=oe;if(se!==null&&(Ye=_.get(se),We=Ae,We.setIndex(Ye)),L.isMesh)F.wireframe===!0?(de.setLineWidth(F.wireframeLinewidth*ct()),We.setMode(M.LINES)):We.setMode(M.TRIANGLES);else if(L.isLine){let Me=F.linewidth;Me===void 0&&(Me=1),de.setLineWidth(Me*ct()),L.isLineSegments?We.setMode(M.LINES):L.isLineLoop?We.setMode(M.LINE_LOOP):We.setMode(M.LINE_STRIP)}else L.isPoints?We.setMode(M.POINTS):L.isSprite&&We.setMode(M.TRIANGLES);if(L.isBatchedMesh)if(L._multiDrawInstances!==null)Vn("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),We.renderMultiDrawInstances(L._multiDrawStarts,L._multiDrawCounts,L._multiDrawCount,L._multiDrawInstances);else if(Pe.get("WEBGL_multi_draw"))We.renderMultiDraw(L._multiDrawStarts,L._multiDrawCounts,L._multiDrawCount);else{const Me=L._multiDrawStarts,Je=L._multiDrawCounts,Ge=L._multiDrawCount,ht=se?_.get(se).bytesPerElement:1,kt=pe.get(F).currentProgram.getUniforms();for(let mt=0;mt<Ge;mt++)kt.setValue(M,"_gl_DrawID",mt),We.render(Me[mt]/ht,Je[mt])}else if(L.isInstancedMesh)We.renderInstances(Ne,et,L.count);else if(N.isInstancedBufferGeometry){const Me=N._maxInstanceCount!==void 0?N._maxInstanceCount:1/0,Je=Math.min(N.instanceCount,Me);We.renderInstances(Ne,et,Je)}else We.render(Ne,et)};function Xe(u,w,N){u.transparent===!0&&u.side===Tt&&u.forceSinglePass===!1?(u.side=Et,u.needsUpdate=!0,sn(u,w,N),u.side=tn,u.needsUpdate=!0,sn(u,w,N),u.side=Tt):sn(u,w,N)}this.compile=function(u,w,N=null){N===null&&(N=u),c=ve.get(N),c.init(w),P.push(c),N.traverseVisible(function(L){L.isLight&&L.layers.test(w.layers)&&(c.pushLight(L),L.castShadow&&c.pushShadow(L))}),u!==N&&u.traverseVisible(function(L){L.isLight&&L.layers.test(w.layers)&&(c.pushLight(L),L.castShadow&&c.pushShadow(L))}),c.setupLights();const F=new Set;return u.traverse(function(L){if(!(L.isMesh||L.isPoints||L.isLine||L.isSprite))return;const J=L.material;if(J)if(Array.isArray(J))for(let ae=0;ae<J.length;ae++){const fe=J[ae];Xe(fe,N,L),F.add(fe)}else Xe(J,N,L),F.add(J)}),c=P.pop(),F},this.compileAsync=function(u,w,N=null){const F=this.compile(u,w,N);return new Promise(L=>{function J(){if(F.forEach(function(ae){pe.get(ae).currentProgram.isReady()&&F.delete(ae)}),F.size===0){L(u);return}setTimeout(J,10)}Pe.get("KHR_parallel_shader_compile")!==null?J():setTimeout(J,10)})};let Ve=null;function Rt(u){Ve&&Ve(u)}function St(){Lt.stop()}function ni(){Lt.start()}const Lt=new Yr;Lt.setAnimationLoop(Rt),typeof self<"u"&&Lt.setContext(self),this.setAnimationLoop=function(u){Ve=u,j.setAnimationLoop(u),u===null?Lt.stop():Lt.start()},j.addEventListener("sessionstart",St),j.addEventListener("sessionend",ni),this.render=function(u,w){if(w!==void 0&&w.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(y===!0)return;if(u.matrixWorldAutoUpdate===!0&&u.updateMatrixWorld(),w.parent===null&&w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),j.enabled===!0&&j.isPresenting===!0&&(j.cameraAutoUpdate===!0&&j.updateCamera(w),w=j.getCamera()),u.isScene===!0&&u.onBeforeRender(S,u,w,O),c=ve.get(u,P.length),c.init(w),P.push(c),$.multiplyMatrices(w.projectionMatrix,w.matrixWorldInverse),je.setFromProjectionMatrix($,ci,w.reversedDepth),k=this.localClippingEnabled,ze=te.init(this.clippingPlanes,k),f=G.get(u,U.length),f.init(),U.push(f),j.enabled===!0&&j.isPresenting===!0){const J=S.xr.getDepthSensingMesh();J!==null&&Rn(J,w,-1/0,S.sortObjects)}Rn(u,w,0,S.sortObjects),f.finish(),S.sortObjects===!0&&f.sort(ge,Te),Oe=j.enabled===!1||j.isPresenting===!1||j.hasDepthSensing()===!1,Oe&&me.addToRenderList(f,u),this.info.render.frame++,ze===!0&&te.beginShadows();const N=c.state.shadowsArray;he.render(N,u,w),ze===!0&&te.endShadows(),this.info.autoReset===!0&&this.info.reset();const F=f.opaque,L=f.transmissive;if(c.setupLights(),w.isArrayCamera){const J=w.cameras;if(L.length>0)for(let ae=0,fe=J.length;ae<fe;ae++){const se=J[ae];ri(F,L,u,se)}Oe&&me.render(u);for(let ae=0,fe=J.length;ae<fe;ae++){const se=J[ae];ii(f,u,se,se.viewport)}}else L.length>0&&ri(F,L,u,w),Oe&&me.render(u),ii(f,u,w);O!==null&&I===0&&(ye.updateMultisampleRenderTarget(O),ye.updateRenderTargetMipmap(O)),u.isScene===!0&&u.onAfterRender(S,u,w),re.resetDefaultState(),g=-1,h=null,P.pop(),P.length>0?(c=P[P.length-1],ze===!0&&te.setGlobalState(S.clippingPlanes,c.state.camera)):c=null,U.pop(),U.length>0?f=U[U.length-1]:f=null};function Rn(u,w,N,F){if(u.visible===!1)return;if(u.layers.test(w.layers)){if(u.isGroup)N=u.renderOrder;else if(u.isLOD)u.autoUpdate===!0&&u.update(w);else if(u.isLight)c.pushLight(u),u.castShadow&&c.pushShadow(u);else if(u.isSprite){if(!u.frustumCulled||je.intersectsSprite(u)){F&&Ce.setFromMatrixPosition(u.matrixWorld).applyMatrix4($);const ae=D.update(u),fe=u.material;fe.visible&&f.push(u,ae,fe,N,Ce.z,null)}}else if((u.isMesh||u.isLine||u.isPoints)&&(!u.frustumCulled||je.intersectsObject(u))){const ae=D.update(u),fe=u.material;if(F&&(u.boundingSphere!==void 0?(u.boundingSphere===null&&u.computeBoundingSphere(),Ce.copy(u.boundingSphere.center)):(ae.boundingSphere===null&&ae.computeBoundingSphere(),Ce.copy(ae.boundingSphere.center)),Ce.applyMatrix4(u.matrixWorld).applyMatrix4($)),Array.isArray(fe)){const se=ae.groups;for(let xe=0,be=se.length;xe<be;xe++){const Se=se[xe],Ne=fe[Se.materialIndex];Ne&&Ne.visible&&f.push(u,ae,Ne,N,Ce.z,Se)}}else fe.visible&&f.push(u,ae,fe,N,Ce.z,null)}}const J=u.children;for(let ae=0,fe=J.length;ae<fe;ae++)Rn(J[ae],w,N,F)}function ii(u,w,N,F){const L=u.opaque,J=u.transmissive,ae=u.transparent;c.setupLightsView(N),ze===!0&&te.setGlobalState(S.clippingPlanes,N),F&&de.viewport(b.copy(F)),L.length>0&&on(L,w,N),J.length>0&&on(J,w,N),ae.length>0&&on(ae,w,N),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function ri(u,w,N,F){if((N.isScene===!0?N.overrideMaterial:null)!==null)return;c.state.transmissionRenderTarget[F.id]===void 0&&(c.state.transmissionRenderTarget[F.id]=new Kt(1,1,{generateMipmaps:!0,type:Pe.has("EXT_color_buffer_half_float")||Pe.has("EXT_color_buffer_float")?Sn:Ht,minFilter:Wt,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:rt.workingColorSpace}));const J=c.state.transmissionRenderTarget[F.id],ae=F.viewport||b;J.setSize(ae.z*S.transmissionResolutionScale,ae.w*S.transmissionResolutionScale);const fe=S.getRenderTarget(),se=S.getActiveCubeFace(),xe=S.getActiveMipmapLevel();S.setRenderTarget(J),S.getClearColor(K),z=S.getClearAlpha(),z<1&&S.setClearColor(16777215,.5),S.clear(),Oe&&me.render(N);const be=S.toneMapping;S.toneMapping=Pt;const Se=F.viewport;if(F.viewport!==void 0&&(F.viewport=void 0),c.setupLightsView(F),ze===!0&&te.setGlobalState(S.clippingPlanes,F),on(u,N,F),ye.updateMultisampleRenderTarget(J),ye.updateRenderTargetMipmap(J),Pe.has("WEBGL_multisampled_render_to_texture")===!1){let Ne=!1;for(let ke=0,et=w.length;ke<et;ke++){const Ye=w[ke],We=Ye.object,Me=Ye.geometry,Je=Ye.material,Ge=Ye.group;if(Je.side===Tt&&We.layers.test(F.layers)){const ht=Je.side;Je.side=Et,Je.needsUpdate=!0,ai(We,N,F,Me,Je,Ge),Je.side=ht,Je.needsUpdate=!0,Ne=!0}}Ne===!0&&(ye.updateMultisampleRenderTarget(J),ye.updateRenderTargetMipmap(J))}S.setRenderTarget(fe,se,xe),S.setClearColor(K,z),Se!==void 0&&(F.viewport=Se),S.toneMapping=be}function on(u,w,N){const F=w.isScene===!0?w.overrideMaterial:null;for(let L=0,J=u.length;L<J;L++){const ae=u[L],fe=ae.object,se=ae.geometry,xe=ae.group;let be=ae.material;be.allowOverride===!0&&F!==null&&(be=F),fe.layers.test(N.layers)&&ai(fe,w,N,se,be,xe)}}function ai(u,w,N,F,L,J){u.onBeforeRender(S,w,N,F,L,J),u.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,u.matrixWorld),u.normalMatrix.getNormalMatrix(u.modelViewMatrix),L.onBeforeRender(S,w,N,F,u,J),L.transparent===!0&&L.side===Tt&&L.forceSinglePass===!1?(L.side=Et,L.needsUpdate=!0,S.renderBufferDirect(N,w,F,L,u,J),L.side=tn,L.needsUpdate=!0,S.renderBufferDirect(N,w,F,L,u,J),L.side=Tt):S.renderBufferDirect(N,w,F,L,u,J),u.onAfterRender(S,w,N,F,L,J)}function sn(u,w,N){w.isScene!==!0&&(w=Ee);const F=pe.get(u),L=c.state.lights,J=c.state.shadowsArray,ae=L.state.version,fe=H.getParameters(u,L.state,J,w,N),se=H.getProgramCacheKey(fe);let xe=F.programs;F.environment=u.isMeshStandardMaterial?w.environment:null,F.fog=w.fog,F.envMap=(u.isMeshStandardMaterial?it:st).get(u.envMap||F.environment),F.envMapRotation=F.environment!==null&&u.envMap===null?w.environmentRotation:u.envMapRotation,xe===void 0&&(u.addEventListener("dispose",X),xe=new Map,F.programs=xe);let be=xe.get(se);if(be!==void 0){if(F.currentProgram===be&&F.lightsStateVersion===ae)return si(u,fe),be}else fe.uniforms=H.getUniforms(u),u.onBeforeCompile(fe,S),be=H.acquireProgram(fe,se),xe.set(se,be),F.uniforms=fe.uniforms;const Se=F.uniforms;return(!u.isShaderMaterial&&!u.isRawShaderMaterial||u.clipping===!0)&&(Se.clippingPlanes=te.uniform),si(u,fe),F.needsLights=ia(u),F.lightsStateVersion=ae,F.needsLights&&(Se.ambientLightColor.value=L.state.ambient,Se.lightProbe.value=L.state.probe,Se.directionalLights.value=L.state.directional,Se.directionalLightShadows.value=L.state.directionalShadow,Se.spotLights.value=L.state.spot,Se.spotLightShadows.value=L.state.spotShadow,Se.rectAreaLights.value=L.state.rectArea,Se.ltc_1.value=L.state.rectAreaLTC1,Se.ltc_2.value=L.state.rectAreaLTC2,Se.pointLights.value=L.state.point,Se.pointLightShadows.value=L.state.pointShadow,Se.hemisphereLights.value=L.state.hemi,Se.directionalShadowMap.value=L.state.directionalShadowMap,Se.directionalShadowMatrix.value=L.state.directionalShadowMatrix,Se.spotShadowMap.value=L.state.spotShadowMap,Se.spotLightMatrix.value=L.state.spotLightMatrix,Se.spotLightMap.value=L.state.spotLightMap,Se.pointShadowMap.value=L.state.pointShadowMap,Se.pointShadowMatrix.value=L.state.pointShadowMatrix),F.currentProgram=be,F.uniformsList=null,be}function oi(u){if(u.uniformsList===null){const w=u.currentProgram.getUniforms();u.uniformsList=hn.seqWithValue(w.seq,u.uniforms)}return u.uniformsList}function si(u,w){const N=pe.get(u);N.outputColorSpace=w.outputColorSpace,N.batching=w.batching,N.batchingColor=w.batchingColor,N.instancing=w.instancing,N.instancingColor=w.instancingColor,N.instancingMorph=w.instancingMorph,N.skinning=w.skinning,N.morphTargets=w.morphTargets,N.morphNormals=w.morphNormals,N.morphColors=w.morphColors,N.morphTargetsCount=w.morphTargetsCount,N.numClippingPlanes=w.numClippingPlanes,N.numIntersection=w.numClipIntersection,N.vertexAlphas=w.vertexAlphas,N.vertexTangents=w.vertexTangents,N.toneMapping=w.toneMapping}function ta(u,w,N,F,L){w.isScene!==!0&&(w=Ee),ye.resetTextureUnits();const J=w.fog,ae=F.isMeshStandardMaterial?w.environment:null,fe=O===null?S.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:Mn,se=(F.isMeshStandardMaterial?it:st).get(F.envMap||ae),xe=F.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,be=!!N.attributes.tangent&&(!!F.normalMap||F.anisotropy>0),Se=!!N.morphAttributes.position,Ne=!!N.morphAttributes.normal,ke=!!N.morphAttributes.color;let et=Pt;F.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(et=S.toneMapping);const Ye=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,We=Ye!==void 0?Ye.length:0,Me=pe.get(F),Je=c.state.lights;if(ze===!0&&(k===!0||u!==h)){const lt=u===h&&F.id===g;te.setState(F,u,lt)}let Ge=!1;F.version===Me.__version?(Me.needsLights&&Me.lightsStateVersion!==Je.state.version||Me.outputColorSpace!==fe||L.isBatchedMesh&&Me.batching===!1||!L.isBatchedMesh&&Me.batching===!0||L.isBatchedMesh&&Me.batchingColor===!0&&L.colorTexture===null||L.isBatchedMesh&&Me.batchingColor===!1&&L.colorTexture!==null||L.isInstancedMesh&&Me.instancing===!1||!L.isInstancedMesh&&Me.instancing===!0||L.isSkinnedMesh&&Me.skinning===!1||!L.isSkinnedMesh&&Me.skinning===!0||L.isInstancedMesh&&Me.instancingColor===!0&&L.instanceColor===null||L.isInstancedMesh&&Me.instancingColor===!1&&L.instanceColor!==null||L.isInstancedMesh&&Me.instancingMorph===!0&&L.morphTexture===null||L.isInstancedMesh&&Me.instancingMorph===!1&&L.morphTexture!==null||Me.envMap!==se||F.fog===!0&&Me.fog!==J||Me.numClippingPlanes!==void 0&&(Me.numClippingPlanes!==te.numPlanes||Me.numIntersection!==te.numIntersection)||Me.vertexAlphas!==xe||Me.vertexTangents!==be||Me.morphTargets!==Se||Me.morphNormals!==Ne||Me.morphColors!==ke||Me.toneMapping!==et||Me.morphTargetsCount!==We)&&(Ge=!0):(Ge=!0,Me.__version=F.version);let ht=Me.currentProgram;Ge===!0&&(ht=sn(F,w,L));let kt=!1,mt=!1,Zt=!1;const Qe=ht.getUniforms(),gt=Me.uniforms;if(de.useProgram(ht.program)&&(kt=!0,mt=!0,Zt=!0),F.id!==g&&(g=F.id,mt=!0),kt||h!==u){de.buffers.depth.getReversed()&&u.reversedDepth!==!0&&(u._reversedDepth=!0,u.updateProjectionMatrix()),Qe.setValue(M,"projectionMatrix",u.projectionMatrix),Qe.setValue(M,"viewMatrix",u.matrixWorldInverse);const ft=Qe.map.cameraPosition;ft!==void 0&&ft.setValue(M,le.setFromMatrixPosition(u.matrixWorld)),Re.logarithmicDepthBuffer&&Qe.setValue(M,"logDepthBufFC",2/(Math.log(u.far+1)/Math.LN2)),(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)&&Qe.setValue(M,"isOrthographic",u.isOrthographicCamera===!0),h!==u&&(h=u,mt=!0,Zt=!0)}if(L.isSkinnedMesh){Qe.setOptional(M,L,"bindMatrix"),Qe.setOptional(M,L,"bindMatrixInverse");const lt=L.skeleton;lt&&(lt.boneTexture===null&&lt.computeBoneTexture(),Qe.setValue(M,"boneTexture",lt.boneTexture,ye))}L.isBatchedMesh&&(Qe.setOptional(M,L,"batchingTexture"),Qe.setValue(M,"batchingTexture",L._matricesTexture,ye),Qe.setOptional(M,L,"batchingIdTexture"),Qe.setValue(M,"batchingIdTexture",L._indirectTexture,ye),Qe.setOptional(M,L,"batchingColorTexture"),L._colorsTexture!==null&&Qe.setValue(M,"batchingColorTexture",L._colorsTexture,ye));const vt=N.morphAttributes;if((vt.position!==void 0||vt.normal!==void 0||vt.color!==void 0)&&Q.update(L,N,ht),(mt||Me.receiveShadow!==L.receiveShadow)&&(Me.receiveShadow=L.receiveShadow,Qe.setValue(M,"receiveShadow",L.receiveShadow)),F.isMeshGouraudMaterial&&F.envMap!==null&&(gt.envMap.value=se,gt.flipEnvMap.value=se.isCubeTexture&&se.isRenderTargetTexture===!1?-1:1),F.isMeshStandardMaterial&&F.envMap===null&&w.environment!==null&&(gt.envMapIntensity.value=w.environmentIntensity),mt&&(Qe.setValue(M,"toneMappingExposure",S.toneMappingExposure),Me.needsLights&&na(gt,Zt),J&&F.fog===!0&&q.refreshFogUniforms(gt,J),q.refreshMaterialUniforms(gt,F,V,ee,c.state.transmissionRenderTarget[u.id]),hn.upload(M,oi(Me),gt,ye)),F.isShaderMaterial&&F.uniformsNeedUpdate===!0&&(hn.upload(M,oi(Me),gt,ye),F.uniformsNeedUpdate=!1),F.isSpriteMaterial&&Qe.setValue(M,"center",L.center),Qe.setValue(M,"modelViewMatrix",L.modelViewMatrix),Qe.setValue(M,"normalMatrix",L.normalMatrix),Qe.setValue(M,"modelMatrix",L.matrixWorld),F.isShaderMaterial||F.isRawShaderMaterial){const lt=F.uniformsGroups;for(let ft=0,bn=lt.length;ft<bn;ft++){const Ut=lt[ft];Le.update(Ut,ht),Le.bind(Ut,ht)}}return ht}function na(u,w){u.ambientLightColor.needsUpdate=w,u.lightProbe.needsUpdate=w,u.directionalLights.needsUpdate=w,u.directionalLightShadows.needsUpdate=w,u.pointLights.needsUpdate=w,u.pointLightShadows.needsUpdate=w,u.spotLights.needsUpdate=w,u.spotLightShadows.needsUpdate=w,u.rectAreaLights.needsUpdate=w,u.hemisphereLights.needsUpdate=w}function ia(u){return u.isMeshLambertMaterial||u.isMeshToonMaterial||u.isMeshPhongMaterial||u.isMeshStandardMaterial||u.isShadowMaterial||u.isShaderMaterial&&u.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return I},this.getRenderTarget=function(){return O},this.setRenderTargetTextures=function(u,w,N){const F=pe.get(u);F.__autoAllocateDepthBuffer=u.resolveDepthBuffer===!1,F.__autoAllocateDepthBuffer===!1&&(F.__useRenderToTexture=!1),pe.get(u.texture).__webglTexture=w,pe.get(u.depthTexture).__webglTexture=F.__autoAllocateDepthBuffer?void 0:N,F.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(u,w){const N=pe.get(u);N.__webglFramebuffer=w,N.__useDefaultFramebuffer=w===void 0};const ra=M.createFramebuffer();this.setRenderTarget=function(u,w=0,N=0){O=u,R=w,I=N;let F=!0,L=null,J=!1,ae=!1;if(u){const se=pe.get(u);if(se.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(M.FRAMEBUFFER,null),F=!1;else if(se.__webglFramebuffer===void 0)ye.setupRenderTarget(u);else if(se.__hasExternalTextures)ye.rebindTextures(u,pe.get(u.texture).__webglTexture,pe.get(u.depthTexture).__webglTexture);else if(u.depthBuffer){const Se=u.depthTexture;if(se.__boundDepthTexture!==Se){if(Se!==null&&pe.has(Se)&&(u.width!==Se.image.width||u.height!==Se.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ye.setupDepthRenderbuffer(u)}}const xe=u.texture;(xe.isData3DTexture||xe.isDataArrayTexture||xe.isCompressedArrayTexture)&&(ae=!0);const be=pe.get(u).__webglFramebuffer;u.isWebGLCubeRenderTarget?(Array.isArray(be[w])?L=be[w][N]:L=be[w],J=!0):u.samples>0&&ye.useMultisampledRTT(u)===!1?L=pe.get(u).__webglMultisampledFramebuffer:Array.isArray(be)?L=be[N]:L=be,b.copy(u.viewport),B.copy(u.scissor),Y=u.scissorTest}else b.copy(Ue).multiplyScalar(V).floor(),B.copy(He).multiplyScalar(V).floor(),Y=nt;if(N!==0&&(L=ra),de.bindFramebuffer(M.FRAMEBUFFER,L)&&F&&de.drawBuffers(u,L),de.viewport(b),de.scissor(B),de.setScissorTest(Y),J){const se=pe.get(u.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_CUBE_MAP_POSITIVE_X+w,se.__webglTexture,N)}else if(ae){const se=w;for(let xe=0;xe<u.textures.length;xe++){const be=pe.get(u.textures[xe]);M.framebufferTextureLayer(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0+xe,be.__webglTexture,N,se)}}else if(u!==null&&N!==0){const se=pe.get(u.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,se.__webglTexture,N)}g=-1},this.readRenderTargetPixels=function(u,w,N,F,L,J,ae,fe=0){if(!(u&&u.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let se=pe.get(u).__webglFramebuffer;if(u.isWebGLCubeRenderTarget&&ae!==void 0&&(se=se[ae]),se){de.bindFramebuffer(M.FRAMEBUFFER,se);try{const xe=u.textures[fe],be=xe.format,Se=xe.type;if(!Re.textureFormatReadable(be)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Re.textureTypeReadable(Se)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}w>=0&&w<=u.width-F&&N>=0&&N<=u.height-L&&(u.textures.length>1&&M.readBuffer(M.COLOR_ATTACHMENT0+fe),M.readPixels(w,N,F,L,_e.convert(be),_e.convert(Se),J))}finally{const xe=O!==null?pe.get(O).__webglFramebuffer:null;de.bindFramebuffer(M.FRAMEBUFFER,xe)}}},this.readRenderTargetPixelsAsync=async function(u,w,N,F,L,J,ae,fe=0){if(!(u&&u.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let se=pe.get(u).__webglFramebuffer;if(u.isWebGLCubeRenderTarget&&ae!==void 0&&(se=se[ae]),se)if(w>=0&&w<=u.width-F&&N>=0&&N<=u.height-L){de.bindFramebuffer(M.FRAMEBUFFER,se);const xe=u.textures[fe],be=xe.format,Se=xe.type;if(!Re.textureFormatReadable(be))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Re.textureTypeReadable(Se))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ne=M.createBuffer();M.bindBuffer(M.PIXEL_PACK_BUFFER,Ne),M.bufferData(M.PIXEL_PACK_BUFFER,J.byteLength,M.STREAM_READ),u.textures.length>1&&M.readBuffer(M.COLOR_ATTACHMENT0+fe),M.readPixels(w,N,F,L,_e.convert(be),_e.convert(Se),0);const ke=O!==null?pe.get(O).__webglFramebuffer:null;de.bindFramebuffer(M.FRAMEBUFFER,ke);const et=M.fenceSync(M.SYNC_GPU_COMMANDS_COMPLETE,0);return M.flush(),await ca(M,et,4),M.bindBuffer(M.PIXEL_PACK_BUFFER,Ne),M.getBufferSubData(M.PIXEL_PACK_BUFFER,0,J),M.deleteBuffer(Ne),M.deleteSync(et),J}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(u,w=null,N=0){const F=Math.pow(2,-N),L=Math.floor(u.image.width*F),J=Math.floor(u.image.height*F),ae=w!==null?w.x:0,fe=w!==null?w.y:0;ye.setTexture2D(u,0),M.copyTexSubImage2D(M.TEXTURE_2D,N,0,0,ae,fe,L,J),de.unbindTexture()};const aa=M.createFramebuffer(),oa=M.createFramebuffer();this.copyTextureToTexture=function(u,w,N=null,F=null,L=0,J=null){J===null&&(L!==0?(Vn("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),J=L,L=0):J=0);let ae,fe,se,xe,be,Se,Ne,ke,et;const Ye=u.isCompressedTexture?u.mipmaps[J]:u.image;if(N!==null)ae=N.max.x-N.min.x,fe=N.max.y-N.min.y,se=N.isBox3?N.max.z-N.min.z:1,xe=N.min.x,be=N.min.y,Se=N.isBox3?N.min.z:0;else{const vt=Math.pow(2,-L);ae=Math.floor(Ye.width*vt),fe=Math.floor(Ye.height*vt),u.isDataArrayTexture?se=Ye.depth:u.isData3DTexture?se=Math.floor(Ye.depth*vt):se=1,xe=0,be=0,Se=0}F!==null?(Ne=F.x,ke=F.y,et=F.z):(Ne=0,ke=0,et=0);const We=_e.convert(w.format),Me=_e.convert(w.type);let Je;w.isData3DTexture?(ye.setTexture3D(w,0),Je=M.TEXTURE_3D):w.isDataArrayTexture||w.isCompressedArrayTexture?(ye.setTexture2DArray(w,0),Je=M.TEXTURE_2D_ARRAY):(ye.setTexture2D(w,0),Je=M.TEXTURE_2D),M.pixelStorei(M.UNPACK_FLIP_Y_WEBGL,w.flipY),M.pixelStorei(M.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),M.pixelStorei(M.UNPACK_ALIGNMENT,w.unpackAlignment);const Ge=M.getParameter(M.UNPACK_ROW_LENGTH),ht=M.getParameter(M.UNPACK_IMAGE_HEIGHT),kt=M.getParameter(M.UNPACK_SKIP_PIXELS),mt=M.getParameter(M.UNPACK_SKIP_ROWS),Zt=M.getParameter(M.UNPACK_SKIP_IMAGES);M.pixelStorei(M.UNPACK_ROW_LENGTH,Ye.width),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,Ye.height),M.pixelStorei(M.UNPACK_SKIP_PIXELS,xe),M.pixelStorei(M.UNPACK_SKIP_ROWS,be),M.pixelStorei(M.UNPACK_SKIP_IMAGES,Se);const Qe=u.isDataArrayTexture||u.isData3DTexture,gt=w.isDataArrayTexture||w.isData3DTexture;if(u.isDepthTexture){const vt=pe.get(u),lt=pe.get(w),ft=pe.get(vt.__renderTarget),bn=pe.get(lt.__renderTarget);de.bindFramebuffer(M.READ_FRAMEBUFFER,ft.__webglFramebuffer),de.bindFramebuffer(M.DRAW_FRAMEBUFFER,bn.__webglFramebuffer);for(let Ut=0;Ut<se;Ut++)Qe&&(M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,pe.get(u).__webglTexture,L,Se+Ut),M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,pe.get(w).__webglTexture,J,et+Ut)),M.blitFramebuffer(xe,be,ae,fe,Ne,ke,ae,fe,M.DEPTH_BUFFER_BIT,M.NEAREST);de.bindFramebuffer(M.READ_FRAMEBUFFER,null),de.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else if(L!==0||u.isRenderTargetTexture||pe.has(u)){const vt=pe.get(u),lt=pe.get(w);de.bindFramebuffer(M.READ_FRAMEBUFFER,aa),de.bindFramebuffer(M.DRAW_FRAMEBUFFER,oa);for(let ft=0;ft<se;ft++)Qe?M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,vt.__webglTexture,L,Se+ft):M.framebufferTexture2D(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,vt.__webglTexture,L),gt?M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,lt.__webglTexture,J,et+ft):M.framebufferTexture2D(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,lt.__webglTexture,J),L!==0?M.blitFramebuffer(xe,be,ae,fe,Ne,ke,ae,fe,M.COLOR_BUFFER_BIT,M.NEAREST):gt?M.copyTexSubImage3D(Je,J,Ne,ke,et+ft,xe,be,ae,fe):M.copyTexSubImage2D(Je,J,Ne,ke,xe,be,ae,fe);de.bindFramebuffer(M.READ_FRAMEBUFFER,null),de.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else gt?u.isDataTexture||u.isData3DTexture?M.texSubImage3D(Je,J,Ne,ke,et,ae,fe,se,We,Me,Ye.data):w.isCompressedArrayTexture?M.compressedTexSubImage3D(Je,J,Ne,ke,et,ae,fe,se,We,Ye.data):M.texSubImage3D(Je,J,Ne,ke,et,ae,fe,se,We,Me,Ye):u.isDataTexture?M.texSubImage2D(M.TEXTURE_2D,J,Ne,ke,ae,fe,We,Me,Ye.data):u.isCompressedTexture?M.compressedTexSubImage2D(M.TEXTURE_2D,J,Ne,ke,Ye.width,Ye.height,We,Ye.data):M.texSubImage2D(M.TEXTURE_2D,J,Ne,ke,ae,fe,We,Me,Ye);M.pixelStorei(M.UNPACK_ROW_LENGTH,Ge),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,ht),M.pixelStorei(M.UNPACK_SKIP_PIXELS,kt),M.pixelStorei(M.UNPACK_SKIP_ROWS,mt),M.pixelStorei(M.UNPACK_SKIP_IMAGES,Zt),J===0&&w.generateMipmaps&&M.generateMipmap(Je),de.unbindTexture()},this.initRenderTarget=function(u){pe.get(u).__webglFramebuffer===void 0&&ye.setupRenderTarget(u)},this.initTexture=function(u){u.isCubeTexture?ye.setTextureCube(u,0):u.isData3DTexture?ye.setTexture3D(u,0):u.isDataArrayTexture||u.isCompressedArrayTexture?ye.setTexture2DArray(u,0):ye.setTexture2D(u,0),de.unbindTexture()},this.resetState=function(){R=0,I=0,O=null,de.reset(),re.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ci}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const n=this.getContext();n.drawingBufferColorSpace=rt._getDrawingBufferColorSpace(t),n.unpackColorSpace=rt._getUnpackColorSpace()}}const hr=new WeakMap;function Zu(e){const t=(e.index,e),n=t.getAttribute("position");t.getAttribute("normal")||t.computeVertexNormals();const i=t.getAttribute("normal"),a=t.getAttribute("uv");let r;if(t.index)r=new Uint32Array(t.index.array);else{r=new Uint32Array(n.count);for(let o=0;o<n.count;o++)r[o]=o}return{positions:new Float32Array(n.array),normals:i?new Float32Array(i.array):null,uvs:a?new Float32Array(a.array):null,indices:r}}function mu(e){let t=hr.get(e);return t||(t=new xn,t.setAttribute("position",new tt(e.positions,3)),e.normals&&t.setAttribute("normal",new tt(e.normals,3)),e.uvs&&t.setAttribute("uv",new tt(e.uvs,2)),t.setIndex(new tt(e.indices,1)),e.normals||t.computeVertexNormals(),t.computeBoundingSphere(),hr.set(e,t),t)}const mr=new WeakMap;function Ju(e,t){let n=mr.get(e);if(n?.[t])return n[t];const i=t==="x"?0:t==="y"?1:2,a=new Float32Array(e.positions);for(let d=i;d<a.length;d+=3)a[d]=-a[d];let r=null;if(e.normals){r=new Float32Array(e.normals);for(let d=i;d<r.length;d+=3)r[d]=-r[d]}const o=new Uint32Array(e.indices.length);for(let d=0;d<e.indices.length;d+=3)o[d]=e.indices[d],o[d+1]=e.indices[d+2],o[d+2]=e.indices[d+1];const s={positions:a,normals:r,uvs:e.uvs,indices:o};return n||(n={},mr.set(e,n)),n[t]=s,s}function _u(e){return new At().compose(new Fe(...e.position),new Wr(...e.quaternion),new Fe(...e.scale))}function Jr(e,t){const n=new Float32Array(e.positions),i=new Fe;for(let o=0;o<n.length;o+=3)i.set(n[o],n[o+1],n[o+2]).applyMatrix4(t),n[o]=i.x,n[o+1]=i.y,n[o+2]=i.z;let a=null;if(e.normals){const o=new Be().getNormalMatrix(t);a=new Float32Array(e.normals);for(let s=0;s<a.length;s+=3)i.set(a[s],a[s+1],a[s+2]).applyMatrix3(o).normalize(),a[s]=i.x,a[s+1]=i.y,a[s+2]=i.z}let r=e.indices;if(t.determinant()<0){r=new Uint32Array(e.indices.length);for(let o=0;o<e.indices.length;o+=3)r[o]=e.indices[o],r[o+1]=e.indices[o+2],r[o+2]=e.indices[o+1]}return{positions:n,normals:a,uvs:e.uvs,indices:r}}function Qr(e){let t=0,n=0;for(const p of e)t+=p.positions.length/3,n+=p.indices.length;const i=new Float32Array(t*3),a=e.every(p=>p.normals),r=e.every(p=>p.uvs),o=a?new Float32Array(t*3):null,s=r?new Float32Array(t*2):null,d=new Uint32Array(n);let v=0,T=0;for(const p of e){i.set(p.positions,v*3),o&&o.set(p.normals,v*3),s&&s.set(p.uvs,v*2);for(let m=0;m<p.indices.length;m++)d[T+m]=p.indices[m]+v;v+=p.positions.length/3,T+=p.indices.length}return{positions:i,normals:o,uvs:s,indices:d}}function Qu(e){return e.indices.length/3}function ju(e){const t=new Ro,n=new Fe;for(let i=0;i<e.positions.length;i+=3)n.set(e.positions[i],e.positions[i+1],e.positions[i+2]),t.expandByPoint(n);return t}const _r={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class En{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(t){return new Cu(t)}),this.register(function(t){return new wu(t)}),this.register(function(t){return new yu(t)}),this.register(function(t){return new Du(t)}),this.register(function(t){return new Iu(t)}),this.register(function(t){return new Nu(t)}),this.register(function(t){return new Pu(t)}),this.register(function(t){return new Lu(t)}),this.register(function(t){return new Uu(t)}),this.register(function(t){return new Fu(t)}),this.register(function(t){return new Ou(t)}),this.register(function(t){return new Bu(t)}),this.register(function(t){return new Gu(t)}),this.register(function(t){return new Hu(t)})}register(t){return this.pluginCallbacks.indexOf(t)===-1&&this.pluginCallbacks.push(t),this}unregister(t){return this.pluginCallbacks.indexOf(t)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(t),1),this}setTextureUtils(t){return this.textureUtils=t,this}parse(t,n,i,a){const r=new bu,o=[];for(let s=0,d=this.pluginCallbacks.length;s<d;s++)o.push(this.pluginCallbacks[s](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(t,n,a).catch(i)}parseAsync(t,n){const i=this;return new Promise(function(a,r){i.parse(t,a,r,n)})}}const Ie={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},Gn="KHR_mesh_quantization",_t={};_t[Yt]=Ie.NEAREST;_t[Pr]=Ie.NEAREST_MIPMAP_NEAREST;_t[Qt]=Ie.NEAREST_MIPMAP_LINEAR;_t[Ot]=Ie.LINEAR;_t[dn]=Ie.LINEAR_MIPMAP_NEAREST;_t[Wt]=Ie.LINEAR_MIPMAP_LINEAR;_t[Cr]=Ie.CLAMP_TO_EDGE;_t[wr]=Ie.REPEAT;_t[br]=Ie.MIRRORED_REPEAT;const gr={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},gu=new qe,vr=12,vu=1179937895,Eu=2,Er=8,Su=1313821514,Mu=5130562;function en(e,t){return e.length===t.length&&e.every(function(n,i){return n===t[i]})}function Tu(e){return new TextEncoder().encode(e).buffer}function xu(e){return en(e.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function Au(e,t,n){const i={min:new Array(e.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(e.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let a=t;a<t+n;a++)for(let r=0;r<e.itemSize;r++){let o;e.itemSize>4?o=e.array[a*e.itemSize+r]:(r===0?o=e.getX(a):r===1?o=e.getY(a):r===2?o=e.getZ(a):r===3&&(o=e.getW(a)),e.normalized===!0&&(o=Jn.normalize(o,e.array))),i.min[r]=Math.min(i.min[r],o),i.max[r]=Math.max(i.max[r],o)}return i}function jr(e){return Math.ceil(e/4)*4}function Hn(e,t=0){const n=jr(e.byteLength);if(n!==e.byteLength){const i=new Uint8Array(n);if(i.set(new Uint8Array(e)),t!==0)for(let a=e.byteLength;a<n;a++)i[a]=t;return i.buffer}return e}function Sr(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function Ru(e,t){if(typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas){let n;return t==="image/jpeg"?n=.92:t==="image/webp"&&(n=.8),e.convertToBlob({type:t,quality:n})}else return new Promise(n=>e.toBlob(n,t))}class bu{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r"+xr}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(t){this.plugins=t}setTextureUtils(t){this.textureUtils=t}async writeAsync(t,n,i={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},i),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(t),await Promise.all(this.pending);const a=this,r=a.buffers,o=a.json;i=a.options;const s=a.extensionsUsed,d=a.extensionsRequired,v=new Blob(r,{type:"application/octet-stream"}),T=Object.keys(s),p=Object.keys(d);if(T.length>0&&(o.extensionsUsed=T),p.length>0&&(o.extensionsRequired=p),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=v.size),i.binary===!0){const m=new FileReader;m.readAsArrayBuffer(v),m.onloadend=function(){const E=Hn(m.result),C=new DataView(new ArrayBuffer(Er));C.setUint32(0,E.byteLength,!0),C.setUint32(4,Mu,!0);const x=Hn(Tu(JSON.stringify(o)),32),f=new DataView(new ArrayBuffer(Er));f.setUint32(0,x.byteLength,!0),f.setUint32(4,Su,!0);const c=new ArrayBuffer(vr),U=new DataView(c);U.setUint32(0,vu,!0),U.setUint32(4,Eu,!0);const P=vr+f.byteLength+x.byteLength+C.byteLength+E.byteLength;U.setUint32(8,P,!0);const S=new Blob([c,f,x,C,E],{type:"application/octet-stream"}),y=new FileReader;y.readAsArrayBuffer(S),y.onloadend=function(){n(y.result)}}}else if(o.buffers&&o.buffers.length>0){const m=new FileReader;m.readAsDataURL(v),m.onloadend=function(){const E=m.result;o.buffers[0].uri=E,n(o)}}else n(o)}serializeUserData(t,n){if(Object.keys(t.userData).length===0)return;const i=this.options,a=this.extensionsUsed;try{const r=JSON.parse(JSON.stringify(t.userData));if(i.includeCustomExtensions&&r.gltfExtensions){n.extensions===void 0&&(n.extensions={});for(const o in r.gltfExtensions)n.extensions[o]=r.gltfExtensions[o],a[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(n.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+t.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(t,n=!1){if(this.uids.has(t)===!1){const a=new Map;a.set(!0,this.uid++),a.set(!1,this.uid++),this.uids.set(t,a)}return this.uids.get(t).get(n)}isNormalizedNormalAttribute(t){if(this.cache.attributesNormalized.has(t))return!1;const i=new Fe;for(let a=0,r=t.count;a<r;a++)if(Math.abs(i.fromBufferAttribute(t,a).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(t){const n=this.cache;if(n.attributesNormalized.has(t))return n.attributesNormalized.get(t);const i=t.clone(),a=new Fe;for(let r=0,o=i.count;r<o;r++)a.fromBufferAttribute(i,r),a.x===0&&a.y===0&&a.z===0?a.setX(1):a.normalize(),i.setXYZ(r,a.x,a.y,a.z);return n.attributesNormalized.set(t,i),i}applyTextureTransform(t,n){let i=!1;const a={};(n.offset.x!==0||n.offset.y!==0)&&(a.offset=n.offset.toArray(),i=!0),n.rotation!==0&&(a.rotation=n.rotation,i=!0),(n.repeat.x!==1||n.repeat.y!==1)&&(a.scale=n.repeat.toArray(),i=!0),i&&(t.extensions=t.extensions||{},t.extensions.KHR_texture_transform=a,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(t,n){if(t===n)return t;function i(E){return E.colorSpace===Mr?function(x){return x<.04045?x*.0773993808:Math.pow(x*.9478672986+.0521327014,2.4)}:function(x){return x}}t instanceof yn&&(t=await this.decompressTextureAsync(t)),n instanceof yn&&(n=await this.decompressTextureAsync(n));const a=t?t.image:null,r=n?n.image:null,o=Math.max(a?a.width:0,r?r.width:0),s=Math.max(a?a.height:0,r?r.height:0),d=Sr();d.width=o,d.height=s;const v=d.getContext("2d",{willReadFrequently:!0});v.fillStyle="#00ffff",v.fillRect(0,0,o,s);const T=v.getImageData(0,0,o,s);if(a){v.drawImage(a,0,0,o,s);const E=i(t),C=v.getImageData(0,0,o,s).data;for(let x=2;x<C.length;x+=4)T.data[x]=E(C[x]/256)*256}if(r){v.drawImage(r,0,0,o,s);const E=i(n),C=v.getImageData(0,0,o,s).data;for(let x=1;x<C.length;x+=4)T.data[x]=E(C[x]/256)*256}v.putImageData(T,0,0);const m=(t||n).clone();return m.source=new bo(d),m.colorSpace=Nt,m.channel=(t||n).channel,t&&n&&t.channel!==n.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),m}async decompressTextureAsync(t,n=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(t,n)}processBuffer(t){const n=this.json,i=this.buffers;return n.buffers||(n.buffers=[{byteLength:0}]),i.push(t),0}processBufferView(t,n,i,a,r){const o=this.json;o.bufferViews||(o.bufferViews=[]);let s;switch(n){case Ie.BYTE:case Ie.UNSIGNED_BYTE:s=1;break;case Ie.SHORT:case Ie.UNSIGNED_SHORT:s=2;break;default:s=4}let d=t.itemSize*s;r===Ie.ARRAY_BUFFER&&(d=Math.ceil(d/4)*4);const v=jr(a*d),T=new DataView(new ArrayBuffer(v));let p=0;for(let C=i;C<i+a;C++){for(let x=0;x<t.itemSize;x++){let f;t.itemSize>4?f=t.array[C*t.itemSize+x]:(x===0?f=t.getX(C):x===1?f=t.getY(C):x===2?f=t.getZ(C):x===3&&(f=t.getW(C)),t.normalized===!0&&(f=Jn.normalize(f,t.array))),n===Ie.FLOAT?T.setFloat32(p,f,!0):n===Ie.INT?T.setInt32(p,f,!0):n===Ie.UNSIGNED_INT?T.setUint32(p,f,!0):n===Ie.SHORT?T.setInt16(p,f,!0):n===Ie.UNSIGNED_SHORT?T.setUint16(p,f,!0):n===Ie.BYTE?T.setInt8(p,f):n===Ie.UNSIGNED_BYTE&&T.setUint8(p,f),p+=s}p%d!==0&&(p+=d-p%d)}const m={buffer:this.processBuffer(T.buffer),byteOffset:this.byteOffset,byteLength:v};return r!==void 0&&(m.target=r),r===Ie.ARRAY_BUFFER&&(m.byteStride=d),this.byteOffset+=v,o.bufferViews.push(m),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(t){const n=this,i=n.json;return i.bufferViews||(i.bufferViews=[]),new Promise(function(a){const r=new FileReader;r.readAsArrayBuffer(t),r.onloadend=function(){const o=Hn(r.result),s={buffer:n.processBuffer(o),byteOffset:n.byteOffset,byteLength:o.byteLength};n.byteOffset+=o.byteLength,a(i.bufferViews.push(s)-1)}})}processAccessor(t,n,i,a){const r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let s;if(t.array.constructor===Float32Array)s=Ie.FLOAT;else if(t.array.constructor===Int32Array)s=Ie.INT;else if(t.array.constructor===Uint32Array)s=Ie.UNSIGNED_INT;else if(t.array.constructor===Int16Array)s=Ie.SHORT;else if(t.array.constructor===Uint16Array)s=Ie.UNSIGNED_SHORT;else if(t.array.constructor===Int8Array)s=Ie.BYTE;else if(t.array.constructor===Uint8Array)s=Ie.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+t.array.constructor.name);if(i===void 0&&(i=0),(a===void 0||a===1/0)&&(a=t.count),a===0)return null;const d=Au(t,i,a);let v;n!==void 0&&(v=t===n.index?Ie.ELEMENT_ARRAY_BUFFER:Ie.ARRAY_BUFFER);const T=this.processBufferView(t,s,i,a,v),p={bufferView:T.id,byteOffset:T.byteOffset,componentType:s,count:a,max:d.max,min:d.min,type:o[t.itemSize]};return t.normalized===!0&&(p.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(p)-1}processImage(t,n,i,a="image/png"){if(t!==null){const r=this,o=r.cache,s=r.json,d=r.options,v=r.pending;o.images.has(t)||o.images.set(t,{});const T=o.images.get(t),p=a+":flipY/"+i.toString();if(T[p]!==void 0)return T[p];s.images||(s.images=[]);const m={mimeType:a},E=Sr();E.width=Math.min(t.width,d.maxTextureSize),E.height=Math.min(t.height,d.maxTextureSize);const C=E.getContext("2d",{willReadFrequently:!0});if(i===!0&&(C.translate(0,E.height),C.scale(1,-1)),t.data!==void 0){n!==xt&&console.error("GLTFExporter: Only RGBAFormat is supported.",n),(t.width>d.maxTextureSize||t.height>d.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",t);const f=new Uint8ClampedArray(t.height*t.width*4);for(let c=0;c<f.length;c+=4)f[c+0]=t.data[c+0],f[c+1]=t.data[c+1],f[c+2]=t.data[c+2],f[c+3]=t.data[c+3];C.putImageData(new ImageData(f,t.width,t.height),0,0)}else if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas)C.drawImage(t,0,0,E.width,E.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");d.binary===!0?v.push(Ru(E,a).then(f=>r.processBufferViewImage(f)).then(f=>{m.bufferView=f})):m.uri=Co.getDataURL(E,a);const x=s.images.push(m)-1;return T[p]=x,x}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(t){const n=this.json;n.samplers||(n.samplers=[]);const i={magFilter:_t[t.magFilter],minFilter:_t[t.minFilter],wrapS:_t[t.wrapS],wrapT:_t[t.wrapT]};return n.samplers.push(i)-1}async processTextureAsync(t){const i=this.options,a=this.cache,r=this.json;if(a.textures.has(t))return a.textures.get(t);r.textures||(r.textures=[]),t instanceof yn&&(t=await this.decompressTextureAsync(t,i.maxTextureSize));let o=t.userData.mimeType;o==="image/webp"&&(o="image/png");const s={sampler:this.processSampler(t),source:this.processImage(t.image,t.format,t.flipY,o)};t.name&&(s.name=t.name),await this._invokeAllAsync(async function(v){v.writeTexture&&await v.writeTexture(t,s)});const d=r.textures.push(s)-1;return a.textures.set(t,d),d}async processMaterialAsync(t){const n=this.cache,i=this.json;if(n.materials.has(t))return n.materials.get(t);if(t.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;i.materials||(i.materials=[]);const a={pbrMetallicRoughness:{}};t.isMeshStandardMaterial!==!0&&t.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const r=t.color.toArray().concat([t.opacity]);if(en(r,[1,1,1,1])||(a.pbrMetallicRoughness.baseColorFactor=r),t.isMeshStandardMaterial?(a.pbrMetallicRoughness.metallicFactor=t.metalness,a.pbrMetallicRoughness.roughnessFactor=t.roughness):(a.pbrMetallicRoughness.metallicFactor=0,a.pbrMetallicRoughness.roughnessFactor=1),t.metalnessMap||t.roughnessMap){const s=await this.buildMetalRoughTextureAsync(t.metalnessMap,t.roughnessMap),d={index:await this.processTextureAsync(s),texCoord:s.channel};this.applyTextureTransform(d,s),a.pbrMetallicRoughness.metallicRoughnessTexture=d}if(t.map){const s={index:await this.processTextureAsync(t.map),texCoord:t.map.channel};this.applyTextureTransform(s,t.map),a.pbrMetallicRoughness.baseColorTexture=s}if(t.emissive){const s=t.emissive;if(Math.max(s.r,s.g,s.b)>0&&(a.emissiveFactor=t.emissive.toArray()),t.emissiveMap){const v={index:await this.processTextureAsync(t.emissiveMap),texCoord:t.emissiveMap.channel};this.applyTextureTransform(v,t.emissiveMap),a.emissiveTexture=v}}if(t.normalMap){const s={index:await this.processTextureAsync(t.normalMap),texCoord:t.normalMap.channel};t.normalScale&&t.normalScale.x!==1&&(s.scale=t.normalScale.x),this.applyTextureTransform(s,t.normalMap),a.normalTexture=s}if(t.aoMap){const s={index:await this.processTextureAsync(t.aoMap),texCoord:t.aoMap.channel};t.aoMapIntensity!==1&&(s.strength=t.aoMapIntensity),this.applyTextureTransform(s,t.aoMap),a.occlusionTexture=s}t.transparent?a.alphaMode="BLEND":t.alphaTest>0&&(a.alphaMode="MASK",a.alphaCutoff=t.alphaTest),t.side===Tt&&(a.doubleSided=!0),t.name!==""&&(a.name=t.name),this.serializeUserData(t,a),await this._invokeAllAsync(async function(s){s.writeMaterialAsync&&await s.writeMaterialAsync(t,a)});const o=i.materials.push(a)-1;return n.materials.set(t,o),o}async processMeshAsync(t){const n=this.cache,i=this.json,a=[t.geometry.uuid];if(Array.isArray(t.material))for(let S=0,y=t.material.length;S<y;S++)a.push(t.material[S].uuid);else a.push(t.material.uuid);const r=a.join(":");if(n.meshes.has(r))return n.meshes.get(r);const o=t.geometry;let s;t.isLineSegments?s=Ie.LINES:t.isLineLoop?s=Ie.LINE_LOOP:t.isLine?s=Ie.LINE_STRIP:t.isPoints?s=Ie.POINTS:s=t.material.wireframe?Ie.LINES:Ie.TRIANGLES;const d={},v={},T=[],p=[],m={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},E=o.getAttribute("normal");E!==void 0&&!this.isNormalizedNormalAttribute(E)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(E)));let C=null;for(let S in o.attributes){if(S.slice(0,5)==="morph")continue;const y=o.attributes[S];if(S=m[S]||S.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(S)||(S="_"+S),n.attributes.has(this.getUID(y))){v[S]=n.attributes.get(this.getUID(y));continue}C=null;const I=y.array;S==="JOINTS_0"&&!(I instanceof Uint16Array)&&!(I instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),C=new tt(new Uint16Array(I),y.itemSize,y.normalized)):(I instanceof Uint32Array||I instanceof Int32Array)&&!S.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${S}" converted to type FLOAT.`),C=En.Utils.toFloat32BufferAttribute(y));const O=this.processAccessor(C||y,o);O!==null&&(S.startsWith("_")||this.detectMeshQuantization(S,y),v[S]=O,n.attributes.set(this.getUID(y),O))}if(E!==void 0&&o.setAttribute("normal",E),Object.keys(v).length===0)return null;if(t.morphTargetInfluences!==void 0&&t.morphTargetInfluences.length>0){const S=[],y=[],R={};if(t.morphTargetDictionary!==void 0)for(const I in t.morphTargetDictionary)R[t.morphTargetDictionary[I]]=I;for(let I=0;I<t.morphTargetInfluences.length;++I){const O={};let g=!1;for(const h in o.morphAttributes){if(h!=="position"&&h!=="normal"){g||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),g=!0);continue}const b=o.morphAttributes[h][I],B=h.toUpperCase(),Y=o.attributes[h];if(n.attributes.has(this.getUID(b,!0))){O[B]=n.attributes.get(this.getUID(b,!0));continue}const K=b.clone();if(!o.morphTargetsRelative)for(let z=0,W=b.count;z<W;z++)for(let ee=0;ee<b.itemSize;ee++)ee===0&&K.setX(z,b.getX(z)-Y.getX(z)),ee===1&&K.setY(z,b.getY(z)-Y.getY(z)),ee===2&&K.setZ(z,b.getZ(z)-Y.getZ(z)),ee===3&&K.setW(z,b.getW(z)-Y.getW(z));O[B]=this.processAccessor(K,o),n.attributes.set(this.getUID(Y,!0),O[B])}p.push(O),S.push(t.morphTargetInfluences[I]),t.morphTargetDictionary!==void 0&&y.push(R[I])}d.weights=S,y.length>0&&(d.extras={},d.extras.targetNames=y)}const x=Array.isArray(t.material);if(x&&o.groups.length===0)return null;let f=!1;if(x&&o.index===null){const S=[];for(let y=0,R=o.attributes.position.count;y<R;y++)S[y]=y;o.setIndex(S),f=!0}const c=x?t.material:[t.material],U=x?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let S=0,y=U.length;S<y;S++){const R={mode:s,attributes:v};if(this.serializeUserData(o,R),p.length>0&&(R.targets=p),o.index!==null){let O=this.getUID(o.index);(U[S].start!==void 0||U[S].count!==void 0)&&(O+=":"+U[S].start+":"+U[S].count),n.attributes.has(O)?R.indices=n.attributes.get(O):(R.indices=this.processAccessor(o.index,o,U[S].start,U[S].count),n.attributes.set(O,R.indices)),R.indices===null&&delete R.indices}const I=await this.processMaterialAsync(c[U[S].materialIndex]);I!==null&&(R.material=I),T.push(R)}f===!0&&o.setIndex(null),d.primitives=T,i.meshes||(i.meshes=[]),await this._invokeAllAsync(function(S){S.writeMesh&&S.writeMesh(t,d)});const P=i.meshes.push(d)-1;return n.meshes.set(r,P),P}detectMeshQuantization(t,n){if(this.extensionsUsed[Gn])return;let i;switch(n.array.constructor){case Int8Array:i="byte";break;case Uint8Array:i="unsigned byte";break;case Int16Array:i="short";break;case Uint16Array:i="unsigned short";break;default:return}n.normalized&&(i+=" normalized");const a=t.split("_",1)[0];_r[a]&&_r[a].includes(i)&&(this.extensionsUsed[Gn]=!0,this.extensionsRequired[Gn]=!0)}processCamera(t){const n=this.json;n.cameras||(n.cameras=[]);const i=t.isOrthographicCamera,a={type:i?"orthographic":"perspective"};return i?a.orthographic={xmag:t.right*2,ymag:t.top*2,zfar:t.far<=0?.001:t.far,znear:t.near<0?0:t.near}:a.perspective={aspectRatio:t.aspect,yfov:Jn.degToRad(t.fov),zfar:t.far<=0?.001:t.far,znear:t.near<0?0:t.near},t.name!==""&&(a.name=t.type),n.cameras.push(a)-1}processAnimation(t,n){const i=this.json,a=this.nodeMap;i.animations||(i.animations=[]),t=En.Utils.mergeMorphTargetTracks(t.clone(),n);const r=t.tracks,o=[],s=[];for(let v=0;v<r.length;++v){const T=r[v],p=vn.parseTrackName(T.name);let m=vn.findNode(n,p.nodeName);const E=gr[p.propertyName];if(p.objectName==="bones"&&(m.isSkinnedMesh===!0?m=m.skeleton.getBoneByName(p.objectIndex):m=void 0),!m||!E){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',T.name);continue}const C=1;let x=T.values.length/T.times.length;E===gr.morphTargetInfluences&&(x/=m.morphTargetInfluences.length);let f;T.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(f="CUBICSPLINE",x/=3):T.getInterpolation()===wo?f="STEP":f="LINEAR",s.push({input:this.processAccessor(new tt(T.times,C)),output:this.processAccessor(new tt(T.values,x)),interpolation:f}),o.push({sampler:s.length-1,target:{node:a.get(m),path:E}})}const d={name:t.name||"clip_"+i.animations.length,samplers:s,channels:o};return this.serializeUserData(t,d),i.animations.push(d),i.animations.length-1}processSkin(t){const n=this.json,i=this.nodeMap,a=n.nodes[i.get(t)],r=t.skeleton;if(r===void 0)return null;const o=t.skeleton.bones[0];if(o===void 0)return null;const s=[],d=new Float32Array(r.bones.length*16),v=new At;for(let p=0;p<r.bones.length;++p)s.push(i.get(r.bones[p])),v.copy(r.boneInverses[p]),v.multiply(t.bindMatrix).toArray(d,p*16);return n.skins===void 0&&(n.skins=[]),n.skins.push({inverseBindMatrices:this.processAccessor(new tt(d,16)),joints:s,skeleton:i.get(o)}),a.skin=n.skins.length-1}async processNodeAsync(t){const n=this.json,i=this.options,a=this.nodeMap;n.nodes||(n.nodes=[]);const r={};if(i.trs){const s=t.quaternion.toArray(),d=t.position.toArray(),v=t.scale.toArray();en(s,[0,0,0,1])||(r.rotation=s),en(d,[0,0,0])||(r.translation=d),en(v,[1,1,1])||(r.scale=v)}else t.matrixAutoUpdate&&t.updateMatrix(),xu(t.matrix)===!1&&(r.matrix=t.matrix.elements);if(t.name!==""&&(r.name=String(t.name)),this.serializeUserData(t,r),t.isMesh||t.isLine||t.isPoints){const s=await this.processMeshAsync(t);s!==null&&(r.mesh=s)}else t.isCamera&&(r.camera=this.processCamera(t));t.isSkinnedMesh&&this.skins.push(t);const o=n.nodes.push(r)-1;if(a.set(t,o),t.children.length>0){const s=[];for(let d=0,v=t.children.length;d<v;d++){const T=t.children[d];if(T.visible||i.onlyVisible===!1){const p=await this.processNodeAsync(T);p!==null&&s.push(p)}}s.length>0&&(r.children=s)}return await this._invokeAllAsync(function(s){s.writeNode&&s.writeNode(t,r)}),o}async processSceneAsync(t){const n=this.json,i=this.options;n.scenes||(n.scenes=[],n.scene=0);const a={};t.name!==""&&(a.name=t.name),n.scenes.push(a);const r=[];for(let o=0,s=t.children.length;o<s;o++){const d=t.children[o];if(d.visible||i.onlyVisible===!1){const v=await this.processNodeAsync(d);v!==null&&r.push(v)}}r.length>0&&(a.nodes=r),this.serializeUserData(t,a)}async processObjectsAsync(t){const n=new Qn;n.name="AuxScene";for(let i=0;i<t.length;i++)n.children.push(t[i]);await this.processSceneAsync(n)}async processInputAsync(t){const n=this.options;t=t instanceof Array?t:[t],await this._invokeAllAsync(function(a){a.beforeParse&&a.beforeParse(t)});const i=[];for(let a=0;a<t.length;a++)t[a]instanceof Qn?await this.processSceneAsync(t[a]):i.push(t[a]);i.length>0&&await this.processObjectsAsync(i);for(let a=0;a<this.skins.length;++a)this.processSkin(this.skins[a]);for(let a=0;a<n.animations.length;++a)this.processAnimation(n.animations[a],t[0]);await this._invokeAllAsync(function(a){a.afterParse&&a.afterParse(t)})}async _invokeAllAsync(t){for(let n=0,i=this.plugins.length;n<i;n++)await t(this.plugins[n])}}class Cu{constructor(t){this.writer=t,this.name="KHR_lights_punctual"}writeNode(t,n){if(!t.isLight)return;if(!t.isDirectionalLight&&!t.isPointLight&&!t.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",t);return}const i=this.writer,a=i.json,r=i.extensionsUsed,o={};t.name&&(o.name=t.name),o.color=t.color.toArray(),o.intensity=t.intensity,t.isDirectionalLight?o.type="directional":t.isPointLight?(o.type="point",t.distance>0&&(o.range=t.distance)):t.isSpotLight&&(o.type="spot",t.distance>0&&(o.range=t.distance),o.spot={},o.spot.innerConeAngle=(1-t.penumbra)*t.angle,o.spot.outerConeAngle=t.angle),t.decay!==void 0&&t.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),t.target&&(t.target.parent!==t||t.target.position.x!==0||t.target.position.y!==0||t.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(a.extensions=a.extensions||{},a.extensions[this.name]={lights:[]},r[this.name]=!0);const s=a.extensions[this.name].lights;s.push(o),n.extensions=n.extensions||{},n.extensions[this.name]={light:s.length-1}}}class wu{constructor(t){this.writer=t,this.name="KHR_materials_unlit"}async writeMaterialAsync(t,n){if(!t.isMeshBasicMaterial)return;const a=this.writer.extensionsUsed;n.extensions=n.extensions||{},n.extensions[this.name]={},a[this.name]=!0,n.pbrMetallicRoughness.metallicFactor=0,n.pbrMetallicRoughness.roughnessFactor=.9}}class Pu{constructor(t){this.writer=t,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.clearcoat===0)return;const i=this.writer,a=i.extensionsUsed,r={};if(r.clearcoatFactor=t.clearcoat,t.clearcoatMap){const o={index:await i.processTextureAsync(t.clearcoatMap),texCoord:t.clearcoatMap.channel};i.applyTextureTransform(o,t.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=t.clearcoatRoughness,t.clearcoatRoughnessMap){const o={index:await i.processTextureAsync(t.clearcoatRoughnessMap),texCoord:t.clearcoatRoughnessMap.channel};i.applyTextureTransform(o,t.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(t.clearcoatNormalMap){const o={index:await i.processTextureAsync(t.clearcoatNormalMap),texCoord:t.clearcoatNormalMap.channel};t.clearcoatNormalScale.x!==1&&(o.scale=t.clearcoatNormalScale.x),i.applyTextureTransform(o,t.clearcoatNormalMap),r.clearcoatNormalTexture=o}n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Lu{constructor(t){this.writer=t,this.name="KHR_materials_dispersion"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.dispersion===0)return;const a=this.writer.extensionsUsed,r={};r.dispersion=t.dispersion,n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Uu{constructor(t){this.writer=t,this.name="KHR_materials_iridescence"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.iridescence===0)return;const i=this.writer,a=i.extensionsUsed,r={};if(r.iridescenceFactor=t.iridescence,t.iridescenceMap){const o={index:await i.processTextureAsync(t.iridescenceMap),texCoord:t.iridescenceMap.channel};i.applyTextureTransform(o,t.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=t.iridescenceIOR,r.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1],t.iridescenceThicknessMap){const o={index:await i.processTextureAsync(t.iridescenceThicknessMap),texCoord:t.iridescenceThicknessMap.channel};i.applyTextureTransform(o,t.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class yu{constructor(t){this.writer=t,this.name="KHR_materials_transmission"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.transmission===0)return;const i=this.writer,a=i.extensionsUsed,r={};if(r.transmissionFactor=t.transmission,t.transmissionMap){const o={index:await i.processTextureAsync(t.transmissionMap),texCoord:t.transmissionMap.channel};i.applyTextureTransform(o,t.transmissionMap),r.transmissionTexture=o}n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Du{constructor(t){this.writer=t,this.name="KHR_materials_volume"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.transmission===0)return;const i=this.writer,a=i.extensionsUsed,r={};if(r.thicknessFactor=t.thickness,t.thicknessMap){const o={index:await i.processTextureAsync(t.thicknessMap),texCoord:t.thicknessMap.channel};i.applyTextureTransform(o,t.thicknessMap),r.thicknessTexture=o}t.attenuationDistance!==1/0&&(r.attenuationDistance=t.attenuationDistance),r.attenuationColor=t.attenuationColor.toArray(),n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Iu{constructor(t){this.writer=t,this.name="KHR_materials_ior"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.ior===1.5)return;const a=this.writer.extensionsUsed,r={};r.ior=t.ior,n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Nu{constructor(t){this.writer=t,this.name="KHR_materials_specular"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.specularIntensity===1&&t.specularColor.equals(gu)&&!t.specularIntensityMap&&!t.specularColorMap)return;const i=this.writer,a=i.extensionsUsed,r={};if(t.specularIntensityMap){const o={index:await i.processTextureAsync(t.specularIntensityMap),texCoord:t.specularIntensityMap.channel};i.applyTextureTransform(o,t.specularIntensityMap),r.specularTexture=o}if(t.specularColorMap){const o={index:await i.processTextureAsync(t.specularColorMap),texCoord:t.specularColorMap.channel};i.applyTextureTransform(o,t.specularColorMap),r.specularColorTexture=o}r.specularFactor=t.specularIntensity,r.specularColorFactor=t.specularColor.toArray(),n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Fu{constructor(t){this.writer=t,this.name="KHR_materials_sheen"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.sheen==0)return;const i=this.writer,a=i.extensionsUsed,r={};if(t.sheenRoughnessMap){const o={index:await i.processTextureAsync(t.sheenRoughnessMap),texCoord:t.sheenRoughnessMap.channel};i.applyTextureTransform(o,t.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(t.sheenColorMap){const o={index:await i.processTextureAsync(t.sheenColorMap),texCoord:t.sheenColorMap.channel};i.applyTextureTransform(o,t.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=t.sheenRoughness,r.sheenColorFactor=t.sheenColor.toArray(),n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Ou{constructor(t){this.writer=t,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(t,n){if(!t.isMeshPhysicalMaterial||t.anisotropy==0)return;const i=this.writer,a=i.extensionsUsed,r={};if(t.anisotropyMap){const o={index:await i.processTextureAsync(t.anisotropyMap)};i.applyTextureTransform(o,t.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=t.anisotropy,r.anisotropyRotation=t.anisotropyRotation,n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Bu{constructor(t){this.writer=t,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(t,n){if(!t.isMeshStandardMaterial||t.emissiveIntensity===1)return;const a=this.writer.extensionsUsed,r={};r.emissiveStrength=t.emissiveIntensity,n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Gu{constructor(t){this.writer=t,this.name="EXT_materials_bump"}async writeMaterialAsync(t,n){if(!t.isMeshStandardMaterial||t.bumpScale===1&&!t.bumpMap)return;const i=this.writer,a=i.extensionsUsed,r={};if(t.bumpMap){const o={index:await i.processTextureAsync(t.bumpMap),texCoord:t.bumpMap.channel};i.applyTextureTransform(o,t.bumpMap),r.bumpTexture=o}r.bumpFactor=t.bumpScale,n.extensions=n.extensions||{},n.extensions[this.name]=r,a[this.name]=!0}}class Hu{constructor(t){this.writer=t,this.name="EXT_mesh_gpu_instancing"}writeNode(t,n){if(!t.isInstancedMesh)return;const i=this.writer,a=t,r=new Float32Array(a.count*3),o=new Float32Array(a.count*4),s=new Float32Array(a.count*3),d=new At,v=new Fe,T=new Wr,p=new Fe;for(let E=0;E<a.count;E++)a.getMatrixAt(E,d),d.decompose(v,T,p),v.toArray(r,E*3),T.toArray(o,E*4),p.toArray(s,E*3);const m={TRANSLATION:i.processAccessor(new tt(r,3)),ROTATION:i.processAccessor(new tt(o,4)),SCALE:i.processAccessor(new tt(s,3))};a.instanceColor&&(m._COLOR_0=i.processAccessor(a.instanceColor)),n.extensions=n.extensions||{},n.extensions[this.name]={attributes:m},i.extensionsUsed[this.name]=!0,i.extensionsRequired[this.name]=!0}}En.Utils={insertKeyframe:function(e,t){const i=e.getValueSize(),a=new e.TimeBufferType(e.times.length+1),r=new e.ValueBufferType(e.values.length+i),o=e.createInterpolant(new e.ValueBufferType(i));let s;if(e.times.length===0){a[0]=t;for(let d=0;d<i;d++)r[d]=0;s=0}else if(t<e.times[0]){if(Math.abs(e.times[0]-t)<.001)return 0;a[0]=t,a.set(e.times,1),r.set(o.evaluate(t),0),r.set(e.values,i),s=0}else if(t>e.times[e.times.length-1]){if(Math.abs(e.times[e.times.length-1]-t)<.001)return e.times.length-1;a[a.length-1]=t,a.set(e.times,0),r.set(e.values,0),r.set(o.evaluate(t),e.values.length),s=a.length-1}else for(let d=0;d<e.times.length;d++){if(Math.abs(e.times[d]-t)<.001)return d;if(e.times[d]<t&&e.times[d+1]>t){a.set(e.times.slice(0,d+1),0),a[d+1]=t,a.set(e.times.slice(d+1),d+2),r.set(e.values.slice(0,(d+1)*i),0),r.set(o.evaluate(t),(d+1)*i),r.set(e.values.slice((d+1)*i),(d+2)*i),s=d+1;break}}return e.times=a,e.values=r,s},mergeMorphTargetTracks:function(e,t){const n=[],i={},a=e.tracks;for(let r=0;r<a.length;++r){let o=a[r];const s=vn.parseTrackName(o.name),d=vn.findNode(t,s.nodeName);if(s.propertyName!=="morphTargetInfluences"||s.propertyIndex===void 0){n.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(Po)}const v=d.morphTargetInfluences.length,T=d.morphTargetDictionary[s.propertyIndex];if(T===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+s.propertyIndex);let p;if(i[d.uuid]===void 0){p=o.clone();const E=new p.ValueBufferType(v*p.times.length);for(let C=0;C<p.times.length;C++)E[C*v+T]=p.values[C];p.name=(s.nodeName||"")+".morphTargetInfluences",p.values=E,i[d.uuid]=p,n.push(p);continue}const m=o.createInterpolant(new o.ValueBufferType(1));p=i[d.uuid];for(let E=0;E<p.times.length;E++)p.values[E*v+T]=m.evaluate(p.times[E]);for(let E=0;E<o.times.length;E++){const C=this.insertKeyframe(p,o.times[E]);p.values[C*v+T]=o.values[E]}}return e.tracks=n,e},toFloat32BufferAttribute:function(e){const t=new tt(new Float32Array(e.count*e.itemSize),e.itemSize,!1);if(!e.normalized&&!e.isInterleavedBufferAttribute)return t.array.set(e.array),t;for(let n=0,i=e.count;n<i;n++)for(let a=0;a<e.itemSize;a++)t.setComponent(n,a,e.getComponent(n,a));return t}};function ea(e){const t=_u(e.transform),n=[Jr(e.geo,t)];return e.mirror&&n.push(ku(e,t)),n.length>1?Qr(n):n[0]}function Vu(e){const t=[];for(const n of e.list())n.visible&&t.push({id:n.id,name:n.name,color:n.color,geo:ea(n),isFigure:!!n.character});return t}function ku(e,t){const n=e.mirror==="x"?0:e.mirror==="y"?1:2,i=new At().identity(),a=i.elements;a[n*4+n]=-1;const r=new At().multiplyMatrices(i,t);return Jr(e.geo,r)}function zu(e,t){const n=Qr(e.map(m=>m.geo)),i=n.indices.length/3,a=new ArrayBuffer(84+i*50),r=new DataView(a),o="SculptPad binary STL (mm)";for(let m=0;m<o.length&&m<80;m++)r.setUint8(m,o.charCodeAt(m));r.setUint32(80,i,!0);const s=n.positions;let d=84;const v=m=>s[m*3]*t,T=m=>-s[m*3+2]*t,p=m=>s[m*3+1]*t;for(let m=0;m<i;m++){const E=n.indices[m*3],C=n.indices[m*3+1],x=n.indices[m*3+2],f=v(C)-v(E),c=T(C)-T(E),U=p(C)-p(E),P=v(x)-v(E),S=T(x)-T(E),y=p(x)-p(E);let R=c*y-U*S,I=U*P-f*y,O=f*S-c*P;const g=Math.hypot(R,I,O)||1;R/=g,I/=g,O/=g,r.setFloat32(d,R,!0),r.setFloat32(d+4,I,!0),r.setFloat32(d+8,O,!0);let h=d+12;for(const b of[E,C,x])r.setFloat32(h,v(b),!0),r.setFloat32(h+4,T(b),!0),r.setFloat32(h+8,p(b),!0),h+=12;r.setUint16(d+48,0,!0),d+=50}return new Blob([a],{type:"model/stl"})}function Wu(e){const t=["# SculptPad OBJ export"];let n=1,i=1,a=1;for(const r of e){const o=r.geo;t.push(`o ${r.name.replace(/\s+/g,"_")}`);const s=o.positions;for(let m=0;m<s.length;m+=3)t.push(`v ${wt(s[m])} ${wt(s[m+1])} ${wt(s[m+2])}`);const d=!!o.uvs;if(d){const m=o.uvs;for(let E=0;E<m.length;E+=2)t.push(`vt ${wt(m[E])} ${wt(m[E+1])}`)}const v=!!o.normals;if(v){const m=o.normals;for(let E=0;E<m.length;E+=3)t.push(`vn ${wt(m[E])} ${wt(m[E+1])} ${wt(m[E+2])}`)}const T=o.indices;for(let m=0;m<T.length;m+=3){const E=[T[m],T[m+1],T[m+2]].map(C=>{const x=C+n;return d&&v?`${x}/${C+i}/${C+a}`:d?`${x}/${C+i}`:v?`${x}//${C+a}`:`${x}`});t.push(`f ${E[0]} ${E[1]} ${E[2]}`)}const p=s.length/3;n+=p,d&&(i+=p),v&&(a+=p)}return new Blob([t.join(`
`)],{type:"model/obj"})}function wt(e){return Number.isInteger(e)?e.toString():e.toFixed(6).replace(/0+$/,"").replace(/\.$/,"")}function Xu(e){const t=e.shared,n=new xn;n.setAttribute("position",new tt(t.basePositions.slice(),3)),n.setAttribute("uv",new tt(t.uvs,2)),n.setIndex(new tt(t.indices,1)),n.computeVertexNormals();const i=t.vertCount,a=new Uint16Array(i*4),r=new Float32Array(i*4);for(let s=0;s<i;s++)a[s*4]=t.skinIndex[s*2],a[s*4+1]=t.skinIndex[s*2+1],r[s*4]=t.skinWeight[s*2],r[s*4+1]=t.skinWeight[s*2+1];n.setAttribute("skinIndex",new tt(a,4)),n.setAttribute("skinWeight",new tt(r,4)),n.morphTargetsRelative=!0,n.morphAttributes.position=t.targetDeltas.map(s=>new tt(s,3));const o=[];for(const s of e.instances){const d=t.bones.map(T=>{const p=new Lo;return p.name=T,p});for(let T=0;T<d.length;T++){const p=t.boneParent[T],m=t.baseJoints[T*3],E=t.baseJoints[T*3+1],C=t.baseJoints[T*3+2];p<0?d[T].position.set(m,E,C):(d[p].add(d[T]),d[T].position.set(m-t.baseJoints[p*3],E-t.baseJoints[p*3+1],C-t.baseJoints[p*3+2]))}const v=new Uo(n,new Xr({color:s.color,roughness:.7,metalness:0}));v.name=s.name,v.add(d[0]),v.updateMatrixWorld(!0),v.bind(new yo(d)),v.morphTargetInfluences=[...s.influences],v.morphTargetDictionary=Object.fromEntries(t.targetNames.map((T,p)=>[T,p])),v.userData.targetNames=t.targetNames,s.matrix.decompose(v.position,v.quaternion,v.scale),o.push(v)}return o}function Yu(e,t){const n=new Qn;for(const i of e){const a=new Ct(mu(i.geo),new Xr({color:i.color,roughness:.7,metalness:0}));a.name=i.name,n.add(a)}if(t)for(const i of Xu(t))n.add(i);return n.updateMatrixWorld(!0),new Promise((i,a)=>{new En().parse(n,r=>i(new Blob([r],{type:"model/gltf-binary"})),r=>a(r),{binary:!0})})}async function Ku(e,t){const n=new File([t],e,{type:t.type}),i=navigator;if(i.canShare?.({files:[n]}))try{return await i.share({files:[n]}),"shared"}catch(o){if(o.name==="AbortError")return"shared"}const a=URL.createObjectURL(t),r=document.createElement("a");return r.href=a,r.download=e,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(a),1e4),"downloaded"}const ed=Object.freeze(Object.defineProperty({__proto__:null,bakeObjectGeo:ea,collectExportMeshes:Vu,deliverFile:Ku,exportGLB:Yu,exportOBJ:Wu,exportSTL:zu},Symbol.toStringTag,{value:"Module"}));export{Ki as P,$u as W,_u as a,ea as b,Qu as c,Vu as d,Qr as e,Zu as f,ju as g,zu as h,Wu as i,Yu as j,Ku as k,ed as l,Ju as m,mu as t};
