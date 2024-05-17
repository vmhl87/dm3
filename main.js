let reacts = [], dt = 1, paused = 1;

function setup(){
	let craftdata = {
		fix: [
			[1, 1, 1],   // 0
			[1, 1, -1],  // 1
			[1, -1, 1],  // 2
			[1, -1, -1], // 3
			[-1, 1, 1],  // 4
			[-1, 1, -1], // 5
			[-1, -1, 1], // 6
			[-1, -1, -1] // 7
		],
		edges: [
			[0, 1],
			[0, 2],
			[0, 4],
			[1, 3],
			[1, 5],
			[2, 3],
			[2, 6],
			[3, 7],
			[4, 5],
			[4, 6],
			[5, 7],
			[6, 7]
		],
		faces: [
			[0, 1, 2],
			[4, 6, 7],
		]
	};

	for(let i=0; i<4; ++i){
		reacts.push(new Craft());
		for(let fix of craftdata.fix) reacts[reacts.length-1].addFixture(fix);
		for(let edge of craftdata.edges) reacts[reacts.length-1].addEdge(...edge);
		for(let face of craftdata.faces) reacts[reacts.length-1].addFace(...face);
		reacts[reacts.length-1].setup();
		reacts[reacts.length-1].reactive.anchor.p[1] = -5
		reacts[reacts.length-1].applyForce([Math.random()*10-5, 0, Math.random()*10-5],
			reacts[reacts.length-1].reactive.absolNormal([0, -Math.random()*10-20, 0]));
	}

	createCanvas(400, 400, WEBGL);

	lt = Date.now();
}

function draw(){
	background(200);
	scale(10);

	for(let i=0; i<10; ++i)
		point(Math.cos(TWO_PI/10*i)*10, 4, Math.sin(TWO_PI/10*i)*10);

	for(let react of reacts){
		if(!paused){
			react.applyForce([0, 0, 0], react.reactive.absolNormal([0, 8, 0]));
			react.collide(1/dt, [0, 4, 0], [[0, 0, 1], [0, 1, 0]]);
			react.update(1/dt);
		}

		push();
		applyMatrix(mlookAt(react.reactive.anchor.p,react.reactive.anchor.a));
		if(!react.models||!react.models.length)
			react.models=genCraftModels(react)
		strokeWeight(5);
		push();
		translate(...react.p_jt[2]);
		fill(100, 100, 100); noStroke();
		model(react.models[0][0]);
		noFill(); stroke(255, 255, 0); strokeWeight(1);
		model(react.models[0][1]);
		pop();
		for(let f=0; f<react.joints.length; ++f){
			push();
			applyMatrix(mlookAt(vadd(react.p_jt[0][f],react.p_jt[2]),react.p_jt[1][f]))
			fill(100); noStroke();
			model(react.models[f+1][0]);
			noFill(); stroke(255, 255, 0); strokeWeight(1);
			model(react.models[f+1][1]);
			pop();
			strokeWeight(1.5);
			stroke(255, 0, 0);
			point(...vadd(react.p_jt[0][f], react.p_jt[2]));
		}
		pop();
		push();
		push();
		applyMatrix(mlookAt(react.reactive.anchor.p,react.reactive.anchor.a));
		translate(react.p_jt[2][0], 4, react.p_jt[2][2]);
		pop();
		translate(-4.1*.3, 4.1, -4.1*.3);
		applyMatrix([
			1, 0, 0, 0,
			.3, 0, .3, 0,
			0, 0, 1, 0,
			0, 0, 0, 1
		]);
		applyMatrix(mlookAt(react.reactive.anchor.p,react.reactive.anchor.a));
		fill(150, 150, 150); noStroke();
		model(react.models[0][0]);
		noFill(); stroke(150, 150, 150); strokeWeight(1);
		model(react.models[0][1]);
		pop();
	}

	orbitControl();
}

function keyReleased(){
	if(key == 'a') paused = !paused;
	if(key == 's'){
		paused = false; dt = 6 - dt;
	}
}
