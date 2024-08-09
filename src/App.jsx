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

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function createElement(id, x1, y1, x2, y2, elementType) {
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
  return {
    id,
    x1,
    y1,
    x2,
    y2,
    elementType,
    element,
  };
}

function getSelectedElement(x, y, elements) {
  let selectedElement;
  elements.forEach((element) => {
    const { x1, y1, x2, y2, elementType } = element;
    switch (elementType) {
      case "line":
        if (
          distance(x1, y1, x, y) +
            distance(x2, y2, x, y) -
            distance(x1, y1, x2, y2) <
          1
        ) {
          const offsetX = x - x1;
          const offsetY = y - y1;
          selectedElement = element;
          selectedElement.offsetX = offsetX;
          selectedElement.offsetY = offsetY;
        }
        break;
      case "rectangle":
        // console.log(x, y, x1, x1 + x2, y1, y1 + y2);
        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
          const offsetX = x - x1;
          const offsetY = y - y1;
          selectedElement = element;
          selectedElement.offsetX = offsetX;
          selectedElement.offsetY = offsetY;
        }
        break;
    }
    if (selectedElement) return;
  });
  return selectedElement;
}

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [elementType, setElementType] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    //clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach(({ element }) => {
      element.draw(ctx);
    });
  }, [elements]);

  function updateElement(id, x1, y1, x2, y2, type) {
    const element = createElement(id, x1, y1, x2, y2, type);

    const updatedElements = elements.map((el) => (el.id === id ? element : el));
    setElements(updatedElements);
  }

  const handleMouseDown = (e) => {
    if (elementType === "selection") {
      const element = getSelectedElement(e.clientX, e.clientY, elements);
      if (element) {
        setSelectedElement(element);
        setAction("moving");
      }
    } else {
      setAction("drawing");
      const id = elements.length;
      const element = createElement(
        id,
        e.clientX,
        e.clientY,
        e.clientX,
        e.clientY,
        elementType
      );
      setElements([...elements, element]);
    }
  };
  const handleMouseMove = (e) => {
    if (elementType === "selection") {
      e.target.style.cursor = getSelectedElement(e.clientX, e.clientY, elements)
        ? "move"
        : "default";
    }
    if (action === "moving") {
      //move the selected element
      const { id, x1, y1, x2, y2, elementType, offsetX, offsetY } =
        selectedElement;
      const newX1 = e.clientX - offsetX;
      const newY1 = e.clientY - offsetY;
      const newX2 = newX1 + x2 - x1;
      const newY2 = newY1 + y2 - y1;
      updateElement(id, newX1, newY1, newX2, newY2, elementType);
    } else if (action === "drawing") {
      const { clientX, clientY } = e;
      const { x1, y1 } = elements[elements.length - 1];
      const id = elements.length - 1;
      updateElement(id, x1, y1, clientX, clientY, elementType);
    }
  };
  const handleMouseUp = () => {
    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
        }}
      >
        <label htmlFor="selection">Selection</label>
        <input
          type="radio"
          id="selection"
          checked={elementType === "selection"}
          onChange={() => setElementType("selection")}
        />
        <label htmlFor="line">Line</label>
        <input
          type="radio"
          id="line"
          checked={elementType === "line"}
          onChange={() => setElementType("line")}
        />
        <label htmlFor="rectangle">Rectangle</label>
        <input
          type="radio"
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
