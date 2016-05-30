

var scene, camera, light1, light2, renderer, loader, dae, base;

if (!Detector.webgl) {
	Detector.addGetWebGLMessage();
}

var fullWidth = window.innerWidth;
var fullHeight = window.innerHeight;
var halfWidth = fullWidth/2;
var halfHeight = fullHeight/2;

$( "#accordion" ).accordion();

$('#base').on('selectmenucreate', function() {
	base = this.value;
	init(base);
	animate();				
	controls();
});

$( "#base" ).selectmenu();

$('#base').on('selectmenuchange', function() {
	scene.remove(dae);
	disposeHierarchy (dae, disposeNode);
	$('#webGL-container').empty();
	base = this.value;
	init(base);
	animate();				
	controls();
});
				
function init(base) {
	scene = new THREE.Scene();
		
	camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 20000);
		camera.position.set(-1,2,5);
		camera.lookAt(scene.position);
	
	light1 = new THREE.PointLight( 0xffffff, 1 );
		light1.position.set(-40,40,40);
		scene.add(light1);
	
	light2 = new THREE.PointLight( 0xffffff, 1 );
		light2.position.set(40,40,40);
		scene.add(light2);
	
	renderer = new THREE.WebGLRenderer({antialias:true});
		renderer.setClearColor(0xffffff);
		renderer.setSize(window.innerWidth,window.innerHeight);

	//var axis = new THREE.AxisHelper(10);
	//	scene.add(axis);
	
	$("#webGL-container").append(renderer.domElement);

	loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
	loader.load( base, function ( collada ) {
		dae = collada.scene;
		dael = collada.library;
		//console.log(dael);
		//var hide_elem = getInst("whhwe",dael);
		//console.log(hide_elem);
		dae.traverse( function ( child0 ) {
			//console.log(child0.name);
			//if ( in_array(child0.name,hide_elem) ) {
			//	child0.visible = false;
			//}
			if ( child0 instanceof THREE.Mesh ) {
				child0.geometry.computeFaceNormals();
				child0.material.shading = THREE.FlatShading;
			}
		} );
		//console.log(dae);
		scene.add(dae);

	});	
	
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene,camera);
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}

function controls () {
    var isDragging = false;
    var previousMousePosition = {
        x: 0,
        y: 0
    };
    $(renderer.domElement).on('mousedown', function(e) {
        isDragging = true;
    })
    .on('mousemove', function(e) {
        //console.log(e);
        var deltaMove = {
            x: e.offsetX-previousMousePosition.x,
            y: e.offsetY-previousMousePosition.y
        };
    
        if(isDragging) {
                
            var deltaRotationQuaternion = new THREE.Quaternion()
                .setFromEuler(new THREE.Euler(
                    toRadians(deltaMove.y * .5),
                    toRadians(deltaMove.x * .5),
                    0,
                    'XYZ'
                ));
            
            dae.quaternion.multiplyQuaternions(deltaRotationQuaternion, dae.quaternion);
        }
        
        previousMousePosition = {
            x: e.offsetX,
            y: e.offsetY
        };
    });
    
    $(document).on('mouseup', function(e) {
        isDragging = false;
    });
}

window.addEventListener('resize', function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
});

function disposeNode (node) {
    if (node instanceof THREE.Mesh)
    {
        if (node.geometry)
        {
            node.geometry.dispose ();
        }

        if (node.material)
        {
            if (node.material instanceof THREE.MeshFaceMaterial)
            {
                $.each (node.material.materials, function (idx, mtrl)
                {
                    if (mtrl.map)           mtrl.map.dispose ();
                    if (mtrl.lightMap)      mtrl.lightMap.dispose ();
                    if (mtrl.bumpMap)       mtrl.bumpMap.dispose ();
                    if (mtrl.normalMap)     mtrl.normalMap.dispose ();
                    if (mtrl.specularMap)   mtrl.specularMap.dispose ();
                    if (mtrl.envMap)        mtrl.envMap.dispose ();

                    mtrl.dispose ();    // disposes any programs associated with the material
                });
            }
            else
            {
                if (node.material.map)          node.material.map.dispose ();
                if (node.material.lightMap)     node.material.lightMap.dispose ();
                if (node.material.bumpMap)      node.material.bumpMap.dispose ();
                if (node.material.normalMap)    node.material.normalMap.dispose ();
                if (node.material.specularMap)  node.material.specularMap.dispose ();
                if (node.material.envMap)       node.material.envMap.dispose ();

                node.material.dispose ();   // disposes any programs associated with the material
            }
        }
    }
}

function disposeHierarchy (node, callback)
{
    for (var i = node.children.length - 1; i >= 0; i--)
    {
        var child = node.children[i];
        disposeHierarchy (child, callback);
        callback (child);
    }
}

function getInst(name, dael) {
	var search_ids = Array();
	for (var id0 in dael.nodes) {
		if (dael.nodes[id0].name == name) {
			search_ids.push(id0);
		}
	}
	//console.log(search_ids);
	var ids_return = [];
	for (var id1 in dael.nodes) {
		if (in_array(dael.nodes[id1].instanceNodes[0],search_ids)) {
			var id_return = id1;
			ids_return.push(dael.nodes[id_return].name); 
		}
	}
	//console.log(ids_return);
	return ids_return;
}

function in_array(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}