import { useLayoutEffect, useState } from "react";
import { Line, Rectangle } from "./classes";
import { distance } from "./utils";

function createElement(id, x1, y1, x2, y2, tool) {
  let element;
  switch (tool) {
    case "line":
      //x1 & y1 are the starting point of the line
      //x2 & y2 are the ending point of the line
      element = new Line(x1, y1, x2, y2);
      break;
    case "rectangle":
      //x1 & y1 are the top-left corner of the rectangle
      //x2 & y2 are the bottom-right corner of the rectangle
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
    tool,
    element,
  };
}

function getSelectableElement(clientX, clientY, elements) {
  let selectableElement;
  elements.forEach((element) => {
    const { x1, y1, x2, y2, tool } = element;
    //check if the mouse is close to the shape
    switch (tool) {
      case "line":
        if (
          distance(x1, y1, clientX, clientY) +
            distance(x2, y2, clientX, clientY) -
            distance(x1, y1, x2, y2) <
          1
        ) {
          selectableElement = element;
        }
        break;
      case "rectangle":
        if (clientX >= x1 && clientX <= x2 && clientY >= y1 && clientY <= y2) {
          selectableElement = element;
        }
        break;
    }

    //if the element is selectable, check if it mouse is closer to the corners
    if (selectableElement) {
      const { x1, y1, x2, y2 } = selectableElement;
      const corners = [
        { x: x1, y: y1, type: "tl" },
        { x: x2, y: y1, type: "tr" },
        { x: x2, y: y2, type: "br" },
        { x: x1, y: y2, type: "bl" },
      ];
      let isCloseToCorner = false;
      corners.forEach((corner) => {
        if (distance(corner.x, corner.y, clientX, clientY) < 10) {
          isCloseToCorner = true;
          selectableElement.corner = corner;
        }
      });
      if (!isCloseToCorner) {
        selectableElement.corner = null;
      }
    }
  });
  return selectableElement;
}

function adjustElement(element) {
  const { x1, y1, x2, y2, tool } = element;
  switch (tool) {
    case "line":
      if (x1 > x2) {
        return {
          x1: x2,
          y1: y2,
          x2: x1,
          y2: y1,
        };
      } else {
        return {
          x1,
          y1,
          x2,
          y2,
        };
      }
    case "rectangle":
      return {
        x1: Math.min(x1, x2),
        y1: Math.min(y1, y2),
        x2: Math.max(x1, x2),
        y2: Math.max(y1, y2),
      };
  }
}

function getCursorType(element) {
  if (element.corner) {
    switch (element.corner.type) {
      case "tl":
        return "nw-resize";
      case "tr":
        return "ne-resize";
      case "br":
        return "se-resize";
      case "bl":
        return "sw-resize";
    }
  } else {
    return "move";
  }
}
function resizedCoords(prevCoords, x, y, clientX, clientY, type) {
  const { x1, y1, x2, y2 } = prevCoords;
  switch (type) {
    case "tl":
      return {
        x1: clientX,
        y1: clientY,
        x2,
        y2,
      };
    case "tr":
      return {
        x1,
        y1: clientY,
        x2: clientX,
        y2,
      };
    case "br":
      return {
        x1,
        y1,
        x2: clientX,
        y2: clientY,
      };
    case "bl":
      return {
        x1: clientX,
        y1,
        x2,
        y2: clientY,
      };
  }
}

function App() {
  const [elements, setElements] = useState([]);
  const [action, setAction] = useState("none");
  const [tool, setTool] = useState("line");
  const [selectedElement, setSelectedElement] = useState(null);

  useLayoutEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    //clear the canvas
    ctx.clearRect(0, 64, canvas.width, canvas.height);

    elements.forEach(({ element }) => {
      element.draw(ctx);
    });
  }, [elements]);

  function updateElement(id, x1, y1, x2, y2, tool) {
    const element = createElement(id, x1, y1, x2, y2, tool);
    const updatedElements = elements.map((el) => (el.id === id ? element : el));
    setElements(updatedElements);
  }

  const handleMouseDown = (e) => {
    if (tool === "selection") {
      const element = getSelectableElement(e.clientX, e.clientY, elements);
      if (element) {
        const offsetX = e.clientX - element.x1;
        const offsetY = e.clientY - element.y1;
        element.offsetX = offsetX;
        element.offsetY = offsetY;
        setSelectedElement(element);
        element.corner ? setAction("resizing") : setAction("moving");
      }
    } else {
      //Tools : line, rectangle
      const id = elements.length;
      const element = createElement(
        id,
        e.clientX,
        e.clientY,
        e.clientX,
        e.clientY,
        tool
      );
      setElements([...elements, element]);
      setAction("drawing");
    }
  };
  const handleMouseMove = (e) => {
    //change the cursor based on the tool
    if (tool === "selection") {
      const element = getSelectableElement(e.clientX, e.clientY, elements);
      if (element) {
        e.target.style.cursor = getCursorType(element);
      } else {
        e.target.style.cursor = "default";
      }
    }

    //Handle action if not none
    if (action === "moving") {
      //move the selected element
      const { id, x1, y1, x2, y2, tool, offsetX, offsetY } = selectedElement;
      const newX1 = e.clientX - offsetX;
      const newY1 = e.clientY - offsetY;
      const newX2 = newX1 + x2 - x1;
      const newY2 = newY1 + y2 - y1;
      updateElement(id, newX1, newY1, newX2, newY2, tool);
    } else if (action === "drawing") {
      const { clientX, clientY } = e;
      const { x1, y1 } = elements[elements.length - 1];
      const id = elements.length - 1;
      updateElement(id, x1, y1, clientX, clientY, tool);
    } else if (action === "resizing") {
      const { clientX, clientY } = e;
      const { id, corner, tool, ...prevCoords } = selectedElement;
      // console.log("coordinates", coordinates);
      // console.log("corner", corner);
      const { x, y, type } = corner;
      const { x1, y1, x2, y2 } = resizedCoords(
        prevCoords,
        x,
        y,
        clientX,
        clientY,
        type
      );
      updateElement(id, x1, y1, x2, y2, tool);
    }
  };
  const handleMouseUp = () => {
    const { id, tool } = elements[elements.length - 1];
    //if the action is drawing, adjust the element's coords to have x1, y1 as the top-left corner and x2, y2 as the bottom-right corner
    if (action === "drawing" || action === "resizing") {
      const { x1, y1, x2, y2 } = adjustElement(elements[elements.length - 1]);
      updateElement(id, x1, y1, x2, y2, tool);
    }

    //reset the action and selected element
    setAction("none");
    setSelectedElement(null);
  };

  return (
    <div>
      <div className="fixed top-0 left-0 right-0 flex gap-10 items-center p-4 bg-gray-800 text-white h-16">
        <div className="bg-gray-700 px-4 py-2 flex gap-3 rounded-full hover:cursor-pointer">
          <label className="hover:cursor-pointer" htmlFor="selection">
            Selection
          </label>
          <input
            className="hover:cursor-pointer"
            type="radio"
            id="selection"
            checked={tool === "selection"}
            onChange={() => setTool("selection")}
          />
        </div>
        <div className="bg-gray-700 px-4 py-2 flex gap-3 rounded-full hover:cursor-pointer">
          <label className="hover:cursor-pointer" htmlFor="line">
            Line
          </label>
          <input
            className="hover:cursor-pointer"
            type="radio"
            id="line"
            checked={tool === "line"}
            onChange={() => setTool("line")}
          />
        </div>
        <div className="bg-gray-700 px-4 py-2 flex gap-3 rounded-full hover:cursor-pointer">
          <label className="hover:cursor-pointer" htmlFor="rectangle">
            Rectangle
          </label>
          <input
            className="hover:cursor-pointer"
            type="radio"
            id="rectangle"
            checked={tool === "rectangle"}
            onChange={() => setTool("rectangle")}
          />
        </div>
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
