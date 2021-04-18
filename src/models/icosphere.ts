import GLObject from '../GLObject'

class Icosphere {
  public points: Array<number>
  public indices: Array<number>
  public object: GLObject
  public radius: number
  public id: number
  public gl: WebGL2RenderingContext
  public shader: WebGLProgram
  public subdivisions: number

  constructor(id: number, shader: WebGLProgram, gl: WebGL2RenderingContext){
    this.radius = 100
    this.subdivisions = 0
    this.id = id
    this.gl = gl
    this.shader = shader
    this.init()
  }

  private init(){
    const PI = 3.1415926
    const H_ANGLE = PI / 180 * 72
    const V_ANGLE = Math.atan(1.0 / 2)
    var i1: number
    var i2: number

    var hAngle1 = -PI / 2 - H_ANGLE / 2
    var hAngle2 = -PI / 2;

    this.points = new Array(12)
    this.points[0] = 0
    this.points[1] = 0
    this.points[2] = this.radius

    for(var i = 1; i <= 5; ++i)
    {
      i1 = i  * 3
      i2 = (i + 5) * 3

      var z = this.radius * Math.sin(V_ANGLE)
      var xy = this.radius * Math.cos(V_ANGLE)
      this.points[i1] = xy * Math.cos(hAngle1)
      this.points[i2] = xy * Math.cos(hAngle2)
      this.points[i1 + 1] = xy * Math.sin(hAngle1)
      this.points[i2 + 1] = xy * Math.sin(hAngle2)
      this.points[i1 + 2] = z
      this.points[i2 + 2] = -z

      hAngle1 += H_ANGLE
      hAngle2 += H_ANGLE
    }

    i1 = 11 * 3;
    this.points[i1] = 0;
    this.points[i1 + 1] = 0;
    this.points[i1 + 2] = -this.radius;
    this.indices = [
      0,1,2,
      0,2,3,
      0,3,4,
      0,4,5,
      0,5,1,
      1,6,2,
      2,7,3,
      3,8,4,
      4,9,5,
      5,10,1,
      1,10,6,
      2,6,7,
      3,7,8,
      4,8,9,
      5,9,10,
      11,6,10,
      11,10,9,
      11,9,8,
      11,8,7,
      11,7,6,
    ]
  }

  private calculateSubdivisions(){
    for(var i = 1; i <= this.subdivisions; ++i){
      var tmpPoints = this.points.slice()
      var tmpIndices = this.indices.slice()
      this.points = []
      this.indices = []
      var index = 0
      for(var j = 0; j < tmpIndices.length; j += 3){
        var p1 = [tmpPoints[tmpIndices[j] * 3], tmpPoints[tmpIndices[j] * 3 + 1], tmpPoints[tmpIndices[j] * 3 + 2]]
        var p2 = [tmpPoints[tmpIndices[j + 1] * 3], tmpPoints[tmpIndices[j + 1] * 3 + 1], tmpPoints[tmpIndices[j + 1] * 3 + 2]]
        var p3 = [tmpPoints[tmpIndices[j + 2] * 3], tmpPoints[tmpIndices[j + 2] * 3 + 1], tmpPoints[tmpIndices[j + 2] * 3 + 2]]
  
        var newP1 = this.computeHalvePoints(p1, p2)
        var newP2 = this.computeHalvePoints(p2, p3)
        var newP3 = this.computeHalvePoints(p1, p3)

        this.addTriangle(p1, newP1, newP3)
        this.addTriangle(newP1, p2, newP2)
        this.addTriangle(newP1, newP2, newP3)
        this.addTriangle(newP3, newP2, p3)

        this.addTriangleIndices(index, index+1, index+2)
        this.addTriangleIndices(index+3, index+4, index+5)
        this.addTriangleIndices(index+6, index+7, index+8)
        this.addTriangleIndices(index+9, index+10, index+11)

        index += 12
      }
    }
  }

  private computeHalvePoints(p1: Array<number>, p2: Array<number>){
    var newP = new Array(3)
    newP[0] = p1[0] + p2[0]
    newP[1] = p1[1] + p2[1]
    newP[2] = p1[2] + p2[2]
    var scale = this.radius/Math.sqrt(Math.pow(newP[0],2) + Math.pow(newP[1],2) + Math.pow(newP[2],2))
    newP[0] *= scale
    newP[1] *= scale
    newP[2] *= scale
    return newP
  }
  
  private addTriangle(p1: Array<number>, p2: Array<number>, p3: Array<number>){
    for(var i = 0; i < 3; i++){
      this.points.push(p1[i])
    }
    for(var i = 0; i < 3; i++){
      this.points.push(p2[i])
    }
    for(var i = 0; i < 3; i++){
      this.points.push(p3[i])
    }
  }

  private addTriangleIndices(i1: number, i2: number, i3: number){
    this.indices.push(i1)
    this.indices.push(i2)
    this.indices.push(i3)
  }

  public getObject(){
    let glObject = new GLObject(this.id, this.shader, this.gl)
    glObject.setPoints(this.points)
    glObject.setIndices(this.indices)
    return glObject;
  }

  public setSubdivision(subdivisions: number){
    this.subdivisions = subdivisions
    this.calculateSubdivisions()
  }

  public setRadius(radius: number){
    this.radius = radius
    this.init()
    this.calculateSubdivisions()
  }

}

export default Icosphere