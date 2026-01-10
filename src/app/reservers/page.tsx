'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  ReactFlowInstance,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toast } from 'react-toastify';

// Giả sử TableNode bạn dùng trong quản lý có thể reuse
import TableNode from '@/app/manage/setting-table/tableNode';
import { TableData } from '@/app/manage/setting-table/types/table';
import { useListTableNode } from '@/app/queries/useTableNode';
import { AreaType } from '@/app/ValidationSchemas/area.schema';
import { useListArea } from '@/app/queries/useArea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const nodeTypes: NodeTypes = {
  table: TableNode,
};

export default function TableSelectionPage() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const [currentArea, setCurrentArea] = useState<number | null>(null);
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);

  const { data: areaData } = useListArea();
  const { data: tableNodesData, refetch: refetchTableNodes } = useListTableNode(
    currentArea ? { areaId: currentArea } : undefined,
  );
  useEffect(() => {
    const fetchAreas = () => {
      const mockAreas = areaData?.payload?.data || [];
      setAreas(mockAreas);
      if (mockAreas.length > 0 && !currentArea) {
        setCurrentArea(mockAreas[0].id);
      }
    };
    fetchAreas();
  }, [areaData, currentArea]);

  useEffect(() => {
    if (currentArea) loadTableLayout(currentArea);
  }, [currentArea, tableNodesData]);

  const loadTableLayout = (areaId: number) => {
    const apiTables = tableNodesData?.payload?.data || [];
    if (apiTables.length) {
      const newNodes: Node[] = apiTables.map((t: any) => ({
        id: String(t.id),
        type: 'table',
        position: { x: t.positionX, y: t.positionY },
        data: {
          id: String(t.id),
          type: String(t.type).toLowerCase(),
          name: t.name,
          seats: t.seats,
          rotation: t.rotation || 0,
          width: t.width,
          height: t.height,
          imageUrl: t.imageUrl,
          status: t.status?.toLowerCase() || 'available', // available/occupied/reserved
          areaId: String(t.areaId),
          onSelectTable: handleSelectTable, // callback chọn bàn
        },
      }));
      setNodes(newNodes);
    } else {
      setNodes([]);
    }
  };

  const handleSelectTable = useCallback(
    (tableId: string) => {
      const node = nodes.find((n) => n.id === tableId);
      if (!node) return;
      if (node.data.status !== 'available') {
        toast.warning('Bàn này hiện không trống!');
        return;
      }
      // Đánh dấu bàn đã chọn tạm thời
      setNodes((nds) =>
        nds.map((n) =>
          n.id === tableId
            ? { ...n, data: { ...n.data, status: 'selected' } }
            : n,
        ),
      );
      toast.success(`Bạn đã chọn bàn ${node.data.name}`);
    },
    [nodes],
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  const handleZoomIn = useCallback(
    () => reactFlowInstance?.zoomIn(),
    [reactFlowInstance],
  );
  const handleZoomOut = useCallback(
    () => reactFlowInstance?.zoomOut(),
    [reactFlowInstance],
  );
  const handleFitView = useCallback(
    () => reactFlowInstance?.fitView(),
    [reactFlowInstance],
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Chọn khu vực */}
      <div className="p-2 bg-gray-100 flex items-center gap-4">
        <label className="block mb-1 font-semibold text-gray-700">
          Khu vực:
        </label>
        <div className="relative inline-block w-64">
          <select
            value={currentArea ?? ''}
            onChange={(e) => setCurrentArea(Number(e.target.value))}
            className="w-full px-4 py-2 pr-8 border rounded-lg shadow-md appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          >
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {/* Arrow custom */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <Button variant={'outline'} onClick={handleZoomIn}>
          Zoom In
        </Button>
        <Button variant={'outline'} onClick={handleZoomOut}>
          Zoom Out
        </Button>
        <Button variant={'outline'} onClick={handleFitView}>
          Fit View
        </Button>
      </div>

      {/* ReactFlow hiển thị sơ đồ bàn */}
      <div ref={reactFlowWrapper} className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={[]}
          onInit={onInit}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={false} // không cho kéo
          nodesConnectable={false} // không connect
          zoomOnScroll={true}
          panOnScroll={true}
        >
          <Background gap={20} color="#e2e8f0" />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
}
