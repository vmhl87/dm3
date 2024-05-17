const cnst={
	inertia:{
		rot:1/1000,
		mov:1/1000
	},
	drag:{
    rot:1,
    mov:1
  },
  grip:0.7,
  rebound:0.7,
  slide:0.7
}
vdot=(a,b)=>a.map((x,i)=>a[i]*b[i]).reduce((m,n)=>m+n)
vcross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
vnorm=a=>{let b=Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);if(b==0)return [0,0,0];return [a[0]/b,a[1]/b,a[2]/b]}
vadd=(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]]
vmult=(a,b)=>[a[0]*b[0],a[1]*b[1],a[2]*b[2]]
vmultf=(a,b)=>[a[0]*b,a[1]*b,a[2]*b]
vmag=a=>Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2])
vsnap=(a,b)=>vadd(a,vmultf(b,-vdot(b,a)))
vtransform=(a,p,v)=>{
  let x=[...p],b=[...a,vcross(...a)]
  for(let z=0;z<3;z++){for(let i=0;i<3;i++){x[i]+=b[z][i]*v[z]}}
  return x
}
vdetransform=(a,p,v)=>{
	let x=[v[0]-p[0],v[1]-p[1],v[2]-p[2]]
  return [vdot(x,a[0]),vdot(x,a[1]),vdot(x,vcross(...a))]
}
pointAt=(p,c)=>{
  rnd.rotateY(-Math.atan2(p[2]-c[2],p[0]-c[0]))
  rnd.rotateZ(Math.atan2(p[1]-c[1],Math.sqrt((p[0]-c[0])*(p[0]-c[0])+(p[2]-c[2])*(p[2]-c[2]))))
}
drawScreenAt=(p,c)=>{
  rnd.translate(...p)
  pointAt(p,c)
}
build_pointAt=(p,c)=>{
  build_rnd.rotateY(-Math.atan2(p[2]-c[2],p[0]-c[0]))
  build_rnd.rotateZ(Math.atan2(p[1]-c[1],Math.sqrt((p[0]-c[0])*(p[0]-c[0])+(p[2]-c[2])*(p[2]-c[2]))))
}
build_drawScreenAt=(p,c)=>{
  build_rnd.translate(...p)
  build_pointAt(p,c)
}
let currUID=0
newUID=_=>{
	currUID++
	return 'UID_'+currUID.toString()
}
keyToCode=(dir,n)=>{
  let mapTable=(`RIGHT 39_LEFT 37_DOWN 40_UP 38_SHIFT 16_SPACE 32_0 48_1 49_2 50_3 51_4 52_5 53_6 54_7 55_8 56_9 57_a 65_b 66_c 67_d 68_e 69_f 70_g 71_h 72_i 73_j 74_k 75_l 76_m 77_n 78_o 79_p 80_q 81_r 82_s 83_t 84_u 85_v 86_w 87_x 88_y 89_z 90`).split('_')
  if(dir=='key'){for(let i=0;i<mapTable.length;i++){if(mapTable[i].endsWith(n.toString()))return mapTable[i].split(' ')[0]}}
  else if(dir=='code'){for(let i=0;i<mapTable.length;i++){if(mapTable[i].startsWith(n))return parseInt(mapTable[i].slice(mapTable[i].length-2,mapTable[i].length))}}
  return 0
}
mlookAt=(p2,a2)=>{
	let a=[],p=[...p2]
	a.push([...a2[0]],[...a2[1]])
	a.push(vcross(...a))
	a[0]=vnorm(a[0])
	a[1]=vnorm(a[1])
	return [...a[0],0,...a[1],0,...a[2],0,...p,1]
}
line3d=(r,a,b,w=0.03)=>{
	r.push()
	let x=[vnorm(vadd(a,vmultf(b,-1)))],c=vmultf(vadd(a,b),1/2)
	if(x[0][0]>0.9)x.push([0,1,0])
	else x.push([1,0,0])
	x[1]=vnorm(vcross(...x))
	x.push(vnorm(vcross(...x)))
	r.applyMatrix([...x[0],0,...x[1],0,...x[2],0,...c,1])
	r.box(vmag(vadd(a,vmultf(b,-1))),w,w)
	r.pop()
}
sqrx=a=>a*a
