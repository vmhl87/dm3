class Craft{
	constructor(opt={}){
		this.fix=opt.fix||[]
		this.edges=opt.edges||[]
		this.faces=opt.faces||[]
		this.joints=opt.joints||[]
		this.complexEdges=[]
		this.complexFaces=[]
		this.p_jt=[[],[],[]]
		this.o_jt=[[],[],[]]
		this.fc=[]
		this.weight=0;this.m_center=[0,0,0]
		this.reactive=false
		this.reactSetup=opt.reactive||{}
		this.reactSetup.generateFriction=this.reactSetup.generateFriction||'vmultf(vadd(this.anchor.pr_fromGrid(this.p_fix[psz[i][2]]),vmultf(this.anchor.fromGrid(psz[i][0]),-1)),1)'
	}
	addFixture(p,c={},joint=-1){
		if(!(this.joints[joint]||joint<0))return -1
		let y=p,jt=joint,t=0,x=this.joints.length
		while(t<x){
			t++
			y=vadd(y,jt<0?[0,0,0]:vmultf(this.joints[jt].offset,-1))
			if(jt<0)break
			else jt=this.joints[jt].joint
		}
		this.fix.push({joint:joint,grip:c.grip||cnst.grip,rebound:c.rebound||cnst.rebound,slide:c.slide||cnst.slide,offset:y,ptCol:['#FF0',-1]})
		return this.fix.length-1
	}
	addJoint(p,axis=[0,1,0],joint=-1,opt={}){
		if(!(this.joints[joint]||joint<0))return -1
		let y=p,jt=joint,t=0,x=this.joints.length
		while(t<x){
			t++
			y=vadd(y,jt<0?[0,0,0]:vmultf(this.joints[jt].offset,-1))
			if(jt<0)break
			else jt=this.joints[jt].joint
		}
		this.joints.push({t:0,joint:joint,axis:axis,offset:y,friction:opt.friction||10,stiff:opt.stiff||0.7,a:new Anchor(),weight:0,m_center:[0,0,0],chain:[]})
		return this.joints.length-1
	}
	addEdge(a,b,w=1,c='#FF0'){
		this.edges.push({p:[a,b],w:w,c:c})
		if(this.fix[a].ptCol[1]<w)this.fix[a].ptCol=[c,w]
		if(this.fix[b].ptCol[1]<w)this.fix[b].ptCol=[c,w]
		return this.edges.length-1
	}
	addFace(a,b,c,w=1,n=0,s="#BBB"){
		this.faces.push({p:[a,b,c],w:w,n:n,c:s,offset:[0,0,0],norm:[0,0,0],force:0})
		return this.faces.length-1
	}
	setup(){
		this.reactive=new Reactive(this.reactSetup)
		this.reactive.returnCollides=1
		let x=this.edges.length
		for(let i=0;i<x;i++){
			if(this.fix[this.edges[i].p[0]].joint==this.fix[this.edges[i].p[1]].joint){
				if(this.fix[this.edges[i].p[0]].joint<0){
					let a=vmag(vadd(this.fix[this.edges[i].p[0]].offset,vmultf(this.fix[this.edges[i].p[1]].offset,-1)))*this.edges[i].w
					this.weight+=a
					this.m_center=vadd(this.m_center,vmultf(vadd(this.fix[this.edges[i].p[0]].offset,this.fix[this.edges[i].p[1]].offset),a/2))
				}else{
					let a=vmag(vadd(this.fix[this.edges[i].p[0]].offset,vmultf(this.fix[this.edges[i].p[1]].offset,-1)))*this.edges[i].w
					this.joints[this.fix[this.edges[i].p[0]].joint].weight+=a
					this.joints[this.fix[this.edges[i].p[0]].joint].m_center=vadd(this.joints[this.fix[this.edges[i].p[0]].joint].m_center,
						vmultf(vadd(this.fix[this.edges[i].p[0]].offset,this.fix[this.edges[i].p[1]].offset),a/2))
				}
			}else{
				this.complexEdges.push(this.edges[i])
			}
		}
		x=this.faces.length
		for(let i=0;i<x;i++){
			if(this.fix[this.faces[i].p[0]].joint==this.fix[this.faces[i].p[1]].joint&&this.fix[this.faces[i].p[2]].joint==this.fix[this.faces[i].p[1]].joint){
				if(this.fix[this.faces[i].p[0]].joint<0){
					let a=(
						vmag(vadd(this.fix[this.faces[i].p[0]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)))*
						vmag(vadd(this.fix[this.faces[i].p[2]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)))*
						Math.sqrt(1-sqrx(vdot(
							vnorm(vadd(this.fix[this.faces[i].p[0]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1))),
							vnorm(vadd(this.fix[this.faces[i].p[2]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)))
						)))
								)/8
					this.faces[i].force=a*this.faces[i].n
					this.faces[i].norm=vnorm(vcross(vadd(this.fix[this.faces[i].p[0]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)),vadd(this.fix[this.faces[i].p[2]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1))))
					this.faces[i].offset=vmultf(vadd(
						this.fix[this.faces[i].p[0]].offset,vadd(this.fix[this.faces[i].p[1]].offset,this.fix[this.faces[i].p[2]].offset)
					),1/3)
					this.weight+=a
					this.m_center=vadd(this.m_center,vmultf(vadd(
						this.fix[this.faces[i].p[0]].offset,vadd(this.fix[this.faces[i].p[1]].offset,this.fix[this.faces[i].p[2]].offset)
					),a*this.faces[i].w/3))
				}else{
					let a=(
						vmag(vadd(this.fix[this.faces[i].p[0]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)))*
						vmag(vadd(this.fix[this.faces[i].p[2]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)))*
						Math.sqrt(1-sqrx(vdot(
							vnorm(vadd(this.fix[this.faces[i].p[0]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1))),
							vnorm(vadd(this.fix[this.faces[i].p[2]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)))
						)))
								)/8
					this.faces[i].force=a*this.faces[i].n
					this.faces[i].norm=vnorm(vcross(vadd(this.fix[this.faces[i].p[0]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1)),vadd(this.fix[this.faces[i].p[2]].offset,vmultf(this.fix[this.faces[i].p[1]].offset,-1))))
					this.faces[i].offset=vmultf(vadd(
						this.fix[this.faces[i].p[0]].offset,vadd(this.fix[this.faces[i].p[1]].offset,this.fix[this.faces[i].p[2]].offset)
					),1/3)
					this.m_center=vadd(this.m_center,vmultf(vadd(
						this.fix[this.faces[i].p[0]].offset,vadd(this.fix[this.faces[i].p[1]].offset,this.fix[this.faces[i].p[2]].offset)
					),a*this.faces[i].w/3))
					this.joints[this.fix[this.faces[i].p[0]].joint].weight+=a
					this.joints[this.fix[this.faces[i].p[0]].joint].m_center=vadd(this.joints[this.fix[this.faces[i].p[0]].joint].m_center,vmultf(vadd(
						this.fix[this.faces[i].p[0]].offset,vadd(this.fix[this.faces[i].p[1]].offset,this.fix[this.faces[i].p[2]].offset)
					),a/3))
				}
			}else{
				this.complexFaces.push(this.faces[i])
			}
		}
		x=this.joints.length
		for(let i=0;i<x;i++){
			if(this.joints[i].weight)this.joints[i].m_center=vmultf(this.joints[i].m_center,1/this.joints[i].weight)
			let c=0,z=this.joints[i].joint;this.joints[i].chain=[]
			while(z>-1||c>x){
				c++
				this.joints[i].chain.push(z)
				z=this.joints[z].joint
			}
		}
		this.m_center=this.weight?vmultf(this.m_center,1/this.weight):[0,0,0]
		this.weld()
		this.weld()
		this.reactive.p_fix=[]
		x=this.reactive.fix.length
		for(let i=0;i<x;i++){
			this.fc.push(this.fix[i].ptCol[0])
			this.reactive.p_fix.push(this.reactive.fix[i])
		}
	}
	weld(){
		this.reactive.p_fix=[]
		let x=this.reactive.fix.length
		for(let i=0;i<x;i++){
			this.reactive.p_fix.push(this.reactive.fix[i])
		}
		this.reactive.fix=[]
		this.reactive.edges=[...this.edges]
		let jp=[],jr=[],offset=[0,0,0],axes=[[1,0,0],[0,1,0]],c,t
		x=this.joints.length
		for(let i=0;i<x;i++){
			this.joints[i].a.p=[0,0,0]
			this.joints[i].a.v=[0,0,0]
			let z=this.joints[i].joint
			offset=[...this.joints[i].offset]
			axes=this.joints[i].a.a
			c=0
			while(z>-1&&c<x){
				c++
				if(jp[z]){
					offset=vadd(jp[z],vtransform(jr[z],[0,0,0],offset))
					axes=[vnorm(vtransform(jr[z],[0,0,0],axes[0])),vnorm(vtransform(jr[z],[0,0,0],axes[1]))]
					break
				}
				offset=vadd(this.joints[z].offset,this.joints[z].a.gridNormal(offset))
				axes=[this.joints[z].a.gridNormal(axes[0]),this.joints[z].a.gridNormal(axes[1])]
				z=this.joints[z].joint
			}
			jp.push(offset)
			jr.push(axes)
		}
		this.o_jt=[[],[],[...this.p_jt[2]]]
		for(let i=0;i<this.p_jt[0].length;i++){
			this.o_jt[0].push([...this.p_jt[0][i]])
		}
		for(let i=0;i<this.p_jt[1].length;i++){
			this.o_jt[1].push([...this.p_jt[1][i]])
		}
		this.p_jt=[jp,jr]
		x=this.fix.length
		for(let i=0;i<x;i++){
			if(this.fix[i].joint<0){
				this.reactive.fix.push(this.fix[i].offset)
			}else{
				this.reactive.fix.push(vtransform(jr[this.fix[i].joint],jp[this.fix[i].joint],this.fix[i].offset))
			}
		}
		offset=[0,0,0];c=0
		x=this.joints.length
		for(let i=0;i<x;i++){
			c+=this.joints[i].weight
			offset=vadd(offset,vmultf(vadd(jp[i],vtransform(jr[i],[0,0,0],this.joints[i].m_center)),this.joints[i].weight))
		}
		c+=this.weight
		offset=vadd(offset,vmultf(this.m_center,this.weight))
		offset=vmultf(offset,-1/c)
		this.p_jt.push(offset)
		x=this.reactive.fix.length
		for(let i=0;i<x;i++){
			this.reactive.fix[i]=vadd(this.reactive.fix[i],offset)
		}
	}
	center(){
		let offset=[0,0,0],c=0,x=this.joints.length
		for(let i=0;i<x;i++){
			c+=this.joints[i].weight
			offset=vadd(offset,vmultf(vadd(this.p_jt[0][i],vtransform(this.p_jt[1][i],[0,0,0],this.joints[i].m_center)),this.joints[i].weight))
		}
		c+=this.weight
		offset=vadd(offset,vmultf(this.m_center,this.weight))
		offset=vmultf(offset,-1/c)
		this.m_center=vadd(this.m_center,offset)
		x=this.fix.length
		for(let i=0;i<x;i++){
			if(this.fix[i].joint<0)this.fix[i].offset=vadd(this.fix[i].offset,offset)
		}
		x=this.joints.length
		for(let i=0;i<x;i++){
			this.joints[i].offset=vadd(this.joints[i].offset,offset)
		}
	}
	update(dt=1){
		let t_weight=this.weight
		for(let i=0;i<this.joints.length;i++){
			t_weight+=this.joints[i].weight
		}
		for(let i=0;i<this.faces.length;i++){
			if(this.faces[i].force){
				let p=[0,0,0],op=[0,0,0],d=[0,0,0]
				if(this.fix[this.faces[i].p[0]].joint<0){
					p=this.faces[i].offset
					op=this.faces[i].offset
					d=this.faces[i].norm
				}else{
					p=vadd(this.p_jt[0][this.fix[this.faces[i].p[0]].joint],vtransform(this.p_jt[1][this.fix[this.faces[i].p[0]].joint],[0,0,0],this.faces[i].offset))
					op=vadd(this.o_jt[0][this.fix[this.faces[i].p[0]].joint],vtransform(this.o_jt[1][this.fix[this.faces[i].p[0]].joint],[0,0,0],this.faces[i].offset))
					d=vtransform(this.p_jt[1][this.fix[this.faces[i].p[0]].joint],[0,0,0],this.faces[i].norm)
					op=vadd(p,vmultf(vadd(op,vmultf(p,-1)),20))
				}
				this.applyGlobForce(
					this.fix[this.faces[i].p[0]].joint,
					vadd(p,vmultf(this.p_jt[2],1)),
					vmultf(d,vdot(
						vadd(this.reactive.anchor.pr_fromGrid(vadd(op,vmultf(this.p_jt[2],-1))),vmultf(this.reactive.anchor.fromGrid(vadd(p,vmultf(this.p_jt[2],-1))),-1)),
						this.reactive.anchor.gridNormal(d)
					)*this.faces[i].force/t_weight*20)
				)
			}
		}
		this.weld()
		if(this.reactive){
			this.reactive.anchor.update(dt)
			for(let i=0;i<this.joints.length;i++){
				this.joints[i].a.update(dt)
				if(this.joints[i].axis[0]!=0){
					this.joints[i].a.a[0]=this.joints[i].axis
					this.joints[i].a.a[1]=vsnap(this.joints[i].a.a[1],this.joints[i].axis)
				}
				if(this.joints[i].axis[1]!=0){
					this.joints[i].a.a[1]=this.joints[i].axis
					this.joints[i].a.a[0]=vsnap(this.joints[i].a.a[0],this.joints[i].axis)
				}
				if(this.joints[i].axis[2]!=0){
					this.joints[i].a.a[0]=vsnap(this.joints[i].a.a[0],this.joints[i].axis)
					this.joints[i].a.a[1]=vsnap(this.joints[i].a.a[1],this.joints[i].axis)
					if(vmag(vadd(vcross(...this.joints[i].a.a),this.joints[i].axis))<1)this.joints[i].a.a[1]=vmultf(this.joints[i].a.a[1],-1)
				}
			}
		}
	}
	applyJointForce(j,p2,d2){
		let p=[...p2],d=[...d2]
		if(this.joints[j]){
			let axes=this.p_jt[1][j]
			p=vtransform(axes,[0,0,0],p);d=vtransform(axes,[0,0,0],d)
			let weightSum=this.weight,weightJoint=0,x=this.joints.length
			for(let i=0;i<x;i++){
				weightSum+=this.joints[i].weight
				if(i==j||this.joints[i].chain.includes(j))weightJoint+=this.joints[i].weight
			}
			this.joints[j].a.applyForce(p2,vmultf(d2,weightJoint/weightSum/2-1/2))
			this.joints[j].a.applyForce(vmultf(p2,-1),vmultf(d2,1/2-weightJoint/weightSum/2))
			this.reactive.applyForce(p,vmultf(d,weightJoint/weightSum/2))
			this.reactive.applyForce(vmultf(p,-1),vmultf(d,-weightJoint/weightSum/2))
		}
	}
	/*
	applyAbsolJointForce(j,p,d2){
		let d=vsnap(vdetransform(
			this.p_jt[1][j],
			[0,0,0],
			d2
		),this.joints[j].axis)
		this.applyJointForce(j,p,d)
	}
	applyWorldJointForce(j,p,d2){
		let np=vsnap(vdetransform(
			this.p_jt[1][j],
			[0,0,0],
			vadd(p,vadd(vmultf(this.p_jt[0][j],-1),vmultf(this.p_jt[2],-1)))
		),this.joints[j].axis),
		d=vsnap(vdetransform(
			this.p_jt[1][j],
			[0,0,0],
			d2
		),this.joints[j].axis)
		this.applyJointForce(j,np,d)
	}
	*/
	turnJoint(j,target2,reference2,force,damping){
		if(!this.joints[j])return
		if(this.joints[j].t==0){
			let target=vmultf(vnorm(target2),-1),reference=vnorm(reference2)
			this.applyJointForce(j,vsnap(reference,this.joints[j].axis),vmultf(vsnap(this.joints[j].a.absolNormal(target),this.joints[j].axis),force))
			this.applyJointForce(j,this.joints[j].axis[0]?[0,1,0]:[1,0,0],vmultf(this.joints[j].a.r[this.joints[j].axis[0]?1:0],damping))
		}
	}
	applyGlobForce(j,p,d){
		let jt=j,c=0
		while(jt>-1&&c<this.joints.length){
			this.applyJointForce(
				jt,
				vsnap(vdetransform(
					this.p_jt[1][jt],
					[0,0,0],
					vadd(p,vadd(vmultf(this.p_jt[0][jt],-1),vmultf(this.p_jt[2],-1)))
				),this.joints[jt].axis),
				vmultf(
					vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						d
					),this.joints[jt].axis),
					-this.joints[jt].stiff
				)
			)
			jt=this.joints[jt].joint
			c++
		}
		this.reactive.anchor.applyForce(p,d)
	}
	collide(dt,p,d){
		let dt2=1//(1+(dt-1)*3)
		if(this.reactive){
			let collides=this.reactive.collide(p,d)
			if(!collides.length)return
			let z=collides.length,n=[0]
			for(let i=0;i<this.joints.length;i++){
				n.push(0)
			}
			for(let i=0;i<z;i++){
				n[this.fix[collides[i][0][2]].joint+1]++
			}
			for(let i=0;i<z;i++){
				let rebound=this.fix[collides[i][0][2]].rebound,grip=this.fix[collides[i][0][2]].grip/dt,jt=this.fix[collides[i][0][2]].joint,c=0
				while(jt>-1&&c<this.joints.length){
					let np=vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						vadd(collides[i][0][0],vadd(vmultf(this.p_jt[0][jt],-1),vmultf(this.p_jt[2],-1)))
					),this.joints[jt].axis)
					let fc=[
						this.reactive.anchor.absolNormal(vmultf(collides[i][0][3],-collides[i][0][1][1]/z*rebound/cnst.inertia.mov)),
						this.reactive.anchor.absolNormal(vmultf(collides[i][1],1/2/n[this.fix[collides[i][0][2]].joint+1]*grip/cnst.inertia.mov))
					]
					fc[0]=vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						fc[0]
					),this.joints[jt].axis)
					fc[1]=vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						fc[1]
					),this.joints[jt].axis)
					this.applyJointForce(jt,vnorm(np),vmultf(fc[0],-dt2*this.joints[jt].stiff))
					this.applyJointForce(jt,vnorm(np),vmultf(fc[1],-dt2*dt2*this.joints[jt].stiff))
					jt=this.joints[jt].joint
					c++
				}
				this.reactive.anchor.applyForce(vnorm(collides[i][0][0]),this.reactive.anchor.absolNormal(vmultf(collides[i][0][3],-dt2*collides[i][0][1][1]/z*rebound/cnst.inertia.mov)))
				this.reactive.anchor.applyForce(vnorm(collides[i][0][0]),this.reactive.anchor.absolNormal(vmultf(collides[i][1],dt2*dt2/2/n[this.fix[collides[i][0][2]].joint+1]*grip/cnst.inertia.mov)))
			}
		}
	}
	collidef(dt,g){
		let dt2=1//(1+(dt-1)*3)
		if(this.reactive){
			let collides=this.reactive.collidef(g)
			if(!collides.length)return
			let z=collides.length,n=[0]
			for(let i=0;i<this.joints.length;i++){
				n.push(0)
			}
			for(let i=0;i<z;i++){
				n[this.fix[collides[i][0][2]].joint+1]++
			}
			for(let i=0;i<z;i++){
				let rebound=this.fix[collides[i][0][2]].rebound,grip=this.fix[collides[i][0][2]].grip,slide=this.fix[collides[i][0][2]].slide,jt=this.fix[collides[i][0][2]].joint,c=0
				while(jt>-1&&c<this.joints.length){
					let np=vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						vadd(collides[i][0][0],vadd(vmultf(this.p_jt[0][jt],-1),vmultf(this.p_jt[2],-1)))
					),this.joints[jt].axis)
					let fc=[
						this.reactive.anchor.absolNormal(vmultf(collides[i][0][3],-collides[i][0][1][1]/z*rebound/cnst.inertia.mov)),
						this.reactive.anchor.absolNormal(vmultf(collides[i][1],1/2/n[this.fix[collides[i][0][2]].joint+1]*grip/cnst.inertia.mov))
					]
					fc[0]=vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						fc[0]
					),this.joints[jt].axis)
					fc[1]=vsnap(vdetransform(
						this.p_jt[1][jt],
						[0,0,0],
						fc[1]
					),this.joints[jt].axis)
					this.applyJointForce(jt,vnorm(np),vmultf(fc[0],-dt2*this.joints[jt].stiff))
					this.applyJointForce(jt,vnorm(np),vmultf(fc[1],-dt2*dt2*this.joints[jt].stiff))
					jt=this.joints[jt].joint
					c++
				}
				this.reactive.anchor.applyForce(vnorm(collides[i][0][0]),this.reactive.anchor.absolNormal(vmultf(collides[i][0][3],-dt2*collides[i][0][1][1]/z*rebound/cnst.inertia.mov)))
				this.reactive.anchor.applyForce(vnorm(collides[i][0][0]),this.reactive.anchor.absolNormal(vmultf(collides[i][0][3],vdot(collides[i][1],collides[i][0][3])/2/n[this.fix[collides[i][0][2]].joint+1]*grip/cnst.inertia.mov)))
				this.reactive.anchor.applyForce(vnorm(collides[i][0][0]),this.reactive.anchor.absolNormal(vmultf(vsnap(collides[i][1],collides[i][0][3]),slide/2/n[this.fix[collides[i][0][2]].joint+1]*grip/cnst.inertia.mov)))
			}
		}
	}
	applyForce(p,d){
		if(this.reactive)this.reactive.applyForce(p,d)
	}
	toGrid(p){
		if(this.reactive)return this.reactive.toGrid(p)
	}
	fromGrid(p){
		if(this.reactive)return this.reactive.fromGrid(p)
	}
	absolNormal(p){
		if(this.reactive)return this.reactive.absolNormal(p)
	}
	gridNormal(p){
		if(this.reactive)return this.reactive.gridNormal(p)
	}
	pr_toGrid(p){
		if(this.reactive)return this.reactive.pr_toGrid(p)
	}
	pr_fromGrid(p){
		if(this.reactive)return this.reactive.pr_fromGrid(p)
	}
	pr_absolNormal(p){
		if(this.reactive)return this.reactive.pr_absolNormal(p)
	}
	pr_gridNormal(p){
		if(this.reactive)return this.reactive.pr_gridNormal(p)
	}
}
