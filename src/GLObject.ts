import { multiplyMatrix } from './utils/matrix'

function cos_sine(rad) {
    const deg = rad * Math.PI / 180;
    return [Math.cos(deg), Math.sin(deg)]
}


class GLObject {
    public id: number;
    public colorId: number[];
    public color: number[];
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

    public model = {
        points: null,
        indices: null,
        textureCoords: null,
        wireIndices: null,
        texture: null,
        normals: null,
    }

    public programInfo = {
        shader: null,
        attribLocations: {
            vertexPosition: null,
            normalPosition: null,
            textureCoord: null,
        },
        uniformLocations: {
            projectionMatrix: null,
            color: null,
            resolution: null,
            textureSampler: null,
        },
    }

    public wireInfo = {
        shader: null,
        attribLocations: {
            vertexPosition: null,
        },
        uniformLocations: {
            color: null,
            projectionMatrix: null,
            resolution: null,
        }
    }

    public selectInfo = {
        shader: null,
        attribLocations: {
            vertexPosition: null,
            textureCoord: null,
        },
        uniformLocations: {
            id: null,
            projectionMatrix: null,
            resolution: null,
        }
    }

    public buffers = {
        position: null,
        indices: null,
        textureCoord: null,
        normals: null,
        wire: null,
    }


    constructor(id: number, shader: WebGLProgram, gl: WebGL2RenderingContext) {
        this.id = id;
        this.colorId = [
            ((this.id >> 0) & 0xFF) / 0xFF,
            ((this.id >> 8) & 0xFF) / 0xFF,
            ((this.id >> 16) & 0xFF) / 0xFF,
            ((this.id >> 24) & 0xFF) / 0xFF,
        ]
        this.color = [1.0,0.0,0.0,1.0]
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
        this.initInfo(shader)
        // console.log(this.parentTransfomationMatrix)
    }

    setAnchorPoint(anchorPoint: number[], dimension: number) {
        if (dimension === 2) {
            this.anchorPoint = [anchorPoint[0], anchorPoint[1]]
        } else if (dimension === 3) {
            this.anchorPoint = [anchorPoint[0], anchorPoint[1], anchorPoint[2]]
        }   
    }

    setPoints(points: number[]) {
        this.model.points = points;
    }

    setIndices(indices: number[]) {
        this.model.indices = indices;

        // make wire indices
        const wireIndices = new Uint16Array(this.model.indices.length * 2)
        let j = 0;
        for (let i = 0; i < this.model.indices.length; i += 3) {
            wireIndices[j++] = indices[i];
            wireIndices[j++] = indices[i + 1];

            wireIndices[j++] = indices[i + 1];
            wireIndices[j++] = indices[i + 2];

            wireIndices[j++] = indices[i + 2];
            wireIndices[j++] = indices[i];
        }

        this.model.wireIndices = wireIndices
    }
    
    setTexCoords(texcoords: number[]) {
        this.model.textureCoords = texcoords
    }

    setNormals(normals: number[]) {
        this.model.normals = normals;
    }

    setTexture(src: string) {
        const gl = this.gl
        var texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,255,255]))
        
        var image = new Image()
        image.src = src
        image.onload = function() {
            function isPowerOf2(value: number) {
                return (value & (value - 1)) == 0;
              }
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
             } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
             }
        }

        this.model.texture = texture
    }

    setObjectTexture(texture: WebGLTexture) { this.model.texture = texture }

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

    setWireShader(shader: WebGLProgram) {
        const gl = this.gl
        this.wireInfo = {
            shader: shader,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shader, 'a_pos'),
            },
            uniformLocations: {
                color: gl.getUniformLocation(shader, 'u_fragColor'),
                projectionMatrix: gl.getUniformLocation(shader, 'u_proj_mat'),
                resolution: gl.getUniformLocation(shader, 'u_resolution'),
            }
        }

        const wireBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wireBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.model.wireIndices, gl.STATIC_DRAW)

        this.buffers.wire = wireBuffer
    }

    setSelectShader(shader: WebGLProgram) {
        const gl = this.gl
        this.selectInfo = {
            shader: shader,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shader, 'a_pos'),
                textureCoord: gl.getAttribLocation(shader, 'a_texcoord'),
            },
            uniformLocations: {
                id: gl.getUniformLocation(shader, 'u_id'),
                projectionMatrix: gl.getUniformLocation(shader, 'u_proj_mat'),
                resolution: gl.getUniformLocation(shader, 'u_resolution')
            },
        }

    }

    getPoint(index: number) {
        if(index >= this.model.points.length / 3) return null
        let point = []
        for(var i = 0; i < 3; i++){
            point.push(this.model.points[index * 3 + i])
        }
        return point
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
        // console.log(`P: ${projectionMat}`)
        // console.log(projectionMat)
        return projectionMat
    }

    bind() {
        const gl = this.gl

        const positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.points), gl.STATIC_DRAW)

        const normalBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.normals), gl.STATIC_DRAW)

        const indexBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.model.indices), gl.STATIC_DRAW)
        

        const textureCoordBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.textureCoords), gl.STATIC_DRAW);

        this.buffers = {
            position: positionBuffer,
            indices: indexBuffer,
            textureCoord: textureCoordBuffer,
            wire: null,
            normals: normalBuffer
        }

    }

    initInfo(shader: WebGLProgram){
        const gl = this.gl
        this.programInfo = {
            shader: shader,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shader, 'a_pos'),
                textureCoord: gl.getAttribLocation(shader, 'a_texcoord'),
                normalPosition: gl.getAttribLocation(shader, 'a_normal')
            },
            uniformLocations: {
                projectionMatrix: gl.getUniformLocation(shader, 'u_proj_mat'),
                color: gl.getUniformLocation(shader, 'u_fragColor'),
                resolution: gl.getUniformLocation(shader, 'u_resolution'),
                textureSampler: gl.getUniformLocation(shader, "u_texture"),
            },
        }
    }

    draw() {
        const gl = this.gl

        gl.useProgram(this.programInfo.shader)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
        gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition)

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normals)
        gl.vertexAttribPointer(this.programInfo.attribLocations.normalPosition, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.programInfo.attribLocations.normalPosition)
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.textureCoord)
        gl.vertexAttribPointer(this.programInfo.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord)

        gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, this.projectionMat)
        gl.uniform4fv(this.programInfo.uniformLocations.color, this.color)
        gl.uniform3fv(this.programInfo.uniformLocations.resolution, [gl.canvas.width, gl.canvas.height, this.sceneDepth])
        
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.model.texture)
        gl.uniform1i(this.programInfo.uniformLocations.textureSampler, 0)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices)
        gl.drawElements(gl.TRIANGLES, this.model.indices.length, gl.UNSIGNED_SHORT, 0)
        
        if(this.wireInfo.shader !== null) {
            gl.useProgram(this.wireInfo.shader)
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
            gl.enableVertexAttribArray(this.wireInfo.attribLocations.vertexPosition)
            gl.vertexAttribPointer(this.wireInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)

            gl.uniformMatrix4fv(this.wireInfo.uniformLocations.projectionMatrix, false, this.projectionMat)
            gl.uniform4fv(this.wireInfo.uniformLocations.color, [1.0, 0.0, 0.0, 1.0])
            gl.uniform3fv(this.wireInfo.uniformLocations.resolution, [gl.canvas.width, gl.canvas.height, this.sceneDepth])
            
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.wire)
            gl.drawElements(gl.LINES, this.model.wireIndices.length, gl.UNSIGNED_SHORT, 0)
        } 

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

    drawSelect() {
        const gl = this.gl

        gl.useProgram(this.selectInfo.shader)
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position)
        gl.vertexAttribPointer(this.selectInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0)
        gl.enableVertexAttribArray(this.selectInfo.attribLocations.vertexPosition)
        
        gl.uniformMatrix4fv(this.selectInfo.uniformLocations.projectionMatrix, false, this.projectionMat)
        gl.uniform4fv(this.selectInfo.uniformLocations.id, this.colorId)
        gl.uniform3fv(this.selectInfo.uniformLocations.resolution, [gl.canvas.width, gl.canvas.height, this.sceneDepth])

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices)
        gl.drawElements(gl.TRIANGLES, this.model.indices.length, gl.UNSIGNED_SHORT, 0) 

        const proj = this.calcProjectionMatrix()
      
        for (const obj of this.childs) {
            obj.parentTransfomationMatrix = [...proj]
            obj.parentAnchorPoint = [
                obj.anchorPoint[0],
                obj.anchorPoint[1],
                obj.anchorPoint[2],
            ]
            obj.projectionMat = obj.calcProjectionMatrix()
            obj.drawSelect();
        }
        
    }
}

export default GLObject