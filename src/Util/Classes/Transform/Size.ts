import Vec2 from "../Math/Vector/Vec2";

export default class Size implements Vec2 {
   constructor(
      public width: number = 0,
      public height: number = 0
   ) {}

   public scale(n: number): Size {
      this.width *= n;
      this.height *= n;
      return this;
   }

   public getCenter(): [x: number, y: number] {
      return [this.width / 2, this.height / 2]
   }

   public getValues(): [width: number, height: number] {
      return [this.width, this.height];
   }
}