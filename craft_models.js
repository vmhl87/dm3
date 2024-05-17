let sqr3 = Math.sqrt(3)

genCraftModels=craft=>{
	let uid=newUID(),models=[[]]
	models[0].push(new p5.Geometry(
		1,1,
		function createGeometry(){
			for(let x=0;x<craft.faces.length;x++){
				if(craft.fix[craft.faces[x].p[0]].joint==-1){
					this.vertices.push(new p5.Vector(...craft.fix[craft.faces[x].p[0]].offset))
					this.vertices.push(new p5.Vector(...craft.fix[craft.faces[x].p[1]].offset))
					this.vertices.push(new p5.Vector(...craft.fix[craft.faces[x].p[2]].offset))
					this.uvs.push([0,0])
					this.uvs.push([1,0])
					this.uvs.push([1/2,1/2*sqr3])
					this.faces.push([this.vertices.length-1,this.vertices.length-2,this.vertices.length-3])
				}
			}
			this.computeNormals()
			this.gid='craft-geometry-faces-'+uid
		}
	))
	models[0].push(new p5.Geometry(
		1,1,
		function createGeometry(){
			for(let x=0;x<craft.edges.length;x++){
				if(craft.fix[craft.edges[x].p[0]].joint==-1){
					this.vertices.push(new p5.Vector(...craft.fix[craft.edges[x].p[0]].offset))
					this.vertices.push(new p5.Vector(...craft.fix[craft.edges[x].p[1]].offset))
					this.vertices.push(new p5.Vector(...craft.fix[craft.edges[x].p[1]].offset))
					this.faces.push([this.vertices.length-1,this.vertices.length-2,this.vertices.length-3])
				}
			}
			this.gid='craft-geometry-edges-'+uid
		}
	))
	for(let i=0;i<craft.joints.length;i++){
		models.push([])
		models[i+1].push(new p5.Geometry(
			1,1,
			function createGeometry(){
				for(let x=0;x<craft.faces.length;x++){
					if(craft.fix[craft.faces[x].p[0]].joint==i){
						this.vertices.push(new p5.Vector(...craft.fix[craft.faces[x].p[0]].offset))
						this.vertices.push(new p5.Vector(...craft.fix[craft.faces[x].p[1]].offset))
						this.vertices.push(new p5.Vector(...craft.fix[craft.faces[x].p[2]].offset))
						this.uvs.push([0,0])
						this.uvs.push([1,0])
						this.uvs.push([1/2,1/2*sqr3])
						this.faces.push([this.vertices.length-1,this.vertices.length-2,this.vertices.length-3])
					}
				}
				this.computeNormals()
				this.gid='craft-geometry-joint-faces-'+i.toString()+uid
			}
		))
		models[i+1].push(new p5.Geometry(
			1,1,
			function createGeometry(){
				for(let x=0;x<craft.edges.length;x++){
					if(craft.fix[craft.edges[x].p[0]].joint==i){
						this.vertices.push(new p5.Vector(...craft.fix[craft.edges[x].p[0]].offset))
						this.vertices.push(new p5.Vector(...craft.fix[craft.edges[x].p[1]].offset))
						this.vertices.push(new p5.Vector(...craft.fix[craft.edges[x].p[1]].offset))
						this.faces.push([this.vertices.length-1,this.vertices.length-2,this.vertices.length-3])
					}
				}
				this.gid='craft-geometry-joint-edges-'+i.toString()+uid
			}
		))
	}
	return models
}
