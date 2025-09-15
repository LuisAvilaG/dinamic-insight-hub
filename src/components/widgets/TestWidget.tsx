
import React from "react";
import { ResponsiveBar } from "@nivo/bar";

const data = [
  { country: "AD", value: 120 },
  { country: "AE", value: 80 },
  { country: "AF", value: 60 },
  { country: "AG", value: 150 },
  { country: "AI", value: 110 },
  { country: "AL", value: 75 },
];

export const TestWidget = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '150px',
      left: '300px', // Evitamos que quede debajo del sidebar
      width: '600px',
      height: '400px',
      backgroundColor: '#fafafa',
      border: '3px dashed red',
      zIndex: 10000, // Nos aseguramos de que esté por encima de todo
      padding: '20px',
      boxSizing: 'border-box',
    }}>
      <h3 style={{ color: 'black', fontWeight: 'bold', marginBottom: '10px' }}>Contenedor de Prueba</h3>
      <p style={{ color: 'black', fontSize: '12px', marginBottom: '15px' }}>
        Si ves este recuadro, el contenedor se está renderizando. Si además ves el gráfico, Nivo funciona.
      </p>
      <ResponsiveBar
        data={data}
        keys={["value"]}
        indexBy="country"
        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={{ scheme: "spectral" }}
        borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Country',
          legendPosition: 'middle',
          legendOffset: 35
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Value',
          legendPosition: 'middle',
          legendOffset: -50
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
        role="application"
        ariaLabel="Nivo bar chart static test"
        animate={true}
      />
    </div>
  );
};
