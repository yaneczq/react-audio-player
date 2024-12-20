import React from "react";
import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./Knob.module.scss";

const Knob = ({ onChange, maxAngle, startAngle }) => {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState(0);
  const [initialMouseY, setInitialMouseY] = useState(0);
  const [initialAngle, setInitialAngle] = useState(0);
  
  const canvasRef = useRef(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const indicatorRef = useRef({ x: 0, y: 0 });
  
  const canvasSize = 35; 
  const radius = 14; 
  const indicatorRadius = 6;
  
  useEffect(() => {
    const initialAngle = maxAngle * 0.5;
    setAngle(initialAngle);
  }, [maxAngle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const indicatorColor = "#22C55E";
    const arcColor = "#22C55E";
    const arcStartAngle = startAngle;
    const arcEndAngle = Math.min(angle + startAngle, startAngle + maxAngle);

    centerRef.current = { x: centerX, y: centerY };
    indicatorRef.current = {
      x:
        centerX +
        indicatorRadius * Math.cos(((angle + startAngle) * Math.PI) / 180),
      y:
        centerY +
        indicatorRadius * Math.sin(((angle + startAngle) * Math.PI) / 180),
    };

    ctx.clearRect(0, 0, width, height);

    const endAngleRad = (arcEndAngle * Math.PI) / 180;
    const startAngleRad = (arcStartAngle * Math.PI) / 180;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngleRad, 2.25 * Math.PI);
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 2.5; 
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngleRad, endAngleRad);
    ctx.strokeStyle = arcColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const angleRad = ((angle + startAngle) * Math.PI) / 180;
    const endX = centerX + indicatorRadius * Math.cos(angleRad);
    const endY = centerY + indicatorRadius * Math.sin(angleRad);

    ctx.beginPath();
    ctx.arc(endX, endY, 1.25, 0, 2 * Math.PI);
    ctx.fillStyle = indicatorColor;
    ctx.fill();

    if (onChange) {
      onChange(angle);
    }
  }, [angle, startAngle, maxAngle, onChange]);

  const handleMouseDown = (
    e,
    setIsDragging,
    setInitialMouseY,
    setInitialAngle,
    angle,
  ) => {
    setIsDragging(true);
    setInitialMouseY(e.clientY);
    setInitialAngle(angle);
  };

  const handleMouseMove = (
    e,
    isDragging,
    setAngle,
    initialMouseY,
    initialAngle,
    maxAngle,
  ) => {
    if (isDragging) {
      const deltaY = e.clientY - initialMouseY;
      const newAngle = Math.max(
        0,
        Math.min(maxAngle, initialAngle - deltaY * 16),
      );
      setAngle(newAngle);
    }
  };

  const handleMouseUp = (setIsDragging) => {
    setIsDragging(false);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleReset = () => {
    setAngle(150);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleClick = (e) => {
    if (contextMenu.visible && !e.target.closest(".context-menu")) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  useEffect(() => {
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  });

  return (
    <div className={styles.knob}>
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        onMouseDown={(e) =>
          handleMouseDown(
            e,
            setIsDragging,
            setInitialMouseY,
            setInitialAngle,
            angle,
          )
        }
        onMouseMove={(e) =>
          handleMouseMove(
            e,
            isDragging,
            setAngle,
            initialMouseY,
            initialAngle,
            maxAngle,
          )
        }
        onMouseUp={() => handleMouseUp(setIsDragging)}
        onMouseLeave={() => setIsDragging(false)}
        onContextMenu={handleContextMenu}
      />
      {contextMenu.visible && (
        <div
          className={styles.contextMenu}
          style={{
            left: contextMenu.X,
          }}
        >
          <button onClick={handleReset}>Reset</button>
        </div>
      )}
    </div>
  );
};

Knob.propTypes = {
  onChange: PropTypes.func.isRequired, 
  maxAngle: PropTypes.number.isRequired, 
  startAngle: PropTypes.number.isRequired,
};

export default Knob;
