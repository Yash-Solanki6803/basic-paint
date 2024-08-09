import { useLayoutEffect, useState } from "react";

class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x1, this.y1);
    ctx.lineTo(this.x2, this.y2);
    ctx.stroke();
  }
}

class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.stroke();
  }
}

function createElement(x1, y1, x2, y2, elementType) {
  let element;
  switch (elementType) {
    case "line":
      element = new Line(x1, y1, x2, y2);
      break;
    case "rectangle":
      element = new Rectangle(x1, y1, x2 - x1, y2 - y1);
      break;

    default:
      break;
  }
  // const element = new Rectangle(x1, y1, x2 - x1, y2 - y1);
  console.log(element);
  return {
    x1,
    y1,
    x2,
    y2,
    element,
  };
}

function App() {
  const [elements, setElements] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [elementType, setElementType] = useState("line");
  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(({ element }) => {
      element.draw(ctx);
    });
  }, [elements]);

  const handleMouseDown = (e) => {
    console.log("Mouse Down");
    setDrawing(true);
    const element = createElement(
      e.clientX,
      e.clientY,
      e.clientX,
      e.clientY,
      elementType
    );
    setElements([...elements, element]);
  };
  const handleMouseMove = (e) => {
    if (!drawing) return;
    const { clientX, clientY } = e;
    const { x1, y1 } = elements[elements.length - 1];
    const element = createElement(x1, y1, clientX, clientY, elementType);

    const updatedElements = [...elements];
    updatedElements[updatedElements.length - 1] = element;
    setElements(updatedElements);

    console.log("Mouse Move");
  };
  const handleMouseUp = () => {
    console.log("Mouse Up");
    // console.log(e.clientX, e.clientY);
    setDrawing(false);
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
        }}
      >
        <label htmlFor="line">Line</label>
        <input
          type="checkbox"
          id="line"
          checked={elementType === "line"}
          onChange={() => setElementType("line")}
        />
        <label htmlFor="rectangle">Rectangle</label>
        <input
          type="checkbox"
          id="rectangle"
          checked={elementType === "rectangle"}
          onChange={() => setElementType("rectangle")}
        />
      </div>
      <canvas
        id="canvas"
        width={innerWidth}
        height={innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        Canvas
      </canvas>
    </div>
  );
}

export default App;
