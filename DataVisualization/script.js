document.addEventListener('DOMContentLoaded', function () {
    const req = new XMLHttpRequest();
    req.open("GET", 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json', true);
    req.send();
    req.onload = function () {
        const json = JSON.parse(req.responseText);
        const dataset = json.data;

        const w = 800;
        const h = 400;
        const padding = 50;

        const getQuarter = (date) => {
            const month = date.substring(5, 7);
            if (month === '01') return 'Q1';
            if (month === '04') return 'Q2';
            if (month === '07') return 'Q3';
            if (month === '10') return 'Q4';
        };

        const years = dataset.map(d => `${d[0].substring(0, 4)} ${getQuarter(d[0])}`);
        const yearsDate = dataset.map(d => new Date(d[0]));

        const xScale = d3.scaleTime()
            .domain([d3.min(yearsDate), d3.max(yearsDate)])
            .range([padding, w - padding]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d[1])])
            .range([h - padding, padding]);

        const svg = d3.select(".visHolder")
            .append("svg")
            .attr("width", w)
            .attr("height", h);

        svg.append("text")
            .attr("id", "title")
            .attr("x", w / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .text("GDP Data Visualization");

        const tooltip = d3.select(".visHolder")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0,0,0,0.7)")
            .style("color", "white")
            .style("padding", "5px 10px")
            .style("border-radius", "5px")
            .style("font-size", "12px");

        svg.selectAll(".bar")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(new Date(d[0])))
            .attr("y", d => yScale(d[1]))
            .attr("width", (w - 2 * padding) / dataset.length)
            .attr("height", d => h - padding - yScale(d[1]))
            .attr("fill", "navy")
            .attr("data-date", d => d[0])
            .attr("data-gdp", d => d[1])
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "white");
                tooltip.style("visibility", "visible")
                    .attr("data-date", d[0])
                    .html(`${d[0].substring(0, 4)} ${getQuarter(d[0])}<br>$${d[1]} Billion`)
                    .style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 30}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("fill", "navy");
                tooltip.style("visibility", "hidden");
            });

        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%Y"));

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${h - padding})`)
            .call(xAxis)
            .selectAll(".tick text")
            .style("text-anchor", "middle");

        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxis);
    };
});
