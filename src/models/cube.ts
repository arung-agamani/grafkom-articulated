import GLObject from '../GLObject'

class Cube {
  public x: number
  public y: number
  public z: number 
  public points: Array<number>
  public indices: Array<number>
  public textureCoords: Array<number>
  public baseValue: number

  constructor(){
    this.baseValue = 100
    this.x = this.baseValue
    this.y = this.baseValue
    this.z = this.baseValue
    this.calculatePoints()
    this.initIndices()
    this.initTextureCoords()
  }

  calculatePoints(){
    this.points = [
    -this.x/2, -this.y/2,  this.z/2,
     this.x/2, -this.y/2,  this.z/2,
     this.x/2,  this.y/2,  this.z/2,
    -this.x/2,  this.y/2,  this.z/2,

    // Back face
    -this.x/2, -this.y/2, -this.z/2,
    -this.x/2,  this.y/2, -this.z/2,
     this.x/2,  this.y/2, -this.z/2,
     this.x/2, -this.y/2, -this.z/2,

    // Top face
    -this.x/2,  this.y/2, -this.z/2,
    -this.x/2,  this.y/2,  this.z/2,
     this.x/2,  this.y/2,  this.z/2,
     this.x/2,  this.y/2, -this.z/2,

    // Bottom face
    -this.x/2, -this.y/2, -this.z/2,
     this.x/2, -this.y/2, -this.z/2,
     this.x/2, -this.y/2,  this.z/2,
    -this.x/2, -this.y/2,  this.z/2,

    // Right face
     this.x/2, -this.y/2, -this.z/2,
     this.x/2,  this.y/2, -this.z/2,
     this.x/2,  this.y/2,  this.z/2,
     this.x/2, -this.y/2,  this.z/2,

    // Left face
    -this.x/2, -this.y/2, -this.z/2,
    -this.x/2, -this.y/2,  this.z/2,
    -this.x/2,  this.y/2,  this.z/2,
    -this.x/2,  this.y/2, -this.z/2,
    ]
  }

  public setX(x: number) {
    this.x = x
    this.calculatePoints()
  }

  public setY(y: number) {
    this.y = y
    this.calculatePoints()
  }

  public setZ(z: number) {
    this.z = z
    this.calculatePoints()
  }

  public reset() {
    this.x = this.baseValue
    this.y = this.baseValue
    this.z = this.baseValue
    this.calculatePoints()
  }

  private initIndices() {
    this.indices = [
      0,  1,  2,      0,  2,  3,    // front
      4,  5,  6,      4,  6,  7,    // back
      8,  9,  10,     8,  10, 11,   // top
      12, 13, 14,     12, 14, 15,   // bottom
      16, 17, 18,     16, 18, 19,   // right
      20, 21, 22,     20, 22, 23,   // left
    ]
  }
  private initTextureCoords() {
    this.textureCoords = [
       // Front
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Back
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Top
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Bottom
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Right
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
      // Left
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      0.0,  1.0,
    ]
  }

  public getObject(id: number, shader:WebGLProgram, gl:WebGL2RenderingContext){
    console.log("makecube")
    let glObject = new GLObject(id, shader, gl)
    console.log(this.points)
    glObject.setPoints(this.points)
    glObject.setIndices(this.indices)
    glObject.setTexCoords(this.textureCoords)
    glObject.bind()
    return glObject;
  }
}

export default Cube



