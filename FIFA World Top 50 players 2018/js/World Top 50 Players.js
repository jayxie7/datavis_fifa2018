d3.json("JSON/WorldTop50Players.json", function(data){
        console.log(data);
        
        
        let svgBubble = d3.select('#bubble');
        let width = document.body.clientWidth; // get width in pixels
        let height = +svgBubble.attr('height');
        let centerX = width * 0.35;
        let centerY = height * 0.5;
        let strength = 0.05;
        let focusedNode;

        let format = d3.format(',d');

        let scaleColor = d3.scaleOrdinal(d3.schemeCategory20);

        // use pack to calculate radius of the circle
        let pack = d3.pack()
            .size([width , height ])
            .padding(1.5);

        let forceCollide = d3.forceCollide(d => d.r + 1);

        // use the force
        let simulation = d3.forceSimulation()
            // .force('link', d3.forceLink().id(d => d.id))
            .force('charge', d3.forceManyBody())
            .force('collide', forceCollide)
            // .force('center', d3.forceCenter(centerX, centerY))
            .force('x', d3.forceX(centerX ).strength(strength))
            .force('y', d3.forceY(centerY ).strength(strength));

        // reduce number of circles on mobile screen due to slow computation
        if ('matchMedia' in window && window.matchMedia('(max-device-width: 767px)').matches) {
            data = data.filter(el => {
                return el.Value >= 50;
            });
        }

		let root = d3.hierarchy({ children: data })
			.sum(d => d.Value);

		// we use pack() to automatically calculate radius conveniently only
		// and get only the leaves
		let nodes = pack(root).leaves().map(node => {
			console.log('node:', node.x, (node.x - centerX) * 2);
			const data = node.data;
			return {
				x: centerX + (node.x - centerX) * 3, // magnify start position to have transition to center movement
				y: centerY + (node.y - centerY) * 3,
				r: 0, // for tweening
				radius: node.r, //original radius
                //Loading data into node J.XIE
				id: data.Position + '.' + (data.Name.replace(/\s/g, '-')),
				Position: data.Position,
				Name: data.Name,
				Value: data.Value,
				icon: data.icon,
                PAC: data.PAC,
                SHO: data.SHO,
                PAS: data.PAS,
                DRI: data.DRI,
                DEF: data.DEF,
                PHY: data.PHY,
                Nationality: data.Nationality,
                Age: data.Age,
                Height: data.Height,
                Weight: data.Weight,
                Intrnational_Reputation: data.Intrnational_Reputation,
                Weak_Foot: data.Weak_Foot,
                Skill_Moves: data.Skill_Moves,
                //data pattern for radar J.XIE
                radarData: [
                    {   className: data.Name,
                        axes: [
                            {axis: "Pace", value: data.PAC}, 
                            {axis: "Shot", value: data.SHO}, 
                            {axis: "Pass", value: data.PAS},  
                            {axis: "Dribble", value: data.DRI}, 
                            {axis: "Defense", value: data.DEF},  
                            {axis: "Physical", value: data.PHY}
                        ]
                    }
                ],
                
                //data pattern for sunburst J.XIE
               sunData: {
                     name: "Overall",
                     children: [
                      {
                       name: "Attacking",
                       children: [
                        {name: "Crossing", size: data.Attacking_Crossing},
                        {name: "Finishing", size: data.Attacking_Finishing},
                        {name: "Heading Accuracy", size: data.Attacking_Heading_Accuracy},
                        {name: "Short Passing", size: data.Attacking_Short_Passing},
                        {name: "Volleys", size: data.Attacking_Volleys}
                       ]
                      },
                      {
                       name: "Skill",
                       children: [
                        {name: "Dribbling", size: data.Skill_Dribbling},
                        {name: "Curve", size: data.Skill_Curve},
                        {name: "Free Kick Accuracy", size: data.Skill_Free_Kick_Accuracy},
                        {name: "Long Passing", size: data.Skill_Long_Passing},
                        {name: "Ball Control", size: data.Skill_Ball_Control}
                       ]
                      },
                      {
                       name: "Movement",
                       children: [
                        {name: "Acceleration", size: data.Movement_Acceleration},
                        {name: "Sprint Speed", size: data.Movement_Sprint_Speed},
                        {name: "Agility", size: data.Movement_Agility},
                        {name: "Reactions", size: data.Movement_Reactions},
                        {name: "Balance", size: data.Movement_Balance}
                       ]
                      },
                      {
                       name: "Power",
                       children: [
                        {name: "Shot Power", size: data.Power_Shot_Power},
                        {name: "Jumping", size: data.Power_Jumping},
                        {name: "Stamina", size: data.Power_Stamina},
                        {name: "Strength", size: data.Power_Strength},
                        {name: "Long Shots", size: data.Power_Long_Shots}
                       ]
                      },
                      {
                       name: "Mentality",
                       children: [
                        {name: "Aggression", size: data.Mentality_Aggression},
                        {name: "Interceptions", size: data.Mentality_Interceptions},
                        {name: "Positioning", size: data.Mentality_Positioning},
                        {name: "Vision", size: data.Mentality_Vision},
                        {name: "Penalties", size: data.Mentality_Penalties},
                        {name: "Composure", size: data.Mentality_Composure}   
                       ]
                      },
                      {
                       name: "Defending",
                       children: [
                        {name: "Marking", size: data.Defending_Marking},
                        {name: "Standing Tackle", size: data.Defending_Standing_Tackle},
                        {name: "Sliding Tackle", size: data.Defending_Sliding_Tackle}
                       ]
                      },
                      {
                       name: "Goalkeeping",
                       children: [
                        {name: "GK Diving", size: data.Goalkeeping_GK_Diving},
                        {name: "GK Handling", size: data.Goalkeeping_GK_Handling},
                        {name: "GK Kicking", size: data.Goalkeeping_GK_Kicking},
                        {name: "GK Positioning", size: data.Goalkeeping_GK_Positioning},
                        {name: "GK Reflexes", size: data.Goalkeeping_GK_Reflexes}
                       ]
                      }
                    ]
                }
            }
        });
        
        
        
        //Generate bubble charts J.XIE--------------------------------
        simulation.nodes(nodes).on('tick', ticked);
        
        let node = svgBubble.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', (d) => {
                    if (!d3.event.active) simulation.alphaTarget(0.2).restart();
                    d.fx = d.x;
                    d.fy = d.y;
                })
                .on('drag', (d) => {
                    d.fx = d3.event.x;
                    d.fy = d3.event.y;
                })
                .on('end', (d) => {
                    if (!d3.event.active) simulation.alphaTarget(0);
                    d.fx = null;
                    d.fy = null;
                }));
        
//        //Modify scale list------------------
//        var data = ["Nationality", "Position"];
//
//        var select = d3.select('select')
//            .attr('class','select')
//            .on('change',onchange)
//
//        var options = select
//          .selectAll('option')
//            .data(data).enter()
//            .append('option')
//                .text(function (d) { return d; });
//
//        function onchange() {
//            selectValue = d3.select('select').property('value')
//            if (selectValue === "Nationality"){
//                
//            }
//        };
    
        node.append('circle')
            .attr('id', d => d.id)
            .attr('r', 0)
            .style('fill', d => scaleColor(d.Position))
            .transition().duration(500).ease(d3.easeElasticOut)
                .tween('circleIn', (d) => {
                    let i = d3.interpolateNumber(0, d.radius);
                    return (t) => {
                        d.r = i(t);
                        simulation.force('collide', forceCollide);
                    }
                })

        node.append('clipPath')
            .attr('id', d => `clip-${d.id}`)
            .append('use')
            .attr('xlink:href', d => `#${d.id}`);

        // display text as circle icon
        node.filter(d => !String(d.icon).includes('img/'))
            .append('text')
            .classed('node-icon', true)
            .attr('clip-path', d => `url(#clip-${d.id})`)
            .selectAll('tspan')
            .data(d => d.icon.split(';'))
            .enter()
                .append('tspan')
                .attr('x', 0)
                .attr('y', (d, i, nodes) => (13 + (i - nodes.length / 2 - 0.5) * 10))
                .text(Name => Name);

        // display image as circle icon
        node.filter(d => String(d.icon).includes('img/'))
            .append('image')
            .classed('node-icon', true)
            .attr('clip-path', d => `url(#clip-${d.id})`)
            .attr('xlink:href', d => d.icon)
            .attr('x', d => - d.radius * 0.7)
            .attr('y', d => - d.radius * 0.7)
            .attr('height', d => d.radius * 2 * 0.7)
            .attr('width', d => d.radius * 2 * 0.7)
        
    //Bubble tooltip
        node.append('title')
            .text(d => (d.Name  + '\n' 
                        + d.Nationality + '\n'
                        + d.Position + '\n'
                        + 'Value: $ '+ format(d.Value) + 'K'));
        
        //Position list J.XIE-----------------------
        let legendOrdinal = d3.legendColor()
            .scale(scaleColor)
            .shape('circle');

        let legend = svgBubble.append('g')
            .classed('legend-color', true)
            .attr('text-anchor', 'start')
            .attr('transform','translate(20,30)')
            .style('font-size','12px')
            .call(legendOrdinal);
    
        //Value circle J.XIE--------------------
        let sizeScale = d3.scaleOrdinal()
            .domain(['Low Value', 'High Value'])
            .range([5,10] );

        let legendSize = d3.legendSize()
            .scale(sizeScale)
            .shape('circle')
            .shapePadding(10)
            .labelAlign('end');

        let legend2 = svgBubble.append('g')
            .classed('legend-size', true)
            .attr('text-anchor', 'start')
            .attr('transform', 'translate(150, 25)')
            .style('font-size', '12px')
            .call(legendSize);

		let infoBox = node.append('foreignObject')
			.classed('circle-overlay hidden', true)
			.attr('x', -350 * 0.5 * 0.8)
			.attr('y', -350 * 0.5 * 0.8)
			.attr('height', 250 * 0.8)
			.attr('width', 350 * 0.8)
				.append('xhtml:div')
				.classed('circle-overlay__inner', true);
        
    
        //Append information inside a bubble J.XIE----------------
		infoBox.append('h3')
			.classed('circle-overlay__title', true)
			.text(d => d.Name);
    
        infoBox.append('p')
            .attr('id','infobox')
			.classed('circle-overlay__title', true)
			.text(d => ('Age: ' + d.Age));
    
        infoBox.append('g')
            .attr('id','infobox')
			.classed('circle-overlay__title', true)
			.text(d => ('Height: ' + d.Height + ' cm' 
                        + ' | ' + 'Weight: ' + d.Weight + ' kg'));
    
        infoBox.append('p')
            .attr('id','infobox')
			.classed('circle-overlay__title', true)
			.text(d => ('Famous: ' + d.Intrnational_Reputation ));
        
        infoBox.append('p')
            .attr('id','infobox')
			.classed('circle-overlay__title', true)
			.text(d => ('Skill Moves: ' + d.Skill_Moves ));
    
        infoBox.append('p')
            .attr('id','infobox')
			.classed('circle-overlay__title', true)
			.text(d => ('Weak Foot: ' + d.Weak_Foot ));


        
//		infoBox.append('p')
//			.classed('circle-overlay__body', true)
//			.html(d => d.Nationality);
//    
//        infoBox.append('p')
//			.classed('circle-overlay__body', true)
//			.html(d => d.Position);
//    
        
//Node on click-----------------------------------------------
    
		node.on('click', (currentNode) => {
            d3.selectAll('g#radar')
                .remove();
            d3.selectAll('g#sun')
                .remove();
            
			d3.event.stopPropagation();
			let currentTarget = d3.event.currentTarget; // the <g> el

			if (currentNode === focusedNode) {
				focusedNode.fx = null;
                focusedNode.fy = null;
                simulation.alphaTarget(0.8).restart();
                d3.transition().duration(500).ease(d3.easePolyOut)
                    .tween('moveOut', function () {
                        console.log('tweenMoveOut', focusedNode);
                        let ir = d3.interpolateNumber(focusedNode.r, focusedNode.radius);
                        return function (t) {
                            focusedNode.r = ir(t);
                            simulation.force('collide', forceCollide);
                        };
                    })
                    .on('end', () => {
                        focusedNode = null;
                        simulation.alphaTarget(0)
                        d3.selectAll('g#radar')
                            .remove();
                    })
                    .on('interrupt', () => {
                        simulation.alphaTarget(0);
                    });

                // hide all circle-overlay
                d3.selectAll('.circle-overlay').classed('hidden', true);
                d3.selectAll('.node-icon').classed('node-icon--faded', false);

				return;
			}
            
			let lastNode = focusedNode;
			focusedNode = currentNode;

			simulation.alphaTarget(0.2).restart();
			// hide all circle-overlay
			d3.selectAll('.circle-overlay').classed('hidden', true);
			d3.selectAll('.node-icon').classed('node-icon--faded', false);

			// don't fix last node to center anymore
			if (lastNode) {
				lastNode.fx = null;
				lastNode.fy = null;
				node.filter((d, i) => i === lastNode.index)
					.transition().duration(500).ease(d3.easePolyOut)
					.tween('circleOut', () => {
						let irl = d3.interpolateNumber(lastNode.r, lastNode.radius);
						return (t) => {
							lastNode.r = irl(t);
						}
					})
					.on('interrupt', () => {
						lastNode.r = lastNode.radius;
					});
			}

			d3.transition().duration(500).ease(d3.easePolyOut)
				.tween('moveIn', () => {
					console.log('tweenMoveIn', currentNode);
					let ix = d3.interpolateNumber(currentNode.x, 800);
					let iy = d3.interpolateNumber(currentNode.y, centerY);
					let ir = d3.interpolateNumber(currentNode.r, centerY * 0.4);   
                    
                //adjust bubble position after zoom in J.XIE
					return function (t) {
						// console.log('i', ix(t), iy(t));
						currentNode.fx = ix(t);       //zoomed in bubble circle center J.XIE
						currentNode.fy = iy(t);
						currentNode.r = ir(t);
						simulation.force('collide', forceCollide);
					};
				})
				.on('end', () => {
					simulation.alphaTarget(0); //distance of other node with the selected node J.XIE
					let $currentGroup = d3.select(currentTarget);
					$currentGroup.select('.circle-overlay')
						.classed('hidden', false);
					$currentGroup.select('.node-icon')
						.classed('node-icon--faded', true);
				})
				.on('interrupt', () => {
					console.log('move interrupt', currentNode);
					currentNode.fx = null;         //zoomed out bubble circle center J.XIE
					currentNode.fy = null;
					simulation.alphaTarget(0);
                
				});

            
            //Draw radar for a player--------------------------
            radar(currentNode.radarData);
            //End of radar generation--------------------

            //Draw sunburst for a player----------------------
            var sunWidth = 531.73,
                sunHeight = 350,
                sunRadius = Math.min(sunWidth, sunHeight) / 2;
            var formatNumber = d3.format(",d");

            var x = d3.scaleLinear()
                .range([0, 2 * Math.PI]);

            var y = d3.scaleSqrt()
                .range([0, sunRadius]);

            var color = d3.scaleOrdinal(d3.schemeCategory20);

            var partition = d3.partition();

            var arc = d3.arc()
                .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
                .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
                .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
                .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

            var sunSvg = d3.select("#sunburst")
                .attr("width", sunWidth)
                .attr("height", sunHeight)
                .append("g")
                .attr("id","sun")
                .attr("transform", "translate(" + sunWidth / 2 + "," + (sunHeight / 2) + ")");
    
            let sunRoot = d3.hierarchy(currentNode.sunData);
            sunRoot.sum(function(d) { return d.size; });
            
            
            sunSvg.selectAll("path")
                  .data(partition(sunRoot).descendants())
                  .enter().append('g')
                  .append("path")
                  .attr("d", arc)
                  .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
                  .on("click", click)
                  .append("title")
                  .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });
            
            
            function click(d) {
              sunSvg.transition()
                  .duration(750)
                  .tween("scale", function() {
                    var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                        yd = d3.interpolate(y.domain(), [d.y0, 1]),
                        yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, sunRadius]);
                    return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
                  })
                .selectAll("path")
                  .attrTween("d", function(d) { return function() { return arc(d); }; });
            }

            d3.select(self.frameElement).style("height", height + "px");
            
            let sunLabel = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel.append('rect')
                        .attr('x','83%')
                        .attr('y','5%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(214, 39, 40)');
                sunLabel.append('text')
                        .text('Denfending')
                        .attr('x','92%')
                        .attr('y','7.5%');
            
            let sunLabel1 = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel1.append('rect')
                        .attr('x','83%')
                        .attr('y','10%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(255, 152, 150)');
                sunLabel1.append('text')
                        .text('Goal Keeping')
                        .attr('x','93%')
                        .attr('y','12.5%');
            
            let sunLabel2 = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel2.append('rect')
                        .attr('x','83%')
                        .attr('y','15%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(174, 199, 232)');
                sunLabel2.append('text')
                        .text('Attacking')
                        .attr('x','91%')
                        .attr('y','17.5%');
            
            let sunLabel3 = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel3.append('rect')
                        .attr('x','83%')
                        .attr('y','20%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(255, 127, 14)');
                sunLabel3.append('text')
                        .text('Skill')
                        .attr('x','88.5%')
                        .attr('y','22.5%');
            
            let sunLabel4 = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel4.append('rect')
                        .attr('x','83%')
                        .attr('y','25%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(255, 187, 120)');
                sunLabel4.append('text')
                        .text('Movement')
                        .attr('x','91.5%')
                        .attr('y','27.5%');
            
            let sunLabel5 = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel5.append('rect')
                        .attr('x','83%')
                        .attr('y','30%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(44, 160, 44)');
                sunLabel5.append('text')
                        .text('Power')
                        .attr('x','89.5%')
                        .attr('y','32.5%');
            
            let sunLabel6 = d3.select('#sunburst').append('g').attr('id','sun');
                sunLabel6.append('rect')
                        .attr('x','83%')
                        .attr('y','35%')
                        .attr('width','10')
                        .attr('height','10')
                        .attr('fill','rgb(152, 223, 138)');
                sunLabel6.append('text')
                        .text('Mentality')
                        .attr('x','91%')
                        .attr('y','37.5%');
		});
        //End of Sunburst chart generation---------------
    
        //Add a textual button to clear the current view------
//        d3.select('#bubble')
//            .append('text')
//            .attr('x','5%')
//            .attr('y','95%')
//            .attr('id','clean')
//            .text('Reset')
//            .attr('font-size','14px')
//            .attr('stroke','black');
//
//        d3.select('#clean').on("click", function(){
//            d3.selectAll('g#radar')
//                .remove();
//            d3.selectAll('g#sun')
//                .remove();
//            
//            focusedNode.fx = null;
//            focusedNode.fy = null;
//            simulation.alphaTarget(0.8).restart();
//            d3.transition().duration(500).ease(d3.easePolyOut)
//                .tween('moveOut', function () {
//                    console.log('tweenMoveOut', focusedNode);
//                    let ir = d3.interpolateNumber(focusedNode.r, focusedNode.radius);
//                    return function (t) {
//                        focusedNode.r = ir(t);
//                        simulation.force('collide', forceCollide);
//                    };
//                })
//                .on('end', () => {
//                    focusedNode = null;
//                    simulation.alphaTarget(0)
//                    d3.selectAll('g#radar')
//                        .remove();
//                })
//                .on('interrupt', () => {
//                    simulation.alphaTarget(0);
//                });
//
//            // hide all circle-overlay
//            d3.selectAll('.circle-overlay').classed('hidden', true);
//            d3.selectAll('.node-icon').classed('node-icon--faded', false);
//
//        });
    
//Document on click event-------------------------------------
    
//		d3.select(document).on('click', () => {
//			let target = d3.event.target;
//			// check if click on document but not on the circle overlay
//			if (!target.closest('#circle-overlay') && focusedNode) {
//				focusedNode.fx = null;
//				focusedNode.fy = null;
//				simulation.alphaTarget(0.8).restart();
//				d3.transition().duration(500).ease(d3.easePolyOut)
//					.tween('moveOut', function () {
//						console.log('tweenMoveOut', focusedNode);
//						let ir = d3.interpolateNumber(focusedNode.r, focusedNode.radius);
//						return function (t) {
//							focusedNode.r = ir(t);
//							simulation.force('collide', forceCollide);
//						};
//					})
//					.on('end', () => {
//						focusedNode = null;
//						simulation.alphaTarget(0)
//                        d3.selectAll('g#radar')
//                            .remove();
//					})
//					.on('interrupt', () => {
//						simulation.alphaTarget(0);
//					});
//
//				// hide all circle-overlay
//				d3.selectAll('.circle-overlay').classed('hidden', true);
//				d3.selectAll('.node-icon').classed('node-icon--faded', false);
//			}
//		});

		function ticked() {
			node
				.attr('transform', d => `translate(${d.x},${d.y})`)
				.select('circle')
					.attr('r', d => d.r);
		}
    

        
//---------------------------------------------------------
    
    

    
    //Radar generator----------------------

    function radar (value) {
        console.log('enter', value)
        var margin = { top: 20, right: 20, bottom: 20, left: 20 };

        var radarChartOptions2 = {
              w: 250,
              h: 250,
              margin: margin,
              maxValue: 60,
              levels: 5,
              roundStrokes: false,
              color: d3.scaleOrdinal().range(["#AFC52F", "#ff6600"]),
                format: '.0f',
                legend: { title: 'Organization XYZ', translateX: 100, translateY: 40 }
        };

        var chart = RadarChart("#radar", value, radarChartOptions2);
        
        return chart;
    }

 
    
//End of the script--------------------------------------    
    
});

