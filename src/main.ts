import { multiplyMatrix } from './utils/matrix'
import { fetchShader } from './loaders/shader'
import GLObject from './GLObject'
import Renderer from './renderer'
import { GLOperationMode, GLDrawMode } from './types/glTypes'
import Cube from './models/cube'
import Icosphere from './models/icosphere'

var canvas = document.getElementById('webgl-app') as HTMLCanvasElement
canvas.width = 1000
canvas.height = 600
var gl = canvas.getContext('webgl2')

let appState = {
    mousePos : {
        x: 0,
        y: 0
    },
    rotation: 0,
    operationMode: GLOperationMode.SELECT,
    drawMode: GLDrawMode.LINE,
    selectedId: -1,
    selectedColor: [],
}

async function main() {
    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    console.log('initialized')
    
    var vert = await fetchShader('draw-vert.glsl')
    var frag = await fetchShader('draw-frag.glsl')
    
    var vertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vertShader, vert)
    gl.compileShader(vertShader)
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(vertShader))
    }
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fragShader, frag)
    gl.compileShader(fragShader)
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(fragShader))
    }
    var shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vertShader)
    gl.attachShader(shaderProgram, fragShader)
    gl.linkProgram(shaderProgram)

    var wireVert = await fetchShader('wire-vert.glsl')
    var wireFrag = await fetchShader('wire-frag.glsl')
    
    var wireVertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(wireVertShader, wireVert)
    gl.compileShader(wireVertShader)
    if (!gl.getShaderParameter(wireVertShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(wireVertShader))
    }
    var wireFragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(wireFragShader, wireFrag)
    gl.compileShader(wireFragShader)
    if (!gl.getShaderParameter(wireFragShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(wireFragShader))
    }
    var wireShaderProgram = gl.createProgram()
    gl.attachShader(wireShaderProgram, wireVertShader)
    gl.attachShader(wireShaderProgram, wireFragShader)
    gl.linkProgram(wireShaderProgram)

    var selectVert = await fetchShader('select-vert.glsl')
    var selectFrag = await fetchShader('select-frag.glsl')
    
    var selectVertShader = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(selectVertShader, selectVert)
    gl.compileShader(selectVertShader)
    if (!gl.getShaderParameter(selectVertShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(selectVertShader))
    }
    var selectFragShader = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(selectFragShader, selectFrag)
    gl.compileShader(selectFragShader)
    if (!gl.getShaderParameter(selectFragShader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(selectFragShader))
    }
    var selectProgram = gl.createProgram()
    gl.attachShader(selectProgram, selectVertShader)
    gl.attachShader(selectProgram, selectFragShader)
    gl.linkProgram(selectProgram)

    // mouseevent block
    canvas.addEventListener('mousemove', (event) => {
        const bound = canvas.getBoundingClientRect()
        const res = {
            x: event.clientX - bound.left,
            y: event.clientY - bound.top
        }
        appState.mousePos = res
        const evt = new CustomEvent('glmousemove', {
            detail: {
                pos: {
                    x: res.x,
                    y: res.y
                }
            }
        })
        document.getElementById('rt-mousepos').dispatchEvent(evt)

    }, false)

    canvas.addEventListener('click', (event) => {
        if (appState.selectedId >= 0) {
            const object = objects[appState.selectedId];
            object.color = appState.selectedColor;
            appState.selectedId = -1;
        }

        if(oldPickNdx >= 0){
            appState.selectedId = oldPickNdx
            appState.selectedColor = oldPickColor
            objects[appState.selectedId].color = [0.0, 1.0, 0.0, 1.0]
            document.getElementById("rot_slider1").value = objects[appState.selectedId].rot3[0]
            document.getElementById("rot_slider2").value = objects[appState.selectedId].rot3[1]
            document.getElementById("rot_slider3").value = objects[appState.selectedId].rot3[2]
        }
    })

    let objects = []

    var icosphere = new Icosphere()
    icosphere.setRadius(50)
    icosphere.setSubdivision(1)
    const glObject1 = icosphere.getObject(1, shaderProgram, gl)
    glObject1.setAnchorPoint([0,0,0], 3)
    glObject1.setPosition(600,200,200)
    glObject1.setRotation(0,0,0)
    glObject1.setScale(1,1,1)
    glObject1.setWireShader(wireShaderProgram)
    glObject1.setSelectShader(selectProgram)

    const glObject2 = icosphere.getObject(2, shaderProgram, gl)
    glObject2.setAnchorPoint(glObject1.getPoint(77), 3)
    glObject2.setPosition(0,0,0)
    glObject2.setRotation(0,0,0)
    glObject2.setScale(1,1,1)
    glObject2.setWireShader(wireShaderProgram)
    glObject2.setSelectShader(selectProgram)

    const glObject3 = icosphere.getObject(3, shaderProgram, gl)
    glObject3.setAnchorPoint(glObject2.getPoint(77), 3)
    glObject3.setPosition(0,0,0)
    glObject3.setRotation(0,0,0)
    glObject3.setScale(1,1,1)
    glObject3.setWireShader(wireShaderProgram)
    glObject3.setSelectShader(selectProgram)
    
    const glObject4 = icosphere.getObject(4, shaderProgram, gl)
    glObject4.setAnchorPoint(glObject3.getPoint(77), 3)
    glObject4.setPosition(0,0,0)
    glObject4.setRotation(0,0,0)
    glObject4.setScale(1,1,1)
    glObject4.setWireShader(wireShaderProgram)
    glObject4.setSelectShader(selectProgram)

    const glObject5 = icosphere.getObject(5, shaderProgram, gl)
    glObject5.setAnchorPoint(glObject4.getPoint(77), 3)
    glObject5.setPosition(0,0,0)
    glObject5.setRotation(0,0,0)
    glObject5.setScale(1,1,1)
    glObject5.setWireShader(wireShaderProgram)
    glObject5.setSelectShader(selectProgram)

    const glObject6 = icosphere.getObject(6, shaderProgram, gl)
    glObject6.setAnchorPoint(glObject5.getPoint(77), 3)
    glObject6.setPosition(0,0,0)
    glObject6.setRotation(0,0,0)
    glObject6.setScale(1,1,1)
    glObject6.setWireShader(wireShaderProgram)
    glObject6.setSelectShader(selectProgram)

    const glObject7 = icosphere.getObject(7, shaderProgram, gl)
    glObject7.setAnchorPoint(glObject6.getPoint(77), 3)
    glObject7.setPosition(0,0,0)
    glObject7.setRotation(0,0,0)
    glObject7.setScale(1,1,1)
    glObject7.setWireShader(wireShaderProgram)
    glObject7.setSelectShader(selectProgram)

    const glObject8 = icosphere.getObject(8, shaderProgram, gl)
    glObject8.setAnchorPoint(glObject7.getPoint(77), 3)
    glObject8.setPosition(0,0,0)
    glObject8.setRotation(0,0,0)
    glObject8.setScale(1,1,1)
    glObject8.setWireShader(wireShaderProgram)
    glObject8.setSelectShader(selectProgram)

    const glObject9 = icosphere.getObject(9, shaderProgram, gl)
    glObject9.setAnchorPoint(glObject8.getPoint(77), 3)
    glObject9.setPosition(0,0,0)
    glObject9.setRotation(0,0,0)
    glObject9.setScale(1,1,1)
    glObject9.setWireShader(wireShaderProgram)
    glObject9.setSelectShader(selectProgram)

    const glObject10 = icosphere.getObject(10, shaderProgram, gl)
    glObject10.setAnchorPoint(glObject9.getPoint(77), 3)
    glObject10.setPosition(0,0,0)
    glObject10.setRotation(0,0,0)
    glObject10.setScale(1,1,1)
    glObject10.setWireShader(wireShaderProgram)
    glObject10.setSelectShader(selectProgram)

    const glObject11 = icosphere.getObject(11, shaderProgram, gl)
    glObject11.setAnchorPoint(glObject10.getPoint(77), 3)
    glObject11.setPosition(0,0,0)
    glObject11.setRotation(0,0,0)
    glObject11.setScale(1,1,1)
    glObject11.setWireShader(wireShaderProgram)
    glObject11.setSelectShader(selectProgram)

    const glObject12 = icosphere.getObject(12, shaderProgram, gl)
    glObject12.setAnchorPoint(glObject11.getPoint(77), 3)
    glObject12.setPosition(0,0,0)
    glObject12.setRotation(0,0,0)
    glObject12.setScale(1,1,1)
    glObject12.setWireShader(wireShaderProgram)
    glObject12.setSelectShader(selectProgram)

    const cube = new Cube()
    const glObject13 = cube.getObject(13, shaderProgram, gl)
    glObject13.setAnchorPoint([0,0,0], 3)
    glObject13.setPosition(500,100,200)
    glObject13.setRotation(0,0,0)
    glObject13.setScale(1,1,1)
    glObject13.setWireShader(wireShaderProgram)
    glObject13.setSelectShader(selectProgram)
    glObject13.setTexture("cubetexture.png")

    const glObject14 = cube.getObject(14, shaderProgram, gl)
    glObject14.setAnchorPoint(glObject13.getPoint(1), 3)
    glObject14.setPosition(cube.x/2,cube.y/2,cube.z/2)
    glObject14.setRotation(0,0,0)
    glObject14.setScale(1,1,1)
    glObject14.setWireShader(wireShaderProgram)
    glObject14.setSelectShader(selectProgram)
    glObject14.setTexture("cubetexture.png")
    
    // parent;
    glObject1.addChild(glObject2)
    glObject2.addChild(glObject3)
    glObject3.addChild(glObject4)
    glObject4.addChild(glObject5)
    glObject5.addChild(glObject6)
    glObject6.addChild(glObject7)
    glObject7.addChild(glObject8)
    glObject8.addChild(glObject9)
    glObject9.addChild(glObject10)
    glObject10.addChild(glObject11)
    // glObject11.addChild(glObject12)
    glObject13.addChild(glObject14)

    objects.push(glObject1)
    objects.push(glObject2)
    objects.push(glObject3)
    objects.push(glObject4)
    objects.push(glObject5)
    objects.push(glObject6)
    objects.push(glObject7)
    objects.push(glObject8)
    objects.push(glObject9)
    objects.push(glObject10)
    objects.push(glObject11)
    objects.push(glObject12)
    objects.push(glObject13)
    objects.push(glObject14)

    canvas.addEventListener('ui-rotate', (e: CustomEvent) => {
        console.log('ui-rotate event')
        appState.rotation = e.detail.rot;
        console.log('appstate-rot' + appState.rotation)
        switch (e.detail.id) {
            case 0:
                objects[appState.selectedId].setRotation(appState.rotation, objects[appState.selectedId].rot3[1], objects[appState.selectedId].rot3[2])
                // glObject.setRotation(appState.rotation, appState.rotation, appState.rotation)
                break;
            case 1:
                objects[appState.selectedId].setRotation(objects[appState.selectedId].rot3[0], appState.rotation, objects[appState.selectedId].rot3[2])
            //     glObject2.setRotation(appState.rotation, appState.rotation, appState.rotation)
                break;
            case 2:
                objects[appState.selectedId].setRotation(objects[appState.selectedId].rot3[0], objects[appState.selectedId].rot3[1], appState.rotation)
            //     glObject3.setRotation(appState.rotation, appState.rotation, appState.rotation)
                break;
            // case 3:
            //     glObject4.setRotation(appState.rotation, appState.rotation, appState.rotation)
            //     break;
        
            default:
                break;
        }
        
        // glObject2.setRotation(appState.rotation)
        // glObject3.setRotation(appState.rotation)
        // glObject4.setRotation(appState.rotation)
    })

    const renderer = new Renderer()
    renderer.addObject(glObject1)
    renderer.addObject(glObject13)

    // Create a texture to render to
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    function setFramebufferAttachmentSizes(width, height) {
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }

    const fb = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

    // attach the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);

    // make a depth buffer and the same size as the targetTexture
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
    let oldPickNdx = -1
    let oldPickColor

    var speed = 0
    var extend = false
    var maxDegree = 75

    function render(now: number) {
        if(!extend){
            speed = 2

            glObject2.setRotation(glObject2.rot3[0], glObject2.rot3[1], glObject2.rot3[2] + speed)
            glObject3.setRotation(glObject3.rot3[0], glObject3.rot3[1], glObject3.rot3[2] - speed/8)
            glObject4.setRotation(glObject4.rot3[0], glObject4.rot3[1], glObject4.rot3[2] - speed/8)
            glObject5.setRotation(glObject5.rot3[0], glObject5.rot3[1], glObject5.rot3[2] - (speed - speed/8 - speed/8))
            glObject6.setRotation(glObject6.rot3[0], glObject6.rot3[1], glObject6.rot3[2] - (speed - speed/8 - speed/8))
            glObject7.setRotation(glObject7.rot3[0], glObject7.rot3[1], glObject7.rot3[2] - speed/8)
            glObject8.setRotation(glObject8.rot3[0], glObject8.rot3[1], glObject8.rot3[2] - speed/8)
            glObject9.setRotation(glObject9.rot3[0], glObject9.rot3[1], glObject9.rot3[2] + speed)
            glObject10.setRotation(glObject10.rot3[0], glObject10.rot3[1], glObject10.rot3[2] + speed/4)

            if(glObject2.rot3[2] >= maxDegree){
                extend = true
            }
        } else {
            speed = 3
            var x = glObject1.pos[0] - Math.cos(glObject1.rot3[1] * Math.PI / 180) * speed
            var y = glObject1.pos[1]
            var z = glObject1.pos[2]
            glObject1.setPosition(x,y,z)
            glObject2.setRotation(glObject2.rot3[0], glObject2.rot3[1], glObject2.rot3[2] - speed)
            glObject3.setRotation(glObject3.rot3[0], glObject3.rot3[1], glObject3.rot3[2] + speed/8)
            glObject4.setRotation(glObject4.rot3[0], glObject4.rot3[1], glObject4.rot3[2] + speed/8)
            glObject5.setRotation(glObject5.rot3[0], glObject5.rot3[1], glObject5.rot3[2] + (speed - speed/8 - speed/8))
            glObject6.setRotation(glObject6.rot3[0], glObject6.rot3[1], glObject6.rot3[2] + (speed - speed/8 - speed/8))
            glObject7.setRotation(glObject7.rot3[0], glObject7.rot3[1], glObject7.rot3[2] + speed/8)
            glObject8.setRotation(glObject8.rot3[0], glObject8.rot3[1], glObject8.rot3[2] + speed/8)
            glObject9.setRotation(glObject9.rot3[0], glObject9.rot3[1], glObject9.rot3[2] - speed)
            glObject10.setRotation(glObject10.rot3[0], glObject10.rot3[1], glObject10.rot3[2] - speed/4)


            if(glObject2.rot3[2] < 0){
                extend = false
            }
        }


        setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb)

        gl.clearDepth(1.0)
        gl.viewport(0,0, gl.canvas.width, gl.canvas.height)
        // gl.enable(gl.CULL_FACE)
        gl.enable(gl.DEPTH_TEST)
    
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

        renderer.renderSelect()

        const pixelX = appState.mousePos.x * gl.canvas.width / canvas.clientWidth;
        const pixelY = gl.canvas.height - appState.mousePos.y * gl.canvas.height / canvas.clientHeight - 1;
        const data = new Uint8Array(4);
        gl.readPixels(
            pixelX,            // x
            pixelY,            // y
            1,                 // width
            1,                 // height
            gl.RGBA,           // format
            gl.UNSIGNED_BYTE,  // type
            data);             // typed array to hold result
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

        if (oldPickNdx >= 0) {
            const object = objects[oldPickNdx];
            object.color = oldPickColor;
            oldPickNdx = -1;
        }
        
        if (id > 0) {
            oldPickNdx = id - 1;
            const object = objects[oldPickNdx];
            oldPickColor = object.color;
            object.color = [1.0, 1.0, 0.0, 1.0]
        }
        
        if (appState.selectedId >= 0) {
            const object = objects[appState.selectedId]
            object.color = [0.0, 1.0, 0.0, 1.0]
        }
        // draw the actual objects
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        renderer.render()
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

main()