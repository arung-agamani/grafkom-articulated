import { multiplyMatrix } from './utils/matrix'
import { fetchShader } from './loaders/shader'
import GLObject from './GLObject'
import Renderer from './renderer'
import { GLOperationMode, GLDrawMode } from './types/glTypes'
import makeCube from './models/cube'
import makeIcosphere from './models/icosphere'
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

    const glObject = makeCube(1, shaderProgram, gl)
    glObject.setAnchorPoint([0,0,0], 3)
    glObject.setPosition(200,200,700)
    glObject.setRotation(0,0,0)
    glObject.setScale(1,1,1)
    glObject.setWireShader(wireShaderProgram)
    glObject.setSelectShader(selectProgram)
    glObject.bind()

    const glObject2 = makeCube(2, shaderProgram, gl)
    glObject2.setAnchorPoint(glObject.getPoint(6), 3)
    glObject2.setPosition(0,0,0)
    glObject2.setRotation(0,0,0)
    glObject2.setScale(1,1,1)
    glObject2.setWireShader(wireShaderProgram)
    glObject2.setSelectShader(selectProgram)
    glObject2.bind()

    const glObject3 = makeCube(3, shaderProgram, gl)
    glObject3.setAnchorPoint(glObject2.getPoint(2), 3)
    glObject3.setPosition(0,0,0)
    glObject3.setRotation(0,0,0)
    glObject3.setScale(1,1,1)
    glObject3.setWireShader(wireShaderProgram)
    glObject3.setSelectShader(selectProgram)
    glObject3.bind()

    const glObject4 = makeCube(4, shaderProgram, gl)
    glObject4.setAnchorPoint(glObject4.getPoint(1), 3)
    glObject4.setPosition(0,0,0)
    glObject4.setRotation(0,0,0)
    glObject4.setScale(1,1,1)
    glObject4.setWireShader(wireShaderProgram)
    glObject4.setSelectShader(selectProgram)
    glObject4.bind()

    const glObject5 = makeCube(5, shaderProgram, gl)
    glObject5.setAnchorPoint([0, 0, 0], 3)
    glObject5.setPosition(700,200,700)
    glObject5.setRotation(0,0,0)
    glObject5.setScale(1,1,1)
    glObject5.setWireShader(wireShaderProgram)
    glObject5.setSelectShader(selectProgram)
    glObject5.bind()

    var icosphere = new Icosphere(6, shaderProgram, gl)
    icosphere.setRadius(100)
    icosphere.setSubdivision(1)
    const glObject7 = icosphere.getObject()
    glObject7.setAnchorPoint(glObject5.getPoint(5), 3)
    glObject7.setPosition(0,0,0)
    glObject7.setRotation(0,0,0)
    glObject7.setScale(1,1,1)
    glObject7.setWireShader(wireShaderProgram)
    glObject7.setSelectShader(selectProgram)
    glObject7.bind()

    const glObject6 = makeCube(7, shaderProgram, gl)
    glObject6.setAnchorPoint(glObject7.getPoint(6), 3)
    glObject6.setPosition(0,0,0)
    glObject6.setRotation(0,0,0)
    glObject6.setScale(1,1,1)
    glObject6.setWireShader(wireShaderProgram)
    glObject6.setSelectShader(selectProgram)
    glObject6.bind()

    // parent;
    glObject3.addChild(glObject4)
    glObject2.addChild(glObject3)
    glObject.addChild(glObject2)
    glObject5.addChild(glObject7)
    glObject7.addChild(glObject6)

    objects.push(glObject)
    objects.push(glObject2)
    objects.push(glObject3)
    objects.push(glObject4)
    objects.push(glObject5)
    objects.push(glObject7)
    objects.push(glObject6)

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
    renderer.addObject(glObject)
    renderer.addObject(glObject5)

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

    function render(now: number) {

        setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
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