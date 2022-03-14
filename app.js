function assignment2(){
    var filePath="cleanData.csv";
    question1(filePath);
    question2(filePath);
    question3(filePath);
    question4(filePath);
    question5(filePath);
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
    data.then(function(data){
        console.log(data);
    });

    data.then(function(data) {

        var parseTime = d3.timeParse("%Y");

        var data = data.map(function(d) {
          return {
            Hour: parseInt(d.Start_Time.match(/(?<![\d]{4}[-][\d]{2}[-]\d]{2}) \d\d/)[0]),
            Year:  parseInt(d.Start_Time.match(/.{0,4}/)[0]),
            Accident: d.Accident
          }
        });
        console.log(data)


        years = [2016,2017,2018,2019,2020,2021]
        hour = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]

        let rollup = d3.rollups(data, v => v.length, d => d.Year, d => d.Hour)
        let fm = [...rollup].flatMap(([k1, v1]) => [...v1].map(([k2, v2]) => ({Year: k1, Hour: k2, Count: v2})))
         

        console.log(Array.from(fm.values()))

const chartSettings = {
    width: 500,
    height: 400,
    padding: 40,
    titlePadding: 5,
    columnPadding: 0.4,
    ticksInXAxis: 5,
    duration: 3500,
    ...extendedSettings
  };

  chartSettings.innerWidth = chartSettings.width - chartSettings.padding * 2;
  chartSettings.innerHeight = chartSettings.height - chartSettings.padding * 2;

  const chartDataSets = [];
  let chartTransition;
  let timerStart, timerEnd;
  let currentDataSetIndex = 0;
  let elapsedTime = chartSettings.duration;

  const chartContainer = d3.select(`#${chartId} .chart-container`);
  const xAxisContainer = d3.select(`#${chartId} .x-axis`);
  const yAxisContainer = d3.select(`#${chartId} .y-axis`);

  const xAxisScale = d3.scaleLinear().range([0, chartSettings.innerWidth]);

  const yAxisScale = d3
    .scaleBand()
    .range([0, chartSettings.innerHeight])
    .padding(chartSettings.columnPadding);

  d3.select(`#${chartId}`)
    .attr("width", chartSettings.width)
    .attr("height", chartSettings.height);

  chartContainer.attr(
    "transform",
    `translate(${chartSettings.padding} ${chartSettings.padding})`
  );

  chartContainer
    .select(".current-date")
    .attr(
      "transform",
      `translate(${chartSettings.innerWidth} ${chartSettings.innerHeight})`
    );

  function draw({ dataSet, date: currentDate }, transition) {
    const { innerHeight, ticksInXAxis, titlePadding } = chartSettings;
    const dataSetDescendingOrder = dataSet.sort(
      ({ value: firstValue }, { value: secondValue }) =>
        secondValue - firstValue
    );

    chartContainer.select(".current-date").text(currentDate);

    xAxisScale.domain([0, dataSetDescendingOrder[0].value]);
    yAxisScale.domain(dataSetDescendingOrder.map(({ name }) => name));

    xAxisContainer.transition(transition).call(
      d3
        .axisTop(xAxisScale)
        .ticks(ticksInXAxis)
        .tickSize(-innerHeight)
    );

    yAxisContainer
      .transition(transition)
      .call(d3.axisLeft(yAxisScale).tickSize(0));

    // The general update Pattern in d3.js

    // Data Binding
    const barGroups = chartContainer
      .select(".columns")
      .selectAll("g.column-container")
      .data(dataSetDescendingOrder, ({ name }) => name);

    // Enter selection
    const barGroupsEnter = barGroups
      .enter()
      .append("g")
      .attr("class", "column-container")
      .attr("transform", `translate(0,${innerHeight})`);

    barGroupsEnter
      .append("rect")
      .attr("class", "column-rect")
      .attr("width", 0)
      .attr("height", yAxisScale.step() * (1 - chartSettings.columnPadding));

    barGroupsEnter
      .append("text")
      .attr("class", "column-title")
      .attr("y", (yAxisScale.step() * (1 - chartSettings.columnPadding)) / 2)
      .attr("x", -titlePadding)
      .text(({ name }) => name);

    barGroupsEnter
      .append("text")
      .attr("class", "column-value")
      .attr("y", (yAxisScale.step() * (1 - chartSettings.columnPadding)) / 2)
      .attr("x", titlePadding)
      .text(0);

    // Update selection
    const barUpdate = barGroupsEnter.merge(barGroups);

    barUpdate
      .transition(transition)
      .attr("transform", ({ name }) => `translate(0,${yAxisScale(name)})`)
      .attr("fill", "normal");

    barUpdate
      .select(".column-rect")
      .transition(transition)
      .attr("width", ({ value }) => xAxisScale(value));

    barUpdate
      .select(".column-title")
      .transition(transition)
      .attr("x", ({ value }) => xAxisScale(value) - titlePadding);

    barUpdate
      .select(".column-value")
      .transition(transition)
      .attr("x", ({ value }) => xAxisScale(value) + titlePadding)
      .tween("text", function({ value }) {
        const interpolateStartValue =
          elapsedTime === chartSettings.duration
            ? this.currentValue || 0
            : +this.innerHTML;

        const interpolate = d3.interpolate(interpolateStartValue, value);
        this.currentValue = value;

        return function(t) {
          d3.select(this).text(Math.ceil(interpolate(t)));
        };
      });

    // Exit selection
    const bodyExit = barGroups.exit();

    bodyExit
      .transition(transition)
      .attr("transform", `translate(0,${innerHeight})`)
      .on("end", function() {
        d3.select(this).attr("fill", "none");
      });

    bodyExit
      .select(".column-title")
      .transition(transition)
      .attr("x", 0);

    bodyExit
      .select(".column-rect")
      .transition(transition)
      .attr("width", 0);

    bodyExit
      .select(".column-value")
      .transition(transition)
      .attr("x", titlePadding)
      .tween("text", function() {
        const interpolate = d3.interpolate(this.currentValue, 0);
        this.currentValue = 0;

        return function(t) {
          d3.select(this).text(Math.ceil(interpolate(t)));
        };
      });

    return this;
  }

  function addDataset(dataSet) {
    chartDataSets.push(dataSet);

    return this;
  }

  function addDatasets(dataSets) {
    chartDataSets.push.apply(chartDataSets, dataSets);

    return this;
  }

  function setTitle(title) {
    d3.select(".chart-title")
      .attr("x", chartSettings.width / 2)
      .attr("y", -chartSettings.padding / 2)
      .text(title);

    return this;
  }

  /* async function render() {
    for (const chartDataSet of chartDataSets) {
      chartTransition = chartContainer
        .transition()
        .duration(chartSettings.duration)
        .ease(d3.easeLinear);

      draw(chartDataSet, chartTransition);

      await chartTransition.end();
    }
  } */

  async function render(index = 0) {
    currentDataSetIndex = index;
    timerStart = d3.now();

    chartTransition = chartContainer
      .transition()
      .duration(elapsedTime)
      .ease(d3.easeLinear)
      .on("end", () => {
        if (index < chartDataSets.length) {
          elapsedTime = chartSettings.duration;
          render(index + 1);
        } else {
          d3.select("button").text("Play");
        }
      })
      .on("interrupt", () => {
        timerEnd = d3.now();
      });

    if (index < chartDataSets.length) {
      draw(chartDataSets[index], chartTransition);
    }

    return this;
  }

  function stop() {
    d3.select(`#${chartId}`)
      .selectAll("*")
      .interrupt();

    return this;
  }

  function start() {
    elapsedTime -= timerEnd - timerStart;

    render(currentDataSetIndex);

    return this;
  }

  return {
    addDataset,
    addDatasets,
    render,
    setTitle,
    start,
    stop
  };
  
   //   svg.append('g')
   //     .attr('class', 'axis xAxis')
   //     .attr('transform', `translate(0, ${margin.top})`)
   //     .call(xAxis)
   //     .selectAll('.tick line')
   //     .classed('origin', d => d == 0);
  
   //   svg.selectAll('rect.bar')
   //      .data(yearSlice, d => d.name)
   //      .enter()
   //      .append('rect')
   //      .attr('class', 'bar')
   //      .attr('x', x(0)+1)
   //      .attr('width', d => x(d.value)-x(0)-1)
   //      .attr('y', d => y(d.rank)+5)
   //      .attr('height', y(1)-y(0)-barPadding)
   //      .style('fill', d => d.colour);
      
   //   svg.selectAll('text.label')
   //      .data(yearSlice, d => d.name)
   //      .enter()
   //      .append('text')
   //      .attr('class', 'label')
   //      .attr('x', d => x(d.value)-8)
   //      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
   //      .style('text-anchor', 'end')
   //      .html(d => d.name);
      
   //  svg.selectAll('text.valueLabel')
   //    .data(yearSlice, d => d.name)
   //    .enter()
   //    .append('text')
   //    .attr('class', 'valueLabel')
   //    .attr('x', d => x(d.value)+5)
   //    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
   //    .text(d => d3.format(',.0f')(d.lastValue));

   //  let yearText = svg.append('text')
   //    .attr('class', 'yearText')
   //    .attr('x', width-margin.right)
   //    .attr('y', height-25)
   //    .style('text-anchor', 'end')
   //    .html(~~year)
   //    .call(halo, 10);
     
   // let ticker = d3.interval(e => {

   //    yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
   //      .sort((a,b) => b.value - a.value)
   //      .slice(0,top_n);

   //    yearSlice.forEach((d,i) => d.rank = i);
     
   //    //console.log('IntervalYear: ', yearSlice);

   //    x.domain([0, d3.max(yearSlice, d => d.value)]); 
     
   //    svg.select('.xAxis')
   //      .transition()
   //      .duration(tickDuration)
   //      .ease(d3.easeLinear)
   //      .call(xAxis);
    
   //     let bars = svg.selectAll('.bar').data(yearSlice, d => d.name);
    
   //     bars
   //      .enter()
   //      .append('rect')
   //      .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
   //      .attr('x', x(0)+1)
   //      .attr( 'width', d => x(d.value)-x(0)-1)
   //      .attr('y', d => y(top_n+1)+5)
   //      .attr('height', y(1)-y(0)-barPadding)
   //      .style('fill', d => d.colour)
   //      .transition()
   //        .duration(tickDuration)
   //        .ease(d3.easeLinear)
   //        .attr('y', d => y(d.rank)+5);
          
   //     bars
   //      .transition()
   //        .duration(tickDuration)
   //        .ease(d3.easeLinear)
   //        .attr('width', d => x(d.value)-x(0)-1)
   //        .attr('y', d => y(d.rank)+5);
            
   //     bars
   //      .exit()
   //      .transition()
   //        .duration(tickDuration)
   //        .ease(d3.easeLinear)
   //        .attr('width', d => x(d.value)-x(0)-1)
   //        .attr('y', d => y(top_n+1)+5)
   //        .remove();

   //     let labels = svg.selectAll('.label')
   //        .data(yearSlice, d => d.name);
     
   //     labels
   //      .enter()
   //      .append('text')
   //      .attr('class', 'label')
   //      .attr('x', d => x(d.value)-8)
   //      .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
   //      .style('text-anchor', 'end')
   //      .html(d => d.name)    
   //      .transition()
   //        .duration(tickDuration)
   //        .ease(d3.easeLinear)
   //        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
             
    
   //     labels
   //        .transition()
   //        .duration(tickDuration)
   //          .ease(d3.easeLinear)
   //          .attr('x', d => x(d.value)-8)
   //          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
     
   //     labels
   //        .exit()
   //        .transition()
   //          .duration(tickDuration)
   //          .ease(d3.easeLinear)
   //          .attr('x', d => x(d.value)-8)
   //          .attr('y', d => y(top_n+1)+5)
   //          .remove();
         

     
   //     let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.name);
    
   //     valueLabels
   //        .enter()
   //        .append('text')
   //        .attr('class', 'valueLabel')
   //        .attr('x', d => x(d.value)+5)
   //        .attr('y', d => y(top_n+1)+5)
   //        .text(d => d3.format(',.0f')(d.lastValue))
   //        .transition()
   //          .duration(tickDuration)
   //          .ease(d3.easeLinear)
   //          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);
            
   //     valueLabels
   //        .transition()
   //          .duration(tickDuration)
   //          .ease(d3.easeLinear)
   //          .attr('x', d => x(d.value)+5)
   //          .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
   //          .tween("text", function(d) {
   //             let i = d3.interpolateRound(d.lastValue, d.value);
   //             return function(t) {
   //               this.textContent = d3.format(',')(i(t));
   //            };
   //          });
      
     
   //    valueLabels
   //      .exit()
   //      .transition()
   //        .duration(tickDuration)
   //        .ease(d3.easeLinear)
   //        .attr('x', d => x(d.value)+5)
   //        .attr('y', d => y(top_n+1)+5)
   //        .remove();
    
   //    yearText.html(~~year);
     
   //   if(year == 2018) ticker.stop();
   //   year = d3.format('.1f')((+year) + 0.1);
   // },tickDuration);


        // // Participation value counts for each year After 1980
        // var val_cnts = d3.rollups(data,
        //                           xs => d3.count(xs, x => x.Year),
        //                           d => d.Year
        //                          ).map(([k, v]) => ({ Year: k, Count: v })).sort(function(a,b) {return d3.ascending(a.Year,b.Year);});

        // console.log(val_cnts);


        // columnsToSum = ["NA_Sales", "EU_Sales","JP_Sales","Other_Sales"]

        // var groupedData = d3.rollup(filteredData,
        //           v => Object.fromEntries(columnsToSum.map(col => [col, d3.sum(v, d => +d[col])])),
        //           d => d.Year)

        // console.log(groupedData);

        // // Participation value counts for each year After 1980
        // var val_cnts = d3.rollups(filteredData,
        //                           xs => d3.count(xs, x => x.Year),
        //                           d => d.Year
        //                          ).map(([k, v]) => ({ Year: k, Count: v })).sort(function(a,b) {return d3.ascending(a.Year,b.Year);});

        // console.log(val_cnts);


    });
    
}

var question2=function(filePath){
    
}

var question3=function(filePath){
    
}

var question4=function(filePath){
   
}


var question5=function(filePath){


}


function plot() {
    var filePath = 'cleanData.csv'
    const csv = d3.csv(filePath)
    console.log('hd')
    csv.then(function (data) {
        console.log(data)
        console.log('hi')
    })
}