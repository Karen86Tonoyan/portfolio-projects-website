import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as d3 from 'd3';
import type { AlfaBrainLink, AlfaBrainNode, AlfaNodeType } from '@/data/alfaBrainGraph';

interface SimulationNode extends AlfaBrainNode, d3.SimulationNodeDatum {}
interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  relation: string;
}

export interface AlfaBrainGraphHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  center: () => void;
  reset: () => void;
}

interface AlfaBrainGraphProps {
  nodes: AlfaBrainNode[];
  links: AlfaBrainLink[];
  query: string;
  filter: 'all' | AlfaNodeType;
  showLabels: boolean;
  paused: boolean;
  selectedId: string;
  onSelect: (node: AlfaBrainNode) => void;
}

const nodeRadius: Record<AlfaNodeType, number> = {
  core: 30,
  guardian: 22,
  engine: 20,
  memory: 19,
  gate: 17,
  domain: 16,
};

const AlfaBrainGraph = forwardRef<AlfaBrainGraphHandle, AlfaBrainGraphProps>(({
  nodes,
  links,
  query,
  filter,
  showLabels,
  paused,
  selectedId,
  onSelect,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const rootRef = useRef<SVGGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<SimulationNode, SimulationLink> | null>(null);

  const applyZoom = (factor: number) => {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(250).call(zoom.scaleBy, factor);
  };

  const centerGraph = () => {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    const root = rootRef.current;
    if (!svg || !zoom || !root) return;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const bounds = root.getBBox();
    if (!bounds.width || !bounds.height) return;
    const scale = Math.min(1.15, 0.86 / Math.max(bounds.width / width, bounds.height / height));
    const x = width / 2 - scale * (bounds.x + bounds.width / 2);
    const y = height / 2 - scale * (bounds.y + bounds.height / 2);
    d3.select(svg).transition().duration(400).call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => applyZoom(1.25),
    zoomOut: () => applyZoom(0.8),
    center: centerGraph,
    reset: () => {
      simulationRef.current?.alpha(0.75).restart();
      window.setTimeout(centerGraph, 450);
    },
  }));

  useEffect(() => {
    const container = containerRef.current;
    const svgElement = svgRef.current;
    if (!container || !svgElement) return;

    const render = () => {
      const width = Math.max(container.clientWidth, 320);
      const height = Math.max(container.clientHeight, 520);
      const normalizedQuery = query.trim().toLocaleLowerCase('pl');
      const visibleNodes = nodes.filter((node) => {
        const typeMatch = filter === 'all' || node.type === filter;
        const queryMatch = !normalizedQuery || `${node.label} ${node.description}`.toLocaleLowerCase('pl').includes(normalizedQuery);
        return typeMatch && queryMatch;
      });
      const visibleIds = new Set(visibleNodes.map((node) => node.id));
      const visibleLinks = links.filter((link) => visibleIds.has(link.source) && visibleIds.has(link.target));
      const simulationNodes: SimulationNode[] = visibleNodes.map((node) => ({ ...node }));
      const simulationLinks: SimulationLink[] = visibleLinks.map((link) => ({ ...link }));

      const svg = d3.select(svgElement);
      svg.selectAll('*').remove();
      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img').attr('aria-label', 'Interaktywny graf architektury ALFA Brain');

      const root = svg.append('g').node();
      if (!root) return;
      rootRef.current = root;
      const rootSelection = d3.select(root);

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.35, 3])
        .on('zoom', (event) => rootSelection.attr('transform', event.transform));
      svg.call(zoom).on('dblclick.zoom', null);
      zoomRef.current = zoom;

      const linkSelection = rootSelection.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(simulationLinks)
        .join('line')
        .attr('class', 'alfa-graph-link')
        .attr('stroke-width', 1.25);

      const nodeSelection = rootSelection.append('g')
        .attr('class', 'nodes')
        .selectAll<SVGGElement, SimulationNode>('g')
        .data(simulationNodes)
        .join('g')
        .attr('class', (node) => `alfa-graph-node alfa-node-${node.type}${node.id === selectedId ? ' is-selected' : ''}`)
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr('aria-label', (node) => `${node.label}: ${node.description}`)
        .on('click', (_event, node) => onSelect(node))
        .on('keydown', (event, node) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(node);
          }
        });

      nodeSelection.append('circle')
        .attr('r', (node) => nodeRadius[node.type])
        .attr('class', 'alfa-node-halo');
      nodeSelection.append('circle')
        .attr('r', (node) => Math.max(8, nodeRadius[node.type] - 5))
        .attr('class', 'alfa-node-core');
      nodeSelection.append('circle')
        .attr('r', 2.5)
        .attr('cx', (node) => nodeRadius[node.type] * 0.55)
        .attr('cy', (node) => -nodeRadius[node.type] * 0.55)
        .attr('class', (node) => `alfa-status-dot status-${node.status}`);

      if (showLabels) {
        nodeSelection.append('text')
          .attr('class', 'alfa-node-label')
          .attr('text-anchor', 'middle')
          .attr('dy', (node) => nodeRadius[node.type] + 16)
          .text((node) => node.label);
      }

      const simulation = d3.forceSimulation<SimulationNode>(simulationNodes)
        .force('link', d3.forceLink<SimulationNode, SimulationLink>(simulationLinks).id((node) => node.id).distance((link) => {
          const source = typeof link.source === 'string' ? link.source : link.source.id;
          return source === 'brain' ? 130 : 105;
        }).strength(0.7))
        .force('charge', d3.forceManyBody().strength(-560))
        .force('collision', d3.forceCollide<SimulationNode>().radius((node) => nodeRadius[node.type] + (showLabels ? 26 : 12)).iterations(2))
        .force('x', d3.forceX(width / 2).strength(0.055))
        .force('y', d3.forceY(height / 2).strength(0.075))
        .on('tick', () => {
          linkSelection
            .attr('x1', (link) => (link.source as SimulationNode).x ?? 0)
            .attr('y1', (link) => (link.source as SimulationNode).y ?? 0)
            .attr('x2', (link) => (link.target as SimulationNode).x ?? 0)
            .attr('y2', (link) => (link.target as SimulationNode).y ?? 0);
          nodeSelection.attr('transform', (node) => `translate(${node.x ?? 0},${node.y ?? 0})`);
        });

      nodeSelection.call(d3.drag<SVGGElement, SimulationNode>()
        .on('start', (event, node) => {
          if (!event.active) simulation.alphaTarget(0.18).restart();
          node.fx = node.x;
          node.fy = node.y;
        })
        .on('drag', (event, node) => {
          node.fx = event.x;
          node.fy = event.y;
        })
        .on('end', (event, node) => {
          if (!event.active) simulation.alphaTarget(0);
          node.fx = null;
          node.fy = null;
        }));

      simulationRef.current = simulation;
      if (paused) simulation.stop();
      window.setTimeout(centerGraph, 500);
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(container);
    return () => {
      observer.disconnect();
      simulationRef.current?.stop();
    };
  }, [filter, links, nodes, onSelect, paused, query, selectedId, showLabels]);

  return (
    <div ref={containerRef} className="h-[34rem] min-h-[520px] w-full overflow-hidden lg:h-[calc(100vh-12.5rem)] lg:min-h-[600px]">
      <svg ref={svgRef} className="h-full w-full touch-none" />
    </div>
  );
});

AlfaBrainGraph.displayName = 'AlfaBrainGraph';

export default AlfaBrainGraph;