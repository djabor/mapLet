var gp = require('gpan');

exports.LLtoPanos = function(req,res,next){
	var points = req.body.polys
		, z = points.length
		, options = []
		, panoIds = []
		, panoObjs = []
		, random=Math.floor(Math.random()*4)
	for (var i=0;i<points.length;i++){
		options[i] = {
			host: 'cbk'+random+'.google.com',
			path: '/cbk?output=json&ll='+points[i]
		}
		panosFromLL(options[i], i, function(resp, index){
			panoIds[index] = resp;
			if (z==1) {
				var itm = {}
				  , obj = {};
				for(var p=0;p<panoIds.length;p++){
					itm = panoIds[p];
					obj = {
						yaw: itm.Projection.pano_yaw_deg,
						id: itm.Location.panoId,
						links: itm.Links,
						ll: itm.Location.lat + ',' + itm.Location.lng
					}
					panoObjs[p] = obj;
				}
				res.send({panos:panoObjs});
				delete obj, itm, panoObjs, options, z, points;
				return
			}
			z--;
		});
	}
}

exports.traceRoute = function(req,res,next){
	var polypanos = req.body.polys;
	routeTrace(polypanos, 20, function(resp){
		res.send(resp);
	});
}

function panosFromLL(options, index, cb){
	var http = require('http');
	http.get(options, function(resp){
		var chunks = '';
		resp.setEncoding('utf8');
		resp.on('data', function(d){chunks += d;});
		resp.on('end', function(){return cb(JSON.parse(chunks), index);});
	});
}
if (typeof Number.prototype.toDeg == 'undefined') {
	Number.prototype.toDeg = function() {
		return this * 180 / Math.PI;
	}
}
if (typeof Number.prototype.toRad == 'undefined') {
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	}
}
function bearing(a,b){
  var _a = a.split(',')
		, _b = b.split(',')
		, lat1 = Number(_a[0]).toRad()
		, lat2 = Number(_b[0]).toRad()
		, lng1 = _a[1]
		, lng2 = _b[1]
		, dLon = ( lng2  - lng1 ).toRad()
		, y = Math.sin(dLon) * Math.cos(lat2)
		, x = Math.cos(lat1)*Math.sin(lat2) - 
			Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon)
		, brng = Math.atan2(y, x);
	return (brng.toDeg()+360) % 360;
}

function routeTrace(polypanos, margin, cb){ 
	//margin gives the amount of DEG margin for deciding proper link
	var Links = [];
	
	//todo: account for 360deg-0deg
	//if yaw + 20 > 360 then yaw = 360-yaw * -1

	for(var i=0;i<polypanos.length;i++) {
		var startPano = polypanos[i]
			, endPano = polypanos[i+1];
		getLinkSet(startPano, endPano, margin, function(next){

		});
	}
	var output = {panos:Links};
	cb(output);
}

function getLinkSet(pano, endPano, margin, cb){
	//returns set of links from current polypano to next polypano
	var linkSet = []
	//get link from startPano
	
	// if (.id == endPano.id) {
	// 	//we are done for this linkset, return
	// } else {
	// 	//
	// }
	cb(linkSet);
}

function getNextLink(pano, endPano, margin){
	var links = pano.links
		, totalLinks = links.length
		, linkSet = []
		, i = 0;

	if (totalLinks > 2 || (totalLinks === 2 && i === 0) ) {
		//use bearing to get next link
		guessNext(pano, endPano, margin, function(nextLink){
			
			if (nextLink.panoId != nextPano.id) {
				getLinksFromPano(nextLink.panoId, function(next){
					pano = 	{
									yaw: next.Projection.pano_yaw_deg,
									id: next.panoId,
									ll: next.Location.lat + ',' + next.Location.lng
									}	
					links = pano.links;
					totalLinks = links.length;
					linkSet.push(next);
				});
			} else {

			}
		});
	} else {
		for (var z=0;z<links.length;z++){
			if (links[z].panoId != prevPano) {
				nextLink = links[z];
			}
		}
	}
}

function guessNext(pano, nextPano, margin, cb){
	var brng = bearing(pano.ll, nextPano.ll)
		, links = pano.links
		, totalLinks = links.length;
	for (var i=0;i<totalLinks;i++){
		var yaw = links[i].yawDeg;
		if (Math.abs(yaw-brng) < margin)
			return cb(links[i]);
	}
	//if we end up here, no link was found
	//rerun with larger margin
	guessNext(pano, nextPano, margin*2, cb);
}

function getLinksFromPano(panoId, cb){
	var http = require('http')
		, random=Math.floor(Math.random()*4)
		, options = {
								host: 'cbk'+random+'.google.com',
								path: '/cbk?output=json&panoid='+panoId
								}
	http.get(options, function(resp){
		var chunks = '';
		resp.setEncoding('utf8');
		resp.on('data', function(d){chunks += d;});
		resp.on('end', function(){return cb(JSON.parse(chunks));});
	});
}

// function createPanoImage(id){
// 	var obj = {
// 		panoramaZoom : 3
// 		, pathToSaveTiles : 'public/panoramas/' + id
// 		, pathToSaveImage : 'public/panoramas/' + id
// 		, pathToSaveTiles : 'public/panoramas/' + id + '/tiles'
// 		, pathToSaveImage : 'public/panoramas/' + id + '/tiles/finalImage'
// 		, tilesPrefix : "image_"
// 		, finalImageName : "output"
// 		, deleteTilesWhenDone : true
// 	}
// 	gp.savePanorama(id, obj.panoramaZoom, obj.pathToSaveTiles, obj.tilesPrefix, obj.pathToSaveImage, obj.finalImageName, obj.deleteTilesWhenDone, function(err, path){
// 		if (err)
// 			console.log(err);
// 		console.log(path);
// 	})
// }

