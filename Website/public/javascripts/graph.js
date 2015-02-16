
function renderChart(tagName, data) {

    // Set the dimensions of the canvas / graph
    var margin = { top: 30, right: 20, bottom: 30, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    // Define function to parse the date / time using ISO format
    var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%S.%LZ").parse;

    // Set the display ranges
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var yDoorAndLight = d3.scale.linear().range([height, 0]);
   
    // Define the axes
    var xAxis = d3.svg.axis().scale(x)
        .orient("bottom").ticks(10);

    var yAxis = d3.svg.axis().scale(y)
        .orient("left").ticks(5);

    
    // Adds the svg canvas
    var svg = d3.select(tagName)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // change the shape of the data to work with the graphs
    data.forEach(function(d) {
        d.timestamp = parseDate(d.timestamp);
        var doorPlotPoint = -1; //outside the domain, so not shown
        if (d.doorOpen) {
            doorPlotPoint = .95;
        }
        d.doorOpen = doorPlotPoint;

        var lightPlotPoint = -1;//outside the domain, so not shown
        if (d.lightOn) {
            lightPlotPoint = 1;
        }
        d.lightOn = lightPlotPoint;


    });


    // Scale the range of the data
    var maxTemp = d3.max(data, function(d) { return d.temp_F; });
    var minTemp = d3.min(data, function(d) { return d.temp_F; });
    x.domain(d3.extent(data, function(d) { return d.timestamp; }));
    y.domain([minTemp - 10, maxTemp + 10]);
    yDoorAndLight.domain([0, 1]);

    // Add the temp scatterplot
    svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 1.5)
        .attr("fill", "blue")
        .attr("cx", function (d) { return x(d.timestamp); })
     .attr("cy", function (d) { return y(d.temp_F); });


    // Add the door scatterplot
    svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 3)
        .attr("fill", "red")
        .attr("cx", function (d) { return x(d.timestamp); })
        .attr("cy", function (d) { return yDoorAndLight(d.doorOpen); });

    // Add the light scatterplot
    svg.selectAll("dot")
        .data(data)
      .enter().append("circle")
        .attr("r", 3)
        .attr("fill", "yellow")
        .attr("cx", function (d) { return x(d.timestamp); })
        .attr("cy", function (d) { return yDoorAndLight(d.lightOn); });



    // Define the temperature line
    var valueline = d3.svg.line()
        .interpolate("linear")
        .x(function (d) { return x(d.timestamp); })
        .y(function (d) { return y(d.temp_F); });

    // Add the temperature valueline path.
    svg.append("path")
        .attr("d", valueline(data))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "none");


    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature (°F)");

}