var margin = { top: 50, right: 100, bottom: 50, left: 100 };
var width = 800 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

function plot() {
    var filePath = "../cleanData.csv";
    var filePath = "../smallData.csv";
    boxPlot(filePath)
    // streamPlot(filePath);
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
        var button = d3.select("#radio").attr("name", "env_factor");
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

            makeAxis(svg, x, y);
            addBoxPlot(svg, data, selectedCategory, x, y);
        });
    });
}

var makeAxis = function (svg, x, y) {
    var xAxis = d3.axisBottom().scale(x);
    var yAxis = d3.axisLeft().scale(y);

    var xAxis = svg
        .append("g")
        .attr("class", "axis boxPlot")
        .attr("transform", `translate(${margin.left}, ${height})`)
        .call(xAxis);
    var yAxis = svg
        .append("g")
        .attr("class", "axis boxPlot")
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
        var states = [...new Set(data.map((d) => d.State))];
        var timeParser = d3.timeParse("%Y-%m-%d %H:%M:%S");

        var max;

        var x = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => timeParser(d.Start_Time)))
            .range([0, width - margin.right]);
        var y = d3.scaleLinear().domain([-10000, 10000]).range([height, 0]);
        // makeAxis(svg, x, y);

        var stackedData = d3
            .stack()
            .offset(d3.stackOffsetSilhouette)
            .keys(states)(data);

        var color = d3
            .scaleSequential()
            .domain(states)
            .interpolator(d3.interpolateViridis);

        // console.log(stackedData);

        // svg.selectAll("mylayers")
        //     .data(stackedData)
        //     .enter()
        //     .append("path")
        //     .style("fill", function (d) {
        //         return color(d.key);
        //     })
        //     .attr(
        //         "d",
        //         d3
        //             .area()
        //             .x(function (d, i) {
        //                 return x(d.data.Start_Time);
        //             })
        //             .y0(function (d) {
        //                 return y(d);
        //             })
        //             .y1(function (d) {
        //                 return y(d[1]);
        //             })
        //     );

        // addBoxPlot(data, selectedCategory, x, y);
    });
}
