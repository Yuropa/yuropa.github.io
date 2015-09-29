var canvas;
var engine;
var scene;
var currentTime;
var ground;
var UICanvas;
var TextCanvas;
var mask, happyMask, temple, grassTexture;

function startGame() {
    document.getElementById('splashScreen').style.display = "none";
    document.getElementById('renderCanvas').style.display = "initial";
    document.getElementById('UICanvas').style.display = "initial";
    document.getElementById('TextCanvas').style.display = "initial";
    
    engine.resize();
};

BABYLON.VertexData.CreateGroundFromHeightArray = function (width, height, subdivisions, minHeight, maxHeight, buffer, bufferWidth, bufferHeight) {
    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    // Vertices
    for (row = 0; row <= subdivisions; row++) {
        for (col = 0; col <= subdivisions; col++) {
            var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));
            // Compute height
            var heightMapX = (((position.x + width / 2) / width) * (bufferWidth - 1)) | 0;
            var heightMapY = ((1.0 - (position.z + height / 2) / height) * (bufferHeight - 1)) | 0;
            var pos = (heightMapX + heightMapY * bufferWidth);
            var gradient = buffer[pos] / 255.0;
            position.y = minHeight + (maxHeight - minHeight) * gradient;
            // Add  vertex
            positions.push(position.x, position.y, position.z);
            normals.push(0, 0, 0);
            uvs.push(col / subdivisions, 1.0 - row / subdivisions);
        }
    }
    // Indices
    for (row = 0; row < subdivisions; row++) {
        for (col = 0; col < subdivisions; col++) {
            indices.push(col + 1 + (row + 1) * (subdivisions + 1));
            indices.push(col + 1 + row * (subdivisions + 1));
            indices.push(col + row * (subdivisions + 1));
            indices.push(col + (row + 1) * (subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (subdivisions + 1));
            indices.push(col + row * (subdivisions + 1));
        }
    }
    // Normals
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    // Result
    var vertexData = new BABYLON.VertexData();
    vertexData.indices = indices;
    vertexData.positions = positions;
    vertexData.normals = normals;
    vertexData.uvs = uvs;
    return vertexData;
};

var heightMapSize = 1024;
var heightMap;
var heightLevels = 32;
var noiseSize = 8;

var orbsLoaded = false;
var showingText = false;

function generateHeightMap() {
    var i, j;
    heightMap = new Uint8Array(heightMapSize * heightMapSize);

    var noiseArray = new Array();
    for (i = 0; i <= noiseSize; i++) {
        noiseArray[i] = new Array();
        for (j = 0; j <= noiseSize; j++) {
            var height = Math.random();
            if (i == 0 || i == noiseSize || j == 0 || j == noiseSize) {
                height = 1;
            }

            noiseArray[i][j] = height;
        }
    }

    var x = 0,
        y = 0;
    var divisor = Math.floor(heightMapSize / noiseSize);

    for (i = 0; i < heightMapSize; i++) {
        if (i != 0 && i % divisor == 0) {
            x++;
        }

        for (j = 0; j < heightMapSize; j++) {
            if (j != 0 && j % divisor == 0) {
                y++;
            }

            var mu_x = (i % divisor) / divisor;
            var mu_2 = (1 - Math.cos(mu_x * Math.PI)) / 2;

            var int_x1 = noiseArray[x][y] * (1 - mu_2) + noiseArray[x + 1][y] * mu_2;
            var int_x2 = noiseArray[x][y + 1] * (1 - mu_2) + noiseArray[x + 1][y + 1] * mu_2;

            var mu_y = (j % divisor) / divisor;
            var mu_2 = (1 - Math.cos(mu_y * Math.PI)) / 2;
            var int_y = int_x1 * (1 - mu_2) + int_x2 * mu_2;

            // Bin the values
            var bin = (1.0 - Math.round(int_y * heightLevels + 0.5) / heightLevels) * 255;
            if (i == 0 || j == 0) {
                bin = 0;
            }

            heightMap[i * heightMapSize + j] = bin;
        }
        y = 0;
    }
}

function loadScene(loader) {
    generateHeightMap();
    
    scene.ambientColor = new BABYLON.Color3(1, 1, 1);
    
    var camera;
    if (Modernizr.touchevents) {
        camera = new BABYLON.TouchCamera("Camera", new BABYLON.Vector3(0, 0, 380), scene);
    } else {
        camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, 380), scene);
    }
    camera.attachControl(canvas);
    camera.keysLeft  = [37, 65];
    camera.keysRight = [39, 68];
    camera.keysUp    = [38, 87];
    camera.keysDown  = [40, 83];

    var beforeRenderFunction = function () {
        var cameraOffset = 20.0;

        var position = camera.position;

        // Clamp the position
        var boundingBox = ground.getBoundingInfo().boundingBox;
        var groundSize = boundingBox.maximumWorld.x - boundingBox.minimumWorld.x;
        position = BABYLON.Vector3.Clamp(position, boundingBox.minimumWorld, boundingBox.maximumWorld);

        // Bound position, so we aren't in water
        var x = ((position.x + groundSize / 2.0) / groundSize) * (heightMapSize - 1);
        var z = (1.0 - (position.z + groundSize / 2.0) / groundSize) * (heightMapSize - 1);

        /*
        var roundZ = Math.round(z);
        var roundX = Math.round(x);
        var underwaterHeight = 256.0 / 10.0;
        
        if (heightMap[roundZ * heightMapSize + roundX] < underwaterHeight) {
            // We are in water, move ourselves out of the water
            for (var distance = 0; distance < heightMapSize; distance++) {
                // Should really only take an interation or two
                var foundNonWater = false;
                var nonWaterX = 0;
                var nonWaterZ = 0;
                var nonWaterDistance = Infinity;

                function searchPixel(z, x) {
                    var height = heightMap[z * heightMapSize + x];
                    var distance = x*x + z*z;
                    if (height > underwaterHeight && distance < nonWaterDistance) {
                        foundNonWater = true;
                        nonWaterX = x;
                        nonWaterZ = z;
                        nonWaterDistance = distance;
                    }
                }
                
                for (var i = roundZ - distance; i <= roundZ + distance; i++) {
                    if (i == roundZ - distance || i == roundZ + distance) {
                        // We are on an edge, so search along the edge
                        for (var j = roundX - distance; j <= roundX + distance; j++) {
                            // Search
                            searchPixel(i, j);
                        }
                    } else {
                        var j1 = roundX - distance;
                        var j2 = roundX + distance;
                        // Search
                        searchPixel(i, j1);
                        searchPixel(i, j2);
                    }
                }
                
                if (foundNonWater) {
                    x = nonWaterX;
                    z = nonWaterZ;
                    break;
                }
            }
        }
        */

        var ceilX = Math.ceil(x);
        var ceilZ = Math.ceil(z);
        var floorX = Math.floor(x);
        var floorZ = Math.floor(z);
        var remanX = x - floorX;
        var remanZ = z - floorZ;

        var h1 = heightMap[floorZ * heightMapSize + floorX] * (1 - remanX) * (1 - remanZ);
        var h2 = heightMap[floorZ * heightMapSize + ceilX] * remanX * (1 - remanZ);
        var h3 = heightMap[ceilZ * heightMapSize + floorX] * (1 - remanX) * remanZ;
        var h4 = heightMap[ceilZ * heightMapSize + ceilX] * remanX * remanZ;

        var heightValue = h1 + h2 + h3 + h4;
        position.y = cameraOffset + heightValue / 255.0 * 20.0 - 2.0;
        camera.position = position;

        // Camera
        if (camera.beta < 0.1)
            camera.beta = 0.1;
        else if (camera.beta > (Math.PI / 2) * 0.9)
            camera.beta = (Math.PI / 2) * 0.9;

        if (camera.radius > 50)
            camera.radius = 50;

        if (camera.radius < 5)
            camera.radius = 5;

        var maskDir = camera.position.clone();
        maskDir.y = 0.0;
        maskDir.normalize();
        var dot = BABYLON.Vector3.Dot(maskDir, new BABYLON.Vector3(1, 0, 0));

        mask.rotation.y = (maskDir.z > 0 ? -1.0 : 1.0) * Math.acos(dot);
        happyMask.rotation.y = mask.rotation.y;
    };

    scene.registerBeforeRender(beforeRenderFunction);

    var sun = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(60, 100, 10), scene);

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 3000.0, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("resources/sky/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    var extraGround = BABYLON.Mesh.CreateGround("extraGround", 3000, 3000, 1, scene, false);
    var extraGroundMaterial = new BABYLON.StandardMaterial("extraGround", scene);

    extraGround.position.y = -2.0;
    extraGround.material = extraGroundMaterial;

    ground = new BABYLON.Mesh("groud", scene);
    var vertexData = BABYLON.VertexData.CreateGroundFromHeightArray(1536, 1536, 256, 0, 20, heightMap, heightMapSize, heightMapSize);
    vertexData.applyToMesh(ground, false);

    var groundMaterial = new BABYLON.StandardMaterial("rock", scene);

    var rockTask = loader.addTextureTask("rock", "resources/rock.jpg");
    rockTask.onSuccess = function (t) {
        groundMaterial.diffuseTexture = t.texture;
        groundMaterial.diffuseTexture.uScale = 6;
        groundMaterial.diffuseTexture.vScale = 6;

        extraGroundMaterial.diffuseTexture = t.texture;
        extraGroundMaterial.diffuseTexture.uScale = 60;
        extraGroundMaterial.diffuseTexture.vScale = 60;
    }

    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

    var rockBumpTask = loader.addTextureTask("rockBump", "resources/rockBump.png");
    rockBumpTask.onSuccess = function (t) {
        groundMaterial.bumpTexture = t.texture;
        groundMaterial.bumpTexture.uScale = 6;
        groundMaterial.bumpTexture.vScale = 6;
    }


    ground.position.y = -2.0;
    ground.material = groundMaterial;

    BABYLON.Engine.ShadersRepository = "shaders/";
    var water = BABYLON.Mesh.CreateGround("water", 3000, 3000, 1, scene, false);
    var waterMaterial = new WaterMaterial("water", scene, sun);
    waterMaterial.refractionTexture.renderList.push(extraGround);
    waterMaterial.refractionTexture.renderList.push(ground);

    waterMaterial.reflectionTexture.renderList.push(ground);
    waterMaterial.reflectionTexture.renderList.push(skybox);

    water.material = waterMaterial;

    var grassTask = loader.addTextureTask("grass", "resources/grass.jpg");
    grassTask.onSuccess = function (t) {
        grassTexture = t.texture;
    };

    var maskTask = loader.addMeshTask("mask", "", "resources/", "mask.obj");
    maskTask.onSuccess = function (t) {
        mask = t.loadedMeshes[0];
        mask.position.y = heightMap[heightMapSize / 2.0 * heightMapSize + heightMapSize / 2.0] / 255.0 * 20.0 - 2.0 + 20.0;
        mask.scaling = new BABYLON.Vector3(3.0, 3.0, 3.0);

        var maskMat = new BABYLON.StandardMaterial("mask-material", scene);
        maskMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        maskMat.specularColor = maskMat.emissiveColor;
        maskMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        maskMat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        mask.material = maskMat;
    };
    var happyTask = loader.addMeshTask("happyMask", "", "resources/", "happyMask.obj");
    happyTask.onSuccess = function (t) {
        happyMask = t.loadedMeshes[0];
        happyMask.setEnabled(false);

        happyMask.position.y = heightMap[heightMapSize / 2.0 * heightMapSize + heightMapSize / 2.0] / 255.0 * 20.0 - 2.0 + 20.0;
        happyMask.scaling = new BABYLON.Vector3(3.0, 3.0, 3.0);

        var maskMat = new BABYLON.StandardMaterial("mask-material", scene);
        maskMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3);
        maskMat.specularColor = maskMat.emissiveColor;
        maskMat.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        maskMat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        happyMask.material = maskMat;
    }
    var templateTask = loader.addMeshTask("temple", "", "resources/", "temple.obj");
    templateTask.onSuccess = function (t) {
        temple = t.loadedMeshes[0];
        temple.setEnabled(false);
        temple.position.y = heightMap[heightMapSize / 2.0 * heightMapSize + heightMapSize / 2.0] / 255.0 * 20.0 - 2.0;
        temple.scaling = new BABYLON.Vector3(10.0, 10.0, 10.0);

        var maskMat = new BABYLON.StandardMaterial("mask-material", scene);
        maskMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        maskMat.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        temple.material = maskMat;

        BABYLON.SceneOptimizer.OptimizeAsync(scene);
    }

    window.addEventListener("click", function () {
        if (showingText) {
            var ctx = TextCanvas.getContext('2d');
            ctx.clearRect(0, 0, 400, 200);
            showingText = false;
            return;
        }

        var pickResult = scene.pick(scene.pointerX, scene.pointerY);
        if (!pickResult.hit) {
            return;
        }
        
        if (pickResult.pickedMesh == happyMask && pickResult.distance < 100.0) {
            showingText = true;

                var ctx = TextCanvas.getContext('2d');
                var img = document.getElementById("textBackground");
                ctx.drawImage(img, 0, 0, 400, 200);

                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.font = "20px GothicBody";
                ctx.fillText('"I could ask you to do other tasks.', 20, 40);
                ctx.fillText('Maybe later..."', 20, 80);
        }
        
        if (pickResult.pickedMesh == mask && pickResult.distance < 100.0) {
            if (templeShowing) {
                return;
            }
            if (!orbsLoaded) {
                createOrbs();
            }

            if (orbsRemaining != 0) {

                showingText = true;

                var ctx = TextCanvas.getContext('2d');
                var img = document.getElementById("textBackground");
                ctx.drawImage(img, 0, 0, 400, 200);

                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.font = "20px GothicBody";
                ctx.fillText('"Three Orbs of untold power are', 20, 40);
                ctx.fillText("scattered across this island.", 20, 80);
                ctx.fillText("Bring them to me, so that I can", 20, 120);
                ctx.fillText('ascend to my true form."', 20, 160);
            } else {
                templeShowing = true;
                var flashSphere = new BABYLON.Mesh.CreateSphere("flash", 20, 0.1, scene);
                flashSphere.position = mask.position;
                flashSphere.material = new BABYLON.StandardMaterial("sm1", scene);
                flashSphere.material.ambientColor = new BABYLON.Color3(1.0, 1.0, 1.0);

                var flashAnimation = new BABYLON.Animation("flash", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                var keys = [];
                keys.push({
                    frame: 0,
                    value: new BABYLON.Vector3(1.0, 1.0, 1.0)
                });

                var flashScale = BABYLON.Vector3.Distance(camera.position, mask.position) / 0.1;

                keys.push({
                    frame: 30,
                    value: new BABYLON.Vector3(flashScale, flashScale, flashScale)
                });

                keys.push({
                    frame: 60,
                    value: new BABYLON.Vector3(flashScale * 2.0, flashScale * 2.0, flashScale * 2.0)
                });
                flashAnimation.setKeys(keys);
                flashSphere.animations.push(flashAnimation);
                scene.beginAnimation(flashSphere, 0, 60, false);

                setTimeout(function () {
                    UICanvas.getContext('2d').clearRect(0, 0, 400, 200);
                    templeShowing = true;
                    mask.setEnabled(false);
                    happyMask.setEnabled(true);
                    temple.setEnabled(true);
                    groundMaterial.diffuseTexture = grassTexture;
                    groundMaterial.diffuseTexture.uScale = 20;
                    groundMaterial.diffuseTexture.vScale = 20;
                    groundMaterial.bumpTexture = null;
                    flashSphere.dispose();
                }, 1500);
            }
        }

        for (var i = 0; i < orbs.length; i++) {
            if (orbs[i].object == pickResult.pickedMesh && pickResult.distance < 60.0) {
                orbs[i].callback();
            }
        }
    });
};

var templeShowing = false;
var orbs = [];
var orbsRemaining = 0;

function createOrbs() {
    if (orbsLoaded)
        return;

    var ctx = UICanvas.getContext('2d');

    function drawUIOrb(i, enabled) {
        enabled = enabled == undefined ? true : enabled;
        var orb = new Path2D();
        orb.arc(40 + i * 80, 40, 24.0, 0, 2.0 * Math.PI, true);
        var opacity = enabled ? 1.0 : 0.25;

        if (i == 0) {
            ctx.fillStyle = "rgba(147, 46, 255, " + opacity + ")";
        } else if (i == 1) {
            ctx.fillStyle = "rgba(42, 232, 200, " + opacity + ")";
        } else {
            ctx.fillStyle = "rgba(66, 255, 133, " + opacity + ")";
        }
        ctx.fill(orb);
    }

    function createOrb(index) {
        orbsRemaining++;
        var boundingBox = ground.getBoundingInfo().boundingBox;
        var groundSize = boundingBox.maximumWorld.x - boundingBox.minimumWorld.x;

        var i = 0;
        var x = Math.round(Math.random() * heightMapSize);
        var z = Math.round(Math.random() * heightMapSize);

        while (heightMap[z * heightMapSize + x] < 25 && i < 10) {
            x = Math.round(Math.random() * heightMapSize);
            z = Math.round(Math.random() * heightMapSize);
            i++;
        }

        var y = heightMap[z * heightMapSize + x] / 255.0 * 20.0 - 2.0;

        x = x / heightMapSize * groundSize - groundSize / 2.0;
        z = (1.0 - z / heightMapSize) * groundSize - groundSize / 2.0;

        var radius = 1.0;
        var sphere = new BABYLON.Mesh.CreateSphere("orb", 10, radius, scene);
        sphere.position = new BABYLON.Vector3(x, y, z);
        var sm1 = new BABYLON.StandardMaterial("sm1", scene);
        if (index == 0) {
            sm1.emissiveColor = new BABYLON.Color3(147 / 255.0, 46 / 255.0, 255 / 255.0);
        } else if (index == 1) {
            sm1.emissiveColor = new BABYLON.Color3(42 / 255.0, 232 / 255.0, 200 / 255.0);
        } else {
            sm1.emissiveColor = new BABYLON.Color3(66 / 255.0, 255 / 255.0, 133 / 255.0);
        }
        sm1.specularColor = sm1.emissiveColor;
        sm1.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        sm1.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        sphere.material = sm1;

        orbs.push({
            object: sphere,
            callback: (function (i) {
                return (function () {
                    drawUIOrb(i, true);
                    sphere.dispose();
                    orbsRemaining--;
                });
            })(index)
        });

        var outerRadius = radius / 2.0;
        for (var j = 0; j < 3; j++) {
            var angle = j * 2.0 / 3.0 * Math.PI;

            var childSphere1 = new BABYLON.Mesh.CreateSphere("orb-child", 10, 0.25, scene);
            childSphere1.parent = sphere;
            childSphere1.position = new BABYLON.Vector3(outerRadius * Math.cos(angle), 0.0, outerRadius * Math.sin(angle));
            childSphere1.material = sm1;

            var childSphere2 = new BABYLON.Mesh.CreateSphere("orb-child", 10, 0.25, scene);
            childSphere2.parent = sphere;
            childSphere2.position = new BABYLON.Vector3(outerRadius * Math.cos(angle), outerRadius * Math.sin(angle), 0.0);
            childSphere2.material = sm1;

            var childSphere2 = new BABYLON.Mesh.CreateSphere("orb-child", 10, 0.25, scene);
            childSphere2.parent = sphere;
            childSphere2.position = new BABYLON.Vector3(0.0, outerRadius * Math.cos(angle), outerRadius * Math.sin(angle));
            childSphere2.material = sm1;
        }
        var spinAnimationX = new BABYLON.Animation("spin", "rotation.x", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        var spinAnimationY = new BABYLON.Animation("spin", "rotation.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        var spinAnimationZ = new BABYLON.Animation("spin", "rotation.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
        var keys = [];
        keys.push({
            frame: 0,
            value: 0.0
        });
        keys.push({
            frame: 60,
            value: 4.0 * Math.PI
        });
        spinAnimationX.setKeys(keys);
        spinAnimationY.setKeys(keys);
        spinAnimationZ.setKeys(keys);
        sphere.animations.push(spinAnimationX);
        sphere.animations.push(spinAnimationY);
        sphere.animations.push(spinAnimationZ);
        scene.beginAnimation(sphere, 0, 60, true);
    }

    // Draw the base UI
    ctx.lineWidth = 2.0;
    ctx.strokeStyle = "#444";

    for (var i = 0; i < 3; i++) {
        var path = new Path2D();
        path.arc(40 + i * 80, 40, 30, 0, 20 * Math.PI);
        ctx.stroke(path);

        drawUIOrb(i, false);
        createOrb(i);
    }

    orbsLoaded = true;
}

function updateScene(dt) {

}

function renderScene() {
    scene.render();
}