import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { ScanGraph, ScanNode } from '@/lib/localScanner';

interface SimNode extends ScanNode, d3.SimulationNodeDatum {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> {}

interface LocalScanGraphProps {
  graph: ScanGraph;
  selectedId: string | null;
  onSelect: (node: ScanNode) => void;
}

const LocalScanGraph: React.FC<LocalScanGraphProps> = ({ graph, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const svgElement = svgRef.current;
    if (!container || !svgElement || graph.nodes.length === 0) return;

    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 420);

    const nodes: SimNode[] = graph.nodes.map(n => ({ ...n }));
    const links: SimLink[] = graph.links.map(l => ({ ...l }));

    const svg = d3.select(svgElement);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img').attr('aria-label', 'Graf przeskanowanego folderu');

    const root = svg.append('g');
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', event => root.attr('transform', event.transform));
    svg.call(zoom).on('dblclick.zoom', null);

    const linkSel = root.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'alfa-graph-link')
      .attr('stroke-width', 1);

    const radius = (n: SimNode) => (n.kind === 'root' ? 18 : n.kind === 'dir' ? 11 : 6);

    const nodeSel = root.append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', n => {
        const cat = n.kind === 'file' ? `alfa-scan-${n.category ?? 'other'}` : `alfa-scan-${n.kind}`;
        return `alfa-graph-node alfa-scan-node ${cat}${n.id === selectedId ? ' is-selected' : ''}`;
      })
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', n => n.label)
      .on('click', (_e, n) => onSelect(n))
      .on('keydown', (e, n) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(n);
        }
      });

    nodeSel.append('circle').attr('r', radius).attr('class', 'alfa-node-core');
    nodeSel
      .filter(n => n.kind !== 'file')
      .append('text')
      .attr('class', 'alfa-node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', n => radius(n) + 12)
      .text(n => (n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label));

    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links).id(n => n.id).distance(38).strength(0.9))
      .force('charge', d3.forceManyBody().strength(-60))
      .force('collision', d3.forceCollide<SimNode>().radius(n => radius(n) + 5))
      .force('x', d3.forceX(width / 2).strength(0.06))
      .force('y', d3.forceY(height / 2).strength(0.08))
      .on('tick', () => {
        linkSel
          .attr('x1', l => (l.source as SimNode).x ?? 0)
          .attr('y1', l => (l.source as SimNode).y ?? 0)
          .attr('x2', l => (l.target as SimNode).x ?? 0)
          .attr('y2', l => (l.target as SimNode).y ?? 0);
        nodeSel.attr('transform', n => `translate(${n.x ?? 0},${n.y ?? 0})`);
      });

    nodeSel.call(d3.drag<SVGGElement, SimNode>()
      .on('start', (event, n) => {
        if (!event.active) simulation.alphaTarget(0.15).restart();
        n.fx = n.x; n.fy = n.y;
      })
      .on('drag', (event, n) => { n.fx = event.x; n.fy = event.y; })
      .on('end', (event, n) => {
        if (!event.active) simulation.alphaTarget(0);
        n.fx = null; n.fy = null;
      }));

    return () => { simulation.stop(); };
  }, [graph, selectedId, onSelect]);

  return (
    <div ref={containerRef} className="h-[26rem] w-full overflow-hidden">
      <svg ref={svgRef} className="h-full w-full touch-none" />
    </div>
  );
};

export default LocalScanGraph;
