class Reactive{
	constructor(opt={}){
		this.anchor=new Anchor(opt.anchor||{})
		this.fix=opt.fix||[]
		this.edges=opt.edges||[]
		this.returnCollides=opt.returnCollides||0
		this.generateFriction=opt.generateFriction||'vadd(this.anchor.pr_fromGrid(psz[i][0]),vmultf(this.anchor.fromGrid(psz[i][0]),-1))'
	}
	collide(p,d2){
		let collides=[],d=[vnorm(d2[0]),vnorm(d2[1])],psz=[],x,tc=0,getOrient=i=>{let x=vadd(i,vmultf(p,-1));return [vdot(x,d[0]),vdot(x,d[1]),vdot(x,vcross(...d))]}
		for(let i=0;i<this.fix.length;i++){
			x=getOrient(this.anchor.fromGrid(this.fix[i]))
			let r=vmag(this.fix[i])
			if(x[1]>0)psz.push([this.fix[i],vmultf(x,1/r),i,d[1],r])
		}
		for(let i=0;i<psz.length;i++){
			let z=vmultf(eval(this.generateFriction),1/psz[i][4])
			if(this.returnCollides){
				collides.push([psz[i],z])
			}else{
				this.anchor.applyForce(vnorm(psz[i][0]),this.anchor.absolNormal(vmultf(d[1],-psz[i][1][1]/psz.length*cnst.rebound/cnst.inertia.mov)))
				this.anchor.applyForce(vnorm(psz[i][0]),this.anchor.absolNormal(vmultf(z,1/psz.length*cnst.grip/cnst.inertia.mov)))
			}
		}
		if(psz.length==0){
			x=getOrient(this.anchor.p)
			if(x[1]>0){
				this.anchor.applyForce([0,0,0],this.anchor.absolNormal(vmultf([0,-x[1],0],cnst.rebound/cnst.inertia.mov)))
				this.anchor.applyForce([0,0,0],this.anchor.absolNormal(vmultf(this.anchor.v,cnst.grip/cnst.inertia.mov)))
			}
		}
		return collides
	}
	collidef(g/*generation function for input p, returns {p[3] position d[2][3] anchors}*/){
		let collides=[],psz=[],x,tc=0,getOrient=i=>{let y=g(i);y.d=[vnorm(y.d[0]),vnorm(y.d[1])];x=vadd(i,vmultf(y.p,-1));return [vdot(x,y.d[0]),vdot(x,y.d[1]),vdot(x,vcross(...y.d))]}
		for(let i=0;i<this.fix.length;i++){
			x=getOrient(this.anchor.fromGrid(this.fix[i]))
			let r=vmag(this.fix[i])
			if(x[1]>0)psz.push([this.fix[i],vmultf(x,1/r),i,g(this.anchor.fromGrid(this.fix[i])).d[1],r])
		}
		for(let i=0;i<psz.length;i++){
			let z=vmultf(eval(this.generateFriction),1/psz[i][4])
			if(this.returnCollides){
				collides.push([psz[i],z])
			}else{
				this.anchor.applyForce(vnorm(psz[i][0]),this.anchor.absolNormal(vmultf(psz[i][3],-psz[i][1][1]/psz.length*cnst.rebound/cnst.inertia.mov)))
				this.anchor.applyForce(vnorm(psz[i][0]),this.anchor.absolNormal(vmultf(z,1/psz.length*cnst.grip/cnst.inertia.mov)))
			}
		}
		if(psz.length==0){
			x=getOrient(this.anchor.p)
			if(x[1]>0){
				this.anchor.applyForce([0,0,0],this.anchor.absolNormal(vmultf([0,-x[1],0],cnst.rebound/cnst.inertia.mov)))
				this.anchor.applyForce([0,0,0],this.anchor.absolNormal(vmultf(this.anchor.v,cnst.grip/cnst.inertia.mov)))
			}
		}
		return collides
	}
	update(dt=1){
		this.anchor.update(dt)
	}
	applyForce(p,d){
		this.anchor.applyForce(p,d)
	}
	applyWorldForce(p,d){
		this.anchor.applyWorldForce(p,d)
	}
	toGrid(p){
		return this.anchor.toGrid(p)
	}
	fromGrid(p){
		return this.anchor.fromGrid(p)
	}
	absolNormal(p){
		return this.anchor.absolNormal(p)
	}
	gridNormal(p){
		return this.anchor.gridNormal(p)
	}
	pr_toGrid(p){
		return this.anchor.pr_toGrid(p)
	}
	pr_fromGrid(p){
		return this.anchor.pr_fromGrid(p)
	}
	pr_absolNormal(p){
		return this.anchor.pr_absolNormal(p)
	}
	pr_gridNormal(p){
		return this.anchor.pr_gridNormal(p)
	}
}
