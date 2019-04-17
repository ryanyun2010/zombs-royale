/*
    TODOS:
    DONE 1. Create our character as a simple circle
    2. Make a start button
    3. Make a line for a stick gun
    4. Make a leader board
    WORKING 5. Control characters with arrow and WASD keys
    DONE 6. Need to make a gameboard way bigger than the screen
    7. Kill everyone by shooting them to win
    DONE 8. Aim with the mouse
    9. Have chests that contain weapons
    10. When you get hit your health degrades
    11. We need buildings which contains chests and windows
    12. Make it mutliplayer
    13. The world shrinks into smaller zones based on a time variable
    14. Create a inset map (press M)
    15. Create air drops which contain cool stuff
    16. Have zombie characters that chase you

    MAKE GAME WITH BORDERS
    MAKE A DEADLY WEAPON
    MAKE CHESTS
    MAKE BUILDINGS/HOUSES
    MAKE MANY BUSHES
    MAKE A WEAPON THAT AIMS

*/

/* ADD VARIABLES HERE */
var canvas = document.querySelector('canvas');
var tools = canvas.getContext('2d');
var images = {
	tile: { url: '//mrlera.wisen.space/capture/load/6DiIVWK1O4tUbo6TTYgAvFFI.png', image: new Image() },
	lollipop: { url: '//mrlera.wisen.space/capture/load/xt_ht-rheityyypr-257rhoz.png', image: new Image() },
	bush: { url: '//mrlera.wisen.space/capture/load/kjFJM9XwclT7aYeLa_ka2p8R.png', image: new Image() },
	crate: { url: '//mrlera.wisen.space/capture/load/o8uns8p8uet7wxb8nqiuynvt.png', image: new Image() }
}

var isLeader = false;
var socket;

var gameWorld, me, bushes, crates, resources;
var characterName = prompt("WHAT's YOUR NAME?");
if(characterName.length > 10) location.href = 'https://www.wisen.space'

/* ADD FUNCTIONS HERE */
function World() {

    this.width = 3;
    this.height = 3;

    this.x = Math.random()*(this.width-0.5) + 0.25;
    this.y = Math.random()*(this.height-0.5) + 0.25;

    this.image = images.tile.image;

    var tileWidth = 0.05;
    var tileHeight = 0.05;

    this.calculateScreenCoordinates = function(obj) {
    	return {
    		x: (obj.x + 0.5 - this.x)*canvas.width
    		, y: (obj.y + 0.5 - this.y)*canvas.height
    		, w: obj.width*canvas.width
    		, h: obj.height*canvas.width
    	}
    }

    // MOVING THE SCREEN WITH ME
    this.move = function() {
		this.x += me.velocity.x;
        this.y += me.velocity.y;

		if(this.x < me.width || this.x > gameWorld.width - me.width){
			this.x -= me.velocity.x;
		}

		if(this.y < me.height || this.y > gameWorld.height - me.height){
			this.y -= me.velocity.y;
		}
    }

    this.draw = function() {
    	// WORLD MUST ALWAYS BE DRAWN IN A WAY THAT THE MAIN CHARACTER IS IN THE MIDDLE OF THE SCREEN
        // DRAWING SCREEN
    	tileHeight = tileWidth*canvas.width/canvas.height;
    	var tileCountX = 1/tileWidth + 2;
    	var tileCountY = 1/tileHeight + 2;
    	var tw = tileWidth*canvas.width;
    	var th = tileHeight*canvas.height;
    	var offx = this.x*canvas.width % tw;
    	var offy = this.y*canvas.height % th;

        for(var ny = -1; ny < tileCountY; ny++) {
        	for(var nx = -1; nx < tileCountX; nx++) {
        		tools.drawImage(this.image, nx*tw-offx ,ny*th-offy, tw, th);
        	}
        }

		var wallLeft = Math.min(1, 0.5 - this.x)*canvas.width;
		var wallTop = Math.min(1, 0.5 - this.y)*canvas.height;
		var wallRight =  Math.min(1, this.width - this.x + 0.5)*canvas.width;
		var wallBottom = Math.min(1, this.height - this.y + 0.5)*canvas.height;

		if(wallLeft > 0) {
	        tools.beginPath();
	        tools.fillStyle = '#AFDA55';
	        tools.fillRect(0, 0, wallLeft, canvas.height);
	        tools.closePath();
		}

		if(wallTop > 0) {
	        tools.beginPath();
	        tools.fillStyle = '#AFDA55';
	        tools.fillRect(0, 0, canvas.width, wallTop);
	        tools.closePath();
		}

		if(wallRight > 0) {
	        tools.beginPath();
	        tools.fillStyle = '#AFDA55';
	        tools.fillRect(wallRight, 0, Math.ceil(canvas.width-wallRight), canvas.height);
	        tools.closePath();
		}

		if(wallBottom > 0) {
	        tools.beginPath();
	        tools.fillStyle = '#AFDA55';
	        tools.fillRect(0, wallBottom,  canvas.width, Math.ceil(canvas.height- wallBottom));
	        tools.closePath();
		}

    }

}

function Bush(options) {

	this.bodyRadius = 0.1;
	this.width = this.bodyRadius*2;
	this.height = this.bodyRadius*2;
	this.x = options ? options.x : Math.random()*(gameWorld.width - this.width);
	this.y = options ? options.y : Math.random()*(gameWorld.height - this.height);
	this.image = images.bush.image;
	this.trans = 0.8;

	this.move = function () {
	}

	this.draw = function() {
    	var s  = gameWorld.calculateScreenCoordinates(this);
    	tools.globalAlpha = this.trans;
        tools.drawImage(this.image, s.x, s.y, s.w, s.h);
        tools.globalAlpha = 1;
	}

}

function Crate(options) {

	this.width = 0.05;
	this.height = 0.05;
	this.x = options ? options.x : Math.random()*(gameWorld.width - this.width);
	this.y = options ? options.y : Math.random()*(gameWorld.height - this.height);
	this.image = images.crate.image;

	this.move = function () {
	}

	this.draw = function() {
    	var s  = gameWorld.calculateScreenCoordinates(this);
        tools.drawImage(this.image, s.x, s.y, s.w, s.h);
	}

}

function Projectile() {
	this.radius = 5;
	this.color = 'orange';

	this.move = function() {
		if(!this.hasFired) return;
		this.x += 1;
	}

	this.draw = function(x,y) {
		tools.beginPath();
		tools.fillStyle = this.color;
		tools.arc(x, y, this.radius, 0, Math.PI*2);
		tools.fill();
		tools.closePath();

	}
}

function Weapon(options) {
	this.width = options.width;
	this.height = options.height;
	this.color = options.color;
	this.image = images[options.image] ? images[options.image].image : undefined;
	this.x = 0;
	this.y = 0;
	this.r = 0;
	this.angle = 0;
	this.velocity = {
		x: 0, y: 0
	}

	this.projectile = null;

	this.load = function() {
		if(this.projectile) return;

		this.projectile = new Projectile();
	}

	this.fire = function() {
		if(!this.projectile) return;
		this.projectile = null;
	}

	this.throw = function() {
		this.velocity.x = 1;
	}

	this.draw = function(cx, cy, cr, angle) {
		if(this.velocity.x) {
			this.velocity.x += 10;
		};
		tools.save();
		this.x = cx + this.velocity.x;
		this.y = cy;
		this.r = cr;
		this.angle = angle;
		tools.translate(this.x, this.y);
		tools.rotate(this.angle - Math.PI);
		if(this.image) {
			tools.drawImage(this.image,
				this.image.width*.1, this.image.height*.05, this.image.width*.8, this.image.height*.9,
				0.5*this.width, this.r-this.height, this.width, this.height);
		} else if(this.color) {
			tools.fillStyle = this.color;
			tools.fillRect(0, this.r, this.width, this.height);
		}
		if(this.projectile) this.projectile.draw(0, -0.8*this.height);
		tools.restore();
	}
}

function Character(player, socket) {

	player = player || {};
	var wand = new Weapon({width: 1, height:100, color: 'cyan'});
	var lollipop = new Weapon({width:50, height:100, image: 'lollipop'});

	this.speed = 0.01;
	this.bodyRadius = 0.03;
	this.handRadius = 0.013;
	this.width = (this.bodyRadius + this.handRadius)*1.75;
	this.height = (this.bodyRadius + this.handRadius)*1.75;
	this.color = '#f7bd69';
	this.outlineColor = 'black';
	this.angle = Math.PI / 5;
	this.direction = { x: 0, y: 0, theta: 0 }
	this.weapon = lollipop // wand;
	this.id = player.id || (performance.now() + (Math.random()+'').split('.')[1]).replace(/\./g, '');
	this.x = player.x;
	this.y = player.y;
	this.velocity = {
		x:0, y: 0
	}
	this.socket = socket;
	this.name = player.name;

	this.move = function () {
		this.x += this.velocity.x;
		this.y += this.velocity.y;

		if(this.x < this.width || this.x > gameWorld.width - this.width){
			this.x -= this.velocity.x;
		}

		if(this.y < this.height || this.y > gameWorld.height - this.height){
			this.y -= this.velocity.y;
		}

		var c = this;
		crates.forEach(function(crate) {
			collides(c, crate);
		})

	}

	this.rotate = function(mouseX,mouseY) {

		this.direction.x =  mouseX - canvas.width/2;
		this.direction.y = mouseY - canvas.height/2;

		var atan = Math.atan(this.direction.y/this.direction.x);
		atan += this.direction.x >= 0 ? Math.PI/2 : 3*Math.PI/2;
		this.direction.theta = atan;

	}

	this.draw = function() {
		var r = this.bodyRadius*canvas.width;
		var s = gameWorld.calculateScreenCoordinates(this);
		var b = r*Math.cos(this.angle);
		var d = r*Math.sin(this.angle);
		var ct = Math.cos(this.direction.theta);
		var st = Math.sin(this.direction.theta);

		function rotateCircle(px, py, radius) {
			var rx = px*ct - py*st;
			var ry = px*st + py*ct;
			var handX = s.x + rx;
			var handY = s.y + ry;
			tools.arc(handX, handY, radius*canvas.width, 0,Math.PI*2);
			return {x: handX, y: handY, r: radius*canvas.width};
		}

		/* LEFT HAND */
		tools.beginPath();
		tools.lineWidth=2;
		tools.strokeStyle = this.outlineColor;
		tools.fillStyle = this.color;
		var leftHand = rotateCircle(-d, -b, this.handRadius);
		tools.fill();
		tools.stroke();
		tools.closePath();

		/* RIGHT HAND */
		tools.beginPath();
		var rightHand = rotateCircle(d, -b, this.handRadius);
		tools.fill();
		tools.stroke();
		tools.closePath();

		/* BODY */
		tools.beginPath();
		tools.lineWidth=2;
		tools.strokeStyle = this.outlineColor;
		tools.fillStyle = this.color;
		tools.arc(s.x,s.y, r, 0,Math.PI*2);
		tools.fill();
		tools.stroke();
		tools.closePath();

		/* NAME TAG */
		tools.fillStyle = 'blue';
		tools.fillText(this.name, s.x-r/2, s.y);

		// if(this.weapon) {
		// 	this.weapon.draw(leftHand.x, leftHand.y, leftHand.r, Math.PI + this.direction.theta);
		// }
	}

	this.update = function(player) {
		Object.assign(this, player);
	}

}

function getGameState() {
	return {
		id: me.id
		, timestamp: new Date()
		, x: gameWorld.width - gameWorld.x
		, y: gameWorld.height - gameWorld.y
	}
}

function animate() {
    tools.clearRect(0,0,canvas.width, canvas.height);

    resources.forEach(function(resource) {
    	if(resource instanceof Weapon) return;
        resource.move();
        resource.draw();
    });

    window.requestAnimationFrame(animate);
}

function resizeCanvas() {

    var bodySize = document.body.getBoundingClientRect();
    canvas.width = bodySize.width;
    canvas.height = bodySize.height;

}

function addSocketEvents() {

	socket = io('/tunnel');
	//generateWorld();
	socket.on('newleader', () => {
		console.log('newleader');
		isLeader = true;
		if(!resources) {
			generateWorld();
		}

	})

	socket.on('userconnected', (socketId) => {
		console.log('userconnected', socketId);
		if(isLeader) {
			socket.emit('updateworld', getWorldState());
		}
	});

	socket.on('updateworldresponse', (data) => {
		console.log('updateworldresponse', data);
		if(!resources) {
			console.log('generating world')
			generateWorld(data.data);
		}
	})

	socket.on('userdisconnected', (socketId) => {
		console.log('userdisconnected', socketId);
		resources = (resources || []).filter(resource => resource.socket !== socketId);
	});

	socket.on('updatestateresponse', (data) => {
		console.log('updatestateresponse', data);
		var player = data.data;
		var socketId = data.socket;
		var character = (resources || []).find(resource => resource.id === player.id);
		if(character) {
			character.update(player);
		} else {
			var character = new Character(player, socketId);
			(resources || []).splice(1, 0, character);
			(resources || []).splice(2, 0, character.weapon);
		}
	});

}

function initializeSockets() {

	restfull.post({
		path: '/tunnel/register'
		,data : {
			events: ['updatestate', 'updateworld']
		}
	}, (err, resp) => {
		if(err || resp.error) {
			return console.log(err || resp.error)
		}
		addSocketEvents();
	});

}

function loadResources() {

    var loadedResourceCount = 0;
    var resources = Object.keys(images);
    resources.forEach(function(resource) {
        images[resource].image.onload = function() {
            loadedResourceCount++;
            if(loadedResourceCount === resources.length) {
                initializeSockets();
            }
        }
        images[resource].image.src = images[resource].url;
    })

}

function changeDirection(key) {

    // CHALLENGE: WHAT DO WE MODIFY HERE TO MOVE THE WORLD?
    if(key.keyCode === 37 || key.key === 'a') {
        // LEFT
        me.velocity.x = -me.speed;
        socket.emit('updatestate', getState());
    }
    else if(key.keyCode === 38 || key.key === 'w') {
        // UP
        me.velocity.y = -me.speed;
        socket.emit('updatestate', getState());
    }
    else if(key.keyCode === 39 || key.key === 'd') {
        // RIGHT
        me.velocity.x = me.speed;
        socket.emit('updatestate', getState());
    }
    else if(key.keyCode === 40  || key.key === 's')   {
        // DOWN
        me.velocity.y = me.speed;
        socket.emit('updatestate', getState());
    }

}

function stopCharacter(e) {

    if(e.keyCode === 38 || e.key === 'w' || e.direction === 8) {
        me.velocity.x = 0;
        me.velocity.y = 0;
        socket.emit('updatestate', getState());
    }
    if(e.keyCode === 37 || e.key === 'a' || e.direction === 2) {
        me.velocity.x = 0;
        me.velocity.y = 0;
        socket.emit('updatestate', getState());

    }
    if(e.keyCode === 40 || e.key === 's' || e.direction === 16) {
        me.velocity.x = 0;
        me.velocity.y = 0;
        socket.emit('updatestate', getState());
    }
    if(e.keyCode === 39 || e.key === 'd' || e.direction === 4) {
        me.velocity.x = 0;
        me.velocity.y = 0;
        socket.emit('updatestate', getState());
    }

}

function rotate(e) {
    me.rotate(e.clientX, e.clientY);
    socket.emit('updatestate', getState());
}

function moveCharacter(e) {

    gameWorld.velocity.x = -gameWorld.speed*Math.sin(me.direction.theta);
    gameWorld.velocity.y = gameWorld.speed*Math.cos(me.direction.theta);

}

function throwWeapon() {
	// if(!me.weapon) return;
	// me.weapon.throw();
	// socket.emit('updatestate', getState());
}

function getState() {
	return me;
}

function getWorldState() {
	var players = resources.filter(resource => resource instanceof Character);
	return {
		bushes: bushes,
		players: players,
		crates: crates
	}
}

function generateWorld(data) {
	gameWorld = new World();
	me = new Character({x: gameWorld.x, y: gameWorld.y });
	me.name = characterName;

	resources = [gameWorld, me, me.weapon]
	// NEXT ADD OTHER PLAYERS
	if(data) {
		data.players.forEach((player) => {
			var character = new Character(player);
			resources.push(character);
			resources.push(character.weapon);
		})
	}

	bushes = [];
	while(bushes.length < 100) {
		var bushData = data ? data.bushes[bushes.length] : undefined;
	    bushes.push(new Bush(bushData));
	}


	crates = [];
	while(crates.length < 100) {
		var crateData = data ? data.crates[crates.length] : undefined;
	    crates.push(new Crate(crateData));
	}
	resources = resources.concat(crates);
	resources = resources.concat(bushes);

	addEventListeners();
	animate();
	socket.emit('updatestate', getState());
}

function collides(thing1, thing2) {
	if((thing1.y + thing1.height) < thing2.y) {
		return false;
	}
	if((thing2.y + thing2.height) < thing1.y) {
		return false;
	}

	if((thing1.x + thing1.width) < thing2.x) {
		return false;
	}
	if((thing2.x + thing2.width) < thing1.x) {
		return false;
	}

	console.log('COLLIDES');
	return true;
}

/* ADD EVENT LISTENERS HERE */
function addEventListeners() {
	window.addEventListener('resize', resizeCanvas);
	window.addEventListener('keydown', changeDirection);
	window.addEventListener('keyup', stopCharacter);
	window.addEventListener('mousemove', rotate);
	window.addEventListener('click', throwWeapon);
}

/* CODE TO RUN WHEN PAGE LOADS */

resizeCanvas();
loadResources();

