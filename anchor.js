class Anchor{
	constructor(opt={}){
		this.p=opt.p||[0,0,0]
		this.a=opt.a||[[1,0,0],[0,1,0]]
		this.r=opt.r||[[0,0,0],[0,0,0]]
		this.v=opt.v||[0,0,0]
		this.forces=[[0,0,0],[0,0,0],[0,0,0]]
		this.pr={p:[...this.p],a:[[...this.a[0]],[...this.a[1]],vcross(...this.a)]}
	}
	update(dt=1){
		this.pr={p:[...this.p],a:[[...this.a[0]],[...this.a[1]],vcross(...this.a)]}
		for(let i=0;i<2;i++){for(let j=0;j<3;j++){this.r[i][j]+=this.forces[i][j]*dt}}
		for(let z=0;z<3;z++){this.v[z]+=this.forces[2][z]*dt}
		this.forces=[[0,0,0],[0,0,0],[0,0,0]]
		for(let i=0;i<2;i++){for(let j=0;j<3;j++){this.r[i][j]*=cnst.drag.rot;if(i)this.v[j]*=cnst.drag.mov}}
		for(let z=0;z<3;z++){this.p[z]+=this.v[z]*dt}
		let b=[[...this.a[0]],[...this.a[1]],vcross(...this.a)]
		for(let i=0;i<2;i++){for(let j=0;j<3;j++){for(let z=0;z<3;z++){this.a[i][z]+=this.r[i][j]*b[j][z]*dt}}}
		
		this.a[1]=vnorm(vmultf(vcross(this.a[0],vcross(...this.a)),-1))
		this.a[0]=vnorm(this.a[0])
	}
	applyForce(p,d){
		this.forces[0][1]-=cnst.inertia.rot*p[1]*d[0]
		this.forces[0][1]+=cnst.inertia.rot*p[0]*d[1]
		this.forces[0][2]-=cnst.inertia.rot*p[2]*d[0]
		this.forces[0][2]+=cnst.inertia.rot*p[0]*d[2]
		this.forces[1][0]-=cnst.inertia.rot*p[1]*d[0]
		this.forces[1][0]+=cnst.inertia.rot*p[0]*d[1]
		this.forces[1][2]-=cnst.inertia.rot*p[2]*d[1]
		this.forces[1][2]+=cnst.inertia.rot*p[1]*d[2]
		let a=[...this.a,vcross(...this.a)]
		for(let i=0;i<3;i++){for(let z=0;z<3;z++){this.forces[2][i]+=cnst.inertia.mov*d[z]*a[z][i]}}
	}
	applyWorldForce(p,d){
		this.applyForce(toGrid(p),absolNormal(d))
	}
	//clarify: toGrid() is used to convert from world-space to internal grid space, fromGrid() is used to convert from internal grid space back to world space
	toGrid(p){
		let a=[p[0]-this.p[0],p[1]-this.p[1],p[2]-this.p[2]]
		return [vdot(a,this.a[0]),vdot(a,this.a[1]),vdot(a,vcross(...this.a))]
	}
	fromGrid(p){
		let a=[...this.p],b=[...this.a,vcross(...this.a)]
		for(let z=0;z<3;z++){for(let i=0;i<3;i++){a[i]+=b[z][i]*p[z]}}
		return a
	}
	//clarify: absolNormal() converts a world-space vector to a grid-space vector, for example you can use to apply a constant upwards force independent of rotation
	//gridNormal() can be used to display a grid-space vector in world-space
	absolNormal(p){
		return [vdot(p,this.a[0]),vdot(p,this.a[1]),vdot(p,vcross(...this.a))]
	}
	gridNormal(p){
		let a=[0,0,0],b=[...this.a,vcross(...this.a)]
		for(let z=0;z<3;z++){for(let i=0;i<3;i++){a[i]+=b[z][i]*p[z]}}
		return a
	}
	
	pr_toGrid(p){
		let a=[p[0]-this.pr.p[0],p[1]-this.pr.p[1],p[2]-this.pr.p[2]]
		return [vdot(a,this.pr.a[0]),vdot(a,this.pr.a[1]),vdot(a,vcross(...this.pr.a))]
	}
	pr_fromGrid(p){
		let a=[...this.pr.p],b=[...this.pr.a,vcross(...this.pr.a)]
		for(let z=0;z<3;z++){for(let i=0;i<3;i++){a[i]+=b[z][i]*p[z]}}
		return a
	}
	pr_absolNormal(p){
		return [vdot(p,this.pr.a[0]),vdot(p,this.pr.a[1]),vdot(p,vcross(...this.pr.a))]
	}
	pr_gridNormal(p){
		let a=[0,0,0],b=[...this.pr.a,vcross(...this.pr.a)]
		for(let z=0;z<3;z++){for(let i=0;i<3;i++){a[i]+=b[z][i]*p[z]}}
		return a
	}
}
