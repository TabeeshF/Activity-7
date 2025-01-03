function scatter_plot(data,ax,title="",xCol="",yCol="",rCol="",legend=[],colorCol="",margin = 50)

{
const X = data.map(d => d[xCol]);
const Y = data.map(d => d[yCol]);
const R = data.map(d => d[rCol]);
const colorCategories = [...new Set(data.map(d => d[colorCol]))];
const color = d3.scaleOrdinal()
.domain(colorCategories)
.range(d3.schemeTableau10); 

const xExtent = d3.extent(X, d => +d);
const yExtent = d3.extent(Y, d => +d);

const xMargin = (xExtent[1] - xExtent[0]) * 0.05; 
const yMargin = (yExtent[1] - yExtent[0]) * 0.05; 

const xScale = d3.scaleLinear()
.domain([xExtent[0] - xMargin, xExtent[1] + xMargin])
.range([margin, 1000 - margin]);

const yScale = d3.scaleLinear()
.domain([yExtent[0] - yMargin, yExtent[1] + yMargin])
.range([1000 - margin, margin]);

const rScale = d3.scaleSqrt()
.domain(d3.extent(R, d => +d))
.range([4, 12]);

const Fig = d3.select(`${ax}`);

Fig.selectAll('.markers')
.data(data)
.join('g')
.attr('transform', d => `translate(${xScale(d[xCol])}, ${yScale(d[yCol])})`)
.append('circle')
.attr("class", (d, i) => `cls_${i} ${d[colorCol]}`)
.attr("id", (d, i) => `id_${i} ${d[colorCol]}`)
.attr("r", d => rScale(d[rCol]))
.attr("fill", d => color(d[colorCol]));

// x and y Axis function
const x_axis = d3.axisBottom(xScale).ticks(4);
const y_axis = d3.axisLeft(yScale).ticks(4);

// X Axis
Fig.append("g").attr("class", "axis")
.attr("transform", `translate(${0},${1000 - margin})`)
.call(x_axis);

// Y Axis
Fig.append("g").attr("class", "axis")
.attr("transform", `translate(${margin},${0})`)
.call(y_axis);

// Labels
Fig.append("g").attr("class", "label")
.attr("transform", `translate(${500},${1000 - 10})`)
.append("text")
.attr("class", "label")
.text(xCol)
.attr("fill", "black");

Fig.append("g")
.attr("transform", `translate(${35},${500}) rotate(270)`)
.append("text")
.attr("class", "label")
.text(yCol)
.attr("fill", "black");

// Title
Fig.append('text')
.attr('x', 500)
.attr('y', 80)
.attr("text-anchor", "middle")
.text(title)
.attr("class", "title")
.attr("fill", "black");

// Declare brush
const brush = d3
.brush()
.on("start", brushStart)
.on("brush end", brushed)
.extent([
[margin, margin],
[1000 - margin, 1000 - margin]
]);

Fig.call(brush);

function brushStart() {
// If no selection already exists, remove the class
if (!d3.brushSelection(this)) {
d3.selectAll("circle").classed("selected", false);
}
}

function brushed() {
// Get brush selection bounds
let selectedCoordinates = d3.brushSelection(this); 

if (!selectedCoordinates) return; 

const X1 = xScale.invert(selectedCoordinates[0][0]);
const X2 = xScale.invert(selectedCoordinates[1][0]);
const Y1 = yScale.invert(selectedCoordinates[0][1]);
const Y2 = yScale.invert(selectedCoordinates[1][1]);

// Select elements within the brush area
d3.selectAll("circle").classed("selected", (d, i) => {
return (+d[xCol] >= X1 && +d[xCol] <= X2 && +d[yCol] <= Y1 && +d[yCol] >= Y2);
});
}

// Initialize legend
const legendContainer = Fig
.append("g")
.attr("transform", `translate(${800},${margin})`)
.attr("class", "marginContainer");

if (legend.length === 0) legend = colorCategories;

const legendItems = legendContainer.selectAll("legends")
.data(legend)
.join("g")
.attr("transform", (d, i) => `translate(${0},${i * 45})`);

legendItems.append("rect")
.attr("fill", d => color(d))
.attr("width", "40")
.attr("height", "40")
.attr("class", d => d);

// Initialize an empty array to keep track of the selected countries
let selectedCountries = [];

legendItems.on("click", (event, d) => {
const isSelected = selectedCountries.includes(d);

if (isSelected) {
selectedCountries = selectedCountries.filter(country => country !== d);
} else {
selectedCountries.push(d);
}

d3.selectAll("circle")
.transition()
.duration(200)
.style("opacity", c => selectedCountries.includes(c[colorCol]) ? 0.2 : 1)
.classed("selected", c => selectedCountries.includes(c[colorCol]));
});

legendItems.append("text")
.text(d => d)
.attr("dx", 45)
.attr("dy", 25)
.attr("class", "legend")
.attr("fill", "black");
}
