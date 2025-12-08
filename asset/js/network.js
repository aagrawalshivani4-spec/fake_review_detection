/* --------------------------------------------------------------------
   PREMIUM NETWORK GRAPH
   - Node labels
   - Suspicion score gradient
   - Node size = degree centrality
   - Glow highlight on click
   - Smooth layout
--------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    /* ---------------------------------------------------------------
       1. DUMMY DATA (Replace with backend later)
    ---------------------------------------------------------------- */

    const nodes = [
        { id: "P101", type: "product", suspicion: 0.2 },
        { id: "P203", type: "product", suspicion: 0.4 },
        { id: "P330", type: "product", suspicion: 0.1 },
        { id: "U001", type: "user", suspicion: 0.7 },
        { id: "U214", type: "user", suspicion: 0.55 },
        { id: "U552", type: "user", suspicion: 0.9 },
        { id: "U773", type: "user", suspicion: 0.3 }
    ];

    const links = [
        { source: "U001", target: "P101" },
        { source: "U214", target: "P101" },
        { source: "U552", target: "P203" },
        { source: "U214", target: "P203" },
        { source: "U773", target: "P330" },
        { source: "U552", target: "P330" }
    ];

    /* ---------------------------------------------------------------
       2. DEGREE CENTRALITY CALCULATION
    ---------------------------------------------------------------- */

    const degreeCount = {};

    links.forEach(l => {
        degreeCount[l.source] = (degreeCount[l.source] || 0) + 1;
        degreeCount[l.target] = (degreeCount[l.target] || 0) + 1;
    });

    nodes.forEach(n => {
        n.degree = degreeCount[n.id] || 1;
    });

    /* ---------------------------------------------------------------
       3. SVG SETUP
    ---------------------------------------------------------------- */

    const container = document.getElementById("network-graph");
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3
        .select("#network-graph")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /* ---------------------------------------------------------------
       4. COLOR GRADIENT FOR SUSPICION SCORE
    ---------------------------------------------------------------- */

    const suspicionColor = d3.scaleLinear()
        .domain([0, 0.3, 0.6, 1])
        .range(["#10b981", "#facc15", "#f97316", "#dc2626"]); 
        // green → yellow → orange → red

    /* ---------------------------------------------------------------
       5. RADIUS BASED ON DEGREE CENTRALITY
    ---------------------------------------------------------------- */

    const radiusForNode = (d) => {
        const base = d.type === "product" ? 12 : 10;
        return base + d.degree * 3;
    };

    /* ---------------------------------------------------------------
       6. FORCE SIMULATION
    ---------------------------------------------------------------- */

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(130))
        .force("charge", d3.forceManyBody().strength(-280))
        .force("center", d3.forceCenter(width / 2, height / 2));

    /* ---------------------------------------------------------------
       7. LINKS
    ---------------------------------------------------------------- */

    const link = svg
        .append("g")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .data(links)
        .enter()
        .append("line");

    /* ---------------------------------------------------------------
       8. TOOLTIP
    ---------------------------------------------------------------- */

    const tooltip = d3
        .select("#network-graph")
        .append("div")
        .attr("class", "graph-tooltip")
        .style("opacity", 0);

    /* ---------------------------------------------------------------
       9. NODES (Circles)
    ---------------------------------------------------------------- */

    const node = svg
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", radiusForNode)
        .attr("fill", d => d.type === "product" ? "#2563eb" : suspicionColor(d.suspicion))
        .attr("stroke", "#1e293b")
        .attr("stroke-width", 1.2)
        .style("cursor", "pointer")
        .call(
            d3.drag()
                .on("start", dragStart)
                .on("drag", dragged)
                .on("end", dragEnd)
        )
        .on("mouseover", (event, d) => {
            tooltip
                .style("opacity", 1)
                .html(`
                    <strong>${d.id}</strong><br>
                    Type: ${d.type}<br>
                    Degree: ${d.degree}<br>
                    Suspicion: ${(d.suspicion*100).toFixed(1)}%
                `);

            d3.select(event.target)
                .attr("stroke-width", 3)
                .attr("stroke", "#000");
        })
        .on("mousemove", (event) => {
            tooltip
                .style("left", event.offsetX + "px")
                .style("top", event.offsetY - 30 + "px");
        })
        .on("mouseout", (event) => {
            tooltip.style("opacity", 0);
            d3.select(event.target)
                .attr("stroke-width", 1.2)
                .attr("stroke", "#1e293b");
        })
        .on("click", (event, d) => {

            // Glow effect
            node.attr("filter", null); // reset all
            d3.select(event.target)
                .attr("filter", "url(#glow)");

            // Update side panel
            document.getElementById("selected-node-id").textContent = d.id;
            document.getElementById("selected-node-info").textContent =
                `Type: ${d.type}, Degree: ${d.degree}, Suspicion: ${(d.suspicion*100).toFixed(1)}%`;
        });

    /* ---------------------------------------------------------------
       10. NODE LABELS
    ---------------------------------------------------------------- */

    const labels = svg
        .append("g")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .style("font-size", "11px")
        .style("fill", "#374151")
        .text(d => d.id);

    /* ---------------------------------------------------------------
       11. GLOW FILTER (For selected nodes)
    ---------------------------------------------------------------- */

    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    /* ---------------------------------------------------------------
       12. TICK UPDATE
    ---------------------------------------------------------------- */

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        labels
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    /* ---------------------------------------------------------------
       13. DRAG FUNCTIONS
    ---------------------------------------------------------------- */

    function dragStart(event, d) {
        if (!event.active) simulation.alphaTarget(0.2).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnd(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

});

