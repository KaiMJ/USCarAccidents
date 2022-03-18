function assignment2(){
    var filePath="cleanedData.csv";
    question1(filePath);
    question2(filePath);
    question3(filePath);
     question4(filePath);
    question5(filePath);
    question6("smallData.csv");
    question7(filePath);
}

//Question 1
var question1=function(filePath){

    var rowConverter = function(d){
        return {
            Start_Time: d.Start_Time,
            Accident: d.ID
        };
    }

    const data = d3.csv(filePath, rowConverter);


    data.then(function(data) {

        var parseTime = d3.timeParse("%Y");

        var data = data.map(function(d) {
          return {
            Hour: parseInt(d.Start_Time.match(/(?<![\d]{4}[-][\d]{2}[-]\d]{2}) \d\d/)[0]),//parseInt(d.Start_Time.match(/(?<![\d]{4}-)-(\d\d)(?=[-\d])/)[0].replace('-', '')),//parseInt(d.Start_Time.match(/(?<![\d]{4}[-][\d]{2}[-]\d]{2}) \d\d/)[0]),
            Year:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
            Accident: d.Accident
          }
        });
        //console.log(data)


        years = [2016,2017,2018,2019,2020,2021]
        hour = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23] // [1,2,3,4,5,6,7,8,9,10,11,12]//

        let rollup = d3.rollups(data, v => v.length, d => d.Year, d => d.Hour)
        let fm = [...rollup].flatMap(([k1, v1]) => [...v1].map(([k2, v2]) => ({Year: k1, Hour: k2, Count: v2})))
         
        console.log(fm)

        var yr;
        var hr;
        var s;
        var g ;
        var max = 0;
        var min = 9999999999999;
        let yrs = Array.from(d3.group(fm, d => d.Year).keys()).sort();
        var medals = new Array();
        for (let j = 0; j < yrs.length; j++){
            for (let i = 0; i < fm.length; i++){
                for (let k = 0; k < hour.length; k++)
                    if (yrs[j] == fm[i].Year && hour[k] == fm[i].Hour ) {
                        yr = yrs[j]
                        hr = hour[k] 
                        val = fm[i].Count
                        if (val > max){
                            max = val
                        }
                        if (val < min){
                            min = val
                        }
                        medals.push({Year:yr, Hour:hr,  val:val})      
                }
            }
                                
        } 
        medals = medals.sort(function(a,b) {return d3.ascending(a.Year,b.Year);});
        console.log(medals)

        var margin = {top: 80, right: 25, bottom: 30, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#q1_plot")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var myColor = d3.scaleSequential()
                    .interpolator(d3.interpolateInferno)
                    .domain([1,max])

    var Tooltip = d3.select("#q1_plot").append("div").style("opacity", 0).attr("class", "tooltip");
               
    var x = d3.scaleBand()
              .range([ 0, width ])
              .domain(hour)
              .padding(0.05);

    svg.append("g")
        .style("font-size", 12)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove()

    var y = d3.scaleBand()
                .range([ height, 0 ])
                .domain(years)
                .padding(0.05);

              svg.append("g")
                .style("font-size", 12)
                .call(d3.axisLeft(y).tickSize(0))
                .select(".domain").remove()


    svg.selectAll()
        .data(medals, function(d) {return d.group+':'+d.variable;})
        .enter()
        .append("rect")
          .attr("x", function(d) { return x(d.Hour) })
          .attr("y", function(d) { return y(d.Year) })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("width", x.bandwidth() )
          .attr("height", y.bandwidth() )
          .style("fill", function(d) { return myColor(d.val)} )
          .style("stroke-width", 4)
          .style("stroke", "none")
          .style("opacity", 0.8)
        .on('mouseover', function(event, d){
            d3.select(this).style("stroke", "black")
            Tooltip.style("visibility", "visible")
            Tooltip.html(d.val.toLocaleString('en-US')).style('left', event.pageX + 'px').style('top', event.pageY + 'px')
        })
        .on('mousemove', function(event, d){
            Tooltip.transition().duration(1).style('opacity', 0.8)//.transition().duration(100)
            Tooltip.html(d.val.toLocaleString('en-US')).style('left', event.pageX + 'px').style('top', event.pageY + 'px').style('opacity', 1)
        })
        .on('mouseout', function(d){
            d3.select(this).style("stroke", "none")
            Tooltip.style("visibility", "hidden")
        })



        // ADD X AND Y AXIS TITLES
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "middle")
            .attr("x", width/2 )
            .attr("y", height )
            .attr("dy", "1.75em")
            .text("Hour of Day").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");

        svg.append("text")
            .attr("class", "y_yabel")
            .attr("text-anchor", "end")
            .attr("x", -height/2 )
            .attr("y",-50)
            .attr("dy", "0.5em")
            .attr("dx", "1em")
            .attr("transform", "rotate(-90)")
            .text("Year").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");

        svg.append("text")
            .attr("x", 15+(width / 2))             
            .attr("y", -10)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Heatmap of Total Number of Accidents Per Year and Hour of The Day").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");

            
                });

    
}

var question2=function(filePath){

    var rowConverter = function(d){
        return {
            Start_Time: d.Start_Time,
            Accident: d.ID
        };
    }

     const data = d3.csv(filePath, rowConverter);
    // data.then(function(data){
    //     console.log(data);
    // });

    data.then(function(data) {

        var parseTime = d3.timeParse("%Y");

        var data = data.map(function(d) {
          return {
            Month: parseInt(d.Start_Time.match(/(?<![\d]{4}-)-(\d\d)(?=[-\d])/)[0].replace('-', '')),
            Year:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
            Accident: d.Accident
          }
        });
        //console.log(data)

        let rollup = d3.rollups(data, v => v.length, d => d.Year, d => d.Month)
        let fm = [...rollup].flatMap(([k1, v1]) => [...v1].map(([k2, v2]) => ({Year: k1, Month: k2, Count: v2})))
        let fm2 = fm.sort(function(a,b) {return d3.ascending(a.Month,b.Month);})
        console.log(fm2)

        fm3= d3.group(fm2, d => d.Year)

         var getDots=function(data){

            d3.select('#q2_plot').select('svg').remove()
            d3.select('#q2_title').select('text').remove()

            console.log(data)

            // var allGroup = [2011, 2012, 2013, 2014, 2015]

            // BAR PLOT
            var svgwidth = 500;
            var svgheight = 500;
            var padding = 70;

            var svg = d3.select("#q2_plot").append("svg")
                    .attr("width", svgwidth + padding)
                    .attr("height", svgheight + padding).append("g")
                    .attr("transform", "translate(" + padding + ",0)");

            // var xScale = d3.scaleBand()//                           .domain(d3.extent(data,d=>d.Month))
            //                .range([ 0, svgwidth-padding  ])
            //                .domain(data.map(function(d) { return d.Month;}));

            var formatxAxis = d3.format('.0f');

            var xScale = d3.scaleTime()
                           .domain(d3.extent(data,d=>d.Month))
                           .range([ 0, svgwidth-padding  ]);

            svg.append("g")
               .attr("transform", "translate(0," + svgheight + ")")
               .call(d3.axisBottom(xScale).tickFormat(formatxAxis).ticks(12))

            var yScale = d3.scaleLinear()
                           .domain([0,
                              d3.max(data, function(d){return d.Count;}) + padding*125])//d3.max(d.Count)+padding/3])
                           .range([svgheight,0]);

            svg.append("g")
            .transition().duration(1000)
            .call(d3.axisLeft(yScale));

            var Tooltip = d3.select("#q2_plot").append("div").style("opacity", 0).attr("class", "tooltip");


            svg.append('g')
            .selectAll(".q3circle")
                .data(data).enter().append("circle")
                .attr("cx", function(d,i){
                    return xScale(d.Month);
                })
                .attr("cy", function(d){
                    return yScale(d.Count);
                })
                .attr("r", 7)
                .attr("fill", "#0072b2")
                .on('mouseover', function(event, d){
                    d3.select(this).attr("stroke-width", 2).style("stroke", "black")
                    Tooltip.style("visibility", "visible")
                    Tooltip.html(d.Count).style('left', event.pageX + 'px').style('top', event.pageY + 'px')                
                })
                .on('mousemove', function(event, d){
                    Tooltip.transition().duration(1).style('opacity', 0.8)
                    Tooltip.html(d.Count).style('left', event.pageX + 'px').style('top', event.pageY + 'px').style('opacity', 1)
                })
                .on('mouseout', function(d){
                    d3.select(this).style("stroke", "none")
                    Tooltip.style("visibility", "hidden")
                })
            svg.append('path').datum(data).transition()
          .duration(1000)
                              .attr("fill", "none")
                              .attr("stroke", "#0072b2")
                              .attr("stroke-width", 1.5)
                              .attr("d", d3.line()
                                            .x(function(d) { return xScale(d.Month)})
                                            .y(function(d) { return yScale(d.Count) })
                                    )

            // ADD X AND Y AXIS TITLES
            svg.append("text")
                .attr("class", "x_label")
                .attr("text-anchor", "middle")
                .attr("x", svgwidth/2 - padding/2)
                .attr("y", svgheight )
                .attr("dy", "2.35em")
                .text("Month").attr("font-family", "sans-serif").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", "black");

            svg.append("text")
                .attr("class", "y_yabel")
                .attr("text-anchor", "end")
                .attr("x", -svgheight/2 )
                .attr("y",-padding)
                .attr("dy", "1.6em")
                .attr("dx", "3.5em")
                .attr("transform", "rotate(-90)")
                .text("Number of Accidents").attr("font-family", "sans-serif").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", "black");

                    d3.select("#q2_title").append("text").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black")
        .attr("x", (svgwidth / 2))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")
        .style("font-weight", "bold")  
        .text("Total Number of Accidents Per Month").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");




        }


        // console.log(fm3.get(2016))
       getDots(fm3.get(2016),2016)
        d3.select("#radio").attr('name','year').on("change",d=>{
            console.log(d.target.value);
            var year = parseInt(d.target.value)
            getDots(fm3.get(year),year)
            console.log(fm3.get(year))
        })

    });

    
    
}

var question3=function(filePath){


    var rowConverter = function(d){
        return {
            Start_Time: d.Start_Time,
            Accident: d.ID
        };
    }

     const data = d3.csv(filePath, rowConverter);
    // data.then(function(data){
    //     console.log(data);
    // });

    data.then(function(data) {



    var yr_data = data.map(function(d) {
          return {
            time:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
           // Month: parseInt(d.Start_Time.match(/(?<![\d]{4}-)-(\d\d)(?=[-\d])/)[0].replace('-', '')),
            Accident: d.Accident
          }

    });

    var mn_data = data.map(function(d) {
          return {
            //Year:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
            time: parseInt(d.Start_Time.match(/(?<![\d]{4}-)-(\d\d)(?=[-\d])/)[0].replace('-', '')),
            Accident: d.Accident
          }
    });

    var hr_data = data.map(function(d) {
          return {
            time: parseInt(d.Start_Time.match(/(?<![\d]{4}[-][\d]{2}[-]\d]{2}) \d\d/)[0]),
            //Year:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
            //Month: parseInt(d.Start_Time.match(/(?<![\d]{4}-)-(\d\d)(?=[-\d])/)[0].replace('-', '')),
            Accident: d.Accident
          }
    });




    var getBars=function(data, str){

        d3.select('#q3_plot').select('svg').remove()
         d3.select('#q3_title').select('text').remove()


        console.log(data)
        
        // Participation value counts for each year for Females After 1980
        var val_cnts = d3.rollups(data,
                                  xs => d3.count(xs, x => x.time),
                                  d => d.time
                                 ).map(([k, v]) => ({ time: k, Count: v })).sort(function(a,b) {return d3.ascending(a.time,b.time);});

        //console.log(val_cnts);


        //console.log(val_cnts);

        // BAR PLOT
        var svgwidth = 500;
        var svgheight = 500;
        var padding = 70;

        var svg = d3.select("#q3_plot").append("svg")
                    .attr("width", svgwidth + padding)
                    .attr("height", svgheight + padding).append("g")
                    .attr("transform", "translate(" + padding + ",0)");

        // X axis
        var xScale = d3.scaleBand()
                       .range([ 0, svgwidth - padding])
                       .domain(val_cnts.map(function(d) { return d.time;})).padding(0.2);

        svg.append("g").transition().duration(1000)
           .attr("transform", "translate(0," + svgheight + ")")
           .call(d3.axisBottom(xScale))


        // Y axis
        var yScale = d3.scaleLinear()
                       .domain([0,
                                d3.max(val_cnts, function(d){return d.Count;})+ padding*100])
                       .range([svgheight,0]);
        
        svg.append("g").transition().duration(1000)
        .call(d3.axisLeft(yScale));

        // Bars
        svg.selectAll("mybar")
           .data(val_cnts)
           .enter()
           .append("rect").transition()
          .duration(1000)
           .attr("x", function(d) { return xScale(d.time);})
           .attr("y", function(d) { return yScale(d.Count);})
           .attr("width", xScale.bandwidth())
           .attr("height", function(d) { return svgheight - yScale(d.Count); })
           .attr("fill", "#d55e00")                


                    // ADD X AND Y AXIS TITLES
            svg.append("text")
                .attr("class", "x_label")
                .attr("text-anchor", "middle")
                .attr("x", svgwidth/2 - padding/2)
                .attr("y", svgheight )
                .attr("dy", "2.35em")
                .text(str).attr("font-family", "sans-serif").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", "black");

            svg.append("text")
                .attr("class", "y_yabel")
                .attr("text-anchor", "end")
                .attr("x", -svgheight/2 )
                .attr("y",-padding)
                .attr("dy", "1.5em")
                .attr("dx", "4.5em")
                .attr("transform", "rotate(-90)")
                .text("Number of Accidents").attr("font-family", "sans-serif").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", "black");

        d3.select("#q3_title").append("text").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black")
        .attr("x", (svgwidth / 2))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")
        .style("font-weight", "bold")  
        .text("Total Number of Accidents Per Month/Year/Hour of Day").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");


                



        }

                // console.log(fm3.get(2016))
       getBars(yr_data, 'Year')
        d3.select("#radio_q3").attr('name','time').on("change",d=>{
            console.log(d.target.value);
            var str = d.target.value
            if (str == 'Year'){
                getBars(yr_data, str)
            } else if (str == 'Month'){
                getBars(mn_data, str)
            } else if (str == 'Hour'){
                getBars(hr_data, str)
            }
            
        })

    })

    
}

var question4=function(filePath){

  var rowConverter = function(d){
    if ((parseInt(d.Severity)== 4)){
        return {
            

            'Wind_Speed': parseFloat(d['Wind_Speed(mph)']),
            'Temperature': parseFloat(d['Temperature(F)']),
            'Precipitation': parseFloat(d['Precipitation(in)']),
            'Pressure': parseFloat(d['Pressure(in)']),
            'Visibility': parseFloat(d['Visibility(mi)']),
            'Humidity': parseFloat(d['Humidity(%)'])

        }
     }
    }

    const data = d3.csv(filePath, rowConverter);
    // data.then(function(data){
    //     console.log(data);
    // });

    data.then(function(data) {


       // change_axis('none', 'none', data)



var margin = {top: 25, right: 30, bottom: 50, left: 60},
    width = 760 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;


      var svg = d3.select("#q4_plot")
                  .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform",
                          "translate(" + margin.left + "," + margin.top + ")");

                console.log(d3.min(data, function(d){return d.Temperature;}))
                var xScale = d3.scaleLinear()
                       .range([ 0, width-margin.right])
                       .domain([0, d3.max(data, function(d){return d.Humidity;})])


                svg.append("g")
                   .attr("transform", "translate(0," + height + ")")
                   .call(d3.axisBottom(xScale))

                var yScale = d3.scaleLinear()
                       .range([ height, 0])
                       .domain([d3.min(data, function(d){return d.Temperature;})-10, d3.max(data, function(d){return d.Temperature;})+10])

                svg.append("g").call(d3.axisLeft(yScale));


                  svg
                    .selectAll("dot")
                     .data(data)
                     .enter()
                     .append("circle")
                       .attr("cx", function (d) { return xScale(d.Humidity); } )
                       .attr("cy", function (d) { return yScale(d.Temperature); } )
                       .attr("r", 1.5)
                       .style("fill", "#1f77B4")



        // ADD X AND Y AXIS TITLES
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "middle")
            .attr("x", width/2 )
            .attr("y", height )
            .attr("dy", "2.5em")
            .text("Percent Humidity").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");

        svg.append("text")
            .attr("class", "y_yabel")
            .attr("text-anchor", "end")
            .attr("x", -height/2 + 90 )
            .attr("y",-50)
            .attr("dy", "0.5em")
            .attr("dx", "0em")
            .attr("transform", "rotate(-90)")
            .text("Temperature (Degrees Farenheight)").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");

        svg.append("text")
            .attr("x", 15+(width / 2))             
            .attr("y", -10)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Scatterplot of Temperature vs Humidity for The Most Severe Accidents").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");




    });
   
}


var question5=function(filePath){

    var rowConverter = function(d){
        return {
            Severity: d.Severity,
            'Temperature': parseFloat(d['Temperature(F)'])
        };
    }

    const data = d3.csv(filePath, rowConverter);
    // data.then(function(data){
    //     console.log(data);
    // });

    data.then(function(data) {


    var f = []
    data.map(function(d) {
            if (d.Severity == 1){
                            f.push(d.Temperature);
            }

        })

    //console.log(f)

    // Compute summary statistics used for the box:
    var data_sorted = f.sort(d3.ascending)
    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)
    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1
    var min = q1 - 1.5 * interQuantileRange
    var max = q3 + 1.5 * interQuantileRange

    var margin = {top: 25, right: 50, bottom: 30, left: 50},
  width = 700 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#q5_plot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  // Show the X scale
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(["1 (least severe)", "2", "3", "4 (most severe)"])
    // .paddingInner(1)
    // .paddingOuter(.5)
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

    console.log(x)

  var y = d3.scaleLinear()
  .domain([-20,max+20])
  .range([height, 0]);
svg.append("g").call(d3.axisLeft(y))

// a few features for the box
var center =  [75, 225,375, 525]//[200, 400,600, 800]//[70, 220,370, 520]//[100, 250,400, 550]
var width = 100

// Show the main vertical line
svg
.append("line")
  .attr("x1", center[0])
  .attr("x2", center[0])
  .attr("y1", y(min) )
  .attr("y2", y(max) )
  .attr("stroke", "black")

// Show the box
svg
.append("rect")
  .attr("x", center[0] - width/2)
  .attr("y", y(q3) )
  .attr("height", (y(q1)-y(q3)) )
  .attr("width", width )
  .attr("stroke", "black")
  .style("fill", "#69b3a2")

// show median, min and max horizontal lines
svg
.selectAll("toto")
.data([min, median, max])
.enter()
.append("line")
  .attr("x1", center[0]-width/2)
  .attr("x2", center[0]+width/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "black")


  var f = []
    data.map(function(d) {
            if (d.Severity == 2){
                            f.push(d.Temperature);
            }

        })

    //console.log(f)

    // Compute summary statistics used for the box:
    var data_sorted = f.sort(d3.ascending)
    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)
    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1
    var min = q1 - 1.5 * interQuantileRange
    var max = q3 + 1.5 * interQuantileRange

// Show the main vertical line
svg
.append("line")
  .attr("x1", center[1])
  .attr("x2", center[1])
  .attr("y1", y(min) )
  .attr("y2", y(max) )
  .attr("stroke", "black")
// Show the box
svg
.append("rect")
  .attr("x", center[1] - width/2)
  .attr("y", y(q3) )
  .attr("height", (y(q1)-y(q3)) )
  .attr("width", width )
  .attr("stroke", "black")
  .style("fill", "#69b3a2")

// show median, min and max horizontal lines
svg
.selectAll("toto")
.data([min, median, max])
.enter()
.append("line")
  .attr("x1", center[1]-width/2)
  .attr("x2", center[1]+width/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "black")

  var f = []
    data.map(function(d) {
            if (d.Severity == 3){
                            f.push(d.Temperature);
            }

        })

    //console.log(f)

    // Compute summary statistics used for the box:
    var data_sorted = f.sort(d3.ascending)
    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)
    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1
    var min = q1 - 1.5 * interQuantileRange
    var max = q3 + 1.5 * interQuantileRange

// Show the main vertical line
svg
.append("line")
  .attr("x1", center[2])
  .attr("x2", center[2])
  .attr("y1", y(min) )
  .attr("y2", y(max) )
  .attr("stroke", "black")
// Show the box
svg
.append("rect")
  .attr("x", center[2] - width/2)
  .attr("y", y(q3) )
  .attr("height", (y(q1)-y(q3)) )
  .attr("width", width )
  .attr("stroke", "black")
  .style("fill", "#69b3a2")

// show median, min and max horizontal lines
svg
.selectAll("toto")
.data([min, median, max])
.enter()
.append("line")
  .attr("x1", center[2]-width/2)
  .attr("x2", center[2]+width/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "black")

    var f = []
    data.map(function(d) {
            if (d.Severity == 4){
                            f.push(d.Temperature);
            }

        })

    //console.log(f)

    // Compute summary statistics used for the box:
    var data_sorted = f.sort(d3.ascending)
    var q1 = d3.quantile(data_sorted, .25)
    var median = d3.quantile(data_sorted, .5)
    var q3 = d3.quantile(data_sorted, .75)
    var interQuantileRange = q3 - q1
    var min = q1 - 1.5 * interQuantileRange
    var max = q3 + 1.5 * interQuantileRange

// Show the main vertical line
svg
.append("line")
  .attr("x1", center[3])
  .attr("x2", center[3])
  .attr("y1", y(min) )
  .attr("y2", y(max) )
  .attr("stroke", "black")
// Show the box
svg
.append("rect")
  .attr("x", center[3] - width/2)
  .attr("y", y(q3) )
  .attr("height", (y(q1)-y(q3)) )
  .attr("width", width )
  .attr("stroke", "black")
  .style("fill", "#69b3a2")

// show median, min and max horizontal lines
svg
.selectAll("toto")
.data([min, median, max])
.enter()
.append("line")
  .attr("x1", center[3]-width/2)
  .attr("x2", center[3]+width/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "black")


            // ADD X AND Y AXIS TITLES
    svg.append("text")
        .attr("class", "x_label")
        .attr("text-anchor", "middle")
        .attr("x", 300)
        .attr("y", height )
        .attr("dy", "1.85em")
        .text("Severity Category").attr("font-family", "sans-serif").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", "black");

    svg.append("text")
        .attr("class", "y_yabel")
        .attr("text-anchor", "end")
        .attr("x", -height/2 )
        .attr("y",-50)
        .attr("dy", "1em")
        .attr("dx", "7em")
        .attr("transform", "rotate(-90)")
        .text("Temperature (Degrees Farenheight)").attr("font-family", "sans-serif").attr("font-size", "13px").attr("font-weight", "bold").attr("fill", "black");


        svg.append("text")
            .attr("x", 310)             
            .attr("y", -10)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Boxplots for Temperature for Each Severness Category").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");




    });


}


// //
var question6=function(filePath){
    var margin = { top: 50, right: 100, bottom: 50, left: 130 };
    var width = 1300 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var rowConverter = function (d) {
        return {
            Start_Time: d.Start_Time,
            State: d.State,
            City: d.City,
        };
    };
        d3.select("#q6_title").append("text").attr("font-family", "sans-serif").attr("font-size", "19px").attr("font-weight", "bold").attr("fill", "black")
        .attr("x", (width / 2))             
        .attr("y", 0)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")
        .style("font-weight", "bold")  
        .text("Streamgraph for Total Number of Accidents Per States in U.S. Region").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");



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
                    "#c7a022",
                    "#b15928",
                    "#271033",
                    "#02182b",


                ])
                .domain(states);

            var x = d3
                .scaleTime()
                .domain(d3.extent(data, (d) => timeParser(d.Start_Time)))
                .range([0, width]);
            var y = d3.scaleLinear().domain([0, max]).range([height, 0]);

            // Add clip
            var clip = svg
                .append("defs")
                .append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("width", width)
                .attr("height", height)
                .attr("x", margin.left)
                .attr("y", 0);

            // Add brush
            var brush = d3
                .brushX()
                .extent([
                    [margin.left, 0],
                    [width+margin.left, height],
                ])
                .on("end", updateChart);

            var stream = svg.append("g").attr("clip-path", "url(#clip)");
            var xAxis = d3.axisBottom().scale(x);
            var yAxis = d3.axisLeft().scale(y);

            var x_ax = svg
                .append("g")
                .attr("class", `axis streamPlot xAxis`)
                .attr("transform", `translate(${margin.left}, ${height})`)
                .call(xAxis);
            var y_ax = svg
                .append("g")
                .attr("class", `axis streamPlot`)
                .attr("transform", `translate(${margin.left}, ${0})`)
                .call(yAxis);

            // A function that set idleTimeOut to null
            var idleTimeout;
            function idled() {
                idleTimeout = null;
            }
            function updateChart(e) {
                extent = e.selection;
                console.log(extent)

                // If no selection, back to initial coordinate. Otherwise, update X axis domain
                if (!extent) {
                    if (!idleTimeout)
                        return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
                    x.domain(d3.extent(data, (d) => timeParser(d.Start_Time)));
                } else {
                    x.domain([
                        x.invert(extent[0] - margin.left),
                        x.invert(extent[1] - margin.left),
                    ])
                    stream.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
                }

                // Update axis and circle position
                x_ax.transition().duration(1000).call(d3.axisBottom().scale(x));
                stream
                    .selectAll(".streamPath")
                    .transition()
                    .duration(1000)
                    .attr(
                        "d",
                        d3
                            .area()
                            .x(function (d, i) {
                                return x(d.data.Start_Time) + margin.left * 2;
                            })
                            .y0(function (d) {
                                return y(d[0]) - height / 2;
                            })
                            .y1(function (d) {
                                return y(d[1]) - height / 2;
                            })
                            .curve(d3.curveMonotoneX)
                    )
                    .attr("transform", `translate(${-margin.left}, 0)`);
            }

            // Draw graph
            stream
                .selectAll("myLayers")
                .data(stackedData)
                .enter()
                .append("path")
                .style("fill", function (d) {
                    return color(d.key);
                })
                .attr("class", "streamPlot streamPath")
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
            // Add brush
            stream.append("g").attr("class", "brush").call(brush);
            // Legend
            svg.selectAll("legendRect")
                .data(states)
                .enter()
                .append("rect")
                .attr("class", "streamPlot")
                .attr("x", 0)
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
                .attr("x", 20)
                .attr("y", (d, i) => {
                    return 20 + 20 * i;
                })
                .style("fill", (d) => color(d));

                  // ADD X AND Y AXIS TITLES
        svg.append("text")
            .attr("class", "x_label")
            .attr("text-anchor", "middle")
            .attr("x", width/2  +100)
            .attr("y", height )
            .attr("dy", "2.5em")
            .text("Time").attr("font-family", "sans-serif").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", "black");

        svg.append("text")
            .attr("class", "y_yabel")
            .attr("text-anchor", "end")
            .attr("x", -height/2 + 90 )
            .attr("y",-50)
            .attr("dy", "9em")
            .attr("dx", "1em")
            .attr("transform", "rotate(-90)")
            .text("Number of Accidents Per Month").attr("font-family", "sans-serif").attr("font-size", "14px").attr("font-weight", "bold").attr("fill", "black");




        };

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

var question7=function(filePath){
        var rowConverter = function (d) {
        return {
            Start_Time:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
            State: d.State

        };
    };
    const csv = d3.csv(filePath, rowConverter);
    

            //Width and height
            var w = 800;
            var h = 450;

            //Define map projection
            var projection = d3.geoAlbersUsa()
                                   .translate([w/2, h/2 +20])
                                   .scale([900]);

            //Define path generator
            var path = d3.geoPath()
                             .projection(projection);
                             
            //Define quantize scale to sort data values into buckets of color
            var color = d3.scaleQuantize()
                                .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
                                //Colors derived from ColorBrewer, by Cynthia Brewer, and included in
                                //https://github.com/d3/d3-scale-chromatic

            //Create SVG element
            var svg = d3.select("#q7_plot")
                        .append("svg")
                        .attr("width", w)
                        .attr("height", h);

            var lowColor =  "#D3EDF9"//'#ffe6e6'//'#f9f9f9'
            var highColor = "#004E71"//'#ff1919'//'#bc2a66'


// Load in my states data!
csv.then(function (data) {

            var states = [...new Set(data.map((d) => d.State))];
        var bs = d3.rollup(data, v => v.length, d => d.State)
       console.log(bs)
                  const output = Array.from(bs).map(([State, Count]) => ({State, Count}));
    console.log(output)


    var ramp = d3.scaleLinear().domain([d3.min(output, function(d) { return d.Count; }), d3.max(output, function(d) { return d.Count; })]).range([lowColor,highColor])



                d3.json("us-states.json").then(function(json){
                    console.log('hi')
                    //Merge the ag. data and GeoJSON
                    //Loop through once for each ag. data value
                    for (var i = 0; i < output.length; i++) {
                
                        //Grab state name
                        var dataState = output[i].State;
                        
                        //Grab data value, and convert from string to float
                        var dataValue = parseFloat(output[i].Count);

                        console.log(dataState)
                
                        //Find the corresponding state inside the GeoJSON
                        for (var j = 0; j < json.features.length; j++) {
                        
                            var jsonState = json.features[j].properties.name;
                
                            if (dataState == jsonState) {
                        
                                //Copy the data value into the JSON
                                json.features[j].properties.value = dataValue;
                                
                                //Stop looking through the JSON
                                break;
                                
                            }
                        }       
                    }

                    //Bind data and create one path per GeoJSON feature
                    svg.selectAll("path")
                       .data(json.features)
                       .enter()
                       .append("path")
                       .attr("d", path)
                        .style("stroke", "#fff")
                        .style("stroke-width", "1")
                       .style("fill", function(d) {
                            //Get data value
                            var value = d.properties.value;
                            
                            if (value) {
                                //If value exists…
                                return ramp(value);
                            } else {
                                //If value is undefined…
                                return "#ccc";
                            }
                       });

            svg.append("text")
            .attr("x", 460)             
            .attr("y", 15)
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .text("Chloropleth for Total Number of Accidents Per U.S. States").attr("font-family", "sans-serif").attr("font-size", "15px").attr("font-weight", "bold").attr("fill", "black");

                            // add a legend
        var w = 140, h = 220;

        var key = d3.select("#q7_plot")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .attr("class", "legend");



        var legend = key.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", highColor)
            .attr("stop-opacity", 1);
            
        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", lowColor)
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,-20)");

        var y = d3.scaleLinear()
            .range([h, 20])
            .domain([d3.min(output, function(d) { return d.Count; }), d3.max(output, function(d) { return d.Count; })]);

        var yAxis = d3.axisRight(y);

        key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(41,-20)")
            .call(yAxis)
            
                });

       });


  
}
   
