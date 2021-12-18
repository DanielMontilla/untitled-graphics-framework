import BatchPipeline from "./Batch";
import Renderer from "../../Renderer";
import Rectangle from "../../../Entities/Rectangle";
import { FLOAT_SIZE, VERTEX_PER_QUAD, INDICES_PER_QUAD, MAX_RECTANGLES } from "../../CONST";


import {
   vertexShader   as vsSource,
   fragmentShader as fsSource,
   attributes     as A, 
   uniforms       as U,
   attributeList,
   uniformList
} from "../../Shaders/Rectangle";
import { createQuadIAO } from "../../../Util/webgl";


// TODO: dynamically change max size
export default class RectanglePipeline extends BatchPipeline <Rectangle, A, U> {

   public constructor(renderer: Renderer) {
      super(
         renderer,
         <Rectangle[]>renderer.entityLists.rectangle,
         vsSource, 
         fsSource, 
         attributeList, 
         uniformList,
         FLOAT_SIZE,
         MAX_RECTANGLES,
         11,          // [ x, y, z, offsetx, offsety, originx, originy, angle, r, g, b].length = 11
         VERTEX_PER_QUAD,
         INDICES_PER_QUAD
      );

      let gl = this.renderer.gl;
      gl.useProgram(this.program);
      
      /* SETTING UP UNIFORMS */
      let u_projection  = this.uniforms.u_projection;
      let u_camera      = this.uniforms.u_camera;
      gl.uniformMatrix4fv(u_projection.location, false, renderer.projectionMat);
      gl.uniformMatrix4fv(u_camera.location, false, renderer.cameraMat);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
      this.setAllAttributes();
      gl.bufferData(gl.ARRAY_BUFFER, this.MAX_SIZE, gl.DYNAMIC_DRAW);
      
      /* SETTING UP INDEX BUFFER/ARRAY OBJECT */
      this.iao.set(createQuadIAO(this.MAX_ELEMS));
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.iao, gl.STATIC_DRAW);
   }

   protected createQuadData(rect: Rectangle) {
      let transform = rect.transform;
      let [ x, y ] = transform.position.getValues();
      let [ ofx, ofy ] = transform.offset.getValues();
      let [ orx, ory ] = transform.origin.getValues();
      let a = transform.rotation;
      let [ width, height ] = [ transform.width, transform.height ];
      let z = rect.layer;
      let [ r, g, b ] = rect.color.getNormalized();

      return [
         x        , y         , z, ofx, ofy, orx, ory, a, r, g, b,  // ↖ VERTEX
         x + width, y         , z, ofx, ofy, orx, ory, a, r, g, b,  // ↗ VERTEX
         x        , y + height, z, ofx, ofy, orx, ory, a, r, g, b,  // ↙ VERTEX
         x + width, y + height, z, ofx, ofy, orx, ory, a, r, g, b   // ↘ Vertex
      ]
   }

   protected setPerDrawUniforms(): void {
      let gl = this.renderer.gl;
      gl.uniformMatrix4fv(this.uniforms.u_camera.location, false, this.renderer.cameraMat);
   }
}