export function loadCubemap(gl: WebGL2RenderingContext) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const faces: Array<[string, number]> = [
        ["assets/pos-x.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
        ["assets/pos-y.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
        ["assets/pos-z.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
        ["assets/neg-x.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
        ["assets/neg-y.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
        ["assets/neg-z.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
    ]
    for (let i = 0; i < faces.length; i++) {
        const face = faces[i][1] as number
        const image = new Image();
        image.src = faces[i][0];
        image.addEventListener('load', function() {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, tex)
            gl.texImage2D(face, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
        })
    }
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    return tex;
}