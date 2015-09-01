var Main = function () {
    this.init();
}

Main.prototype.init = function () {
    this.initWebGL();
    var gl = this.gl;
    var vertexShader = this.createBuffer(gl.VERTEX_SHADER,
        "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#endif\n" +
        "uniform mat4 u_Matrix;\n" +
        "attribute vec4 a_Position;\n" +
        "attribute vec2 a_TexCoord;\n" +
        "varying vec2 v_TexCoord;\n" +
        "void main(void)\n" +
        "{\n" +
            "gl_Position = u_Matrix*a_Position;\n" +
            "v_TexCoord = a_TexCoord;\n" +
        "}\n");
    var fragmentShader = this.createBuffer(gl.FRAGMENT_SHADER,
        "#ifdef GL_ES\n" +
        "precision mediump float;\n" +
        "#endif\n" +
        "uniform sampler2D u_Sampler;\n" +
        "varying vec2 v_TexCoord;\n" +
        "void main(void)\n" +
        "{\n" +
            "gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n" +
        "}\n");
    this.program = this.createProgram(vertexShader, fragmentShader);
    gl.useProgram(this.program);
    this.readyRender();

    this.x = 0;
    this.speed = 0.002;
}

Main.prototype.initWebGL = function () {
    //获取canvas
    this.canvas = document.getElementById('canvas');
    //初始化webgl
    this.gl = canvas.getContext("experimental-webgl");
    console.log(this.gl);
    if (!this.gl) {
        console.log('Failed to get webgl');
    }
    this.gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
}

Main.prototype.createBuffer = function (type, source) {
    var gl = this.gl;
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("compile shader error : " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

Main.prototype.createProgram = function (vertexShader, fragmentShader) {
    var gl = this.gl;
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("link program error : " + gl.getProgramInfoLog(program));
        gl.detachShader(program, vertexShader);
        gl.detachShader(program, fragmentShader);
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

Main.prototype.initTexture = function () {
    var gl = this.gl;
    var texture = gl.createTexture();
    var u_Sampler = gl.getUniformLocation(this.program,"u_Sampler");
    var image = new Image();
    image.onload = function() {
        this.loadTexture(texture,u_Sampler,image);
    }.bind(this);
    image.src = "roler.png";
}

Main.prototype.loadTexture = function(texture,u_Sampler,image) {
    var gl = this.gl;

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);

    //gl.uniform1i(u_Sampler,0);

    setInterval(this.render.bind(this), 0.016);
}

Main.prototype.readyRender = function () {
    var program = this.program;
    var gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    var jsArrayData = new Float32Array([
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);
    this.matrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1]);
    var FSIZE = jsArrayData.BYTES_PER_ELEMENT;
    this.u_Matrix = gl.getUniformLocation(program, 'u_Matrix');
    gl.uniformMatrix4fv(this.u_Matrix, false, this.matrix)
    this.color = new Float32Array([0.0, 1.0, 0.0, 1.0]);
    this.u_color = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(this.u_color, this.color);

    var triangleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, jsArrayData, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, "a_Position");
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    //gl.disable(gl.DEPTH_TEST);
    //gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    //gl.colorMask(true, true, true, true);

    this.initTexture();
    //gl.drawArrays(gl.TRIANGLES, 0, 4);
}

Main.prototype.render = function () {
    var gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.x += this.speed;
    if (this.x > 1 || this.x < -1) {
        this.speed = -this.speed;
    }
    this.matrix[12] = this.x;
    gl.uniformMatrix4fv(this.u_Matrix, false, this.matrix);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

new Main();