import React, { useEffect, useRef } from 'react';
import OrgChart from '@balkangraph/orgchart.js';

// =============================================================================
// ADVANCED CONFIGURATION
// =============================================================================

OrgChart.templates.itTemplate = Object.assign({}, OrgChart.templates.rony);
OrgChart.templates.itTemplate.nodeMenuButton = "";
OrgChart.templates.itTemplate.nodeCircleMenuButton = {
    radius: 18,
    x: 250,
    y: 60,
    color: '#fff',
    stroke: '#aeaeae'
};

// =============================================================================
// REACT COMPONENT
// =============================================================================

const Organigrama = ({ data, editable = false, onNodeDrop }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const onNodeDropRef = useRef(onNodeDrop);

  useEffect(() => {
    onNodeDropRef.current = onNodeDrop;
  }, [onNodeDrop]);

  useEffect(() => {
    if (chartContainerRef.current && !chartInstanceRef.current) {
      const chart = new OrgChart(chartContainerRef.current, {
        template: "rony",
        enableDragDrop: editable,
        enableSearch: false, // FIX: Disable search bar
        assistantSeparation: 170,
        mouseScrool: OrgChart.action.scroll,
        nodeBinding: {
          field_0: "name",
          field_1: "title",
          img_0: "img"
        },
        toolbar: {
          fullScreen: true,
          zoom: true,
          fit: true,
          expandAll: true
        },
        nodeMenu: {
          details: { text: "Detalles" },
          edit: { text: "Editar" },
          add: { text: "Añadir" },
          remove: { text: "Eliminar" }
        },
        nodeCircleMenu: {
            details: { icon: OrgChart.icon.details(24,24,'#aeaeae'), text: "Detalles" },
            edit: { icon: OrgChart.icon.edit(24,24,'#aeaeae'), text: "Editar" },
            add: { icon: OrgChart.icon.add(24,24,'#aeaeae'), text: "Añadir" },
            remove: { icon: OrgChart.icon.remove(24,24,'#aeaeae'), text: "Eliminar" },
        },
        tags: {
            "it-team-member": {
                template: "itTemplate",
            },
            "ceo-menu": {
                nodeMenu: {
                    add: { text: "Añadir Colaborador" },
                    remove: { text: "Eliminar", onClick: () => { return false; } },
                    edit: { text: "Editar" },
                    details: { text: "Detalles" },
                }
            }
        }
      });

      chart.nodeCircleMenuUI.on('click', function(sender, args){
          switch(args.menuItem.text){
              case "Detalles":
                  chart.editUI.show(args.nodeId, true);
                  break;
              case "Editar":
                  chart.editUI.show(args.nodeId);
                  break;
              case "Añadir":
                  {
                    let id = chart.generateId();
                    chart.addNode({ id: id, pid: args.nodeId, tags: ["it-team-member"] });
                  }
                  break;
              case "Eliminar":
                  chart.removeNode(args.nodeId);
                  break;
              default:
          }
      });

      if (editable) {
        chart.on('drop', function (sender, draggedNodeId, droppedNodeId) {
          if (onNodeDropRef.current) {
            onNodeDropRef.current({
              draggedNodeId: draggedNodeId,
              targetNodeId: droppedNodeId || null
            });
          }
        });
      }

      chartInstanceRef.current = chart;
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [editable]);

  useEffect(() => {
    if (chartInstanceRef.current && data) {
      const mappedData = data.map(user => {
        // FIX: Re-introduce tags generation logic here
        let tags = [];
        if (user.departamento === 'IT department') {
            tags.push("it-team-member");
        }
        if (user.Rol === 'CEO') {
            tags.push("ceo-menu");
        }

        return {
          id: user.user_id,
          pid: user['Líder'] || null,
          name: user.Nombre,
          title: user.Rol,
          img: user.avatar_url || 'https://cdn.balkan.app/shared/empty-img-white.svg',
          tags: tags // Ensure tags are passed with the data
        };
      });

      chartInstanceRef.current.load(mappedData);
    }
  }, [data]);

  return (
    <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default Organigrama;
