import { multiplyMatrix } from './utils/matrix'

function cos_sine(rad) {
    const deg = rad * Math.PI / 180;
    return [Math.cos(deg), Math.sin(deg)]
}


class GLObject {
    public id: number;
    public va: number[];
    public shader: WebGLProgram;
    public pos: [number, number, number];
    public rot3: [number, number, number];
    public scale: [number, number, number];
    public gl: WebGL2RenderingContext;
    public projectionMat: number[];
    public childs: GLObject[];
    public parentTransfomationMatrix: number[];
    public anchorPoint: number[];
    public parentAnchorPoint: number[];

    public sceneDepth: number;

    constructor(id: number, shader: WebGLProgram, gl: WebGL2RenderingContext) {
        this.id = id;
        this.shader = shader;
        this.gl = gl;
        this.childs = new Array<GLObject>();
        this.sceneDepth = 1000
        // this.parentTransfomationMatrix = [
        //     2 / clientWidth, 0, 0, 0,
        //     0, -2 / clientHeight, 0, 0,
        //     0, 0, 2 / sceneDepth, 0,
        //     -1, 1, 0, cameraDistance
        // ];
        this.parentTransfomationMatrix = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]
        this.parentAnchorPoint = [0,0,0]
        this.rot3 = [0,0,0]
        this.scale = [1,1,1]
        // console.log(this.parentTransfomationMatrix)
    }

    setAnchorPoint(anchorPoint: number[], dimension: number) {
        if (dimension === 2) {
            this.anchorPoint = [anchorPoint[0], anchorPoint[1]]
        } else if (dimension === 3) {
            this.anchorPoint = [anchorPoint[0], anchorPoint[1], anchorPoint[2]]
        }
        
    }

    setVertexArray(va: number[]) {
        this.va = va;
    }

    setPosition(x: number, y: number, z: number) {
        this.pos = [x,y,z];
        const mat = this.calcProjectionMatrix()
        this.projectionMat = mat
    }

    setRotation(x: number, y: number, z: number) {
        this.rot3 = [x,y,z];
        this.projectionMat = this.calcProjectionMatrix()
    }

    setScale(x: number, y: number, z: number) {
        this.scale = [x,y,z];
        this.projectionMat = this.calcProjectionMatrix()
    }

    addChild(obj: GLObject) {
        if (!this.childs.find(x => x.id === obj.id)) {
            this.childs.push(obj);
        }
    }

    

    /* localProjectionMatrix() {
        if (this.pos === undefined || this.rot === undefined || this.scale === undefined) return null
        const [u,v] = this.pos
        const translateMat = [
            1, 0, 0,
            0, 1, 0,
            u, v, 1
        ]
        const degrees = this.rot;
        const rad = degrees * Math.PI / 180;
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        const rotationMat = [
            cos, -sin, 0,
            sin, cos, 0,
            0, 0, 1
        ]
        const [k1, k2] = this.scale
        const scaleMat = [
            k1, 0, 0,
            0, k2, 0,
            0, 0, 1
        ]
        const projectionMat = multiplyMatrix(
            multiplyMatrix(
                multiplyMatrix(rotationMat, scaleMat),
                translateMat
            ),
            this.parentTransfomationMatrix
        )
        console.log(projectionMat)
        return projectionMat
    } */

    calcProjectionMatrix() {
        if (this.pos === undefined || this.rot3 === undefined || this.scale === undefined) return null
        const [a,b,c] = this.parentAnchorPoint
        const anchorMat = [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            a, b, c, 1,
        ]
        const negAnchorMat = [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            -a, -b, -c, 1,
        ]
        /* const translateMat = [
            1, 0, 0,
            0, 1, 0,
            u+a, v+b, 1
        ] */
        const [u,v,w] = this.pos
        const translateMat3 = [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            u+a, v+b, w+c, 1,
        ]
        /* const degrees = this.rot;
        const rad = degrees * Math.PI / 180;
        const sin = Math.sin(rad)
        const cos = Math.cos(rad)
        const rotationMat = [
            cos, -sin, 0,
            sin, cos, 0,
            0, 0, 1
        ] */
        
        // rotation matrix 3 dim
        const trigX = cos_sine(this.rot3[0])
        const trigY = cos_sine(this.rot3[1])
        const trigZ = cos_sine(this.rot3[2])
        const rotX = [
            1, 0, 0, 0,
            0, trigX[0], trigX[1], 0,
            0, -trigX[1], trigX[0], 0,
            0, 0, 0, 1,
        ]
        const rotY = [
            trigY[0], 0, -trigY[1], 0,
            0, 1, 0, 0,
            trigY[1], 0, trigY[0], 0,
            0, 0, 0, 1,
        ]
        const rotZ = [
            trigZ[0], trigZ[1], 0, 0,
            -trigZ[1], trigZ[0], 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
        const rot3Mat = multiplyMatrix(
            multiplyMatrix(rotX, rotY),
            rotZ
        )
            
            
        const [k1, k2, k3] = this.scale
        const scaleMat = [
            k1, 0,  0,  0,
            0, k2,  0,  0,
            0,  0, k3,  0,
            0,  0,  0,  1,
        ]
            
        const identity = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]
        const localProjectionMat = multiplyMatrix(
            translateMat3,
            multiplyMatrix(rot3Mat, scaleMat),
        )
        const projectionMat = multiplyMatrix(
            this.parentTransfomationMatrix,
            localProjectionMat
        )
        console.log(`P: ${projectionMat}`)
        // console.log(projectionMat)
        return projectionMat
    }

    bind() {
        const gl = this.gl
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.va), gl.STATIC_DRAW)
        console.log(this.va)
    }

    draw() {
        const gl = this.gl
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.va), gl.STATIC_DRAW)
        gl.useProgram(this.shader)
        var vertexPos = gl.getAttribLocation(this.shader, 'a_pos')
        var uniformCol = gl.getUniformLocation(this.shader, 'u_fragColor')
        var uniformPos = gl.getUniformLocation(this.shader, 'u_proj_mat')
        var uniformRes = gl.getUniformLocation(this.shader, 'u_resolution')
        gl.enableVertexAttribArray(vertexPos)
        gl.vertexAttribPointer(vertexPos, 3, gl.FLOAT, false, 0, 0)
        console.log(this.projectionMat)
        gl.uniformMatrix4fv(uniformPos, false, this.projectionMat)
        gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0])
        gl.uniform3fv(uniformRes, [gl.canvas.width, gl.canvas.height, this.sceneDepth])
        gl.drawArrays(gl.TRIANGLES, 0, this.va.length/3)
        gl.uniform4fv(uniformCol, [0.0, 0.0, 1.0, 1.0])
        gl.drawArrays(gl.LINES, 0, this.va.length/3)
        const proj = this.calcProjectionMatrix()
        // if (this.id === 0)
        //     console.log(proj)
        // console.log(`${this.id} Outer : ${this.parentAnchorPoint}`)
        // render childs
        for (const obj of this.childs) {
            obj.parentTransfomationMatrix = [...proj]
            obj.parentAnchorPoint = [
                obj.anchorPoint[0],
                obj.anchorPoint[1],
                obj.anchorPoint[2],
            ]
            // console.log(`Print: ${this.id}\n`, proj)
            obj.projectionMat = obj.calcProjectionMatrix()
            obj.draw();
        }
    }
}

export default GLObject