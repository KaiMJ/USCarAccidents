var margin = { top: 50, right: 100, bottom: 50, left: 100 };
var width = 800 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

function plot() {
    var filePath = "../cleanData.csv";
    var filePath = "../smallData.csv";
    // boxPlot(filePath)
    streamPlot(filePath);
}

function boxPlot(filePath) {
    var rowConverter = function (d) {
        return {
            Severity: parseFloat(d.Severity),
            Temperature: parseFloat(d["Temperature(F)"]),
            Humidity: parseFloat(d["Humidity(%)"]),
            Pressure: parseFloat(d["Pressure(in)"]),
            Windspeed: parseFloat(d["Wind_Speed(mph)"]),
        };
    };

    svg = d3
        .select("#q4_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const csv = d3.csv(filePath, rowConverter);
    csv.then(function (data) {
        var button = d3.select("#radio4").attr("name", "env_factor");
        var selectedCategory = String(
            document.querySelector("input[name=env_factor]:checked").value
        );
        severities = [...new Set(d3.map(data, (d) => d.Severity))];
        severities.sort((a, b) => a - b);
        var x = d3
            .scaleBand()
            .domain(severities)
            .range([0, width - margin.right]);
        var y = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d[selectedCategory]))
            .range([height, 0]);
        makeAxis(svg, x, y);
        addBoxPlot(svg, data, selectedCategory, x, y);

        button.on("change", (e) => {
            d3.selectAll(".boxPlot")
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1)
                .transition()
                .duration(300)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .remove();
            selectedCategory = String(
                document.querySelector("input[name=env_factor]:checked").value
            );
            y.domain(d3.extent(data, (d) => d[selectedCategory]));

            makeAxis(svg, x, y, "boxPlot");
            addBoxPlot(svg, data, selectedCategory, x, y);
        });
    });
}

var makeAxis = function (svg, x, y, className) {
    var xAxis = d3.axisBottom().scale(x);
    var yAxis = d3.axisLeft().scale(y);

    var xAxis = svg
        .append("g")
        .attr("class", `axis ${className}`)
        .attr("transform", `translate(${margin.left}, ${height})`)
        .call(xAxis);
    var yAxis = svg
        .append("g")
        .attr("class", `axis ${className}`)
        .attr("transform", `translate(${margin.left}, ${0})`)
        .call(yAxis);

    return xAxis, yAxis;
};

var addBoxPlot = function (svg, data, category, x, y) {
    for (const sev of severities) {
        data_filtered = d3.filter(data, (d) => d.Severity == sev);
        var max = d3.max(data_filtered, (d) => d[category]);
        var min = d3.min(data_filtered, (d) => d[category]);
        var data_sorted = d3.sort(
            data_filtered.map((d) => d[category]),
            (d) => d[category]
        );

        var q1 = d3.quantile(data_sorted, 0.25);
        var median = d3.quantile(data_sorted, 0.5);
        var q3 = d3.quantile(data_sorted, 0.75);
        var iqr = q3 - q1;
        var q_min = q1 - 1.5 * iqr;
        var q_max = q3 + 1.5 * iqr;

        var boxplot = svg.selectAll("boxline").data(data_sorted).enter();

        // Vertical Line
        boxplot
            .append("line")
            .attr("class", "boxPlot box-line")
            .attr("x1", (d) => {
                return x(sev) + x.bandwidth() / 2 + margin.left;
            })
            .attr("x2", (d) => {
                return x(sev) + x.bandwidth() / 2 + margin.left;
            })
            .attr("y1", y(min))
            .attr("y2", y(max))
            .attr("stroke", "black");
        // Box
        boxplot
            .append("rect")
            .attr("class", "boxPlot box-line")
            .attr("x", (d) => {
                return x(sev) + x.bandwidth() / 4 + margin.left;
            })
            .attr("y", y(q3))
            .attr("height", y(q1) - y(q3))
            .attr("width", x.bandwidth() / 2)
            .attr("stroke", "black")
            .style("fill", "#69b3a2");

        // Horizontal Lines
        for (const val of [min, median, max]) {
            boxplot
                .append("line")
                .attr("class", "boxPlot box-line")
                .attr("x1", (d) => {
                    return x(sev) + x.bandwidth() / 4 + margin.left;
                })
                .attr("x2", (d) => {
                    return x(sev) + (x.bandwidth() * 3) / 4 + margin.left;
                })
                .attr("y1", function (d) {
                    return y(val);
                })
                .attr("y2", function (d) {
                    return y(val);
                })
                .attr("stroke", "black");
        }
    }
};

function streamPlot(filePath) {
    var rowConverter = function (d) {
        return {
            Start_Time: d.Start_Time,
            State: d.State,
            City: d.City,
        };
    };
    var svg = d3
        .select("#q6_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const csv = d3.csv(filePath, rowConverter);
    csv.then(function (data) {

        var west = [
            "WA",
            "OR",
            "CA",
            "NV",
            "ID",
            "MT",
            "WY",
            "UT",
            "AZ",
            "CO",
            "NM",
        ];
        var midwest = [
            "ND",
            "SD",
            "NE",
            "KS",
            "MN",
            "IA",
            "MO",
            "WI",
            "IL",
            "MI",
            "IN",
            "OH",
        ];
        var northeast = [
            "PA",
            "NY",
            "VT",
            "NH",
            "ME",
            "MA",
            "CT",
            "RI",
            "NJ",
            "DE",
            "MD",
            "DC",
        ];
        var south = [
            "TX",
            "OK",
            "AR",
            "LA",
            "MS",
            "AL",
            "TN",
            "KY",
            "GA",
            "FL",
            "SC",
            "NC",
            "VA",
            "WV",
        ];
        var stateDict = {
            West: west,
            Midwest: midwest,
            Northeast: northeast,
            South: south,
        };

        var button = d3.select("#radio6").attr("name", "regions");
        var selectedCategory = String(
            document.querySelector("input[name=regions]:checked").value
        );

        // prepare data for stack
        var timeParser = d3.timeParse("%Y-%m-%d %H:%M:%S");

        var drawStreamGraph = function (data, region) {
            console.log("Drawing Stream Graph... be patient...");
            data = d3.filter(data, (d) => {
                return stateDict[region].includes(d.State) == true;
            });
            // keep data as string ready format ex. [2021-01-31 21:45:00]
            data = data.map((d) => {
                return {
                    Start_Time: d.Start_Time.slice(0, 19),
                    State: d.State,
                    City: d.City,
                };
            });
            console.log("Prepping data - formatted");

            data.sort((a, b) => {
                return timeParser(b.Start_Time) - timeParser(a.Start_Time);
            });
            var states = [...new Set(data.map((d) => d.State))];
            var times = [...new Set(data.map((d) => d.Start_Time))];

            // Group by month in d3 timeMonth parsed format
            var groups = d3.group(data, (d) =>
                d3.timeMonth(timeParser(d.Start_Time))
            );
            console.log("Prepping data - parsed");

            var preparedData = [];
            for (const time of times) {
                var obj = {
                    Start_Time: timeParser(time),
                };
                for (var state of states) {
                    var parseGroup = d3.timeMonth(timeParser(time));
                    var dataItems = groups.get(parseGroup);
                    obj[state] = d3.sum(dataItems, (d) => d.State == state);
                }
                preparedData.push(obj);
            }
            console.log("Prepping data - ready for stack");

            // Stack data
            var stackedData = d3
                .stack()
                .offset(d3.stackOffsetSilhouette)
                .keys(states)(preparedData);
            // Find max value
            var temp = stackedData[stackedData.length - 1];
            var max = d3.max(temp, (d) => Math.max(d[0], d[1])) * 2;

            var color = d3
                .scaleOrdinal([
                    "#a6cee3",
                    "#1f78b4",
                    "#b2df8a",
                    "#33a02c",
                    "#fb9a99",
                    "#e31a1c",
                    "#fdbf6f",
                    "#ff7f00",
                    "#cab2d6",
                    "#6a3d9a",
                    "#ffff99",
                    "#b15928",
                    "271033",
                    "02182b",
                    "f1ffe7",
                ])
                .domain(states);

            var x = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => timeParser(d.Start_Time)))
                .range([0, width - margin.right]);
            var y = d3.scaleLinear().domain([0, max]).range([height, 0]);

            makeAxis(svg, x, y, "streamPlot");

            // Draw graph
            svg.selectAll("myLayers")
                .data(stackedData)
                .enter()
                .append("path")
                .style("fill", function (d) {
                    return color(d.key);
                })
                .attr("class", "streamPlot")
                .attr(
                    "d",
                    d3
                        .area()
                        .x(function (d, i) {
                            return x(d.data.Start_Time) + margin.left;
                        })
                        .y0(function (d) {
                            return y(d[0]) - height / 2;
                        })
                        .y1(function (d) {
                            return y(d[1]) - height / 2;
                        })
                        .curve(d3.curveMonotoneX)
                );
            // Legend
            svg.selectAll("legendRect")
                .data(states)
                .enter()
                .append("rect")
                .attr("class", "streamPlot")
                .attr("x", width + 20)
                .attr("y", (d, i) => {
                    return 10 + 20 * i;
                })
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", (d) => color(d));
            svg.selectAll("legendText")
                .data(states)
                .enter()
                .append("text")
                .attr("class", "streamPlot")
                .text((d) => {
                    return d;
                })
                .attr("x", width + 35)
                .attr("y", (d, i) => {
                    return 20 + 20 * i;
                })
                .style("fill", (d) => color(d));
        };
        // # TODO: make smooth
        drawStreamGraph(data, selectedCategory);

        button.on("change", function (d) {
            d3.selectAll(".streamPlot")
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1)
                .transition()
                .duration(300)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .remove();
            selectedCategory = String(
                document.querySelector("input[name=regions]:checked").value
            );
            drawStreamGraph(data, selectedCategory);
        });
    });
}
