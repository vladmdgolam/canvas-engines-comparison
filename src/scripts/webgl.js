import Engine from "./engine"
import glslCanvas from "glslCanvas"

class WebGLEngine extends Engine {
  constructor() {
    super()
    var canvas = document.createElement("canvas")
    this.content.appendChild(canvas)
    canvas.width = this.width
    canvas.height = this.height

    var sandbox = new glslCanvas(canvas)

    var string_frag_code = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float u_time;
    uniform vec2 mouse;
    uniform vec2 u_resolution;
    const int count = 100;

vec3 drawRect(in vec2 st,
              in vec2 center,
              in float width,
              in float height,
              in float thickness,
              in vec3 fillColor, 
              in vec3 strokeColor)
{
    vec3 color = vec3(0);
    
    float halfWidth = width * .5;
    float halfHeight = height * .5;
    float halfTickness = thickness * .5;
    
    vec2 bottomLeft = vec2(center.x - halfWidth, center.y - halfHeight);
    vec2 topRight = vec2(center.x + halfWidth, center.y + halfHeight);
    
    //STROKE
    vec2 stroke = vec2(0.0);
    stroke += step(bottomLeft-halfTickness, st) * (1.0 - step(bottomLeft+halfTickness, st));
    stroke += step(topRight-halfTickness, st) * (1.0 - step(topRight+halfTickness, st));
    vec2 strokeLimit = step(bottomLeft-halfTickness, st) * (1.0 - step(topRight+halfTickness, st));
    stroke *= strokeLimit.x * strokeLimit.y;

    color = mix (color, strokeColor, min(stroke.x + stroke.y, 1.0));
    //
    
    //FILL
    vec2 fill = vec2(0.0);
    fill += step(bottomLeft+halfTickness, st) * (1.0 - step(topRight-halfTickness, st));
    vec2 fillLimit = step(bottomLeft+halfTickness, st) * (1.0 - step(topRight-halfTickness, st));
    fill *=  fillLimit.x * fillLimit.y;
    
    color = mix (color, fillColor, min(fill.x + fill.y, 1.0));
    //

	  return color;
}

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                * 43758.5453123);
}


void main( void ) {

	vec2 st = ( gl_FragCoord.xy / u_resolution.xy );
	float aspect = u_resolution.x/u_resolution.y;
	st.x *= aspect;
	
	float pixelSize = 1./u_resolution.y;
	
  vec3 color = vec3(1.0);
  
	for(int i = 0; i <= count; i++) {
	   
	  float sizeCoeff = random(vec2(i+10));
	  float size = (10.+ sizeCoeff * 40.)*pixelSize;
	  
	  vec2 position = vec2(random(vec2(i)) - mod(u_time/10., 0.5), random(vec2(i+5)));
	  
	  color += drawRect(st, vec2(position.x*aspect, position.y), size, size, pixelSize, vec3(1.), -vec3(1.0, 1.0, 1.0));
	  
	}

	

	gl_FragColor = vec4(color, 1.0);

}
    `

    sandbox.load(string_frag_code)
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this))
    this.meter.tick()
  }

  render() {
      this.animate()
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const engine = new WebGLEngine()
  engine.render()
})
