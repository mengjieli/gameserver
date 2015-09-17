module engine {

    export class BitmapProgram extends Program {

        private program:WebGLProgram;
        private buffer:WebGLBuffer;
        private a_Position:any;
        private a_TexCoord:any;
        private u_TexSize:any;

        constructor(gl:WebGLRenderingContext, stageWidth:number, stageHeight:number) {
            super();
            this.initProgram(gl);
            this.initAttriLocation(gl, stageWidth, stageHeight);
        }

        private initProgram(gl:WebGLRenderingContext):void {

            var vertexSource = `
            #ifdef GL_ES
                precision mediump float;
             #endif
             attribute vec2 a_TexCoord;
             attribute vec4 a_Position;
             uniform mat4 u_PMatrix;
             uniform vec2 u_TexSize;
             varying vec2 v_TexCoord;
             void main(void)
             {
                gl_Position = u_PMatrix*a_Position;
                v_TexCoord = a_TexCoord;
                //vec2 rcpFrame = vec2(1.0/u_TexSize.x, 1.0/u_TexSize.y);
                //v_TexCoord.xy = a_TexCoord.xy;
                //v_TexCoord.zw = a_TexCoord.xy - (rcpFrame * (0.5 + 1.0/4.0));
             }
             `;


            var fragmentSource = `
            #ifdef GL_ES
                precision mediump float;
             #endif
             varying vec2 v_TexCoord;

             uniform sampler2D u_Sampler;
             uniform vec2 u_TexSize;

             vec4 fxaa(sampler2D, vec2, vec2,vec2, vec2,vec2, vec2,vec2);
             vec4 fix(sampler2D, vec2,vec2);
             vec4 fdfilter(sampler2D,vec2,vec2);
             vec4 mskfilter(sampler2D,vec2,vec2,vec2);
             vec4 mskrfilter(sampler2D,vec2,vec2,vec2);

             void main(void)
             {

                //gl_FragColor = fix(u_Sampler,v_TexCoord,u_TexSize);

                //gl_FragColor = fxaa(
                //u_Sampler,
                //vec2(v_TexCoord.x*u_TexSize.x,v_TexCoord.y*u_TexSize.y),
                //u_TexSize,
                ////vec2(v_TexCoord.x - (0.5 + 1.0/4.0)/u_TexSize.x                  , v_TexCoord.y - (0.5 + 1.0/4.0)/u_TexSize.y                  ),
                ////vec2(v_TexCoord.x - (0.5 + 1.0/4.0)/u_TexSize.x + 1.0/u_TexSize.x, v_TexCoord.y - (0.5 + 1.0/4.0)/u_TexSize.y                  ),
                ////vec2(v_TexCoord.x - (0.5 + 1.0/4.0)/u_TexSize.x                  , v_TexCoord.y - (0.5 + 1.0/4.0)/u_TexSize.y + 1.0/u_TexSize.y),
                ////vec2(v_TexCoord.x - (0.5 + 1.0/4.0)/u_TexSize.x + 1.0/u_TexSize.x, v_TexCoord.y - (0.5 + 1.0/4.0)/u_TexSize.y + 1.0/u_TexSize.y),
                //
                ////vec2(v_TexCoord.z                  , v_TexCoord.w                  ),
                ////vec2(v_TexCoord.z + 1.0/u_TexSize.x, v_TexCoord.w                  ),
                ////vec2(v_TexCoord.z                  , v_TexCoord.w + 1.0/u_TexSize.y),
                ////vec2(v_TexCoord.x + 1.0/u_TexSize.x, v_TexCoord.y + 1.0/u_TexSize.y),
                //
                ////vec2(v_TexCoord.x - 1.0/u_TexSize.x, v_TexCoord.y                  ),
                ////vec2(v_TexCoord.x + 1.0/u_TexSize.x, v_TexCoord.y                  ),
                ////vec2(v_TexCoord.x                  , v_TexCoord.y - 1.0/u_TexSize.y),
                ////vec2(v_TexCoord.x                  , v_TexCoord.y + 1.0/u_TexSize.y),
                //
                //vec2(v_TexCoord.x - 1.0/u_TexSize.x, v_TexCoord.y - 1.0/u_TexSize.y),
                //vec2(v_TexCoord.x + 1.0/u_TexSize.x, v_TexCoord.y - 1.0/u_TexSize.y),
                //vec2(v_TexCoord.x - 1.0/u_TexSize.x, v_TexCoord.y + 1.0/u_TexSize.y),
                //vec2(v_TexCoord.x + 1.0/u_TexSize.x, v_TexCoord.y + 1.0/u_TexSize.y),
                //
                //v_TexCoord.xy);

                gl_FragColor = texture2D(u_Sampler,v_TexCoord);

                //浮雕效果
                //gl_FragColor = fdfilter(u_Sampler,v_TexCoord,u_TexSize);

                //马赛克滤镜
                //gl_FragColor = mskfilter(u_Sampler,v_TexCoord,u_TexSize,vec2(8,8));

                //圆形马赛克
                //gl_FragColor = mskrfilter(u_Sampler,v_TexCoord,u_TexSize,vec2(16,16));
             }

             //马赛克滤镜
             vec4 mskfilter(sampler2D s_baseMap,vec2 v_texCoord,vec2 TexSize,vec2 mosaicSize)
             {
                vec2 intXY = vec2(v_texCoord.x*TexSize.x, v_texCoord.y*TexSize.y);
                vec2 XYMosaic = vec2(floor(intXY.x/mosaicSize.x)*mosaicSize.x,floor(intXY.y/mosaicSize.y)*mosaicSize.y);
                vec2 UVMosaic = vec2(XYMosaic.x/TexSize.x,XYMosaic.y/TexSize.y);
                return texture2D(s_baseMap,UVMosaic);
             }

             //圆形马赛克滤镜
             vec4 mskrfilter(sampler2D s_baseMap,vec2 v_texCoord,vec2 TexSize,vec2 mosaicSize)
             {
                vec2 intXY = vec2(v_texCoord.x*TexSize.x, v_texCoord.y*TexSize.y);
                vec2 XYMosaic = vec2(floor(intXY.x/mosaicSize.x)*mosaicSize.x,floor(intXY.y/mosaicSize.y)*mosaicSize.y) + 0.5*mosaicSize;
                vec2 delXY = XYMosaic - intXY;
                float delL = length(delXY);
                vec2 UVMosaic = vec2(XYMosaic.x/TexSize.x,XYMosaic.y/TexSize.y);
                if(delL< 0.5*mosaicSize.x) {
                    return texture2D(s_baseMap,UVMosaic);
                }
                return texture2D(s_baseMap,v_texCoord);

             }

             //浮雕滤镜
             vec4 fdfilter(sampler2D sampler,vec2 texCoord,vec2 texSize)
             {
                vec2 tex = texCoord;
                vec2 upLeftUV = vec2(tex.x-1.0/texSize.x,tex.y-1.0/texSize.y);
                vec4 curColor = texture2D(sampler,tex);
                vec4 upLeftColor = texture2D(sampler,upLeftUV);
                vec4 delColor = curColor - upLeftColor;
                float h = 0.3*delColor.x + 0.59*delColor.y + 0.11*delColor.z;
                vec4 bkColor = vec4(0.5, 0.5, 0.5, 1.0);
                return vec4(h,h,h,0.0) + bkColor;
             }


            #define FXAA_REDUCE_MIN   (1.0/ 128.0)
            #define FXAA_REDUCE_MUL   (1.0 / 8.0)
            #define FXAA_SPAN_MAX     8.0

            //optimized version for mobile, where dependent
            //texture reads can be a bottleneck
            vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,
                        vec2 v_rgbNW, vec2 v_rgbNE,
                        vec2 v_rgbSW, vec2 v_rgbSE,
                        vec2 v_rgbM) {
                vec4 color;
                mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
                vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
                vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
                vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
                vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
                vec4 texColor = texture2D(tex, v_rgbM);
                vec3 rgbM  = texColor.xyz;
                vec3 luma = vec3(0.299, 0.587, 0.114);
                float lumaNW = dot(rgbNW, luma);
                float lumaNE = dot(rgbNE, luma);
                float lumaSW = dot(rgbSW, luma);
                float lumaSE = dot(rgbSE, luma);
                float lumaM  = dot(rgbM,  luma);
                float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
                float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

                mediump vec2 dir;
                dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
                dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

                float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
                                      (0.25 * FXAA_REDUCE_MUL), FXAA_REDUCE_MIN);

                float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
                dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                          max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                          dir * rcpDirMin)) * inverseVP;

                vec3 rgbA = 0.5 * (
                    texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
                    texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
                vec3 rgbB = rgbA * 0.5 + 0.25 * (
                    texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
                    texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);

                float lumaB = dot(rgbB, luma);
                if ((lumaB < lumaMin) || (lumaB > lumaMax))
                    color = vec4(rgbA, texColor.a);
                else
                    color = vec4(rgbB, texColor.a);
                return color;
            }
             `;

            var vertexShader = Program.createShader(gl, gl.VERTEX_SHADER, vertexSource);
            var fragmentShader = Program.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
            this.program = Program.createWebGLProgram(gl, vertexShader, fragmentShader);
        }

        private projectionMatrix:Float32Array = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -1, 1, 0, 1]);

        private initAttriLocation(gl:WebGLRenderingContext, width:number, height:number):void {
            var projectionMatrix = this.projectionMatrix;
            projectionMatrix[0] = 2 / width;
            projectionMatrix[5] = -2 / height;

            var program = this.program;
            program["name"] = "bitmap program";
            gl.useProgram(this.program);

            if (!this.buffer) {
                this.buffer = gl.createBuffer();
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

            this.a_Position = gl.getAttribLocation(program, "a_Position");
            gl.enableVertexAttribArray(this.a_Position);
            gl.vertexAttribPointer(this.a_Position, 2, gl.FLOAT, false, $size * 4, 0);

            this.a_TexCoord = gl.getAttribLocation(program, "a_TexCoord");
            gl.enableVertexAttribArray(this.a_TexCoord);
            gl.vertexAttribPointer(this.a_TexCoord, 2, gl.FLOAT, false, $size * 4, $size * 2);

            var u_PMatrix = gl.getUniformLocation(program, "u_PMatrix");
            gl.uniformMatrix4fv(u_PMatrix, false, projectionMatrix);

            this.u_TexSize = gl.getUniformLocation(program, "u_TexSize");

            //console.log(gl.getAttribLocation(program,"a_Position"));
        }


        private textures:WebGLTexture[] = [];
        private texturesSize = [];
        private count = [];
        private positionData = [];

        public reset():void {
            var _this = this;
            _this.textures = [];
            _this.texturesSize = [];
            _this.count = [];
            _this.positionData = [];
        }

        public addDisplayObject(display:DisplayObject):void {
            if (!display.texture) {
                return;
            }

            if (!this.textures.length || this.textures[this.textures.length - 1] != display.texture)
            {
                this.textures.push(display.texture);
                this.texturesSize.push([display.width, display.height]);
                this.positionData.push([]);
                this.count.push(0);
            }

            var index = this.count[this.count.length - 1] * 24;
            var positionData = this.positionData[this.positionData.length - 1];
            var matrix = display.matrix;

            positionData[index] = matrix.b + matrix.tx;
            positionData[1 + index] = matrix.d * display.height + matrix.ty;
            positionData[2 + index] = 0.0;
            positionData[3 + index] = 1.0;

            positionData[16 + index] = positionData[4 + index] = matrix.tx;
            positionData[17 + index] = positionData[5 + index] = matrix.ty;
            positionData[18 + index] = positionData[6 + index] = 0.0;
            positionData[19 + index] = positionData[7 + index] = 0.0;

            positionData[12 + index] = positionData[8 + index] = matrix.a * display.width + matrix.b + matrix.tx;
            positionData[13 + index] = positionData[9 + index] = matrix.c + matrix.d * display.height + matrix.ty;
            positionData[14 + index] = positionData[10 + index] = 1.0;
            positionData[15 + index] = positionData[11 + index] = 1.0;

            positionData[20 + index] = matrix.a * display.width + matrix.tx;
            positionData[21 + index] = matrix.c + matrix.ty;
            positionData[22 + index] = 1.0;
            positionData[23 + index] = 0.0;

            this.count[this.count.length - 1]++;
        }

        public render(gl:WebGLRenderingContext):void {
            var _this = this;
            gl.useProgram(_this.program);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(_this.a_Position, 2, gl.FLOAT, false, $size * 4, 0);
            gl.vertexAttribPointer(_this.a_TexCoord, 2, gl.FLOAT, false, $size * 4, $size * 2);
            for (var i = 0, len = _this.textures.length; i < len; i++) {
                gl.uniform2f(this.u_TexSize, this.texturesSize[i][0], this.texturesSize[i][1]);
                gl.bindTexture(gl.TEXTURE_2D, _this.textures[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_this.positionData[i]), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLES, 0, 6 * _this.count[i]);
            }
        }
    }
}

var str =
`
    #define FXAA_PRESET 3
    #define FXAA_HLSL_4 1
    #include “FxaaShader.h”
    cbuffer cbFxaa : register(b1)
    {
        float4 rcpFrame : packoffset(c0);
    };
    struct FxaaVS_Output
    {
        float4 Pos : SV_POSITION;
        float2 Tex : TEXCOORD0;
    };
     FxaaVS_Output FxaaVS (uint id : SV_VertexID)
    {
         FxaaVS_Output Output;
         Output.Tex = float2((id << 1) & 2, id & 2);
         Output.Pos = float4(Output.Tex * float2(2.0f, -2.0f) + float2(-1.0f, 1.0f), 0.0f, 1.0f);
         return Output;
    }
    SamplerState anisotropicSampler : register(s0);
    Texture2D inputTexture : register(t0);
    float4 FxaaPS(FxaaVS_Output Input) : SV_TARGET
    {
        FxaaTex tex = { anisotropicSampler, inputTexture };
         return float4(FxaaPixelShader( Input.Tex.xy, tex, rcpFrame.xy), 1.0f);
    }

    注意，FXAA预置0通过2需要最大各向异性采样
    各向异性的设置为4，并为所有的预设，有需要的rcpframe常数
    电源输入纹理像素大小的倒数，

    Note, FXAA presets 0 through 2 require an anisotropic sampler with max
    anisotropy set to 4, and for all presets, there is a required rcpFrame constant which
    supplies the reciprocal of the inputTexture size in pixels,

    { 1.0f/inputTextureWidth, 1.0f/inputTextureHeight, 0.0f, 0.0f }

    作为一个优化，亮度估计严格从红色和绿色通道
    使用单一的熔融乘法运算。在实践中，纯蓝混叠很少
    典型的游戏内容。

    float FxaaLuma(float3 rgb)
    {
        return rgb.y * (0.587/0.299) + rgb.x;
    }

    本地对比检查使用像素及其北、南、东、西
    邻居。如果差异在当地最大和最小亮度（对比度）是
    低于阈值的最大局部的亮度比例，然后着色
    早期退出（没有明显的混叠）。这个阈值是以最小值来进行的
    避免在真正的黑暗领域的处理。

    float3 rgbN = FxaaTextureOffset(tex, pos.xy, FxaaInt2( 0,-1)).xyz;
    float3 rgbW = FxaaTextureOffset(tex, pos.xy, FxaaInt2(-1, 0)).xyz;
    float3 rgbM = FxaaTextureOffset(tex, pos.xy, FxaaInt2( 0, 0)).xyz;
    float3 rgbE = FxaaTextureOffset(tex, pos.xy, FxaaInt2( 1, 0)).xyz;
    float3 rgbS = FxaaTextureOffset(tex, pos.xy, FxaaInt2( 0, 1)).xyz;
    float lumaN = FxaaLuma(rgbN);
    float lumaW = FxaaLuma(rgbW);
    float lumaM = FxaaLuma(rgbM);
    float lumaE = FxaaLuma(rgbE);
    float lumaS = FxaaLuma(rgbS);
    float rangeMin = min(lumaM, min(min(lumaN, lumaW), min(lumaS, lumaE)));
    float rangeMax = max(lumaM, max(max(lumaN, lumaW), max(lumaS, lumaE)));
    float range = rangeMax - rangeMin;
    if(range < max(FXAA_EDGE_THRESHOLD_MIN, rangeMax * XAA_EDGE_THRESHOLD))
    {
     return FxaaFilterReturn(rgbM);
    }

    这些定义可以用来优化算法，通过允许该算法早期
    退出和避免处理。
    fxaa_edge_threshold
    应用算法所需的最小局部对比度。
    1 / 3 -太少
    1 / 4 -低质量
    1 / 8 -高质量
    1 / 16–矫枉过正
    fxaa_edge_threshold_min
    修剪处理暗部的算法。
    1 / 32 -可见限
    1 / 16 -高质量
    1 / 12–上限（可见未过滤的边缘开始）


    像素对比度估计为从低像素亮度的绝对差异
    亮度（计算为北，平均南，东和西的邻居）。这个
    像素对比度与局部对比度是用来检测亚像素混叠。这个比例
    接近1在单一像素点的存在，否则开始脱落
    朝着0像素的边缘贡献更多。比例转化为
    融入在算法结束低通滤波器的数量。

    float lumaL = (lumaN + lumaW + lumaE + lumaS) * 0.25;
    float rangeL = abs(lumaL - lumaM);
    float blendL = max(0.0, (rangeL / range) - FXAA_SUBPIX_TRIM) * FXAA_SUBPIX_TRIM_SCALE;
    blendL = min(FXAA_SUBPIX_CAP, blendL);

    用于过滤像素走样算法后期的低值是完整的3x3像素邻域箱式过滤器。

    float3 rgbL = rgbN + rgbW + rgbM + rgbE + rgbS;
    // ...
    float3 rgbNW = FxaaTextureOffset(tex, pos.xy, FxaaInt2(-1,-1)).xyz;
    float3 rgbNE = FxaaTextureOffset(tex, pos.xy, FxaaInt2( 1,-1)).xyz;
    float3 rgbSW = FxaaTextureOffset(tex, pos.xy, FxaaInt2(-1, 1)).xyz;
    float3 rgbSE = FxaaTextureOffset(tex, pos.xy, FxaaInt2( 1, 1)).xyz;
    rgbL += (rgbNW + rgbNE + rgbSW + rgbSE);
    rgbL *= FxaaToFloat3(1.0/9.0);

    除了关闭功能或完全的，这些定义不影响
    性能。通过默认的子像素混叠消除的量是有限的。这
    可以保持良好的功能，但在一个低的对比度，所以他们不
    分散注意力的眼睛。满是模糊的图像。
    fxaa_subpix
    切换subpix过滤。
    0，关闭
    1，打开
    2–打开力（忽略fxaa_subpix_trim帽）
    fxaa_subpix_trim
    控制去除子像素混叠。
    1 / 2 -低去除
    1 / 3 -中去除
    1 / 4 -默认清除
    1 / 8 -高去除
    0彻底清除
    fxaa_subpix_cap
    确保细节没有完全消除。
    这部分覆盖fxaa_subpix_trim。
    3 / 4 -默认的过滤量
    7 / 8 -过滤量
    1、无旋盖

    边缘检测滤波器，如Sobel单像素线穿越中心失败
    一个像素。FXAA以加权平均幅度的高通值
    当地的3x3邻域的行和列的局部边缘的指示
    数量。

    float edgeVert =
     abs((0.25 * lumaNW) + (-0.5 * lumaN) + (0.25 * lumaNE)) +
     abs((0.50 * lumaW ) + (-1.0 * lumaM) + (0.50 * lumaE )) +
     abs((0.25 * lumaSW) + (-0.5 * lumaS) + (0.25 * lumaSE));
    float edgeHorz =
     abs((0.25 * lumaNW) + (-0.5 * lumaW) + (0.25 * lumaSW)) +
     abs((0.50 * lumaN ) + (-1.0 * lumaM) + (0.50 * lumaS )) +
     abs((0.25 * lumaNE) + (-0.5 * lumaE) + (0.25 * lumaSE));
    bool horzSpan = edgeHorz >= edgeVert;

    鉴于当地的边缘方向，FXAA对像素的最高对比度
    邻居90度到本地边方向。算法搜索沿
    在正面和负面的方向，直到达到一个搜索限制或
    沿边缘变化的平均亮度变化，以表示
    边端。
    一个单独的循环搜索的负和正方向平行的
    选择水平方向或垂直方向。这样做是为了避免发散分支
    在材质。
    当搜索加速启用（预设0，1，2）搜索加速
    使用各向异性过滤作为一个方块过滤器，以检查超过一个单一的像素对。

    for(uint i = 0; i < FXAA_SEARCH_STEPS; i++)
    {
        #if FXAA_SEARCH_ACCELERATION == 1
            if(!doneN) lumaEndN = FxaaLuma(FxaaTexture(tex, posN.xy).xyz);
            if(!doneP) lumaEndP = FxaaLuma(FxaaTexture(tex, posP.xy).xyz);
        #else
            if(!doneN) lumaEndN = FxaaLuma;
            FxaaTextureGrad(tex, posN.xy, offNP).xyz);
            if(!doneP) lumaEndP = FxaaLuma;
            FxaaTextureGrad(tex, posP.xy, offNP).xyz);
        #endif
        doneN = doneN || (abs(lumaEndN - lumaN) >= gradientN);
        doneP = doneP || (abs(lumaEndP - lumaN) >= gradientN);
        if(doneN && doneP) break;
        if(!doneN) posN -= offNP;
        if(!doneP) posP += offNP;
    }
`;
