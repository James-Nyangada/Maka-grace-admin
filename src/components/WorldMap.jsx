"use client";

import React, { useState, useEffect, memo } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { Tooltip } from "react-tooltip";

// Use a fast CDN for TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const colorScale = scaleLinear()
  .domain([0, 100]) // Will be updated dynamically based on data
  .range(["#E5E7EB", "#3B82F6"]); // Light gray to Blue

const MapChart = ({ data }) => {
  const [tooltipContent, setTooltipContent] = useState("");
  const [maxVisitors, setMaxVisitors] = useState(100);

  useEffect(() => {
    if (data && data.length > 0) {
      const maxVal = Math.max(...data.map(item => item.value));
      setMaxVisitors(maxVal > 0 ? maxVal : 100);
    }
  }, [data]);

  const dynamicColorScale = scaleLinear()
    .domain([0, maxVisitors])
    .range(["#E5E7EB", "#3B82F6"]); // Adjust range colors as needed to match the brand

  return (
    <div className="w-full h-full relative" data-tooltip-id="map-tooltip">
      <ComposableMap
        projectionConfig={{
          scale: 140,
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryName = geo.properties.name;
              const d = data.find((s) => s.id === countryName);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={d ? dynamicColorScale(d.value) : "#F3F4F6"}
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  onMouseEnter={() => {
                    const value = d ? d.value : 0;
                    setTooltipContent(`${countryName}: ${value} visitors`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#2563EB", outline: "none", cursor: "pointer" },
                    pressed: { outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
      <Tooltip id="map-tooltip" content={tooltipContent} />
    </div>
  );
};

export default memo(MapChart);
